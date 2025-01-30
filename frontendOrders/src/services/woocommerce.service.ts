import { api } from "./api.service";
import { Order } from "../types/order.types";

class WooCommerceAPI {
  async getOrders(
    page: number = 1,
    perPage: number = 20
  ): Promise<{ orders: Order[]; totalOrders: number; totalPages: number }> {
    console.log("Fetching orders with params:", { page, perPage });

    try {
      const response = await api.get("/orders", {
        params: {
          page: page.toString(),
          per_page: perPage.toString(),
          orderby: "date",
          order: "desc",
        },
      });

      if (!response.data || typeof response.data !== "object") {
        console.error("Invalid API response structure:", response.data);
        throw new Error("Unexpected API response from WooCommerce");
      }

      const ordersData = response.data.orders;
      if (!Array.isArray(ordersData)) {
        console.error("Invalid orders format in API response:", ordersData);
        throw new Error("Invalid orders format from WooCommerce API");
      }
      const orders = await Promise.all(
        ordersData.map(async (order: any) => {
          // Проверка meta_data
          const isPrintedMeta = order.meta_data?.some(
            (meta: any) =>
              meta.key === "_created_document" &&
              Array.isArray(meta.value) &&
              meta.value.includes("invoice")
          );

          let isPrintedNote = false;
          try {
            const notes = await this.getOrderNotes(order.id);
            isPrintedNote = notes.some((note: any) =>
              note.note?.includes("Order was printed by PrintSync.")
            );
          } catch (error) {
            console.error(
              `Failed to fetch notes for order ${order.id}:`,
              error
            );
          }
          const isPrinted = isPrintedMeta || isPrintedNote;
          return {
            id: order.id,
            status: order.status,
            currency: order.currency,
            date_created: order.date_created || new Date().toISOString(),
            date_modified: order.date_modified || new Date().toISOString(),
            date_completed: order.date_completed || null,
            date_paid: order.date_paid || null,
            total: order.total,
            payment_method: order.payment_method,
            payment_method_title: order.payment_method_title,
            customer_note: order.customer_note || "",
            billing: {
              first_name: order.billing?.first_name || "Unknown",
              last_name: order.billing?.last_name || "Unknown",
              company: order.billing?.company || "",
              address_1: order.billing?.address_1 || "",
              address_2: order.billing?.address_2 || "",
              city: order.billing?.city || "",
              state: order.billing?.state || "",
              postcode: order.billing?.postcode || "",
              country: order.billing?.country || "",
              email: order.billing?.email || "",
              phone: order.billing?.phone || "",
            },
            shipping: {
              first_name: order.shipping?.first_name || "Unknown",
              last_name: order.shipping?.last_name || "Unknown",
              company: order.shipping?.company || "",
              address_1: order.shipping?.address_1 || "",
              address_2: order.shipping?.address_2 || "",
              city: order.shipping?.city || "",
              state: order.shipping?.state || "",
              postcode: order.shipping?.postcode || "",
              country: order.shipping?.country || "",
              phone: order.shipping?.phone || "",
            },
            line_items: order.line_items.map((item: any) => ({
              id: item.id,
              name: item.name,
              product_id: item.product_id,
              variation_id: item.variation_id,
              quantity: item.quantity,
              tax_class: item.tax_class,
              subtotal: item.subtotal,
              subtotal_tax: item.subtotal_tax,
              total: item.total,
              total_tax: item.total_tax,
              taxes: item.taxes || [],
              meta_data: item.meta_data || [],
              sku: item.sku || "",
              price: item.price,
              image: item.image || { id: "", src: "" },
              parent_name: item.parent_name || null,
            })),
            shipping_lines: order.shipping_lines.map((line: any) => ({
              id: line.id,
              method_title: line.method_title,
              method_id: line.method_id,
              instance_id: line.instance_id,
              total: line.total,
              total_tax: line.total_tax,
              taxes: line.taxes || [],
              meta_data: line.meta_data || [],
            })),
            shipping_total: order.shipping_total || "0.00",
            tax_lines: order.tax_lines || [],
            fee_lines: order.fee_lines || [],
            coupon_lines: order.coupon_lines || [],
            refunds: order.refunds || [],
            meta_data: order.meta_data || [],
            isPrinted,
          };
        })
      );

      const totalOrders = response.data.totalOrders ?? orders.length;
      const totalPages = response.data.totalPages ?? 1;

      return {
        orders,
        totalOrders,
        totalPages,
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderNotes(orderId: number) {
    try {
      const response = await api.get(`/orders/${orderId}/notes`);
      return response.data;
    } catch (error) {
      console.error(
        `PrintSync Error: Failed to get order notes for order ${orderId}`,
        error
      );
      throw new Error("Failed to retrieve order notes from PrintSync.");
    }
  }

  async markOrderAsPrinted(orderId: number) {
    try {
      console.log(`PrintSync: Marking order ${orderId} as printed.`);

      const response = await api.post(`/orders/${orderId}/notes`, {
        note: "Order was printed by PrintSync. ההזמנה הודפסה על ידי מערכת PrintSync",
      });

      return response.data;
    } catch (error) {
      console.error(
        `PrintSync Error: Failed to mark order ${orderId} as printed`,
        error
      );
      throw new Error("Failed to add print note in PrintSync.");
    }
  }
}

export const wooCommerceAPI = new WooCommerceAPI();
