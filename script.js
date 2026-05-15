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
