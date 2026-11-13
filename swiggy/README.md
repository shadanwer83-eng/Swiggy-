# 🍔 Swiggy Food Delivery & Live Tracking Platform

A modern, responsive food delivery web application inspired by **Swiggy**. It covers the complete lifecycle of a food order: taking orders, generating official itemized tax invoices, live GPS rider tracking with interactive Leaflet maps, and real-time customer notifications with dynamic ETA calculation.

---

## 🌟 Key Features

### 1. 🛒 Taking Orders (Customer App)
- **Restaurant & Menu Browsing**: Curated top restaurant chains (Meghana Foods, Truffles American Diner, Corner House, Empire Restaurant) with ratings, delivery time, distance, and pricing.
- **Diet Indicators & Badges**: Veg (Green dot) / Non-Veg (Red triangle) icons, Bestseller flags, and categories (Biryanis, Burgers, Desserts, Starters).
- **Cart & Quantity Controls**: Add, increment, and decrement items with instantaneous subtotal calculation.
- **Smart Checkout**:
  - Saved delivery addresses (Home / Work).
  - Promo coupons (`SWIGGY50` for 50% off, `WELCOME120` for flat ₹120 off, `FREEDEL` for free delivery).
  - Delivery partner tip selection (₹10, ₹20, ₹30, ₹50).
  - Payment modes: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Cash on Delivery.
  - Transparent bill breakdown: Item total, Restaurant packaging, Platform convenience fee, Delivery fee, 5% GST, Tip, and Coupon discounts.

### 2. 📄 Official Food Order Invoices
- **Authentic Tax Invoice**: Follows Indian GST and FSSAI standards.
  - Restaurant GSTIN, FSSAI license, registered address.
  - Customer contact details & delivery address.
  - Invoice Number (e.g. `SWG-INV-2026-XXXX`) and unique Order ID.
  - Itemized table with quantities, unit rates, and totals.
  - Split tax calculations: CGST (2.5%) and SGST (2.5%).
  - Total amount in words (e.g. *"One Thousand One Rupees and Fifty Five Paise Only"*).
- **Print & PDF Support**: Fully optimized `@media print` CSS layout for instant printing or saving as a clean PDF receipt.
- **JSON Export**: Export raw order and tax data with one click.
- **Order History**: Access and re-print invoices for any past order anytime.

### 3. 🗺️ Live Delivery Rider Tracking
- **Interactive Leaflet Map**: Powered by OpenStreetMap / CartoDB tiles.
- **Custom Visual Markers**:
  - 🍽️ Restaurant location marker.
  - 🏠 Customer doorstep with pulsing radar beacon.
  - 🛵 Delivery Rider icon with animated motorcycle along real Bangalore street coordinates (Koramangala ➔ HSR Layout).
- **Dynamic Route Trajectory**: Polyline connecting restaurant, rider, and destination, with completed path highlighted in orange.
- **6-Step Progress Stepper**:
  1. Order Placed
  2. Cooking in Kitchen (Restaurant accepted)
  3. Food Packed & Ready
  4. Out for Delivery (Rider en route)
  5. Arrived at Customer Location
  6. Order Delivered (Secured with OTP)
- **Rider Profile**: Photo, vehicle number (e.g. *Hero Splendor KA 01 EK 8832*), 4.9★ rating, safety badges, and direct call/chat simulation.
- **OTP Verification**: Generates a 4-digit customer delivery OTP (e.g. `4829`) required by the rider to complete delivery.

### 4. 🔔 Customer Notifications & Dynamic ETA
- **Dynamic ETA Countdown**: Real-time delivery estimate (e.g. *28 mins ➔ 14 mins ➔ 5 mins ➔ Arrived*) computed dynamically from remaining rider distance.
- **Toast Notifications**: Floating alert popups for order confirmations, chef cooking status, rider pickup, proximity alerts, and delivery completion.
- **Synthesized Audio Chimes**: Web Audio API tone generator playing custom Swiggy-style notification chimes and fanfares (no external mp3 files required).
- **Notification Center Drawer**: Notification history drawer accessible via the bell icon with an unread badge counter.
- **Browser Notification API**: Optional desktop push notifications if user grants permission.

### 5. 👥 3-in-1 Multi-Role Experience
Use the role bar at the top to toggle between 3 integrated roles:
1. **🍔 Customer App**: Browse menus, place orders, track live ETA, view invoices.
2. **🍳 Kitchen (KDS) Station**: Restaurant dashboard to view incoming orders, accept orders, start cooking, and mark food ready for pickup.
3. **🛵 Rider Delivery Partner**: View assigned orders, inspect pickup/dropoff points, use the live GPS progress slider, toggle auto-drive simulation, and enter customer OTP to complete delivery.
> **Cross-Tab Sync**: All changes sync in real-time across multiple open browser tabs using the modern `BroadcastChannel` API and `LocalStorage`.

---

## 🚀 How to Run

### Method 1: Open Directly in Browser (Zero Install)
Simply double click `index.html` or run in terminal:
```powershell
Start-Process "index.html"
```

### Method 2: Run with Built-in PowerShell Server
Run the included lightweight server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
swiggy/
├── index.html          # Main HTML5 application shell & view templates
├── server.ps1          # Lightweight local HTTP server script
├── README.md           # Documentation
├── css/
│   └── style.css       # Swiggy orange-themed CSS, responsive styles & print layout
└── js/
    ├── data.js         # Restaurants, menus, riders, promo codes & route waypoints
    ├── store.js        # Reactive state store, LocalStorage & BroadcastChannel sync
    ├── audio.js        # Web Audio API synthesizers for Swiggy chimes & sounds
    ├── invoice.js      # Itemized tax invoice generator & PDF printing
    ├── map.js          # Leaflet map manager, custom markers & rider route animation
    ├── notifications.js# Toast alerts, ETA broadcast & notification drawer
    └── app.js          # UI controller connecting views, cart, modals & roles
```

---

## 💡 Quick Demo Walkthrough

1. Open `index.html`.
2. Notice the pre-loaded active order (#OD-982145) or place a new one:
   - Click any dish on **Meghana Foods** or **Truffles**.
   - Click the green floating cart bar at the bottom.
   - Enter coupon code `SWIGGY50` and select your tip.
   - Click **PLACE ORDER & PAY NOW**.
3. You will immediately hear the confirmation chime and be taken to **Live Tracking**:
   - Watch the motorcycle move along the map towards HSR Layout.
   - Watch the ETA update dynamically.
   - Click **📄 Tax Invoice** to view or print the official tax invoice.
4. Switch to **🍳 Kitchen (KDS)** via the top role bar:
   - Mark orders as preparing or ready.
5. Switch to **🛵 Rider App**:
   - Use the slider to drag the rider along the route.
   - Arrive at the door, enter the customer's 4-digit OTP, and complete the delivery!

