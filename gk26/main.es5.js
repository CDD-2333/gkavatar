var $ = function(s) { return document.querySelector(s); };
var $$ = function(s) { return Array.from(document.querySelectorAll(s)); };
var show = function(el) { el.style.display = ''; };
var hide = function(el) { el.style.display = 'none'; };
var showIf = function(el, cond) { return cond ? show(el) : hide(el); };
var uploadEl = $('#image');
var uploadButton = $('#upload-avatar');
var cropButton = $('#crop');
var cropImageEl = $('#crop-image');
var canvasEl = $('#main-canvas');
var saveButton = $('#save');
var resultImageEl = $('#result-image');
var backButton = $('#back');
var back1Button = $('#back-1');
var back2Button = $('#back-2');
var saveStatusEl = $('#save-status');
var imageUrl = function(id) { return 'cover/' + id + '.webp'; };
var styleBgs = $$('.style__bg');
var mapBgs = $$('.map__bg');
var styleButtons = { full: $('#style-full'), framed: $('#style-framed') };
var steps = [ 'select', 'crop', 'edit', 'save' ].map(function(x) { return $('#step-' + x); });
var focusStep = function(i) { return steps.forEach(function(el, j) { showIf(el, i === j); }); };
focusStep(0);

// (88, 87); 850x850

var fgSize = 1024;

var exportType = 'image/jpeg';
var exportCanvas = function(canvas) {
  if (/micromess/i.test(navigator.userAgent)) {
    return Promise.resolve(canvas.toDataURL(exportType));
  }
  return new Promise(function(resolve) {
    canvas.toBlob(resolve, exportType);
  }).then(function(blob) {
    return URL.createObjectURL(blob);
  });
};

// ============================================================
// Two hard-exclusive themes:
//   Theme A (full / left card):  slogan-big + characters + clover
//   Theme B (framed / right card): slogan-small + buildings + starframe
// Clicking a card forces all its elements ON, the other theme fully HIDDEN.
// Within a theme, elements can be individually toggled (grayed-out when off).
// ============================================================

var THEME_A = ['slogan-big', 'characters', 'clover'];
var THEME_B = ['slogan-small', 'buildings', 'starframe'];
var LAYERS = ['frame', 'starframe', 'buildings', 'clover', 'characters', 'slogan-big', 'slogan-small'];

var toggleDefaults = {
  'frame': true,
  'clover': true, 'characters': true, 'slogan-big': true,
  'buildings': false, 'starframe': false, 'slogan-small': false,
};

var toggles = {};
for (var tk in toggleDefaults) { toggles[tk] = toggleDefaults[tk]; }

var currentStyle = 'full';
var currentStyleClass = 'style__current';

// Core: update one toggle — for within-theme on/off (gray-out when off)
var updateToggle = function(target, checked) {
  toggles[target] = checked;
  var mapEl = $('#maplayer-' + target);
  if (mapEl) {
    mapEl.classList[checked ? 'remove' : 'add']('disabled');
    mapEl.classList.remove('transparent');
  }
  var els = $$('.cover-' + target);
  for (var ei = 0; ei < els.length; ei++) { showIf(els[ei], checked); }
};

// Full-hide: used for the inactive theme's elements (completely invisible)
var hideElement = function(key) {
  toggles[key] = false;
  var mapEl = $('#maplayer-' + key);
  if (mapEl) { mapEl.classList.add('disabled', 'transparent'); }
  var els = $$('.cover-' + key);
  for (var ei = 0; ei < els.length; ei++) { hide(els[ei]); }
};

var initToggles = function() {
  var keys = Object.keys(toggleDefaults);
  for (var ki = 0; ki < keys.length; ki++) {
    updateToggle(keys[ki], toggleDefaults[keys[ki]]);
  }
};

var chooseStyle = function(i) {
  currentStyle = i;
  for (var j in styleButtons) {
    styleButtons[j].classList[i === j ? 'add' : 'remove'](currentStyleClass);
  }
  // Force ON all elements of chosen theme, fully HIDE all of the other
  var onKeys = i === 'full' ? THEME_A : THEME_B;
  var offKeys = i === 'full' ? THEME_B : THEME_A;
  for (var oi = 0; oi < onKeys.length; oi++) { updateToggle(onKeys[oi], true); }
  for (var oj = 0; oj < offKeys.length; oj++) { hideElement(offKeys[oj]); }
  updateMapBg();
};

// Toggle one element within the current theme (gray-out, not full hide)
var toggleOne = function(key) {
  var allowed = currentStyle === 'full' ? THEME_A : THEME_B;
  if (allowed.indexOf(key) === -1) return;
  updateToggle(key, !toggles[key]);
};

var updateMapBg = function() {
  for (var s in styleButtons) { showIf($('#map-bg-' + s), s === currentStyle); }
};

// ---- Style card click -> choose theme ----
for (var style in styleButtons) {
  (function(s) {
    styleButtons[s].addEventListener('click', function(e) {
      e.preventDefault();
      chooseStyle(s);
      document.getSelection().removeAllRanges();
      setTimeout(function() { document.getSelection().removeAllRanges(); }, 10);
    });
  })(style);
}

// ---- SVG zone click handlers ----
var bind = function(id, handler) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('click', handler);
};

bind('maparea-slogan', function(e) {
  e.preventDefault();
  toggleOne(currentStyle === 'full' ? 'slogan-big' : 'slogan-small');
});

bind('maparea-deco', function(e) {
  e.preventDefault();
  toggleOne(currentStyle === 'full' ? 'clover' : 'starframe');
});

bind('maparea-content', function(e) {
  e.preventDefault();
  toggleOne(currentStyle === 'full' ? 'characters' : 'buildings');
});

// ============================================================
// Event handlers
// ============================================================

var sendEvent = function(name) { window.umami && window.umami(name); };

var cropperInstance;
uploadButton.addEventListener('click', function() { uploadEl.click(); });

uploadEl.addEventListener('change', function() {
  var file = uploadEl.files && uploadEl.files[0];
  if (!file) { uploadButton.disabled = false; return; }
  // Validate file type
  if (file.type.indexOf('image/') !== 0) {
    alert('请选择一张图片文件。');
    uploadEl.value = '';
    uploadButton.disabled = false;
    return;
  }
  // Validate file size (max 20MB)
  if (file.size > 20 * 1024 * 1024) {
    alert('图片文件过大，请选择小于 20MB 的图片。');
    uploadEl.value = '';
    uploadButton.disabled = false;
    return;
  }
  sendEvent('upload-done');
  uploadButton.disabled = true;
  var avatarSrc = URL.createObjectURL(file);
  uploadEl.value = '';
  var img = new Image();
  hide(saveStatusEl);

  new Promise(function(resolve, reject) {
    img.onload = resolve;
    img.onerror = function() { reject('无法读取该图片文件'); };
    setTimeout(function() { reject('加载超时，请检查网络或更换图片'); }, 3000);
    img.src = avatarSrc;
  }).then(function() {
    // Validate image dimensions
    if (img.width < 64 || img.height < 64) {
      alert('图片尺寸过小，请选择至少 64×64 的图片。');
      URL.revokeObjectURL(avatarSrc);
      focusStep(0);
      uploadButton.disabled = false;
      return;
    }
    if (img.height != img.width) {
      cropImageEl.src = avatarSrc;
      try {
        if (cropperInstance) {
          cropperInstance.replace(avatarSrc);
        } else {
          cropperInstance = new Cropper(cropImageEl, {
            aspectRatio: 1, viewMode: 3, autoCropArea: 1,
            rotatable: false, scalable: false, zoomable: false,
          });
        }
      } catch (e2) {
        alert('裁剪工具初始化失败: ' + e2);
        console.error(e2);
        focusStep(0);
        uploadButton.disabled = false;
        return;
      }
      focusStep(1);
    } else {
      sendEvent('no-crop');
      styleBgs.forEach(function(el) { el.src = avatarSrc; });
      mapBgs.forEach(function(el) { el.setAttribute('href', avatarSrc); });
      focusStep(2);
      initToggles();
      chooseStyle('full');
    }
    uploadButton.disabled = false;
  }).catch(function(e) {
    alert('加载图片出错: ' + e);
    console.error(e);
    URL.revokeObjectURL(avatarSrc);
    focusStep(0);
    uploadButton.disabled = false;
  });
});

cropButton.addEventListener('click', function() {
  cropButton.disabled = true;
  new Promise(function(resolve) { setTimeout(resolve, 60); })
    .then(function() {
      if (!cropperInstance) throw new Error('裁剪工具未初始化，请重新上传图片');
      var canvas = cropperInstance.getCroppedCanvas({ width: fgSize, height: fgSize });
      if (!canvas) throw new Error('裁剪失败，请重试');
      return exportCanvas(canvas);
    }).then(function(url) {
      styleBgs.forEach(function(el) { el.src = url; });
      mapBgs.forEach(function(el) { el.setAttribute('href', url); });
      focusStep(2);
      initToggles();
      chooseStyle('full');
      cropButton.disabled = false;
    }).catch(function(e) {
      alert('裁剪过程中出现错误: ' + e);
      cropButton.disabled = false;
    });
});

saveButton.addEventListener('click', function() {
  var done = false;
  setTimeout(function() { if (done) return; show(saveStatusEl); }, 1000);
  var setStatus = function(status) { saveStatusEl.innerText = status; };

  sendEvent('save-' + currentStyle);
  var activeKeys = LAYERS.filter(function(k) { return toggles[k]; });
  var togglesBitmap = LAYERS.map(function(x) { return toggles[x]; }).map(function(x) { return +x; }).join('');
  sendEvent('save-toggle-' + togglesBitmap);
  saveButton.disabled = true;

  var fgImagePromise = function(id) {
    return new Promise(function(resolve, reject) {
      var src = imageUrl(id);
      var existingImg = document.querySelector('img[src="' + src + '"]');
      if (existingImg && existingImg.loaded) return resolve(existingImg);
      var img = new Image();
      img.setAttribute('crossorigin', 'anonymous');
      img.src = src;
      img.onload = function() { return resolve(img); };
      img.onerror = reject;
    });
  };

  setStatus('正在擦拭黑板……');
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = fgSize;
  var ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'transparent';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, fgSize, fgSize);

  if (currentStyle === 'framed') {
    ctx.drawImage(styleBgs[0], 88, 87, 850, 850);
  } else {
    ctx.drawImage(styleBgs[0], 0, 0, fgSize, fgSize);
  }

  setStatus('正在寻找粉笔……');
  Promise.resolve().then(function() {
    setStatus('正在绘制板报……');
    var sequence = Promise.resolve();
    activeKeys.forEach(function(key) {
      sequence = sequence.then(function() {
        return fgImagePromise(key);
      }).then(function(img) {
        ctx.drawImage(img, 0, 0, fgSize, fgSize);
      });
    });
    return sequence;
  }).then(function() {
    setStatus('正在拍照……');
    return exportCanvas(canvas);
  }).then(function(resultUrl) {
    resultImageEl.src = resultUrl;
    focusStep(3);
    saveButton.disabled = false;
    done = true;
    setStatus('');
  }).catch(function(e) {
    setStatus('网络错误');
    alert('无法下载蒙版图片，请检查您的互联网连接。');
    console.error(e);
    saveButton.disabled = false;
  });
});

backButton.addEventListener('click', function() { focusStep(0); });
back1Button.addEventListener('click', function() { focusStep(0); });
back2Button.addEventListener('click', function() { focusStep(0); });

var ripples = [].concat(Array.from(document.querySelectorAll('[data-ripple]')), Array.from(document.querySelectorAll('.mdc-button')));
for (var ri = 0; ri < ripples.length; ri++) { mdc.ripple.MDCRipple.attachTo(ripples[ri]); }

// load lazy-load images
var errorReported = false, imageLoaded = false;
setTimeout(function() {
  $$('.style__fg').forEach(function(img) {
    img.addEventListener('error', function() {
      if (!errorReported) { errorReported = true; alert('无法加载图片，请刷新或更换网络环境重试。'); sendEvent('image-error'); }
    });
    img.addEventListener('load', function() { img.loaded = true; imageLoaded = true; });
    img.setAttribute('crossorigin', 'anonymous');
    img.src = img.getAttribute('data-src');
  });
}, 100);
setTimeout(function() {
  $$('.maplayer').forEach(function(img) {
    img.addEventListener('error', function() {
      if (!errorReported) { errorReported = true; alert('无法加载图片，请刷新或更换网络环境重试。'); sendEvent('image-error'); }
    });
    img.setAttribute('crossorigin', 'anonymous');
    var href = img.getAttribute('data-href');
    if (href) img.setAttribute('href', href);
  });
}, 100);
setTimeout(function() { if (!imageLoaded) sendEvent('image-slow'); }, 3000);
setTimeout(function() { if (!imageLoaded) sendEvent('image-timeout'); }, 6000);
