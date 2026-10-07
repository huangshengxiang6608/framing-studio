// Regression for Issue #3 quick wins 4, 6, 7 and 8 (presentation only; no browser needed).
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),repo=path.resolve(root,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const U=require('../source/ui-polish173.js');
// 4. Unit detection and soft warnings
for(const [text,unit] of [['距前轴 m','m'],['层高 m','m'],['结构高度 mm','mm'],['默认墙厚 mm','mm'],['X 向轴距 (m)','m'],['有效桩混凝土强度 · N/mm²','N/mm²'],['楼顶 mPD','mPD'],['柱目标主筋率 %','%'],['总层数（含地下室）',''],['柱项目系数',''],['Framing','']])assert.equal(U.unitOf(text),unit,text);
assert.match(U.suspicious('m',3300),/单位为 m/);assert.match(U.suspicious('m',250),/偏大/);assert.equal(U.suspicious('m',9.3),'');assert.equal(U.suspicious('m',150),'');
assert.match(U.suspicious('mm',0.6),/单位为 mm/);assert.equal(U.suspicious('mm',25),'');assert.equal(U.suspicious('mm',600),'');
assert.equal(U.suspicious('mPD',1200),'');assert.equal(U.suspicious('%',0.5),'');assert.equal(U.suspicious('m',0),'');
const mod=read('source/ui-polish173.js');assert(!/dataset\.unit|data-unit/.test(mod),'No data-* markers (InputFeedback172 builds selectors from data-* attributes)');
assert(!/dispatchEvent|\.value\s*=|StudioHost|transact\(/.test(mod),'Module never edits values or the project');
// 7. Canvas hints and selection notes in Simplified Chinese
const app=read('source/app.js'),hints=app.split('\n').filter(l=>l.includes("$('hint').textContent="));assert(hints.length);
for(const t of ['單擊','選取','當層','刪除此類','牆','點梁中點'])assert(!hints.some(l=>l.includes(t)),'hint still contains '+t);
for(const t of ['只顯示所選柱','逐行修改後','複製所選柱','單擊／拖拉累加選取，不用 Shift','「選擇／刪除」模式'])assert(!app.includes(t),'note still contains '+t);
// Labels used by existing UI tests are intentionally unchanged.
for(const t of ['全選當層柱','全選當層牆','已選取 '])assert(app.includes(t),t+' kept');
// 8. Close prompt only when unsaved; Save / Don't save / Cancel
const host=read('source/FramingStudio.cs');
assert(/!Ready \|\| !Unsaved\) return;/.test(host));assert(host.includes('MessageBoxButtons.YesNoCancel'));assert(!host.includes('MessageBoxButtons.OKCancel'));
assert(/else File\.Move\(tmp, target\);\n\s*Unsaved = true;/.test(host),'Autosave marks unsaved');
assert.equal((host.match(/EndsWith\("\.framing\.json"/g)||[]).length,2,'Project saves clear unsaved state');
// Bundle matches source
const html=read('assets/index.html');
for(const n of ['app.js','ui-polish173.js','ui-polish173.css'])assert(html.includes('/* studio-source:'+n+':start */\n'+read('source/'+n).trim()+'\n/* studio-source:'+n+':end */'),n+' bundled');
// Everything else unchanged since E2.172
const base=process.env.FRAMING_UI173_BASELINE||'d06f814',show=p=>cp.execFileSync('git',['show',base+':'+p],{cwd:repo,maxBuffer:30*1024*1024});
const allowed=new Set(['FramingStudio/source/app.js','FramingStudio/source/FramingStudio.cs','FramingStudio/source/sync-web.py','FramingStudio/assets/index.html','FramingStudio/verification/ui172.cjs']);
const tracked=cp.execFileSync('git',['ls-tree','-r','-z','--name-only',base,'FramingStudio'],{cwd:repo,encoding:'utf8'}).split('\0').filter(Boolean);let same=0;
for(const p of tracked){if(allowed.has(p))continue;assert(fs.readFileSync(path.join(repo,p)).equals(show(p)),p+' changed');same++;}
const strip=s=>s.replace(/\r\n/g,'\n').replace(/<style>\/\* studio-source:ui-polish173\.css:start[\s\S]*?ui-polish173\.css:end \*\/<\/style>\n/,'').replace(/<script>\/\* studio-source:ui-polish173\.js:start[\s\S]*?ui-polish173\.js:end \*\/<\/script>\n/,'');
const before=show('FramingStudio/assets/index.html').toString('utf8').replace(/\r\n/g,'\n').replace(show('FramingStudio/source/app.js').toString('utf8').replace(/\r\n/g,'\n').trim(),'APP'),after=strip(html).replace(app.trim(),'APP');
assert.equal(after,before,'Only app.js and the two new modules differ in the shipped page');
console.log(JSON.stringify({ok:true,unchangedFiles:same,checks:['Unit detection and soft m/mm warnings','Module is presentation-only','Simplified Chinese hints; test-referenced labels kept','Close prompt only when unsaved (Yes/No/Cancel)','Source/bundle sync','All other files (calculations, Excel/VBA, reports, templates, EXE) byte-identical to E2.172']}));
