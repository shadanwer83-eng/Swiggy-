/**
 * Swiggy Invoice Generation Engine
 * Creates authentic itemized tax invoices for food orders with print & export features.
 */

class SwiggyInvoiceEngine {
  constructor() {
    this.companyDetails = {
      name: 'Bundl Technologies Pvt. Ltd. (Swiggy)',
      address: 'Devarabisanahalli, Outer Ring Road, Bellandur, Bengaluru - 560103, Karnataka, India',
      cin: 'U74110KA2013PTC096530',
      gstin: '29AABCB3982Q1Z8',
      fssai: '10019043002768',
      supportEmail: 'support@swiggy.in'
    };
  }

  // Convert number to words in Indian Rupees
  numberToWords(amount) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const num = Math.floor(amount);
    const paise = Math.round((amount - num) * 100);

    function convertThousands(n) {
      if (n === 0) return '';
      if (n < 20) return units[n] + ' ';
      if (n < 100) return tens[Math.floor(n / 10)] + ' ' + units[n % 10] + ' ';
      return units[Math.floor(n / 100)] + ' Hundred ' + convertThousands(n % 100);
    }

    if (num === 0 && paise === 0) return 'Zero Rupees Only';

    let result = '';
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    if (crore > 0) result += convertThousands(crore) + 'Crore ';
    if (lakh > 0) result += convertThousands(lakh) + 'Lakh ';
    if (thousand > 0) result += convertThousands(thousand) + 'Thousand ';
    if (remainder > 0) result += convertThousands(remainder);

    result = result.trim() + ' Rupees';
    if (paise > 0) {
      result += ' and ' + convertThousands(paise).trim() + ' Paise';
    }
    result += ' Only';
    return result;
  }

  renderInvoiceHtml(order) {
    if (!order) return '<p>No order found</p>';

    const placedDate = new Date(order.placedAt);
    const formattedDate = placedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = placedDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsHtml = order.items.map((itemObj, index) => {
      const itm = itemObj.item;
      const qty = itemObj.quantity;
      const amount = itm.price * qty;
      const vegDot = itm.isVeg ? '<span style="color:#60b246">● Veg</span>' : '<span style="color:#e43b4f">▲ Non-Veg</span>';

      return `
        <tr>
          <td style="text-align: center; color: #64748b;">${index + 1}</td>
          <td>
            <strong>${itm.name}</strong><br>
            <small style="font-size: 11px;">${vegDot} | Category: ${itm.category || 'Mains'}</small>
          </td>
          <td style="text-align: center;">${qty}</td>
          <td style="text-align: right;">₹${itm.price.toFixed(2)}</td>
          <td style="text-align: right; font-weight: 600;">₹${amount.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const cgst = (order.pricing.gst / 2).toFixed(2);
    const sgst = (order.pricing.gst / 2).toFixed(2);
    const words = this.numberToWords(order.pricing.grandTotal);

    return `
      <div class="invoice-container" id="printable-invoice">
        <div class="invoice-header">
          <div class="inv-logo-box">
            <div style="width: 44px; height: 44px; background: #fc8019; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 900;">
              S
            </div>
            <div>
              <div class="inv-brand-name">SWIGGY</div>
              <div style="font-size: 11px; color: #64748b;">${this.companyDetails.name}</div>
            </div>
          </div>
          <div class="inv-meta">
            <span class="inv-badge">TAX INVOICE</span>
            <div class="inv-number" style="margin-top: 6px;"># ${order.invoiceNumber}</div>
            <div><strong>Order ID:</strong> ${order.id}</div>
            <div><strong>Date:</strong> ${formattedDate}, ${formattedTime}</div>
          </div>
        </div>

        <div class="inv-grid">
          <div class="inv-card">
            <div class="inv-card-title">Order Fulfilled By (Restaurant)</div>
            <strong style="font-size: 15px; color: #0f172a;">${order.restaurant.name}</strong>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">${order.restaurant.address}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
              <strong>FSSAI Lic:</strong> ${order.restaurant.fssai}<br>
              <strong>GSTIN:</strong> ${order.restaurant.gstin}
            </div>
          </div>

          <div class="inv-card">
            <div class="inv-card-title">Delivered To (Customer)</div>
            <strong style="font-size: 15px; color: #0f172a;">${order.customer.name}</strong>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">
              ${order.deliveryAddress.line1}, ${order.deliveryAddress.line2}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
              <strong>Phone:</strong> ${order.customer.phone}<br>
              <strong>Payment:</strong> <span style="color:#16a34a; font-weight:700;">PAID via ${order.paymentMethod}</span>
            </div>
          </div>
        </div>

        <table class="inv-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Item Description</th>
              <th style="width: 70px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Unit Price</th>
              <th style="width: 110px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="inv-summary-box">
          <table class="inv-summary-table">
            <tr>
              <td>Item Total</td>
              <td class="text-right">₹${order.pricing.itemTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Restaurant Packaging Charges</td>
              <td class="text-right">₹${order.pricing.packagingFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Delivery Partner Fee</td>
              <td class="text-right">₹${order.pricing.deliveryFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Platform Convenience Fee</td>
              <td class="text-right">₹${order.pricing.platformFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td>CGST (2.5%)</td>
              <td class="text-right">₹${cgst}</td>
            </tr>
            <tr>
              <td>SGST (2.5%)</td>
              <td class="text-right">₹${sgst}</td>
            </tr>
            ${order.pricing.tip > 0 ? `
              <tr>
                <td>Delivery Partner Tip</td>
                <td class="text-right">₹${order.pricing.tip.toFixed(2)}</td>
              </tr>
            ` : ''}
            ${order.pricing.discount > 0 ? `
              <tr style="color: #16a34a;">
                <td>Coupon Discount (${order.couponCode || 'PROMO'})</td>
                <td class="text-right">-₹${order.pricing.discount.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr class="total-line">
              <td>Total Amount Paid</td>
              <td class="text-right" style="color: #fc8019;">₹${order.pricing.grandTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 18px; padding: 12px; background: #f8fafc; border-radius: 6px; font-size: 12px;">
          <strong>Amount in words:</strong> ${words}
        </div>

        <div class="inv-footer">
          <div>
            <strong>Delivery Partner:</strong> ${order.rider.name} (${order.rider.vehicle})<br>
            For any queries or refund requests, visit Swiggy Help or write to ${this.companyDetails.supportEmail}.
          </div>
          <div style="text-align: right;">
            Authorized System Generated Invoice<br>
            <em>No physical signature required</em>
          </div>
        </div>

        <div class="print-actions">
          <button class="primary-btn" onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">
            🖨️ Print / Save as PDF
          </button>
          <button class="secondary-btn" onclick="invoiceEngine.downloadInvoiceJson('${order.id}')" style="padding: 10px 20px;">
            💾 Download JSON Data
          </button>
        </div>
      </div>
    `;
  }

  downloadInvoiceJson(orderId) {
    const order = window.swiggyStore.state.orders.find(o => o.id === orderId);
    if (!order) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(order, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Invoice-${order.invoiceNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

window.invoiceEngine = new SwiggyInvoiceEngine();

