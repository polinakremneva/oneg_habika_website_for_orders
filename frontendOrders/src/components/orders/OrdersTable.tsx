import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { Order } from "../../types/order.types";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { generatePrintWindow } from "./printOrder/PrintContent";
import { wooCommerceAPI } from "@/services/woocommerce.service";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GoDotFill } from "react-icons/go";
import { FaRegSnowflake } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
// import { useProductData } from "@/hooks/useProductData";

interface OrdersTableProps {
  orders: Order[];
  onOrderUpdate?: (orderId: number) => void;
  onPrintStatusUpdate: (orderId: number) => void;
  onOrderSelection: (selected: Order[]) => void;
}

export const OrdersTable = ({
  orders,
  onOrderUpdate,
  onPrintStatusUpdate,
  onOrderSelection,
}: OrdersTableProps) => {
  const filteredOrders = useMemo(() => orders, [orders]);
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const [printDialogOrder, setPrintDialogOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  // const { checkSpecialDelivery } = useProductData(orders);

  const toggleOrderSelection = (order: Order) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.some((o) => o.id === order.id)
        ? prevSelected.filter((o) => o.id !== order.id)
        : [...prevSelected, order]
    );
  };

  useEffect(() => {
    if (onOrderSelection) {
      onOrderSelection(selectedOrders);
    }
  }, [selectedOrders, onOrderSelection]);

  const handleCompleteOrder = async (orderId: number) => {
    try {
      setLoadingOrderId(orderId);
      await wooCommerceAPI.completeOrder(orderId);

      onOrderUpdate?.(orderId);
      toast({
        variant: "success",
        title: `ההזמנה ${orderId} הושלמה בהצלחה`,
        description: "ההזמנה נסגרה בהצלחה",
      });
    } catch (error) {
      console.error("שגיאה בעדכון הסטטוס:", error);
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handlePrintOrder = async (order: Order) => {
    try {
      setLoadingOrderId(order.id);
      generatePrintWindow([order]);
      await wooCommerceAPI.markOrderAsPrinted(order.id);
      onPrintStatusUpdate(order.id);

      toast({
        variant: "success",
        title: `הזמנה ${order.id} הודפסה בהצלחה`,
        description: "החשבונית נשלחה להדפסה",
      });
    } catch (error) {
      console.error("שגיאה בהדפסת ההזמנה:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהדפסה",
        description: "אירעה שגיאה בעת הדפסת החשבונית",
      });
    }
  };

  return (
    <Card className="p-6 shadow-md rounded-lg">
      <Table>
        <TableCaption className="text-gray-700">
          רשימת ההזמנות בטיפול
        </TableCaption>
        <TableHeader className="bg-gray-200">
          <TableRow>
            <TableHead className="text-right px-6 py-3 text-gray-900 rounded-r-lg">
              מספר הזמנה
            </TableHead>
            <TableHead className="text-right px-6 py-3 text-gray-900">
              פרטי לקוח
            </TableHead>
            <TableHead className="text-right px-6 py-3 text-gray-900">
              מצב
            </TableHead>
            <TableHead className="text-right px-6 py-3 text-gray-900">
              סכום
            </TableHead>
            <TableHead className="text-right px-6 py-3 text-gray-900">
              תאריך
            </TableHead>
            <TableHead className="text-right px-6 py-3 text-gray-900">
              סטטוס חשבונית
            </TableHead>
            <TableHead className="text-right px-6 py-3 text-gray-900 rounded-l-lg">
              פעולות
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                לא נמצאו הזמנות
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => {
              const isSpecial = order.line_items.some((line) =>
                line.name.includes("תמר בונבון")
              );

              return (
                <TableRow
                  key={order.id}
                  className="border-b-2 border-b-gray-300"
                >
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        checked={selectedOrders.some((o) => o.id === order.id)}
                        onCheckedChange={() => toggleOrderSelection(order)}
                      />{" "}
                      <span className="font-medium">#{order.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        <GoDotFill
                          className={`text-xs ${
                            order.isPrinted ? "text-green-400" : "text-red-400"
                          }`}
                        />{" "}
                        {order.billing.first_name
                          ?.replace("Unknown", "")
                          .trim()}{" "}
                        {order.billing.last_name?.replace("Unknown", "").trim()}
                      </span>
                      <span className="flex items-center gap-1">
                        {" "}
                        <GoDotFill className="text-xs text-yellow-400" />
                        {order.billing.phone?.replace("Unknown", "").trim()}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <GoDotFill className="text-xs text-indigo-400" />
                        {order.billing.city?.replace("Unknown", "").trim() ||
                          "עיר לא צוינה"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full w-fit 
                      ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-gray-800"
                      }`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full w-fit ${
                          isSpecial
                            ? "bg-yellow-300 text-yellow-800"
                            : "bg-green-200 text-green-800"
                        }`}
                      >
                        {isSpecial ? (
                          <div className="flex items-center gap-1">
                            <FaRegSnowflake className="text-blue-600" />
                            <span>משלוח מיוחד</span>
                          </div>
                        ) : (
                          "משלוח רגיל"
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3">₪{order.total}</TableCell>
                  <TableCell className="px-6 py-3">
                    {new Date(order.date_created).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    {order.isPrinted ? (
                      <span className="text-green-600 font-semibold">
                        חשבונית הודפסה
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        חשבונית לא הודפסה
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <Dialog
                        open={selectedOrder?.id === order.id}
                        onOpenChange={(isOpen) => {
                          if (!isOpen) {
                            setSelectedOrder(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="px-4 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-md  hover:bg-green-700 hover:shadow-lg transition-all duration-300 ease-in-out active:scale-95 focus:ring-4 focus:ring-green-300 "
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedOrder(order);
                            }}
                            type="button"
                          >
                            השלם הזמנה
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>האם אתה בטוח?</DialogTitle>
                          </DialogHeader>
                          <p>
                            האם אתה בטוח שברצונך להשלים את ההזמנה{" "}
                            <span className="text-blue-700 font-semibold">
                              #{selectedOrder?.id}{" "}
                              {order.billing.first_name
                                ?.replace("Unknown", "")
                                .trim()}
                              {order.billing.last_name &&
                                ` ${order.billing.last_name
                                  .replace("Unknown", "")
                                  .trim()}`}
                            </span>
                            ?
                          </p>

                          <DialogFooter className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => setSelectedOrder(null)}
                            >
                              ביטול
                            </Button>
                            <Button
                              onClick={() =>
                                selectedOrder &&
                                handleCompleteOrder(selectedOrder.id)
                              }
                              disabled={loadingOrderId === selectedOrder?.id}
                              className="px-4 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-300 ease-in-out active:scale-95 focus:ring-4 focus:ring-green-300"
                            >
                              {loadingOrderId === selectedOrder?.id
                                ? "משלים הזמנה..."
                                : "כן, השלם הזמנה"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Dialog for print */}
                      <Dialog
                        open={printDialogOrder?.id === order.id}
                        onOpenChange={(isOpen) => {
                          if (!isOpen) {
                            setPrintDialogOrder(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 ease-in-out active:scale-95 focus:ring-4 focus:ring-blue-300 "
                            onClick={(e) => {
                              e.preventDefault();
                              setPrintDialogOrder(order);
                            }}
                            type="button"
                          >
                            הדפס חשבונית
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {order.isPrinted
                                ? "האם להדפיס שוב?"
                                : "האם להדפיס חשבונית?"}
                            </DialogTitle>
                          </DialogHeader>
                          <p>
                            {order.isPrinted
                              ? "החשבונית כבר הודפסה. האם ברצונך להדפיס אותה שוב?"
                              : `האם ברצונך להדפיס חשבונית עבור הזמנה `}
                            <span className="text-blue-700 font-semibold">
                              #{order.id}{" "}
                              {order.billing.first_name
                                ?.replace("Unknown", "")
                                .trim()}
                              {order.billing.last_name &&
                                ` ${order.billing.last_name
                                  .replace("Unknown", "")
                                  .trim()}`}
                            </span>
                            ?
                          </p>

                          <DialogFooter className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => setPrintDialogOrder(null)}
                            >
                              ביטול
                            </Button>
                            <Button
                              onClick={() => {
                                if (printDialogOrder) {
                                  handlePrintOrder(printDialogOrder);
                                  setPrintDialogOrder(null);
                                }
                              }}
                              className="px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 ease-in-out active:scale-95 focus:ring-4 focus:ring-blue-300"
                            >
                              {order.isPrinted ? "כן, הדפס שוב" : "כן, הדפס"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
