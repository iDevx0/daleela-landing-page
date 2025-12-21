  <script>
    // Countdown timer
    const target = Date.now() + 48 * 60 * 60 * 1000;
    const elements = {
      stickyHours: document.getElementById('sticky-hours'),
      stickyMinutes: document.getElementById('sticky-minutes'),
      stickySeconds: document.getElementById('sticky-seconds')
    };
    
    const pad = (n) => String(n).padStart(2, '0');
    
    setInterval(() => {
      const diff = Math.max(0, target - Date.now());
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (elements.stickyHours) elements.stickyHours.textContent = pad(totalHours);
      if (elements.stickyMinutes) elements.stickyMinutes.textContent = pad(minutes);
      if (elements.stickySeconds) elements.stickySeconds.textContent = pad(seconds);
    }, 1000);

    // Show sticky CTA when user reaches a target section
    (function() {
      const stickyCta = document.querySelector('.sticky-cta');
      const stickyShowAfterId = 'programs'; // change this ID to control where the sticky CTA appears
      const programsSection = document.getElementById(stickyShowAfterId);
      
      if (!stickyCta || !programsSection) {
        console.warn('Sticky CTA or programs section not found');
        return;
      }
      
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      let hasShown = false;
      
      // Function to show sticky CTA
      const showStickyCta = () => {
        if (!hasShown && stickyCta) {
          stickyCta.classList.remove('hidden');
          document.body.classList.add('has-sticky-cta');
          hasShown = true;
        }
      };
      
      // IntersectionObserver for desktop and modern mobile browsers
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasShown) {
              showStickyCta();
            }
          });
        }, { 
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });
        observer.observe(programsSection);
      }
      
      // Scroll-based fallback for better mobile support
      let scrollTimeout;
      const checkScroll = () => {
        if (hasShown || !programsSection) return;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (!programsSection) return;
          
          const programsRect = programsSection.getBoundingClientRect();
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;
          
          // Show when programs section is visible or scrolled past
          if (programsRect.top < windowHeight * 0.8 || scrollY > programsSection.offsetTop - windowHeight * 0.2) {
            showStickyCta();
          }
        }, 50);
      };
      
      // Check on scroll
      window.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('touchmove', checkScroll, { passive: true });
      
      // Check immediately in case already scrolled
      setTimeout(checkScroll, 200);
      
      // Fallback timeout (desktop only). On mobile, do not auto-show before reaching section.
      if (!isMobile) {
        setTimeout(() => {
          if (!hasShown) {
            showStickyCta();
          }
        }, 3000);
      }
    })();
    
    // Testimonials Carousel
    const carousel = document.querySelector('.testimonials-carousel');
    const carouselWrapper = document.querySelector('.testimonials-carousel-wrapper');
    const carouselCards = document.querySelectorAll('.testimonials-carousel .testimonial-card');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (carousel && carouselWrapper && carouselCards && carouselCards.length > 0) {
      let currentIndex = 0;
      const totalCards = carouselCards.length;
      let isLooping = false;
      
      // Get cards per view based on screen size
      const getCardsPerView = () => {
        return window.innerWidth <= 768 ? 1 : 3;
      };
      
      // Create dots based on total cards
      const createDots = () => {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalCards; i++) {
          const dot = document.createElement('button');
          dot.classList.add('carousel-dot');
          if (i === 0) dot.classList.add('active');
          dot.setAttribute('aria-label', `Go to card ${i + 1}`);
          dot.addEventListener('click', () => {
            goToCard(i);
            pauseOnInteraction();
          });
          dotsContainer.appendChild(dot);
        }
      };
      
      // Update carousel position - scroll one card at a time
      const updateCarousel = (skipTransition = false) => {
        // Verify elements exist
        if (!carouselWrapper || !carouselCards || carouselCards.length === 0) {
          return;
        }
        
        // Ensure currentIndex is within bounds
        currentIndex = Math.max(0, Math.min(currentIndex, carouselCards.length - 1));
        
        // Verify current card exists
        if (!carouselCards[currentIndex]) {
          currentIndex = 0;
        }
        
        // Get the first card to calculate step size
        const firstCard = carouselCards[0];
        if (!firstCard) {
          setTimeout(() => updateCarousel(skipTransition), 50);
          return;
        }
        
        // Wait for card to have dimensions
        const cardWidth = firstCard.offsetWidth;
        if (!cardWidth || cardWidth === 0) {
          setTimeout(() => updateCarousel(skipTransition), 50);
          return;
        }
        
        // Calculate card width including margin
        const cardStyle = window.getComputedStyle(firstCard);
        const marginLeft = Math.abs(parseInt(cardStyle.marginLeft) || 0);
        const marginRight = Math.abs(parseInt(cardStyle.marginRight) || 0);
        const totalCardWidth = cardWidth + marginLeft + marginRight;
        
        // Calculate translateX: move right (positive) by currentIndex cards
        // In RTL, positive translateX moves the wrapper right, showing next cards
        const translateX = currentIndex * totalCardWidth;
        
        // Apply transform
        if (skipTransition) {
          carouselWrapper.style.transition = 'none';
        }
        carouselWrapper.style.transform = `translateX(${translateX}px)`;
        
        if (!skipTransition) {
          carouselWrapper.style.transition = 'transform 0.4s ease';
        }
        
        // Update dots
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
          if (dot) {
            dot.classList.toggle('active', index === currentIndex);
          }
        });
      };
      
      // Go to specific card
      const goToCard = (index) => {
        currentIndex = Math.max(0, Math.min(index, totalCards - 1));
        updateCarousel();
        pauseOnInteraction();
      };
      
      // Next card - with loop
      const nextCard = () => {
        if (!carouselCards || carouselCards.length === 0 || isLooping) {
          return;
        }
        const previousIndex = currentIndex;
        const willLoop = previousIndex === carouselCards.length - 1;
        
        // If looping, handle it immediately without any transition
        if (willLoop) {
          isLooping = true;
          
          // Cancel any ongoing transition immediately with !important
          carouselWrapper.style.setProperty('transition', 'none', 'important');
          
          // Update index
          currentIndex = 0;
          
          // Get card dimensions
          const firstCard = carouselCards[0];
          if (firstCard && firstCard.offsetWidth > 0) {
            // Set position to 0 instantly - use setProperty to ensure it applies
            carouselWrapper.style.setProperty('transform', 'translateX(0px)', 'important');
            
            // Update dots immediately
            const dots = document.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
              if (dot) {
                dot.classList.toggle('active', index === 0);
              }
            });
            
            // Force multiple reflows to ensure the change is applied
            void carouselWrapper.offsetHeight;
            void carouselWrapper.offsetWidth;
            
            // Wait a frame, then re-enable transition
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                carouselWrapper.style.removeProperty('transition');
                // Keep the transform, just remove the !important flag
                carouselWrapper.style.transform = 'translateX(0px)';
                carouselWrapper.style.transition = 'transform 0.4s ease';
                isLooping = false;
              });
            });
          } else {
            currentIndex = 0;
            updateCarousel(true);
            setTimeout(() => {
              isLooping = false;
            }, 50);
          }
        } else {
          // Normal transition
          currentIndex = (currentIndex + 1) % carouselCards.length;
          updateCarousel(false);
        }
      };
      
      // Previous card - with loop
      const prevCard = () => {
        if (!carouselCards || carouselCards.length === 0 || isLooping) {
          return;
        }
        const previousIndex = currentIndex;
        const willLoop = previousIndex === 0;
        
        // If looping, handle it immediately without any transition
        if (willLoop) {
          isLooping = true;
          
          // Cancel any ongoing transition immediately with !important
          carouselWrapper.style.setProperty('transition', 'none', 'important');
          
          // Update index
          currentIndex = carouselCards.length - 1;
          
          // Get card dimensions
          const firstCard = carouselCards[0];
          if (firstCard && firstCard.offsetWidth > 0) {
            const cardStyle = window.getComputedStyle(firstCard);
            const marginLeft = Math.abs(parseInt(cardStyle.marginLeft) || 0);
            const marginRight = Math.abs(parseInt(cardStyle.marginRight) || 0);
            const totalCardWidth = firstCard.offsetWidth + marginLeft + marginRight;
            const lastIndex = carouselCards.length - 1;
            const translateX = lastIndex * totalCardWidth;
            
            // Set position to last card instantly - use setProperty to ensure it applies
            carouselWrapper.style.setProperty('transform', `translateX(${translateX}px)`, 'important');
            
            // Update dots immediately
            const dots = document.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
              if (dot) {
                dot.classList.toggle('active', index === lastIndex);
              }
            });
            
            // Force multiple reflows to ensure the change is applied
            void carouselWrapper.offsetHeight;
            void carouselWrapper.offsetWidth;
            
            // Wait a frame, then re-enable transition
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                carouselWrapper.style.removeProperty('transition');
                // Keep the transform, just remove the !important flag
                carouselWrapper.style.transform = 'translateX(0px)';
                carouselWrapper.style.transition = 'transform 0.4s ease';
                isLooping = false;
              });
            });
          } else {
            currentIndex = carouselCards.length - 1;
            updateCarousel(true);
            setTimeout(() => {
              isLooping = false;
            }, 50);
          }
        } else {
          // Normal transition
          currentIndex = (currentIndex - 1 + carouselCards.length) % carouselCards.length;
          updateCarousel(false);
        }
      };
      
      // Auto-play functionality
      let autoPlayInterval = null;
      const autoPlayDelay = 2000; // 2 seconds
      let isPaused = false;
      
      const startAutoPlay = () => {
        // Don't start if already running
        if (autoPlayInterval) {
          return;
        }
        
        // Verify elements exist
        if (!carouselWrapper || !carouselCards || carouselCards.length === 0) {
          return;
        }
        
        autoPlayInterval = setInterval(() => {
          if (!isPaused && !isLooping) {
            // If we're at the last card, handle loop before transition
            if (currentIndex === carouselCards.length - 1) {
              // Stop any ongoing transition
              carouselWrapper.style.transition = 'none';
              carouselWrapper.style.transform = 'translateX(0px)';
              currentIndex = 0;
              
              // Update dots
              const dots = document.querySelectorAll('.carousel-dot');
              dots.forEach((dot, index) => {
                if (dot) {
                  dot.classList.toggle('active', index === 0);
                }
              });
              
              // Force reflow
              void carouselWrapper.offsetHeight;
              
              // Re-enable transition after a moment
              setTimeout(() => {
                carouselWrapper.style.transition = 'transform 0.4s ease';
              }, 100);
            } else {
              nextCard();
            }
          }
        }, autoPlayDelay);
      };
      
      const stopAutoPlay = () => {
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
        }
      };
      
      const pauseAutoPlay = () => {
        isPaused = true;
      };
      
      const resumeAutoPlay = () => {
        isPaused = false;
      };
      
      // Pause on touch/interaction helper
      let touchPauseTimeout;
      const pauseOnInteraction = () => {
        pauseAutoPlay();
        clearTimeout(touchPauseTimeout);
        touchPauseTimeout = setTimeout(() => {
          resumeAutoPlay();
        }, autoPlayDelay * 2);
      };
      
      // Event listeners
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          nextCard();
          pauseOnInteraction();
        });
      }
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          prevCard();
          pauseOnInteraction();
        });
      }
      
      // Pause on hover (desktop)
      carousel.addEventListener('mouseenter', pauseAutoPlay);
      carousel.addEventListener('mouseleave', resumeAutoPlay);
      
      // Touch/swipe support
      let startX = 0;
      let isDragging = false;
      let startTranslateX = 0;
      
      carouselWrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        pauseOnInteraction();
        const style = window.getComputedStyle(carouselWrapper);
        const matrix = new DOMMatrix(style.transform);
        startTranslateX = matrix.m41;
      });
      
      carouselWrapper.addEventListener('touchmove', (e) => {
        if (!isDragging || !carouselCards || carouselCards.length === 0) return;
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        const firstCard = carouselCards[0];
        if (!firstCard || firstCard.offsetWidth === 0) return;
        
        const cardStyle = window.getComputedStyle(firstCard);
        const cardWidth = firstCard.offsetWidth;
        const marginLeft = Math.abs(parseInt(cardStyle.marginLeft) || 0);
        const marginRight = Math.abs(parseInt(cardStyle.marginRight) || 0);
        const totalCardWidth = cardWidth + marginLeft + marginRight;
        const maxTranslate = (carouselCards.length - 1) * totalCardWidth;
        
        // Swipe right moves right (next), swipe left moves left (previous)
        let newTranslateX = startTranslateX - diff;
        newTranslateX = Math.max(0, Math.min(newTranslateX, maxTranslate));
        carouselWrapper.style.transform = `translateX(${newTranslateX}px)`;
        carouselWrapper.style.transition = 'none';
      });
      
      carouselWrapper.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        carouselWrapper.style.transition = 'transform 0.4s ease';
        
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) { // Minimum swipe distance
          // Swipe right (diff > 0) = go to next card
          // Swipe left (diff < 0) = go to previous card
          if (diff > 0) {
            nextCard();
          } else {
            prevCard();
          }
          pauseOnInteraction();
        } else {
          updateCarousel(); // Snap back
        }
      });
      
      // Auto-update on resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          stopAutoPlay();
          createDots();
          if (carouselCards && carouselCards.length > 0) {
            currentIndex = Math.min(currentIndex, carouselCards.length - 1);
            updateCarousel();
            startAutoPlay();
          }
        }, 250);
      });
      
      // Initialize
      const initCarousel = () => {
        // Verify elements still exist
        if (!carousel || !carouselWrapper || !carouselCards || carouselCards.length === 0) {
          return;
        }
        
        stopAutoPlay();
        createDots();
        currentIndex = 0;
        
        // Wait for layout and ensure cards are ready
        const checkAndInit = (attempts = 0) => {
          if (attempts > 30) {
            return;
          }
          
          if (!carouselCards || carouselCards.length === 0) {
            setTimeout(() => checkAndInit(attempts + 1), 50);
            return;
          }
          
          const firstCard = carouselCards[0];
          if (!firstCard || firstCard.offsetWidth === 0) {
            setTimeout(() => checkAndInit(attempts + 1), 50);
            return;
          }
          
          // Update carousel position
          updateCarousel();
          
          // Start auto-play after carousel is ready
          setTimeout(() => {
            startAutoPlay();
          }, 500);
        };
        
        // Start checking after a short delay
        setTimeout(() => checkAndInit(0), 100);
      };
      
      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(initCarousel, 300);
        });
      } else {
        setTimeout(initCarousel, 300);
      }
      
      // Also initialize after a short delay to ensure CSS is applied
      setTimeout(initCarousel, 600);
      
      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        stopAutoPlay();
      });
    }
  </script>
  
  <!-- Video.js -->
  
  <!-- Loading Screen Animation -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Check for thank you hash parameter
      const hash = window.location.hash || '';
      const isThankYou = hash.includes('thankyou');

      if (isThankYou) {
        // Hide loading screen immediately
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
          loadingScreen.style.display = 'none';
        }
        
        // Remove loading class from body
        document.body.classList.remove('loading');
        document.body.classList.add('thank-you-mode');
        
        // Show thank you page
        const thankYouPage = document.getElementById('thankYouPage');
        if (thankYouPage) {
          thankYouPage.classList.add('active');
        }
        
        // Don't run the typing animation
        return;
      }

      const loadingScreen = document.getElementById('loadingScreen');
      const loadingText = document.getElementById('loadingText');
      const taglineText = 'جسمِك، قرارك — دليلة هنا عشان تدعّمكِ في الاتنين';
      const welcomeText = 'أهلاً بيكي في دليلة';
      let taglineIndex = 0;
      let welcomeIndex = 0;
      let typingActive = true;
      
      function finishAnimation() {
        if (!typingActive) return;
        typingActive = false;
        // Show complete text immediately
        loadingText.innerHTML = 
          '<div class="tagline-line">' + taglineText + '</div>' +
          '<div class="welcome-line">' + welcomeText + '</div>';
        // Wait a moment, then fade out
        setTimeout(function() {
          loadingScreen.classList.add('hidden');
          document.body.classList.remove('loading');
          // Remove loading screen from DOM after animation
          setTimeout(function() {
            loadingScreen.remove();
          }, 800);
        }, 500);
      }
      
      function typeTagline() {
        if (!typingActive) return;
        if (taglineIndex < taglineText.length) {
          loadingText.innerHTML = 
            '<div class="tagline-line">' + taglineText.substring(0, taglineIndex + 1) + '<span class="typing-cursor"></span></div>';
          taglineIndex++;
          setTimeout(typeTagline, 30);
        } else {
          // Wait a moment, then start typing welcome
          setTimeout(function() {
            if (typingActive) {
              typeWelcome();
            }
          }, 500);
        }
      }
      
      function typeWelcome() {
        if (!typingActive) return;
        if (welcomeIndex < welcomeText.length) {
          loadingText.innerHTML = 
            '<div class="tagline-line">' + taglineText + '</div>' +
            '<div class="welcome-line">' + welcomeText.substring(0, welcomeIndex + 1) + '<span class="typing-cursor"></span></div>';
          welcomeIndex++;
          setTimeout(typeWelcome, 100);
        } else {
          // Wait a bit after typing is complete, then fade out
          setTimeout(function() {
            if (typingActive) {
              loadingScreen.classList.add('hidden');
              document.body.classList.remove('loading');
              // Remove loading screen from DOM after animation
              setTimeout(function() {
                loadingScreen.remove();
              }, 800);
            }
          }, 1200);
        }
      }
      
      // Add click handler to skip animation when clicking anywhere
      document.addEventListener('click', function(e) {
        if (typingActive && loadingScreen && !loadingScreen.classList.contains('hidden')) {
          finishAnimation();
        }
      }, true);
      
      // Start typing animation with tagline first
      setTimeout(typeTagline, 400);
    });
  </script>
