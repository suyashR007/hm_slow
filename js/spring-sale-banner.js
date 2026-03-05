/**
 * Spring Sale Banner
 * Loads 10 seconds after the entire page loads.
 * Intentionally causes CLS by inserting a banner at the top
 * of the page without pre-allocated space, shifting all content down.
 *
 * Also injects a mid-page 50% OFF banner between the campaign photos
 * and the New Arrivals section, causing a mid-page layout shift.
 */
(function () {
    'use strict';

    window.addEventListener('load', function () {
        setTimeout(function () {
            // ── 1. Top banner: insert at top of <body> ──────────────────
            var banner = document.createElement('div');
            banner.id = 'spring-sale-banner';
            banner.style.cssText = 'width:100%;background:#E50010;color:#fff;text-align:center;padding:56px 20px;font-size:30px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;z-index:9999;position:relative;box-sizing:border-box;';
            banner.textContent = '\uD83C\uDF38 SPRING SALE \u2014 50% OFF \uD83C\uDF38';

            // Insert at the very top of <body>, above everything
            document.body.insertBefore(banner, document.body.firstChild);

            // ── 2. Mid-page banner: insert before the New Arrivals section ──
            var midBanner = document.createElement('div');
            midBanner.id = 'mid-sale-banner';
            midBanner.style.cssText = 'width:100%;background:#E50010;color:#fff;text-align:center;padding:56px 20px;font-size:30px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;position:relative;box-sizing:border-box;';
            midBanner.textContent = '\uD83C\uDF38 SPRING SALE \u2014 50% OFF \uD83C\uDF38';

            // Find the New Arrivals section by looking for the h2 with text "New Arrivals"
            var headings = document.querySelectorAll('h2');
            var newArrivalsSection = null;
            for (var i = 0; i < headings.length; i++) {
                if (headings[i].textContent.trim() === 'New Arrivals') {
                    newArrivalsSection = headings[i].closest('section');
                    break;
                }
            }

            if (newArrivalsSection) {
                // Insert the mid banner right before the New Arrivals section
                newArrivalsSection.parentNode.insertBefore(midBanner, newArrivalsSection);
            }
        }, 10000); // 10 seconds after load
    });
})();
