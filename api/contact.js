// Private Vercel Function. No recipient addresses or delivery keys appear in browser code.
// Required environment variables: CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL,
// RESEND_API_KEY, TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY.
const crypto = require('node:crypto');
const topics = new Set(['Library feedback','DSM Symptom Lab','Accessibility suggestion','Technical issue','Other']);
const envKeys = ['CONTACT_TO_EMAIL','CONTACT_FROM_EMAIL','RESEND_API_KEY','TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY'];
const ready = () => envKeys.every(key => typeof process.env[key] === 'string' && process.env[key].trim());
const json = (res, status, body) => res.status(status).setHeader('Cache-Control','no-store').json(body);
const sign = (value) => crypto.createHmac('sha256', process.env.TURNSTILE_SECRET_KEY).update(value).digest('hex');
const goodProof = (token) => {
  if (typeof token !== 'string' || token.length > 150) return false;
  const match = /^([a-z0-9]+)\.([a-f0-9]{16})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;
  const age = Date.now() - parseInt(match[1],36);
  if (!Number.isFinite(age) || age < 4000 || age > 3600000) return false;
  const signature = Buffer.from(match[3],'hex');
  return crypto.timingSafeEqual(signature,Buffer.from(sign(match[1]+'.'+match[2]),'hex'));
};
const clean = (s) => s.replace(/[\u0000-\u001f\u007f]/g,' ').trim();
module.exports = async function contactHandler(req,res) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  if (req.method === 'GET') {
    if (!ready()) return json(res,200,{ready:false});
    const issue = Date.now().toString(36)+'.'+crypto.randomBytes(8).toString('hex');
    return json(res,200,{ready:true,siteKey:process.env.TURNSTILE_SITE_KEY,proof:issue+'.'+sign(issue)});
  }
  if (req.method !== 'POST') {res.setHeader('Allow','GET, POST');return json(res,405,{error:'Method not allowed'});}
  if (!ready()) return json(res,503,{error:'Contact form delivery is not yet configured.'});
  if (!String(req.headers['content-type']||'').startsWith('application/json')) return json(res,415,{error:'Use JSON'});
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host || origin !== 'https://'+host) return json(res,403,{error:'Origin not allowed'});
  const length = Number(req.headers['content-length']||0);
  if (length > 8192) return json(res,413,{error:'Message is too long'});
  const b=req.body;
  if (!b || typeof b !== 'object' || Array.isArray(b)) return json(res,400,{error:'Invalid message'});
  if (b.website) return json(res,200,{ok:true});
  if (!goodProof(b.proof)) return json(res,400,{error:'Contact form expired. Reload and retry.'});
  const name=typeof b.name==='string'?clean(b.name):'';
  const email=typeof b.email==='string'?clean(b.email):'';
  const topic=typeof b.topic==='string'?b.topic:'';
  const message=typeof b.message==='string'?clean(b.message):'';
  const challenge=typeof b.challenge==='string'?b.challenge:'';
  if (name.length>100 || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || !topics.has(topic) || message.length<15 || message.length>1800 || !b.noSensitiveInfo
      || !challenge || challenge.length>4096) return json(res,400,{error:'Check required fields and try again.'});
  try {
    const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:challenge,
       remoteip:String(req.headers['x-forwarded-for']||'').split(',')[0]})
    });
    const result=await verify.json();
    if (!result.success || result.action!=='contact' || result.hostname!==host.split(':')[0])
      return json(res,400,{error:'Security check failed. Please try again.'});
    const payload={
      from:process.env.CONTACT_FROM_EMAIL,
      to:[process.env.CONTACT_TO_EMAIL],
      reply_to:email,
      subject:'Website contact · '+topic,
      text:['New general website contact form message','Source: '+host,'Topic: '+topic,'From: '+(name||'(name not provided)'),'Reply-to: '+email,'','Message:',message].join('\n')
    };
    const sent=await fetch('https://api.resend.com/emails',{
      method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    if (!sent.ok) return json(res,502,{error:'Delivery is temporarily unavailable. Please try later.'});
    return json(res,200,{ok:true});
  } catch (_) {return json(res,502,{error:'Delivery is temporarily unavailable. Please try later.'});}
};
