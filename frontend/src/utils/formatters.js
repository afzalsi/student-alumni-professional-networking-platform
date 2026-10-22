export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatDateTime = (dateStr, timeStr) => {
  if (!dateStr) return 'N/A';
  const formattedDate = formatDate(dateStr);
  return timeStr ? `${formattedDate} at ${timeStr}` : formattedDate;
};

export const formatCurrency = (val) => {
  if (!val) return 'Competitive';
  return val;
};
