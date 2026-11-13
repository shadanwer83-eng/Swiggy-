/**
 * Swiggy Notification & Live ETA Broadcast Manager
 */

class SwiggyNotificationManager {
  constructor() {
    this.toastContainer = null;
    this.unreadCount = 0;
    this.hasRequestedPermission = false;
  }

  init() {
    this.toastContainer = document.getElementById('toast-container');
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
  }

  requestBrowserPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showToast({
            title: 'Notifications Enabled 🔔',
            message: 'You will receive real-time delivery and ETA alerts right on your screen.',
            type: 'green'
          });
        }
      });
    }
  }

  showToast({ title, message, type = 'orange', icon = '🛵', duration = 5000 }) {
    if (!this.toastContainer) this.init();

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'green' ? 'toast-green' : type === 'blue' ? 'toast-blue' : ''}`;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
        <div class="toast-time">${nowStr}</div>
      </div>
      <button class="toast-close" title="Close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => toast.remove(), 300);
    });

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  renderNotificationDrawer() {
    const listEl = document.getElementById('notif-drawer-list');
    const badgeEl = document.getElementById('notif-badge');
    if (!listEl) return;

    const notifs = window.swiggyStore.state.notifications;
    const unreadCount = notifs.filter(n => !n.read).length;

    if (badgeEl) {
      if (unreadCount > 0) {
        badgeEl.textContent = unreadCount;
        badgeEl.style.display = 'inline-block';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    if (notifs.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 40px 20px;">No notifications yet</div>`;
      return;
    }

    listEl.innerHTML = notifs.map(n => {
      let icon = '🔔';
      if (n.type === 'order') icon = '🎉';
      else if (n.type === 'preparing') icon = '👨‍🍳';
      else if (n.type === 'ready') icon = '📦';
      else if (n.type === 'picked_up') icon = '🛵';
      else if (n.type === 'arrived') icon = '📍';
      else if (n.type === 'delivered') icon = '🍽️';

      return `
        <div class="notif-item ${n.read ? '' : 'unread'}">
          <div style="font-size: 22px;">${icon}</div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${n.title}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">${n.message}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">${n.timestamp}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.notifManager = new SwiggyNotificationManager();

