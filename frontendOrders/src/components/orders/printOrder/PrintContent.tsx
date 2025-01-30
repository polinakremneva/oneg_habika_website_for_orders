import type { Order } from "@/types/order.types";
import { formatValue, formatPrice } from "./OrderUtils";
import { renderProductsTable } from "@/components/orders/printOrder/OrdersTable"; // Import the correct function

export const generatePrintWindow = (orders: Order[]) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const content = `
  <html dir="rtl">
  <head>
    <title>חשבוניות הזמנות</title>
    <style>
      body { font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #f9f9f9; padding: 20px; }
      .invoice-container { max-width: 800px; margin: auto; }
      .invoice { border: 1px solid #ddd; background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); page-break-after: always; } /* Add page-break-after */
      .header { font-weight: bold; font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
      .details { margin-top: 10px; font-size: 16px; }
      .details p { margin: 5px 0; }
      .highlight { font-weight: bold; color: #333; }
      .products-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      .products-table th, .products-table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
      .products-table th { background: #f5f5f5; }
      .section-title { font-size: 18px; font-weight: bold; margin: 15px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #eee; }
      .product-image { width: 50px; height: 50px; object-fit: cover; }
      .totals { margin-top: 15px; border-top: 2px solid #ddd; padding-top: 10px; }
      .shipping-method { margin-top: 10px; padding: 10px; background: #f8f8f8; border-radius: 4px; }
      .no-products { color: #666; font-style: italic; text-align: center; padding: 20px; }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      ${orders
        .map(
          (order) => `
        <div class="invoice">
          <div class="header">הזמנה #${order.id}</div>
          <div class="details">
            <p><span class="highlight">תאריך יצירה:</span> ${new Date(
              order.date_created
            ).toLocaleDateString("he-IL")}</p>
            <p><span class="highlight">תאריך תשלום:</span> ${
              order.date_paid
                ? new Date(order.date_paid).toLocaleDateString("he-IL")
                : "לא שולם"
            }</p>

            <div class="section-title">פרטי לקוח</div>
            <p><span class="highlight">שם לקוח:</span> ${formatValue(
              order.billing.first_name
            )} ${formatValue(order.billing.last_name)}</p>
            <p><span class="highlight">חברה:</span> ${formatValue(
              order.billing.company
            )}</p>
            <p><span class="highlight">כתובת:</span> ${formatValue(
              order.billing.address_1
            )}${
            order.billing.address_2 ? `, ${order.billing.address_2}` : ""
          }</p>
            <p><span class="highlight">עיר:</span> ${formatValue(
              order.billing.city
            )}</p>
            <p><span class="highlight">טלפון:</span> ${formatValue(
              order.billing.phone
            )}</p>
            <p><span class="highlight">אימייל:</span> ${formatValue(
              order.billing.email
            )}</p>

            <div class="section-title">פרטי הזמנה</div>
            ${renderProductsTable(order)}

            <div class="totals">
              <p><span class="highlight">סה״כ פריטים:</span> ${
                order.line_items?.reduce(
                  (sum, item) => sum + (item.quantity || 0),
                  0
                ) || 0
              }</p>
              <p><span class="highlight">עלות משלוח:</span> ${formatPrice(
                order.shipping_total
              )}</p>
              <p><span class="highlight">סה״כ לתשלום:</span> ${formatPrice(
                order.total
              )}</p>
              <p><span class="highlight">אמצעי תשלום:</span> ${formatValue(
                order.payment_method_title
              )}</p>
              ${
                order.customer_note
                  ? `<p><span class="highlight">הערת לקוח:</span> ${formatValue(
                      order.customer_note
                    )}</p>`
                  : ""
              }
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    <script> window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 1000);
    };</script>
  </body>
  </html>
`;

  printWindow.document.write(content);
  printWindow.document.close();
};
