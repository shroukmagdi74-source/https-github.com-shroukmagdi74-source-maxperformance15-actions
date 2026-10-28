const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  employee: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  userCompany: {
    upsert: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  company: {
    findUnique: jest.fn(),
  },
};

jest.mock("../../services/sharedDatabase", () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  executeWithRetry: jest.fn((fn) => fn()),
}));

const { classifyLookupUser } = require("../../services/hr/employeeLookupClassifier");
const employeeService = require("../../services/hr/employeeService");
const {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} = require("../../utils/hrErrors");

describe("Describe 1 — classifier: classifyLookupUser 9 cases", () => {
  test("Case 1: null user returns NOT_FOUND", () => {
    expect(classifyLookupUser(null, "comp-1")).toEqual({ status: "NOT_FOUND" });
  });

  test("Case 2: Primary company, with employeeNumber, isActive: true -> ALREADY_ACTIVE_EMPLOYEE", () => {
    const user = {
      companyId: "comp-1",
      employeeNumber: "EMP001",
      isActive: true,
    };
    expect(classifyLookupUser(user, "comp-1")).toEqual({
      status: "ALREADY_ACTIVE_EMPLOYEE",
    });
  });

  test("Case 3: Primary company, employeeNumber, isActive: false, Employee.status=TERMINATED -> INACTIVE_FORMER_EMPLOYEE (main bug fix)", () => {
    const user = {
      companyId: "comp-1",
      employeeNumber: "EMP001",
      isActive: false,
      employees: { companyId: "comp-1", status: "TERMINATED" },
    };
    expect(classifyLookupUser(user, "comp-1")).toEqual({
      status: "INACTIVE_FORMER_EMPLOYEE",
    });
  });

  test("Case 4: Primary company, no employeeNumber, isActive: false, no Employee record -> INACTIVE_FORMER_EMPLOYEE", () => {
    const user = {
      companyId: "comp-1",
      employeeNumber: null,
      isActive: false,
    };
    expect(classifyLookupUser(user, "comp-1")).toEqual({
      status: "INACTIVE_FORMER_EMPLOYEE",
    });
  });

  test("Case 5: Primary company, no employee record, isActive: true -> COMPANY_USER_NOT_EMPLOYEE", () => {
    const user = {
      companyId: "comp-1",
      employeeNumber: null,
      isActive: true,
    };
    expect(classifyLookupUser(user, "comp-1")).toEqual({
      status: "COMPANY_USER_NOT_EMPLOYEE",
    });
  });

  test("Case 6: Other company, active UserCompany here, no employee record -> COMPANY_USER_NOT_EMPLOYEE", () => {
    const user = {
      companyId: "comp-2",
      isActive: true,
      userCompanies: [{ companyId: "comp-1", isActive: true }],
    };
    expect(classifyLookupUser(user, "comp-1")).toEqual({
      status: "COMPANY_USER_NOT_EMPLOYEE",
    });
  });

  test("Case 7: Other company, inactive UserCompany here, isActive: true -> EXISTING_PLATFORM_USER", () => {
    const user = {
      companyId: "comp-2",
      isActive: true,
      userCompanies: [{ companyId: "comp-1", isActive: false }],
    };
    expect(classifyLookupUser(user, "comp-1")).toEqual({
      status: "EXISTING_PLATFORM_USER",
    });
  });

  test("Case 8: Other company, no relationship to current company -> EXISTING_PLATFORM_USER", () => {
    const user = {
      companyId: "comp-2",
      isActive: true,
      userCompanies: [],
    };
    expect(classifyLookupUser(user, "comp-1")).toEqual({
      status: "EXISTING_PLATFORM_USER",
    });
  });

  test("Case 9: Other company, Employee.status=TERMINATED in current company, isActive: true -> INACTIVE_FORMER_EMPLOYEE", () => {
    const user = {
      companyId: "comp-2",
      isActive: true,
      employees: { companyId: "comp-1", status: "TERMINATED" },
    };
    expect(classifyLookupUser(user, "comp-1")).toEqual({
      status: "INACTIVE_FORMER_EMPLOYEE",
    });
  });
});

describe("Describe 2 — employeeService.reactivateEmployee: 6 service cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.update.mockReset();
    mockPrisma.user.findFirst.mockReset();
    mockPrisma.employee.findUnique.mockReset();
    mockPrisma.employee.upsert.mockReset();
    mockPrisma.employee.update.mockReset();
    mockPrisma.employee.findFirst.mockReset();
    mockPrisma.userCompany.upsert.mockReset();
    mockPrisma.notification.create.mockReset();
    mockPrisma.company.findUnique.mockReset();
  });

  test("1. User not found -> throws NotFoundError with statusCode 404", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    try {
      await employeeService.reactivateEmployee("comp-1", "user-404");
      throw new Error("Expected NotFoundError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.statusCode).toBe(404);
    }
  });

  test("2. User from company B with no link to current company -> throws UnauthorizedError with statusCode 403, and no user.update", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-b",
      companyId: "comp-b",
      employees: null,
      userCompanies: [],
    });

    try {
      await employeeService.reactivateEmployee("comp-a", "user-b");
      throw new Error("Expected UnauthorizedError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.statusCode).toBe(403);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    }
  });

  test("3. User has Employee record in another company -> throws ConflictError with statusCode 409", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      companyId: "comp-a",
      employees: null,
      userCompanies: [],
    });
    mockPrisma.employee.findUnique.mockResolvedValue({
      id: "emp-other",
      userId: "user-1",
      companyId: "comp-other",
    });

    try {
      await employeeService.reactivateEmployee("comp-a", "user-1");
      throw new Error("Expected ConflictError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ConflictError);
      expect(err.statusCode).toBe(409);
    }
  });

  test("4. Successful reactivation: user.update with isActive:true, userCompany.upsert with role preserved (MANAGER not AGENT), employee.update with terminationDate/Reason null, notification.create called", async () => {
    const existingUser = {
      id: "user-1",
      companyId: "comp-1",
      employeeNumber: "EMP00100",
      firstName: "Ahmed",
      lastName: "Ali",
      email: "ahmed@example.com",
      isActive: false,
      employees: {
        id: "emp-rec-1",
        companyId: "comp-1",
        employeeNumber: "EMP00100",
        status: "TERMINATED",
      },
      userCompanies: [{ companyId: "comp-1", role: "MANAGER", isActive: false }],
    };

    mockPrisma.user.findUnique
      .mockResolvedValueOnce(existingUser) // initial findUnique in reactivateEmployee
      .mockResolvedValueOnce({ ...existingUser, isActive: true }); // findUnique inside syncWithEmployeeTable
    mockPrisma.employee.findUnique.mockResolvedValue(null);
    mockPrisma.user.update.mockResolvedValue({
      ...existingUser,
      isActive: true,
      employeeNumber: "EMP00100",
    });
    mockPrisma.userCompany.upsert.mockResolvedValue({
      userId: "user-1",
      companyId: "comp-1",
      role: "MANAGER",
      isActive: true,
    });
    mockPrisma.employee.upsert.mockResolvedValue({});
    mockPrisma.employee.update.mockResolvedValue({});
    mockPrisma.company.findUnique.mockResolvedValue({ name: "MaxP Test Co" });
    mockPrisma.notification.create.mockResolvedValue({});

    const result = await employeeService.reactivateEmployee("comp-1", "user-1");

    expect(result.isActive).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({ isActive: true, employeeNumber: "EMP00100" }),
      })
    );
    expect(mockPrisma.userCompany.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_companyId: { userId: "user-1", companyId: "comp-1" } },
        update: expect.objectContaining({ isActive: true, role: "MANAGER" }),
        create: expect.objectContaining({ isActive: true, role: "MANAGER" }),
      })
    );
    expect(mockPrisma.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "emp-rec-1" },
        data: expect.objectContaining({
          status: "ACTIVE",
          terminationDate: null,
          terminationReason: null,
        }),
      })
    );
    expect(mockPrisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          companyId: "comp-1",
          type: "INFO",
        }),
      })
    );
  });

  test("5. Reactivating twice retains the same employeeNumber, uses employee.upsert (not create), and succeeds without error", async () => {
    const userState = {
      id: "user-2",
      companyId: "comp-1",
      employeeNumber: "EMP00055",
      firstName: "Sara",
      lastName: "Hassan",
      email: "sara@example.com",
      isActive: false,
      employees: {
        id: "emp-rec-2",
        companyId: "comp-1",
        employeeNumber: "EMP00055",
        status: "TERMINATED",
      },
      userCompanies: [{ companyId: "comp-1", role: "AGENT", isActive: false }],
    };

    // First reactivation
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(userState)
      .mockResolvedValueOnce({ ...userState, isActive: true });
    mockPrisma.employee.findUnique.mockResolvedValue(null);
    mockPrisma.user.update.mockResolvedValue({
      ...userState,
      isActive: true,
    });
    mockPrisma.userCompany.upsert.mockResolvedValue({});
    mockPrisma.employee.upsert.mockResolvedValue({});
    mockPrisma.employee.update.mockResolvedValue({});
    mockPrisma.company.findUnique.mockResolvedValue({ name: "MaxP Co" });
    mockPrisma.notification.create.mockResolvedValue({});

    const firstRun = await employeeService.reactivateEmployee("comp-1", "user-2");
    expect(firstRun.employeeNumber).toBe("EMP00055");

    // Second reactivation (already active with same employeeNumber)
    const activeUserState = {
      ...userState,
      isActive: true,
      employees: {
        ...userState.employees,
        status: "ACTIVE",
      },
      userCompanies: [{ companyId: "comp-1", role: "AGENT", isActive: true }],
    };

    mockPrisma.user.findUnique
      .mockResolvedValueOnce(activeUserState)
      .mockResolvedValueOnce(activeUserState);
    mockPrisma.employee.findUnique.mockResolvedValue(null);
    mockPrisma.user.update.mockResolvedValue(activeUserState);

    const secondRun = await employeeService.reactivateEmployee("comp-1", "user-2");
    expect(secondRun.employeeNumber).toBe("EMP00055");
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.employee.upsert).toHaveBeenCalled();
  });

  test("6. When data.employeeNumber and user.employeeNumber are missing -> generates EMP00001 from company sequence", async () => {
    const userWithoutNumber = {
      id: "user-3",
      companyId: "comp-1",
      employeeNumber: null,
      firstName: "Omar",
      lastName: "Khaled",
      email: "omar@example.com",
      isActive: false,
      employees: null,
      userCompanies: [{ companyId: "comp-1", role: "AGENT", isActive: false }],
    };

    mockPrisma.user.findUnique
      .mockResolvedValueOnce(userWithoutNumber)
      .mockResolvedValueOnce({ ...userWithoutNumber, employeeNumber: "EMP00001", isActive: true });
    mockPrisma.employee.findUnique.mockResolvedValue(null);
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.update.mockImplementation(async ({ data }) => ({
      ...userWithoutNumber,
      ...data,
      id: "user-3",
    }));
    mockPrisma.userCompany.upsert.mockResolvedValue({});
    mockPrisma.employee.upsert.mockResolvedValue({});
    mockPrisma.company.findUnique.mockResolvedValue({ name: "MaxP Co" });
    mockPrisma.notification.create.mockResolvedValue({});

    const res = await employeeService.reactivateEmployee("comp-1", "user-3", {});

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { companyId: "comp-1", employeeNumber: { not: null } },
      orderBy: { employeeNumber: "desc" },
      select: { employeeNumber: true },
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ employeeNumber: "EMP00001" }),
      })
    );
    expect(res.employeeNumber).toBe("EMP00001");
  });
});
