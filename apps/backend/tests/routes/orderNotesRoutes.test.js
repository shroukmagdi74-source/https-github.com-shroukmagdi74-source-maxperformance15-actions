const express = require('express');
const request = require('supertest');

let mockCurrentUser = {
  id: 'user-1',
  companyId: 'company-1',
  role: 'COMPANY_ADMIN',
  firstName: 'Admin',
  lastName: 'User',
};

const mockPrisma = {
  orderNote: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  },
  order: {
    findFirst: jest.fn(),
  },
  guestOrder: {
    findFirst: jest.fn(),
  },
  orderStatusConfig: {
    findFirst: jest.fn().mockResolvedValue({ allowStatusEdit: true }),
    findMany: jest.fn().mockResolvedValue([]),
  },
};

jest.mock('../../utils/verifyToken', () => ({
  authenticateToken: (req, _res, next) => {
    req.user = { ...mockCurrentUser };
    next();
  },
  requireCompanyAccess: (_req, _res, next) => next(),
  requireRole: () => (_req, _res, next) => next(),
}));

jest.mock('../../middleware/rbacMiddleware', () => ({
  requireDbPermission: () => (_req, _res, next) => next(),
  requirePermission: () => (_req, _res, next) => next(),
}));

jest.mock('../../middleware/checkAppAccess', () => ({
  checkAppAccess: () => (_req, _res, next) => next(),
}));

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: () => mockPrisma,
}));

jest.mock('../../services/socketService', () => ({
  getIO: () => ({ to: () => ({ emit: jest.fn() }) }),
}));

describe('Order Notes API - PATCH & DELETE /simple/notes/:noteId', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const router = require('../../routes/orders');
    app.use('/orders-new', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = {
      id: 'user-1',
      companyId: 'company-1',
      role: 'COMPANY_ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    };
    mockPrisma.orderStatusConfig.findFirst.mockResolvedValue({ allowStatusEdit: true });
  });

  describe('PATCH /orders-new/simple/notes/:noteId', () => {
    it('successfully updates a note and does not include customStatusCode for guestOrder', async () => {
      mockPrisma.orderNote.findUnique.mockResolvedValueOnce({
        id: 'note-123',
        content: 'Old note',
        authorId: 'user-1',
        order: {
          companyId: 'company-1',
          status: 'PENDING',
          customStatusCode: 'PENDING',
        },
        guestOrder: null,
      });

      mockPrisma.orderNote.update.mockResolvedValueOnce({
        id: 'note-123',
        content: 'Updated note content',
        authorId: 'user-1',
        user: { id: 'user-1', firstName: 'Admin', lastName: 'User', avatar: null },
      });

      const res = await request(app)
        .patch('/orders-new/simple/notes/note-123')
        .send({ content: 'Updated note content' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Updated note content');

      // Verify guestOrder select does NOT contain customStatusCode
      const findUniqueArgs = mockPrisma.orderNote.findUnique.mock.calls[0][0];
      expect(findUniqueArgs.include.guestOrder.select).toEqual({
        companyId: true,
        status: true,
      });
      expect(findUniqueArgs.include.guestOrder.select.customStatusCode).toBeUndefined();
    });

    it('successfully updates a note on a guestOrder', async () => {
      mockPrisma.orderNote.findUnique.mockResolvedValueOnce({
        id: 'note-guest-1',
        content: 'Guest note',
        authorId: 'user-1',
        order: null,
        guestOrder: {
          companyId: 'company-1',
          status: 'pending',
        },
      });

      mockPrisma.orderNote.update.mockResolvedValueOnce({
        id: 'note-guest-1',
        content: 'Updated guest note',
        authorId: 'user-1',
        user: { id: 'user-1', firstName: 'Admin', lastName: 'User', avatar: null },
      });

      const res = await request(app)
        .patch('/orders-new/simple/notes/note-guest-1')
        .send({ content: 'Updated guest note' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Updated guest note');
    });

    it('returns 400 if content is empty', async () => {
      const res = await request(app)
        .patch('/orders-new/simple/notes/note-123')
        .send({ content: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(mockPrisma.orderNote.findUnique).not.toHaveBeenCalled();
    });

    it('returns 403 if note belongs to another company (tenant isolation)', async () => {
      mockPrisma.orderNote.findUnique.mockResolvedValueOnce({
        id: 'note-other-tenant',
        content: 'Other note',
        authorId: 'user-other',
        order: {
          companyId: 'company-different',
          status: 'PENDING',
        },
        guestOrder: null,
      });

      const res = await request(app)
        .patch('/orders-new/simple/notes/note-other-tenant')
        .send({ content: 'Hacked note' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(mockPrisma.orderNote.update).not.toHaveBeenCalled();
    });

    it('returns 403 if non-admin user attempts to edit another users note', async () => {
      mockCurrentUser = {
        id: 'agent-1',
        companyId: 'company-1',
        role: 'AGENT',
      };

      mockPrisma.orderNote.findUnique.mockResolvedValueOnce({
        id: 'note-author-2',
        content: 'Original',
        authorId: 'agent-2',
        order: {
          companyId: 'company-1',
          status: 'PENDING',
        },
        guestOrder: null,
      });

      const res = await request(app)
        .patch('/orders-new/simple/notes/note-author-2')
        .send({ content: 'Modified by unauthorized agent' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(mockPrisma.orderNote.update).not.toHaveBeenCalled();
    });

    it('returns 403 if status is locked for editing', async () => {
      mockPrisma.orderStatusConfig.findFirst.mockResolvedValueOnce({ allowStatusEdit: false });

      mockPrisma.orderNote.findUnique.mockResolvedValueOnce({
        id: 'note-locked',
        content: 'Locked order note',
        authorId: 'user-1',
        order: {
          companyId: 'company-1',
          status: 'DELIVERED',
        },
        guestOrder: null,
      });

      const res = await request(app)
        .patch('/orders-new/simple/notes/note-locked')
        .send({ content: 'Attempt edit on locked status' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(mockPrisma.orderNote.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /orders-new/simple/notes/:noteId', () => {
    it('successfully deletes a note without selecting customStatusCode for guestOrder', async () => {
      mockPrisma.orderNote.findUnique.mockResolvedValueOnce({
        id: 'note-123',
        authorId: 'user-1',
        order: {
          companyId: 'company-1',
          status: 'PENDING',
          customStatusCode: 'PENDING',
        },
        guestOrder: null,
      });

      mockPrisma.orderNote.delete.mockResolvedValueOnce({ id: 'note-123' });

      const res = await request(app).delete('/orders-new/simple/notes/note-123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.orderNote.delete).toHaveBeenCalledWith({
        where: { id: 'note-123' },
      });

      const findUniqueArgs = mockPrisma.orderNote.findUnique.mock.calls[0][0];
      expect(findUniqueArgs.include.guestOrder.select).toEqual({
        companyId: true,
        status: true,
      });
      expect(findUniqueArgs.include.guestOrder.select.customStatusCode).toBeUndefined();
    });

    it('successfully deletes a note on a guestOrder', async () => {
      mockPrisma.orderNote.findUnique.mockResolvedValueOnce({
        id: 'note-guest-delete',
        authorId: 'user-1',
        order: null,
        guestOrder: {
          companyId: 'company-1',
          status: 'pending',
        },
      });

      mockPrisma.orderNote.delete.mockResolvedValueOnce({ id: 'note-guest-delete' });

      const res = await request(app).delete('/orders-new/simple/notes/note-guest-delete');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.orderNote.delete).toHaveBeenCalledWith({
        where: { id: 'note-guest-delete' },
      });
    });

    it('returns 403 if note belongs to another company on delete', async () => {
      mockPrisma.orderNote.findUnique.mockResolvedValueOnce({
        id: 'note-other-company-delete',
        authorId: 'user-1',
        order: {
          companyId: 'company-other',
          status: 'PENDING',
        },
        guestOrder: null,
      });

      const res = await request(app).delete('/orders-new/simple/notes/note-other-company-delete');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(mockPrisma.orderNote.delete).not.toHaveBeenCalled();
    });
  });
});
