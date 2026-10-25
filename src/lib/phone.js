// Accepts 017..., +88017..., 88017... and spaces/dashes; returns 01XXXXXXXXX or the raw input.
export const normalisePhone = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('880')) return digits.slice(2);
  return digits.length ? digits : value;
};

export const isBdMobile = (phone) => /^01[3-9]\d{8}$/.test(phone);
