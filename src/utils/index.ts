// Common utility functions

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatCurrency = (amount: number, currency = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    // Basic JWT decode (without verification)
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const decoded = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return decoded.exp ? decoded.exp < now : false;
  } catch {
    return true;
  }
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};
