(function (Drupal, once) {
    'use strict';

    Drupal.behaviors.lazyLoad = {
        attach: function (context, settings) {
            const config = {
                rootMargin: '50px 0px',
                threshold: 0.01,
                imageTransitionDuration: 600
            };

            const initImageLazyLoad = () => {
                const lazyImages = once('lazy-image', '.lazy-image', context);
                if (!lazyImages || lazyImages.length === 0) return;

                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.target instanceof Element) {
                            loadImage(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { rootMargin: config.rootMargin, threshold: config.threshold });

                lazyImages.forEach(img => {
                    if (img instanceof Element) {
                        img.classList.add('lazy-loading');
                        imageObserver.observe(img);
                    }
                });
            };

            const loadImage = (img) => {
                if (!(img instanceof Element)) return;
                const fullSrc = img.dataset.src;
                const fullSrcset = img.dataset.srcset;
                if (!fullSrc) return;
                img.src = fullSrc;
                if (fullSrcset) img.srcset = fullSrcset;
            };

            const initVideoLazyLoad = () => {
                const lazyVideos = once('lazy-video', '.lazy-video-container', context);
                if (!lazyVideos || lazyVideos.length === 0) return;

                const videoObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.target instanceof Element) {
                            prepareVideo
                            (entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { rootMargin: config.rootMargin, threshold: config.threshold });

                lazyVideos.forEach(container => {
                    if (container instanceof Element) videoObserver.observe(container);
                });
            };

            const loadVideoSources = (container, video, thumbnail) => {
                if (!video) return;
                const sources = video.querySelectorAll('source[data-src]');
                sources.forEach(source => {
                    if (source instanceof Element) {
                        source.src = source.dataset.src;
                        source.removeAttribute('data-src');
                    }
                });
                video.load();

                video.addEventListener('error', (e) => {
                    console.error('Video load error:', video.id, e);
                }, { once: true });
            };

            // Make sure DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    initImageLazyLoad();
                    initVideoLazyLoad();
                });
            } else {
                initImageLazyLoad();
                initVideoLazyLoad();
            }
        }
    };

})(Drupal, once);