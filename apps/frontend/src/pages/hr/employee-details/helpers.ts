export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export const calculateTenure = (hireDate: string): string => {
  const today = new Date();
  const hire = new Date(hireDate);
  const years = today.getFullYear() - hire.getFullYear();
  const months = today.getMonth() - hire.getMonth();

  if (years > 0) {
    return `${years} سنة${months > 0 ? ` و ${months} شهر` : ""}`;
  }
  return `${months} شهر`;
};
