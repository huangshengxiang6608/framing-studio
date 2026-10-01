// Render CSS dimensions at the current screen density, including WebView zoom.
const DisplayQuality=(()=>{
 function size(width,height,dpr=window.devicePixelRatio||1){
  const requested=Math.max(1,Number(dpr)||1),pixels=width*height*requested*requested;
  const scale=pixels>32000000?requested*Math.sqrt(32000000/pixels):requested;
  return {width:Math.max(1,Math.ceil(width*scale)),height:Math.max(1,Math.ceil(height*scale)),scale};
 }
 function watch(callback){
  let query,disposed=false,last=window.devicePixelRatio||1;
  const arm=()=>{query?.removeEventListener('change',changed);query=matchMedia(`(resolution: ${last}dppx)`);query.addEventListener('change',changed);};
  const changed=()=>{if(disposed)return;const next=window.devicePixelRatio||1;if(next!==last){last=next;callback();}arm();};
  arm();window.addEventListener('resize',changed);
  return ()=>{disposed=true;query?.removeEventListener('change',changed);window.removeEventListener('resize',changed);};
 }
 return {size,watch};
})();
