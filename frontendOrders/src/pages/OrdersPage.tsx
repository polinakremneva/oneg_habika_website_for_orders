import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { wooCommerceAPI } from "../services/woocommerce.service";
import { authService } from "../services/auth.service";
import type { Order } from "../types/order.types";
import { OrdersTable } from "../components/orders/OrdersTable";
import { Pagination } from "../components/orders/Pagination";
import { OrdersHeader } from "../components/orders/OrdersHeader";
import { LoadingSpinner } from "../components/orders/LoadingSpinner";
import { Alert } from "@/components/ui/alert";

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProcessingOrders, setTotalProcessingOrders] = useState<number>(0);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPageValid, setIsPageValid] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("per_page") || "20", 10);

  const handlePagination = (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    op: "next" | "prev"
  ) => {
    ev.preventDefault();
    let newPage = currentPage;

    if (op === "next" && newPage < maxPages) {
      newPage += 1;
    } else if (op === "prev" && newPage > 1) {
      newPage -= 1;
    } else {
      return;
    }

    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      newParams.set("page", `${newPage}`);
      return newParams;
    });

    navigate(`?page=${newPage}&per_page=${perPage}`, { replace: true });
  };

  const handleOrdersUpdate = () => {
    loadOrders();
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await wooCommerceAPI.getOrders(currentPage, perPage);

      console.log("Loading orders:", {
        currentPage,
        totalOrders: result.totalOrders,
        totalPages: result.totalPages,
        receivedOrders: result.orders.length,
      });

      if (currentPage > result.totalPages || currentPage < 1) {
        setSearchParams(
          (prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("page", "1");
            return newParams;
          },
          { replace: true }
        );
        setIsPageValid(false);

        return;
      }

      if (result.totalOrders === 0) {
        setSearchParams(
          (prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("page", "1");
            return newParams;
          },
          { replace: true }
        );
      }
      setOrders(result.orders);
      setTotalProcessingOrders(result.totalOrders);
      setMaxPages(result.totalPages);
      setIsPageValid(true);
    } catch (err) {
      console.error("Error loading orders:", err);
      setError("Failed to load orders. Please try again.");
      setIsPageValid(false); // Страница некорректна из-за ошибки
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, setSearchParams]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/auth/login");
      return;
    }

    if (currentPage < 1) {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("page", "1");
          return newParams;
        },
        { replace: true }
      );
      return;
    }

    loadOrders();
  }, [currentPage, perPage, navigate, loadOrders, setSearchParams]);

  if (!isPageValid || loading) {
    return <LoadingSpinner />;
  }
  return (
    <div
      className="p-6 min-h-screen bg-gradient-to-r from-blue-50 to-purple-50"
      dir="rtl"
    >
      <OrdersHeader
        onLogout={async () => {
          await authService.logout();
          navigate("/auth/login");
        }}
        onOrdersUpdate={(updatedOrders) => setOrders(updatedOrders)} // Передаем обновление
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      <OrdersTable orders={orders} />

      {maxPages > 1 && (
        <Pagination
          currentPage={currentPage}
          maxPages={maxPages}
          totalProcessingOrders={totalProcessingOrders}
          handlePagination={handlePagination}
          setSearchParams={setSearchParams}
        />
      )}
    </div>
  );
};
