import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/order.types";
import { generatePrintWindow } from "@/components/orders/printOrder/PrintContent";
import { generateSummaryPrintWindow } from "@/components/orders/printOrder/PrintSummary";
import { useToast } from "@/hooks/use-toast";
import { wooCommerceAPI } from "@/services/woocommerce.service";
import { Separator } from "../ui/separator";

interface OrderSummaryProps {
  selectedOrders: Order[];
  onClose: () => void;
  isOpen: boolean;
  onOrdersPrinted: (updatedOrders: Order[]) => void;
}

const OrderSummary = ({
  selectedOrders,
  onClose,
  isOpen,
  onOrdersPrinted,
}: OrderSummaryProps) => {
  const [printing, setPrinting] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();
  const [internalSelectedOrders, setInternalSelectedOrders] =
    useState<Order[]>(selectedOrders);

  useEffect(() => {
    fetchOrders();
    setInternalSelectedOrders(selectedOrders);
  }, [selectedOrders]);

  const fetchOrders = async () => {
    try {
      const { orders: allOrders } = await wooCommerceAPI.getOrders(1);
      setOrders(allOrders);
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
      toast({
        title: "שגיאה בטעינת ההזמנות",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  const itemSummary = useMemo(() => {
    const itemMap: Record<
      string,
      { name: string; quantity: number; image?: string }
    > = {};

    internalSelectedOrders.forEach((order) => {
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

    return Object.values(itemMap);
  }, [internalSelectedOrders]);

  const updateOrdersAfterPrint = async (ordersToProcess: Order[]) => {
    try {
      generatePrintWindow(ordersToProcess);

      const updatedOrders = orders.map((order) =>
        ordersToProcess.some((printOrder) => printOrder.id === order.id)
          ? { ...order, isPrinted: true }
          : order
      );

      setOrders(updatedOrders);

      if (onOrdersPrinted) {
        onOrdersPrinted(updatedOrders);
      }

      await Promise.all(
        ordersToProcess.map((order) =>
          wooCommerceAPI.markOrderAsPrinted(order.id)
        )
      );

      await fetchOrders();

      toast({
        title: "ההדפסה הושלמה בהצלחה",
        description: `הודפסו ${ordersToProcess.length} הזמנות`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error printing:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהדפסת ההזמנות",
        description: "אנא נסה שוב מאוחר יותר",
      });
    }
  };

  const handlePrintOrders = async () => {
    if (internalSelectedOrders.length === 0) return;
    setPrinting(true);

    await updateOrdersAfterPrint(internalSelectedOrders);

    setPrinting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto flex flex-col scrollbar">
        <DialogHeader className="mb-4">
          <DialogTitle>סיכום הזמנות</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h3 className="font-medium mb-2">סיכום מוצרים</h3>
            <Table className=" rounded-md">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">תמונה</TableHead>
                  <TableHead>שם מוצר</TableHead>
                  <TableHead className="w-24 text-center">כמות כוללת</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemSummary.length > 0 ? (
                  itemSummary.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      לא נמצאו מוצרים
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Orders Section */}
          <div className="flex flex-col">
            <h3 className="font-medium mb-2">הזמנות שנבחרו</h3>
            <Table className=" rounded-md">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">מספר הזמנה</TableHead>
                  <TableHead>שם לקוח</TableHead>
                  <TableHead className="w-32">סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internalSelectedOrders.length > 0 ? (
                  internalSelectedOrders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
                        {order.billing.first_name} {order.billing.last_name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            order.isPrinted
                              ? "text-green-600"
                              : "text-amber-500"
                          }
                        >
                          {order.isPrinted
                            ? "✅ הודפס בעבר"
                            : "🕒 ממתין להדפסה"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      לא נבחרו הזמנות
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-2  ">
          <Button variant="outline" onClick={onClose}>
            סגור
          </Button>
          <Button
            onClick={handlePrintOrders}
            disabled={printing || internalSelectedOrders.length === 0}
            className="bg-blue-600 text-white hover:bg-blue-800"
          >
            {printing ? "מדפיס..." : "הדפס הזמנות"}
          </Button>
          <Button
            onClick={() => generateSummaryPrintWindow(internalSelectedOrders)}
            disabled={selectedOrders.length === 0}
            className="bg-green-600 text-white hover:bg-green-800"
          >
            הדפס סיכום
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSummary;
