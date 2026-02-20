/**
 * CLS Degradation Script
 * Intentionally introduces Cumulative Layout Shift (CLS) issues
 * to degrade the CLS metric above 0.25
 */

(function () {
    'use strict';

    // ── 1. Late-inject a promotional banner ABOVE the fold ──────────
    // This pushes ALL content below it downward after initial paint
    function injectLateBanner() {
        const header = document.querySelector('.header') || document.querySelector('header');
        if (!header) return;

        setTimeout(() => {
            const banner = document.createElement('div');
            banner.id = 'cls-promo-banner';
            banner.style.cssText = `
                background: #e50010;
                color: white;
                text-align: center;
                padding: 14px 20px;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.5px;
                z-index: 9999;
                position: relative;
                width: 100%;
            `;
            banner.innerHTML = '🔥 FLASH SALE: Up to 70% off — Ends tonight! <span style="text-decoration:underline;cursor:pointer;margin-left:8px">Shop Now</span>';
            header.parentNode.insertBefore(banner, header);
        }, 300); // Inject after 300ms – after initial paint but before user scrolls
    }

    // ── 2. Resize the hero section after load ───────────────────────
    // Changes hero height, causing everything below to shift
    function resizeHeroLate() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Set initial constrained height, then expand
        hero.style.minHeight = '200px';
        hero.style.maxHeight = '200px';
        hero.style.overflow = 'hidden';
        hero.style.transition = 'none';

        setTimeout(() => {
            hero.style.minHeight = '';
            hero.style.maxHeight = '';
            hero.style.overflow = '';
        }, 600);
    }

    // ── 3. Inject a "cookie consent" bar that pushes content ────────
    // A bottom bar that changes to a top bar, causing shift
    function injectCookieBar() {
        setTimeout(() => {
            const bar = document.createElement('div');
            bar.id = 'cls-cookie-bar';
            bar.style.cssText = `
                position: relative;
                background: #222;
                color: #fff;
                padding: 16px 24px;
                font-size: 13px;
                text-align: center;
                z-index: 10000;
                width: 100%;
                line-height: 1.5;
            `;
            bar.innerHTML = `
                We use cookies to give you the best experience. By continuing you agree to our 
                <a href="#" style="color:#e50010;text-decoration:underline">Cookie Policy</a>.
                <button style="background:#e50010;color:white;border:none;padding:6px 20px;margin-left:12px;cursor:pointer;font-size:13px">Accept</button>
            `;
            // Insert at the very top of body – pushes everything down
            document.body.insertBefore(bar, document.body.firstChild);

            // Add click handler to dismiss
            bar.querySelector('button').addEventListener('click', () => {
                bar.remove(); // This also causes a reverse shift
            });
        }, 500);
    }

    // ── 4. Dynamically change font sizes causing text reflow ────────
    function causeTextReflow() {
        setTimeout(() => {
            // Change header nav text size
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.style.fontSize = '15px';
                link.style.letterSpacing = '1.5px';
                link.style.padding = '8px 16px';
            });

            // Change product titles 
            const productTitles = document.querySelectorAll('.text-xl, .text-2xl, h2');
            productTitles.forEach(title => {
                if (title.offsetTop < window.innerHeight) { // Only above the fold
                    title.style.fontSize = (parseFloat(getComputedStyle(title).fontSize) + 4) + 'px';
                    title.style.lineHeight = '1.3';
                    title.style.marginBottom = '24px';
                }
            });
        }, 400);
    }

    // ── 5. Late-load a "Recently Viewed" section above products ─────
    function injectRecentlyViewed() {
        const productGrid = document.querySelector('.product-grid') ||
            document.querySelector('#kids-product-grid') ||
            document.querySelector('#home-product-grid');

        if (!productGrid) return;

        setTimeout(() => {
            const section = document.createElement('div');
            section.style.cssText = `
                padding: 20px 0;
                margin-bottom: 16px;
                border-bottom: 1px solid #e4e4e4;
            `;
            section.innerHTML = `
                <h3 style="font-size:16px;font-weight:600;margin-bottom:12px">Recently Viewed</h3>
                <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px">
                    <div style="flex:0 0 120px;height:160px;background:#f4f4f4"></div>
                    <div style="flex:0 0 120px;height:160px;background:#f4f4f4"></div>
                    <div style="flex:0 0 120px;height:160px;background:#f4f4f4"></div>
                    <div style="flex:0 0 120px;height:160px;background:#f4f4f4"></div>
                </div>
            `;

            // Insert BEFORE the product grid – shifts it down
            productGrid.parentNode.insertBefore(section, productGrid);
        }, 700);
    }

    // ── 6. Remove image dimensions to cause reflow ──────────────────
    function stripImageDimensions() {
        // Remove width/height attributes from ALL images
        // This causes them to have 0 height initially, then expand when loaded
        const images = document.querySelectorAll('img[width][height]');
        images.forEach(img => {
            img.removeAttribute('width');
            img.removeAttribute('height');
        });
    }

    // ── 7. Swap web font causing FOUT (Flash of Unstyled Text) ──────
    function causeFontSwap() {
        // Inject a custom font that loads late and changes text metrics
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'HM-Late-Swap';
                src: url('https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2') format('woff2');
                font-display: swap;
                font-weight: 400;
            }
        `;
        document.head.appendChild(style);

        // After font loads, apply it to headings – causes text to reflow
        setTimeout(() => {
            document.querySelectorAll('h1, h2, h3, .hero-title').forEach(el => {
                if (el.offsetTop < window.innerHeight * 1.5) {
                    el.style.fontFamily = "'HM-Late-Swap', serif";
                }
            });
        }, 800);
    }

    // ── 8. Resize announcement banner ───────────────────────────────
    function resizeAnnouncementBanner() {
        const banner = document.querySelector('.bc6fab') || document.querySelector('.header-banner');
        if (!banner) return;

        // Start small, then expand
        const originalPadding = getComputedStyle(banner).padding;
        banner.style.padding = '4px 8px';
        banner.style.fontSize = '10px';

        setTimeout(() => {
            banner.style.padding = '12px 20px';
            banner.style.fontSize = '14px';
            banner.style.lineHeight = '1.6';
        }, 350);
    }

    // ── Execute all CLS degradation techniques ──────────────────────
    function init() {
        // Immediate: strip image dimensions before they load
        stripImageDimensions();

        // On DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                resizeAnnouncementBanner();
                injectLateBanner();
                resizeHeroLate();
                causeTextReflow();
                injectCookieBar();
                injectRecentlyViewed();
                causeFontSwap();
            });
        } else {
            resizeAnnouncementBanner();
            injectLateBanner();
            resizeHeroLate();
            causeTextReflow();
            injectCookieBar();
            injectRecentlyViewed();
            causeFontSwap();
        }
    }

    init();
})();
