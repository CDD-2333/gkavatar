const $ = s => document.querySelector(s)
const $$ = s => Array.from(document.querySelectorAll(s))
const show = el => el.style.display = ''
const hide = el => el.style.display = 'none'
const showIf = (el, cond) => cond ? show(el) : hide(el)
const uploadEl = $('#image')
const uploadButton = $('#upload-avatar')
const cropButton = $('#crop')
const cropImageEl = $('#crop-image')
const canvasEl = $('#main-canvas')
const saveButton = $('#save')
const resultImageEl = $('#result-image')
const backButton = $('#back')
const back1Button = $('#back-1')
const back2Button = $('#back-2')
const saveStatusEl = $('#save-status')
const imageUrl = id => `cover/${id}.webp`
const styleBgs = $$('.style__bg')
const mapBgs = $$('.map__bg')
const styleButtons = { full: $('#style-full'), framed: $('#style-framed') }
const steps = [ 'select', 'crop', 'edit', 'save' ].map(x => $(`#step-${x}`))
const focusStep = i => steps.forEach((el, j) => showIf(el, i === j))
focusStep(0)

// (88, 87); 850x850

const fgSize = 1024

const exportType = 'image/jpeg'
const exportCanvas = async canvas => /micromess/i.test(navigator.userAgent)
    ? canvas.toDataURL(exportType)
    : URL.createObjectURL(await new Promise(resolve => canvas.toBlob(resolve, exportType)))

// ============================================================
// Two hard-exclusive themes:
//   Theme A (full / left card):  slogan-big + characters + clover
//   Theme B (framed / right card): slogan-small + buildings + starframe
// Clicking a card forces all of its elements ON, the other theme fully HIDDEN.
// Within a theme, elements can be individually toggled (grayed-out when off).
// ============================================================

const THEME_A = ['slogan-big', 'characters', 'clover']
const THEME_B = ['slogan-small', 'buildings', 'starframe']

// All toggleable layers, also used as canvas draw-order
const LAYERS = ['frame', 'starframe', 'buildings', 'clover', 'characters', 'slogan-big', 'slogan-small']

const toggleDefaults = {
  'frame': true,
  'clover': true, 'characters': true, 'slogan-big': true,
  'buildings': false, 'starframe': false, 'slogan-small': false,
}

const toggles = { ...toggleDefaults }

let currentStyle = 'full'
const currentStyleClass = 'style__current'

// Core: update one toggle — for within-theme on/off (gray-out when off)
const updateToggle = (target, checked) => {
  toggles[target] = checked
  const mapEl = $(`#maplayer-${target}`)
  if (mapEl) {
    mapEl.classList[checked ? 'remove' : 'add']('disabled')
    mapEl.classList.remove('transparent')
  }
  for (const el of $$(`.cover-${target}`)) showIf(el, checked)
}

// Full-hide: used for the inactive theme's elements (completely invisible)
const hideElement = key => {
  toggles[key] = false
  const mapEl = $(`#maplayer-${key}`)
  if (mapEl) {
    mapEl.classList.add('disabled', 'transparent')
  }
  for (const el of $$(`.cover-${key}`)) hide(el)
}

const initToggles = () => {
  for (const k of Object.keys(toggleDefaults)) {
    updateToggle(k, toggleDefaults[k])
  }
}

const chooseStyle = i => {
  currentStyle = i
  for (const j in styleButtons) {
    styleButtons[j].classList[i === j ? 'add' : 'remove'](currentStyleClass)
  }
  // Force ON all elements of chosen theme, fully HIDE all of the other
  const onKeys = i === 'full' ? THEME_A : THEME_B
  const offKeys = i === 'full' ? THEME_B : THEME_A
  for (const k of onKeys) updateToggle(k, true)
  for (const k of offKeys) hideElement(k)
  updateMapBg()
}

// Toggle one element within the current theme (gray-out, not full hide)
const toggleOne = key => {
  const allowed = currentStyle === 'full' ? THEME_A : THEME_B
  if (!allowed.includes(key)) return
  updateToggle(key, !toggles[key])
}

const updateMapBg = () => {
  for (const s in styleButtons) {
    showIf($(`#map-bg-${s}`), s === currentStyle)
  }
}

// ---- Style card click → choose theme ----
for (const style in styleButtons) {
  styleButtons[style].addEventListener('click', e => {
    e.preventDefault()
    chooseStyle(style)
    document.getSelection().removeAllRanges()
    setTimeout(() => document.getSelection().removeAllRanges(), 10)
  })
}

// ---- 3 non-overlapping SVG zones ----
$('#maparea-slogan').addEventListener('click', e => {
  e.preventDefault()
  toggleOne(currentStyle === 'full' ? 'slogan-big' : 'slogan-small')
})

$('#maparea-deco').addEventListener('click', e => {
  e.preventDefault()
  toggleOne(currentStyle === 'full' ? 'clover' : 'starframe')
})

$('#maparea-content').addEventListener('click', e => {
  e.preventDefault()
  toggleOne(currentStyle === 'full' ? 'characters' : 'buildings')
})

// ============================================================
// Event handlers
// ============================================================

const sendEvent = name => { window.umami && umami(name) }

let cropperInstance
uploadButton.addEventListener('click', () => { uploadEl.click() })
uploadEl.addEventListener('change', async () => {
  const file = uploadEl.files && uploadEl.files[0]
  if (!file) {
    uploadButton.disabled = false
    return
  }
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('请选择一张图片文件。')
    uploadEl.value = ''
    uploadButton.disabled = false
    return
  }
  // Validate file size (max 20MB)
  if (file.size > 20 * 1024 * 1024) {
    alert('图片文件过大，请选择小于 20MB 的图片。')
    uploadEl.value = ''
    uploadButton.disabled = false
    return
  }
  sendEvent('upload-done')
  uploadButton.disabled = true
  const avatarSrc = URL.createObjectURL(file)
  uploadEl.value = ''
  const img = new Image()
  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject('无法读取该图片文件')
      setTimeout(() => reject('加载超时，请检查网络或更换图片'), 3000)
      img.src = avatarSrc
    })
  } catch (e) {
    alert(`加载图片出错: ${e}`)
    console.error(e)
    URL.revokeObjectURL(avatarSrc)
    focusStep(0)
    uploadButton.disabled = false
    return
  }
  // Validate image dimensions
  if (img.width < 64 || img.height < 64) {
    alert('图片尺寸过小，请选择至少 64×64 的图片。')
    URL.revokeObjectURL(avatarSrc)
    focusStep(0)
    uploadButton.disabled = false
    return
  }
  hide(saveStatusEl)
  if (img.height != img.width) {
    cropImageEl.src = avatarSrc
    try {
      if (cropperInstance) {
        cropperInstance.replace(avatarSrc)
      } else {
        cropperInstance = new Cropper(cropImageEl, {
          aspectRatio: 1,
          viewMode: 3,
          autoCropArea: 1,
          rotatable: false,
          scalable: false,
          zoomable: false,
        })
      }
    } catch (e) {
      alert(`裁剪工具初始化失败: ${e}`)
      console.error(e)
      focusStep(0)
      uploadButton.disabled = false
      return
    }
    focusStep(1)
  } else {
    sendEvent('no-crop')
    styleBgs.forEach(i => i.src = avatarSrc)
    mapBgs.forEach(i => i.setAttribute('href', avatarSrc))
    focusStep(2)
    initToggles()
    chooseStyle('full')
  }
  uploadButton.disabled = false
})

cropButton.addEventListener('click', async () => {
  cropButton.disabled = true
  await new Promise(resolve => setTimeout(resolve, 60))
  try {
    if (!cropperInstance) {
      throw new Error('裁剪工具未初始化，请重新上传图片')
    }
    const canvas = cropperInstance.getCroppedCanvas({
      width: fgSize,
      height: fgSize,
    })
    if (!canvas) {
      throw new Error('裁剪失败，请重试')
    }
    const url = await exportCanvas(canvas)
    styleBgs.forEach(i => i.src = url)
    mapBgs.forEach(i => i.setAttribute('href', url))
    focusStep(2)
    initToggles()
    chooseStyle('full')
  } catch (e) {
    alert(`裁剪过程中出现错误: ${e}`)
    console.error(e)
  } finally {
    cropButton.disabled = false
  }
})

saveButton.addEventListener('click', async () => {
  let done = false
  setTimeout(() => {
    if (done) return
    show(saveStatusEl)
  }, 1000)
  const setStatus = status => saveStatusEl.innerText = status

  sendEvent(`save-${currentStyle}`)
  const activeKeys = LAYERS.filter(k => toggles[k])
  const togglesBitmap = LAYERS.map(x => toggles[x]).map(x => +x).join('')
  sendEvent(`save-toggle-${togglesBitmap}`)
  saveButton.disabled = true

  const fgImagePromise = id => new Promise((resolve, reject) => {
    const src = imageUrl(id)
    const existingImg = $(`img[src="${src}"]`)
    if (existingImg && existingImg.loaded) {
      return resolve(existingImg)
    }
    const img = new Image()
    img.setAttribute('crossorigin', 'anonymous')
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = reject
  })

  setStatus('正在擦拭黑板……')
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = fgSize
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = 'transparent'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, fgSize, fgSize)

  if (currentStyle === 'framed') {
    ctx.drawImage(styleBgs[0], 88, 87, 850, 850)
  } else {
    ctx.drawImage(styleBgs[0], 0, 0, fgSize, fgSize)
  }

  setStatus('正在寻找粉笔……')
  try {
    setStatus('正在绘制板报……')
    await Promise.resolve()
    for (const key of activeKeys) {
      const img = await fgImagePromise(key)
      ctx.drawImage(img, 0, 0, fgSize, fgSize)
    }
  } catch (e) {
    setStatus('网络错误')
    alert('无法下载蒙版图片，请检查您的互联网连接。')
    console.error(e)
    saveButton.disabled = false
    return
  }

  setStatus('正在拍照……')
  const resultUrl = await exportCanvas(canvas)
  resultImageEl.src = resultUrl

  focusStep(3)
  saveButton.disabled = false
  done = true
  setStatus('')
})

backButton.addEventListener('click', () => { focusStep(0) })
back1Button.addEventListener('click', () => { focusStep(0) })
back2Button.addEventListener('click', () => { focusStep(0) })

const ripples = [ ...document.querySelectorAll('[data-ripple]'), ...document.querySelectorAll('.mdc-button') ]
for (const el of ripples) mdc.ripple.MDCRipple.attachTo(el)

// load lazy-load images
let errorReported = false, imageLoaded = false
setTimeout(() => $$('.style__fg').forEach(img => {
  img.addEventListener('error', () => {
    if (!errorReported) {
      errorReported = true
      alert('无法加载图片，请刷新或更换网络环境重试。')
      sendEvent('image-error')
    }
  })
  img.addEventListener('load', () => {
    img.loaded = true
    imageLoaded = true
  })
  img.setAttribute('crossorigin', 'anonymous')
  img.src = img.getAttribute('data-src')
}), 100)
setTimeout(() => $$('.maplayer').forEach(img => {
  img.addEventListener('error', () => {
    if (!errorReported) {
      errorReported = true
      alert('无法加载图片，请刷新或更换网络环境重试。')
      sendEvent('image-error')
    }
  })
  img.setAttribute('crossorigin', 'anonymous')
  img.setAttribute('href', img.getAttribute('data-href'))
}), 100)
setTimeout(() => {
  if (!imageLoaded) sendEvent('image-slow')
}, 3000)
setTimeout(() => {
  if (!imageLoaded) sendEvent('image-timeout')
}, 6000)
