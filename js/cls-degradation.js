/**
 * CLS Degradation Script
 * Causes Cumulative Layout Shift (CLS) > 0.25 WITHOUT adding any
 * new visible UI elements. Works by shifting existing elements
 * AFTER they become visible on screen.
 *
 * Key insight: CLS only counts shifts of VISIBLE elements.
 * performance-delay.js reveals sections starting at ~4000ms,
 * so our shifts must fire AFTER that to be counted.
 */

(function () {
    'use strict';

    // ── 1. Strip image dimensions immediately ───────────────────────
    // Without width/height, images reflow when they load.
    // The aspect-ratio containers may prevent some of this,
    // but standalone images will still shift.
    function stripImageDimensions() {
        var images = document.querySelectorAll('img[width][height]');
        for (var i = 0; i < images.length; i++) {
            images[i].removeAttribute('width');
            images[i].removeAttribute('height');
        }
    }

    // Run immediately during parse
    stripImageDimensions();

    // ── After DOM ready, schedule shifts timed to section reveals ───
    function initShifts() {

        // performance-delay.js reveals sections at: 4000 + index * 1200 ms
        // We need our shifts to happen AFTER sections are visible.

        // ── 2. Shift header banner AFTER it becomes visible ─────────
        // The header-banner is usually visible quickly.
        // Add extra padding, wait, then snap it back.
        setTimeout(function () {
            var banner = document.querySelector('.header-banner');
            if (banner) {
                banner.style.transition = 'none';
                banner.style.paddingTop = '24px';
                banner.style.paddingBottom = '24px';
                // Snap back after a frame
                setTimeout(function () {
                    banner.style.paddingTop = '';
                    banner.style.paddingBottom = '';
                }, 80);
            }
        }, 4200); // After first section reveal

        // ── 3. Shift hero dimensions after it becomes visible ───────
        setTimeout(function () {
            var hero = document.querySelector('.hero');
            if (hero) {
                hero.style.transition = 'none';
                hero.style.marginBottom = '50px';
                setTimeout(function () {
                    hero.style.marginBottom = '';
                }, 80);
            }
        }, 4500);

        // ── 4. Shift product grid layout after visible ──────────────
        // Temporarily switch to 2 columns then back to 4
        setTimeout(function () {
            var grids = document.querySelectorAll('.product-grid');
            for (var i = 0; i < grids.length; i++) {
                (function (grid) {
                    grid.style.transition = 'none';
                    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                    setTimeout(function () {
                        grid.style.gridTemplateColumns = '';
                    }, 80);
                })(grids[i]);
            }
        }, 5500); // After product grid section reveals

        // ── 5. Shift container widths ───────────────────────────────
        setTimeout(function () {
            var containers = document.querySelectorAll('.container');
            for (var c = 0; c < Math.min(containers.length, 4); c++) {
                (function (container) {
                    container.style.transition = 'none';
                    container.style.paddingLeft = '40px';
                    container.style.paddingRight = '40px';
                    setTimeout(function () {
                        container.style.paddingLeft = '';
                        container.style.paddingRight = '';
                    }, 80);
                })(containers[c]);
            }
        }, 5000);

        // ── 6. Shift section spacing (visible sections only) ────────
        setTimeout(function () {
            var sections = document.querySelectorAll('section.slow-section-visible');
            for (var s = 0; s < sections.length; s++) {
                (function (section, idx) {
                    section.style.transition = 'none';
                    section.style.paddingTop = '35px';
                    section.style.paddingBottom = '35px';
                    setTimeout(function () {
                        section.style.paddingTop = '';
                        section.style.paddingBottom = '';
                    }, 80);
                })(sections[s], s);
            }
        }, 6000);

        // ── 7. Nav link spacing shift (header is always visible) ────
        setTimeout(function () {
            var navLinks = document.querySelectorAll('.nav-link');
            for (var n = 0; n < navLinks.length; n++) {
                (function (link) {
                    link.style.transition = 'none';
                    var origPad = link.style.padding;
                    link.style.padding = '10px 20px';
                    setTimeout(function () {
                        link.style.padding = origPad;
                    }, 80);
                })(navLinks[n]);
            }
        }, 4300);

        // ── 8. Heading margin shifts after visible ──────────────────
        setTimeout(function () {
            var headings = document.querySelectorAll('h1, h2');
            for (var h = 0; h < headings.length; h++) {
                (function (heading) {
                    // Only shift if element is currently in viewport
                    var rect = heading.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top < window.innerHeight) {
                        heading.style.transition = 'none';
                        var origMB = heading.style.marginBottom;
                        heading.style.marginBottom = '30px';
                        setTimeout(function () {
                            heading.style.marginBottom = origMB;
                        }, 80);
                    }
                })(headings[h]);
            }
        }, 5800);

        // ── 9. Second wave: shift again after more sections visible ─
        setTimeout(function () {
            // Shift hero content positioning
            var heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transition = 'none';
                heroContent.style.bottom = '25%';
                setTimeout(function () {
                    heroContent.style.bottom = '';
                }, 80);
            }

            // Shift the campaign/category section
            var categoryCards = document.querySelectorAll('.category-card, .aspect-\\[2\\/3\\]');
            for (var i = 0; i < Math.min(categoryCards.length, 4); i++) {
                (function (card) {
                    card.style.transition = 'none';
                    card.style.marginBottom = '20px';
                    setTimeout(function () {
                        card.style.marginBottom = '';
                    }, 80);
                })(categoryCards[i]);
            }
        }, 7000);

        // ── 10. Third wave: more shifts for higher CLS ──────────────
        setTimeout(function () {
            // Shift footer up
            var footer = document.querySelector('.footer, footer');
            if (footer) {
                footer.style.transition = 'none';
                footer.style.marginTop = '40px';
                setTimeout(function () {
                    footer.style.marginTop = '';
                }, 80);
            }

            // Re-shift grids
            var grids = document.querySelectorAll('.product-grid');
            for (var i = 0; i < grids.length; i++) {
                (function (grid) {
                    grid.style.transition = 'none';
                    grid.style.gap = '30px';
                    setTimeout(function () {
                        grid.style.gap = '';
                    }, 80);
                })(grids[i]);
            }
        }, 8000);

        // ── 11. Keep stripping image dimensions from dynamic content ─
        setTimeout(stripImageDimensions, 100);
        setTimeout(stripImageDimensions, 2000);
        setTimeout(stripImageDimensions, 4000);
        setTimeout(stripImageDimensions, 6000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShifts);
    } else {
        initShifts();
    }
})();
