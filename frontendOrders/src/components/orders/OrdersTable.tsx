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
import { useMemo } from "react";

interface OrdersTableProps {
  orders: Order[];
}

export const OrdersTable = ({ orders }: OrdersTableProps) => {
  const filteredOrders = useMemo(() => orders, [orders]);

  return (
    <Card className="p-6 shadow-md rounded-lg">
      <Table>
        <TableCaption className="text-gray-700">
          רשימת ההזמנות בטיפול
        </TableCaption>
        <TableHeader className="bg-gray-200">
          <TableHead className="text-right px-6 py-3 text-gray-900 rounded-r-lg">
            מספר הזמנה
          </TableHead>
          <TableHead className="text-right px-6 py-3 text-gray-900">
            לקוח
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
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                לא נמצאו הזמנות
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order.id} className="border-b">
                <TableCell className="px-6 py-3">#{order.id}</TableCell>
                <TableCell className="px-6 py-3">
                  {order.billing.first_name} {order.billing.last_name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  <span
                    className={`px-4 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
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
                  <Button
                    variant="outline"
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    פעולה
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
