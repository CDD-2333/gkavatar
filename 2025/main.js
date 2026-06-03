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
// const imageUrl = id => `https://keeer-pub.oss-cn-beijing.aliyuncs.com/rdfzgkavt/2024/${id}.webp`
const imageUrl = id => `cover/${id}.webp`
// const imageUrl = id => `export/${id}.png`
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

for (const style in styleButtons) {
  styleButtons[style].addEventListener('click', e => {
    e.preventDefault()
    chooseStyle(style)
    document.getSelection().removeAllRanges()
    setTimeout(() => document.getSelection().removeAllRanges(), 10)
  })
}

const currentStyleClass = 'style__current'
let currentStyle
const chooseStyle = i => {
  currentStyle = i
  for (const j in styleButtons) {
    styleButtons[j].classList[i === j ? 'add' : 'remove'](currentStyleClass)
  }
  // FIXME: hack
  if (i === 'framed' && !toggles['1']) {
    toggleKey('1')
  }
  updateFrame()
}
const toggleDefaults = {
  '1': true,
  '2-left': true,
  '2-right': false,
  '3-left': true,
  '3-right': true,
  '4': true,
}
const toggles = { ...toggleDefaults }
const initToggles = () => {
  for (const k in toggles) {
    if (toggles[k] != toggleDefaults[k]) toggleKey(k)
  }
}
const getVariant = () => toggles[4] ? 'open' : 'closed'
const updateToggle = (target, checked, setState = true) => {
  if (setState) toggles[target] = checked
  $(`#maplayer-${target}`).classList[checked ? 'remove' : 'add']('disabled')
  for (const el of $$(`.cover-${target}`)) showIf(el, checked)
}
const reverseDirection = x => x.replace(/left|right/, x => x === 'left' ? 'right' : 'left')
const toggleKey = key => {
  const current = !toggles[key]
  if (key === '1') {
    if (currentStyle === 'framed' && !current) return
    toggles[key] = current
    for (const i of [ 'open', 'closed' ]) {
      for (const j of [ 'full', 'framed' ]) {
        updateToggle(`1-${i}-${j}`, current, false)
      }
    }
    updateFrame()
  } else {
    updateToggle(key, !toggles[key])
  }
  if (key[0] === '2' && current) {
    const rkey = reverseDirection(key)
    updateToggle(rkey, false)
    const figureKey = key.replace('2', '3')
    if (!toggles[figureKey]) {
      updateToggle(figureKey, true)
    }
  }
  if (key[0] === '3' && !current) {
    const bubbleKey = key.replace('3', '2')
    if (toggles[bubbleKey]) {
      updateToggle(bubbleKey, false)
      const rkey = reverseDirection(key)
      if (toggles[rkey]) {
        const rBubbleKey = reverseDirection(bubbleKey)
        updateToggle(rBubbleKey, true)
      }
    }
  }
  if (key === '4') {
    updateFrame()
  }
}
for (const key in toggles) {
  $(`#maparea-${key}`).addEventListener('click', e => {
    e.preventDefault()
    toggleKey(key)
  })
}
const frameEls = {}
for (const style in styleButtons) {
  const map = frameEls[style] = {}
  for (const variant of [ 'open', 'closed' ]) {
    map[variant] = {
      cover: $(`.cover-1-${variant}-${style}`),
      map: $(`#maplayer-1-${variant}-${style}`),
    }
  }
}
const updateFrame = () => {
  const currentVariant = getVariant()
  for (const style in styleButtons) {
    showIf($(`#map-bg-${style}`), style === currentStyle)
    for (const variant of [ 'open', 'closed' ]) {
      const shouldShowMap = style === currentStyle && (variant === currentVariant || variant === 'open')
      frameEls[style][variant].map.classList[shouldShowMap ? 'remove' : 'add']('transparent')
      showIf(frameEls[style][variant].cover, variant === currentVariant && (toggles['1'] || style === 'framed'))
    }
  }
}

const sendEvent = name => { window.umami && umami(name) }

let cropperInstance
uploadButton.addEventListener('click', () => { uploadEl.click() })
uploadEl.addEventListener('change', async () => {
  sendEvent('upload-done')
  uploadButton.disabled = true
  const avatarSrc = URL.createObjectURL(uploadEl.files[0])
  uploadEl.value = ''
  const img = new Image()
  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      setTimeout(() => reject('超时'), 1000)
      img.src = avatarSrc
    })
  } catch (e) {
    alert(`加载图片出错: ${e}`)
    console.error(e)
    focusStep(0)
    uploadButton.disabled = false
    return
  }
  hide(saveStatusEl)
  if (img.height != img.width) {
    cropImageEl.src = avatarSrc
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
    const canvas = cropperInstance.getCroppedCanvas({
      width: fgSize,
      height: fgSize,
    })
    const url = await exportCanvas(canvas)
    styleBgs.forEach(i => i.src = url)
    mapBgs.forEach(i => i.setAttribute('href', url))
    focusStep(2)
    initToggles()
    chooseStyle('full')
  } catch (e) {
    alert(`裁剪过程中出现错误: ${e}`)
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
  const toggleKeys = [
    '1',
    '2-left',
    '2-right',
    '3-left',
    '3-right',
    '4',
  ]
  const togglesBitmap = toggleKeys.map(x => toggles[x]).map(x => +x).join('')
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
  const layers = toggleKeys.map(k => {
    if (!toggles[k]) return null
    if (k === '1') return `1-${getVariant()}-${currentStyle}`
    return k
  }).filter(x => x !== null)
  const imagePromises = Promise.all(layers.map(fgImagePromise))

  setStatus('正在擦拭黑板……')
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = fgSize
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = 'transparent'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, fgSize, fgSize)

  // FIXME: hack
  if (currentStyle === 'framed') {
    ctx.drawImage(styleBgs[0], 88, 87, 850, 850)
  } else {
    ctx.drawImage(styleBgs[0], 0, 0, fgSize, fgSize)
  }

  setStatus('正在寻找粉笔……')
  try {
    const fgImages = await imagePromises
    setStatus('正在绘制板报……')
    // next tick
    await Promise.resolve()
    for (const image of fgImages) {
      ctx.drawImage(image, 0, 0, fgSize, fgSize)
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
