const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {context}=require('../../verification/integration143.cjs'),c=context(path.resolve(__dirname,'../..'));
for(const n of ['loading115','loading126','slab131'])c.run(fs.readFileSync(path.join(__dirname,n+'-browser.js'),'utf8'));
for(const n of ['loading126','slab131'])console.log(n,c.run(n+'Tests().passed'));
const out=c.run(`(()=>{const s={id:'S',x0:21,x1:23.5,y0:1.5,y1:3.075,rects:[{x0:21,x1:23.5,y0:1.5,y1:3.075}],area:3.9375,rectangular:true,netBoundary120:true,thickness:200},b=(id,a,z,w)=>({id,kind:'MB',a,z,rawA:[0,0],rawZ:[1,0],b:w,d:.6}),m={columns:[],walls:[],beams:[b('L',[20.25,.75],[20.25,3.2],1.5),b('R',[24.25,.75],[24.25,3.2],1.5),b('T',[20.25,.75],[24.25,.75],1.5),b('B',[20.25,3.2],[24.25,3.2],.25)]};return {x:Loading.slabSpan(s,'X',m).effective,y:Loading.slabSpan(s,'Y',m).effective,calc:Loading.slabCalculation(s,'Y',m),manual:Loading.slabCalculation(s,'Y',m,{slabSpan131:{L:2,width:3,selfWeight:'net'}})};})()`);
assert.equal(out.x,4);assert.equal(out.y,2.45);assert.equal(out.calc.width,4);assert(Math.abs(out.calc.netArea-3.9375)<1e-9);assert.equal(out.calc.selfWeightScale,1);assert.equal(out.manual.L,2);assert.equal(out.manual.width,3);
console.log('Unequal physical beam centres give 4.00 x 2.45; stale reference lines ignored; net weight and manual overrides retained');
