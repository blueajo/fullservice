/**
 * @file
 * Lazy loading system for images and videos
 * Handles blur-to-sharp transitions and video thumbnail overlays
 */

(function (Drupal, once) {
    'use strict';

    Drupal.behaviors.lazyLoad = {
        attach: function (context, settings) {
            // Configuration
            const config = {
                rootMargin: '50px 0px', // Start loading 50px before entering viewport
                threshold: 0.01,
                imageTransitionDuration: 600, // ms
                videoFadeOutDuration: 400 // ms
            };

            // =================================================================
            // IMAGE LAZY LOADING
            // =================================================================

            /**
             * Initialize lazy loading for images
             */
            const initImageLazyLoad = () => {
                const lazyImages = once('lazy-image', '.lazy-image', context);

                if (lazyImages.length === 0) return;

                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            loadImage(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: config.rootMargin,
                    threshold: config.threshold
                });

                lazyImages.forEach(img => {
                    // Add loading state
                    img.classList.add('lazy-loading');
                    imageObserver.observe(img);
                });
            };

            /**
             * Load full-resolution image
             */
            const loadImage = (img) => {
                const fullSrc = img.dataset.src;
                const fullSrcset = img.dataset.srcset;

                if (!fullSrc) return;

                // Create new image to preload
                const tempImg = new Image();

                tempImg.onload = () => {
                    img.src = fullSrc;

                    // Wait for the browser to decode the final image
                    img.decode()
                        .then(() => {
                            // Smooth crossfade AFTER decode
                            img.classList.remove('lazy-loading');
                            img.classList.add('lazy-loaded');

                            setTimeout(() => {
                                img.classList.add('final');
                            }, config.imageTransitionDuration);
                        })
                        .catch(() => {
                            // fallback: decode may fail on Safari sometimes
                            img.classList.remove('lazy-loading');
                            img.classList.add('lazy-loaded');
                        });
                };


                // Start loading
                tempImg.src = fullSrc;
                if (fullSrcset) {
                    tempImg.srcset = fullSrcset;
                }
            };

            // =================================================================
            // VIDEO LAZY LOADING
            // =================================================================

            /**
             * Initialize lazy loading for videos
             */
            const initVideoLazyLoad = () => {
                const lazyVideos = once('lazy-video', '.lazy-video-container', context);

                if (lazyVideos.length === 0) return;

                const videoObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            prepareVideo(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: config.rootMargin,
                    threshold: config.threshold
                });

                lazyVideos.forEach(container => {
                    videoObserver.observe(container);
                });
            };

            function loadVideoSources(container, video, thumbnail) {
                const sources = video.querySelectorAll('source[data-src]');
                sources.forEach(source => {
                    source.src = source.dataset.src;
                    source.removeAttribute('data-src');
                });

                video.load();

                video.addEventListener('loadeddata', () => {
                    thumbnail.classList.add('fade-out');
                    container.classList.add('video-ready');
                    setupVideoPlayback(container, video, thumbnail);

                    if (video.closest('#index-cursor')) {
                        video.play();
                    }
                }, { once: true });
            }

            /**
             * Prepare video for loading (load sources but don't play)
             */
            const prepareVideo = (container) => {
                const video = container.querySelector('video');
                const thumbnail = container.querySelector('.video-thumbnail');
                // Delay video loading to avoid blocking images
                setTimeout(() => {
                    loadVideoSources(container, video, thumbnail);
                }, 400);  // 400–800ms works best
            };

            /**
             * Set up video playback behavior
             */
            const setupVideoPlayback = (container, video, thumbnail) => {
                let hasPlayed = false;

                const handleFirstPlay = () => {
                    if (hasPlayed) return;

                    console.log('Video first play triggered:', video.id || video);
                    hasPlayed = true;

                    // Mark container as playing (triggers CSS transitions)
                    container.classList.add('video-playing');

                    // Actually play the video
                    const playPromise = video.play();

                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log('Video playing successfully');
                            })
                            .catch(error => {
                                console.warn('Video play failed:', error);
                                // Reset if play fails
                                container.classList.remove('video-playing');
                                hasPlayed = false;
                            });
                    }
                };

                // Listen for play events
                video.addEventListener('play', () => {
                    if (!hasPlayed) {
                        handleFirstPlay();
                    }
                });

                // Intercept play() calls
                const originalPlay = video.play.bind(video);
                video.play = function () {
                    if (!hasPlayed) {
                        handleFirstPlay();
                        return originalPlay();
                    }
                    return originalPlay();
                };

                // Handle clicks on thumbnail
                if (thumbnail) {
                    thumbnail.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFirstPlay();
                    });
                }

                // Handle clicks on container (for compatibility with your existing code)
                container.addEventListener('click', (e) => {
                    if (e.target === container || e.target === thumbnail || e.target === video) {
                        handleFirstPlay();
                    }
                });
            };

            // // After all initImageLazyLoad() + initVideoLazyLoad() calls
            // let idleTimeout;

            // function loadEverythingNow() {
            //     console.log('Idle detected, loading all remaining lazy media.');
            //     // Load remaining lazy images
            //     document.querySelectorAll('.lazy-image.lazy-loading').forEach(img => {
            //         loadImage(img);
            //     });

            //     // Load remaining lazy videos
            //     document.querySelectorAll('.lazy-video-container:not(.video-ready)').forEach(container => {
            //         prepareVideo(container);
            //     });
            // }

            // // When idle, force preload
            // function scheduleIdleLoad() {
            //     console.log('User activity detected, resetting idle timer.');
            //     clearTimeout(idleTimeout);
            //     idleTimeout = setTimeout(loadEverythingNow, 1200); // 1.2s idle
            // }

            // // Track user activity
            // ['scroll', 'mousemove', 'touchstart', 'keydown', 'wheel'].forEach(evt => {
            //     document.addEventListener(evt, scheduleIdleLoad, { passive: true });
            // });

            // // Initial call after first load
            // scheduleIdleLoad();


            // =================================================================
            // INITIALIZE
            // =================================================================

            initImageLazyLoad();
            initVideoLazyLoad();
        }
    };

    // =================================================================
    // UTILITY: Generate blur thumbnail from existing image
    // (Optional - use if you don't have pre-generated thumbnails)
    // =================================================================

    /**
     * Generate a tiny base64 blur placeholder from an image URL
     * This is optional - better to pre-generate thumbnails in Drupal
     */
    Drupal.lazyLoad = Drupal.lazyLoad || {};

    Drupal.lazyLoad.generateBlurPlaceholder = function (imageUrl, callback) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Use very small dimensions for blur effect
            canvas.width = 20;
            canvas.height = Math.floor(20 * (img.height / img.width));

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to base64
            const blurDataUrl = canvas.toDataURL('image/jpeg', 0.5);
            callback(blurDataUrl);
        };

        img.src = imageUrl;
    };

})(Drupal, once);