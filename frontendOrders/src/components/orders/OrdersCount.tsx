interface OrdersCountProps {
  printedCount: number;
  unprintedCount: number;
}

export const OrdersCount = ({
  printedCount,
  unprintedCount,
}: OrdersCountProps) => {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex items-center">
        <span className="text-green-600 font-semibold">
          הודפסו: {printedCount}
        </span>
      </div>
      <div>
        <p className="text-emerald-700 font-bold">|</p>
      </div>
      <div className="flex items-center">
        <span className="text-red-600 font-semibold">
          לא הודפסו: {unprintedCount}
        </span>
      </div>
    </div>
  );
};
