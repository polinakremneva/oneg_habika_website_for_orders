import type { Order } from "@/types/order.types";
import { formatValue, formatPrice } from "./OrderUtils";

// Function that returns HTML string instead of JSX
export const renderProductsTable = (order: Order): string => {
  if (!order.line_items || order.line_items.length === 0) {
    return `<p class="no-products">לא נמצאו מוצרים בהזמנה זו</p>`;
  }

  return `
    <table class="products-table">
      <thead>
        <tr>
          <th>תמונה</th>
          <th>מוצר</th>
          <th>כמות</th>
          <th>מחיר ליחידה</th>
          <th>סה״כ</th>
        </tr>
      </thead>
      <tbody>
        ${order.line_items
          .map(
            (item) => `
            <tr>
              <td><img src="${item.image?.src || "/placeholder-image.jpg"}" 
                  alt="${formatValue(item.name)}" class="product-image"
                  onerror="this.src='/placeholder-image.jpg'"/></td>
              <td>${formatValue(item.name)}</td>
              <td>${item.quantity || 0}</td>
              <td>${formatPrice(item.price?.toString())}</td>
              <td>${formatPrice(item.total)}</td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
  `;
};
