// Performance Degradation Script
// Intended to simulate a slow website for research purposes (Stimuli 2)

(function() {
    console.log('Initializing Performance Degradation...');

    function blockMainThread(ms) {
        const start = Date.now();
        while (Date.now() - start < ms) {
            // Busy wait to block the main thread
        }
    }

    // 1. FCP Delay: Block immediately during parsing
    // This runs as soon as the script is encountered in <head>
    // Target: > 3.0s
    console.log('Blocking for FCP delay...');
    blockMainThread(3500); 
    console.log('FCP delay released.');

    // 2. LCP Delay & CLS Injection & TTI Degradation
    document.addEventListener('DOMContentLoaded', () => {
        
        // 2a. LCP Delay: Delay the Hero Image
        // We find the hero image and re-assign its source after a delay
        // Target: > 4.0s
        const heroImages = document.querySelectorAll('.hero-img, .hero picture source');
        const originalSources = [];

        heroImages.forEach(el => {
            if (el.tagName === 'IMG') {
                originalSources.push({ el, src: el.src });
                el.src = ''; // Clear source to delay loading
            } else if (el.tagName === 'SOURCE') {
                originalSources.push({ el, srcset: el.srcset });
                el.srcset = ''; // Clear source to delay loading
            }
        });

        setTimeout(() => {
            console.log('Restoring LCP content...');
            originalSources.forEach(item => {
                if (item.src) item.el.src = item.src;
                if (item.srcset) item.el.srcset = item.srcset;
            });
        }, 1500); // 3500ms (initial) + 1500ms = 5000ms total delay for LCP image start

        // 2b. CLS Injection
        // Insert a large banner at the top to shift content down
        // Target: > 0.25
        setTimeout(() => {
            console.log('Triggering CLS...');
            const banner = document.createElement('div');
            banner.style.width = '100%';
            banner.style.height = '200px';
            banner.style.backgroundColor = '#f0f0f0';
            banner.style.color = '#333';
            banner.style.display = 'flex';
            banner.style.alignItems = 'center';
            banner.style.justifyContent = 'center';
            banner.style.fontSize = '24px';
            banner.style.fontWeight = 'bold';
            banner.innerText = 'SPECIAL OFFER - LOADING...';
            
            // Insert at the very top of body
            document.body.prepend(banner);
        }, 4000); // Occurs after initial paint

        // 2c. TTI Degradation
        // Periodic blocking to reduce interactivity
        // Target: > 7.3s
        setInterval(() => {
            // Block for 200ms every 1 second
            // This creates "Long Tasks" preventing interactivity
            blockMainThread(200);
        }, 1000);

    });

})();
