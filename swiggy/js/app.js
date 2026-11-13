/**
 * Swiggy Application Main Controller
 * Orchestrates views, roles, cart, checkout, live tracking & simulation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize notification and map engines
  window.notifManager.init();

  // Bind store state listeners
  window.swiggyStore.subscribe((state) => {
    renderApp(state);
  });

  // Initial render
  renderApp(window.swiggyStore.state);

  // Setup UI event listeners
  setupEventListeners();

  // Start live map simulation if order is in progress
  const activeOrder = window.swiggyStore.getActiveOrder();
  if (activeOrder && activeOrder.status === 'picked_up') {
    window.mapTracker.startLiveSimulation(activeOrder.id);
  }
});

let currentFilter = 'all'; // 'all', 'veg', 'fast', 'rating'
let currentCategory = null;
let searchQuery = '';

function renderApp(state) {
  renderRoleSwitcher(state);
  renderCartBar(state);
  renderHeaderBadges(state);

  // Render view based on selected role
  if (state.currentRole === 'customer') {
    document.getElementById('role-customer-container').style.display = 'block';
    document.getElementById('role-restaurant-container').style.display = 'none';
    document.getElementById('role-rider-container').style.display = 'none';

    renderCustomerViews(state);
  } else if (state.currentRole === 'restaurant') {
    document.getElementById('role-customer-container').style.display = 'none';
    document.getElementById('role-restaurant-container').style.display = 'block';
    document.getElementById('role-rider-container').style.display = 'none';

    renderRestaurantDashboard(state);
  } else if (state.currentRole === 'rider') {
    document.getElementById('role-customer-container').style.display = 'none';
    document.getElementById('role-restaurant-container').style.display = 'none';
    document.getElementById('role-rider-container').style.display = 'block';

    renderRiderDashboard(state);
  }

  // Update Notification Drawer
  window.notifManager.renderNotificationDrawer();
}

/* ==========================================================================
   Role Switcher & Top Bar Controls
   ========================================================================== */
function renderRoleSwitcher(state) {
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === state.currentRole);
  });

  const simSpeedBtn = document.getElementById('sim-speed-btn');
  if (simSpeedBtn) {
    simSpeedBtn.textContent = `⚡ Speed: ${state.simulationSpeed}x`;
  }

  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.textContent = window.soundManager.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
  }
}

/* ==========================================================================
   Customer Views: Restaurants, Menu, Tracking, Orders
   ========================================================================== */
function renderCustomerViews(state) {
  const customerViewId = window.currentCustomerTab || 'explore';

  document.querySelectorAll('.customer-tab-view').forEach(view => {
    view.classList.toggle('active-view', view.dataset.tab === customerViewId);
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === customerViewId);
  });

  if (customerViewId === 'explore') {
    renderRestaurantList(state);
  } else if (customerViewId === 'restaurant-detail') {
    renderRestaurantDetail(state);
  } else if (customerViewId === 'tracking') {
    renderLiveTracking(state);
  } else if (customerViewId === 'orders') {
    renderOrderHistory(state);
  }
}

function renderRestaurantList(state) {
  const grid = document.getElementById('restaurant-grid');
  if (!grid) return;

  let list = APP_DATA.restaurants;

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.menu.some(m => m.name.toLowerCase().includes(q))
    );
  }

  // Chip filters
  if (currentFilter === 'veg') {
    list = list.filter(r => r.isVeg || r.menu.some(m => m.isVeg));
  } else if (currentFilter === 'fast') {
    list = list.filter(r => r.avgDeliveryMins <= 25);
  } else if (currentFilter === 'rating') {
    list = list.filter(r => r.rating >= 4.5);
  }

  // Category filter
  if (currentCategory) {
    list = list.filter(r => r.menu.some(m => m.category.toLowerCase().includes(currentCategory.toLowerCase())));
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <h3>No restaurants match your search</h3>
        <p style="color: #64748b; margin-top: 8px;">Try clearing filters or search for something else.</p>
        <button class="primary-btn" onclick="clearFilters()" style="width: auto; margin: 16px auto; padding: 8px 20px;">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(rest => `
    <div class="restaurant-card" onclick="openRestaurant('${rest.id}')">
      <div class="card-image-box">
        <img src="${rest.image}" alt="${rest.name}" class="card-img" loading="lazy">
        <div class="offer-ribbon">🏷️ ${rest.offerText}</div>
      </div>
      <div class="card-content">
        <div class="card-header-line">
          <div class="restaurant-name">${rest.name}</div>
          <div class="rating-badge">★ ${rest.rating}</div>
        </div>
        <div class="cuisine-text">${rest.cuisine}</div>
        <div class="card-footer-line">
          <div class="eta-pill">🛵 ${rest.deliveryTime}</div>
          <div>${rest.costForTwo}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function openRestaurant(restaurantId) {
  window.swiggyStore.selectRestaurant(restaurantId);
  window.currentCustomerTab = 'restaurant-detail';
  renderApp(window.swiggyStore.state);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderRestaurantDetail(state) {
  const container = document.getElementById('restaurant-detail-container');
  if (!container) return;

  const rest = APP_DATA.restaurants.find(r => r.id === state.selectedRestaurantId) || APP_DATA.restaurants[0];

  let menuHtml = '';
  const categories = [...new Set(rest.menu.map(m => m.category))];

  categories.forEach(cat => {
    const items = rest.menu.filter(m => m.category === cat);
    const itemsListHtml = items.map(item => {
      // Find quantity in cart
      const cartItem = state.cart.items.find(ci => ci.item.id === item.id);
      const qty = cartItem ? cartItem.quantity : 0;

      const qtyWidget = qty > 0 ? `
        <div class="quantity-controller">
          <button class="qty-btn" onclick="event.stopPropagation(); window.swiggyStore.removeFromCart('${item.id}')">-</button>
          <span class="qty-count">${qty}</span>
          <button class="qty-btn" onclick="event.stopPropagation(); window.swiggyStore.addToCart(APP_DATA.restaurants.find(r=>r.id==='${rest.id}').menu.find(m=>m.id==='${item.id}'), '${rest.id}')">+</button>
        </div>
      ` : `
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); window.swiggyStore.addToCart(APP_DATA.restaurants.find(r=>r.id==='${rest.id}').menu.find(m=>m.id==='${item.id}'), '${rest.id}')">
          ADD
        </button>
      `;

      return `
        <div class="menu-item-card">
          <div class="item-left">
            <span class="diet-indicator ${item.isVeg ? 'veg' : 'non-veg'}"></span>
            ${item.isBestseller ? '<span style="font-size: 11px; font-weight: 700; color: #f59e0b; margin-left: 6px;">★ BESTSELLER</span>' : ''}
            <div class="item-title">${item.name}</div>
            <div class="item-price">₹${item.price}</div>
            <div class="item-desc">${item.description}</div>
          </div>
          <div class="item-right">
            <img src="${item.image}" alt="${item.name}" class="item-img" loading="lazy">
            <div class="add-btn-wrapper">
              ${qtyWidget}
            </div>
          </div>
        </div>
      `;
    }).join('');

    menuHtml += `
      <div class="menu-category-section">
        <div class="menu-category-title">
          <span>${cat} (${items.length})</span>
        </div>
        ${itemsListHtml}
      </div>
    `;
  });

  container.innerHTML = `
    <button class="back-btn" onclick="switchCustomerTab('explore')">
      ← Back to all restaurants
    </button>
    <div class="restaurant-detail-header">
      <div class="detail-info">
        <h1>${rest.name}</h1>
        <div class="detail-tags">${rest.cuisine} • ${rest.address}</div>
        <div class="detail-stats">
          <div class="stat-box" style="color: #15803d;">
            ★ ${rest.rating} (${rest.totalRatings} ratings)
          </div>
          <div class="stat-box">
            🛵 ${rest.deliveryTime}
          </div>
          <div class="stat-box">
            💰 ${rest.costForTwo}
          </div>
        </div>
      </div>
      <div style="background: #fff4eb; border: 1px dashed #fc8019; padding: 12px 18px; border-radius: 8px; text-align: center;">
        <div style="font-size: 12px; font-weight: 800; color: #fc8019;">SPECIAL OFFER</div>
        <div style="font-size: 14px; font-weight: 700; color: #282c3f; margin-top: 2px;">${rest.offerText}</div>
      </div>
    </div>
    <div class="menu-container">
      ${menuHtml}
    </div>
  `;
}

function renderCartBar(state) {
  const bar = document.getElementById('floating-cart-bar');
  if (!bar) return;

  const count = state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
  if (count > 0 && window.currentCustomerTab !== 'tracking') {
    const pricing = window.swiggyStore.getCartPricing();
    document.getElementById('cart-bar-count').textContent = `${count} ${count === 1 ? 'ITEM' : 'ITEMS'}`;
    document.getElementById('cart-bar-total').textContent = `₹${pricing.grandTotal}`;
    bar.classList.add('visible');
  } else {
    bar.classList.remove('visible');
  }
}

function renderHeaderBadges(state) {
  const cartBadge = document.getElementById('header-cart-badge');
  if (cartBadge) {
    const count = state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }

  const activeOrder = window.swiggyStore.getActiveOrder();
  const trackingBadge = document.getElementById('header-tracking-badge');
  if (trackingBadge) {
    if (activeOrder && activeOrder.status !== 'delivered') {
      trackingBadge.textContent = '1 Live';
      trackingBadge.style.display = 'inline-block';
    } else {
      trackingBadge.style.display = 'none';
    }
  }
}

/* ==========================================================================
   Checkout Modal & Billing
   ========================================================================== */
function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  const state = window.swiggyStore.state;
  if (state.cart.items.length === 0) {
    alert("Your cart is empty! Please add some delicious food items first.");
    return;
  }

  renderCheckoutContent(state);
  modal.classList.add('active');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
}

function renderCheckoutContent(state) {
  const rest = APP_DATA.restaurants.find(r => r.id === state.cart.restaurantId) || APP_DATA.restaurants[0];
  const pricing = window.swiggyStore.getCartPricing();

  const itemsListEl = document.getElementById('checkout-items-list');
  itemsListEl.innerHTML = state.cart.items.map(ci => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div>
        <span class="diet-indicator ${ci.item.isVeg ? 'veg' : 'non-veg'}" style="margin-right: 4px;"></span>
        <strong>${ci.item.name}</strong> x ${ci.quantity}
      </div>
      <div>₹${ci.item.price * ci.quantity}</div>
    </div>
  `).join('');

  // Bill breakdown
  document.getElementById('bill-item-total').textContent = `₹${pricing.itemTotal.toFixed(2)}`;
  document.getElementById('bill-packaging').textContent = `₹${pricing.packagingFee.toFixed(2)}`;
  document.getElementById('bill-delivery').textContent = `₹${pricing.deliveryFee.toFixed(2)}`;
  document.getElementById('bill-platform').textContent = `₹${pricing.platformFee.toFixed(2)}`;
  document.getElementById('bill-gst').textContent = `₹${pricing.gst.toFixed(2)}`;
  document.getElementById('bill-tip').textContent = `₹${pricing.tip.toFixed(2)}`;

  const discountRow = document.getElementById('bill-discount-row');
  if (pricing.discount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('bill-discount').textContent = `-₹${pricing.discount.toFixed(2)}`;
  } else {
    discountRow.style.display = 'none';
  }

  document.getElementById('bill-grand-total').textContent = `₹${pricing.grandTotal.toFixed(2)}`;

  // Applied coupon display
  const couponContainer = document.getElementById('applied-coupon-container');
  if (state.cart.coupon) {
    couponContainer.innerHTML = `
      <div class="applied-coupon-pill">
        <span>🎉 Coupon '${state.cart.coupon.code}' applied!</span>
        <button onclick="window.swiggyStore.removeCoupon()" style="background: none; border: none; color: #dc2626; font-weight: 700; cursor: pointer;">Remove</button>
      </div>
    `;
  } else {
    couponContainer.innerHTML = '';
  }
}

function applyCouponInput() {
  const code = document.getElementById('coupon-input-box').value;
  if (!code) return;

  const res = window.swiggyStore.applyCoupon(code);
  if (res.success) {
    window.notifManager.showToast({
      title: 'Coupon Applied! 🎉',
      message: `Promo code ${res.coupon.code} applied successfully.`,
      type: 'green'
    });
  } else {
    window.notifManager.showToast({
      title: 'Invalid Coupon',
      message: 'Please try SWIGGY50, WELCOME120, or FREEDEL.',
      type: 'orange'
    });
  }
}

function confirmOrderPlacement() {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'UPI (Google Pay)';
  const newOrder = window.swiggyStore.placeOrder(paymentMethod);

  if (newOrder) {
    closeCheckoutModal();
    switchCustomerTab('tracking');

    window.notifManager.showToast({
      title: 'Order Confirmed! 🚀',
      message: `Your food order #${newOrder.id} is confirmed. Tracking live rider now!`,
      type: 'green'
    });
  }
}

/* ==========================================================================
   Order Tracking & Dynamic ETA View
   ========================================================================== */
function renderLiveTracking(state) {
  const order = window.swiggyStore.getActiveOrder();
  if (!order) {
    document.getElementById('tracking-content').innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h3>No active order to track</h3>
        <p style="color: #64748b; margin-top: 8px;">Order some delicious food to start tracking delivery live.</p>
        <button class="primary-btn" onclick="switchCustomerTab('explore')" style="width: auto; margin: 16px auto; padding: 10px 24px;">Explore Restaurants</button>
      </div>
    `;
    return;
  }

  // Update ETA Display
  const etaMinsEl = document.getElementById('tracking-eta-mins');
  if (etaMinsEl) {
    if (order.status === 'delivered') {
      etaMinsEl.textContent = 'Delivered!';
      document.getElementById('tracking-eta-sub').textContent = 'Enjoy your delicious meal!';
    } else if (order.status === 'arrived') {
      etaMinsEl.textContent = 'Arrived!';
      document.getElementById('tracking-eta-sub').textContent = 'Rider is at your doorstep. Share OTP.';
    } else {
      etaMinsEl.textContent = `${order.etaMins} mins`;
      document.getElementById('tracking-eta-sub').textContent = `Estimated Delivery to ${order.deliveryAddress.tag}`;
    }
  }

  // Update Status Stepper
  const steps = [
    { key: 'placed', title: 'Order Placed', desc: 'Received & sent to restaurant' },
    { key: 'preparing', title: 'Food Being Prepared', desc: `${order.restaurant.name} is cooking your food` },
    { key: 'ready', title: 'Food Packed', desc: 'Waiting for delivery partner' },
    { key: 'picked_up', title: 'Out For Delivery', desc: `${order.rider.name} is heading to your doorstep` },
    { key: 'arrived', title: 'Arrived at Location', desc: 'Rider is waiting downstairs' },
    { key: 'delivered', title: 'Delivered', desc: 'Delivered with OTP verification' }
  ];

  const statusOrder = ['placed', 'preparing', 'ready', 'picked_up', 'arrived', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);

  const stepperEl = document.getElementById('tracking-stepper');
  if (stepperEl) {
    stepperEl.innerHTML = steps.map((s, idx) => {
      const isCompleted = idx < currentIndex;
      const isActive = idx === currentIndex;

      return `
        <div class="step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
          <div class="step-dot">${isCompleted ? '✓' : (idx + 1)}</div>
          <div class="step-info">
            <div class="step-title">${s.title}</div>
            <div class="step-desc">${s.desc}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Update Rider Profile Details
  const riderNameEl = document.getElementById('tracking-rider-name');
  if (riderNameEl) riderNameEl.textContent = order.rider.name;

  const riderVehicleEl = document.getElementById('tracking-rider-vehicle');
  if (riderVehicleEl) riderVehicleEl.textContent = order.rider.vehicle;

  const riderRatingEl = document.getElementById('tracking-rider-rating');
  if (riderRatingEl) riderRatingEl.textContent = `★ ${order.rider.rating} (${order.rider.deliveriesCompleted} deliveries)`;

  // Update Delivery OTP
  const otpCodeEl = document.getElementById('tracking-otp-code');
  if (otpCodeEl) otpCodeEl.textContent = order.otp;

  // Initialize and update Map
  setTimeout(() => {
    if (!window.mapTracker.isInitialized) {
      window.mapTracker.init('tracking-map');
    }
    window.mapTracker.updateRiderPosition(order.riderProgress);
  }, 100);
}

/* ==========================================================================
   Order History & Invoices View
   ========================================================================== */
function renderOrderHistory(state) {
  const container = document.getElementById('orders-history-list');
  if (!container) return;

  if (state.orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h3>No past orders found</h3>
        <p style="color: #64748b; margin-top: 8px;">Your orders and official tax invoices will appear here.</p>
        <button class="primary-btn" onclick="switchCustomerTab('explore')" style="width: auto; margin: 16px auto; padding: 10px 24px;">Order Now</button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.orders.map(o => {
    const itemsSummary = o.items.map(i => `${i.item.name} (${i.quantity})`).join(', ');
    const formattedDate = new Date(o.placedAt).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="order-history-card">
        <div class="order-hist-header">
          <div>
            <div class="hist-restaurant-title">${o.restaurant.name}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              Order #${o.id} • ${formattedDate}
            </div>
          </div>
          <div>
            <span class="badge ${o.status === 'delivered' ? 'badge-green' : ''}" style="text-transform: uppercase;">
              ${o.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div class="hist-items-summary">${itemsSummary}</div>

        <div class="hist-footer">
          <div>
            <span style="font-size: 13px; color: #64748b;">Total Bill:</span>
            <strong style="font-size: 17px; color: #0f172a; margin-left: 6px;">₹${o.pricing.grandTotal.toFixed(2)}</strong>
          </div>
          <div class="btn-group">
            <button class="secondary-btn" onclick="openInvoiceModal('${o.id}')">
              📄 View Tax Invoice
            </button>
            <button class="primary-btn" onclick="trackSpecificOrder('${o.id}')" style="padding: 8px 16px; font-size: 13px;">
              🗺️ Track Delivery
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openInvoiceModal(orderId) {
  const order = window.swiggyStore.state.orders.find(o => o.id === orderId) || window.swiggyStore.getActiveOrder();
  if (!order) return;

  const modal = document.getElementById('invoice-modal');
  const body = document.getElementById('invoice-modal-body');
  if (modal && body) {
    body.innerHTML = window.invoiceEngine.renderInvoiceHtml(order);
    modal.classList.add('active');
  }
}

function closeInvoiceModal() {
  const modal = document.getElementById('invoice-modal');
  if (modal) modal.classList.remove('active');
}

function trackSpecificOrder(orderId) {
  window.swiggyStore.state.activeOrderId = orderId;
  window.swiggyStore.notify();
  switchCustomerTab('tracking');
}

/* ==========================================================================
   Restaurant Partner Dashboard View
   ========================================================================== */
function renderRestaurantDashboard(state) {
  const grid = document.getElementById('restaurant-orders-grid');
  if (!grid) return;

  const orders = state.orders;

  if (orders.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">No incoming orders right now</div>`;
    return;
  }

  grid.innerHTML = orders.map(order => {
    let actionBtnHtml = '';

    if (order.status === 'placed') {
      actionBtnHtml = `
        <button class="ticket-btn accept" onclick="window.swiggyStore.updateOrderStatus('${order.id}', 'preparing')">
          Accept & Start Cooking 🍳
        </button>
      `;
    } else if (order.status === 'preparing') {
      actionBtnHtml = `
        <button class="ticket-btn ready" onclick="window.swiggyStore.updateOrderStatus('${order.id}', 'ready')">
          Mark Food Packed & Ready 📦
        </button>
      `;
    } else if (order.status === 'ready') {
      actionBtnHtml = `
        <button class="ticket-btn accept" onclick="window.swiggyStore.updateOrderStatus('${order.id}', 'picked_up')">
          Handover to Rider Rahul 🛵
        </button>
      `;
    } else {
      actionBtnHtml = `
        <div style="font-size: 13px; font-weight: 700; color: #16a34a; text-align: center; width: 100%; padding: 8px;">
          ✓ Order Handed Over & ${order.status.toUpperCase()}
        </div>
      `;
    }

    return `
      <div class="order-ticket ${order.status}">
        <div class="ticket-header">
          <div>
            <div class="ticket-id">Order #${order.id}</div>
            <div class="ticket-time">Customer: ${order.customer.name} (${order.customer.phone})</div>
          </div>
          <span class="ticket-status-pill ${order.status === 'placed' ? 'new' : order.status === 'preparing' ? 'cooking' : 'ready'}">
            ${order.status}
          </span>
        </div>

        <ul class="ticket-items">
          ${order.items.map(i => `
            <li class="ticket-item">
              <span>${i.quantity}x ${i.item.name}</span>
              <strong>₹${i.item.price * i.quantity}</strong>
            </li>
          `).join('')}
        </ul>

        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
          <span>Items Total: <strong>₹${order.pricing.itemTotal}</strong></span>
          <span style="color: #2563eb; font-weight: 700;">Paid via ${order.paymentMethod}</span>
        </div>

        <div class="ticket-actions">
          ${actionBtnHtml}
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   Rider Delivery Partner Dashboard View
   ========================================================================== */
function renderRiderDashboard(state) {
  const order = window.swiggyStore.getActiveOrder();
  const riderContainer = document.getElementById('rider-active-delivery-card');
  if (!riderContainer) return;

  if (!order || order.status === 'delivered') {
    riderContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 40px; margin-bottom: 12px;">🛵</div>
        <h3>No active delivery at the moment</h3>
        <p style="color: #64748b; margin-top: 6px;">You are currently ONLINE and ready to receive fresh delivery requests.</p>
      </div>
    `;
    return;
  }

  let riderActionHtml = '';

  if (order.status === 'ready') {
    riderActionHtml = `
      <button class="primary-btn" onclick="window.swiggyStore.updateOrderStatus('${order.id}', 'picked_up')">
        🛵 Pick Up Order from ${order.restaurant.name}
      </button>
    `;
  } else if (order.status === 'picked_up') {
    riderActionHtml = `
      <div class="sim-slider-box">
        <label>
          <span>Live GPS Progress (Restaurant ➔ Customer)</span>
          <span id="rider-progress-val">${Math.round(order.riderProgress * 100)}%</span>
        </label>
        <input type="range" min="0" max="100" value="${Math.round(order.riderProgress * 100)}" id="rider-manual-slider"
          oninput="handleRiderSliderChange('${order.id}', this.value)">
      </div>
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <button class="secondary-btn" style="flex: 1;" onclick="toggleAutoDrive('${order.id}')">
          ${state.simulating ? '⏸️ Pause Auto-Drive' : '▶️ Resume Auto-Drive'}
        </button>
        <button class="primary-btn" style="flex: 1;" onclick="window.swiggyStore.updateOrderStatus('${order.id}', 'arrived')">
          📍 Mark Arrived at Gate
        </button>
      </div>
    `;
  } else if (order.status === 'arrived') {
    riderActionHtml = `
      <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 14px; border-radius: 8px; margin-bottom: 12px;">
        <div style="font-size: 13px; font-weight: 700; color: #92400e;">Verify Delivery OTP with Customer</div>
        <p style="font-size: 12px; color: #78350f; margin-top: 4px;">Ask the customer for their 4-digit secret delivery code.</p>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <input type="text" id="rider-otp-input" placeholder="Enter 4-digit OTP" maxlength="4" style="flex: 1; padding: 8px; font-size: 16px; font-weight: 800; text-align: center; border: 1px solid #cbd5e1; border-radius: 6px;">
          <button class="primary-btn" style="width: auto; padding: 8px 18px;" onclick="verifyRiderOtp('${order.id}', '${order.otp}')">
            Verify & Deliver
          </button>
        </div>
      </div>
    `;
  }

  riderContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <span class="badge badge-green">ACTIVE TASK</span>
        <h3 style="margin-top: 4px;">Order #${order.id}</h3>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; color: #64748b;">Customer ETA</div>
        <strong style="font-size: 18px; color: #fc8019;">${order.etaMins} mins</strong>
      </div>
    </div>

    <div class="route-steps-box">
      <div class="route-point">
        <span class="point-icon">🍽️</span>
        <div>
          <div class="point-title">Pickup: ${order.restaurant.name}</div>
          <div class="point-address">${order.restaurant.address}</div>
        </div>
      </div>
      <div class="route-point">
        <span class="point-icon">🏠</span>
        <div>
          <div class="point-title">Dropoff: ${order.customer.name}</div>
          <div class="point-address">${order.deliveryAddress.line1}, ${order.deliveryAddress.line2}</div>
        </div>
      </div>
    </div>

    <div style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 16px;">
      <strong>Order Items (${order.items.length}):</strong> ${order.items.map(i => `${i.quantity}x ${i.item.name}`).join(', ')}
    </div>

    ${riderActionHtml}
  `;
}

function handleRiderSliderChange(orderId, val) {
  const progress = Number(val) / 100;
  const coords = window.mapTracker.getPointAtProgress(progress);
  window.swiggyStore.updateRiderPosition(orderId, progress, coords);
  window.mapTracker.updateRiderPosition(progress);
}

function toggleAutoDrive(orderId) {
  const currentState = window.swiggyStore.state.simulating;
  window.swiggyStore.state.simulating = !currentState;
  window.swiggyStore.notify();

  if (window.swiggyStore.state.simulating) {
    window.mapTracker.startLiveSimulation(orderId);
  } else {
    window.mapTracker.stopLiveSimulation();
  }
}

function verifyRiderOtp(orderId, expectedOtp) {
  const inputEl = document.getElementById('rider-otp-input');
  if (!inputEl) return;

  if (inputEl.value.trim() === expectedOtp) {
    window.swiggyStore.updateOrderStatus(orderId, 'delivered');
    window.notifManager.showToast({
      title: 'Delivery Completed! 🏆',
      message: 'OTP verified successfully. Order marked as Delivered!',
      type: 'green'
    });
  } else {
    alert("Incorrect OTP! Please check with customer (Hint: Customer OTP is " + expectedOtp + ")");
  }
}

/* ==========================================================================
   Navigation & Event Listeners
   ========================================================================= */
function switchCustomerTab(tabName) {
  window.currentCustomerTab = tabName;
  renderApp(window.swiggyStore.state);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearFilters() {
  currentFilter = 'all';
  currentCategory = null;
  searchQuery = '';
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  document.getElementById('filter-all')?.classList.add('active');
  const sInput = document.getElementById('global-search-input');
  if (sInput) sInput.value = '';
  renderApp(window.swiggyStore.state);
}

function setupEventListeners() {
  // Role switcher clicks
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.swiggyStore.setRole(btn.dataset.role);
    });
  });

  // Sound toggle button
  document.getElementById('sound-toggle-btn')?.addEventListener('click', () => {
    window.soundManager.toggleSound();
    renderApp(window.swiggyStore.state);
  });

  // Simulation speed button
  document.getElementById('sim-speed-btn')?.addEventListener('click', () => {
    const current = window.swiggyStore.state.simulationSpeed || 1;
    const nextSpeed = current === 1 ? 2 : current === 2 ? 5 : 1;
    window.swiggyStore.state.simulationSpeed = nextSpeed;
    window.swiggyStore.notify();
  });

  // Customer Navigation items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      switchCustomerTab(item.dataset.tab);
    });
  });

  // Search input
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (window.currentCustomerTab !== 'explore') {
        window.currentCustomerTab = 'explore';
      }
      renderRestaurantList(window.swiggyStore.state);
    });
  }

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderRestaurantList(window.swiggyStore.state);
    });
  });

  // Notification Bell toggle
  document.getElementById('notif-bell-btn')?.addEventListener('click', () => {
    const drawer = document.getElementById('notif-drawer');
    drawer.classList.toggle('open');
    if (drawer.classList.contains('open')) {
      window.swiggyStore.markAllNotificationsRead();
    }
  });

  document.getElementById('close-notif-drawer')?.addEventListener('click', () => {
    document.getElementById('notif-drawer').classList.remove('open');
  });

  // Floating Cart click
  document.getElementById('floating-cart-bar')?.addEventListener('click', () => {
    openCheckoutModal();
  });

  // Checkout modal tip buttons
  document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.swiggyStore.setTip(Number(btn.dataset.tip));
    });
  });
}

