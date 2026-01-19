/**
     * ╔══════════════════════════════════════════════════════════════════╗
     * ║           SLIDE PRESENTATION CONTROLLER (Dark Theme)              ║
     * ╚══════════════════════════════════════════════════════════════════╝
     *
     * Fitur:
     * - Fade in/fade out transitions
     * - Navigasi tombol Next/Prev
     * - Pagination bullets
     * - Keyboard: ← →, Home/End
     * - Scroll navigation
     * - Swipe gesture untuk mobile
     * - Speaker notes toggle
     */

    class SlidePresentation {
      constructor() {
        this.currentSlide = 0;
        this.totalSlides = document.querySelectorAll('.slide').length;
        this.wrapper = document.getElementById('slidesWrapper');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.counter = document.getElementById('slideCounter');
        this.pagination = document.getElementById('pagination');
        this.notesToggle = document.getElementById('notesToggle');
        this.notesPanel = document.getElementById('notesPanel');
        this.notesContent = document.getElementById('notesContent');

        this.init();
      }

      init() {
        this.createPagination();
        this.bindEvents();
        // this.setupScroll(); // disabled agar scroll halaman normal
        this.updateNotes();
        this.updateCounter();
        this.updateButtons();
        this.initSkillBars();

        console.log(`🎯 Slide Presentation initialized with ${this.totalSlides} slides (Dark Theme)`);
      }

      createPagination() {
        for (let i = 0; i < this.totalSlides; i++) {
          const dot = document.createElement('button');
          dot.className = 'pagination-dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
          dot.dataset.slide = i;
          dot.addEventListener('click', () => this.goTo(i));
          this.pagination.appendChild(dot);
        }
      }

      bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        document.addEventListener('keydown', (e) => {
          switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
            case '^':
            case 'PageUp':
              e.preventDefault();
              this.prev();
              break;
            case 'ArrowRight':
            case 'ArrowDown':
            case 'v':
            case 'PageDown':
            case ' ':
              e.preventDefault();
              this.next();
              break;
            case 'Home':
              e.preventDefault();
              this.goTo(0);
              break;
            case 'End':
              e.preventDefault();
              this.goTo(this.totalSlides - 1);
              break;
          }
        });

        this.notesToggle.addEventListener('click', () => this.toggleNotes());
        this.setupSwipe();
      }

      // setupSwipe() {
      //   let touchStartX = 0, touchEndX = 0;
// 
      //   this.wrapper.addEventListener('touchstart', (e) => {
      //     touchStartX = e.changedTouches[0].screenX;
      //   }, { passive: true });
// 
      //   this.wrapper.addEventListener('touchend', (e) => {
      //     touchEndX = e.changedTouches[0].screenX;
      //     const diff = touchStartX - touchEndX;
      //     if (Math.abs(diff) > 50) {
      //       diff > 0 ? this.next() : this.prev();
      //     }
      //   }, { passive: true });
// 
      //   let isDragging = false, dragStartX = 0;
      //   this.wrapper.addEventListener('mousedown', (e) => {
      //     if (e.button === 0) { isDragging = true; dragStartX = e.clientX; }
      //   });
      //   document.addEventListener('mouseup', (e) => {
      //     if (isDragging) {
      //       const diff = dragStartX - e.clientX;
      //       if (Math.abs(diff) > 50) { diff > 0 ? this.next() : this.prev(); }
      //       isDragging = false;
      //     }
      //   });
      // }

      setupSwipe() {
  // allow vertical native scrolling by default
  try { this.wrapper.style.touchAction = 'pan-y'; } catch(e){ /* ignore */ }

  let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

  this.wrapper.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStartX = t.screenX;
    touchStartY = t.screenY;
  }, { passive: true });

  // detect intent during move: if mostly horizontal, prevent default (so we can handle slide)
  this.wrapper.addEventListener('touchmove', (e) => {
    const t = e.changedTouches[0];
    const dx = Math.abs(t.screenX - touchStartX);
    const dy = Math.abs(t.screenY - touchStartY);

    // only intercept if horizontal movement is significantly larger than vertical
    if (dx > 10 && dx > dy * 1.2) {
      // we want to handle horizontal swipe — prevent native horizontal/pan
      e.preventDefault(); // must be passive: false for this to work
    } else {
      // otherwise let the browser handle vertical scroll
      // do NOT call preventDefault
    }
  }, { passive: false });

  this.wrapper.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    touchEndX = t.screenX;
    touchEndY = t.screenY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // if horizontal swipe dominates and exceeds threshold -> next / prev
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      diffX > 0 ? this.next() : this.prev();
    }
    // else do nothing (allow native scroll)
  }, { passive: true });

  // existing mouse drag fallback (desktop)
  let isDragging = false, dragStartX = 0;
  this.wrapper.addEventListener('mousedown', (e) => {
    if (e.button === 0) { isDragging = true; dragStartX = e.clientX; }
  });
  document.addEventListener('mouseup', (e) => {
    if (isDragging) {
      const diff = dragStartX - e.clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? this.next() : this.prev(); }
      isDragging = false;
    }
  });
}


      setupScroll() {
        let isScrolling = false, scrollTimeout;

        this.wrapper.addEventListener('wheel', (e) => {
          e.preventDefault();
          if (isScrolling) return;

          isScrolling = true;
          clearTimeout(scrollTimeout);
          e.deltaY > 0 ? this.next() : this.prev();

          scrollTimeout = setTimeout(() => { isScrolling = false; }, 600);
        }, { passive: false });
      }

      initSkillBars() {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const bar = entry.target;
              const percentage = bar.getAttribute('data-skill') || '0';
              setTimeout(() => { bar.style.width = percentage + '%'; }, 200);
              observer.unobserve(bar);
            }
          });
        }, { threshold: 0.3 });

        document.querySelectorAll('.progress-fill[data-skill]').forEach(bar => observer.observe(bar));
      }

      goTo(index, direction = 'next') {
        if (index < 0 || index >= this.totalSlides || index === this.currentSlide) return;

        const slides = document.querySelectorAll('.slide');
        const dots = this.pagination.querySelectorAll('.pagination-dot');
        const currentSlideEl = slides[this.currentSlide];
        const newSlideEl = slides[index];
        const isNext = index > this.currentSlide;

        // Use View Transitions API for element-level shared transitions
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            this.performTransition(slides, dots, currentSlideEl, newSlideEl, isNext, index);
          });
        } else {
          // Fallback
          this.performTransition(slides, dots, currentSlideEl, newSlideEl, isNext, index);
        }

        console.log(`📍 Slide: ${this.currentSlide + 1} / ${this.totalSlides}`);
      }

      performTransition(slides, dots, currentSlideEl, newSlideEl, isNext, newIndex) {
        // Animation classes for element-level transition
        const outClass = isNext ? 'animating-next' : 'animating-prev';
        const inClass = isNext ? 'animating-next-in' : 'animating-prev-in';

        // Remove all animation classes and reset styles from all slides
        slides.forEach(s => {
          s.classList.remove('active', 'prev', 'next',
            'animating-next', 'animating-prev',
            'animating-next-in', 'animating-prev-in',
            'shared-out-next', 'shared-out-prev',
            'shared-in-next', 'shared-in-prev',
            'anim-out-next', 'anim-out-prev',
            'anim-in-next', 'anim-in-prev');
          s.style.opacity = '';
          s.style.visibility = '';
          s.style.position = '';
          s.style.transform = '';
        });

        // Get shared elements in current and new slide
        const currentSharedElements = currentSlideEl.querySelectorAll('.shared-element');
        const newSharedElements = newSlideEl.querySelectorAll('.shared-element');

        // Reset shared element inline styles (keep animation property)
        currentSharedElements.forEach(el => {
          el.style.transform = '';
          el.style.opacity = '';
        });
        newSharedElements.forEach(el => {
          el.style.transform = '';
          el.style.opacity = '';
        });

        // Set initial state for new slide
        newSlideEl.classList.add(isNext ? 'next' : 'prev');
        newSlideEl.style.transform = isNext ? 'translateX(100%)' : 'translateX(-100%)';

        // Force reflow to ensure transitions trigger
        void currentSlideEl.offsetWidth;

        // Add animation classes to slides for shared element transition
        currentSlideEl.classList.add(outClass);
        newSlideEl.classList.remove(isNext ? 'next' : 'prev');
        newSlideEl.classList.add(inClass);

        // Update dots
        dots[this.currentSlide].classList.remove('active');
        dots[newIndex].classList.add('active');

        // Update current index
        this.currentSlide = newIndex;

        // After animation completes - clean up and set final states
        setTimeout(() => {
          // Remove animation classes from slides
          currentSlideEl.classList.remove(outClass);
          newSlideEl.classList.remove(inClass);

          // Reset shared element styles
          currentSharedElements.forEach(el => {
            el.style.transform = '';
            el.style.opacity = '';
          });
          newSharedElements.forEach(el => {
            el.style.transform = '';
            el.style.opacity = '';
          });

          // Set final active state
          newSlideEl.classList.add('active');
          newSlideEl.style.position = 'relative';
          newSlideEl.style.zIndex = '10';
          newSlideEl.style.transform = '';

          // Set position classes for slides around current
          slides.forEach((slide, i) => {
            if (i < this.currentSlide) {
              slide.classList.add('prev');
              slide.classList.remove('next', 'active');
              slide.style.position = 'absolute';
              slide.style.transform = 'translateX(-100%)';
            } else if (i > this.currentSlide) {
              slide.classList.add('next');
              slide.classList.remove('prev', 'active');
              slide.style.position = 'absolute';
              slide.style.transform = 'translateX(100%)';
            } else {
              slide.classList.add('active');
              slide.classList.remove('prev', 'next');
              slide.style.position = 'relative';
              slide.style.zIndex = '10';
              slide.style.transform = '';
            }
          });

          this.updateCounter();
          this.updateNotes();
          this.updateButtons();
          this.initSkillBars();
        }, 500);
      }

      next() {
        if (this.currentSlide < this.totalSlides - 1) this.goTo(this.currentSlide + 1);
      }

      prev() {
        if (this.currentSlide > 0) this.goTo(this.currentSlide - 1);
      }

      updateCounter() {
        this.counter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
      }

      updateButtons() {
        this.prevBtn.disabled = this.currentSlide === 0;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
      }

      updateNotes() {
        const slide = document.querySelectorAll('.slide')[this.currentSlide];
        const notes = slide.dataset.notes || 'Tidak ada notes untuk slide ini.';
        this.notesContent.textContent = notes;
      }

      toggleNotes() {
        const isVisible = this.notesPanel.classList.toggle('visible');
        this.notesToggle.classList.toggle('active', isVisible);
      }
    }

    /* ═══════════════════════════════════════════════════════════════════
       MAZE LOADING ANIMATION (Sama seperti index.html)
       ═══════════════════════════════════════════════════════════════════ */
    const mazeCanvas = document.getElementById('mazeCanvas');
    const mazeCtx = mazeCanvas.getContext('2d');
    const loaderWrapper = document.getElementById('loader-wrapper');
    const progressFill = document.getElementById('progressFill');

    const mazeConfig = {
      cellSize: 25,
      wallGap: 2,
      speed: 25,
      colors: {
        wall: '#2a2a2a',
        path: '#111111',
        head: '#00ffcc',
        body: '#00ccaa',
        exit: '#ff0055'
      }
    };

    let mazeCols, mazeRows;
    let maze = [];
    let solutionPath = [];
    let currentStep = 0;
    let isMazeRunning = true;

    function initMazeLoader() {
      const maxW = window.innerWidth * 0.9;
      const maxH = window.innerHeight * 0.5;

      mazeCols = Math.floor(maxW / mazeConfig.cellSize);
      mazeRows = Math.floor(maxH / mazeConfig.cellSize);

      if (mazeCols % 2 === 0) mazeCols--;
      if (mazeRows % 2 === 0) mazeRows--;

      mazeCanvas.width = mazeCols * mazeConfig.cellSize;
      mazeCanvas.height = mazeRows * mazeConfig.cellSize;

      generateMaze();
      solveMaze();
      drawMazeStatic();
      animateSnake();
    }

    function generateMaze() {
      maze = Array(mazeRows).fill().map(() => Array(mazeCols).fill(1));

      const stack = [];
      const start = {x: 1, y: 1};
      maze[start.y][start.x] = 0;
      stack.push(start);

      const dirs = [
        {x: 0, y: -2}, {x: 0, y: 2},
        {x: -2, y: 0}, {x: 2, y: 0}
      ];

      while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];

        dirs.forEach(d => {
          const nx = current.x + d.x;
          const ny = current.y + d.y;
          if (nx > 0 && nx < mazeCols - 1 && ny > 0 && ny < mazeRows - 1 && maze[ny][nx] === 1) {
            neighbors.push({nx, ny, dx: d.x/2, dy: d.y/2});
          }
        });

        if (neighbors.length > 0) {
          const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
          maze[current.y + chosen.dy][current.x + chosen.dx] = 0;
          maze[chosen.ny][chosen.nx] = 0;
          stack.push({x: chosen.nx, y: chosen.ny});
        } else {
          stack.pop();
        }
      }
    }

    function solveMaze() {
      const dirs = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];
      const visited = Array(mazeRows).fill().map(() => Array(mazeCols).fill(false));
      const parent = Array(mazeRows).fill().map(() => Array(mazeCols).fill(null));
      const queue = [{x: 1, y: 1}];
      visited[1][1] = true;

      let found = false;
      const endX = mazeCols - 2;
      const endY = mazeRows - 2;

      while (queue.length > 0 && !found) {
        const curr = queue.shift();

        if (curr.x === endX && curr.y === endY) {
          found = true;
          let temp = curr;
          while (temp) {
            solutionPath.unshift(temp);
            temp = parent[temp.y][temp.x];
          }
          return;
        }

        dirs.forEach(d => {
          const nx = curr.x + d.x;
          const ny = curr.y + d.y;
          if (nx >= 0 && nx < mazeCols && ny >= 0 && ny < mazeRows && maze[ny][nx] === 0 && !visited[ny][nx]) {
            visited[ny][nx] = true;
            parent[ny][nx] = curr;
            queue.push({x: nx, y: ny});
          }
        });
      }
    }

    function drawMazeStatic() {
      for (let y = 0; y < mazeRows; y++) {
        for (let x = 0; x < mazeCols; x++) {
          if (maze[y][x] === 1) {
            drawTile(x, y, mazeConfig.colors.wall);
          }
        }
      }
      const end = solutionPath[solutionPath.length - 1];
      drawTile(end.x, end.y, mazeConfig.colors.exit);
    }

    function drawTile(x, y, color) {
      const gap = mazeConfig.wallGap;
      const size = mazeConfig.cellSize - gap;
      mazeCtx.fillStyle = color;
      mazeCtx.fillRect(
        x * mazeConfig.cellSize + gap/2,
        y * mazeConfig.cellSize + gap/2,
        size, size
      );
    }

    let lastMazeTime = 0;
    function animateSnake(timestamp) {
      if (!isMazeRunning) return;

      if (timestamp - lastMazeTime > mazeConfig.speed) {
        drawMazeStatic();

        const progress = (currentStep / solutionPath.length) * 100;
        progressFill.style.width = `${progress}%`;

        const tailLength = 8;
        const startIndex = Math.max(0, currentStep - tailLength);

        for (let i = startIndex; i <= currentStep; i++) {
          const p = solutionPath[i];
          if (i === currentStep) {
            drawTile(p.x, p.y, mazeConfig.colors.head);
          } else {
            drawTile(p.x, p.y, mazeConfig.colors.body);
          }
        }

        if (currentStep < solutionPath.length - 1) {
          currentStep++;
        } else {
          finishMazeLoading();
          return;
        }

        lastMazeTime = timestamp;
      }
      requestAnimationFrame(animateSnake);
    }

    function finishMazeLoading() {
      isMazeRunning = false;
      setTimeout(() => {
        // Get slides and set initial position
        const slides = document.querySelectorAll('.slide');
        const container = document.querySelector('.slides-container');

        // Reset all slides
        slides.forEach((slide, i) => {
          slide.style.transition = 'none';
          slide.style.opacity = '0';
          slide.style.visibility = 'hidden';
          slide.style.position = 'absolute';
          slide.style.top = '0';
          slide.style.left = '0';
        });

        // Force reflow
        void slides[0].offsetWidth;

        // Set first slide as active (visible immediately)
        slides[0].style.opacity = '1';
        slides[0].style.visibility = 'visible';
        slides[0].style.position = 'relative';
        slides[0].style.zIndex = '10';
        slides[0].classList.add('active');

        // Set other slides to the right
        for (let i = 1; i < slides.length; i++) {
          slides[i].style.opacity = '0';
          slides[i].style.visibility = 'hidden';
          slides[i].style.transform = 'translateX(100%)';
          slides[i].classList.add('next');
        }

        // Show slides container immediately
        container.style.opacity = '1';
        container.style.display = 'block';

        // Slide-Up + Fade out effect for loader
        loaderWrapper.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';
        loaderWrapper.style.transform = 'translateY(-50px)';
        loaderWrapper.style.opacity = '0';

        setTimeout(() => {
          loaderWrapper.style.display = 'none';
          document.body.style.overflow = '';
          console.log('🚀 Presentation ready!');
        }, 600);
      }, 500);
    }

    // Initialize maze loader
    initMazeLoader();

    document.addEventListener('DOMContentLoaded', () => {
      window.presentation = new SlidePresentation();
    });