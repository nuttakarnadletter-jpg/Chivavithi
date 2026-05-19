/* About background parallax */
const aloeHero = document.querySelector(".aloe-hero");
const aloeBg = document.querySelector(".aloe-bg");

if (aloeHero && aloeBg) {
  let aboutParallaxFrame;

  const updateAboutParallax = () => {
    aboutParallaxFrame = undefined;
    const rect = aloeHero.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const clamped = Math.max(0, Math.min(1, progress));
    const offset = (clamped - 0.5) * 260;
    aloeBg.style.setProperty("--about-parallax", `${offset.toFixed(2)}px`);
  };

  const requestAboutParallax = () => {
    if (aboutParallaxFrame) return;
    aboutParallaxFrame = window.requestAnimationFrame(updateAboutParallax);
  };

  window.addEventListener("scroll", requestAboutParallax, { passive: true });
  window.addEventListener("resize", requestAboutParallax);
  requestAboutParallax();
}

/* Hero banner slider */
const heroBanner = document.querySelector(".hero-banner");
const heroTrack = document.querySelector(".hero-track");
const heroDots = [...document.querySelectorAll(".hero-dots button")];

if (heroBanner && heroTrack && heroDots.length) {
  let heroIndex = 0;
  let heroTimer;
  let heroDragStartX = 0;
  let heroIsDragging = false;

  const showHeroSlide = (index) => {
    heroIndex = (index + heroDots.length) % heroDots.length;
    heroTrack.style.transform = `translateX(-${heroIndex * 100}%)`;
    heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === heroIndex);
    });
  };

  const startHeroAutoSlide = () => {
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(() => {
      showHeroSlide(heroIndex + 1);
    }, 4200);
  };

  const pauseHeroAutoSlide = () => {
    window.clearInterval(heroTimer);
  };

  heroDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showHeroSlide(index);
      startHeroAutoSlide();
    });
  });

  heroBanner.addEventListener("pointerdown", (event) => {
    heroIsDragging = true;
    heroDragStartX = event.clientX;
    pauseHeroAutoSlide();
  });

  heroBanner.addEventListener("pointerup", (event) => {
    if (!heroIsDragging) return;
    const distance = event.clientX - heroDragStartX;
    if (Math.abs(distance) > 40) {
      showHeroSlide(heroIndex + (distance < 0 ? 1 : -1));
    }
    heroIsDragging = false;
    startHeroAutoSlide();
  });

  heroBanner.addEventListener("pointercancel", () => {
    heroIsDragging = false;
    startHeroAutoSlide();
  });
  heroBanner.addEventListener("mouseenter", pauseHeroAutoSlide);
  heroBanner.addEventListener("mouseleave", startHeroAutoSlide);
  heroBanner.addEventListener("focusin", pauseHeroAutoSlide);
  heroBanner.addEventListener("focusout", startHeroAutoSlide);

  showHeroSlide(0);
  startHeroAutoSlide();
}

/* Ingredient carousel: arrows, auto-slide, and desktop drag */
const ingredientViewport = document.querySelector(".ingredient-viewport");
const ingredientTrack = document.querySelector(".ingredient-track");
const prevIngredient = document.querySelector(".ingredient-carousel .prev");
const nextIngredient = document.querySelector(".ingredient-carousel .next");

if (ingredientViewport && ingredientTrack && prevIngredient && nextIngredient) {
  let autoSlideTimer;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;

  const getStep = () => {
    const card = ingredientTrack.querySelector(".ingredient-card");
    if (!card) return 242;
    const styles = getComputedStyle(ingredientTrack);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const getMaxScroll = () => ingredientViewport.scrollWidth - ingredientViewport.clientWidth;

  const updateButtons = () => {
    const maxScroll = getMaxScroll();
    prevIngredient.disabled = ingredientViewport.scrollLeft <= 2;
    nextIngredient.disabled = ingredientViewport.scrollLeft >= maxScroll - 2;
  };

  const scrollByStep = (direction) => {
    ingredientViewport.scrollBy({ left: getStep() * direction, behavior: "smooth" });
  };

  const startAutoSlide = () => {
    window.clearInterval(autoSlideTimer);
    autoSlideTimer = window.setInterval(() => {
      const maxScroll = getMaxScroll();
      const nearEnd = ingredientViewport.scrollLeft >= maxScroll - 2;
      ingredientViewport.scrollTo({
        left: nearEnd ? 0 : ingredientViewport.scrollLeft + getStep(),
        behavior: "smooth",
      });
    }, 3200);
  };

  const pauseAutoSlide = () => {
    window.clearInterval(autoSlideTimer);
  };

  prevIngredient.addEventListener("click", () => {
    scrollByStep(-1);
    startAutoSlide();
  });

  nextIngredient.addEventListener("click", () => {
    scrollByStep(1);
    startAutoSlide();
  });

  ingredientViewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return;
    isDragging = true;
    dragStartX = event.clientX;
    dragStartScrollLeft = ingredientViewport.scrollLeft;
    ingredientViewport.classList.add("is-dragging");
    ingredientViewport.setPointerCapture(event.pointerId);
    pauseAutoSlide();
  });

  ingredientViewport.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    ingredientViewport.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
  });

  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    ingredientViewport.classList.remove("is-dragging");
    if (event.pointerId !== undefined && ingredientViewport.hasPointerCapture(event.pointerId)) {
      ingredientViewport.releasePointerCapture(event.pointerId);
    }
    startAutoSlide();
  };

  ingredientViewport.addEventListener("pointerup", endDrag);
  ingredientViewport.addEventListener("pointercancel", endDrag);
  ingredientViewport.addEventListener("mouseenter", pauseAutoSlide);
  ingredientViewport.addEventListener("mouseleave", () => {
    if (!isDragging) startAutoSlide();
  });
  ingredientViewport.addEventListener("focusin", pauseAutoSlide);
  ingredientViewport.addEventListener("focusout", startAutoSlide);
  ingredientViewport.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);

  ingredientViewport.scrollLeft = 0;
  updateButtons();
  startAutoSlide();
}

/* Customer review carousel */
const reviewViewport = document.querySelector('.review-viewport');
const reviewTrack = document.querySelector('.review-track');
const reviewDotsContainer = document.querySelector('.review-dots');

if (reviewViewport && reviewTrack && reviewDotsContainer) {
  let reviewAutoSlideTimer;
  let reviewIsDragging = false;
  let reviewDragStartX = 0;
  let reviewDragStartScrollLeft = 0;

  const getReviewGap = () => Number.parseFloat(getComputedStyle(reviewTrack).gap) || 0;
  const getReviewCard = () => reviewTrack.querySelector('.video-card');
  const getReviewStep = () => {
    const card = getReviewCard();
    if (!card) return reviewViewport.clientWidth;
    return card.getBoundingClientRect().width + getReviewGap();
  };
  const getReviewsPerPage = () => {
    const step = getReviewStep();
    return Math.max(1, Math.round((reviewViewport.clientWidth + getReviewGap()) / step));
  };
  const getReviewPageCount = () => Math.max(1, Math.ceil(reviewTrack.children.length / getReviewsPerPage()));
  const getReviewPage = () => Math.round(reviewViewport.scrollLeft / (getReviewStep() * getReviewsPerPage()));

  const getReviewDots = () => [...reviewDotsContainer.querySelectorAll('button')];

  const renderReviewDots = () => {
    const pageCount = getReviewPageCount();
    reviewDotsContainer.innerHTML = '';
    Array.from({ length: pageCount }, (_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `ชุดรีวิว ${index + 1}`);
      dot.addEventListener('click', () => {
        goToReviewPage(index);
        startReviewAutoSlide();
      });
      reviewDotsContainer.append(dot);
    });
  };

  const updateReviewDots = () => {
    const reviewDots = getReviewDots();
    const page = Math.min(reviewDots.length - 1, getReviewPage());
    reviewDots.forEach((dot, index) => dot.classList.toggle('is-active', index === page));
  };

  const goToReviewPage = (page) => {
    reviewViewport.scrollTo({ left: getReviewStep() * getReviewsPerPage() * page, behavior: 'smooth' });
  };

  const startReviewAutoSlide = () => {
    window.clearInterval(reviewAutoSlideTimer);
    reviewAutoSlideTimer = window.setInterval(() => {
      const pageCount = getReviewPageCount();
      const nextPage = (getReviewPage() + 1) % pageCount;
      goToReviewPage(nextPage);
    }, 3600);
  };

  const pauseReviewAutoSlide = () => window.clearInterval(reviewAutoSlideTimer);

  reviewViewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') return;
    reviewIsDragging = true;
    reviewDragStartX = event.clientX;
    reviewDragStartScrollLeft = reviewViewport.scrollLeft;
    reviewViewport.classList.add('is-dragging');
    reviewViewport.setPointerCapture(event.pointerId);
    pauseReviewAutoSlide();
  });

  reviewViewport.addEventListener('pointermove', (event) => {
    if (!reviewIsDragging) return;
    reviewViewport.scrollLeft = reviewDragStartScrollLeft - (event.clientX - reviewDragStartX);
  });

  const endReviewDrag = (event) => {
    if (!reviewIsDragging) return;
    reviewIsDragging = false;
    reviewViewport.classList.remove('is-dragging');
    if (event.pointerId !== undefined && reviewViewport.hasPointerCapture(event.pointerId)) {
      reviewViewport.releasePointerCapture(event.pointerId);
    }
    startReviewAutoSlide();
  };

  reviewViewport.addEventListener('pointerup', endReviewDrag);
  reviewViewport.addEventListener('pointercancel', endReviewDrag);
  reviewViewport.addEventListener('mouseenter', pauseReviewAutoSlide);
  reviewViewport.addEventListener('mouseleave', () => {
    if (!reviewIsDragging) startReviewAutoSlide();
  });
  reviewViewport.addEventListener('focusin', pauseReviewAutoSlide);
  reviewViewport.addEventListener('focusout', startReviewAutoSlide);
  reviewViewport.addEventListener('scroll', updateReviewDots, { passive: true });
  window.addEventListener('resize', () => {
    renderReviewDots();
    updateReviewDots();
  });

  renderReviewDots();
  updateReviewDots();
  startReviewAutoSlide();
}

/* Mobile hamburger menu */
const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (siteHeader && menuToggle && navLinks) {
  const closeMenu = () => {
    siteHeader.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'เปิดเมนู');
  };

  menuToggle.addEventListener('click', () => {
    const willOpen = !siteHeader.classList.contains('menu-open');
    siteHeader.classList.toggle('menu-open', willOpen);
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.setAttribute('aria-label', willOpen ? 'ปิดเมนู' : 'เปิดเมนู');
  });

  navLinks.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 560) closeMenu();
  });
}

/* Ingredient dots for mobile and narrow viewports */
const ingredientDotsContainer = document.querySelector('.ingredient-dots');

if (ingredientViewport && ingredientTrack && ingredientDotsContainer) {
  const ingredientCards = [...ingredientTrack.querySelectorAll('.ingredient-card')];
  const getIngredientGap = () => Number.parseFloat(getComputedStyle(ingredientTrack).gap) || 0;
  const getIngredientStep = () => {
    const card = ingredientCards[0];
    if (!card) return ingredientViewport.clientWidth;
    return card.getBoundingClientRect().width + getIngredientGap();
  };

  const renderIngredientDots = () => {
    ingredientDotsContainer.innerHTML = '';
    ingredientCards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `วัตถุดิบ ${index + 1}`);
      dot.addEventListener('click', () => {
        ingredientViewport.scrollTo({ left: getIngredientStep() * index, behavior: 'smooth' });
      });
      ingredientDotsContainer.append(dot);
    });
  };

  const updateIngredientDots = () => {
    const dots = [...ingredientDotsContainer.querySelectorAll('button')];
    const index = Math.min(dots.length - 1, Math.round(ingredientViewport.scrollLeft / getIngredientStep()));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  };

  ingredientViewport.addEventListener('scroll', updateIngredientDots, { passive: true });
  window.addEventListener('resize', updateIngredientDots);
  renderIngredientDots();
  updateIngredientDots();
}

/* Header level-2 submenu */
const submenuItems = [...document.querySelectorAll('.nav-item.has-submenu')];

if (submenuItems.length) {
  const closeSubmenus = (exceptItem) => {
    submenuItems.forEach((item) => {
      if (item === exceptItem) return;
      item.classList.remove('is-open');
      item.querySelector('.nav-trigger')?.setAttribute('aria-expanded', 'false');
    });
  };

  submenuItems.forEach((item) => {
    const trigger = item.querySelector('.nav-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('is-open');
      closeSubmenus(item);
      item.classList.toggle('is-open', shouldOpen);
      trigger.setAttribute('aria-expanded', String(shouldOpen));
    });
  });

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('.nav-item.has-submenu')) return;
    closeSubmenus();
  });
}
