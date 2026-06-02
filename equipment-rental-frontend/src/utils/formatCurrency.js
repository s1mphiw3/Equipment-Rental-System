export const formatCurrency = (value) => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (num === null || num === undefined || Number.isNaN(num)) return 'SZL 0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SZL'
  }).format(num);
};

