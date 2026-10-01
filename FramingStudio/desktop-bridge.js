(() => {
  if (location.origin !== 'https://framing-studio.invalid') return;
  const post = (kind, value) => window.chrome.webview.postMessage({kind, value});
  window.addEventListener('error', e => post('error', `${e.message} @ ${e.filename}:${e.lineno}`));
  window.addEventListener('unhandledrejection', e => post('error', String(e.reason?.stack || e.reason)));
  const original = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    original.call(this, key, value);
    if (this === localStorage && key === 'framing-studio-explorer-e2') post('backup', String(value));
  };
})();
