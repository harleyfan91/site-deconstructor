const fs=require('fs');
let text=fs.readFileSync('package.jsonc','utf8');
let clean=text.replace(/\/\/.*$/gm,'');
clean=clean.replace(/,(\s*[}\]])/g,'$1');
const json=JSON.parse(clean);
const categories=[['dependencies','Dependency'],['devDependencies','DevDependency'],['optionalDependencies','Optional']];
const map={};
text.split('\n').forEach(line=>{const m=line.match(/"([^"]+)": "([^"]+)".*\/\/\s*(.*)/);if(m){map[m[1]]={version:m[2],purpose:m[3]};}});
let rows=[];
for(const [key,label] of categories){
 const deps=json[key]||{};
 for(const pkg of Object.keys(deps)){
  const info=map[pkg]||{};
  rows.push([pkg,deps[pkg],info.purpose||'',label]);
 }
}
rows.sort((a,b)=>a[0].localeCompare(b[0]));
const out=['| Package | Version | Purpose | Category |','| --- | --- | --- | --- |',...rows.map(r=>`| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |`)].join('\n');
fs.writeFileSync('docs/DEPENDENCIES.md',out);
