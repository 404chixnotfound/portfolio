
        // ── Custom cursor ──
        const cursor = document.getElementById('cursor');
        const ring = document.getElementById('cursorRing');
        const dot = document.getElementById('cursorDot');
        let mx = 0,
            my = 0,
            rx = 0,
            ry = 0;
        document.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
        });

        function animateCursor() {
            rx += (mx - rx) * 0.15;
            ry += (my - ry) * 0.15;
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // ── Dark mode toggle ──
        const html = document.documentElement;
        const themeToggle = document.getElementById('themeToggle');

        function getPreferredTheme() {
            const stored = localStorage.getItem('theme');
            if (stored === 'dark' || stored === 'light') return stored;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function applyTheme(theme) {
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }

        // Initialize theme
        applyTheme(getPreferredTheme());

        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            // Fun spin animation on toggle
            themeToggle.querySelector('.theme-toggle-thumb').style.animation = 'spinOnce 0.5s ease';
            setTimeout(() => {
                themeToggle.querySelector('.theme-toggle-thumb').style.animation = '';
            }, 500);
        });

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        // ── Nav scroll effect ──
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // ── Scroll reveal with staggered variants ──
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || i * 70;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
            revealObserver.observe(el);
        });

        // ── Active nav link ──
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(s => {
                if (window.scrollY >= s.offsetTop - 140) current = s.id;
            });
            navLinks.forEach(a => {
                a.style.color = a.getAttribute('href') === '#' + current ? 'var(--ink)' : '';
            });
        });

        // ── Hero parallax on mouse move ──
        const heroBgNumber = document.querySelector('.hero-bg-number');
        if (heroBgNumber && window.innerWidth > 800) {
            document.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                heroBgNumber.style.transform = `translate(${x}px, ${y}px)`;
            });
        }

        // ── Skill list staggered hover ripple ──
        document.querySelectorAll('.skill-list li').forEach((li, i) => {
            li.style.setProperty('--item-index', i);
        });

        // ── v2: scroll progress, mobile menu, card spotlight ──
        const setProgress = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            html.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
        };
        window.addEventListener('scroll', setProgress, { passive: true });
        setProgress();

        const burger = document.getElementById('navBurger');
        burger.addEventListener('click', () => {
            const open = navbar.classList.toggle('open');
            burger.setAttribute('aria-expanded', open);
        });
        navLinks.forEach(a => a.addEventListener('click', () => {
            navbar.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
        }));

        document.querySelectorAll('.project-card, .pcard').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });

        console.log('%c Portfolio ready %c ✦ %c Dark mode: ' + getPreferredTheme(),
            'font-family: "DM Mono", monospace; font-size: 14px; color: #C84B31;',
            '',
            'font-family: "DM Mono", monospace; font-size: 12px; color: #6B6560;');
    
// ── v3: horizontal project rail (drag / swipe / arrows) ──
const rail = document.getElementById('rail');
if (rail) {
    const cards = [...rail.querySelectorAll('.pcard')];
    const num = document.getElementById('railNum'), bar = document.getElementById('railBar');
    const step = () => cards[0].getBoundingClientRect().width + 22;
    const update = () => {
        const max = rail.scrollWidth - rail.clientWidth;
        const i = Math.min(cards.length - 1, Math.round(rail.scrollLeft / step()));
        num.textContent = String(i + 1).padStart(2, '0');
        bar.style.transform = `scaleX(${Math.max(1 / cards.length, max > 0 ? (rail.scrollLeft / max) : 1)})`;
    };
    rail.addEventListener('scroll', update, { passive: true }); update();
    document.getElementById('railPrev').onclick = () => rail.scrollBy({ left: -step(), behavior: 'smooth' });
    document.getElementById('railNext').onclick = () => rail.scrollBy({ left: step(), behavior: 'smooth' });
    rail.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') rail.scrollBy({ left: step(), behavior: 'smooth' });
        if (e.key === 'ArrowLeft') rail.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    let down = false, sx = 0, sl = 0, moved = 0;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; });
    window.addEventListener('pointermove', e => {
        if (!down) return;
        const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
        if (moved > 6) { rail.classList.add('dragging'); rail.scrollLeft = sl - dx; }
    });
    window.addEventListener('pointerup', () => {
        if (!down) return; down = false;
        if (moved > 6) { rail.classList.remove('dragging'); rail.scrollTo({ left: Math.round(rail.scrollLeft / step()) * step(), behavior: 'smooth' }); }
    });
}

// ── v4: cinematic page transition + scroll-in ──
document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target || e.metaKey || e.ctrlKey || e.button || a.origin !== location.origin) return;
    if (!/\.html$/.test(a.pathname) || a.pathname === location.pathname) return;
    e.preventDefault();
    const cinematic = a.matches('.pcard, .d-next');
    if (cinematic) {
        const cs = getComputedStyle(a);
        const col = (cs.getPropertyValue('--c') || cs.getPropertyValue('--n')).trim();
        const name = (a.querySelector('.pcard-title, strong') || a).textContent.replace('→', '').trim();
        const o = document.createElement('div');
        o.className = 'pt-out';
        o.style.cssText = `--c:${col};--x:${e.clientX || innerWidth / 2}px;--y:${e.clientY || innerHeight / 2}px`;
        o.innerHTML = `<span>${name}</span>`;
        document.body.appendChild(o);
        setTimeout(() => location.href = a.href, 900);
    } else {
        document.body.classList.add('leaving');
        setTimeout(() => location.href = a.href, 250);
    }
});
window.addEventListener('pageshow', () => {
    document.body.classList.remove('leaving');
    document.querySelectorAll('.pt-out').forEach(n => n.remove());
});
const inObs = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); inObs.unobserve(en.target); }
}), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('[data-in]').forEach(n => inObs.observe(n));
