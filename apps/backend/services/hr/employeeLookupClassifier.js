/**
 * تصنيف نتيجة البحث عن مستخدم قبل إضافته كموظف.
 * statuses: NOT_FOUND | ALREADY_ACTIVE_EMPLOYEE | INACTIVE_FORMER_EMPLOYEE |
 *           COMPANY_USER_NOT_EMPLOYEE | EXISTING_PLATFORM_USER
 */
function classifyLookupUser(user, companyId) {
  if (!user) return { status: 'NOT_FOUND' };

  const employeeRecord =
    user.employees && user.employees.companyId === companyId ? user.employees : null;
  const membership = (user.userCompanies || [])[0] || null;
  const isPrimaryCompany = user.companyId === companyId;
  const isUserActive = user.isActive !== false;

  const hasEmployeeNumberHere = Boolean(isPrimaryCompany && user.employeeNumber);
  const employeeActiveHere = Boolean(employeeRecord && employeeRecord.status === 'ACTIVE');
  const belongsHere = Boolean(isPrimaryCompany || employeeRecord || membership);

  // 1) موظف نشط فعلاً في الشركة
  if (belongsHere && isUserActive && (employeeActiveHere || hasEmployeeNumberHere)) {
    return { status: 'ALREADY_ACTIVE_EMPLOYEE' };
  }

  // 2) موظف/عضو سابق في الشركة (الحساب متوقف أو ملف الموظف مش ACTIVE)
  if (belongsHere && (!isUserActive || (employeeRecord && !employeeActiveHere))) {
    return { status: 'INACTIVE_FORMER_EMPLOYEE' };
  }

  // 3) عضو نشط في الشركة بس من غير ملف موظف
  if (isPrimaryCompany || (membership && membership.isActive)) {
    return { status: 'COMPANY_USER_NOT_EMPLOYEE' };
  }

  // 4) مستخدم على المنصة في شركة تانية
  return { status: 'EXISTING_PLATFORM_USER' };
}

module.exports = { classifyLookupUser };
