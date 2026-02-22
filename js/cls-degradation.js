/**
 * CLS Degradation Script — Target: CLS > 2.5
 *
 * Strategy:
 * CLS = Σ (impact_fraction × distance_fraction) for each layout shift.
 * To exceed 2.5 we need many large shifts of visible, in-viewport elements.
 *
 * Key technique: Insert a transparent (but visible to layout) spacer div at
 * the top of <body>. When its height pulses from 0 → Npx → 0, every element
 * below it shifts. Because those elements ARE visible, each shift counts for CLS.
 * The spacer itself is transparent so the user never sees it.
 *
 * Additionally: strip image dimension attributes so images cause reflow on load,
 * and remove aspect-ratio containers so images have no reserved space.
 */

(function () {
    'use strict';

    // ── Helper: force a layout shift by changing margin on the first
    //    visible element in the page. This pushes all siblings below it. ──

    /**
     * Shift all visible content by adding temporary margin to the header.
     * We use marginTop on <header> (which is visible) rather than a hidden
     * spacer, because CLS only measures shifts of VISIBLE elements.
     */
    function shiftVisibleContent(amount) {
        // Find main visible containers that, when shifted, push other
        // visible content down. Header is always visible.
        var header = document.querySelector('header, .header');
        if (!header) return;

        header.style.transition = 'none';
        header.style.marginTop = amount + 'px';
        // Force synchronous layout
        void header.offsetHeight;

        // After two animation frames, snap back (causes second shift)
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                header.style.marginTop = '0px';
                void header.offsetHeight;
            });
        });
    }

    /**
     * Shift content by dynamically inserting a full-width colored bar
     * (matches background so it's invisible) then removing it.
     * The bar is opacity:0.01 (nearly invisible but visible to CLS).
     */
    function insertPhantomBar(height) {
        var bar = document.createElement('div');
        bar.style.cssText =
            'width:100%;height:' + height + 'px;' +
            'opacity:0.01;background:#fff;' +
            'position:relative;z-index:-1;' +
            'pointer-events:none;margin:0;padding:0;';
        bar.setAttribute('aria-hidden', 'true');

        // Insert at the very beginning of body
        if (document.body.firstChild) {
            document.body.insertBefore(bar, document.body.firstChild);
        } else {
            document.body.appendChild(bar);
        }

        // Force layout
        void bar.offsetHeight;

        // Remove after next frame — this shifts everything back up
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                if (bar.parentNode) {
                    bar.parentNode.removeChild(bar);
                }
            });
        });
    }

    // ── Strip image dimensions so images reflow on load ──
    function stripImageDimensions() {
        var images = document.querySelectorAll('img[width][height]');
        for (var i = 0; i < images.length; i++) {
            images[i].removeAttribute('width');
            images[i].removeAttribute('height');
        }
    }

    // Run immediately during parse
    stripImageDimensions();

    // ── Inject CSS that removes all space reservations for images ──
    function injectAntiReservationCSS() {
        var style = document.createElement('style');
        style.textContent = [
            // Remove aspect-ratio containers
            '[class*="aspect-"] { aspect-ratio: auto !important; min-height: 0 !important; }',
            // Make images auto-height
            'img { height: auto !important; }',
            // Remove hero min-height
            '.hero { min-height: auto !important; }',
        ].join('\n');
        document.head.appendChild(style);
    }

    // ── Main init after DOM ready ──
    function initShifts() {
        injectAntiReservationCSS();
        stripImageDimensions();

        // ═══════════════════════════════════════════════
        // WAVE 1: Immediate shifts (200-1500ms)
        // The header and above-fold content are visible.
        // ═══════════════════════════════════════════════
        setTimeout(function () { shiftVisibleContent(200); }, 200);
        setTimeout(function () { insertPhantomBar(250); }, 500);
        setTimeout(function () { shiftVisibleContent(300); }, 800);
        setTimeout(function () { insertPhantomBar(200); }, 1100);
        setTimeout(function () { shiftVisibleContent(250); }, 1400);

        // ═══════════════════════════════════════════════
        // WAVE 2: Mid-load shifts (2000-3500ms)
        // ═══════════════════════════════════════════════
        setTimeout(function () { insertPhantomBar(300); }, 2000);
        setTimeout(function () { shiftVisibleContent(350); }, 2400);
        setTimeout(function () { insertPhantomBar(280); }, 2800);
        setTimeout(function () { shiftVisibleContent(320); }, 3200);

        // ═══════════════════════════════════════════════
        // WAVE 3: After sections revealed (4000-6000ms)
        // performance-delay.js reveals sections ~4000ms
        // ═══════════════════════════════════════════════
        setTimeout(function () { insertPhantomBar(350); }, 4000);
        setTimeout(function () { shiftVisibleContent(300); }, 4400);
        setTimeout(function () { insertPhantomBar(250); }, 4800);

        // Shift product grids (now visible)
        setTimeout(function () {
            var grids = document.querySelectorAll('.product-grid');
            for (var i = 0; i < grids.length; i++) {
                (function (grid) {
                    grid.style.transition = 'none';
                    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                    void grid.offsetHeight;
                    requestAnimationFrame(function () {
                        grid.style.gridTemplateColumns = '';
                    });
                })(grids[i]);
            }
        }, 5200);

        setTimeout(function () { shiftVisibleContent(280); }, 5500);
        setTimeout(function () { insertPhantomBar(320); }, 5800);

        // ═══════════════════════════════════════════════
        // WAVE 4: Late shifts (6000-8000ms)
        // ═══════════════════════════════════════════════
        setTimeout(function () { insertPhantomBar(300); }, 6200);
        setTimeout(function () { shiftVisibleContent(350); }, 6600);
        setTimeout(function () { insertPhantomBar(280); }, 7000);
        setTimeout(function () { shiftVisibleContent(250); }, 7400);
        setTimeout(function () { insertPhantomBar(400); }, 7800);

        // ═══════════════════════════════════════════════
        // WAVE 5: Very late (8000-12000ms)
        // ═══════════════════════════════════════════════
        setTimeout(function () { shiftVisibleContent(300); }, 8500);
        setTimeout(function () { insertPhantomBar(350); }, 9000);
        setTimeout(function () { shiftVisibleContent(280); }, 9500);
        setTimeout(function () { insertPhantomBar(300); }, 10000);
        setTimeout(function () { shiftVisibleContent(350); }, 10500);
        setTimeout(function () { insertPhantomBar(250); }, 11000);
        setTimeout(function () { shiftVisibleContent(300); }, 11500);

        // ═══════════════════════════════════════════════
        // CONTINUOUS: Recurring shift pulse every 600ms
        // Each adds ~0.05-0.15 to CLS.
        // 50 pulses × ~0.1 avg = ~5.0 CLS contribution
        // ═══════════════════════════════════════════════
        var count = 0;
        var maxPulses = 50;
        var interval = setInterval(function () {
            count++;
            if (count > maxPulses) {
                clearInterval(interval);
                return;
            }
            // Alternate between techniques
            if (count % 2 === 0) {
                var amounts = [200, 280, 320, 250, 350, 300, 400, 220, 260, 340];
                shiftVisibleContent(amounts[count % amounts.length]);
            } else {
                var barHeights = [250, 300, 280, 350, 320, 200, 380, 270, 310, 240];
                insertPhantomBar(barHeights[count % barHeights.length]);
            }
        }, 600);

        // ═══════════════════════════════════════════════
        // ELEMENT-SPECIFIC SHIFTS
        // ═══════════════════════════════════════════════

        // Shift nav links
        setTimeout(function () {
            var navLinks = document.querySelectorAll('.nav-link');
            for (var n = 0; n < navLinks.length; n++) {
                (function (link) {
                    link.style.transition = 'none';
                    link.style.padding = '15px 30px';
                    void link.offsetHeight;
                    requestAnimationFrame(function () {
                        link.style.padding = '';
                    });
                })(navLinks[n]);
            }
        }, 3000);

        // Shift containers
        setTimeout(function () {
            var containers = document.querySelectorAll('.container');
            for (var c = 0; c < Math.min(containers.length, 6); c++) {
                (function (container, delay) {
                    setTimeout(function () {
                        container.style.transition = 'none';
                        container.style.paddingTop = '60px';
                        void container.offsetHeight;
                        requestAnimationFrame(function () {
                            container.style.paddingTop = '';
                        });
                    }, delay);
                })(containers[c], c * 400);
            }
        }, 5000);

        // Shift headings
        setTimeout(function () {
            var headings = document.querySelectorAll('h1, h2, h3');
            for (var h = 0; h < headings.length; h++) {
                (function (heading, delay) {
                    setTimeout(function () {
                        heading.style.transition = 'none';
                        heading.style.marginBottom = '60px';
                        void heading.offsetHeight;
                        requestAnimationFrame(function () {
                            heading.style.marginBottom = '';
                        });
                    }, delay);
                })(headings[h], h * 300);
            }
        }, 6000);

        // Shift hero section
        setTimeout(function () {
            var hero = document.querySelector('.hero');
            if (hero) {
                hero.style.transition = 'none';
                hero.style.marginBottom = '150px';
                void hero.offsetHeight;
                requestAnimationFrame(function () {
                    hero.style.marginBottom = '';
                });
            }
        }, 4500);

        // Shift footer
        setTimeout(function () {
            var footer = document.querySelector('.footer, footer');
            if (footer) {
                footer.style.transition = 'none';
                footer.style.marginTop = '100px';
                void footer.offsetHeight;
                requestAnimationFrame(function () {
                    footer.style.marginTop = '';
                });
            }
        }, 7500);

        // Strip image dimensions repeatedly for dynamically loaded content
        setTimeout(stripImageDimensions, 100);
        setTimeout(stripImageDimensions, 2000);
        setTimeout(stripImageDimensions, 4000);
        setTimeout(stripImageDimensions, 6000);
        setTimeout(stripImageDimensions, 8000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShifts);
    } else {
        initShifts();
    }
})();
