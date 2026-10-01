window.DeflectionFraming91=(()=>{
 let slots=[],showColumns=true;
 function init(){if(slots.length)return;const stage=document.querySelector('.stage');for(const sel of [':scope > .toolbar',':scope > .viewer-controls',':scope > .components',':scope > .canvas-wrap',':scope > .statusbar']){const node=stage.querySelector(sel);if(!node)continue;const marker=document.createComment('Framing original position');node.before(marker);slots.push({node,marker});}}
 function park(){for(const {node,marker}of slots)if(node.parentNode!==marker.parentNode)marker.after(node);}
 function mount(){const host=document.getElementById('df-framing-host');if(!host)return;host.dataset.columns=String(showColumns);init();for(const {node}of slots)if(node.parentNode!==host)host.append(node);}
 function setColumns(v){showColumns=!!v;const host=document.getElementById('df-framing-host');if(host)host.dataset.columns=String(showColumns);}
 return {park,mount,columns:()=>showColumns,setColumns,visible:()=>({COL:showColumns,WALL:true,MB:false,SB:false,TB:false,CB:false,CS:false,SLAB:false})};
})();
