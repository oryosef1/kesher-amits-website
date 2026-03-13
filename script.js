// ============================================
// קשר אמיץ - Website JavaScript v3
// ============================================

// Force scroll to top on page load/refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
// Clear hash so browser doesn't auto-scroll to an anchor
if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
}
window.scrollTo(0, 0);

// ---------- Page Loader ----------
window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    if (loader) setTimeout(() => loader.classList.add('hidden'), 300);
});

document.addEventListener('DOMContentLoaded', () => {
    // ---------- Navbar Scroll Effect ----------
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const y = window.scrollY;
                navbar.classList.toggle('scrolled', y > 60);
                backToTop.classList.toggle('visible', y > 600);
                updateActiveLink(y);
                ticking = false;
            });
            ticking = true;
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---------- Back to Top ----------
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---------- Mobile Menu ----------
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ---------- Active Nav Link ----------
    const sections = document.querySelectorAll('section[id]');

    const updateActiveLink = (scrollY) => {
        const y = (scrollY || window.scrollY) + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = navLinks.querySelector(`a[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active', y >= top && y < top + height);
            }
        });
    };

    // ---------- Stat Counter Animation ----------
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let statsCounted = false;

    const animateCounters = () => {
        statNumbers.forEach(el => {
            const target = parseInt(el.dataset.target);
            const duration = 1500;
            const startTime = performance.now();

            const tick = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4);
                el.textContent = Math.round(target * ease);
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsCounted) {
                statsCounted = true;
                animateCounters();
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.about-stats');
    if (statsSection) statsObserver.observe(statsSection);

    // ---------- Gallery: Load More ----------
    const loadMoreBtn = document.getElementById('loadMore');
    const galleryExtra = document.getElementById('galleryExtra');

    if (loadMoreBtn && galleryExtra) {
        loadMoreBtn.addEventListener('click', () => {
            galleryExtra.classList.add('visible');
            loadMoreBtn.style.display = 'none';
        });
    }

    // ---------- Gallery: Lightbox ----------
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    const lightboxCounter = document.getElementById('lightboxCounter');

    let galleryImages = [];
    let currentIndex = 0;

    const getVisibleImages = () => {
        return Array.from(document.querySelectorAll('.gallery-item img')).filter(img => {
            return img.offsetParent !== null;
        });
    };

    const openLightbox = (img) => {
        galleryImages = getVisibleImages();
        currentIndex = galleryImages.indexOf(img);
        if (currentIndex === -1) currentIndex = 0;
        lightboxImg.src = galleryImages[currentIndex].src;
        lightboxImg.alt = galleryImages[currentIndex].alt;
        lightboxCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    const navigate = (direction) => {
        galleryImages = getVisibleImages();
        currentIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[currentIndex].src;
        lightboxImg.alt = galleryImages[currentIndex].alt;
        lightboxCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
    };

    // Event delegation for gallery clicks
    document.querySelector('.gallery').addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (!item) return;
        const img = item.querySelector('img');
        if (img) openLightbox(img);
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigate(1));
    lightboxNext.addEventListener('click', () => navigate(-1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') navigate(1);
        if (e.key === 'ArrowLeft') navigate(-1);
    });

    // Touch swipe for lightbox
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 60) {
            navigate(diff > 0 ? 1 : -1);
        }
    }, { passive: true });

    // ---------- Scroll Reveal Animations ----------
    // Only animate key sections, NOT gallery items (too many = laggy)
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
});
