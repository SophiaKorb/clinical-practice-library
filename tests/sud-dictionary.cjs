const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const html=fs.readFileSync('resources/training/substance-use-disorder-tool.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const dictionary=vm.runInNewContext(script.match(/const dictionary=\[([\s\S]*?)\];/)[0].replace('const dictionary=','') );
const ambiguous=vm.runInNewContext('('+script.split('const ambiguousLookup=')[1].split(';')[0]+')');
for(const [name,expected] of [['molly','other'],['mdma','other'],['ecstasy','other'],['xanax','sedative'],['adderall','stimulant'],['fentanyl','opioid'],['cannabis','cannabis'],['suboxone','opioid'],['restoril','sedative'],['zyn','tobacco']]){let found=dictionary.find(x=>x.names.includes(name));assert.equal(found?.value,expected,name);}
for(const name of ['speed','blues','bars','spice','k2','acid','e','x','shrooms'])assert.ok(ambiguous[name],name);
const all=dictionary.flatMap(x=>x.names);assert.equal(new Set(all).size,all.length,'duplicate names');
assert.equal((script.match(/\["Impaired control"|\["Social impairment"|\["Risky use"|\["Pharmacological"/g)||[]).length,11);
assert.match(html,/id="drug-query"/);assert.match(html,/id="plain"/);assert.match(html,/id="clinical"/);assert.match(script,/speechSynthesis/);
console.log('SUD source, dictionary and language/speech hooks: PASS');
