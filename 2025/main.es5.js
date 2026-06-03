"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var $ = function $(s) {
  return document.querySelector(s);
};
var $$ = function $$(s) {
  return Array.from(document.querySelectorAll(s));
};
var show = function show(el) {
  return el.style.display = '';
};
var hide = function hide(el) {
  return el.style.display = 'none';
};
var showIf = function showIf(el, cond) {
  return cond ? show(el) : hide(el);
};
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
// const imageUrl = id => `https://keeer-pub.oss-cn-beijing.aliyuncs.com/rdfzgkavt/2024/${id}.webp`
var imageUrl = function imageUrl(id) {
  return "cover/".concat(id, ".webp");
};
// const imageUrl = id => `export/${id}.png`
var styleBgs = $$('.style__bg');
var mapBgs = $$('.map__bg');
var styleButtons = {
  full: $('#style-full'),
  framed: $('#style-framed')
};
var steps = ['select', 'crop', 'edit', 'save'].map(function (x) {
  return $("#step-".concat(x));
});
var focusStep = function focusStep(i) {
  return steps.forEach(function (el, j) {
    return showIf(el, i === j);
  });
};
focusStep(0);

// (88, 87); 850x850

var fgSize = 1024;
var exportType = 'image/jpeg';
var exportCanvas = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(canvas) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!/micromess/i.test(navigator.userAgent)) {
              _context.next = 4;
              break;
            }
            _context.t0 = canvas.toDataURL(exportType);
            _context.next = 9;
            break;
          case 4:
            _context.t1 = URL;
            _context.next = 7;
            return new Promise(function (resolve) {
              return canvas.toBlob(resolve, exportType);
            });
          case 7:
            _context.t2 = _context.sent;
            _context.t0 = _context.t1.createObjectURL.call(_context.t1, _context.t2);
          case 9:
            return _context.abrupt("return", _context.t0);
          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return function exportCanvas(_x) {
    return _ref.apply(this, arguments);
  };
}();
var _loop = function _loop(style) {
  styleButtons[style].addEventListener('click', function (e) {
    e.preventDefault();
    chooseStyle(style);
    document.getSelection().removeAllRanges();
    setTimeout(function () {
      return document.getSelection().removeAllRanges();
    }, 10);
  });
};
for (var style in styleButtons) {
  _loop(style);
}
var currentStyleClass = 'style__current';
var currentStyle;
var chooseStyle = function chooseStyle(i) {
  currentStyle = i;
  for (var j in styleButtons) {
    styleButtons[j].classList[i === j ? 'add' : 'remove'](currentStyleClass);
  }
  // FIXME: hack
  if (i === 'framed' && !toggles['1']) {
    toggleKey('1');
  }
  updateFrame();
};
var toggleDefaults = {
  '1': true,
  '2-left': true,
  '2-right': false,
  '3-left': true,
  '3-right': true,
  '4': true
};
var toggles = _objectSpread({}, toggleDefaults);
var initToggles = function initToggles() {
  for (var k in toggles) {
    if (toggles[k] != toggleDefaults[k]) toggleKey(k);
  }
};
var getVariant = function getVariant() {
  return toggles[4] ? 'open' : 'closed';
};
var updateToggle = function updateToggle(target, checked) {
  var setState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  if (setState) toggles[target] = checked;
  $("#maplayer-".concat(target)).classList[checked ? 'remove' : 'add']('disabled');
  var _iterator = _createForOfIteratorHelper($$(".cover-".concat(target))),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var el = _step.value;
      showIf(el, checked);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};
var reverseDirection = function reverseDirection(x) {
  return x.replace(/left|right/, function (x) {
    return x === 'left' ? 'right' : 'left';
  });
};
var toggleKey = function toggleKey(key) {
  var current = !toggles[key];
  if (key === '1') {
    if (currentStyle === 'framed' && !current) return;
    toggles[key] = current;
    for (var _i = 0, _arr = ['open', 'closed']; _i < _arr.length; _i++) {
      var i = _arr[_i];
      for (var _i2 = 0, _arr2 = ['full', 'framed']; _i2 < _arr2.length; _i2++) {
        var j = _arr2[_i2];
        updateToggle("1-".concat(i, "-").concat(j), current, false);
      }
    }
    updateFrame();
  } else {
    updateToggle(key, !toggles[key]);
  }
  if (key[0] === '2' && current) {
    var rkey = reverseDirection(key);
    updateToggle(rkey, false);
    var figureKey = key.replace('2', '3');
    if (!toggles[figureKey]) {
      updateToggle(figureKey, true);
    }
  }
  if (key[0] === '3' && !current) {
    var bubbleKey = key.replace('3', '2');
    if (toggles[bubbleKey]) {
      updateToggle(bubbleKey, false);
      var _rkey = reverseDirection(key);
      if (toggles[_rkey]) {
        var rBubbleKey = reverseDirection(bubbleKey);
        updateToggle(rBubbleKey, true);
      }
    }
  }
  if (key === '4') {
    updateFrame();
  }
};
var _loop2 = function _loop2(key) {
  $("#maparea-".concat(key)).addEventListener('click', function (e) {
    e.preventDefault();
    toggleKey(key);
  });
};
for (var key in toggles) {
  _loop2(key);
}
var frameEls = {};
for (var _style in styleButtons) {
  var map = frameEls[_style] = {};
  for (var _i3 = 0, _arr3 = ['open', 'closed']; _i3 < _arr3.length; _i3++) {
    var variant = _arr3[_i3];
    map[variant] = {
      cover: $(".cover-1-".concat(variant, "-").concat(_style)),
      map: $("#maplayer-1-".concat(variant, "-").concat(_style))
    };
  }
}
var updateFrame = function updateFrame() {
  var currentVariant = getVariant();
  for (var _style2 in styleButtons) {
    showIf($("#map-bg-".concat(_style2)), _style2 === currentStyle);
    for (var _i4 = 0, _arr4 = ['open', 'closed']; _i4 < _arr4.length; _i4++) {
      var _variant = _arr4[_i4];
      var shouldShowMap = _style2 === currentStyle && (_variant === currentVariant || _variant === 'open');
      frameEls[_style2][_variant].map.classList[shouldShowMap ? 'remove' : 'add']('transparent');
      showIf(frameEls[_style2][_variant].cover, _variant === currentVariant && (toggles['1'] || _style2 === 'framed'));
    }
  }
};
var sendEvent = function sendEvent(name) {
  window.umami && umami(name);
};
var cropperInstance;
uploadButton.addEventListener('click', function () {
  uploadEl.click();
});
uploadEl.addEventListener('change', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
  var avatarSrc, img;
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          sendEvent('upload-done');
          uploadButton.disabled = true;
          avatarSrc = URL.createObjectURL(uploadEl.files[0]);
          uploadEl.value = '';
          img = new Image();
          _context2.prev = 5;
          _context2.next = 8;
          return new Promise(function (resolve, reject) {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(function () {
              return reject('超时');
            }, 1000);
            img.src = avatarSrc;
          });
        case 8:
          _context2.next = 17;
          break;
        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](5);
          alert("\u52A0\u8F7D\u56FE\u7247\u51FA\u9519: ".concat(_context2.t0));
          console.error(_context2.t0);
          focusStep(0);
          uploadButton.disabled = false;
          return _context2.abrupt("return");
        case 17:
          hide(saveStatusEl);
          if (img.height != img.width) {
            cropImageEl.src = avatarSrc;
            if (cropperInstance) {
              cropperInstance.replace(avatarSrc);
            } else {
              cropperInstance = new Cropper(cropImageEl, {
                aspectRatio: 1,
                viewMode: 3,
                autoCropArea: 1,
                rotatable: false,
                scalable: false,
                zoomable: false
              });
            }
            focusStep(1);
          } else {
            sendEvent('no-crop');
            styleBgs.forEach(function (i) {
              return i.src = avatarSrc;
            });
            mapBgs.forEach(function (i) {
              return i.setAttribute('href', avatarSrc);
            });
            focusStep(2);
            initToggles();
            chooseStyle('full');
          }
          uploadButton.disabled = false;
        case 20:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2, null, [[5, 10]]);
})));
cropButton.addEventListener('click', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
  var canvas, url;
  return regeneratorRuntime.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          cropButton.disabled = true;
          _context3.next = 3;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 60);
          });
        case 3:
          _context3.prev = 3;
          canvas = cropperInstance.getCroppedCanvas({
            width: fgSize,
            height: fgSize
          });
          _context3.next = 7;
          return exportCanvas(canvas);
        case 7:
          url = _context3.sent;
          styleBgs.forEach(function (i) {
            return i.src = url;
          });
          mapBgs.forEach(function (i) {
            return i.setAttribute('href', url);
          });
          focusStep(2);
          initToggles();
          chooseStyle('full');
          _context3.next = 18;
          break;
        case 15:
          _context3.prev = 15;
          _context3.t0 = _context3["catch"](3);
          alert("\u88C1\u526A\u8FC7\u7A0B\u4E2D\u51FA\u73B0\u9519\u8BEF: ".concat(_context3.t0));
        case 18:
          _context3.prev = 18;
          cropButton.disabled = false;
          return _context3.finish(18);
        case 21:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3, null, [[3, 15, 18, 21]]);
})));
saveButton.addEventListener('click', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
  var done, setStatus, toggleKeys, togglesBitmap, fgImagePromise, layers, imagePromises, canvas, ctx, fgImages, _iterator2, _step2, image, resultUrl;
  return regeneratorRuntime.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          done = false;
          setTimeout(function () {
            if (done) return;
            show(saveStatusEl);
          }, 1000);
          setStatus = function setStatus(status) {
            return saveStatusEl.innerText = status;
          };
          sendEvent("save-".concat(currentStyle));
          toggleKeys = ['1', '2-left', '2-right', '3-left', '3-right', '4'];
          togglesBitmap = toggleKeys.map(function (x) {
            return toggles[x];
          }).map(function (x) {
            return +x;
          }).join('');
          sendEvent("save-toggle-".concat(togglesBitmap));
          saveButton.disabled = true;
          fgImagePromise = function fgImagePromise(id) {
            return new Promise(function (resolve, reject) {
              var src = imageUrl(id);
              var existingImg = $("img[src=\"".concat(src, "\"]"));
              if (existingImg && existingImg.loaded) {
                return resolve(existingImg);
              }
              var img = new Image();
              img.setAttribute('crossorigin', 'anonymous');
              img.src = src;
              img.onload = function () {
                return resolve(img);
              };
              img.onerror = reject;
            });
          };
          layers = toggleKeys.map(function (k) {
            if (!toggles[k]) return null;
            if (k === '1') return "1-".concat(getVariant(), "-").concat(currentStyle);
            return k;
          }).filter(function (x) {
            return x !== null;
          });
          imagePromises = Promise.all(layers.map(fgImagePromise));
          setStatus('正在擦拭黑板……');
          canvas = document.createElement('canvas');
          canvas.width = canvas.height = fgSize;
          ctx = canvas.getContext('2d');
          ctx.strokeStyle = 'transparent';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, fgSize, fgSize);

          // FIXME: hack
          if (currentStyle === 'framed') {
            ctx.drawImage(styleBgs[0], 88, 87, 850, 850);
          } else {
            ctx.drawImage(styleBgs[0], 0, 0, fgSize, fgSize);
          }
          setStatus('正在寻找粉笔……');
          _context4.prev = 20;
          _context4.next = 23;
          return imagePromises;
        case 23:
          fgImages = _context4.sent;
          setStatus('正在绘制板报……');
          // next tick
          _context4.next = 27;
          return Promise.resolve();
        case 27:
          _iterator2 = _createForOfIteratorHelper(fgImages);
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              image = _step2.value;
              ctx.drawImage(image, 0, 0, fgSize, fgSize);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          _context4.next = 38;
          break;
        case 31:
          _context4.prev = 31;
          _context4.t0 = _context4["catch"](20);
          setStatus('网络错误');
          alert('无法下载蒙版图片，请检查您的互联网连接。');
          console.error(_context4.t0);
          saveButton.disabled = false;
          return _context4.abrupt("return");
        case 38:
          setStatus('正在拍照……');
          _context4.next = 41;
          return exportCanvas(canvas);
        case 41:
          resultUrl = _context4.sent;
          resultImageEl.src = resultUrl;
          focusStep(3);
          saveButton.disabled = false;
          done = true;
          setStatus('');
        case 47:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4, null, [[20, 31]]);
})));
backButton.addEventListener('click', function () {
  focusStep(0);
});
back1Button.addEventListener('click', function () {
  focusStep(0);
});
back2Button.addEventListener('click', function () {
  focusStep(0);
});
var ripples = [].concat(_toConsumableArray(document.querySelectorAll('[data-ripple]')), _toConsumableArray(document.querySelectorAll('.mdc-button')));
var _iterator3 = _createForOfIteratorHelper(ripples),
  _step3;
try {
  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
    var el = _step3.value;
    mdc.ripple.MDCRipple.attachTo(el);
  }

  // load lazy-load images
} catch (err) {
  _iterator3.e(err);
} finally {
  _iterator3.f();
}
var errorReported = false,
  imageLoaded = false;
setTimeout(function () {
  return $$('.style__fg').forEach(function (img) {
    img.addEventListener('error', function () {
      if (!errorReported) {
        errorReported = true;
        sendEvent('image-error');
      }
    });
    img.addEventListener('load', function () {
      img.loaded = true;
      imageLoaded = true;
    });
    img.setAttribute('crossorigin', 'anonymous');
    img.src = img.getAttribute('data-src');
  });
}, 100);
setTimeout(function () {
  return $$('.maplayer').forEach(function (img) {
    img.addEventListener('error', function () {
      if (!errorReported) {
        errorReported = true;
        sendEvent('image-error');
      }
    });
    img.setAttribute('crossorigin', 'anonymous');
    img.setAttribute('href', img.getAttribute('data-href'));
  });
}, 100);
setTimeout(function () {
  if (!imageLoaded) sendEvent('image-slow');
}, 3000);
setTimeout(function () {
  if (!imageLoaded) sendEvent('image-timeout');
}, 6000);

