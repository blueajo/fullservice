// Drupal.behaviors = {};

// =====================================================================================================================================
// START UP
// =====================================================================================================================================

let mobile = false;
let scrollInterval = null;

// Load page on start
document.addEventListener("DOMContentLoaded", (event) => {
  var meta = document.querySelector('meta[name=viewport]');
  if (meta) {
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no');
  }

  if (screen.width <= 768) {
    mobile = true;

    window.addEventListener('hashchange', forceSafariRepaint);
    window.addEventListener('scroll', forceSafariRepaint);
    window.addEventListener('orientationchange', forceSafariRepaint);

    // Check if mobile video exists before adding listeners
    const mobileVideo = document.querySelector('#mobile-video');
    if (mobileVideo) {
      // Play as soon as the lazy loader has loaded the video
      mobileVideo.addEventListener('loadeddata', () => {
        mobileVideo.play().catch(err => {
          mobileVideo.addEventListener("canplay", () => {
            mobileVideo.play();
          });
        });
      });
      index.addEventListener('touchstart', () => {
        mobileVideo.play().catch(err => {
          mobileVideo.addEventListener("canplay", () => {
            mobileVideo.play();
          });
        });
      })
    } else {
      console.warn('Mobile video not found in DOM');
    }

    syncCaptionWidth();
    showDisclaimer();

    openPage('index');
    if (location.hash) {
      history.pushState("", document.title, window.location.pathname);
    }
    scrollInterval = setInterval(scrollHandler, 1000 / 30);
    setTimeout(setupProductionObserver, 500);
  } else {
    document.addEventListener('mousemove', (event) => {
      document.querySelector('#cursor').classList.add('visible');
      document.querySelector('#index-cursor').classList.add('visible');
    }, { once: true });
    setupHomepageVideos();
    if (location.hash) {
      openPage(location.hash.substring(1));
    } else {
      openPage('index');
    }
  }
  document.getElementById('container').style.opacity = 1;
});

window.addEventListener('hashchange', function () {
  const section = window.location.hash ? window.location.hash.substring(1) : 'index';
  closePage();
  openPage(section);
});

// =====================================================================================================================================
// GLOBAL VARIABLES
// =====================================================================================================================================

const index = document.getElementById('index-page');
const production = document.getElementById('production-page');
const serviceProviders = document.getElementById('service-providers-page');
const pitches = document.getElementById('pitches-page');
const info = document.getElementById('info-page');
const rootFontSize = 10;

function remToPx(remValue) {
  return remValue * rootFontSize;
}

// =====================================================================================================================================
// CUSTOM CURSORS
// =====================================================================================================================================

// Index cursor objects
const videoDot = document.getElementById('index-cursor');
const allVideos = videoDot.querySelectorAll(".lazy-video-container");
let activeLink = null;
const quadrants = [['production', 'service-providers'],
['pitches', 'info']];
const divisions = [[0, 0], [0, 0]];
let cursorInterval = null;
// Cursor object
var mouseX = (window.innerWidth - remToPx(45)) / 2,
  mouseY = (window.innerHeight - remToPx(45)) / 2;

function setupHomepageVideos() {
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      divisions[i][j] = document.querySelectorAll('.' + quadrants[i][j] + '-video-container').length;
    }
  }
}

var indexCursor = {
  el: document.getElementById('index-cursor'),
  x: mouseX,
  y: mouseY,
  quadrant: [0, 0],
  curVideo: null,
  curContainer: null,
  update: async function () {

    const toolbar = document.querySelector('.toolbar-fixed');
    const toolbarHeight = toolbar ? parseInt(toolbar.style.paddingTop.slice(0, -2), 10) : 0;
    const header = document.querySelector('#header');
    const headerHeight = header ? header.offsetHeight : 0;

    // LOCATION OF FOLLOWER
    this.x = lerp(this.x, mouseX, 0.04);
    this.y = lerp(this.y, mouseY - toolbarHeight - headerHeight, 0.04);

    // SET VIDEO
    this.quadrant[0] = (this.x / window.innerWidth) > .5 ? 1 : 0;
    this.quadrant[1] = (this.y / window.innerHeight) > .5 ? 1 : 0;
    const category = quadrants[this.quadrant[0]][this.quadrant[1]];
    const tempWidth = window.innerWidth / 2;
    const tempX = (this.x % tempWidth);
    const videoNumber = Math.floor(tempX / tempWidth * divisions[this.quadrant[0]][this.quadrant[1]]);
    const videoContainer = document.getElementById(category + '-' + videoNumber + '-video-container');
    const video = videoContainer ? videoContainer.querySelector('video') : null;

    if (this.curContainer != videoContainer) {

      if (this.curContainer && this.curContainer.classList.contains("active")) {
        this.curContainer.classList.remove("active");
        this.curVideo.pause();
      }

      if (videoContainer && !videoContainer.classList.contains("active")) {
        videoContainer.classList.add("active");
        video.play().catch(err => {
          video.addEventListener("canplay", () => {
            video.play();
          });
        });
      }
    }

    this.curVideo = video;
    this.curContainer = videoContainer;
    this.el.style = 'transform: translate3d(' + this.x + 'px,' + this.y + 'px, 0);';
  }
};


function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

// Info cursor objects
const copyright = document.getElementById('info-cursor');
const infoLinks = document.querySelectorAll('#info-page a, #footer a');

var infoCursor = {
  el: copyright,
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  update: function () {
    const toolbar = document.querySelector('.toolbar-fixed');
    const toolbarHeight = toolbar ? parseInt(toolbar.style.paddingTop.slice(0, -2), 10) : 0;

    this.x = mouseX;
    this.y = mouseY - toolbarHeight;
    this.el.style = 'transform: translate3d(' + this.x + 'px,' + this.y + 'px, 0);';
  }
};

function indexFollow() {
  indexCursor.update();
}

function infoFollow() {
  infoCursor.update();
}

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  animatedCursor.update();
});

info.addEventListener("mousedown", (e) => {
  copyright.classList.remove('visible');
});

info.addEventListener("mouseup", (e) => {
  copyright.classList.add('visible');
});

for (let i = 0; i < infoLinks.length; i++) {
  const link = infoLinks[i];
  link.addEventListener('mouseenter', () => {
    copyright.classList.remove('visible');
  });
  link.addEventListener('mouseout', () => {
    copyright.classList.add('visible');
  });
}

// ========================
// dot cursor
// ========================
// Animated cursor objects
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
const cursorIcon = document.getElementById('cursor-icon');

const animatedCursor = {
  el: cursor,
  dot: cursorDot,
  icon: cursorIcon,
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  state: 'default',
  update: function () {
    this.x = mouseX;
    this.y = mouseY;
    this.el.style.left = this.x + 'px';
    this.el.style.top = this.y + 'px';
  },
  setState: function (newState) {
    if (this.state === newState) return;

    // Remove all state classes
    this.dot.classList.remove('default', 'link', 'plus', 'minus', 'hidden');

    // Add new state class
    this.dot.classList.add(newState);
    this.state = newState;

  }
};

var pointerDown = false;

// Cursor state management
document.addEventListener('mouseover', (e) => {
  const link = e.target.closest('a');
  let product = e.target.closest('.product img');
  if (!product) product = e.target.closest('.product video');
  const arrowLeft = e.target.closest('#left-arrow-area');
  const arrowRight = e.target.closest('#right-arrow-area');
  const pitch = e.target.closest('.checkbox-container');
  const button = e.target.closest('#send-form');
  const header = e.target.closest('#header');
  const section = document.querySelector('.page:not(.inactive)').id.slice(0, -5);
  const editable = e.target.closest('input, #message');

  if (animatedCursor.dot.classList.contains('clicking')) return;

  if (link || pitch || button) {
    animatedCursor.setState('link');
  } else if (product) {
    const action = product.closest('.product').classList.contains('open') ? 'minus' : 'plus';
    animatedCursor.setState(action);
  } else if (link || pitch || button) {
    animatedCursor.setState('link');
  } else if (arrowLeft || arrowRight || editable || section === 'info') {
    if (section === 'info' && header) {
      animatedCursor.setState('default');
      copyright.classList.remove('visible');
    } else {
      animatedCursor.setState('hidden');
      copyright.classList.add('visible');
    }
  } else {
    animatedCursor.setState('default');
  }
});

document.addEventListener('pointerdown', (e) => {
  animatedCursor.dot.classList.add('clicking');
  if (document.querySelector('.page:not(.inactive)').id.slice(0, -5) === 'info') {
    animatedCursor.setState('default');
  }
});

document.addEventListener('pointerup', (e) => {
  animatedCursor.dot.classList.remove('clicking');
  if (document.querySelector('.page:not(.inactive)').id.slice(0, -5) === 'info') {
    animatedCursor.setState('hidden');
  }
});

// Initialize cursor
animatedCursor.update();

window.addEventListener('mouseout', (e) => {
  if (!e.relatedTarget && !e.toElement) {
    animatedCursor.setState('hidden');
  }
});

// =====================================================================================================================================
// NAV
// =====================================================================================================================================

const pageLinks = document.getElementsByClassName('page-link');
const linkAreas = document.getElementsByClassName('link-area');

// Page selection
function closePage() {
  const section = document.querySelector('.page:not(.inactive)').id.slice(0, -5);
  const currentPage = document.getElementById(section + '-page');
  if (currentPage) { currentPage.classList.toggle('inactive'); }
  closeHeader(section);

  if (cursorInterval) {
    clearInterval(cursorInterval);
    cursorInterval = null;
  }

  if (section == 'index') {
    videoDot.classList.remove('active');
    document.getElementById('header').classList.remove('index-header');
  } else if (section == 'production') {
    if (ProductionCarousel.initialized()) {
      ProductionCarousel.deinitialize();
    }
    const productionVideos = production.querySelectorAll('video');
    for (let i = 0; i < productionVideos.length; i++) {
      productionVideos[i].pause();
    }
  } else if (section == 'pitches') {
    if (!mobile) {
      contactForm.style.opacity = "0";
      contactForm.style.display = "none";
      pitches.classList.remove('expanded');
      resetPitches();
    }
  } else if (section == 'info') {
    copyright.classList.remove('active');
  }
}

function openPage(section) {
  const page = document.getElementById(section + '-page');
  if (page) { page.classList.remove('inactive'); }
  expandHeader(section);
  // page-specific
  if (section == 'index') {
    document.getElementById('header').classList.add('index-header');
    if (!mobile) {
      cursorInterval = setInterval(indexFollow, 1000 / 60);
    } else {
      document.querySelector('#mobile-video').play();
      production.style.opacity = 0;
    }
    videoDot.classList.add('active');
  }
  if (mobile) {
    if (section == 'info' || section == 'service-providers') {
      document.getElementById('header').style.position = 'fixed';
      document.getElementById('header').style.top = '2.5rem';
    } else {
      document.getElementById('header').style.position = 'sticky';
      document.getElementById('header').style.top = '3.5rem';
    }
  }
  if (section == 'info' && !mobile) {
    copyright.classList.remove('visible');
    cursorInterval = setInterval(infoFollow, 1000 / 60);
  }
  if (section == 'production' && !mobile) {
      ProductionCarousel.init();
  }
}

function closeHeader(section) {
  const pageLink = document.getElementById(section + '-link');
  const pageText = document.getElementById(section + '-text');
  const pageGap = document.getElementById(section + '-gap');
  if (pageLink) { pageLink.classList.remove('current-page'); }
  if (pageText && section == 'index') {
    pageText.style.opacity = 0;
    videoCredits.style.opacity = 0;
    setTimeout(() => {
      pageText.classList.remove('active');
      videoCredits.classList.remove('active');
    }, 500);
  } else {
    pageText.classList.remove('active');
  }
  if (pageGap) { pageGap.classList.remove('gap'); }
}

function expandHeader(section) {
  const pageLink = document.getElementById(section + '-link');
  const pageText = document.getElementById(section + '-text');
  const pageGap = document.getElementById(section + '-gap');
  if (pageLink) { pageLink.classList.add('current-page'); }
  if (pageText) {
    pageText.classList.add('active');
    if (section == 'index' && !mobile) {
      videoCredits.classList.add('active');
      setTimeout(() => {
        pageText.style.opacity = 1;
        videoCredits.style.opacity = 1;
      }, 10);
    }
  }
  if (pageGap) { pageGap.classList.add('gap'); }
}

// Open page on click
for (let i = 0; i < pageLinks.length; i++) {
  const pageLink = pageLinks[i];
  pageLink.addEventListener('click', () => {
    const section = pageLink.id.slice(0, -5);
    // set anchor link
    if (section == 'index') {
      history.pushState("", document.title, window.location.pathname);
      closePage();
      openPage(section);
    } else {
      location.hash = section;
    }
    if (mobile) {
      scrollAnimations = false;
      window.addEventListener("scrollend", (event) => {
        scrollAnimations = true;
      }, {once: true});
      const scrollCoord = document.getElementById(section + '-page').offsetTop - remToPx(6);
      window.scrollTo({
        top: scrollCoord,
        left: 0,
        behavior: 'smooth'
      });
    }
  });
}

// =====================================================================================================================================
// INDEX
// =====================================================================================================================================

const videoCredits = document.getElementById('video-credits');
const indexLink = document.querySelector('#footer p');

videoCredits.addEventListener('mouseenter', () => {
  document.getElementById('index-cursor').classList.remove('visible');
  if (window.innerWidth > 900) {
    indexLink.style.opacity = 1;
  } else {
    indexLink.style.opacity = 0;
  }
});

videoCredits.addEventListener('mouseleave', () => {
  indexLink.style.opacity = 1;
  document.getElementById('index-cursor').classList.add('visible');
});

index.addEventListener('mouseenter', () => {
  document.getElementById('index-cursor').classList.add('visible');
});

index.addEventListener('mouseleave', () => {
  document.getElementById('index-cursor').classList.remove('visible');
  if (activeLink) {
    activeLink.classList.remove('active-link');
    activeLink = null;
  }
});

// Link areas on index page
for (let i = 0; i < linkAreas.length; i++) {
  const linkArea = linkAreas[i];
  const category = linkArea.id.slice(0, -5);
  linkArea.addEventListener('mouseenter', () => {
    const hoverLink = document.getElementById(category + "-link");
    if (hoverLink != activeLink) {
      if (activeLink) {
        activeLink.classList.remove('active-link');
      }
      hoverLink.classList.add('active-link');
      activeLink = hoverLink;
    }
  });

  linkArea.addEventListener('click', () => {
    const linkArea = linkAreas[i];
    const category = linkArea.id.slice(0, -5);
    const hoverLink = document.getElementById(category + "-link");
    if (hoverLink) {
      hoverLink.click();
    }
  });
}

function playMobileVideoOnInteraction(videoSelector) {
  const video = document.querySelector(videoSelector);
  if (!video) return;

  function tryPlay() {
    video.play()
      .catch(err => console.warn('Mobile autoplay failed:', err));

    // Remove the listener after first interaction
    document.removeEventListener('click', tryPlay);
    document.removeEventListener('touchstart', tryPlay);
  }

  // Listen for user interaction
  document.addEventListener('click', tryPlay, { once: true });
  document.addEventListener('touchstart', tryPlay, { once: true });
}

function showDisclaimer() {
  const disclaimer = document.querySelector('#mobile-disclaimer');
  if (!disclaimer) return;

  function toggleDisclaimer() {
    if (disclaimer.classList.contains('visible')) {
      disclaimer.classList.remove('visible');
    } else {
      disclaimer.classList.add('visible');
    }
  }

  document.querySelector('#mobile-video-container').addEventListener('touchstart', toggleDisclaimer);
}

// =====================================================================================================================================
// PRODUCTION
// =====================================================================================================================================

function scaleMedia(media, w, h, container) {
  let heightRatio = null;
  let widthRatio = null;
  if (mobile) {
    heightRatio = (window.innerHeight * 0.5) / h;
    widthRatio = (window.innerWidth - remToPx(4)) / w;
  } else if (window.innerWidth > remToPx(100)) {
    heightRatio = (window.innerHeight * 0.7) / h;
    widthRatio = (0.8 * window.innerWidth) / w;
  } else {
    heightRatio = (window.innerHeight - remToPx(18)) / h;
    widthRatio = (0.8 * window.innerWidth) / w;
  }
  const scaleRatio = Math.min(heightRatio, widthRatio);

  if (container) {
    // For videos, scale the container
    container.style.width = `${w * scaleRatio}px`;
    const caption = container.parentElement.querySelector('p');
    if (caption) caption.style.width = `${w * scaleRatio}px`;
  } else {
    // For images, scale directly
    media.style.width = `${w * scaleRatio}px`;
    const caption = media.parentElement.querySelector('p');
    if (caption) caption.style.width = `${w * scaleRatio}px`;
  }
}

const videoListeners = new WeakMap();

function safePlayVideo(video, container = null) {
  if (!video) return;

  // Remove any previous listener for this video
  const prevListener = videoListeners.get(video);
  if (prevListener) {
    video.removeEventListener('canplay', prevListener);
  }

  const addPlayingClass = () => {
    if (container) {
      container.classList.add('video-playing');
      container.classList.add('video-ready');
    }
  };

  const onCanPlay = () => {
    video.play()
      .then(addPlayingClass)
      .catch(() => { });
    video.removeEventListener('canplay', onCanPlay);
    videoListeners.delete(video);
  };

  video.play()
    .then(addPlayingClass)
    .catch(() => {
      video.addEventListener('canplay', onCanPlay);
      videoListeners.set(video, onCanPlay);
    });
}

// Pause function that works for any video
function pauseVideo(video, container = null) {
  if (!video) return;

  const listener = videoListeners.get(video);
  if (listener) {
    video.removeEventListener('canplay', listener);
    videoListeners.delete(video);
  }

  video.pause();
  if (container) container.classList.remove('video-playing');
}

// =======================
// Production Carousel
// =======================
const ProductionCarousel = (() => {
  const state = {
    flkty: null,
    currOpenProduct: null,
    pauseScroll: false,
    scrollMomentum: 0,
    scrollDelta: 0,
    ticking: false,
    isHoveringCarousel: false,
    scrollTimeout: null,
    disableNextAnimation: false
  };

  let viewport = null;
  const leftArrow = document.getElementById("left-arrow-area");
  const rightArrow = document.getElementById("right-arrow-area");
  const centerArea = document.getElementById("center-area");

  // =======================
  // Utility Functions
  // =======================
  const remToPx = rem => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const temporarilyPauseScroll = (duration = 600) => {
    state.pauseScroll = true;
    setTimeout(() => { state.pauseScroll = false; }, duration);
  };

  function syncSelectedIndex() {
    let nearestIndex = state.flkty.cells.reduce((closest, cell, i) => {
      const distance = Math.abs(cell.target + state.flkty.x);
      return distance < closest.dist ? { index: i, dist: distance } : closest;
    }, { index: 0, dist: Infinity }).index;

    state.flkty.select(nearestIndex, false, true); // no animate
  }

  // =======================
  // Carousel Initialization
  // =======================
  function createCarousel() {
    if (state.flkty) state.flkty.destroy();

    state.flkty = new Flickity(production, {
      cellAlign: "center",
      wrapAround: true,
      pageDots: false,
      setGallerySize: false,
      accessibility: true,
      prevNextButtons: false,
      cellSelector: ".product",
      freeScroll: true,
      lazyLoad: true,
      contain: false,
      percentPosition: false,
      initialIndex: 0,
      selectedAttraction: 0.06,
      friction: 0.4
    });

    viewport = document.querySelector(".flickity-viewport");

    state.flkty.on("staticClick", (event, pointer, cellElement, cellIndex) => {
      if (!cellElement) return;
      if (cellElement === state.currOpenProduct) {
        closeProduct();
      } else {
        openProduct(cellElement, cellIndex);
        animatedCursor.setState('minus');
      }
    });

    setTimeout(() => {
      openProduct(state.flkty.cells[0].element, 0);
      production.classList.add('flickity-ready');
    }, 200);
  }

  function initialized() { return !(state.flkty == null); }
  function deinitialize() {
    if (state.flkty) {
      closeProduct();
      state.flkty.destroy();
      production.classList.remove('flickity-ready');
    }
    state.flkty = null;
  }
  function getCurrentProduct() { return state.currOpenProduct; }

  // =======================
  // Product Controls
  // =======================
  function openProduct(cellElement, cellIndex) {
    temporarilyPauseScroll(750);
    if (!state.currOpenProduct && state.ticking) cancelScroll();

    if (state.currOpenProduct !== cellElement) {
      closeProduct();

      cellElement.classList.add("open");

      let productMedia = cellElement.querySelector("img.lazy-image, img.lazy-loaded, .lazy-video-container video");
      let productCaption = cellElement.querySelector("p");

      if (productMedia && productMedia.tagName === 'VIDEO') {
        const videoContainer = productMedia.closest('.lazy-video-container');
        productMedia.currentTime = 0;
        if (videoContainer.classList.contains('video-ready')) {
          productMedia.play(); // Lazy loader handles thumbnail hiding
        }
        videoContainer.classList.add('video-playing');
        const poster = videoContainer.querySelector('img.video-thumbnail');
        // Get dimensions from poster image
        let w = poster.naturalWidth;
        let h = poster.naturalHeight;
        scaleMedia(productMedia, w, h, videoContainer);
        productCaption.style.width = w;
      } else if (productMedia && productMedia.tagName === 'IMG') {
        let w = productMedia.naturalWidth;
        let h = productMedia.naturalHeight;
        scaleMedia(productMedia, w, h);
        productCaption.style.width = w;
      }

      state.flkty.reposition();
      const animate = !state.disableNextAnimation;
      state.flkty.selectCell(cellIndex, true, !animate);

      state.currOpenProduct = cellElement;
      state.flkty.options.dragThreshold = 10000;
      state.flkty.updateDraggable();

      leftArrow.classList.add("expanded");
      rightArrow.classList.add("expanded");
    }

    state.disableNextAnimation = false;
  }

  function closeProduct() {
    if (!state.currOpenProduct) return;

    const product = state.currOpenProduct;
    product.classList.remove("open");

    const productMedia = product.querySelector("img.lazy-image, img.lazy-loaded, .lazy-video-container video");
    const videoContainer = product.querySelector('.lazy-video-container');

    if (productMedia && productMedia.tagName === 'VIDEO') {
      productMedia.pause();
      videoContainer.classList.remove('video-playing');
      videoContainer.style.width = "15vw";
    } else if (productMedia && productMedia.tagName === 'IMG') {
      productMedia.style.width = "15vw";
    }

    state.flkty.reposition();
    state.currOpenProduct = null;

    leftArrow.classList.remove("expanded");
    rightArrow.classList.remove("expanded");

    state.flkty.options.dragThreshold = 3;
    state.flkty.updateDraggable();

    const el = document.elementFromPoint(mouseX, mouseY);
    const arrowLeft = el.closest('#left-arrow-area');
    const arrowRight = el.closest('#right-arrow-area');
    let productHovered = el.closest('.product img');
    if (!productHovered) productHovered = el.closest('.product video');

    if (productHovered) {
      animatedCursor.setState('plus');
    } else if (arrowLeft || arrowRight) {
      animatedCursor.setState('hidden');
    } else {
      animatedCursor.setState('default');
    }
  }

  // =======================
  // Arrow Controls
  // =======================

  let arrowMomentumRaf = null;
  let arrowVelocity = 0;
  const ARROW_FRICTION = 0.85;
  const ARROW_MIN_VELOCITY = 0.4;

  function startArrowMomentum() {
    if (arrowMomentumRaf) cancelAnimationFrame(arrowMomentumRaf);

    function step() {
      arrowVelocity *= ARROW_FRICTION;

      if (Math.abs(arrowVelocity) < ARROW_MIN_VELOCITY) {
        arrowMomentumRaf = null;
        return;
      }

      state.flkty.x += arrowVelocity;
      state.flkty.dragX = state.flkty.x;
      state.flkty.positionSlider();

      arrowMomentumRaf = requestAnimationFrame(step);
    }

    arrowMomentumRaf = requestAnimationFrame(step);
  }

  function handleArrowPress(dir) {
    if (state.currOpenProduct) {
      syncSelectedIndex();
      let index = (state.flkty.selectedIndex + dir + state.flkty.cells.length) % state.flkty.cells.length;
      openProduct(state.flkty.cells[index].element, index);
    } else {
      // 1. Apply the immediate 80vw jump
      const jump = window.innerWidth * 0.4 * dir * -1;
      state.flkty.x += jump;
      state.flkty.dragX = state.flkty.x;
      state.flkty.positionSlider();

      // 2. Set the initial momentum velocity
      arrowVelocity = jump * 0.15;

      // 3. Start the coast animation
      startArrowMomentum();

      state.disableNextAnimation = true;
    }

    temporarilyDisablePointer();
  }

  function temporarilyDisablePointer() {
    viewport.style.zIndex = "-1";
    production.addEventListener("mousemove", () => (viewport.style.zIndex = "1"), { once: true });
  }

  // =======================
  // Scroll Handling
  // =======================

  function isTrackpadEvent(e) {
    if (e.wheelDeltaY !== undefined) return e.wheelDeltaY !== e.deltaY * -3;
    return e.deltaMode === 0;
  }

  let lastWheelTime = 0;
  const THROTTLE = 30; // ~60fps
  let swipeActive = false;
  let peakDelta = 0;
  let swipeDirection = 0;
  let lastWheelTs = 0;
  let lastSwipeEnd = 0;

  const MIN_GESTURE_GAP = 120;
  const MIN_DROP = 10;

  function handleWheel(e) {
    if (!state.isHoveringCarousel || state.pauseScroll) return;
    e.preventDefault();

    // throttle: skip frames if updates are too frequent
    const now = performance.now();
    if (now - lastWheelTime < THROTTLE) return;
    lastWheelTime = now;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 15;
    if (e.deltaMode === 2) delta *= 60;
    delta *= 2;
    delta = -delta;

    if (state.currOpenProduct) {
      const now = performance.now();
      const absDelta = Math.abs(delta);
      const direction = Math.sign(delta);

      const timeSinceLast = now - lastWheelTs;
      lastWheelTs = now;

      // Start new gesture
      if (!swipeActive && now - lastSwipeEnd > MIN_GESTURE_GAP) {
        swipeActive = true;
        peakDelta = absDelta;
        swipeDirection = direction;
        return;
      }

      if (!swipeActive) return;

      // Track peak
      if (absDelta > peakDelta) {
        peakDelta = absDelta;
        swipeDirection = direction;
        return;
      }

      // End-of-gesture: delta dropped by MIN_DROP
      if (peakDelta - absDelta >= MIN_DROP) {
        swipeActive = false;
        lastSwipeEnd = now;

        const nextIndex =
          (state.flkty.selectedIndex + swipeDirection + state.flkty.cells.length) %
          state.flkty.cells.length;

        openProduct(state.flkty.cells[nextIndex].element, nextIndex);
      }

      return;
    }

    // Free scroll → move carousel instantly
    state.flkty.x -= delta;
    state.flkty.dragX = state.flkty.x;
    state.flkty.positionSlider();

    // Next product open should not animate
    state.disableNextAnimation = true;
  }

  // =======================
  // Public API
  // =======================
  return {
    init() {
      createCarousel();
    },
    openProduct,
    closeProduct,
    initialized,
    deinitialize,
    getCurrentProduct,
    getFlickity: () => state.flkty,
    handleArrowPress,
    handleWheel,
    setHovering: (val) => { state.isHoveringCarousel = val; }
  };
})();

// =======================
// Set up event listeners ONCE on page load
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const leftArrow = document.getElementById("left-arrow-area");
  const rightArrow = document.getElementById("right-arrow-area");
  const centerArea = document.getElementById("center-area");
  const production = document.getElementById('production-page');

  if (!leftArrow || !rightArrow || !centerArea || !production) return;

  // Arrow clicks
  leftArrow.addEventListener("click", () => {
    if (ProductionCarousel.initialized()) {
      ProductionCarousel.handleArrowPress(-1);
    }
  });

  rightArrow.addEventListener("click", () => {
    if (ProductionCarousel.initialized()) {
      ProductionCarousel.handleArrowPress(1);
    }
  });

  centerArea.addEventListener("click", () => {
    if (ProductionCarousel.initialized()) {
      ProductionCarousel.closeProduct();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (event) => {
    if (!ProductionCarousel.initialized()) return;
    const section = document.querySelector('.page:not(.inactive)')?.id.slice(0, -5);
    if (section === 'production') {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        ProductionCarousel.handleArrowPress(-1);
      }
      else if (event.key === 'ArrowRight') {
        event.preventDefault();
        ProductionCarousel.handleArrowPress(1);
      }
    }
  });

  // Scroll handling
  production.addEventListener("mouseenter", () => ProductionCarousel.setHovering(true));
  production.addEventListener("mouseleave", () => ProductionCarousel.setHovering(false));

  window.addEventListener("wheel", (e) => {
    if (!ProductionCarousel.initialized()) return;
    ProductionCarousel.handleWheel(e);
  }, { passive: false });
});


// =====================================================================================================================================
// SERVICE PROVIDERS
// =====================================================================================================================================

// const serviceProvider = document.querySelectorAll(".service-provider");
// const serviceProviderPortraits = document.querySelectorAll(".portrait");

// for (let i = 0; i < serviceProvider.length; i++) {
//   serviceProvider[i].addEventListener('mouseenter', () => {
//     serviceProviderPortraits[i].classList.add('visible');
//   });
//   serviceProvider[i].addEventListener('mouseleave', () => {
//     serviceProviderPortraits[i].classList.remove('visible');
//   });
// }

// =====================================================================================================================================
// PITCHES
// =====================================================================================================================================

const pitchList = document.querySelectorAll(".checkbox-container");
const pitchesToSend = document.querySelector("#pitches-to-send");
let checkedCount = 0;
const contactForm = document.querySelector("#contact-form");
const message = document.getElementById('message');
const messagePlaceholder = message.innerHTML;
let messageEdited = false;

for (let i = 0; i < pitchList.length; i++) {
  const pitch = pitchList[i];
  const pitchContent = pitch.querySelector(".checkbox-label").innerHTML;
  pitch.addEventListener('click', () => {
    if (pitch.classList.contains('checked')) {
      checkedCount--;
      pitch.classList.remove('checked');
      if (checkedCount == 0) {
        fadeOutForm();
      } else {
        const pitchToRemove = document.querySelector("#pitch" + i);
        pitchToRemove.remove();
      }
    } else {
      if (checkedCount < 5) {
        pitch.classList.add('checked');
        checkedCount++;
        pitchesToSend.innerHTML +=
          '<div id=pitch' + i + ' class="dot-container">' +
          '<span class="dot"></span>' +
          '<p>' + pitchContent + '</p>' +
          '</div>';
        if (!pitches.classList.contains('expanded')) {
          fadeInForm();
        }
      } else {
        alertMessage('Select up to 5 pitches.');
      }
    }
  });
}

function fadeInForm() {
  contactForm.style.display = "flex";
  pitches.classList.add('expanded');
  requestAnimationFrame(() => {
    contactForm.style.opacity = "1";
  });
}

function fadeOutForm() {
  contactForm.style.opacity = "0";
  if (mobile) serviceProviders.style.opacity = "0";
  contactForm.addEventListener("transitionend", () => {
    contactForm.style.display = "none";
    pitches.classList.remove('expanded');
    if (mobile) serviceProviders.style.opacity = "1";
    resetPitches();
  }, { once: true });
}

function resetPitches() {
  checkedCount = 0;
  pitchesToSend.innerHTML = '';
  document.getElementById('from').value = '';
  document.getElementById('subject').value = '';
  document.querySelectorAll('.checkbox-container.checked').forEach(el => {
    el.classList.remove('checked');
  });
  document.getElementById('message').innerHTML = messagePlaceholder;
  message.style.color = '';
  window.getSelection().removeAllRanges();
  messageEdited = false;
}

message.addEventListener('input', (event) => {
  message.style.color = 'black';
  messageEdited = true;
});

// Form submission
let alertTimerId = null;

function alertMessage(message) {
  if (alertTimerId) {
    clearTimeout(alertTimerId);
  }
  document.querySelector('#form-alert p').innerHTML = message;
  document.querySelector('#form-alert').classList.add('active');
  alertTimerId = setTimeout(() => {
    document.querySelector('#form-alert').classList.remove('active');
  }, 2500);
}

function alertSent() {
  if (alertTimerId) {
    clearTimeout(alertTimerId);
  }
  document.querySelector('#form-alert p').innerHTML = '';

  if (mobile) info.style.opacity = "0";
  const sentAlertContainer = document.querySelector('#sent-alert-container');
  const actualContactForm = document.querySelector('#actual-contact-form');

  const height = window.getComputedStyle(actualContactForm).height;
  sentAlertContainer.style.height = height;
  sentAlertContainer.classList.add('visible');
  
  actualContactForm.style.opacity = 0;

  alertTimerId = setTimeout(() => {
    sentAlertContainer.classList.remove('visible');
    sentAlertContainer.addEventListener("transitionend", () => {
      contactForm.style.display = "none";
      pitches.classList.remove('expanded');
      actualContactForm.style.opacity = "1";
      if (mobile) info.style.opacity = "1";
      resetPitches();
    }, { once: true });
  }, 3000);
}

const sendButton = document.getElementById('send-form');

sendButton.addEventListener('click', async () => {
  const from = document.getElementById('from').value;
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').innerText;

  // Collect selected pitches
  const selectedPitches = [];
  document.querySelectorAll('#pitches-to-send .dot-container').forEach(el => {
    selectedPitches.push(el.querySelector('p').innerText);
  });

  // Validate
  if (!from || !subject) {
    alertMessage('Please complete all fields.');
    return;
  }

  if (!messageEdited || message.trim() === '') {
    alertMessage('Please enter a message.');
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(from)) {
    alertMessage('Please enter a valid email address.');
    return;
  }

  // Submit
  try {
    const response = await fetch('/api/contact-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from,
        subject: subject,
        message: message,
        pitches: selectedPitches
      })
    });

    const result = await response.json();

    if (result.success) {
      alertSent();
    } else {
      alert('Error: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    if (error.message.includes('Missing required fields')) {
      alertMessage('Please complete all fields.');
    } else if (error.message.includes('Invalid email format')) {
      alertMessage('Please enter a valid email address.');
    } else {
      alertMessage('An unexpected error occurred. Please try again later.');
    }
  }
});

// =====================================================================================================================================
// SCROLL FOR MOBILE
// =====================================================================================================================================

let scrollAnimations = false;
let currPage = null;
setTimeout(scrollAnimationOn, 1000);

function scrollAnimationOn() {
  scrollAnimations = true;
}

function scrollHandler() {
  if (window.scrollY < 1) return;
  const scrollProgress = Math.max((window.scrollY - 10) / window.innerHeight, 0);
  const targetDiv = document.getElementById('index-text');
  if (targetDiv) {
    const blurbOpacity = 1 - scrollProgress
    targetDiv.style.opacity = blurbOpacity > 0 ? blurbOpacity : 0; // fades out as you scroll
  }
  if (production) {
    const productionOpacity = Math.max((scrollProgress - 1) / 0.25, 0);
    production.style.opacity = productionOpacity < 1 ? productionOpacity : 1;
  }
  if (!scrollAnimations) return;
  [index, production, serviceProviders, pitches, info].forEach(page => {
    var pageTop = page.offsetTop;
    if (page == index) pageTop = -100;
    const pageHeight = page.offsetHeight;
    if (window.scrollY >= pageTop - remToPx(20) &&
      window.scrollY < pageTop + pageHeight - remToPx(20)) {
      if (currPage === null) {
        openPage(page.id.slice(0, -5));
        currPage = page;
      } else if (currPage !== page) {
        closePage();
        openPage(page.id.slice(0, -5));
        currPage = page;
      }
    }
  });
}

// ================
// SCROLL - PRODUCTION - VIDEOS
// ================

function observeProducts(entries) {
  entries.forEach(entry => {
    const el = entry.target;

    const videoContainer = el.querySelector('.lazy-video-container');
    const video = videoContainer ? videoContainer.querySelector('video') : null;

    if (ProductionCarousel.getCurrentProduct()) return;

    if (entry.isIntersecting) {
      el.classList.add('focus');
      if (video) {
        safePlayVideo(video, videoContainer);
      }
    } else {
      el.classList.remove('focus');
      if (video) {
        pauseVideo(video, videoContainer);
      }
    }
  });
}

function setupProductionObserver() {
  let elementsToObserve = [];
  let observerOptions = { threshold: 0 };

  if (mobile) {
    // setupMobileProduction();
    production.classList.add('flickity-ready');
    elementsToObserve = Array.from(production.querySelectorAll('.product'));
    observerOptions.root = null;
    observerOptions.rootMargin = '-49% 0px -49% 0px';
    const observer = new IntersectionObserver(observeProducts, observerOptions);
    elementsToObserve.forEach(el => observer.observe(el));
  }
}

production.querySelectorAll('.lazy-video-container').forEach(container => {
  const video = container.querySelector('video');
  if (!video) return;

  container.addEventListener('mouseenter', () => {
    if (ProductionCarousel.getCurrentProduct() && ProductionCarousel.getCurrentProduct().contains(container)) return;
    safePlayVideo(video, container);
  });

  container.addEventListener('mouseleave', () => {
    if (ProductionCarousel.getCurrentProduct() && ProductionCarousel.getCurrentProduct().contains(container)) return;
    pauseVideo(video, container);
  });
});

// function setupMobileProduction() {
//   let products = production.querySelectorAll('.product');
  // products.forEach(product => {
  //   let productMedia = product.querySelector("img.lazy-image, img.lazy-loaded, .lazy-video-container video");
  //   if (productMedia && productMedia.tagName === 'VIDEO') {
  //     const videoContainer = productMedia.closest('.lazy-video-container');
  //     const poster = videoContainer.querySelector('img.video-thumbnail');
      // Get dimensions from poster image
      // let w = poster.naturalWidth;
      // let h = poster.naturalHeight;
      // scaleMedia(productMedia, w, h, videoContainer);
    // } else if (productMedia && productMedia.tagName === 'IMG') {
    //   let w = productMedia.naturalWidth;
    //   let h = productMedia.naturalHeight;
    //   scaleMedia(productMedia, w, h);
    // }
  // });
// }

function syncCaptionWidth() {
  document.querySelectorAll('.product').forEach(node => {
    const img = node.querySelector('img');
    const video = node.querySelector('video');
    const caption = node.querySelector('.caption');
    if (img && caption) {
      const aspectRatio = parseFloat(img.style.aspectRatio);
      const maxWidth = parseFloat(getComputedStyle(img).maxWidth);
      const maxHeight = parseFloat(getComputedStyle(img).maxHeight);
      const renderedWidth = Math.min(maxWidth, maxHeight * aspectRatio);
      caption.style.width = renderedWidth + 'px';
    }
  });
}

// Update on window resize
window.addEventListener('resize', syncCaptionWidth);


// =====================================================================================================================================
// Visibility Handler
// =====================================================================================================================================

let pausedVideos = [];

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause all videos
    document.querySelectorAll('video').forEach(v => {
      if (v.paused) return;
      pausedVideos.push(v);
      v.pause();
    });

    // Clear intervals
    if (cursorInterval) {
      clearInterval(cursorInterval);
      cursorInterval = null;
    }
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  } else {
    // Resume based on current page
    const section = document.querySelector('.page:not(.inactive)')?.id.slice(0, -5);
    if (section === 'index' && !mobile) {
      cursorInterval = setInterval(indexFollow, 1000 / 60);
    } else if (section === 'info' && !mobile) {
      cursorInterval = setInterval(infoFollow, 1000 / 60);
    } else if (mobile) {
      scrollInterval = setInterval(scrollHandler, 1000 / 30);
      document.querySelector('#mobile-video').play();
    }
    pausedVideos.forEach(v => {
      v.play();
    });
    pausedVideos = [];
  }
});

// =====================================================================================================================================
// Global Error Handler
// =====================================================================================================================================

function forceSafariRepaint() {
  const header = document.getElementById('header');
  const footer = document.getElementById('footer');

  [header, footer].forEach(el => {
    if (!el) return;          // skip if element not found
    el.style.display = 'none'; // temporarily hide
    el.offsetHeight;           // force reflow
    el.style.display = '';     // restore
  });
}