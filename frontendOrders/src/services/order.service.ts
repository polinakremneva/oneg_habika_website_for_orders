import type { Order } from "@/types/order.types";
import { wooCommerceAPI } from "./woocommerce.service";

interface OrdersCounts {
  printed: number;
  unprinted: number;
}

export const ordersService = {
  async fetchAllOrders(): Promise<{ orders: Order[]; counts: OrdersCounts }> {
    try {
      const firstPageResponse = await wooCommerceAPI.getOrders(1);
      let allOrders = [...firstPageResponse.orders];
      const totalPages = firstPageResponse.totalPages;

      if (totalPages > 1) {
        const remainingPages = [];
        for (let page = 2; page <= totalPages; page++) {
          remainingPages.push(wooCommerceAPI.getOrders(page));
        }

        const responses = await Promise.all(remainingPages);
        responses.forEach((response) => {
          allOrders = [...allOrders, ...response.orders];
        });
      }

      const counts = {
        printed: allOrders.filter((order) => order.isPrinted).length,
        unprinted: allOrders.filter((order) => !order.isPrinted).length,
      };

      return { orders: allOrders, counts };
    } catch (error) {
      console.error("Error fetching all orders:", error);
      throw error;
    }
  },
};
