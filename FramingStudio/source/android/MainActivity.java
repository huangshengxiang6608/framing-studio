package com.framingstudio.offline;
import android.app.*;
import android.os.*;
import android.webkit.*;
import android.content.*;
import android.net.Uri;
import android.util.Base64;
import java.io.*;

public class MainActivity extends Activity {
 private WebView web;private ValueCallback<Uri[]> chooser;private byte[] pending;
 private static final String HOST="appassets.androidplatform.net";
 @Override public void onCreate(Bundle b){super.onCreate(b);web=new WebView(this);android.widget.FrameLayout frame=new android.widget.FrameLayout(this);frame.addView(web,new android.widget.FrameLayout.LayoutParams(-1,-1));setContentView(frame);
  frame.setOnApplyWindowInsetsListener((v,insets)->{if(Build.VERSION.SDK_INT>=30){android.graphics.Insets bars=insets.getInsets(android.view.WindowInsets.Type.systemBars()|android.view.WindowInsets.Type.displayCutout());v.setPadding(bars.left,bars.top,bars.right,bars.bottom);}else v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(true);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setSupportMultipleWindows(false);
  web.addJavascriptInterface(new Files(),"NativeFiles");
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){
    Uri u=r.getUrl();if(!"https".equals(u.getScheme())||!HOST.equals(u.getHost()))return deny();String p=u.getPath();
    if(p==null||!p.startsWith("/assets/")||p.contains("..")||!"GET".equals(r.getMethod()))return deny();
    try{String f=p.substring(8);String mime=f.endsWith(".html")?"text/html":f.endsWith(".js")||f.endsWith(".mjs")?"application/javascript":f.endsWith(".css")?"text/css":f.endsWith(".png")?"image/png":f.endsWith(".json")?"application/json":"application/octet-stream";return new WebResourceResponse(mime,"UTF-8",getAssets().open(f));}catch(IOException e){return deny();}
   }
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return !HOST.equals(r.getUrl().getHost());}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> c,FileChooserParams p){if(chooser!=null)chooser.onReceiveValue(null);chooser=c;Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("*/*");startActivityForResult(i,1);return true;}
   @Override public boolean onJsConfirm(WebView v,String u,String m,JsResult r){new AlertDialog.Builder(MainActivity.this).setMessage(m).setPositiveButton("确定",(d,w)->r.confirm()).setNegativeButton("取消",(d,w)->r.cancel()).setOnCancelListener(d->r.cancel()).show();return true;}
   @Override public boolean onJsAlert(WebView v,String u,String m,JsResult r){new AlertDialog.Builder(MainActivity.this).setMessage(m).setPositiveButton("确定",(d,w)->r.confirm()).setOnCancelListener(d->r.cancel()).show();return true;}
  });
  web.loadUrl("https://"+HOST+"/assets/index.html");
 }
 private WebResourceResponse deny(){return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream(new byte[0]));}
 public class Files {
  @JavascriptInterface public void save(String name,String mime,String data){if(data.length()>30000000)return;byte[] bytes;try{bytes=Base64.decode(data,Base64.DEFAULT);}catch(Exception e){return;}runOnUiThread(()->{if(pending!=null){new AlertDialog.Builder(MainActivity.this).setMessage("请先完成当前保存").setPositiveButton("确定",null).show();return;}pending=bytes;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType(mime);i.putExtra(Intent.EXTRA_TITLE,name.replaceAll("[\\\\/:*?\"<>|]","_"));startActivityForResult(i,2);});}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==1&&chooser!=null){chooser.onReceiveValue(result==RESULT_OK&&data!=null?new Uri[]{data.getData()}:null);chooser=null;}if(request==2){try{if(result==RESULT_OK&&data!=null&&pending!=null){try(OutputStream o=getContentResolver().openOutputStream(data.getData())){o.write(pending);}}}catch(Exception e){new AlertDialog.Builder(this).setMessage("保存失败："+e.getMessage()).setPositiveButton("确定",null).show();}finally{pending=null;}}}
 @Override public void onBackPressed(){web.evaluateJavascript("(()=>{if(document.body.classList.contains('mobile-nav')){document.body.classList.remove('mobile-nav');return true}if(document.body.classList.contains('mobile-inputs')){document.body.classList.remove('mobile-inputs');return true}return false})()",v->{if(!"true".equals(v))new AlertDialog.Builder(this).setMessage("退出前请保存项目。退出应用？").setPositiveButton("退出",(d,w)->finish()).setNegativeButton("取消",null).show();});}
}
