import { PORTFOLIO_URL } from '../config.js';

// Lead form → Make.com webhook. Demo mode when VITE_MAKE_WEBHOOK_URL is empty.
const COOLDOWN_MS = 30_000;
let lastSent = 0;

export function initForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;
  const note = document.getElementById('form-note');
  const submit = document.getElementById('lead-submit');
  const link = document.getElementById('portfolio-link');
  if (link && PORTFOLIO_URL && PORTFOLIO_URL !== '#') link.href = PORTFOLIO_URL;

  const say = (msg, ok) => {
    note.textContent = msg;
    note.classList.toggle('is-ok', !!ok);
    note.classList.toggle('is-err', !ok);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (data.get('company')) return; // honeypot: silently ignore bots
    if (Date.now() - lastSent < COOLDOWN_MS) {
      say('Please wait a few seconds before sending again.', false);
      return;
    }
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const brand = String(data.get('brand') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !/.+@.+\..+/.test(email) || !message) {
      say('Please add your name, a valid email, and a short message.', false);
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Sending…';
    const url = import.meta.env.VITE_MAKE_WEBHOOK_URL;
    const payload = { name, email, brand, message, page: location.href, at: new Date().toISOString() };
    try {
      if (!url) {
        console.log('[lead-form demo]', payload); // demo mode: no webhook configured
      } else {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      lastSent = Date.now();
      form.reset();
      say('Thanks — your inquiry is on its way. I’ll reply within 48 hours.', true);
    } catch {
      say('Something went wrong sending. Please try again in a moment.', false);
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send inquiry';
    }
  });
}
