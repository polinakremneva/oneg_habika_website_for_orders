import { PackageSearch } from "lucide-react";

export const LoadingSpinner = () => {
  return (
    <div className=" bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <PackageSearch className="w-16 h-16 text-blue-500 animate-bounce mx-auto" />
        <p className="mt-4 text-lg font-semibold text-blue-600 animate-pulse">
          טוען הזמנות... אנא המתן
        </p>
      </div>
    </div>
  );
};
