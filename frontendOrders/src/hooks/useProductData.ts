// import { useState, useCallback, useEffect, useMemo } from "react";
// import { wooCommerceAPI } from "@/services/woocommerce.service";
// import type { Order } from "@/types/order.types";

// interface SpecialDeliveryCheckResult {
//   isSpecial: boolean;
//   isLoading: boolean;
// }

// export const useProductData = (orders: Order[]) => {
//   const [productsData, setProductsData] = useState<Map<number, string>>(
//     new Map()
//   );
//   const [productsSpecialCheck, setProductsSpecialCheck] = useState<
//     Map<number, boolean>
//   >(new Map());
//   const [loadingProductIds, setLoadingProductIds] = useState<Set<number>>(
//     new Set()
//   );

//   const allProductIds = useMemo(() => {
//     const ids = new Set<number>();
//     orders.forEach((order) => {
//       order.line_items.forEach((item) => {
//         if (item.product_id) {
//           ids.add(item.product_id);
//         }
//       });
//     });
//     return ids;
//   }, [orders]);

//   const deliveryResults = useMemo(() => {
//     const results = new Map<number, SpecialDeliveryCheckResult>();

//     orders.forEach((order) => {
//       const hasSpecialByName = order.line_items.some((item) =>
//         item.name.includes("תמר בונבון")
//       );

//       if (hasSpecialByName) {
//         results.set(order.id, { isSpecial: true, isLoading: false });
//         return;
//       }

//       const hasSpecialByDescription = order.line_items.some(
//         (item) => productsSpecialCheck.get(item.product_id) === true
//       );

//       if (hasSpecialByDescription) {
//         results.set(order.id, { isSpecial: true, isLoading: false });
//         return;
//       }

//       const needsLoading = order.line_items.some(
//         (item) =>
//           !productsData.has(item.product_id) &&
//           !loadingProductIds.has(item.product_id)
//       );

//       results.set(order.id, { isSpecial: false, isLoading: needsLoading });
//     });

//     return results;
//   }, [orders, productsData, productsSpecialCheck, loadingProductIds]);

//   const checkSpecialDelivery = useCallback(
//     (lineItems: any[], orderId?: number): SpecialDeliveryCheckResult => {
//       if (orderId && deliveryResults.has(orderId)) {
//         return deliveryResults.get(orderId)!;
//       }

//       const hasSpecialByName = lineItems.some((item) =>
//         item.name.includes("תמר בונבון")
//       );

//       if (hasSpecialByName) {
//         return { isSpecial: true, isLoading: false };
//       }

//       const hasSpecialByDescription = lineItems.some(
//         (item) => productsSpecialCheck.get(item.product_id) === true
//       );

//       if (hasSpecialByDescription) {
//         return { isSpecial: true, isLoading: false };
//       }

//       const needsLoading = lineItems.some(
//         (item) =>
//           !productsData.has(item.product_id) &&
//           !loadingProductIds.has(item.product_id)
//       );

//       return { isSpecial: false, isLoading: needsLoading };
//     },
//     [productsData, productsSpecialCheck, loadingProductIds, deliveryResults]
//   );

//   const fetchProductDescriptions = useCallback(async () => {
//     const productsToLoad = new Set<number>();

//     allProductIds.forEach((productId) => {
//       if (!productsData.has(productId) && !loadingProductIds.has(productId)) {
//         productsToLoad.add(productId);
//       }
//     });

//     if (productsToLoad.size === 0) return;

//     setLoadingProductIds((prev) => new Set([...prev, ...productsToLoad]));

//     const batchDescriptions = new Map<number, string>();
//     const batchSpecialChecks = new Map<number, boolean>();

//     const productPromises = Array.from(productsToLoad).map(
//       async (productId) => {
//         try {
//           const product = await wooCommerceAPI.getProduct(productId, true);
//           if (product?.description) {
//             batchDescriptions.set(productId, product.description);
//             batchSpecialChecks.set(
//               productId,
//               product.description.includes("גבינה")
//             );
//           }
//         } catch (error) {
//           console.error(`Error while downloading ${productId}:`, error);
//         }
//       }
//     );

//     await Promise.all(productPromises);

//     setProductsData((prev) => new Map([...prev, ...batchDescriptions]));
//     setProductsSpecialCheck(
//       (prev) => new Map([...prev, ...batchSpecialChecks])
//     );

//     setLoadingProductIds((prev) => {
//       const newSet = new Set(prev);
//       productsToLoad.forEach((id) => newSet.delete(id));
//       return newSet;
//     });
//   }, [allProductIds, productsData, loadingProductIds]);

//   useEffect(() => {
//     fetchProductDescriptions();
//   }, [fetchProductDescriptions]);

//   return {
//     productsData,
//     checkSpecialDelivery,
//     deliveryResults,
//   };
// };
