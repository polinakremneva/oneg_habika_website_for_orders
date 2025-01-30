import { Button } from "../ui/button";
import PrintOrder from "./printOrder/PrintOrder";
import { LogOut, Package } from "lucide-react";
import type { Order } from "@/types/order.types";

interface PageHeaderProps {
  onLogout: () => void;
  onOrdersUpdate: (updatedOrders: Order[]) => void;
}

export const OrdersHeader = ({ onLogout, onOrdersUpdate }: PageHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center mb-2 px-6 py-4">
      <div className="flex items-center gap-2">
        <h1 className="text-4xl font-semibold text-gray-700 tracking-wide">
          הזמנות
        </h1>
        <Package className="w-16 h-16 p-3 bg-violet-100 rounded-full text-blue-400" />
      </div>

      <div className="flex gap-6 mt-4 lg:mt-0">
        <div>
          <PrintOrder onOrdersPrinted={onOrdersUpdate} />
        </div>
        <Button
          onClick={onLogout}
          className="flex items-center gap-3 px-6 py-3 text-white bg-red-500 hover:bg-red-600 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          <LogOut className="w-6 h-6" /> התנתק
        </Button>
      </div>
    </div>
  );
};
