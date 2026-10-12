const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const ctx=vm.createContext({document:{addEventListener(){}},window:{},Loading:{settings:p=>p.settings}});
for(const n of ['beam-loads.js','beam-load-ui.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',n),'utf8'),ctx);
const ui=vm.runInContext('BeamLoadUI',ctx),calc=ui.deflection210;
const near=(a,b)=>assert(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const properties={B:.3,D:.6,E:26.4},EI=26.4e6*.3*.6**3/12,L=6;
const line=(a,b,g,q=0)=>({start:a,end:b,g,q}),point=(x,g,q=0)=>({x,g,q});
// Published Table 3.2 column, including endpoints; reject non-tabulated grades.
assert.deepEqual(Object.values(ui.elastic210),[18.7,20.5,22.2,23.7,25.1,26.4,27.7,28.9,30,31.1,32.2,33.2,34.2,35.1,36,36.9,37.8]);
assert.equal(ui.material210({settings:{fcu:45,tbFcu:60}},{displayKind:'TB'}).E,30);
assert.equal(ui.material210({settings:{fcu:45,tbFcu:60}},{displayKind:'CB',kind:'TB'}).E,26.4);
assert.equal(ui.material210({settings:{fcu:47}},{kind:'MB'}).E,undefined);
let d=calc(L,[line(0,L,6,4)],properties);near(d.peak.x,L/2);near(d.peak.delta,5*10*L**4/(384*EI)*1000);near(d.at(0).delta,0);near(d.at(L).delta,0);
d=calc(L,[point(L/2,12,8)],properties);near(d.peak.delta,20*L**3/(48*EI)*1000);near(d.at(0).slope,20*L**2/(16*EI));
for(const reverse of [false,true])for(const fixedEnd of ['a','z']){
 const options={...properties,cb:true,fixedEnd,reverse},fixedLeft=(fixedEnd==='a')!==reverse,free=fixedLeft?L:0,root=L-free;
 d=calc(L,[line(0,L,6,4)],options);near(d.at(free).delta,10*L**4/(8*EI)*1000);near(d.at(root).delta,0);near(d.at(root).slope,0);
 d=calc(L,[point(fixedEnd==='a'?L:0,20)],options);near(d.at(free).delta,20*L**3/(3*EI)*1000);near(d.peak.x,free);
 d=calc(L,[point(fixedEnd==='a'?2:L-2,20)],options);near(d.at(free).delta,20*2**2*(3*L-2)/(6*EI)*1000);
}
// Independent simple-beam point-load Green function; quadrature for partial UDL.
function green(x,a){const b=L-a;return x<=a?b*x*(L*L-b*b-x*x)/(6*L*EI)*1000:a*(L-x)*(L*L-a*a-(L-x)**2)/(6*L*EI)*1000;}
const rows=[line(.7,4.2,3,2),point(1.3,7,4),point(4.8,8,0)];d=calc(L,rows,properties);
for(const x of [.2,1.3,2.6,4.8,5.8]){let expected=11*green(x,1.3)+8*green(x,4.8);const n=20000,h=3.5/n;for(let i=0;i<n;i++)expected+=5*h*green(x,.7+(i+.5)*h);near(d.at(x).delta,expected);const t=1e-4;near((d.at(x+t).delta-d.at(x-t).delta)/(2*t)/1000,d.at(x).slope);}
near(d.at(d.peak.x).slope,0);
const flipped=calc(L,rows,{...properties,reverse:true});for(const x of [.4,2,5])near(flipped.at(L-x).delta,d.at(x).delta);
const stiffer=calc(L,rows,{...properties,D:1.2});near(stiffer.peak.delta,d.peak.delta/8);
const contaminated=rows.map(r=>({...r,ug183:999999,uq183:999999}));near(calc(L,contaminated,properties).peak.delta,d.peak.delta);
const saved=JSON.stringify(rows);calc(L,rows,properties);assert.equal(JSON.stringify(rows),saved);
for(const support of [{},{cb:true,fixedEnd:'a'},{cb:true,fixedEnd:'z'}]){const zero=calc(L,[line(0,L,0)],{...properties,...support});assert(zero.samples.every(s=>s.delta===0&&s.slope===0));}
for(const bad of [{E:undefined},{B:0},{D:-1},{E:Infinity}])assert.throws(()=>calc(L,rows,{...properties,...bad}));
assert.throws(()=>calc(L,rows,{...properties,cb:true}));assert.throws(()=>calc(L,[point(7,1)],properties));assert.throws(()=>calc(L,[point(1,NaN)],properties));
console.log('PASS Table 3.2, material routing, simple/CB closed forms, either root/reversal, partial UDL + points, slopes/maxima, EI units/scaling, zero/invalid input, characteristic loads and immutability');
