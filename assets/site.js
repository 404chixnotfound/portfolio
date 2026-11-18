
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
        const i = (max > 0 && rail.scrollLeft >= max - 2) ? cards.length - 1 : Math.min(cards.length - 1, Math.round(rail.scrollLeft / step()));
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
        // .d-next carries the NEXT project's colour in --n; --c would be inherited from the current page's body
        const col = (a.matches('.d-next') ? cs.getPropertyValue('--n') : cs.getPropertyValue('--c')).trim();
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

/* Hero name: cursor tilt + .dev reveal (hover on mouse, tap to toggle on touch) */
(() => {
    const h = document.getElementById('heroName');
    if (!h) return;
    const main = h.querySelector('.hn-main');
    const on = () => h.classList.add('is-on'), off = () => { h.classList.remove('is-on'); h.style.removeProperty('--rx'); h.style.removeProperty('--ry'); main.style.removeProperty('--rx'); main.style.removeProperty('--ry'); };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    h.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') on(); });
    h.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') off(); });
    h.addEventListener('pointermove', e => {
        if (reduce || e.pointerType === 'touch') return;
        const r = h.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        main.style.setProperty('--rx', (x * 14).toFixed(1) + 'deg'); main.style.setProperty('--ry', (-y * 12).toFixed(1) + 'deg');
    });
    h.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'touch') return;
        e.stopPropagation(); h.classList.contains('is-on') ? off() : on();
    });
    document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !h.contains(e.target)) off(); }, { passive: true });
})();

/* .dev letters: tap one to make it wobble */
document.querySelectorAll('.hn-dev i').forEach(l => l.addEventListener('pointerdown', () => { l.classList.remove('wob'); void l.offsetWidth; l.classList.add('wob'); setTimeout(() => l.classList.remove('wob'), 520); }));

/* Easter egg: type "jelly" anywhere (or tap the footer "care." 5x) and the page wobbles */
(() => {
    let buf = '', taps = 0, tt;
    const toast = document.createElement('div'); toast.className = 'egg-toast'; toast.textContent = '🍉 you found the jelly — see project 04'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
    const go = () => {
        document.body.classList.add('jelly'); toast.classList.add('show'); document.dispatchEvent(new Event('jelly-egg'));
        setTimeout(() => document.body.classList.remove('jelly'), 3200); setTimeout(() => toast.classList.remove('show'), 3600);
    };
    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
        buf = (buf + e.key.toLowerCase()).slice(-5); if (buf === 'jelly') { buf = ''; go(); }
    });
    const care = document.querySelector('footer a[href="#"]');
    if (care) care.addEventListener('click', e => { e.preventDefault(); clearTimeout(tt); tt = setTimeout(() => taps = 0, 1500); if (++taps >= 5) { taps = 0; go(); } });
    try { console.log('%cpsst — try typing "jelly"', 'color:#D8283C;font-weight:bold'); } catch (e) {}
})();

/* Sound: tiny synthesized UI sounds (no files). Starts after first interaction; mute toggle in the nav, remembered. */
(() => {
    let ctx = null, master = null, muted = false;
    try { muted = localStorage.getItem('sound') === 'off'; } catch (e) {}
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ensure = () => {
        if (!ctx) { ctx = new AC(); master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination); }
        if (ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }
        if (!ensure.primed) { ensure.primed = true; try { const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) {} }   // iOS unlock
        return ctx;
    };
    const tone = (f, dur = .08, type = 'sine', vol = .05, f2 = null, delay = 0) => {
        if (muted || !ctx) return; if (ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }
        const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
    };
    const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const S = {
        tick: () => tone(1400, .05, 'triangle', .09),
        click: () => { tone(420, .08, 'square', .08, 220); },
        up: () => { tone(520, .1, 'sine', .16, 780); tone(780, .14, 'sine', .13, 1040, .07); },
        down: () => { tone(780, .1, 'sine', .16, 520); tone(520, .14, 'sine', .13, 390, .07); },
        letter: k => tone(PENTA[k % PENTA.length], .22, 'sine', .2, PENTA[k % PENTA.length] * 1.01),
        unletter: k => tone(PENTA[(3 - k) % PENTA.length] / 2, .14, 'sine', .14),
        boing: () => { tone(180, .7, 'sine', .35, 90); tone(360, .7, 'triangle', .12, 120); for (let i = 0; i < 6; i++) tone(260 + (i % 2) * 60, .12, 'sine', .1, 200, .14 * i); },
        on: () => { tone(660, .1, 'sine', .16); tone(990, .14, 'sine', .16, null, .08); }
    };
    // toggle button
    const nav = document.querySelector('.nav-inner'), themeBtn = document.getElementById('themeToggle');
    const btn = document.createElement('button'); btn.className = 'sound-toggle'; btn.type = 'button';
    const paint = () => { btn.setAttribute('aria-pressed', String(!muted)); btn.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off'); btn.title = muted ? 'Sound off' : 'Sound on'; btn.innerHTML = muted ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>' : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>'; };
    paint();
    btn.addEventListener('click', () => { ensure(); muted = !muted; try { localStorage.setItem('sound', muted ? 'off' : 'on'); } catch (e) {} paint(); if (!muted) S.on(); });
    if (nav) nav.insertBefore(btn, themeBtn || null);
    // unlock audio on first gesture
    const unlock = () => { ensure(); };
    ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach(ev => addEventListener(ev, unlock, { passive: true, capture: true }));
    // hover ticks (mouse only, throttled)
    let last = 0;
    document.addEventListener('pointerover', e => {
        if (e.pointerType !== 'mouse') return;
        const el = e.target.closest && e.target.closest('.pcard, .btn, .contact-link, .nav-links a, .d-next, .d-cta, .skill-list li');
        if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
        const n = performance.now(); if (n - last < 70) return; last = n; S.tick();
    }, { passive: true });
    document.addEventListener('click', e => {
        if (e.target.closest('#themeToggle')) { setTimeout(() => (document.documentElement.dataset.theme === 'dark' ? S.down() : S.up()), 0); return; }
        if (e.target.closest('.sound-toggle')) return;
        if (e.target.closest('a, button, .pcard')) S.click();
    }, { capture: true });
    // .dev letters
    const hn = document.getElementById('heroName');
    if (hn) {
        let was = false;
        new MutationObserver(() => {
            const is = hn.classList.contains('is-on'); if (is === was) return; was = is;
            for (let k = 0; k < 4; k++) setTimeout(() => (is ? S.letter(k) : S.unletter(k)), k * 70);
        }).observe(hn, { attributes: true, attributeFilter: ['class'] });
        hn.querySelectorAll('.hn-dev i').forEach((l, k) => { l.addEventListener('pointerenter', () => S.letter(k + 1)); l.addEventListener('pointerdown', () => S.letter(k + 2)); });
    }
    document.addEventListener('jelly-egg', S.boing);
})();
