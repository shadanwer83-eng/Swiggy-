/**
 * Swiggy State Management Store
 * Reactive state store with LocalStorage persistence and BroadcastChannel sync.
 */

class SwiggyStore {
  constructor() {
    this.STORAGE_KEY = 'swiggy_app_state_v1';
    this.listeners = new Set();
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('swiggy_channel') : null;

    // Load initial state or defaults
    this.state = this.loadState() || this.getDefaultState();

    if (this.channel) {
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_STATE') {
          this.state = event.data.state;
          this.notify(false); // Don't re-broadcast
        }
      };
    }

    // Set up auto-save
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  }

  getDefaultState() {
    return {
      currentRole: 'customer', // 'customer' | 'restaurant' | 'rider'
      selectedRestaurantId: 'rest_1',
      cart: {
        restaurantId: 'rest_1',
        items: [
          {
            item: APP_DATA.restaurants[0].menu[0], // Meghana Special Biryani
            quantity: 2
          },
          {
            item: APP_DATA.restaurants[0].menu[2], // Andhra Chicken 65
            quantity: 1
          }
        ],
        coupon: null,
        tip: 30,
        address: APP_DATA.customerProfile.addresses[0],
        instructions: 'Please leave the food package at the door and ring the bell.'
      },
      orders: [
        {
          id: 'OD-982145',
          invoiceNumber: 'SWG-INV-2026-44120',
          restaurant: APP_DATA.restaurants[0],
          customer: APP_DATA.customerProfile,
          deliveryAddress: APP_DATA.customerProfile.addresses[0],
          items: [
            { item: APP_DATA.restaurants[0].menu[0], quantity: 2 },
            { item: APP_DATA.restaurants[0].menu[2], quantity: 1 }
          ],
          pricing: {
            itemTotal: 970,
            packagingFee: 35,
            deliveryFee: 40,
            platformFee: 6,
            gst: 50.55,
            tip: 30,
            discount: 100,
            grandTotal: 1001.55
          },
          couponCode: 'SWIGGY50',
          paymentMethod: 'UPI (Google Pay)',
          status: 'picked_up', // 'placed' | 'preparing' | 'ready' | 'picked_up' | 'arriving' | 'delivered'
          rider: APP_DATA.riders[0],
          riderProgress: 0.45, // 0 (restaurant) to 1 (home)
          riderCurrentCoords: [12.9254, 77.6315],
          otp: '4829',
          placedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          etaMins: 14,
          logs: [
            { time: '12:00 PM', text: 'Order placed & payment verified successfully.' },
            { time: '12:03 PM', text: 'Restaurant accepted order and started cooking.' },
            { time: '12:12 PM', text: 'Food packed! Delivery partner Rahul arrived at restaurant.' },
            { time: '12:15 PM', text: 'Rahul picked up order and is on the way.' }
          ]
        }
      ],
      activeOrderId: 'OD-982145',
      notifications: [
        {
          id: 'notif_1',
          type: 'order',
          title: 'Order Picked Up! 🛵',
          message: 'Rahul has picked up your meal from Meghana Foods and is heading your way. ETA 14 mins.',
          timestamp: 'Just now',
          read: false
        },
        {
          id: 'notif_2',
          type: 'kitchen',
          title: 'Food is Prepared 🍳',
          message: 'Chef at Meghana Foods has packed your order with safety seals.',
          timestamp: '3 mins ago',
          read: true
        }
      ],
      simulating: true,
      simulationSpeed: 1 // 1x, 2x, 5x
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
      return null;
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  }

  notify(broadcast = true) {
    this.saveState();
    this.listeners.forEach(cb => cb(this.state));
    if (broadcast && this.channel) {
      this.channel.postMessage({ type: 'SYNC_STATE', state: this.state });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // State mutations
  setRole(role) {
    this.state.currentRole = role;
    this.notify();
  }

  selectRestaurant(restaurantId) {
    this.state.selectedRestaurantId = restaurantId;
    this.notify();
  }

  addToCart(item, restaurantId) {
    // If cart has items from another restaurant, prompt or replace
    if (this.state.cart.items.length > 0 && this.state.cart.restaurantId !== restaurantId) {
      this.state.cart.items = [];
    }
    this.state.cart.restaurantId = restaurantId;

    const existingIndex = this.state.cart.items.findIndex(i => i.item.id === item.id);
    if (existingIndex > -1) {
      this.state.cart.items[existingIndex].quantity += 1;
    } else {
      this.state.cart.items.push({ item, quantity: 1 });
    }
    this.notify();
  }

  removeFromCart(itemId) {
    const existingIndex = this.state.cart.items.findIndex(i => i.item.id === itemId);
    if (existingIndex > -1) {
      if (this.state.cart.items[existingIndex].quantity > 1) {
        this.state.cart.items[existingIndex].quantity -= 1;
      } else {
        this.state.cart.items.splice(existingIndex, 1);
      }
    }
    this.notify();
  }

  clearCart() {
    this.state.cart.items = [];
    this.state.cart.coupon = null;
    this.notify();
  }

  applyCoupon(couponCode) {
    const coupon = APP_DATA.coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (coupon) {
      this.state.cart.coupon = coupon;
      this.notify();
      return { success: true, coupon };
    }
    return { success: false, message: 'Invalid promo code' };
  }

  removeCoupon() {
    this.state.cart.coupon = null;
    this.notify();
  }

  setTip(tipAmount) {
    this.state.cart.tip = tipAmount;
    this.notify();
  }

  setDeliveryAddress(address) {
    this.state.cart.address = address;
    this.notify();
  }

  // Calculate cart pricing
  getCartPricing() {
    const itemTotal = this.state.cart.items.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
    const packagingFee = this.state.cart.items.length > 0 ? 35 : 0;
    let deliveryFee = this.state.cart.items.length > 0 ? 40 : 0;
    const platformFee = this.state.cart.items.length > 0 ? 6 : 0;
    const tip = this.state.cart.tip || 0;

    // Coupon discount calculation
    let discount = 0;
    if (this.state.cart.coupon) {
      const c = this.state.cart.coupon;
      if (c.freeDelivery) {
        discount += deliveryFee;
        deliveryFee = 0;
      } else if (c.discountPct) {
        const pctDisc = (itemTotal * c.discountPct) / 100;
        discount = Math.min(pctDisc, c.maxDiscount || 9999);
      } else if (c.flatDiscount) {
        discount = c.flatDiscount;
      }
    }

    // 5% GST on (itemTotal + packaging)
    const gst = itemTotal > 0 ? Number(((itemTotal + packagingFee) * 0.05).toFixed(2)) : 0;
    const grandTotal = Math.max(0, Number((itemTotal + packagingFee + deliveryFee + platformFee + gst + tip - discount).toFixed(2)));

    return {
      itemTotal,
      packagingFee,
      deliveryFee,
      platformFee,
      gst,
      tip,
      discount,
      grandTotal
    };
  }

  // Create & Place Order
  placeOrder(paymentMethod = 'UPI (Google Pay)') {
    if (this.state.cart.items.length === 0) return null;

    const rest = APP_DATA.restaurants.find(r => r.id === this.state.cart.restaurantId) || APP_DATA.restaurants[0];
    const rider = APP_DATA.riders[0];
    const pricing = this.getCartPricing();
    const orderId = 'OD-' + Math.floor(100000 + Math.random() * 900000);
    const invoiceNum = 'SWG-INV-2026-' + Math.floor(10000 + Math.random() * 90000);
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder = {
      id: orderId,
      invoiceNumber: invoiceNum,
      restaurant: rest,
      customer: APP_DATA.customerProfile,
      deliveryAddress: this.state.cart.address || APP_DATA.customerProfile.addresses[0],
      items: JSON.parse(JSON.stringify(this.state.cart.items)),
      pricing: pricing,
      couponCode: this.state.cart.coupon ? this.state.cart.coupon.code : null,
      paymentMethod: paymentMethod,
      status: 'placed',
      rider: rider,
      riderProgress: 0.0,
      riderCurrentCoords: rest.coordinates,
      otp: otp,
      placedAt: new Date().toISOString(),
      etaMins: rest.avgDeliveryMins || 25,
      logs: [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: 'Order placed successfully.' }
      ]
    };

    this.state.orders.unshift(newOrder);
    this.state.activeOrderId = orderId;
    this.clearCart();

    this.addNotification({
      type: 'order',
      title: 'Order Placed! 🎉',
      message: `Your order #${orderId} from ${rest.name} has been placed. Sit back and relax!`,
      timestamp: 'Just now'
    });

    if (window.soundManager) {
      window.soundManager.playOrderPlaced();
    }

    this.notify();
    return newOrder;
  }

  getActiveOrder() {
    return this.state.orders.find(o => o.id === this.state.activeOrderId) || this.state.orders[0];
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let notifTitle = '';
    let notifMsg = '';

    if (newStatus === 'preparing') {
      order.logs.push({ time: nowTime, text: `${order.restaurant.name} accepted your order and began preparing.` });
      notifTitle = 'Cooking in Kitchen 👨‍🍳';
      notifMsg = `Chef at ${order.restaurant.name} is preparing your fresh meal.`;
      order.etaMins = Math.max(15, order.etaMins - 5);
    } else if (newStatus === 'ready') {
      order.logs.push({ time: nowTime, text: 'Food is packed and ready for pickup.' });
      notifTitle = 'Order Packed & Ready 📦';
      notifMsg = `Your food is packaged and waiting for rider ${order.rider.name}.`;
    } else if (newStatus === 'picked_up') {
      order.logs.push({ time: nowTime, text: `${order.rider.name} picked up the package and is on the way!` });
      notifTitle = 'Out For Delivery! 🛵';
      notifMsg = `${order.rider.name} has picked up your food and is speeding to your location.`;
      order.etaMins = Math.max(10, order.etaMins - 10);
    } else if (newStatus === 'arrived') {
      order.logs.push({ time: nowTime, text: `${order.rider.name} has arrived at your address.` });
      notifTitle = 'Rider at Doorstep! 📍';
      notifMsg = `${order.rider.name} has reached your building. Share OTP ${order.otp} to collect your order.`;
      order.etaMins = 1;
    } else if (newStatus === 'delivered') {
      order.logs.push({ time: nowTime, text: `Delivered! Verified with OTP ${order.otp}. Enjoy your meal!` });
      notifTitle = 'Order Delivered! 🍽️';
      notifMsg = `Your order from ${order.restaurant.name} was successfully delivered. Bon Appétit!`;
      order.etaMins = 0;
      order.riderProgress = 1.0;
      if (window.soundManager) {
        window.soundManager.playDeliveredFanfare();
      }
    }

    if (notifTitle) {
      this.addNotification({
        type: newStatus,
        title: notifTitle,
        message: notifMsg,
        timestamp: 'Just now'
      });
      if (newStatus !== 'delivered' && window.soundManager) {
        window.soundManager.playNotificationPing();
      }
    }

    this.notify();
  }

  updateRiderPosition(orderId, progress, coords) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.riderProgress = progress;
    if (coords) {
      order.riderCurrentCoords = coords;
    }

    // Recalculate ETA dynamically
    if (order.status === 'picked_up') {
      const remainingDistanceRatio = Math.max(0, 1 - progress);
      order.etaMins = Math.max(1, Math.round(remainingDistanceRatio * 18));

      if (progress >= 0.96 && order.status !== 'arrived') {
        this.updateOrderStatus(orderId, 'arrived');
      }
    }

    this.notify();
  }

  addNotification(notif) {
    const newNotif = {
      id: 'notif_' + Date.now(),
      ...notif,
      read: false
    };
    this.state.notifications.unshift(newNotif);

    // Call browser notifications if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notif.title, {
          body: notif.message,
          icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png'
        });
      } catch (e) {
        console.warn("Browser notification error:", e);
      }
    }
  }

  markAllNotificationsRead() {
    this.state.notifications.forEach(n => n.read = true);
    this.notify();
  }
}

window.swiggyStore = new SwiggyStore();

