jest.mock('@prisma/client', () => ({ Prisma: {} }), { virtual: true });
jest.mock('../../../../prisma/generated/postgresql_v2', () => ({ Prisma: {} }), { virtual: true });
jest.mock('../../../services/orderWorkflowService', () => ({}));
jest.mock('../../../services/orderService', () => ({
  getOrderSettings: jest.fn().mockResolvedValue({}),
}));
jest.mock('../../../services/redisCacheService', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(null),
}));

const mockPrisma = {
  order: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  guestOrder: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  orderAssignment: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  orderConfirmationSettings: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userCompany: {
    findFirst: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
  callAttemptLog: {
    count: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  orderNote: {
    count: jest.fn(),
    updateMany: jest.fn(),
  },
  guestCart: {
    count: jest.fn().mockResolvedValue(0),
  },
  cartContactLog: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  cartConversionLog: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  $transaction: jest.fn(async (cb) => {
    if (typeof cb === 'function') {
      return cb(mockPrisma);
    }
    return Promise.all(cb);
  }),
};

jest.mock('../../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  safeQuery: jest.fn((operation) => operation()),
}));

const orderConfirmationService = require('../../../services/orderConfirmationService');
const agentWorkspaceController = require('../../../controller/agentWorkspaceController');

describe('Guest Twin Reconciliation & Duplicate Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('A.2 orderConfirmationService.autoAssignGuest', () => {
    const settings = {
      distributionEnabled: true,
      distributionStrategy: 'round_robin',
      autoAssignOnConfirm: true,
    };

    test('returns null when a regular Order twin exists with the same orderNumber (case-insensitive)', async () => {
      const guestOrder = {
        id: 'guest-1',
        companyId: 'comp-1',
        orderNumber: 'ord-12345',
        status: 'PENDING',
      };

      mockPrisma.order.findFirst.mockResolvedValueOnce({ id: 'reg-1', orderNumber: 'ORD-12345' });

      const result = await orderConfirmationService.autoAssignGuest('comp-1', guestOrder, settings);
      expect(result).toBeNull();
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          companyId: 'comp-1',
          OR: [{ orderNumber: { equals: 'ord-12345', mode: 'insensitive' } }],
        },
        select: { id: true },
      });
      expect(mockPrisma.orderAssignment.create).not.toHaveBeenCalled();
    });

    test('returns null when guest order has metadata.primaryOrderId pointing to a regular order', async () => {
      const guestOrder = {
        id: 'guest-2',
        companyId: 'comp-1',
        orderNumber: 'ORD-999',
        metadata: JSON.stringify({ primaryOrderId: 'reg-999' }),
        status: 'PENDING',
      };

      mockPrisma.order.findFirst.mockResolvedValueOnce({ id: 'reg-999' });

      const result = await orderConfirmationService.autoAssignGuest('comp-1', guestOrder, settings);
      expect(result).toBeNull();
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          companyId: 'comp-1',
          OR: [
            { id: 'reg-999' },
            { orderNumber: { equals: 'ORD-999', mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      expect(mockPrisma.orderAssignment.create).not.toHaveBeenCalled();
    });

    test('proceeds to assign genuine guest-only orders when no regular twin exists', async () => {
      const guestOrder = {
        id: 'guest-pure',
        companyId: 'comp-1',
        orderNumber: 'GUEST-ONLY-001',
        status: 'PENDING',
      };

      mockPrisma.order.findFirst.mockResolvedValueOnce(null);

      jest.spyOn(orderConfirmationService, 'getEligibleUsers').mockResolvedValueOnce([
        { id: 'agent-1', firstName: 'Sara', lastName: 'Ali' },
      ]);
      mockPrisma.orderAssignment.updateMany.mockResolvedValueOnce({ count: 0 });
      mockPrisma.orderAssignment.create.mockResolvedValueOnce({ id: 'assign-1' });
      mockPrisma.orderConfirmationSettings.update.mockResolvedValueOnce({});

      const result = await orderConfirmationService.autoAssignGuest('comp-1', guestOrder, settings);
      expect(result).toEqual({ id: 'agent-1', firstName: 'Sara', lastName: 'Ali' });
      expect(mockPrisma.orderAssignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: 'comp-1',
          guestOrderId: 'guest-pure',
          assignedTo: 'agent-1',
          isActive: true,
        }),
      });
    });
  });

  describe('A.1 autoDistributeOrders skips guest twins', () => {
    test('only assigns guest-only orders and excludes guest twins having regular orders', async () => {
      const req = {
        user: { id: 'admin-1', effectiveCompanyId: 'comp-1' },
        body: { limit: 10 },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      jest.spyOn(orderConfirmationService, 'getSettings').mockResolvedValueOnce({ enabled: true, distributionEnabled: true });
      jest.spyOn(orderConfirmationService, 'autoAssign').mockResolvedValue(true);
      jest.spyOn(orderConfirmationService, 'autoAssignGuest').mockResolvedValue(true);

      const unassignedRegular = [
        { id: 'reg-1', orderNumber: 'ORD-100', status: 'PENDING' },
      ];
      const unassignedGuestCandidates = [
        { id: 'guest-twin', orderNumber: 'ORD-100', status: 'pending' },
        { id: 'guest-solo', orderNumber: 'GUEST-200', status: 'pending' },
      ];

      mockPrisma.order.findMany
        .mockResolvedValueOnce(unassignedRegular)
        .mockResolvedValueOnce([{ orderNumber: 'ORD-100' }]);
      mockPrisma.guestOrder.findMany.mockResolvedValueOnce(unassignedGuestCandidates);

      await agentWorkspaceController.autoDistributeOrders(req, res);

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'comp-1',
          orderNumber: { in: ['ORD-100', 'GUEST-200'], mode: 'insensitive' },
        },
        select: { orderNumber: true },
      });

      expect(orderConfirmationService.autoAssign).toHaveBeenCalledWith(
        'comp-1',
        unassignedRegular[0],
        expect.any(Object),
        'admin-1'
      );

      expect(orderConfirmationService.autoAssignGuest).toHaveBeenCalledTimes(1);
      expect(orderConfirmationService.autoAssignGuest).toHaveBeenCalledWith(
        'comp-1',
        unassignedGuestCandidates[1],
        expect.any(Object),
        'admin-1'
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { assignedCount: 2 },
        })
      );
    });
  });

  describe('A.3 assignOrder redirects guest target to regular twin', () => {
    test('when target resolves to a GuestOrder with a regular twin, assigns the regular instead', async () => {
      const req = {
        user: { id: 'admin-1', effectiveCompanyId: 'comp-1' },
        body: { orderId: 'guest-twin-id', targetUserId: 'agent-target' },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      mockPrisma.userCompany.findFirst.mockResolvedValueOnce({ id: 'uc-1' });
      mockPrisma.order.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'reg-twin-id', orderNumber: 'ORD-DUO' });

      mockPrisma.guestOrder.findFirst.mockResolvedValueOnce({
        id: 'guest-twin-id',
        orderNumber: 'ORD-DUO',
        metadata: null,
      });

      mockPrisma.orderAssignment.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.orderAssignment.create.mockResolvedValue({ id: 'new-assign' });
      mockPrisma.order.update.mockResolvedValue({});

      await agentWorkspaceController.assignOrder(req, res);

      expect(mockPrisma.orderAssignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: 'comp-1',
          orderId: 'reg-twin-id',
          assignedTo: 'agent-target',
          isActive: true,
        }),
      });

      expect(mockPrisma.orderAssignment.updateMany).toHaveBeenCalledWith({
        where: { guestOrderId: 'guest-twin-id', isActive: true },
        data: { isActive: false },
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'تم تعيين الطلب بنجاح',
      });
    });
  });

  describe('B. Read-side safe metadata filter semantics', () => {
    // Helper to evaluate Prisma-like OR on an assignment object
    function matchesWorkspaceFilter(assignment, whereClause) {
      const orList = whereClause.OR;
      for (const branch of orList) {
        if (branch.order && assignment.order) {
          if (branch.order.status === assignment.order.status) return true;
        }
        if (branch.guestOrder && assignment.guestOrder) {
          const g = assignment.guestOrder;
          const statusMatches = Array.isArray(branch.guestOrder.status?.in)
            ? branch.guestOrder.status.in.includes(g.status)
            : branch.guestOrder.status === g.status;
          if (!statusMatches) continue;

          // Safe metadata filter: OR: [{ metadata: null }, { NOT: { metadata: { contains: '"primaryOrderId"' } } }]
          const metaOr = branch.guestOrder.OR;
          if (metaOr) {
            let metaPass = false;
            if (metaOr.some((c) => c.metadata === null && (g.metadata === null || g.metadata === undefined))) {
              metaPass = true;
            } else {
              const notClause = metaOr.find((c) => c.NOT && c.NOT.metadata && c.NOT.metadata.contains);
              if (notClause) {
                const needle = notClause.NOT.metadata.contains;
                if (typeof g.metadata === 'string' && !g.metadata.includes(needle)) {
                  metaPass = true;
                }
              }
            }
            if (metaPass) return true;
          } else {
            return true;
          }
        }
      }
      return false;
    }

    test('(a) regular assignment with guestOrderId=null is included in workspace query filter', async () => {
      const req = {
        user: { id: 'user-1', role: 'AGENT', effectiveCompanyId: 'comp-1' },
        query: { status: 'PENDING' },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      mockPrisma.orderAssignment.findMany.mockResolvedValueOnce([]);
      mockPrisma.orderAssignment.count.mockResolvedValueOnce(0);

      await agentWorkspaceController.getMyOrders(req, res);

      const findManyCall = mockPrisma.orderAssignment.findMany.mock.calls[0][0];
      const where = findManyCall.where;

      // Regular assignment: orderId present, guestOrderId=null
      const regularAssignment = {
        id: 'assign-reg',
        orderId: 'reg-1',
        guestOrderId: null,
        order: { id: 'reg-1', status: 'PENDING' },
        guestOrder: null,
      };

      // Verify that where.OR branch for order matches regular assignment
      expect(where.OR[0].order.status).toBe('PENDING');
      expect(matchesWorkspaceFilter(regularAssignment, where)).toBe(true);
    });

    test('(b) genuine guest-only order with metadata=null is included in workspace feed & unassigned pool', async () => {
      const req = {
        user: { id: 'user-1', role: 'AGENT', effectiveCompanyId: 'comp-1' },
        query: { status: 'PENDING' },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      mockPrisma.orderAssignment.findMany.mockResolvedValueOnce([]);
      mockPrisma.orderAssignment.count.mockResolvedValueOnce(0);

      await agentWorkspaceController.getMyOrders(req, res);

      const findManyCall = mockPrisma.orderAssignment.findMany.mock.calls[0][0];
      const where = findManyCall.where;

      // Genuine guest order with metadata=null
      const genuineGuestAssignment = {
        id: 'assign-guest-pure',
        orderId: null,
        guestOrderId: 'guest-pure',
        order: null,
        guestOrder: { id: 'guest-pure', status: 'PENDING', metadata: null },
      };

      expect(matchesWorkspaceFilter(genuineGuestAssignment, where)).toBe(true);

      // Verify unassigned pool
      const mgrReq = {
        user: { id: 'mgr-1', role: 'MANAGER', effectiveCompanyId: 'comp-1' },
        query: { assignedTo: 'unassigned', status: 'PENDING' },
      };
      mockPrisma.order.count.mockResolvedValueOnce(0);
      mockPrisma.guestOrder.count.mockResolvedValueOnce(1);
      mockPrisma.order.findMany.mockResolvedValueOnce([]);
      mockPrisma.guestOrder.findMany.mockResolvedValueOnce([]);

      await agentWorkspaceController.getMyOrders(mgrReq, res);

      const guestCountWhere = mockPrisma.guestOrder.count.mock.calls[0][0].where;
      expect(guestCountWhere.OR).toEqual([
        { metadata: null },
        { NOT: { metadata: { contains: '"primaryOrderId"' } } },
      ]);
    });

    test('(c) shadow guest order with primaryOrderId in metadata is excluded from workspace filter', async () => {
      const req = {
        user: { id: 'user-1', role: 'AGENT', effectiveCompanyId: 'comp-1' },
        query: { status: 'PENDING' },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      mockPrisma.orderAssignment.findMany.mockResolvedValueOnce([]);
      mockPrisma.orderAssignment.count.mockResolvedValueOnce(0);

      await agentWorkspaceController.getMyOrders(req, res);

      const findManyCall = mockPrisma.orderAssignment.findMany.mock.calls[0][0];
      const where = findManyCall.where;

      // Shadow guest order having primaryOrderId in metadata
      const shadowGuestAssignment = {
        id: 'assign-shadow',
        orderId: null,
        guestOrderId: 'guest-shadow',
        order: null,
        guestOrder: {
          id: 'guest-shadow',
          status: 'PENDING',
          metadata: JSON.stringify({ primaryOrderId: 'reg-primary-1' }),
        },
      };

      // Must be excluded!
      expect(matchesWorkspaceFilter(shadowGuestAssignment, where)).toBe(false);
    });
  });
});
