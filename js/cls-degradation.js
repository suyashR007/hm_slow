/**
 * CLS Degradation Script
 * Causes Cumulative Layout Shift (CLS) > 0.25 WITHOUT adding any
 * visible UI elements or changing the final appearance of the page.
 *
 * Techniques used:
 *  - Strip image width/height so they reflow on load
 *  - Temporarily wrong-size containers that snap to correct size
 *  - Late-apply margins/paddings on existing elements
 *  - Shift the header/hero dimensions then restore
 * The final rendered page looks identical to the fast version.
 */

(function () {
    'use strict';

    // ── 1. Strip image dimensions immediately ───────────────────────
    // Without width/height, images start at 0px tall then expand
    // when loaded, pushing all content below them downward.
    // This is the #1 real-world cause of CLS.
    function stripImageDimensions() {
        var images = document.querySelectorAll('img[width][height]');
        for (var i = 0; i < images.length; i++) {
            images[i].removeAttribute('width');
            images[i].removeAttribute('height');
        }
    }

    // Run immediately during parse (before images start loading)
    stripImageDimensions();

    // ── Helper: apply style then revert after a delay ───────────────
    function shiftThenRestore(el, props, shiftDuration) {
        if (!el) return;
        var originals = {};
        for (var key in props) {
            originals[key] = el.style[key] || '';
            el.style[key] = props[key];
        }
        setTimeout(function () {
            for (var key in originals) {
                el.style[key] = originals[key];
            }
        }, shiftDuration);
    }

    // ── All DOM-dependent shifts on DOMContentLoaded ────────────────
    function initShifts() {

        // ── 2. Header banner height shift ───────────────────────────
        // Start with extra padding, then snap to normal
        var headerBanner = document.querySelector('.header-banner') ||
            document.querySelector('.bc6fab');
        if (headerBanner) {
            shiftThenRestore(headerBanner, {
                paddingTop: '28px',
                paddingBottom: '28px'
            }, 400);
        }

        // ── 3. Hero section height shift ────────────────────────────
        // Temporarily constrain hero height, then release
        var hero = document.querySelector('.hero');
        if (hero) {
            var originalMinH = hero.style.minHeight;
            var originalMaxH = hero.style.maxHeight;
            var originalOverflow = hero.style.overflow;

            hero.style.minHeight = '150px';
            hero.style.maxHeight = '150px';
            hero.style.overflow = 'hidden';

            setTimeout(function () {
                hero.style.minHeight = originalMinH;
                hero.style.maxHeight = originalMaxH;
                hero.style.overflow = originalOverflow;
            }, 500);
        }

        // ── 4. Product grid column shift ────────────────────────────
        // Temporarily use wrong column count, then snap to correct
        var productGrids = document.querySelectorAll('.product-grid');
        for (var g = 0; g < productGrids.length; g++) {
            (function (grid) {
                var origCols = grid.style.gridTemplateColumns;
                grid.style.gridTemplateColumns = '1fr';

                setTimeout(function () {
                    grid.style.gridTemplateColumns = origCols;
                }, 600);
            })(productGrids[g]);
        }

        // ── 5. Container margin shift ───────────────────────────────
        // Add temporary top margin to main containers, then remove
        var containers = document.querySelectorAll('.container');
        for (var c = 0; c < Math.min(containers.length, 3); c++) {
            (function (container, index) {
                var origMargin = container.style.marginTop;
                container.style.marginTop = (30 + index * 15) + 'px';

                setTimeout(function () {
                    container.style.marginTop = origMargin;
                }, 350 + index * 150);
            })(containers[c], c);
        }

        // ── 6. Section padding shift ────────────────────────────────
        // Temporarily add extra padding to above-fold sections
        var sections = document.querySelectorAll('section');
        for (var s = 0; s < Math.min(sections.length, 4); s++) {
            (function (section, index) {
                if (section.getBoundingClientRect().top < window.innerHeight) {
                    var origPadTop = section.style.paddingTop;
                    var origPadBot = section.style.paddingBottom;
                    section.style.paddingTop = '40px';
                    section.style.paddingBottom = '40px';

                    setTimeout(function () {
                        section.style.paddingTop = origPadTop;
                        section.style.paddingBottom = origPadBot;
                    }, 450 + index * 100);
                }
            })(sections[s], s);
        }

        // ── 7. Nav links spacing shift ──────────────────────────────
        var navLinks = document.querySelectorAll('.nav-link');
        for (var n = 0; n < navLinks.length; n++) {
            (function (link) {
                var origPad = link.style.padding;
                link.style.padding = '12px 24px';

                setTimeout(function () {
                    link.style.padding = origPad;
                }, 300);
            })(navLinks[n]);
        }

        // ── 8. Heading margin shift ─────────────────────────────────
        // Temporarily add bottom margin to headings, then remove
        var headings = document.querySelectorAll('h1, h2, h3');
        for (var h = 0; h < Math.min(headings.length, 6); h++) {
            (function (heading) {
                if (heading.getBoundingClientRect().top < window.innerHeight * 1.5) {
                    var origMB = heading.style.marginBottom;
                    var origMT = heading.style.marginTop;
                    heading.style.marginBottom = '32px';
                    heading.style.marginTop = '24px';

                    setTimeout(function () {
                        heading.style.marginBottom = origMB;
                        heading.style.marginTop = origMT;
                    }, 550);
                }
            })(headings[h]);
        }

        // ── 9. Footer shift ─────────────────────────────────────────
        var footer = document.querySelector('.footer') || document.querySelector('footer');
        if (footer) {
            shiftThenRestore(footer, {
                marginTop: '60px'
            }, 700);
        }

        // ── 10. Re-strip any dynamically added images ───────────────
        // Catch images added by JS (product grids, etc.)
        setTimeout(function () {
            stripImageDimensions();
        }, 100);
        setTimeout(function () {
            stripImageDimensions();
        }, 1000);
        setTimeout(function () {
            stripImageDimensions();
        }, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShifts);
    } else {
        initShifts();
    }
})();
