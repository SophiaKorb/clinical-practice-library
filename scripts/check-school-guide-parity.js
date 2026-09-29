const fs=require('fs');
const pairs={adhd:'adhd',autism:'autism',anxiety:'anxiety',depression:'depression',dyslexia:'dyslexia',dyscalculia:'dyscalculia',dysgraphia:'dysgraphia','odd-persistent-conflict-behavior':'persistent-conflict-odd'};
let failed=false;
for(const [plainName,clinicalName] of Object.entries(pairs)){
 const plain=fs.readFileSync('guides/'+plainName+'.html','utf8');
 const clinical=fs.readFileSync('resources/school/clinical/'+clinicalName+'.html','utf8');
 const pc=[...plain.matchAll(/<label[^>]*>(\\d+-[A-Z])<\\/label><\\/td><td>(.*?)<\\/td>/g)].map(m=>[m[1],m[2]]);
 const cc=[...clinical.matchAll(/support-code\">([^<]+)<\\/span><span>(.*?)<\\/span>/g)].map(m=>[m[1],m[2]]);
 const pm=new Map(pc),cm=new Map(cc); const missing=cc.filter(x=>!pm.has(x[0])).map(x=>x[0]),extra=pc.filter(x=>!cm.has(x[0])).map(x=>x[0]),identical=cc.filter(x=>pm.get(x[0])===x[1]).map(x=>x[0]);
 const family=plain.includes('data-family="true"'); const visibleCodeHeader=family && /<th class="code">Code<\\/th>/.test(plain); const clinicalBarrierHeading=family && /<h2[^>]*>Barrier \\d+:/.test(plain); const clinicalIntro=family && /bring the short codes|Circle a few support codes/i.test(plain); if(missing.length||extra.length||identical.length||visibleCodeHeader||clinicalBarrierHeading||clinicalIntro){failed=true;console.error(plainName,{missing,extra,identical,visibleCodeHeader,clinicalBarrierHeading,clinicalIntro});}else console.log('PASS',plainName,cc.length+' internal support ids');
}
if(failed)process.exit(1);