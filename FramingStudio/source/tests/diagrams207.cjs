const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const ctx=vm.createContext({document:{addEventListener(){}},window:{}});for(const n of ['beam-loads.js','beam-load-ui.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..',n),'utf8'),ctx);const run=s=>vm.runInContext(s,ctx),near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);run(`globalThis.D=BeamLoadUI.diagram207;globalThis.line=(a,b,v)=>({start:a,end:b,g:v/1.4,q:0});globalThis.point=(x,v)=>({x,g:v/1.4,q:0});`);
// Independent textbook closed forms, with loads already factored.
let d=run('D(6,[line(0,6,10)])');near(d.RA,30);near(d.RB,30);near(d.M.max.value,45);near(d.M.max.x,3);near(d.at(6).M,0);
d=run('D(6,[point(2,15),point(4,6)])');near(d.RA,12);near(d.RB,9);near(d.M.max.value,24);near(d.at(2).before,12);near(d.at(2).after,-3);near(d.at(6).M,0);
d=run('D(8,[line(4,8,10)])');near(d.RA,10);near(d.RB,30);near(d.M.max.x,5);near(d.M.max.value,45);
for(const reverse of [false,true])for(const fixedEnd of ['a','z']){d=run(`D(4,[line(0,4,10)],{cb:true,fixedEnd:'${fixedEnd}',reverse:${reverse}})`);near(d.M.min.value,-80);near(Math.max(Math.abs(d.V.min.value),Math.abs(d.V.max.value)),40);near(d.at(d.fixedLeft?4:0).M,0);}
d=run("D(4,[point(4,12)],{cb:true,fixedEnd:'a'})");near(d.M.min.value,-48);near(d.at(2).M,-24);near(d.at(4).M,0);
d=run('D(6,[point(3,10),point(3,20),line(0,2,4),line(1,5,3)])');near(d.at(3).before-d.at(3).after,30);near(d.at(6).M,0);
for(const s of d.segments){const x=s.mid.x,h=1e-5;near((d.at(x+h).M-d.at(x-h).M)/(2*h),d.at(x).after);}
d=run('D(5,[])');near(d.V.min.value,0);near(d.M.max.value,0);assert.throws(()=>run("D(5,[],{cb:true})"));
console.log('PASS: UDL, partial UDL, creator example, point jumps, CB at either end/reversed, zero loads, equilibrium and derivative identity');
