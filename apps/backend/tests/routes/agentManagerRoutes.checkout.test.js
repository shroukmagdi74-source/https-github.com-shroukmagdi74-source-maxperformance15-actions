const request = require('supertest');
const express = require('express');

let taskStore = {};

const mockPrisma = {
  aiAgentTask: {
    findFirst: jest.fn(async ({ where }) => {
      const task = taskStore[where.id];
      if (!task) return null;
      if (where.companyId && task.companyId !== where.companyId) return null;
      return task;
    }),
    findUnique: jest.fn(async ({ where }) => {
      return taskStore[where.id] || null;
    }),
    updateMany: jest.fn(async ({ where, data }) => {
      const task = taskStore[where.id];
      if (!task) return { count: 0 };
      if (where.companyId && task.companyId !== where.companyId) return { count: 0 };
      if (where.status) {
        if (typeof where.status === 'string' && task.status !== where.status) return { count: 0 };
        if (where.status.in && !where.status.in.includes(task.status)) return { count: 0 };
      }
      if (where.checkedOutBy && task.checkedOutBy !== where.checkedOutBy) return { count: 0 };

      Object.assign(task, data);
      return { count: 1 };
    }),
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  },
  aiRuntimeQueueJob: {
    groupBy: jest.fn().mockResolvedValue([
      { status: 'PENDING', _count: { id: 3 } },
      { status: 'RUNNING', _count: { id: 1 } },
    ]),
    findMany: jest.fn().mockResolvedValue([]),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: () => mockPrisma,
  getSharedPrismaClientAsync: async () => mockPrisma,
}));

jest.mock('../../services/aiServiceAdminClient', () => ({
  listAgents: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../utils/verifyToken', () => ({
  authenticateToken: (req, _res, next) => {
    req.user = { id: 'user-1', companyId: 'test-company-1' };
    next();
  },
}));

const agentManagerRoutes = require('../../routes/agentManagerRoutes');

describe('Agent Manager Parallel Checkout & Runtime Routes (T21)', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    taskStore = {
      'task-1': {
        id: 'task-1',
        companyId: 'test-company-1',
        status: 'PENDING',
        checkedOutBy: null,
      },
      'task-2': {
        id: 'task-2',
        companyId: 'test-company-1',
        status: 'CHECKED_OUT',
        checkedOutBy: 'agent-owner',
      },
    };
    app = express();
    app.use(express.json());
    app.use(agentManagerRoutes);
  });

  it('handles two parallel checkout requests: exactly one gets 200 and the other gets 409', async () => {
    const [res1, res2] = await Promise.all([
      request(app).post('/tasks/task-1/checkout').send({ agentId: 'a1' }),
      request(app).post('/tasks/task-1/checkout').send({ agentId: 'a2' }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 409]);

    const successRes = res1.status === 200 ? res1 : res2;
    const conflictRes = res1.status === 409 ? res1 : res2;

    expect(successRes.body.success).toBe(true);
    expect(successRes.body.task.status).toBe('CHECKED_OUT');
    expect(conflictRes.body.success).toBe(false);

    // Single owner confirmed
    expect(['a1', 'a2']).toContain(taskStore['task-1'].checkedOutBy);
  });

  it('rejects completeTask from an agent who is not the checkout owner with 409', async () => {
    const res = await request(app)
      .post('/tasks/task-2/complete')
      .send({ agentId: 'wrong-agent', result: { done: true } });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(taskStore['task-2'].status).toBe('CHECKED_OUT');
  });

  it('returns 409 with success:false when updateMany.count=0, never 500', async () => {
    const res = await request(app)
      .post('/tasks/non-existent-task/checkout')
      .send({ agentId: 'a1' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('successfully completes task when called by the correct checkedOutBy owner', async () => {
    const res = await request(app)
      .post('/tasks/task-2/complete')
      .send({ agentId: 'agent-owner', result: { done: true } });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(taskStore['task-2'].status).toBe('COMPLETED');
  });

  it('returns runtime metrics from GET /runtime', async () => {
    const res = await request(app).get('/runtime');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.queued).toBe(3);
    expect(res.body.running).toBe(1);
    expect(res.body.retrying).toBe(0);
    expect(res.body.dead).toBe(0);
    expect(Array.isArray(res.body.stuck)).toBe(true);
  });
});
