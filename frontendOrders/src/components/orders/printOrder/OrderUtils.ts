export const formatValue = (value: string | undefined | null): string => {
  if (!value) return "לא צוין";
  return value.trim() === "" ? "לא צוין" : value;
};

export const formatPrice = (price: string | undefined | null): string => {
  if (!price) return "₪0.00";
  const numPrice = parseFloat(price);
  return isNaN(numPrice) ? "₪0.00" : `₪${numPrice.toFixed(2)}`;
};
