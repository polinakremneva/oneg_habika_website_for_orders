import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { wooCommerceAPI } from "@/services/woocommerce.service";
import type { Order } from "@/types/order.types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Printer, Loader2 } from "lucide-react";
import { generatePrintWindow } from "./PrintContent";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PrinterCheck } from "lucide-react";
import { ordersService } from "@/services/order.service";

interface PrintOrderProps {
  onOrdersPrinted?: (updatedOrders: Order[]) => void;
  onTotalOrdersUpdate?: (printed: number, unprinted: number) => void;
}

const PrintOrder = ({ onOrdersPrinted }: PrintOrderProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [ordersToPrint, setOrdersToPrint] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await wooCommerceAPI.getOrders(1);
      setOrders(allOrders.orders);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת ההזמנות",
        description: "אנא נסה שוב מאוחר יותר",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handlePrint = async (filterType: "all" | "unprinted") => {
    setProcessing(true);
    try {
      let ordersToProcess: Order[];

      if (filterType === "all") {
        const { orders: allOrders } = await ordersService.fetchAllOrders();
        ordersToProcess = allOrders;
      } else {
        ordersToProcess = orders.filter((order) => !order.isPrinted);
      }

      if (ordersToProcess.length === 0) {
        toast({
          title: "אין הזמנות להדפסה",
          description: "לא נמצאו הזמנות מתאימות להדפסה",
        });
        return;
      }

      const hasPrintedOrders = ordersToProcess.some((order) => order.isPrinted);

      if (hasPrintedOrders) {
        setOrdersToPrint(ordersToProcess);
        setDialogOpen(true);
      } else {
        await updateOrdersAfterPrint(ordersToProcess);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={loading || processing}
            className="flex items-center gap-2 px-4 py-2 text-white transition duration-300 ease-in-out transform hover:scale-105 bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-md"
          >
            {loading || processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> טוען הזמנות...
              </>
            ) : (
              <>
                <Printer className="w-5 h-5" /> הדפסה
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-white shadow-lg rounded-xl p-1 w-fit"
        >
          <DropdownMenuItem
            onClick={() => handlePrint("all")}
            disabled={processing}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <Printer className="w-5 h-5 text-blue-500" /> הדפס את כל ההזמנות
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            onClick={() => handlePrint("unprinted")}
            disabled={processing}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <Printer className="w-5 h-5 text-red-500" /> הדפס רק הזמנות שלא
            הודפסו
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="p-6 rounded-lg shadow-lg">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl flex items-center gap-2 font-semibold text-gray-900">
              <PrinterCheck className="text-blue-700" /> הזמנה כבר הודפסה
            </DialogTitle>
            <DialogDescription className="text-gray-700 text-base">
              חלק מההזמנות כבר הודפסו. האם אתה בטוח שברצונך להדפיס אותן שוב?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2  text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              ביטול
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                updateOrdersAfterPrint(ordersToPrint);
              }}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition duration-300 ease-in-out transform hover:scale-105"
            >
              הדפס שוב
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrintOrder;
