// Shared responsive layout and Android document storage; calculations are unchanged.
(()=>{
 const style=document.createElement('style');style.textContent=`
 #mobile-tools{display:none}
 @media(max-width:800px){
 html,body{min-width:0!important;width:100%;overflow:hidden}body{height:100dvh;display:flex;flex-direction:column}body>header,.layout-tools{flex-shrink:0}
 header{height:auto!important;min-height:48px;max-height:130px;overflow:auto;padding:7px 10px!important;flex-wrap:wrap;gap:6px!important}
 .header-photo{display:none!important}.header-identity{min-width:0!important}.header-identity h1{font-size:16px!important}.header-identity small{display:none}
 header button{padding:7px 9px!important;font-size:12px}header .header-actions{flex-wrap:wrap}
 #mobile-tools{display:flex;gap:8px;align-items:center;background:#eff5f7;padding:7px 10px;flex:none}
 #mobile-tools button{padding:8px 14px;border:1px solid #b9cfd8;border-radius:6px;background:white;color:#245b70}
 .layout,.layout[data-tab],.layout[data-full="true"]{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important;height:0!important;min-height:0!important;position:relative;flex:1;overflow:hidden}
 #nav{display:none;position:absolute;inset:0 auto 0 0;width:220px!important;z-index:100;background:#f7fafb;box-shadow:4px 0 12px #19334940;overflow:auto}
 body.mobile-nav #nav{display:flex;flex-direction:column!important}#nav-divider,#side-divider{display:none!important}
 .layout .stage,.layout[data-tab] .stage,.layout[data-full="true"] .stage{grid-column:1!important;grid-row:1;height:100%!important;min-height:0!important;min-width:0;width:100%}
 .layout>.side{display:none!important;position:absolute;inset:0;z-index:30;width:100%!important;min-width:0!important;background:white;overflow:auto}
 body.mobile-inputs .layout:not([data-full="true"])>.side{display:block!important}
 #workspace-pages{padding:12px!important}.wp-head{flex-wrap:wrap;gap:8px}.wp-head h1{font-size:22px}.wp-card{padding:14px}.wp-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px}
 .wp-grid input,.wp-grid select{font-size:16px;padding:10px 7px}.wp-table{font-size:12px}.wp-table td,.wp-table th{padding:7px 5px}.wp-card{overflow-x:auto}
 .fn-page .wp-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.wp-grid label:has([data-fn="column"]){grid-column:1/-1}
 .toolbar{flex-wrap:wrap;max-height:100px;overflow:auto;padding:6px!important}canvas{touch-action:none}
 dialog{max-width:calc(100vw - 20px)!important}.member-info{max-width:calc(100vw - 20px)!important;left:10px!important;right:10px!important}
 }
 `;document.head.append(style);
 const bar=document.createElement('div');bar.id='mobile-tools';bar.innerHTML='<button id="mobile-nav">☰ 页面</button><button id="mobile-inputs">输入／图面</button><span style="font-size:12px;color:#617b89">横屏可查看更多</span>';
 document.querySelector('header').after(bar);document.getElementById('mobile-nav').onclick=()=>document.body.classList.toggle('mobile-nav');document.getElementById('mobile-inputs').onclick=()=>document.body.classList.toggle('mobile-inputs');
 document.getElementById('nav').addEventListener('click',e=>{if(e.target.closest('[data-tab]')){document.body.classList.remove('mobile-nav');document.body.classList.remove('mobile-inputs');}});
 if(window.NativeFiles){
  const blobs=new Map(),create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
  URL.createObjectURL=b=>{const u=create(b);blobs.set(u,b);return u;};URL.revokeObjectURL=u=>{blobs.delete(u);revoke(u);};
  document.addEventListener('click',async e=>{const a=e.target.closest('a[download]');if(!a)return;const blob=blobs.get(a.href);if(!blob)return;e.preventDefault();const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));NativeFiles.save(a.download,blob.type||'application/octet-stream',btoa(binary));},true);
 }
})();
