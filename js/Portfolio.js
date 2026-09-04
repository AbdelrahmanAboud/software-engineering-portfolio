// ─── THREE.JS 3D WEBGL LIGHTWEIGHT SCENE (OPTIMIZED 60 FPS) ───
(function initThreeJS() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 35;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // Optimized Particle Field (160 particles)
  const particleCount = 160;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0x6366f1);
  const color2 = new THREE.Color(0x818cf8);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = (Math.random() - 0.5) * 160;
    positions[i + 2] = (Math.random() - 0.5) * 80;

    const mixedColor = Math.random() > 0.5 ? color1 : color2;
    colors[i] = mixedColor.r;
    colors[i + 1] = mixedColor.g;
    colors[i + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.9,
    vertexColors: true,
    transparent: true,
    opacity: 0.65
  });

  const particlesMesh = new THREE.Points(geometry, material);
  scene.add(particlesMesh);

  // Low-Poly Floating 3D Geometry
  const icoGeo = new THREE.IcosahedronGeometry(8, 0);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  icoMesh.position.set(22, -5, -10);
  scene.add(icoMesh);

  // Smooth Motion Tracking
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let currentScrollY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    currentScrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  function animateThree() {
    requestAnimationFrame(animateThree);

    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    particlesMesh.rotation.y += 0.0006;
    icoMesh.rotation.x += 0.0015;
    icoMesh.rotation.y += 0.002;

    const scrollTargetY = -(currentScrollY * 0.02);
    camera.position.y += (scrollTargetY - camera.position.y) * 0.06;
    camera.position.x += (targetX * 8 - camera.position.x) * 0.04;

    renderer.render(scene, camera);
  }

  animateThree();
})();

// ─── 3D MULTI-IMAGE CAROUSEL CONTROLLER ───
function moveCarousel(carouselId, direction) {
  const container = document.querySelector(`[data-carousel="${carouselId}"]`);
  if (!container) return;

  const slides = container.querySelectorAll('.slide-3d');
  const dots = container.querySelectorAll('.dot-indicator');
  let activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));

  if (activeIndex === -1) activeIndex = 0;

  slides[activeIndex].classList.remove('active');
  if (dots[activeIndex]) dots[activeIndex].classList.remove('active');

  let newIndex = activeIndex + direction;
  if (newIndex >= slides.length) newIndex = 0;
  if (newIndex < 0) newIndex = slides.length - 1;

  slides[newIndex].classList.add('active');
  if (dots[newIndex]) dots[newIndex].classList.add('active');
}

function setCarouselSlide(carouselId, slideIndex) {
  const container = document.querySelector(`[data-carousel="${carouselId}"]`);
  if (!container) return;

  const slides = container.querySelectorAll('.slide-3d');
  const dots = container.querySelectorAll('.dot-indicator');

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  if (slides[slideIndex]) slides[slideIndex].classList.add('active');
  if (dots[slideIndex]) dots[slideIndex].classList.add('active');
}

// ─── 3D GALLERY ENGINE ───
function updateGalleryState(galleryId) {
  const container = document.querySelector(`[data-draggable-gallery="${galleryId}"]`);
  const thumbsContainer = document.querySelector(`[data-thumbnails="${galleryId}"]`);
  if (!container) return;

  const slides = Array.from(container.querySelectorAll('.gallery-slide-3d'));
  const thumbs = thumbsContainer ? Array.from(thumbsContainer.querySelectorAll('.thumb')) : [];

  let activeIndex = slides.findIndex(s => s.classList.contains('active'));
  if (activeIndex === -1) activeIndex = 0;

  slides.forEach((slide, index) => {
    slide.classList.remove('active', 'prev-slide', 'next-slide', 'slide-exit-left', 'slide-enter-right');
    slide.style.transform = '';
    slide.style.opacity = '';
    slide.style.visibility = '';

    if (index === activeIndex) {
      slide.classList.add('active');
    } else if (index === (activeIndex - 1 + slides.length) % slides.length) {
      slide.classList.add('prev-slide');
    } else if (index === (activeIndex + 1) % slides.length) {
      slide.classList.add('next-slide');
    }
  });

  thumbs.forEach((thumb, index) => {
    thumb.classList.toggle('active', index === activeIndex);
  });

  if (thumbs[activeIndex]) {
    thumbs[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

function moveGallery(galleryId, direction) {
  const container = document.querySelector(`[data-draggable-gallery="${galleryId}"]`);
  if (!container) return;

  const slides = Array.from(container.querySelectorAll('.gallery-slide-3d'));
  let activeIndex = slides.findIndex(s => s.classList.contains('active'));
  if (activeIndex === -1) activeIndex = 0;

  const newIndex = (activeIndex + direction + slides.length) % slides.length;

  slides.forEach(s => s.classList.remove('active', 'prev-slide', 'next-slide'));
  slides[newIndex].classList.add('active');

  updateGalleryState(galleryId);
}

function setGallerySlide(galleryId, slideIndex) {
  const container = document.querySelector(`[data-draggable-gallery="${galleryId}"]`);
  if (!container) return;

  const slides = Array.from(container.querySelectorAll('.gallery-slide-3d'));
  slides.forEach(s => {
    s.classList.remove('active', 'slide-exit-left', 'slide-enter-right');
    s.style.transform = '';
    s.style.opacity = '';
    s.style.visibility = '';
  });

  if (slides[slideIndex]) {
    slides[slideIndex].classList.add('active');
  }

  updateGalleryState(galleryId);
}

// Mouse & Touch Drag / Swipe
(function initDraggableGalleries() {
  document.querySelectorAll('.draggable-gallery-3d').forEach(gallery => {
    const galleryId = gallery.dataset.draggableGallery;
    let startX = 0;
    let isDragging = false;

    updateGalleryState(galleryId);

    gallery.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      e.preventDefault();
    });

    gallery.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      if (deltaX > 45) {
        moveGallery(galleryId, -1);
        isDragging = false;
      } else if (deltaX < -45) {
        moveGallery(galleryId, 1);
        isDragging = false;
      }
    });

    gallery.addEventListener('mouseup', () => { isDragging = false; });
    gallery.addEventListener('mouseleave', () => { isDragging = false; });

    gallery.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    gallery.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;
      if (deltaX > 40) {
        moveGallery(galleryId, -1);
      } else if (deltaX < -40) {
        moveGallery(galleryId, 1);
      }
    }, { passive: true });
  });
})();

// ─── HIGH-PERFORMANCE 3D CARD TILT ENGINE ───
(function init3DTiltEngine() {
  const tiltElements = document.querySelectorAll('.tilt-element, .project-card, .skill-card');

  tiltElements.forEach(el => {
    let rect = null;
    let ticking = false;

    el.addEventListener('mouseenter', () => {
      rect = el.getBoundingClientRect();
      el.style.transition = 'none';
    }, { passive: true });

    el.addEventListener('mousemove', (e) => {
      if (!rect || ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateZ(8px)`;
        ticking = false;
      });
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      rect = null;
      el.style.transition = 'transform 0.4s ease-out';
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    }, { passive: true });
  });
})();

// ─── CURSOR ───
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
}, { passive: true });

function animateRing() {
  rx += (mx - rx) * 0.15;
  ry += (my - ry) * 0.15;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// ─── HEADER SCROLL ───
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ─── MOBILE MENU ───
function openMenu() {
  document.getElementById('mobileNav').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeMenu() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ─── DARK/LIGHT MODE ───
function toggleMode() {
  document.body.classList.toggle('light');
  const icon = document.querySelector('#modeBtn i');
  icon.classList.toggle('fa-sun');
  icon.classList.toggle('fa-moon');
}

// ─── SKILLS DATA WITH Devicon + FontAwesome REAL LOGOS ───
const skillsData = [
  { name: 'C++', pct: 95, level: 'EXPERT', category: 'languages', icon: '<i class="devicon-cplusplus-plain colored"></i>', url: 'https://en.cppreference.com' },
  { name: 'Flutter', pct: 90, level: 'EXPERT', category: 'mobile', icon: '<i class="devicon-flutter-plain colored"></i>', url: 'https://flutter.dev' },
  { name: 'Dart', pct: 90, level: 'EXPERT', category: 'mobile languages', icon: '<i class="devicon-dart-plain colored"></i>', url: 'https://dart.dev' },
  { name: 'HTML', pct: 90, level: 'EXPERT', category: 'frontend', icon: '<i class="devicon-html5-plain colored"></i>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
  { name: 'React', pct: 88, level: 'EXPERT', category: 'frontend', icon: '<i class="devicon-react-original colored"></i>', url: 'https://react.dev' },
  { name: 'JavaScript', pct: 85, level: 'ADVANCED', category: 'frontend languages', icon: '<i class="devicon-javascript-plain colored"></i>', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { name: 'Express', pct: 85, level: 'ADVANCED', category: 'backend', icon: '<i class="devicon-express-original colored"></i>', url: 'https://expressjs.com' },
  { name: 'CSS', pct: 80, level: 'ADVANCED', category: 'frontend', icon: '<i class="devicon-css3-plain colored"></i>', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
  { name: 'Java', pct: 80, level: 'ADVANCED', category: 'languages', icon: '<i class="devicon-java-plain colored"></i>', url: 'https://www.java.com' },
  { name: 'Node.js', pct: 80, level: 'ADVANCED', category: 'backend', icon: '<i class="devicon-nodejs-plain colored"></i>', url: 'https://nodejs.org' },
  { name: 'JavaFX', pct: 80, level: 'ADVANCED', category: 'frontend', icon: '<i class="devicon-java-plain colored"></i>', url: 'https://openjfx.io' },
  { name: 'Firebase', pct: 80, level: 'ADVANCED', category: 'backend', icon: '<i class="devicon-firebase-plain colored"></i>', url: 'https://firebase.google.com' },
  { name: 'MongoDB', pct: 75, level: 'INTERMEDIATE', category: 'backend', icon: '<i class="devicon-mongodb-plain colored"></i>', url: 'https://www.mongodb.com' },
  { name: 'Python', pct: 70, level: 'INTERMEDIATE', category: 'languages', icon: '<i class="devicon-python-plain colored"></i>', url: 'https://www.python.org' },
];

const grid = document.getElementById('skillsGrid');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      e.target.querySelectorAll('.skill-card-progress-bar').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.1 });

function renderSkills(filter = 'all') {
  if (!grid) return;
  grid.innerHTML = '';
  const filtered = skillsData.filter(s => {
    if (filter === 'all') return true;
    return s.category.split(' ').includes(filter);
  });

  filtered.forEach((s, index) => {
    const card = document.createElement('div');
    card.className = 'skill-card fade-up tilt-element';
    card.style.animationDelay = `${index * 30}ms`;
    card.title = `Click to visit official ${s.name} documentation`;
    
    card.addEventListener('click', () => {
      window.open(s.url, '_blank');
    });

    card.innerHTML = `
      <i class="fa-solid fa-arrow-up-right-from-square skill-link-icon"></i>
      <div class="skill-card-top">
        <div class="skill-card-icon">${s.icon}</div>
        <div class="skill-card-pct">${s.pct}%</div>
      </div>
      <div class="skill-card-info">
        <div class="skill-card-name">${s.name}</div>
        <div class="skill-card-level ${s.level.toLowerCase()}">${s.level}</div>
      </div>
      <div class="skill-card-progress">
        <div class="skill-card-progress-bar" data-width="${s.pct}"></div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Re-bind 3D tilt
  document.querySelectorAll('.skills-grid .skill-card').forEach(el => {
    let rect = null;
    let ticking = false;

    el.addEventListener('mouseenter', () => {
      rect = el.getBoundingClientRect();
      el.style.transition = 'none';
    }, { passive: true });

    el.addEventListener('mousemove', (e) => {
      if (!rect || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateZ(8px)`;
        ticking = false;
      });
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      rect = null;
      el.style.transition = 'transform 0.4s ease-out';
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    }, { passive: true });
  });

  document.querySelectorAll('.skills-grid .fade-up').forEach(el => {
    observer.observe(el);
    setTimeout(() => el.classList.add('visible'), 30);
  });
}

// Initial Render
renderSkills('all');

// Filter Buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const filterValue = e.currentTarget.getAttribute('data-filter');
    renderSkills(filterValue);
  });
});

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Hero reveal
document.querySelectorAll('.hero .fade-up').forEach((el, i) => {
  setTimeout(() => el.classList.add('visible'), i * 150);
});

// ─── SMOOTH SCROLL FOR NAVBAR & ANCHORS ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || !targetId) return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      const headerOffset = 80;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      closeMenu();
    }
  });
});