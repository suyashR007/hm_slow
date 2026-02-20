// Performance Degradation Script
// Intended to simulate a slow website for research purposes (Stimuli 2)

(function () {
  console.log("Initializing Performance Degradation...");

  const slowSectionSelectors = [
    "section",
    ".hero",
    ".product-grid",
    ".category-section",
    ".newsletter",
    ".footer",
    ".banner-section",
    ".trending-section",
    ".promo-section",
    "main > *",
  ];

  const sectionSelectorText = slowSectionSelectors
    .map((selector) => `html.slow-mode ${selector}`)
    .join(", ");

  const sectionVisibleSelectorText = slowSectionSelectors
    .map((selector) => `html.slow-mode ${selector}.slow-section-visible`)
    .join(", ");

  // Inject styles early to prevent flashes before JS kicks in
  if (!document.getElementById("slow-mode-styles")) {
    const style = document.createElement("style");
    style.id = "slow-mode-styles";
    style.textContent = `
${sectionSelectorText} {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
${sectionVisibleSelectorText} {
  opacity: 1;
  transform: translateY(0);
}
html.slow-mode .slow-media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(245, 245, 245, 0.92);
  color: #3a3a3a;
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  z-index: 3;
}
html.slow-mode .slow-media-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #c7c7c7;
  border-top-color: #e50010;
  border-radius: 50%;
  animation: slow-spin 1s linear infinite;
}
html.slow-mode .slow-media-hidden {
  opacity: 0;
  transition: opacity 0.5s ease;
}
html.slow-mode .slow-media-loaded .slow-media-overlay {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
html.slow-mode img.slow-media-img {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes slow-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
    document.head.appendChild(style);
  }

  document.documentElement.classList.add("slow-mode");

  /* ------------------------------------------------------------------ */
  /* Helper: busy-wait to block the main thread                          */
  /* ------------------------------------------------------------------ */
  function blockMainThread(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
      /* busy wait */
    }
  }

  /* ------------------------------------------------------------------ */
  /* 1. FCP Delay - block immediately during HTML parsing (~3.5 s)       */
  /* ------------------------------------------------------------------ */
  console.log("Blocking for FCP delay...");
  blockMainThread(3500);
  console.log("FCP delay released.");

  /* ------------------------------------------------------------------ */
  /* 2. All remaining effects on DOMContentLoaded                        */
  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    const heroRoot = document.querySelector(".hero");

    function isHeroMedia(el) {
      return heroRoot ? heroRoot.contains(el) : false;
    }

    function computeDelay(index, extraDelay) {
      const base = 3000 + index * 800;
      const withExtra = base + (extraDelay || 0);
      return Math.min(withExtra, 12000);
    }

    function ensureOverlay(container) {
      if (!container) return null;

      if (!container.classList.contains("slow-media-parent")) {
        container.classList.add("slow-media-parent");
      }
      if (!container.classList.contains("slow-media-loading")) {
        container.classList.add("slow-media-loading");
      }
      if (!container.getAttribute("aria-busy")) {
        container.setAttribute("aria-busy", "true");
      }

      if (container.querySelector(".slow-media-overlay")) {
        return container;
      }

      const computed = window.getComputedStyle(container);
      if (computed.position === "static") {
        container.style.position = "relative";
      }

      const overlay = document.createElement("div");
      overlay.className = "slow-media-overlay";
      overlay.setAttribute("aria-hidden", "true");

      const spinner = document.createElement("div");
      spinner.className = "slow-media-spinner";

      const text = document.createElement("div");
      text.className = "slow-media-text";
      text.textContent = "Loading media";

      overlay.appendChild(spinner);
      overlay.appendChild(text);
      container.appendChild(overlay);
      return container;
    }

    function markMediaLoaded(container, media) {
      if (!container || container.classList.contains("slow-media-loaded")) {
        return;
      }
      container.classList.add("slow-media-loaded");
      container.classList.remove("slow-media-loading");
      container.setAttribute("aria-busy", "false");
      if (media) {
        media.classList.remove("slow-media-hidden");
        media.classList.remove("slow-media-img");
      }
      const overlay = container.querySelector(".slow-media-overlay");
      if (overlay) {
        setTimeout(() => {
          overlay.remove();
        }, 500);
      }
    }

    function rememberAttribute(el, attr, dataKey) {
      const value = el.getAttribute(attr);
      if (value) {
        el.dataset[dataKey] = value;
      }
      el.removeAttribute(attr);
    }

    function restoreAttribute(el, attr, dataKey) {
      const value = el.dataset[dataKey];
      if (value) {
        el.setAttribute(attr, value);
      }
    }

    function prepareImage(img, index) {
      if (!img || img.closest("picture")) {
        return;
      }

      const originalSrc = img.getAttribute("src") || img.src;
      const originalSrcset = img.getAttribute("srcset");
      const originalSizes = img.getAttribute("sizes");

      if (!originalSrc && !originalSrcset) {
        return;
      }

      if (originalSrc) {
        img.dataset.slowSrc = originalSrc;
      }
      if (originalSrcset) {
        img.dataset.slowSrcset = originalSrcset;
      }
      if (originalSizes) {
        img.dataset.slowSizes = originalSizes;
      }

      img.removeAttribute("src");
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");

      img.classList.add("slow-media-hidden", "slow-media-img");

      const container = ensureOverlay(img.parentElement || img);
      const extraDelay = isHeroMedia(img) ? 1500 : 0;
      const delay = computeDelay(index, extraDelay);

      const onLoad = () => markMediaLoaded(container, img);
      img.addEventListener("load", onLoad, { once: true });
      img.addEventListener("error", onLoad, { once: true });

      setTimeout(() => {
        restoreAttribute(img, "srcset", "slowSrcset");
        restoreAttribute(img, "sizes", "slowSizes");
        if (img.dataset.slowSrc) {
          img.setAttribute("src", img.dataset.slowSrc);
          img.src = img.dataset.slowSrc;
        }
      }, delay);

      setTimeout(() => markMediaLoaded(container, img), delay + 8000);
    }

    function preparePicture(picture, index) {
      if (!picture) return;
      const img = picture.querySelector("img");
      if (!img) return;

      const sources = Array.from(picture.querySelectorAll("source"));
      sources.forEach((source) => {
        rememberAttribute(source, "srcset", "slowSrcset");
        rememberAttribute(source, "sizes", "slowSizes");
      });

      rememberAttribute(img, "src", "slowSrc");
      rememberAttribute(img, "srcset", "slowSrcset");
      rememberAttribute(img, "sizes", "slowSizes");

      img.classList.add("slow-media-hidden", "slow-media-img");

      const container = ensureOverlay(picture);
      const extraDelay = isHeroMedia(picture) ? 1500 : 0;
      const delay = computeDelay(index, extraDelay);

      const onLoad = () => markMediaLoaded(container, img);
      img.addEventListener("load", onLoad, { once: true });
      img.addEventListener("error", onLoad, { once: true });

      setTimeout(() => {
        sources.forEach((source) => {
          restoreAttribute(source, "srcset", "slowSrcset");
          restoreAttribute(source, "sizes", "slowSizes");
        });
        restoreAttribute(img, "srcset", "slowSrcset");
        restoreAttribute(img, "sizes", "slowSizes");
        if (img.dataset.slowSrc) {
          img.setAttribute("src", img.dataset.slowSrc);
          img.src = img.dataset.slowSrc;
        }
      }, delay);

      setTimeout(() => markMediaLoaded(container, img), delay + 8000);
    }

    function prepareVideo(video, index) {
      if (!video) return;

      const sources = Array.from(video.querySelectorAll("source"));
      rememberAttribute(video, "src", "slowSrc");
      sources.forEach((source) => {
        rememberAttribute(source, "src", "slowSrc");
      });

      video.classList.add("slow-media-hidden");

      const container = ensureOverlay(video.parentElement || video);
      const extraDelay = isHeroMedia(video) ? 2000 : 500;
      const delay = computeDelay(index, extraDelay);

      const onLoaded = () => markMediaLoaded(container, video);
      video.addEventListener("loadeddata", onLoaded, { once: true });
      video.addEventListener("error", onLoaded, { once: true });

      setTimeout(() => {
        restoreAttribute(video, "src", "slowSrc");
        sources.forEach((source) => restoreAttribute(source, "src", "slowSrc"));
        video.load();
        if (video.autoplay) {
          video.play().catch(() => {});
        }
      }, delay);

      setTimeout(() => markMediaLoaded(container, video), delay + 10000);
    }

    const pictures = Array.from(document.querySelectorAll("picture"));
    pictures.forEach((picture, index) => preparePicture(picture, index));

    const allImages = Array.from(document.querySelectorAll("img"));
    const standaloneImages = allImages.filter((img) => !img.closest("picture"));
    standaloneImages.forEach((img, index) =>
      prepareImage(img, index + pictures.length)
    );

    const allVideos = Array.from(document.querySelectorAll("video"));
    allVideos.forEach((video, index) =>
      prepareVideo(video, index + pictures.length + standaloneImages.length)
    );

    const sectionTargets = new Set();
    slowSectionSelectors.forEach((selector) => {
      document
        .querySelectorAll(selector)
        .forEach((el) => sectionTargets.add(el));
    });

    const sections = Array.from(sectionTargets);
    sections.forEach((el, index) => {
      const delay = Math.min(4000 + index * 1200, 16000);
      setTimeout(() => {
        el.classList.add("slow-section-visible");
      }, delay);
    });

    /* ------------------------------------------------------------------ */
    /* 2e. TTI Degradation                                                  */
    /* ------------------------------------------------------------------ */
    setInterval(() => {
      blockMainThread(200);
    }, 1000);
  });
})();
