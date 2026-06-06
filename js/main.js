const navbar = document.querySelector(".main-navbar");
const toggler = document.querySelector(".custom-toggler");
const navbarCollapse = document.querySelector("#mainNavbar");
const navLinks = document.querySelectorAll(".main-navbar .nav-link");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

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

function animateSlider() {
  if (productSlider && !userInteracting) {
    const maxScroll = productSlider.scrollWidth - productSlider.clientWidth;

    productSlider.scrollLeft += direction * 0.6;

    if (productSlider.scrollLeft >= maxScroll - 2) {
      direction = -1;
    }

    if (productSlider.scrollLeft <= 2) {
      direction = 1;
    }
  }

  requestAnimationFrame(animateSlider);
}

if (productSlider) {
  productSlider.addEventListener("mousedown", (e) => {
    isDown = true;
    userInteracting = true;
    productSlider.classList.add("active");

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
    productSlider.classList.remove("active");

    setTimeout(() => {
      userInteracting = false;
    }, 1200);
  });

  productSlider.addEventListener("mouseleave", () => {
    isDown = false;
    productSlider.classList.remove("active");

    setTimeout(() => {
      userInteracting = false;
    }, 1200);
  });

  productSlider.addEventListener("touchstart", () => {
    userInteracting = true;
  });

  productSlider.addEventListener("touchend", () => {
    setTimeout(() => {
      userInteracting = false;
    }, 1200);
  });

  window.addEventListener("load", animateSlider);
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
        let current = 0;
        const duration = 1600;
        const stepTime = 16;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;

        const updateCounter = () => {
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
