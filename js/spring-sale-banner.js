/**
 * Spring Sale Banner
 * Loads 10 seconds after the entire page loads.
 * Intentionally causes CLS by inserting a banner at the top
 * of the page without pre-allocated space, shifting all content down.
 */
(function () {
    'use strict';

    window.addEventListener('load', function () {
        setTimeout(function () {
            // Create the banner element
            var banner = document.createElement('div');
            banner.id = 'spring-sale-banner';
            banner.style.cssText = 'width:100%;background:#E50010;color:#fff;text-align:center;padding:56px 20px;font-size:30px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;z-index:9999;position:relative;box-sizing:border-box;';
            banner.textContent = '\uD83C\uDF38 SPRING SALE \u2014 50% OFF \uD83C\uDF38';

            // Insert at the very top of <body>, above everything
            document.body.insertBefore(banner, document.body.firstChild);
        }, 10000); // 10 seconds
    });
})();
