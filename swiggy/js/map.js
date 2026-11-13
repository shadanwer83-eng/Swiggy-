/**
 * Swiggy Live Tracking & Interactive Map Engine
 * Powered by Leaflet.js with custom animated markers & route simulation.
 */

class SwiggyMapTracker {
  constructor() {
    this.map = null;
    this.riderMarker = null;
    this.restaurantMarker = null;
    this.customerMarker = null;
    this.routePolyline = null;
    this.traveledPolyline = null;
    this.isInitialized = false;
    this.animInterval = null;
    this.routeWaypoints = APP_DATA.simulatedRoute;
    this.currentOrder = null;
  }

  init(containerId = 'tracking-map') {
    const mapElement = document.getElementById(containerId);
    if (!mapElement) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const startCoord = this.routeWaypoints[0];
    const endCoord = this.routeWaypoints[this.routeWaypoints.length - 1];
    const centerCoord = [
      (startCoord[0] + endCoord[0]) / 2,
      (startCoord[1] + endCoord[1]) / 2
    ];

    try {
      this.map = L.map(containerId, {
        zoomControl: true,
        attributionControl: false
      }).setView(centerCoord, 14);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(this.map);

      this.isInitialized = true;
      this.renderRoute();
    } catch (e) {
      console.warn("Leaflet map initialization warning:", e);
    }
  }

  createCustomIcon(htmlContent, className, size = [44, 44]) {
    return L.divIcon({
      html: htmlContent,
      className: className,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1] / 2]
    });
  }

  renderRoute() {
    if (!this.map) return;

    const restCoord = this.routeWaypoints[0];
    const custCoord = this.routeWaypoints[this.routeWaypoints.length - 1];

    // Restaurant Marker
    const restIconHtml = `
      <div style="background: #ffffff; border: 2px solid #fc8019; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); font-size: 20px;">
        🍽️
      </div>
    `;
    this.restaurantMarker = L.marker(restCoord, {
      icon: this.createCustomIcon(restIconHtml, 'rest-map-icon', [40, 40])
    }).addTo(this.map).bindPopup("<strong>Restaurant</strong><br>Preparing food");

    // Customer Marker with pulsing beacon
    const custIconHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
        <div style="position: absolute; width: 44px; height: 44px; background: rgba(96, 178, 70, 0.35); border-radius: 50%; animation: pulseDot 2s infinite;"></div>
        <div style="background: #15803d; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 2;">
          🏠
        </div>
      </div>
    `;
    this.customerMarker = L.marker(custCoord, {
      icon: this.createCustomIcon(custIconHtml, 'cust-map-icon', [44, 44])
    }).addTo(this.map).bindPopup("<strong>Delivery Address</strong><br>Your Doorstep");

    // Full Route Line
    this.routePolyline = L.polyline(this.routeWaypoints, {
      color: '#94a3b8',
      weight: 6,
      opacity: 0.6,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(this.map);

    // Traveled Route Line (orange solid)
    this.traveledPolyline = L.polyline([restCoord], {
      color: '#fc8019',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round'
    }).addTo(this.map);

    // Rider Marker
    const riderIconHtml = `
      <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
        <div style="background: #fc8019; color: #fff; width: 42px; height: 42px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(252,128,25,0.6); display: flex; align-items: center; justify-content: center; font-size: 22px;">
          🛵
        </div>
      </div>
    `;
    this.riderMarker = L.marker(restCoord, {
      icon: this.createCustomIcon(riderIconHtml, 'rider-map-icon', [48, 48]),
      zIndexOffset: 1000
    }).addTo(this.map).bindPopup("<strong>Rahul Sharma</strong><br>Hero Splendor (KA 01 EK 8832)");

    // Fit bounds to show entire route with padding
    this.map.fitBounds(this.routePolyline.getBounds(), { padding: [50, 50] });
  }

  // Interpolate coordinate along waypoints based on progress [0.0 ... 1.0]
  getPointAtProgress(progress) {
    const pts = this.routeWaypoints;
    const clamped = Math.max(0, Math.min(1, progress));
    const totalSegments = pts.length - 1;
    const segmentIndex = Math.min(Math.floor(clamped * totalSegments), totalSegments - 1);
    const segmentProgress = (clamped * totalSegments) - segmentIndex;

    const p1 = pts[segmentIndex];
    const p2 = pts[segmentIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
    const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;

    return [lat, lng];
  }

  updateRiderPosition(progress) {
    if (!this.map || !this.riderMarker) return;

    const currentCoord = this.getPointAtProgress(progress);
    this.riderMarker.setLatLng(currentCoord);

    // Update traveled line
    const totalSegments = this.routeWaypoints.length - 1;
    const currentSegmentIndex = Math.floor(progress * totalSegments);
    const traveledPoints = this.routeWaypoints.slice(0, currentSegmentIndex + 1);
    traveledPoints.push(currentCoord);
    this.traveledPolyline.setLatLngs(traveledPoints);
  }

  startLiveSimulation(orderId) {
    if (this.animInterval) {
      clearInterval(this.animInterval);
    }

    this.animInterval = setInterval(() => {
      const state = window.swiggyStore.state;
      const order = state.orders.find(o => o.id === orderId);

      if (!order || !state.simulating) return;

      // Only move rider if status is picked_up
      if (order.status === 'picked_up') {
        const step = 0.015 * (state.simulationSpeed || 1);
        const newProgress = Math.min(1.0, order.riderProgress + step);
        const coords = this.getPointAtProgress(newProgress);

        window.swiggyStore.updateRiderPosition(orderId, newProgress, coords);
        this.updateRiderPosition(newProgress);

        if (newProgress >= 1.0) {
          clearInterval(this.animInterval);
          this.animInterval = null;
        }
      }
    }, 1000);
  }

  stopLiveSimulation() {
    if (this.animInterval) {
      clearInterval(this.animInterval);
      this.animInterval = null;
    }
  }
}

window.mapTracker = new SwiggyMapTracker();

