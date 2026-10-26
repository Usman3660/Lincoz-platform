/**
 * Lincoz Enterprise - Global Currency Utilities
 * Standardizes currency representation across the entire platform to 'Rs'
 */

export const CURRENCY_SYMBOL = 'Rs';

export const formatCurrency = (val, prefixPlus = false) => {
  const num = Number(val || 0);
  if (num < 0) {
    return `-Rs ${Math.abs(num).toLocaleString()}`;
  }
  return `${prefixPlus && num > 0 ? '+' : ''}Rs ${num.toLocaleString()}`;
};

export const formatRs = (val) => {
  const num = Number(val || 0);
  if (num < 0) {
    return `-Rs ${Math.abs(num).toLocaleString()}`;
  }
  return `Rs ${num.toLocaleString()}`;
};

export default formatCurrency;
