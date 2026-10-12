// Reuse the real loading/RC fixtures and advice assertions, then test application.
const fs222=require('fs'),path222=require('path');
const base222=fs222.readFileSync(path222.join(__dirname,'tb-advice221.cjs'),'utf8');
const extra222=fs222.readFileSync(path222.join(__dirname,'tb-apply222-checks.cjs'),'utf8');
new Function('require','__dirname',base222+'\n'+extra222)(require,__dirname);
