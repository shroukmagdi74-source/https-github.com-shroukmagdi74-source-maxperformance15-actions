/**
 * حماية النطاق (tenant guard) في إعادة تفعيل موظف سابق.
 * يغطي: منع تفعيل مستخدم من شركة تانية، والسماح بموظف سابق/عضو موجود بنفس الشركة.
 */

const mockPrisma = {
  user: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  userCompany: { findFirst: jest.fn(), upsert: jest.fn() },
  employee: { findFirst: jest.fn(), upsert: jest.fn() },
  company: { findUnique: jest.fn() },
  notification: { create: jest.fn() },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  executeWithRetry: (fn) => fn(),
}));

const employeeService = require('../../services/hr/employeeService');
const { UnauthorizedError } = require('../../utils/hrErrors');

const COMPANY_A = 'company-a';
const COMPANY_B = 'company-b';

describe('HR — إعادة تفعيل موظف سابق (tenant guard)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.userCompany.findFirst.mockResolvedValue(null);
    mockPrisma.employee.findFirst.mockResolvedValue(null);
    mockPrisma.company.findUnique.mockResolvedValue({ name: 'شركة أ' });
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif-1' });
    mockPrisma.userCompany.upsert.mockResolvedValue({ id: 'uc-1' });
    mockPrisma.employee.upsert.mockResolvedValue({ id: 'emp-1' });
  });

  test('❌ يرفض مستخدم من شركة تانية (بدون عضوية ولا سجل موظف)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u-foreign',
      companyId: COMPANY_B,
      isActive: false,
      employeeNumber: 'EMP00009',
      email: 'foreign@b.com',
    });

    await expect(
      employeeService.reactivateEmployee(COMPANY_A, 'u-foreign', {})
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.userCompany.upsert).not.toHaveBeenCalled();
    expect(mockPrisma.employee.upsert).not.toHaveBeenCalled();
  });

  test('✅ يسمح بموظف سابق عنده سجل Employee بنفس الشركة', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u-former',
      companyId: COMPANY_B,
      isActive: false,
      employeeNumber: 'EMP00007',
      email: 'former@a.com',
    });
    mockPrisma.employee.findFirst.mockResolvedValue({ id: 'e-1', status: 'TERMINATED' });
    mockPrisma.user.update.mockResolvedValue({
      id: 'u-former',
      employeeNumber: 'EMP00007',
      email: 'former@a.com',
    });

    await employeeService.reactivateEmployee(COMPANY_A, 'u-former', { role: 'AGENT' });

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u-former' },
        data: expect.objectContaining({ isActive: true }),
      })
    );
    expect(mockPrisma.userCompany.upsert).toHaveBeenCalled();
    expect(mockPrisma.employee.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u-former' } })
    );
  });

  test('✅ يسمح بعضوية UserCompany نشطة/موقوفة بنفس الشركة', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u-member',
      companyId: COMPANY_B,
      isActive: false,
      employeeNumber: null,
      email: 'member@a.com',
    });
    mockPrisma.userCompany.findFirst.mockResolvedValue({ id: 'uc-x', isActive: false });
    mockPrisma.user.update.mockResolvedValue({
      id: 'u-member',
      employeeNumber: 'EMP00001',
      email: 'member@a.com',
    });

    await employeeService.reactivateEmployee(COMPANY_A, 'u-member', {});

    expect(mockPrisma.user.update).toHaveBeenCalled();
  });

  test('✅ يسمح لو الشركة هي الشركة الأساسية للمستخدم', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u-primary',
      companyId: COMPANY_A,
      isActive: true,
      employeeNumber: 'EMP00003',
      email: 'primary@a.com',
    });
    mockPrisma.user.update.mockResolvedValue({
      id: 'u-primary',
      employeeNumber: 'EMP00003',
      email: 'primary@a.com',
    });

    await employeeService.reactivateEmployee(COMPANY_A, 'u-primary', {});

    expect(mockPrisma.user.update).toHaveBeenCalled();
  });

  test('❌ يرفض مستخدم غير موجود', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      employeeService.reactivateEmployee(COMPANY_A, 'u-missing', {})
    ).rejects.toThrow('المستخدم غير موجود');
  });
});
