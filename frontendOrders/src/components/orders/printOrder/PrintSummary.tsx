import type { Order } from "@/types/order.types";

export const generateSummaryPrintWindow = (selectedOrders: Order[]) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  // Summarize orders
  const itemMap: Record<
    string,
    { name: string; quantity: number; image?: string }
  > = {};
  let totalOrders = selectedOrders.length;
  let totalItems = 0;
  const orderNumbers = selectedOrders.map((order) => `#${order.id}`).join(", ");

  selectedOrders.forEach((order) => {
    order.line_items.forEach((item) => {
      if (itemMap[item.product_id]) {
        itemMap[item.product_id].quantity += item.quantity;
      } else {
        itemMap[item.product_id] = {
          name: item.name,
          quantity: item.quantity,
          image: item.image?.src,
        };
      }
    });
  });

  totalItems = Object.values(itemMap).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const content = `
  <html dir="rtl">
  <head>
    <title>סיכום הזמנות</title>
    <style>
      body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; background: #f9f9f9; padding: 40px; margin: 0; color: #333; }
      .summary-container { max-width: 800px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #ddd; }
      .header { font-size: 22px; font-weight: bold; text-align: center; color: #222; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
      .details { font-size: 18px; padding: 10px 15px; background: #f5f5f5; border-radius: 6px; margin-bottom: 20px; }
      .details p { margin: 8px 0; font-weight: bold; color: #444; }
      .order-summary { font-size: 18px; font-weight: bold; background: #eef2f7; padding: 10px; border-radius: 6px; margin-top: 10px; text-align: center; }
      .product-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      .product-table th, .product-table td { border: 1px solid #ddd; padding: 10px; text-align: right; }
      .product-table th { background: #f0f0f0; }
      .product-image { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; display: block; margin: auto; }
      .footer { text-align: center; font-size: 14px; color: #777; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="summary-container">
      <div class="header">סיכום הזמנות</div>
      
      <div class="details">
        <p>סה"כ הזמנות: ${totalOrders} | מספרי הזמנות: ${orderNumbers}</p>
        <p>סה"כ מוצרים: ${totalItems}</p>
      </div>

      <table class="product-table">
        <thead>
          <tr>
            <th>תמונה</th>
            <th>שם מוצר</th>
            <th>כמות כוללת</th>
          </tr>
        </thead>
        <tbody>
          ${Object.values(itemMap)
            .map(
              (item) => `
              <tr>
                <td><img src="${item.image || ""}" class="product-image" alt="${
                item.name
              }"></td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="order-summary">
        <p>סה"כ מוצרים בכל ההזמנות: ${totalItems}</p>
      </div>

    </div>

    <script>
      window.onload = () => {
        setTimeout(() => {
          window.print();
        }, 1000);
      };
    </script>
  </body>
  </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
};
