'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className={`landing-nav ${scrollY > 20 ? 'landing-nav--scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <Link href="/" className="landing-nav-logo">
            <Image src="/logo.svg" alt="Calenderly" width={28} height={28} />
            <span className="landing-nav-logo-text">Calenderly</span>
          </Link>

          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How it works</a>
            <a href="#testimonials" className="landing-nav-link">Testimonials</a>
          </div>

          <div className="landing-nav-actions">
            {loading ? null : user ? (
              <Link href="/event-types" className="landing-btn landing-btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="landing-btn landing-btn-ghost">
                  Sign in
                </Link>
                <Link href="/signup" className="landing-btn landing-btn-primary">
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="landing-mobile-menu-btn" aria-label="Menu" onClick={() => {
            document.querySelector('.landing-mobile-drawer')?.classList.toggle('landing-mobile-drawer--open');
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className="landing-mobile-drawer">
        <a href="#features" className="landing-mobile-link" onClick={() => document.querySelector('.landing-mobile-drawer')?.classList.remove('landing-mobile-drawer--open')}>Features</a>
        <a href="#how-it-works" className="landing-mobile-link" onClick={() => document.querySelector('.landing-mobile-drawer')?.classList.remove('landing-mobile-drawer--open')}>How it works</a>
        <a href="#testimonials" className="landing-mobile-link" onClick={() => document.querySelector('.landing-mobile-drawer')?.classList.remove('landing-mobile-drawer--open')}>Testimonials</a>
        <div className="landing-mobile-actions">
          {loading ? null : user ? (
            <Link href="/event-types" className="landing-btn landing-btn-primary" style={{ width: '100%' }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="landing-btn landing-btn-outline" style={{ width: '100%' }}>Sign in</Link>
              <Link href="/signup" className="landing-btn landing-btn-primary" style={{ width: '100%' }}>Get started free</Link>
            </>
          )}
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="landing-hero-orb landing-hero-orb-1" />
          <div className="landing-hero-orb landing-hero-orb-2" />
          <div className="landing-hero-orb landing-hero-orb-3" />
          <div className="landing-hero-grid" />
        </div>

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" />
            Scheduling made effortless
          </div>

          <h1 className="landing-hero-title">
            Easy scheduling
            <br />
            <span className="landing-hero-title-accent">ahead</span>
          </h1>

          <p className="landing-hero-subtitle">
            Calenderly eliminates the back-and-forth of scheduling. Share your link,
            let others pick a time, and stay focused on what matters.
          </p>

          <div className="landing-hero-actions">
            <Link href="/signup" className="landing-btn landing-btn-primary landing-btn-lg">
              Start for free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a href="#how-it-works" className="landing-btn landing-btn-outline landing-btn-lg">
              See how it works
            </a>
          </div>

          <div className="landing-hero-social-proof">
            <div className="landing-hero-avatars">
              <div className="landing-hero-avatar" style={{ background: '#4F46E5' }}>V</div>
              <div className="landing-hero-avatar" style={{ background: '#0891B2' }}>A</div>
              <div className="landing-hero-avatar" style={{ background: '#059669' }}>R</div>
              <div className="landing-hero-avatar" style={{ background: '#D97706' }}>S</div>
            </div>
            <span className="landing-hero-social-text">
              Trusted by <strong>1,000+</strong> professionals
            </span>
          </div>
        </div>

        <div className="landing-hero-image-wrap">
          <div className="landing-hero-image-glow" />
          <div className="landing-hero-image-container">
            <Image
              src="/product/hero-dashboard.png"
              alt="Calenderly Dashboard"
              width={1200}
              height={750}
              className="landing-hero-image"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Logos / Trust ── */}
      <section className="landing-logos">
        <p className="landing-logos-label">Works seamlessly with your favorite tools</p>
        <div className="landing-logos-row">
          <div className="landing-logo-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 12.07C22 6.53 17.52 2.05 12 2.05S2 6.53 2 12.07c0 5 3.66 9.15 8.44 9.9v-7h-2.54v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34v7C18.34 21.22 22 17.07 22 12.07Z" fill="#64748B"/></svg>
            <span>Google Meet</span>
          </div>
          <div className="landing-logo-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#64748B" strokeWidth="2"/><path d="M3 8h18" stroke="#64748B" strokeWidth="2"/><path d="M9 4v4" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/><path d="M15 4v4" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/></svg>
            <span>Google Calendar</span>
          </div>
          <div className="landing-logo-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Slack</span>
          </div>
          <div className="landing-logo-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#64748B" strokeWidth="2"/><polyline points="22,6 12,13 2,6" stroke="#64748B" strokeWidth="2"/></svg>
            <span>Email</span>
          </div>
          <div className="landing-logo-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#64748B" strokeWidth="2"/><path d="M2 12h20" stroke="#64748B" strokeWidth="2"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="#64748B" strokeWidth="2"/></svg>
            <span>Zoom</span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features" id="features">
        <div className="landing-section-header" id="feat-header" data-animate>
          <span className="landing-section-tag">Features</span>
          <h2 className={`landing-section-title ${isVisible['feat-header'] ? 'animate-up' : 'pre-animate'}`}>
            Everything you need to schedule smarter
          </h2>
          <p className={`landing-section-desc ${isVisible['feat-header'] ? 'animate-up delay-1' : 'pre-animate'}`}>
            Powerful features designed to eliminate scheduling friction and help you focus on what matters most.
          </p>
        </div>

        <div className="landing-features-grid">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ),
              title: 'Smart Event Types',
              desc: 'Create custom event types with different durations, locations, and booking rules.',
              color: '#006BFF',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              ),
              title: 'Availability Rules',
              desc: 'Set your working hours, buffer times, and date-range limits with complete flexibility.',
              color: '#7C3AED',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              ),
              title: 'Seamless Booking',
              desc: 'Share a personalized link. Invitees pick a time that works — no account needed.',
              color: '#059669',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              ),
              title: 'AI Assistant',
              desc: 'Built-in AI helps manage your schedule, reschedule conflicts, and suggests optimal meeting times.',
              color: '#D97706',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              ),
              title: 'Meeting Dashboard',
              desc: 'View all upcoming and past meetings in one place with timezone-aware scheduling.',
              color: '#0891B2',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: 'Private & Secure',
              desc: 'Your data stays yours. Secure authentication, encrypted data, and privacy-first design.',
              color: '#DC2626',
            },
          ].map((feat, i) => (
            <div
              key={feat.title}
              className={`landing-feature-card ${isVisible[`feat-${i}`] ? 'animate-up' : 'pre-animate'}`}
              id={`feat-${i}`}
              data-animate
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="landing-feature-icon" style={{ background: `${feat.color}12`, color: feat.color }}>
                {feat.icon}
              </div>
              <h3 className="landing-feature-title">{feat.title}</h3>
              <p className="landing-feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-section-header" id="how-header" data-animate>
          <span className="landing-section-tag">How it works</span>
          <h2 className={`landing-section-title ${isVisible['how-header'] ? 'animate-up' : 'pre-animate'}`}>
            Three steps to stress-free scheduling
          </h2>
        </div>

        <div className="landing-how-steps">
          {[
            {
              step: '01',
              title: 'Set your availability',
              desc: 'Define your working hours, buffer times, and preferred meeting durations.',
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              ),
            },
            {
              step: '02',
              title: 'Share your link',
              desc: 'Send your personal scheduling page to anyone who needs to book time with you.',
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
              ),
            },
            {
              step: '03',
              title: 'Get booked',
              desc: 'Invitees pick a time that works. You both get confirmations. Done!',
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`landing-how-step ${isVisible[`step-${i}`] ? 'animate-up' : 'pre-animate'}`}
              id={`step-${i}`}
              data-animate
            >
              <div className="landing-how-step-number">{item.step}</div>
              <div className="landing-how-step-icon">{item.icon}</div>
              <h3 className="landing-how-step-title">{item.title}</h3>
              <p className="landing-how-step-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="landing-testimonials" id="testimonials">
        <div className="landing-section-header" id="test-header" data-animate>
          <span className="landing-section-tag">Testimonials</span>
          <h2 className={`landing-section-title ${isVisible['test-header'] ? 'animate-up' : 'pre-animate'}`}>
            Loved by professionals everywhere
          </h2>
        </div>

        <div className="landing-testimonials-grid">
          {[
            {
              name: 'Priya Sharma',
              role: 'Product Manager at TechCorp',
              text: 'Calenderly has cut my scheduling time in half. The clean interface and smart availability rules make it a joy to use every day.',
              avatar: 'PS',
              color: '#4F46E5',
            },
            {
              name: 'Alex Chen',
              role: 'Freelance Designer',
              text: 'I love how simple it is to share my booking link with clients. No more email chains to find a meeting time. Game changer!',
              avatar: 'AC',
              color: '#0891B2',
            },
            {
              name: 'Rahul Mehra',
              role: 'Startup Founder',
              text: 'The AI assistant feature is brilliant. It automatically suggests reschedules when conflicts arise, saving me hours each week.',
              avatar: 'RM',
              color: '#059669',
            },
          ].map((t, i) => (
            <div
              key={t.name}
              className={`landing-testimonial-card ${isVisible[`test-${i}`] ? 'animate-up' : 'pre-animate'}`}
              id={`test-${i}`}
              data-animate
            >
              <div className="landing-testimonial-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="landing-testimonial-text">&ldquo;{t.text}&rdquo;</p>
              <div className="landing-testimonial-author">
                <div className="landing-testimonial-avatar" style={{ background: t.color }}>{t.avatar}</div>
                <div>
                  <div className="landing-testimonial-name">{t.name}</div>
                  <div className="landing-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta" id="cta-section" data-animate>
        <div className={`landing-cta-inner ${isVisible['cta-section'] ? 'animate-up' : 'pre-animate'}`}>
          <div className="landing-cta-orb landing-cta-orb-1" />
          <div className="landing-cta-orb landing-cta-orb-2" />
          <h2 className="landing-cta-title">Ready to simplify your scheduling?</h2>
          <p className="landing-cta-desc">
            Join thousands of professionals who have already made scheduling effortless.
          </p>
          <Link href="/signup" className="landing-btn landing-btn-white landing-btn-lg">
            Get started — it&apos;s free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-footer-logo">
              <Image src="/logo.svg" alt="Calenderly" width={24} height={24} />
              <span>Calenderly</span>
            </div>
            <p className="landing-footer-tagline">Scheduling made simple, so you can focus on what matters.</p>
          </div>

          <div className="landing-footer-links">
            <div className="landing-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <a href="#testimonials">Testimonials</a>
            </div>
            <div className="landing-footer-col">
              <h4>Account</h4>
              <Link href="/login">Sign in</Link>
              <Link href="/signup">Create account</Link>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Calenderly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
