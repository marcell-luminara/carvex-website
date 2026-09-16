(function () {
  const measurementId = 'G-D2RRVBTMME';
  const storageKey = 'carvex_measurement_consent_v2';
  const acceptedValue = 'accepted';
  const declinedValue = 'declined';

  const getStoredConsent = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  };

  const storeConsent = (value) => {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch (error) {
      // Consent still applies to the current page when storage is unavailable.
    }
  };

  const ensureGtag = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
  };

  const updateGoogleConsent = (state) => {
    ensureGtag();
    window.gtag('consent', 'update', {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state
    });
    window.carvexConsentState = state;
  };

  const loadAnalytics = () => {
    if (window.carvexAnalyticsLoaded) return;
    window.carvexAnalyticsLoaded = true;

    ensureGtag();
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
    if (getStoredConsent() !== acceptedValue || typeof window.gtag !== 'function') {
      return;
    }
    window.gtag('event', eventName, parameters);
  };

  window.carvexTrackEvent = trackEvent;

  const setConsent = (value) => {
    storeConsent(value);
    updateGoogleConsent(value === acceptedValue ? 'granted' : 'denied');
    document.querySelector('[data-analytics-consent]')?.setAttribute('hidden', '');
    if (value === acceptedValue) {
      loadAnalytics();
      trackEvent('analytics_consent_accepted');
    }
  };

  const injectBanner = () => {
    const existingBanner = document.querySelector('[data-analytics-consent]');
    if (existingBanner) {
      existingBanner.removeAttribute('hidden');
      return;
    }

    const banner = document.createElement('aside');
    banner.className = 'analytics-consent';
    banner.setAttribute('data-analytics-consent', '');
    banner.setAttribute('aria-label', 'Analitikai és hirdetési süti beállítás');
    banner.innerHTML = `
      <p>Analitikai és hirdetési sütiket csak akkor használunk, ha elfogadod. Ezek segítenek mérni az oldal használatát és a hirdetésekből érkező kapcsolatfelvételeket. <a href="./adatkezelesi-tajekoztato.html">Adatkezelési tájékoztató</a></p>
      <div class="analytics-consent__actions">
        <button class="analytics-consent__accept" type="button">Összes elfogadása</button>
        <button class="analytics-consent__decline" type="button">Elutasítom</button>
      </div>
    `;

    banner.querySelector('.analytics-consent__accept').addEventListener('click', () => setConsent(acceptedValue));
    banner.querySelector('.analytics-consent__decline').addEventListener('click', () => setConsent(declinedValue));
    document.body.appendChild(banner);
  };

  const injectSettingsControl = () => {
    if (document.querySelector('[data-consent-settings]')) return;

    const button = document.createElement('button');
    button.className = 'analytics-consent-settings';
    button.setAttribute('data-consent-settings', '');
    button.type = 'button';
    button.textContent = 'Süti beállítások';
    button.addEventListener('click', injectBanner);

    const footerLinks = document.querySelector('footer .footer-links');
    (footerLinks || document.body).appendChild(button);
  };

  injectSettingsControl();

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

  const storedConsent = getStoredConsent();
  if (storedConsent === acceptedValue) {
    if (window.carvexConsentState !== 'granted') {
      updateGoogleConsent('granted');
    }
    loadAnalytics();
  } else if (storedConsent === declinedValue) {
    if (window.carvexConsentState !== 'denied') {
      updateGoogleConsent('denied');
    }
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectBanner);
    } else {
      injectBanner();
    }
  }
})();
