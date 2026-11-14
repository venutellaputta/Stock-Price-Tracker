export function formatCurrency(amount: number | undefined, exchange: string = 'NSE'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatLargeNumber(amount: number | undefined, exchange: string = 'NSE'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';

  // Amount in Crores INR
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh Cr`;
  }
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
}

export function formatVolume(volume: number | undefined): string {
  if (!volume) return 'N/A';
  if (volume >= 10000000) return `${(volume / 10000000).toFixed(2)} Cr`;
  if (volume >= 100000) return `${(volume / 100000).toFixed(2)} L`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`;
  return volume.toString();
}

export function formatPercent(val: number | undefined): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return formatDate(dateString);
}

export function formatLastUpdatedTime(dateString?: string): string {
  const d = dateString ? new Date(dateString) : new Date();
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
