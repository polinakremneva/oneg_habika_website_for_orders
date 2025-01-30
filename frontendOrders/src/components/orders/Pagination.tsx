import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SetURLSearchParams } from "react-router-dom";

interface PaginationProps {
  currentPage: number;
  maxPages: number;
  totalProcessingOrders: number;
  handlePagination: (
    event: React.MouseEvent<HTMLButtonElement>,
    op: "next" | "prev"
  ) => void;
  setSearchParams: SetURLSearchParams;
  itemsPerPage?: number; // Added to help with calculations
}

export const Pagination = ({
  currentPage,
  maxPages,
  totalProcessingOrders,
  handlePagination,
  setSearchParams,
  itemsPerPage = 20, // Default to 20 items per page
}: PaginationProps) => {
  // Don't render if no orders
  if (totalProcessingOrders === 0) return null;

  // Calculate actual maxPages based on total orders
  const calculatedMaxPages = Math.ceil(totalProcessingOrders / itemsPerPage);

  // Use calculated maxPages instead of passed maxPages if they differ
  const actualMaxPages = Math.max(calculatedMaxPages, maxPages);

  // Ensure current page is within valid range
  const safePage = Math.min(Math.max(1, currentPage), actualMaxPages);

  // Calculate pagination group
  const groupSize = 5;
  const currentGroup = Math.ceil(safePage / groupSize);
  const startPage = (currentGroup - 1) * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, actualMaxPages);

  const isPrevDisabled = safePage === 1;
  const isNextDisabled = safePage === actualMaxPages;

  // Debug logging
  console.log(
    JSON.stringify(
      {
        totalProcessingOrders,
        itemsPerPage,
        calculatedMaxPages,
        actualMaxPages,
        currentPage,
        safePage,
      },
      null,
      2
    )
  );

  const handlePageClick = (page: number) => {
    console.log("Changing to page:", page); // Debug log
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", `${page}`);
      return newParams;
    });
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 mt-6 w-full"
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={isPrevDisabled}
          className="transition-opacity duration-200 rounded-full ease-in-out bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          onClick={(ev) => handlePagination(ev, "prev")}
          aria-label="Previous page"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        ).map((page) => (
          <Button
            key={page}
            variant={page === safePage ? "default" : "outline"}
            size="icon"
            className={`rounded-xl px-4 py-2 transition-all duration-200 ${
              page === safePage
                ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                : "hover:bg-gray-200"
            }`}
            onClick={() => handlePageClick(page)}
            aria-label={`Page ${page}`}
            aria-current={page === safePage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}

        <Button
          size="icon"
          variant="outline"
          disabled={isNextDisabled}
          className="transition-opacity bg-slate-200 rounded-full duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          onClick={(ev) => handlePagination(ev, "next")}
          aria-label="Next page"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 p-2">
        <span className="text-gray-700 text-sm">
          עמוד <span className="text-blue-600 font-semibold">{safePage}</span>{" "}
          מתוך{" "}
          <span className="text-blue-600 font-semibold">{actualMaxPages}</span>{" "}
          (סה"כ הזמנות בטיפול:{" "}
          <span className="text-blue-600 font-semibold">
            {totalProcessingOrders}
          </span>
          )
        </span>
      </div>
    </div>
  );
};

export default Pagination;
