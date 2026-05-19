/**
 * Cora Skin Portal - Branded Storefront Sync & Skincare Dashboard Widget
 * Dynamic customer notifications, skincare routine tracking, and embedded login console.
 */
(function() {
  // 1. Extract current customer ID from the script tag or localStorage
  const scriptTag = document.currentScript || document.querySelector('script[src*="cora-portal.js"]');
  let customerId = scriptTag ? scriptTag.getAttribute('data-customer-id') : null;
  const portalUrl = 'https://corapersona.vercel.app';
  const backendUrl = 'https://cora-persona-backend.vercel.app';

  // Check if there is an active logged-in customer session stored in this browser
  const storedCustomerId = localStorage.getItem('cora_storefront_customer_id');
  
  // Clean up default template values
  if (customerId && (customerId === '' || customerId.includes('shopify_customer_id'))) {
    customerId = null;
  }

  // Use stored customer session as a persistent fallback
  if (!customerId && storedCustomerId) {
    customerId = storedCustomerId;
  }

  // 2. Inject CSS Styles for Floating Badge and Tabbed Dashboard
  const styles = `
    #cora-portal-badge {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483640;
      background: #111111;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 30px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.16);
      display: flex;
      align-items: center;
      gap: 10px;
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
    #cora-portal-badge .streak-indicator {
      background: #EF4444;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: bold;
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
      width: 460px;
      height: 620px;
      max-width: 90%;
      max-height: 90%;
      background: #F9FAFB;
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      border: 1px solid #E5E7EB;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: scale(0.9);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #4B5563;
      font-weight: bold;
      font-size: 16px;
      transition: background 0.2s;
      z-index: 10;
    }
    #cora-portal-close:hover {
      background: #F3F4F6;
      color: #111111;
    }
    .cora-header {
      padding: 24px 24px 16px 24px;
      background: white;
      border-bottom: 1px solid #E5E7EB;
    }
    .cora-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: #111111;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cora-header p {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #6B7280;
    }
    .cora-tabs {
      display: flex;
      background: #F3F4F6;
      padding: 4px;
      border-radius: 12px;
      margin-top: 12px;
    }
    .cora-tab-btn {
      flex: 1;
      padding: 8px 12px;
      border: none;
      background: transparent;
      font-size: 12px;
      font-weight: 700;
      color: #6B7280;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .cora-tab-btn.active {
      background: white;
      color: #111111;
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    }
    .cora-content-panel {
      flex: 1;
      overflow-y: auto;
      display: none;
    }
    .cora-content-panel.active {
      display: block;
    }
    .cora-iframe-wrapper {
      width: 100%;
      height: 100%;
    }
    #cora-portal-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .cora-dashboard {
      padding: 24px;
      space-y: 16px;
    }
    .cora-card {
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .cora-card-title {
      font-size: 11px;
      font-weight: 800;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .streak-grid {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .streak-fire {
      font-size: 32px;
      animation: pulse 1.5s infinite;
    }
    .streak-info h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #111111;
    }
    .streak-info p {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #6B7280;
    }
    .persona-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #F5F3FF;
      color: #6D28D9;
      border: 1px solid #DDD6FE;
      font-size: 12px;
      font-weight: 700;
      border-radius: 20px;
      margin-top: 4px;
    }
    .rec-item {
      padding: 10px 0;
      border-bottom: 1px solid #F3F4F6;
    }
    .rec-item:last-child {
      border-bottom: none;
    }
    .rec-item h5 {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      color: #111111;
    }
    .rec-item p {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #6B7280;
      line-height: 1.4;
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
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
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
    <span>Daily Skincare Sync</span>
    <span class="streak-indicator" style="display:none;">0</span>
  `;
  document.body.appendChild(badge);

  // 5. Create and Append Iframe Modal Overlay with Tabs
  const modal = document.createElement('div');
  modal.id = 'cora-portal-modal';
  modal.innerHTML = `
    <div id="cora-portal-container">
      <button id="cora-portal-close">&times;</button>
      
      <div class="cora-header">
        <h3>✨ Cora Skincare Portal</h3>
        <p>Bhutri Essentials routine tracker & device sync console</p>
        
        <div class="cora-tabs">
          <button class="cora-tab-btn active" data-tab="dashboard">📊 Skincare Dashboard</button>
          <button class="cora-tab-btn" data-tab="sync">🔔 Device Sync</button>
        </div>
      </div>

      <!-- Tab 1: Skincare Dashboard -->
      <div id="cora-panel-dashboard" class="cora-content-panel active">
        <div class="cora-dashboard">
          
          <div class="cora-card">
            <div class="cora-card-title">Daily Check-in Streak</div>
            <div class="streak-grid">
              <div class="streak-fire">🔥</div>
              <div class="streak-info">
                <h4 id="cora-streak-text">0 Day Streak</h4>
                <p>Check in daily to build your routine habits.</p>
              </div>
            </div>
          </div>

          <div class="cora-card">
            <div class="cora-card-title">My Skincare Persona</div>
            <div class="persona-badge" id="cora-persona-badge">
              🔑 Authenticating Profile...
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #4B5563;">
              Skin Type: <b id="cora-skin-type">Loading...</b><br/>
              Target Concerns: <span id="cora-concerns" style="color: #6D28D9; font-weight: bold;">Loading...</span>
            </div>
          </div>

          <div class="cora-card">
            <div class="cora-card-title">Recommended Routines</div>
            <div id="cora-recommendations">
              <div class="rec-item">
                <h5>Cleansing Ritual</h5>
                <p>Wash face daily using a gentle pH-balanced cleanser.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Tab 2: Outbound Device Sync -->
      <div id="cora-panel-sync" class="cora-content-panel">
        <div class="cora-iframe-wrapper">
          <iframe id="cora-portal-iframe" src="about:blank"></iframe>
        </div>
      </div>

    </div>
  `;
  document.body.appendChild(modal);

  // 6. Fetch Public Sync Details from Backend to hydrate Dashboard
  function hydrateWidget() {
    if (!customerId) {
      // If customer is not authenticated, show a prompt inside the profile badge
      document.getElementById('cora-streak-text').textContent = `Authentication Needed`;
      document.getElementById('cora-persona-badge').innerHTML = `🔑 Tap 'Device Sync' to log in`;
      document.getElementById('cora-skin-type').textContent = 'N/A';
      document.getElementById('cora-concerns').textContent = 'N/A';
      return;
    }

    fetch(`${backendUrl}/api/public/customer/${customerId}`)
      .then(res => res.json())
      .then(data => {
        // Update Streak badge on floating button
        const indicator = badge.querySelector('.streak-indicator');
        if (data.streak > 0) {
          indicator.textContent = data.streak;
          indicator.style.display = 'inline-block';
        } else {
          indicator.style.display = 'none';
        }

        // Update Dashboard Streak
        document.getElementById('cora-streak-text').textContent = `${data.streak} Day Streak`;

        // Update Persona Badge
        document.getElementById('cora-persona-badge').innerHTML = `✨ ${data.persona || 'Skincare Enthusiast'}`;
        document.getElementById('cora-skin-type').textContent = data.skin_type || 'Dry';
        document.getElementById('cora-concerns').textContent = (data.concerns || []).join(', ') || 'Hydration';

        // Update Recommendations list
        const recBox = document.getElementById('cora-recommendations');
        recBox.innerHTML = '';
        if (data.recommendations && data.recommendations.length > 0) {
          data.recommendations.forEach(rec => {
            const div = document.createElement('div');
            div.className = 'rec-item';
            div.innerHTML = `
              <h5>${rec.title}</h5>
              <p>${rec.desc}</p>
            `;
            recBox.appendChild(div);
          });
        }
      })
      .catch(err => console.warn('Cora Portal Widget: Failed to sync latest backend persona details:', err));
  }

  // Hydrate once immediately
  hydrateWidget();

  // 7. Modal & Tab toggling Logic
  const closeBtn = modal.querySelector('#cora-portal-close');
  const tabs = modal.querySelectorAll('.cora-tab-btn');
  const panels = modal.querySelectorAll('.cora-content-panel');

  badge.addEventListener('click', () => {
    modal.classList.add('active');
    hydrateWidget();
    
    // Load appropriate page in the iframe
    const iframe = modal.querySelector('#cora-portal-iframe');
    if (customerId) {
      // If customer is logged in, show device subscription console
      iframe.src = `${portalUrl}/register-device?customerId=${customerId}`;
    } else {
      // If NOT logged in, show custom sign-in page directly embedded inside the storefront widget!
      iframe.src = `${portalUrl}/portal-login`;
      
      // Auto-toggle to Device Sync tab so they can see the sign-in form immediately
      modal.querySelector('[data-tab="sync"]').click();
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const targetPanel = modal.querySelector(`#cora-panel-${tab.getAttribute('data-tab')}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // 8. Listen for dynamic postMessage success events from the embedded login iframe!
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'cora-login-success') {
      const loggedInId = event.data.customerId;
      
      // Persist the Shopify customer session inside the browser storefront context
      customerId = loggedInId;
      localStorage.setItem('cora_storefront_customer_id', loggedInId);
      
      // Re-hydrate the Skincare Dashboard and redirect the iframe to the active device status checker
      hydrateWidget();
      
      const iframe = modal.querySelector('#cora-portal-iframe');
      iframe.src = `${portalUrl}/register-device?customerId=${loggedInId}`;
      
      // Smoothly switch them back to the active Skincare Dashboard!
      setTimeout(() => {
        modal.querySelector('[data-tab="dashboard"]').click();
      }, 1000);
    }
  });
})();
