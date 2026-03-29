// Navbar: becomes opaque + shadow after scrolling past hero
const navbar = document.getElementById('navbar');
const heroSection = document.getElementById('home');

let navScrolled = false;

function updateNavbar() {
  const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 0;
  const y = window.scrollY;

  if (!navScrolled && (heroBottom < 0 || y > 160)) {
    navScrolled = true;
  } else if (navScrolled && heroBottom >= 0 && y < 60) {
    navScrolled = false;
  }

  navbar.classList.toggle('navbar--scrolled', navScrolled);
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

// Mobile nav toggle
const toggle = document.querySelector('.navbar__toggle');
const navLinks = document.querySelector('.navbar__links');

toggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', isOpen);
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('is-open'));
});

// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const feedback = document.getElementById('cfFeedback');
    const submitBtn = document.getElementById('cfSubmit');
    const fields = ['firstName', 'lastName', 'email', 'needs'];

    // Clear previous errors
    feedback.className = 'contact-form__feedback';
    feedback.textContent = '';
    contactForm.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));

    // Client-side validation
    let valid = true;
    fields.forEach(name => {
      const el = contactForm.elements[name];
      if (!el.value.trim()) { el.classList.add('is-error'); valid = false; }
    });
    const emailEl = contactForm.elements['email'];
    if (emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('is-error'); valid = false;
    }
    if (!valid) {
      feedback.textContent = 'Uzupełnij wymagane pola i sprawdź poprawność e-maila.';
      feedback.className = 'contact-form__feedback is-error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wysyłanie…';

    const body = {
      firstName: contactForm.elements['firstName'].value.trim(),
      lastName:  contactForm.elements['lastName'].value.trim(),
      email:     contactForm.elements['email'].value.trim(),
      phone:     contactForm.elements['phone'].value.trim(),
      company:   contactForm.elements['company'].value.trim(),
      needs:     contactForm.elements['needs'].value.trim(),
      systems:   contactForm.elements['systems'].value.trim(),
    };

    try {
      const res = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        feedback.textContent = '✓ Wiadomość wysłana! Odezwiemy się w ciągu 24 godzin.';
        feedback.className = 'contact-form__feedback is-success';
        contactForm.reset();
      } else {
        throw new Error(data.error || 'Błąd serwera');
      }
    } catch (err) {
      feedback.textContent = err.message || 'Nie udało się wysłać. Spróbuj ponownie lub napisz bezpośrednio na kontakt@mihara.pl';
      feedback.className = 'contact-form__feedback is-error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '▶&nbsp; Umów bezpłatny przegląd';
    }
  });
}

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
