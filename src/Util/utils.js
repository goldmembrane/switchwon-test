export const formatCurrency = (amount) => {
  const currency = amount.toString();

  return currency.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};
