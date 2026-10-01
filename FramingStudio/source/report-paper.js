const ReportPaper=(function createReportPaper(){
 const pitch=648.72/33,px=pitch*4/3;
 const css=`
 @page answer-sheet {size:A4 portrait;margin:89.985pt 69.398pt 103.184pt 32.197pt}
 .check-report.answer-ruled{position:relative;isolation:isolate;box-sizing:border-box;width:493.68pt!important;min-width:493.68pt;min-height:648.72pt;margin:18px auto!important;padding:0!important;background:#fff!important}
 .answer-paper-rules{position:absolute;left:0;top:0;width:100%!important;height:100%!important;pointer-events:none;z-index:0;overflow:visible}
 .answer-paper-content{position:relative;z-index:1;padding:0 5pt;box-sizing:border-box}
 .answer-paper-content>p{margin:0!important;padding:0 2pt!important;min-height:${pitch}pt!important;line-height:${pitch}pt!important;font-size:10pt;white-space:pre-wrap;orphans:2;widows:2}
 .answer-paper-content>p.copy-heading{padding-top:${pitch}pt!important;break-after:avoid}
 .answer-paper-content>h1{font-size:16pt;margin:0!important;padding:${pitch}pt 0 0!important;line-height:${pitch}pt;break-after:avoid}
 .answer-paper-content table{background:#fff;max-width:100%;min-width:0!important}
 .answer-paper-content th{position:static!important}
 .answer-paper-content tr{break-inside:avoid}
 .answer-paper-content .copy-figure{margin:0!important;padding:0!important;break-inside:avoid;background:#fff}
 .answer-paper-content .copy-figure img{display:block;width:100%;max-height:160mm;object-fit:contain}
 .answer-paper-content .copy-figure figcaption{line-height:${pitch}pt;min-height:${pitch}pt;font-size:9pt}
 .answer-paper-content .overall-copy{margin:0!important;background:transparent!important}
 .answer-paper-content .native-copy-scroll,.answer-paper-content .copy-table-wrap{overflow:visible!important;margin:0!important}
 .answer-paper-content .native-excel-copy{min-width:0!important;background:transparent!important}
 .answer-paper-content .native-excel-copy td{vertical-align:top!important;line-height:${pitch}pt!important;padding-top:0!important;padding-bottom:0!important}
 #ex-report-content:has(.answer-ruled){overflow:auto;background:#eef2f4;padding:18px}
 @media print{
  #printpage:has(.answer-ruled),.answer-ruled{page:answer-sheet}
  body:has(.answer-ruled){margin:0!important;padding:0!important;max-width:none!important;background:white!important}
  body>#printpage:has(.answer-ruled){width:auto!important;height:auto!important;overflow:visible!important}
  .check-report.answer-ruled{margin:0!important;min-height:0;width:100%!important;min-width:0!important;background:transparent!important}
  .answer-paper-rules{position:fixed!important;left:0;top:0;width:493.68pt!important;height:648.72pt!important;display:block!important}
  .answer-paper-content{padding:0 5pt}
  .answer-paper-content *{print-color-adjust:exact;-webkit-print-color-adjust:exact}
 }
 `;
 function rules(){return '<svg class="answer-paper-rules" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs><pattern id="answer-lines" width="100%" height="'+px+'" patternUnits="userSpaceOnUse"><path d="M0 0.32 H660" fill="none" stroke="#a6a6a6" stroke-width="0.64"/></pattern></defs><rect width="100%" height="100%" fill="url(#answer-lines)"/><rect x="0.32" y="0.32" width="calc(100% - 0.64px)" height="calc(100% - 0.64px)" fill="none" stroke="#a6a6a6" stroke-width="0.64"/></svg>';}
 function prepare(root){
  for(const article of root.querySelectorAll('.answer-ruled')){
   // Whole rows use a multiple of the paper pitch. The cell text, numbers,
   // formula results, column widths, merges and internal styling stay intact.
   for(const tr of article.querySelectorAll('tr')){
    if(tr.dataset.paperBaseHeight===undefined)tr.dataset.paperBaseHeight=tr.style.height;
    tr.style.height=tr.dataset.paperBaseHeight;const h=tr.getBoundingClientRect().height;
    if(h>0)tr.style.height=(Math.ceil((h-.3)/px)*px)+'px';
   }
   for(const block of article.querySelector('.answer-paper-content').children){
    if(block.matches('p,h1'))continue;
    block.style.paddingBottom='';const h=block.getBoundingClientRect().height;
    if(h>0)block.style.paddingBottom=(Math.ceil((h-.3)/px)*px-h)+'px';
   }
  }
 }
 function init(){const run=()=>prepare(document);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('load',run);window.addEventListener('beforeprint',run);}
 function script(){return '('+createReportPaper.toString()+')().init();';}
 return {css,rules,prepare,init,script,pitch};
})();
