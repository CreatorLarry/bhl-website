const navbar = document.querySelector(".main-navbar");
const toggler = document.querySelector(".custom-toggler");
const navbarCollapse = document.querySelector("#mainNavbar");
const navLinks = document.querySelectorAll(".main-navbar .nav-link");

window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  },
  { passive: true },
);

toggler.addEventListener("click", () => {
  toggler.classList.toggle("active");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);

    if (bsCollapse) {
      bsCollapse.hide();
    }

    toggler.classList.remove("active");
  });
});

document.addEventListener("click", (event) => {
  const clickedInsideNavbar = navbar.contains(event.target);
  const menuIsOpen = navbarCollapse.classList.contains("show");

  if (!clickedInsideNavbar && menuIsOpen) {
    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);

    if (bsCollapse) {
      bsCollapse.hide();
    }

    toggler.classList.remove("active");
  }
});

navbarCollapse.addEventListener("hidden.bs.collapse", () => {
  toggler.classList.remove("active");
});

//  Product Auto + Drag Slider
//  Ping-pong movement

const productSlider = document.querySelector(".product-slider");

let isDown = false;
let startX = 0;
let scrollLeft = 0;
let direction = 1; // 1 = move right, -1 = move left
let userInteracting = false;
let interactionTimer;
let sliderAnimationFrame = null;
let sliderIsVisible = false;
let lastFrameTime = 0;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function animateSlider(timestamp) {
  sliderAnimationFrame = null;

  if (
    !productSlider ||
    !sliderIsVisible ||
    document.hidden ||
    reducedMotionQuery.matches
  ) {
    return;
  }

  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  if (!userInteracting) {
    const maxScroll = productSlider.scrollWidth - productSlider.clientWidth;
    const elapsed = Math.min(timestamp - lastFrameTime, 32);
    const nextScroll = productSlider.scrollLeft + direction * elapsed * 0.036;

    if (nextScroll >= maxScroll) {
      productSlider.scrollLeft = maxScroll;
      direction = -1;
    } else if (nextScroll <= 0) {
      productSlider.scrollLeft = 0;
      direction = 1;
    } else {
      productSlider.scrollLeft = nextScroll;
    }
  }

  lastFrameTime = timestamp;
  sliderAnimationFrame = requestAnimationFrame(animateSlider);
}

function startSliderAnimation() {
  if (
    sliderAnimationFrame !== null ||
    !sliderIsVisible ||
    document.hidden ||
    reducedMotionQuery.matches
  ) {
    return;
  }

  lastFrameTime = 0;
  sliderAnimationFrame = requestAnimationFrame(animateSlider);
}

function stopSliderAnimation() {
  if (sliderAnimationFrame !== null) {
    cancelAnimationFrame(sliderAnimationFrame);
    sliderAnimationFrame = null;
  }

  lastFrameTime = 0;
}

function beginSliderInteraction() {
  clearTimeout(interactionTimer);
  userInteracting = true;
  stopSliderAnimation();
}

function endSliderInteraction() {
  clearTimeout(interactionTimer);
  interactionTimer = setTimeout(() => {
    userInteracting = false;
    startSliderAnimation();
  }, 1200);
}

if (productSlider) {
  productSlider.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;

    isDown = true;
    beginSliderInteraction();

    startX = e.pageX - productSlider.offsetLeft;
    scrollLeft = productSlider.scrollLeft;
  });

  productSlider.addEventListener("mousemove", (e) => {
    if (!isDown) return;

    e.preventDefault();

    const x = e.pageX - productSlider.offsetLeft;
    const walk = (x - startX) * 1.6;

    productSlider.scrollLeft = scrollLeft - walk;
  });

  productSlider.addEventListener("mouseup", () => {
    isDown = false;
    endSliderInteraction();
  });

  productSlider.addEventListener("mouseleave", () => {
    if (!isDown) return;

    isDown = false;
    endSliderInteraction();
  });

  productSlider.addEventListener("touchstart", beginSliderInteraction, {
    passive: true,
  });

  productSlider.addEventListener("touchend", endSliderInteraction);
  productSlider.addEventListener("touchcancel", endSliderInteraction);

  const sliderObserver = new IntersectionObserver(([entry]) => {
    sliderIsVisible = entry.isIntersecting;

    if (sliderIsVisible) {
      startSliderAnimation();
    } else {
      stopSliderAnimation();
    }
  });

  sliderObserver.observe(productSlider);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopSliderAnimation();
    } else {
      startSliderAnimation();
    }
  });

  reducedMotionQuery.addEventListener("change", () => {
    if (reducedMotionQuery.matches) {
      stopSliderAnimation();
    } else {
      startSliderAnimation();
    }
  });
}

/* =========================
   Animated Counters
========================= */

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = Number(counter.dataset.target);

        if (reducedMotionQuery.matches) {
          counter.textContent = target;
          counterObserver.unobserve(counter);
          return;
        }

        let current = 0;
        const duration = 1600;
        const stepTime = 16;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;

        const updateCounter = () => {
          if (reducedMotionQuery.matches) {
            counter.textContent = target;
            return;
          }

          current += increment;

          if (current < target) {
            counter.textContent = Math.ceil(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };

        updateCounter();
        counterObserver.unobserve(counter);
      }
    });
  },
  { threshold: 0.45 },
);

counters.forEach((counter) => {
  counterObserver.observe(counter);
});

/* =========================
   Gallery Filter + Lightbox
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".gallery-filter");
  const galleryItems = document.querySelectorAll(".gallery-item");

  const lightbox = document.getElementById("galleryLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const closeBtn = document.getElementById("lightboxClose");
  const nextBtn = document.getElementById("lightboxNext");
  const prevBtn = document.getElementById("lightboxPrev");

  let visibleItems = Array.from(galleryItems);
  let currentIndex = 0;
  let lastFocusedElement = null;
  const lightboxControls = [closeBtn, prevBtn, nextBtn];

  function updateVisibleItems() {
    visibleItems = Array.from(galleryItems).filter((item) => {
      return item.style.display !== "none";
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterValue = button.getAttribute("data-filter");

      filterButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      galleryItems.forEach((item) => {
        const category = item.getAttribute("data-category");

        if (filterValue === "all" || filterValue === category) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });

      updateVisibleItems();
    });
  });

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      updateVisibleItems();

      currentIndex = visibleItems.indexOf(item);

      const img = item.querySelector("img");

      if (!img || !lightbox || !lightboxImage) return;

      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || "Gallery image";

      lastFocusedElement = item;
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    });
  });

  function closeLightbox() {
    if (!lightbox.classList.contains("active")) return;

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function showImage(index) {
    if (!visibleItems.length) return;

    if (index < 0) {
      currentIndex = visibleItems.length - 1;
    } else if (index >= visibleItems.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    const img = visibleItems[currentIndex].querySelector("img");

    if (!img) return;

    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "Gallery image";
  }

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showImage(currentIndex + 1);
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showImage(currentIndex - 1);
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Tab") {
      const firstControl = lightboxControls[0];
      const lastControl = lightboxControls[lightboxControls.length - 1];

      if (e.shiftKey && document.activeElement === firstControl) {
        e.preventDefault();
        lastControl.focus();
      } else if (!e.shiftKey && document.activeElement === lastControl) {
        e.preventDefault();
        firstControl.focus();
      } else if (!lightboxControls.includes(document.activeElement)) {
        e.preventDefault();
        firstControl.focus();
      }
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      showImage(currentIndex + 1);
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      showImage(currentIndex - 1);
    }
  });
});

/* =========================
   Page Loader
========================= */

const pageLoader = document.getElementById("pageLoader");

if (pageLoader) {
  window.addEventListener(
    "load",
    () => {
      pageLoader.classList.add("hide");
      pageLoader.addEventListener("transitionend", () => pageLoader.remove(), {
        once: true,
      });
    },
    { once: true },
  );
}
