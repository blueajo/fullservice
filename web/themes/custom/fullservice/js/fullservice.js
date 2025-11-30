// Drupal.behaviors = {};

// =====================================================================================================================================
// START UP
// =====================================================================================================================================
console.log("fullservice.js loaded:", document.getElementById("index-cursor"));

let mobile = false;
let scrollInterval = null;

// Load page on start
document.addEventListener("DOMContentLoaded", (event) => {
  if (screen.width <= 768) {
    mobile = true;

    // Check if mobile video exists before adding listeners
    const mobileVideo = document.querySelector('#mobile-video');
    if (mobileVideo) {
      console.log('Mobile video found');
      // Play as soon as the lazy loader has loaded the video
      mobileVideo.addEventListener('loadeddata', () => {
        console.log('playing mobile video');
        mobileVideo.play().catch(err => {
          playMobileVideoOnInteraction('#mobile-video');
          console.warn('Mobile autoplay failed:', err);
        });
      });
    } else {
      console.warn('Mobile video not found in DOM');
    }

    syncCaptionWidth();

    openPage('index');
    if (location.hash) {
      history.pushState("", document.title, window.location.pathname);
    }
    scrollInterval = setInterval(scrollHandler, 1000 / 30);
    setTimeout(setupProductionObserver, 500);
  } else {
    const indexCursor = document.getElementById('index-cursor')
    document.addEventListener('mousemove', (event) => {
      document.getElementById('index-cursor').classList.add('visible');
    }, { once: true });
    setupHomepageVideos();
    if (location.hash) {
      openPage(location.hash.substring(1));
    } else {
      openPage('index');
    }
  }

  setTimeout(() => {
    document.getElementById('container').classList.add('visible');
  }, 250);
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
const quadrants = [['production', 'pitches'],
['service-providers', 'info']];
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

    // LOCATION OF FOLLOWER
    this.x = lerp(this.x, mouseX, 0.05);
    this.y = lerp(this.y, mouseY, 0.05);

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
        video.play(); // Lazy loader will handle thumbnail hiding
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
const infoLinks = document.querySelectorAll('#info-page a');

var infoCursor = {
  el: copyright,
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  update: function () {
    this.x = mouseX;
    this.y = mouseY;
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
});

// Video cursor behavior
index.addEventListener("mouseleave", (e) => {
  videoDot.classList.remove('active');
  if (activeLink) {
    activeLink.classList.remove('active-link');
    activeLink = null;
  }
});

index.addEventListener("mouseenter", (e) => {
  videoDot.classList.add('active');
});

// Copyright cursor behavior
info.addEventListener("mouseleave", (e) => {
  copyright.classList.remove('active');
});

info.addEventListener("mouseenter", (e) => {
  copyright.classList.add('active');
});

info.addEventListener("mousedown", (e) => {
  copyright.classList.remove('active');
});

info.addEventListener("mouseup", (e) => {
  copyright.classList.add('active');
});

for (let i = 0; i < infoLinks.length; i++) {
  const link = infoLinks[i];
  console.log('Adding listeners to link:', link);
  link.addEventListener('mouseenter', () => {
    copyright.classList.remove('active');
  });
  link.addEventListener('mouseout', () => {
    copyright.classList.add('active');
  });
}

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
    videoCredits.classList.remove('active');
    document.getElementById('header').classList.remove('index-header');
  } else if (section == 'production') {
    if (ProductionCarousel.initialized()) {
      ProductionCarousel.deinitialize();
      document.querySelectorAll('#production-page video').forEach(v => {
        v.addEventListener('play', () => console.log('Video started:', v.id));
      });
    }
    const productionVideos = production.querySelectorAll('video');
    for (let i = 0; i < productionVideos.length; i++) {
      productionVideos[i].pause();
    }
  } else if (section == 'pitches') {
    if (!mobile) resetPitches();
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
    videoCredits.classList.add('active');
    document.getElementById('header').classList.add('index-header');
    if (!mobile) {
      cursorInterval = setInterval(indexFollow, 1000 / 60);
    }
  }
  if (section == 'info' && !mobile) {
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
  if (pageText) {
    pageText.classList.remove('active');
    pageText.classList.remove('fully-active');
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
    setTimeout(() => {
      pageText.classList.add('fully-active');
    }, 25);
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
      setTimeout(scrollAnimationOn, 1500);
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
  if (window.innerWidth > 900) {
    indexLink.style.opacity = 1;
  } else {
    indexLink.style.opacity = 0;
  }
});

videoCredits.addEventListener('mouseleave', () => {
  indexLink.style.opacity = 1;
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
      .then(() => console.log('Mobile video playing'))
      .catch(err => console.warn('Mobile autoplay failed:', err));

    // Remove the listener after first interaction
    document.removeEventListener('click', tryPlay);
    document.removeEventListener('touchstart', tryPlay);
  }

  // Listen for user interaction
  document.addEventListener('click', tryPlay, { once: true });
  document.addEventListener('touchstart', tryPlay, { once: true });
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
    scrollTimeout: null
  };

  let viewport = null;
  let wheelEndTimeout = null;
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
    setTimeout(() => {
      state.pauseScroll = false;
    }, duration);
  };

  // =======================
  // Carousel Initialization
  // =======================
  function createCarousel() {
    console.log('Creating production carousel');
    // Destroy any existing instance first
    if (state.flkty) {
      state.flkty.destroy();
    }

    state.flkty = new Flickity(production, {
      cellAlign: "center",
      wrapAround: true,
      pageDots: false,
      setGallerySize: false,
      accessibility: true,
      prevNextButtons: false,
      cellSelector: ".product",
      freeScroll: true,
      lazyLoad: true,           // Disable lazy loading
      contain: false,            // Allow infinite scroll
      percentPosition: false,     // Use pixel positioning
      initialIndex: 3
    });

    viewport = document.querySelector(".flickity-viewport");

    // Reset transform (important for Flickity)
    document.querySelector(".flickity-slider").style.transform = "translateX(0%)";

    // Static click: open/close products
    state.flkty.on("staticClick", (event, pointer, cellElement, cellIndex) => {
      if (!cellElement) return;
      if (cellElement === state.currOpenProduct) closeProduct();
      else openProduct(cellElement, cellIndex);
    });

    setTimeout(() => {
      console.log('flkty initialized');
      production.classList.add('flickity-ready');
    }, "200");
  }

  function initialized() {
    return !(state.flkty == null);
  }

  function deinitialize() {
    if (state.flkty) {
      closeProduct();
      state.flkty.destroy();
    }
    state.flkty = null;
  }

  function getCurrentProduct() {
    return state.currOpenProduct;
  }

  // =======================
  // Product Controls
  // =======================
  function openProduct(cellElement, cellIndex) {
    console.log("openProduct called:", cellElement.id);
    temporarilyPauseScroll(750);
    if (!state.currOpenProduct && state.ticking) cancelScroll();

    if (state.currOpenProduct !== cellElement) {
      closeProduct();

      cellElement.classList.add("open");

      // UPDATED: Handle both images and videos inside lazy-video-container
      let productMedia = cellElement.querySelector("img.lazy-image, img.lazy-loaded, .lazy-video-container video");
      let productCaption = cellElement.querySelector("p");

      // UPDATED: Check if it's a video inside lazy-video-container
      if (productMedia && productMedia.tagName === 'VIDEO') {
        const videoContainer = productMedia.closest('.lazy-video-container');
        productMedia.currentTime = 0;
        if (videoContainer.classList.contains('video-ready')) {
          productMedia.play(); // Lazy loader handles thumbnail hiding
        }

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
      state.flkty.selectCell(cellIndex, true, false);
      state.flkty.once('settle', () => state.flkty.reposition());

      state.currOpenProduct = cellElement;
      state.flkty.options.dragThreshold = 10000;
      state.flkty.updateDraggable();

      leftArrow.classList.add("expanded");
      rightArrow.classList.add("expanded");
    }
  }

  function closeProduct() {
    if (!state.currOpenProduct) return;

    const product = state.currOpenProduct;
    product.classList.remove("open");

    // UPDATED: Handle both images and videos
    const productMedia = product.querySelector("img.lazy-image, img.lazy-loaded, .lazy-video-container video");
    const videoContainer = product.querySelector('.lazy-video-container');

    if (productMedia && productMedia.tagName === 'VIDEO') {
      productMedia.pause();
      videoContainer.classList.remove('video-playing');
      if (videoContainer) {
        videoContainer.style.width = "15vw";
      }
    } else if (productMedia && productMedia.tagName === 'IMG') {
      productMedia.style.width = "15vw";
    }

    state.flkty.reposition();
    state.currOpenProduct = null;

    leftArrow.classList.remove("expanded");
    rightArrow.classList.remove("expanded");

    state.flkty.options.dragThreshold = 3;
    state.flkty.updateDraggable();
  }

  // =======================
  // Arrow Controls
  // =======================

  function handleArrowPress(dir) {
    if (state.currOpenProduct) {
      let index = (state.flkty.selectedIndex + dir) % state.flkty.cells.length;
      index = index < 0 ? state.flkty.cells.length - 1 : index;
      openProduct(state.flkty.cells[index].element, index);
    } else {
      let index = (state.flkty.selectedIndex + (dir * 5)) % state.flkty.cells.length;
      index = index < 0 ? state.flkty.cells.length - 5 : index;
      state.flkty.selectCell(index, true, false);
    }
    temporarilyDisablePointer();
  }

  function setupArrowControls() {
    leftArrow.addEventListener("click", () => {
      handleArrowPress(-1);
    });

    rightArrow.addEventListener("click", () => {
      handleArrowPress(1);
    });

    centerArea.addEventListener("click", closeProduct);

    document.addEventListener("keydown", (event) => {
      const section = document.querySelector('.page:not(.inactive)').id.slice(0, -5);
      if (section == 'production') {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          // Left arrow key pressed
          handleArrowPress(-1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          // Right arrow key pressed
          handleArrowPress(1);
        }
      }
    });

  }

  function temporarilyDisablePointer() {
    viewport.style.zIndex = "-1";
    production.addEventListener(
      "mousemove",
      () => (viewport.style.zIndex = "1"),
      { once: true }
    );
  }

  // =======================
  // Scroll Momentum Logic
  // =======================
  function setupScrollHandling() {
    production.addEventListener("mouseenter", () => (state.isHoveringCarousel = true));
    production.addEventListener("mouseleave", () => (state.isHoveringCarousel = false));

    window.addEventListener("wheel", handleWheel, { passive: false });
  }

  let lastDeltaY = 0;
  let lastGap = 0;
  let scrollDebounceTimeout = null; // timer for scroll debouncer 
  let swiped = false;

  function handleWheel(e) {
    clearTimeout(scrollDebounceTimeout);
    scrollDebounceTimeout = setTimeout(() => {
      if (!swiped && state.currOpenProduct) {
        let nextIndex = (state.flkty.selectedIndex + Math.sign(e.deltaY)) % state.flkty.cells.length;
        nextIndex = nextIndex < 0 ? state.flkty.cells.length - 1 : nextIndex;
        const nextEl = state.flkty.cells[nextIndex].element;
        openProduct(nextEl, nextIndex);
        return;
      }
      state.scrollDelta = 0;
      state.scrollMomentum = 0;
      swiped = false;
      production.classList.remove("scrolling");
    }, 120);

    if (!state.isHoveringCarousel || state.pauseScroll) return;
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

    e.preventDefault();

    // next product opens when a swipe is detected (measured by a spike in e.deltaY)
    if (state.currOpenProduct) {
      const gap = e.deltaY - lastDeltaY;
      const swipe = (Math.sign(gap) !== Math.sign(lastGap)) && (Math.abs(e.deltaY) > 10) || state.scrollDelta > 200;

      // const swipe = (Math.sign(gap) !== Math.sign(lastGap)) && (Math.abs(e.deltaY) > 15);

      if (swipe) {
        swiped = true;
        let nextIndex = (state.flkty.selectedIndex + Math.sign(e.deltaY)) % state.flkty.cells.length;
        nextIndex = nextIndex < 0 ? state.flkty.cells.length - 1 : nextIndex;
        const nextEl = state.flkty.cells[nextIndex].element;
        openProduct(nextEl, nextIndex);
        return;
      }

      lastGap = e.deltaY - lastDeltaY;
      lastDeltaY = e.deltaY;
    }

    // Apply momentum
    state.scrollMomentum += Math.sign(e.deltaY) * Math.pow(Math.abs(e.deltaY), 0.9) * 0.3;
    state.scrollMomentum = clamp(state.scrollMomentum, -100, 100);
    state.scrollDelta += e.deltaY;

    production.classList.add("scrolling");
    if (!swiped) {
      animateScroll();
    }
  }

  function cancelScroll() {
    state.flkty.dragX = state.flkty.x;
    state.flkty.velocity = 0;
    state.flkty.dragEnd();
    state.ticking = false;
    state.scrollMomentum = 0;
    state.scrollDelta = 0;
    production.classList.remove("scrolling");
  }

  function animateScroll() {
    if (state.ticking) return;
    state.ticking = true;

    const update = () => {
      if (state.pauseScroll) {
        state.ticking = false;
        state.scrollMomentum = 0;
        state.scrollDelta = 0;
        production.classList.remove("scrolling");
        return;
      }

      state.scrollMomentum *= 0.9; // friction

      if (Math.abs(state.scrollMomentum) > 0.1) {
        state.flkty.x -= state.scrollMomentum;
        state.flkty.dragX = state.flkty.x;
        state.flkty.positionSlider();
        requestAnimationFrame(update);
      } else {
        cancelScroll();
      }
    };

    requestAnimationFrame(update);
  }

  // =======================
  // Public API
  // =======================
  return {
    init() {
      console.log('ProductionCarousel.init called');
      console.trace(); 
      createCarousel();
      setupArrowControls();
      setupScrollHandling();
    },
    openProduct,
    closeProduct,
    initialized,
    deinitialize,
    getCurrentProduct
  };
})();

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
      pitch.classList.remove('checked');
      const pitchToRemove = document.querySelector("#pitch" + i);
      pitchToRemove.remove();
      checkedCount--;
      if (checkedCount == 0) {
        contactForm.classList.remove('active');
        pitches.classList.remove('expanded');
      }
      console.log('-');
    } else {
      if (checkedCount < 5) {
        pitch.classList.add('checked');
        checkedCount++;
        pitchesToSend.innerHTML +=
          '<div id=pitch' + i + ' class="dot-container">' +
          '<span class="dot"></span>' +
          '<p>' + pitchContent + '</p>' +
          '</div>';
        if (!contactForm.classList.contains('active')) {
          contactForm.classList.add('active');
          pitches.classList.add('expanded');
        }
      }
    }
  });
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
      alertMessage('Message sent!');
      // Reset form
      resetPitches();
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
  if (!scrollAnimations) return;
  [index, production, serviceProviders, pitches, info].forEach(page => {
    const pageTop = page.offsetTop;
    const pageHeight = page.offsetHeight;
    if (window.scrollY >= pageTop - remToPx(20) &&
      window.scrollY < pageTop + pageHeight - remToPx(20)) {
      if (currPage !== page) {
        closePage();
        openPage(page.id.slice(0, -5));
        currPage = page;
      }
      if (currPage === index) {
        const scrollProgress = Math.min(
          Math.max((window.scrollY - pageTop) / pageHeight, 0),
          1
        );
        console.log(scrollProgress);

        // Set the opacity of your target div based on scroll progress
        const targetDiv = document.getElementById('index-text');
        if (targetDiv) {
          targetDiv.style.opacity = 1 - scrollProgress; // fades out as you scroll
        }
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

    // UPDATED: Find video inside lazy-video-container
    const videoContainer = el.querySelector('.lazy-video-container');
    const video = videoContainer ? videoContainer.querySelector('video') : null;

    if (ProductionCarousel.getCurrentProduct()) return;

    if (entry.isIntersecting) {
      el.classList.add('focus');
      if (video) {
        video.play(); // Lazy loader handles thumbnail
        videoContainer.classList.add('video-playing');
      }
    } else {
      if (video) {
        video.pause();
        videoContainer.classList.remove('video-playing');
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
    elementsToObserve = Array.from(production.querySelectorAll('.product:has(video)'));
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
    if (ProductionCarousel.getCurrentProduct()) return;
    video.play();
    container.classList.add('video-playing');
  });

  container.addEventListener('mouseleave', () => {
    if (ProductionCarousel.getCurrentProduct()) return;
    video.pause();
    container.classList.remove('video-playing');
  });
});

function setupMobileProduction() {
  let products = production.querySelectorAll('.product');
  products.forEach(product => {
    let productMedia = product.querySelector("img.lazy-image, img.lazy-loaded, .lazy-video-container video");
    if (productMedia && productMedia.tagName === 'VIDEO') {
      const videoContainer = productMedia.closest('.lazy-video-container');
      const poster = videoContainer.querySelector('img.video-thumbnail');
      // Get dimensions from poster image
      let w = poster.naturalWidth;
      let h = poster.naturalHeight;
      scaleMedia(productMedia, w, h, videoContainer);
    } else if (productMedia && productMedia.tagName === 'IMG') {
      let w = productMedia.naturalWidth;
      let h = productMedia.naturalHeight;
      scaleMedia(productMedia, w, h);
    }
  });
}

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
      img.style.width = renderedWidth + 'px';
      if (video) video.style.width = renderedWidth + 'px';
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

window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});