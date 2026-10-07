// Regression for rejected transactions and presentation-only UI changes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),repo=path.resolve(root,'..'),{context}=require('./integration143.cjs'),c=context(root);
const app=fs.readFileSync(path.join(root,'source/app.js'),'utf8').replace(/\r\n/g,'\n');
const transact=app.split('\n').find(s=>s.trim().startsWith('function transact('));assert(transact);
c.run(`let p=Engine.clone(argument),result=Engine.generate(p),history=[],dirty=false,persistCount=0,repaintCount=0,rejected=[];function persist(){persistCount++;}function refresh(){repaintCount++;}function toast(){};InputFeedback172.capture=()=>({value:'-3'});InputFeedback172.reject=(value,message)=>rejected.push({value,message});${transact}`,c.seed);
const initialProject=c.run('JSON.stringify(p)');
assert.equal(c.run('transact(()=>{p.axes.x[1].gap=-3;})'),false);
assert(c.run('JSON.stringify(p)')===initialProject,'Rollback preserves the complete initialized model');
assert.equal(c.run('history.length+persistCount'),0);assert.equal(c.run('dirty'),false);
assert.equal(c.run('rejected[0].value.value'),'-3');assert.match(c.run('rejected[0].message'),/轴距/);
assert.equal(c.run("transact(()=>{p.name='UI regression';})"),true);
assert.equal(c.run('history.length'),1);assert.equal(c.run('persistCount'),1);assert.equal(c.run('dirty'),true);
assert.equal(c.run('history[0].name'),c.seed.name);
assert.equal(c.run('InputFeedback172.number(10.499999999999996)'),'10.5');
assert.equal(c.run('InputFeedback172.number(0.125)'),'0.125');assert.equal(c.run('InputFeedback172.number(null)'),'');
for(const n of fs.readdirSync(path.join(root,'source')).filter(n=>n.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(root,'source',n),'utf8'),{filename:n});
const html=fs.readFileSync(path.join(root,'assets/index.html'),'utf8').replace(/\r\n/g,'\n');
for(const name of ['app.js','input-feedback172.js','input-feedback172.css'])assert(html.includes(fs.readFileSync(path.join(root,'source',name),'utf8').replace(/\r\n/g,'\n').trim()),name+' source/bundle');
const baseline=process.env.FRAMING_UI_BASELINE||'5efcdc7d55b0df6918a7fc1db181d2780539073f';
const original=p=>cp.execFileSync('git',['show',baseline+':FramingStudio/'+p],{cwd:repo,maxBuffer:20*1024*1024});
const tracked=cp.execFileSync('git',['ls-tree','-r','--name-only',baseline,'FramingStudio/Excel','FramingStudio/source'],{cwd:repo,encoding:'utf8'}).trim().split('\n');
const uiChanged=new Set(['app.js','FramingStudio.cs','app.manifest','sync-web.py','compile.ps1']);let unchanged=0;
for(const p of tracked){if(p.startsWith('FramingStudio/source/')&&uiChanged.has(p.slice('FramingStudio/source/'.length)))continue;const file=path.join(repo,p);if(fs.existsSync(file)){assert(fs.readFileSync(file).equals(cp.execFileSync('git',['show',baseline+':'+p],{cwd:repo,maxBuffer:20*1024*1024})),p+' unchanged from PR #2');unchanged++;}}
let before=original('assets/index.html').toString('utf8').replace(/\r\n/g,'\n'),after=html;
before=before.replace(original('source/app.js').toString('utf8').replace(/\r\n/g,'\n').trim(),'APP_BODY');after=after.replace(app.trim(),'APP_BODY');
after=after.replace(/<style>\/\* studio-source:input-feedback172.css:start \*\/[\s\S]*?input-feedback172.css:end \*\/<\/style>\n/,'').replace(/<script>\/\* studio-source:input-feedback172.js:start \*\/[\s\S]*?input-feedback172.js:end \*\/<\/script>\n/,'');
function neutralize(s){return s.replace(/<title>Framing Studio[^<]*<\/title>/,'TITLE').replace(/探索版 · E2\.\d+/,'BADGE').replace(/(<div class="nav-bottom">)E2\.\d+/,'$1VERSION').replace(/<dialog id="helpdialog">[\s\S]*?<\/dialog>/,'HELP');}
assert.equal(neutralize(after),neutralize(before),'Other page markup, modules and styles unchanged');
const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8'));
version.windowsVersion=version.version.slice(1)+'.0.0';
assert(html.includes('<title>Framing Studio · '+version.version+'</title>'));
assert(html.includes('探索版 · '+version.version));assert(html.includes('nav-bottom">'+version.version));
assert(fs.readFileSync(path.join(root,'source/FramingStudio.cs'),'utf8').includes('AssemblyFileVersion("'+version.windowsVersion+'")'));
assert(fs.readFileSync(path.join(root,'source/app.manifest'),'utf8').includes('version="'+version.windowsVersion+'"'));
console.log(JSON.stringify({ok:true,unchanged,checks:['Rejected edit: rollback, no save/history, original typed draft retained','Valid correction: save and undo history work','Clean numeric display and unchanged model precision','All source syntax and three bundled UI modules','Original PR2 calculations, Excel/VBA/reports and other UI content unchanged','Web/Windows version fields match version.json']}));
