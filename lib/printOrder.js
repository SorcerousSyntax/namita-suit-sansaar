export function openOrderPrintWindow(order, options = {}) {
    if (typeof window === 'undefined' || !order) return;

    const {
        title = 'Order Receipt',
        brand = 'Namita Suit Sansaar',
        showPayment = true,
    } = options;

    const items = order.products || [];
    const subtotal = items.reduce((sum, item) => {
        return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0);
    }, 0);
    const total = Number(order.totalAmount) || subtotal;
    const shipping = Math.max(total - subtotal, 0);
    const orderId = order._id ? order._id.slice(-8).toUpperCase() : 'N/A';
    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
    const paymentId = order.razorpayPaymentId || order.paymentId || '';

    const rows = items.map((item) => {
        const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
        return `
            <tr>
                <td>${item.title || 'Item'}${item.color ? ` (${item.color})` : ''}</td>
                <td>${item.quantity || 0}</td>
                <td>₹${(Number(item.price) || 0).toLocaleString('en-IN')}</td>
                <td>₹${lineTotal.toLocaleString('en-IN')}</td>
            </tr>
        `;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #111; padding: 32px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .brand { font-size: 20px; font-weight: 700; }
        .meta { text-align: right; font-size: 12px; color: #444; }
        .section { margin: 20px 0; }
        .section h3 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; }
        .info { font-size: 14px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { padding: 10px 8px; border-bottom: 1px solid #ddd; font-size: 13px; text-align: left; }
        th { background: #f6f6f6; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; }
        .totals { margin-top: 16px; width: 100%; max-width: 320px; margin-left: auto; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .totals-row.total { font-weight: 700; font-size: 15px; border-top: 2px solid #111; padding-top: 10px; }
        .footer { margin-top: 32px; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">${brand}</div>
        <div class="meta">
            <div>${title}</div>
            <div>Order #${orderId}</div>
            <div>${createdAt.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    </div>

    <div class="section">
        <h3>Customer Details</h3>
        <div class="info">
            <div><strong>${order.fullName || 'Customer'}</strong></div>
            <div>Phone: ${order.phone || 'N/A'}</div>
            <div>Address: ${order.address || 'N/A'}, ${order.pincode || ''}</div>
        </div>
    </div>

    ${showPayment && paymentId ? `
    <div class="section">
        <h3>Payment</h3>
        <div class="info">Payment ID: ${paymentId}</div>
        <div class="info">Status: ${(order.paymentStatus || 'paid').toUpperCase()}</div>
    </div>
    ` : ''}

    <div class="section">
        <h3>Order Items</h3>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${rows || '<tr><td colspan="4">No items</td></tr>'}
            </tbody>
        </table>
    </div>

    <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
        <div class="totals-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span></div>
        <div class="totals-row total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
    </div>

    <div class="footer">Thank you for shopping with us.</div>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    const triggerPrint = () => {
        try {
            printWindow.print();
            printWindow.close();
        } catch {
            // ignore print failures
        }
    };

    printWindow.onload = triggerPrint;
    setTimeout(triggerPrint, 500);
}
