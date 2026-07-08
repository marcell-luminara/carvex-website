(function () {
  const measurementId = 'G-D2RRVBTMME';
  const storageKey = 'carvex_analytics_consent';
  const acceptedValue = 'accepted';
  const declinedValue = 'declined';

  const loadAnalytics = () => {
    if (window.carvexAnalyticsLoaded) return;
    window.carvexAnalyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      send_page_view: true
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  };

  const trackEvent = (eventName, parameters = {}) => {
    if (localStorage.getItem(storageKey) !== acceptedValue || typeof window.gtag !== 'function') {
      return;
    }
    window.gtag('event', eventName, parameters);
  };

  window.carvexTrackEvent = trackEvent;

  const setConsent = (value) => {
    localStorage.setItem(storageKey, value);
    document.querySelector('[data-analytics-consent]')?.setAttribute('hidden', '');
    if (value === acceptedValue) {
      loadAnalytics();
      trackEvent('analytics_consent_accepted');
    }
  };

  const injectBanner = () => {
    if (document.querySelector('[data-analytics-consent]')) return;

    const banner = document.createElement('aside');
    banner.className = 'analytics-consent';
    banner.setAttribute('data-analytics-consent', '');
    banner.setAttribute('aria-label', 'Analitikai süti beállítás');
    banner.innerHTML = `
      <p>Analitikai sütiket csak akkor használunk, ha elfogadod. Ezek segítenek látni, mely oldalak és kapcsolatfelvételi gombok működnek jól. <a href="./adatkezelesi-tajekoztato.html">Adatkezelési tájékoztató</a></p>
      <div class="analytics-consent__actions">
        <button class="analytics-consent__accept" type="button">Elfogadom</button>
        <button class="analytics-consent__decline" type="button">Nem kérem</button>
      </div>
    `;

    banner.querySelector('.analytics-consent__accept').addEventListener('click', () => setConsent(acceptedValue));
    banner.querySelector('.analytics-consent__decline').addEventListener('click', () => setConsent(declinedValue));
    document.body.appendChild(banner);
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    if (href.startsWith('tel:')) {
      trackEvent('phone_click', { link_text: link.textContent.trim() });
    } else if (href.startsWith('mailto:')) {
      trackEvent('email_click', { link_text: link.textContent.trim() || 'email' });
    } else if (link.dataset.packageCta) {
      trackEvent('package_cta_click', { package_name: link.dataset.packageCta });
    }
  }, { capture: true });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form && form.matches('form.lead-form') && form.checkValidity()) {
      trackEvent('lead_form_submit');
    }
  }, { capture: true });

  if (localStorage.getItem(storageKey) === acceptedValue) {
    loadAnalytics();
  } else if (!localStorage.getItem(storageKey)) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectBanner);
    } else {
      injectBanner();
    }
  }
})();
