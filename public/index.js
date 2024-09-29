const inputs = document.querySelectorAll(".input-field");
const toggle_btn = document.querySelectorAll(".toggle");
const main = document.querySelector("main");
const bullets = document.querySelectorAll(".bullets span");
const images = document.querySelectorAll(".image");

inputs.forEach((inp) => {
  inp.addEventListener("focus", () => {
    inp.classList.add("active");
  });
  inp.addEventListener("blur", () => {
    if (inp.value != "") return;
    inp.classList.remove("active");
  });
});

toggle_btn.forEach((btn) => {
  btn.addEventListener("click", () => {
    main.classList.toggle("sign-up-mode");
  });
});

// Get references to elements
const textSlider = document.querySelector(".text-group");

// Function to move the slider based on index
function moveSlider() {
  let index = this ? this.dataset.value : 1; // Default to the first slide if not clicked
  
  let currentImage = document.querySelector(`.img-${index}`);
  images.forEach((img) => img.classList.remove("show"));
  currentImage.classList.add("show");

  textSlider.style.transform = `translateY(${-(index - 1) * 2.2}rem)`;

  bullets.forEach((bull) => bull.classList.remove("active"));
  document.querySelector(`.bullets span[data-value="${index}"]`).classList.add("active");
}

// Function to handle automatic slider transitions
function autoSlide() {
  let currentIndex = 1; // Start from the first slide
  moveSlider.call(document.querySelector(`.bullets span[data-value="${currentIndex}"]`)); // Show the first slide

  setInterval(() => {
    currentIndex = (currentIndex % bullets.length) + 1; // Cycle through slides
    moveSlider.call(document.querySelector(`.bullets span[data-value="${currentIndex}"]`));
  }, 2000); // Change slide every 2 seconds
}

// Set up event listeners for manual control
bullets.forEach((bullet) => {
  bullet.addEventListener("click", moveSlider);
});

// Start automatic sliding
autoSlide();
