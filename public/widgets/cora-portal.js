/**
 * Cora Skin Portal - Branded Storefront Widget
 * Dynamic customer notification sync widget for Shopify themes.
 */
(function() {
  // 1. Extract current customer ID from the script tag
  const scriptTag = document.currentScript || document.querySelector('script[src*="cora-portal.js"]');
  const customerId = scriptTag ? scriptTag.getAttribute('data-customer-id') : null;
  const portalUrl = 'https://corapersona.vercel.app';

  if (!customerId || customerId === '' || customerId.includes('shopify_customer_id')) {
    console.warn('Cora Portal Widget: Missing valid Shopify customer ID. Sync button will not display.');
    return;
  }

  // 2. Inject CSS Styles for Floating Badge and Iframe Modal
  const styles = `
    #cora-portal-badge {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483640;
      background: #111111;
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 30px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.16);
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255,255,255,0.1);
    }
    #cora-portal-badge:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 30px rgba(0,0,0,0.22);
      background: #222222;
    }
    #cora-portal-badge svg {
      width: 16px;
      height: 16px;
      animation: coraSwing 2.5s infinite alternate ease-in-out;
    }
    #cora-portal-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    #cora-portal-modal.active {
      opacity: 1;
      pointer-events: auto;
    }
    #cora-portal-container {
      width: 440px;
      height: 600px;
      max-width: 90%;
      max-height: 90%;
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      border: 1px solid #E5E7EB;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: scale(0.9);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    #cora-portal-modal.active #cora-portal-container {
      transform: scale(1);
    }
    #cora-portal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #F3F4F6;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #4B5563;
      font-weight: bold;
      font-size: 14px;
      transition: background 0.2s;
      z-index: 10;
    }
    #cora-portal-close:hover {
      background: #E5E7EB;
      color: #111111;
    }
    #cora-portal-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    @keyframes coraSwing {
      0% { transform: rotate(0deg); }
      15% { transform: rotate(12deg); }
      30% { transform: rotate(-12deg); }
      45% { transform: rotate(4deg); }
      60% { transform: rotate(-4deg); }
      75% { transform: rotate(0deg); }
      100% { transform: rotate(0deg); }
    }
  `;

  // 3. Inject CSS
  const styleEl = document.createElement('style');
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);

  // 4. Create and Append Floating Badge
  const badge = document.createElement('div');
  badge.id = 'cora-portal-badge';
  badge.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
    <span>Sync Skincare Portal</span>
  `;
  document.body.appendChild(badge);

  // 5. Create and Append Iframe Modal Overlay
  const modal = document.createElement('div');
  modal.id = 'cora-portal-modal';
  modal.innerHTML = `
    <div id="cora-portal-container">
      <button id="cora-portal-close">&times;</button>
      <iframe id="cora-portal-iframe" src="${portalUrl}/register-device?customerId=${customerId}"></iframe>
    </div>
  `;
  document.body.appendChild(modal);

  // 6. Modal Toggling Interaction Logic
  const closeBtn = modal.querySelector('#cora-portal-close');
  
  badge.addEventListener('click', () => {
    modal.classList.add('active');
    // Refresh iframe on click to query latest status
    const iframe = modal.querySelector('#cora-portal-iframe');
    iframe.src = `${portalUrl}/register-device?customerId=${customerId}`;
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
})();
