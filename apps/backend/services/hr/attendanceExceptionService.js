/**
 * 📍 Attendance Exception Service
 * خدمة إدارة طلبات استثناء البصمة الجغرافية
 */

const { getSharedPrismaClient } = require("../sharedDatabase");
const { normalizeDateForDb } = require("../../utils/dateUtils");
const hrNotificationService = require("./hrNotificationService");
const auditService = require("./auditService");

/**
 * Get company timezone helper
 * @param {string} companyId
 * @param {object} prisma
 * @returns {Promise<string>}
 */
async function getCompanyTimezone(companyId, prisma) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { timezone: true },
    });
    return company?.timezone || "Africa/Cairo";
  } catch (error) {
    return "Africa/Cairo";
  }
}

class AttendanceExceptionService {
  get prisma() {
    return getSharedPrismaClient();
  }

  /**
   * إنشاء طلب استثناء بصمة
   * @param {string} companyId
   * @param {string} userId
   * @param {object} params
   * @param {string} params.attemptId
   * @param {string} params.reason
   * @returns {Promise<object>}
   */
  async createExceptionRequest(companyId, userId, { attemptId, reason }) {
    if (!attemptId) {
      const error = new Error("رقم المحاولة (attemptId) مطلوب");
      error.statusCode = 400;
      throw error;
    }
    if (!reason || !reason.trim()) {
      const error = new Error("سبب طلب الاستثناء مطلوب");
      error.statusCode = 400;
      throw error;
    }

    const attempt = await this.prisma.hrAttendanceAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.companyId !== companyId || attempt.userId !== userId) {
      const error = new Error("محاولة البصمة غير موجودة أو غير مصرح بها");
      error.statusCode = 404;
      throw error;
    }

    const allowedResults = ["GEOFENCE_FAILED", "WEAK_ACCURACY", "LOCATION_MISSING"];
    if (!allowedResults.includes(attempt.result)) {
      const error = new Error("لا يمكن تقديم طلب استثناء لمحاولة بصمة ناجحة");
      error.statusCode = 400;
      throw error;
    }

    const timezone = await getCompanyTimezone(companyId, this.prisma);
    const todayForDb = normalizeDateForDb(new Date(), timezone);
    const todayStr = todayForDb.toISOString().split("T")[0];
    const attemptDateStr = attempt.attendanceDate instanceof Date
      ? attempt.attendanceDate.toISOString().split("T")[0]
      : String(attempt.attendanceDate).split("T")[0];

    if (attemptDateStr !== todayStr) {
      const error = new Error("لا يمكن تقديم طلب استثناء إلا لبصمات اليوم فقط");
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate attempt
    const existingForAttempt = await this.prisma.hrAttendanceExceptionRequest.findUnique({
      where: { attemptId },
    });
    if (existingForAttempt) {
      const error = new Error("عندك طلب مقدم بالفعل لهذا اليوم");
      error.statusCode = 409;
      throw error;
    }

    // Check duplicate for user on attendanceDate
    const existingForDate = await this.prisma.hrAttendanceExceptionRequest.findFirst({
      where: {
        companyId,
        userId,
        attendanceDate: attempt.attendanceDate,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });
    if (existingForDate) {
      const error = new Error("عندك طلب مقدم بالفعل لهذا اليوم");
      error.statusCode = 409;
      throw error;
    }

    const request = await this.prisma.hrAttendanceExceptionRequest.create({
      data: {
        companyId,
        userId,
        attemptId,
        attendanceDate: attempt.attendanceDate,
        status: "PENDING",
        reason: reason.trim(),
        distanceMeters: attempt.effectiveDistanceMeters ?? attempt.distanceMeters ?? null,
        accuracyMeters: attempt.accuracyMeters ?? null,
        clientIp: attempt.clientIp ?? null,
      },
    });

    try {
      await hrNotificationService.notifyHrEvent({
        companyId,
        notificationKey: "notifyOnAttendanceIssue",
        employeeUserId: userId,
        includeManagers: true,
        title: "طلب استثناء بصمة جديد",
        message: `قدم الموظف طلب استثناء لتسجيل الحضور: ${reason.trim()}`,
        type: "HR_ATTENDANCE_EXCEPTION",
        data: {
          requestId: request.id,
          attemptId: attempt.id,
          attendanceDate: request.attendanceDate,
          reason: reason.trim(),
        },
      }, this.prisma);
    } catch (notifyErr) {
      console.warn("⚠️ [EXCEPTION-NOTIFY] Failed to notify HR event:", notifyErr?.message || notifyErr);
    }

    return request;
  }

  /**
   * عرض قائمة طلبات استثناء البصمة
   * @param {string} companyId
   * @param {object} [filter]
   * @param {string} [filter.status]
   * @param {string|Date} [filter.from]
   * @param {string|Date} [filter.to]
   * @returns {Promise<Array<object>>}
   */
  async listExceptionRequests(companyId, { status, from, to } = {}) {
    const where = { companyId };
    if (status) {
      where.status = status;
    }

    const timezone = await getCompanyTimezone(companyId, this.prisma);
    if (from || to) {
      where.attendanceDate = {};
      if (from) where.attendanceDate.gte = normalizeDateForDb(new Date(from), timezone);
      if (to) where.attendanceDate.lte = normalizeDateForDb(new Date(to), timezone);
    }

    const requests = await this.prisma.hrAttendanceExceptionRequest.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      take: 200,
    });

    if (requests.length === 0) return [];

    const userIds = [...new Set(requests.map((r) => r.userId).filter(Boolean))];

    const [users, employees] = await Promise.all([
      this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          role: true,
        },
      }),
      this.prisma.employee.findMany({
        where: {
          companyId,
          userId: { in: userIds },
        },
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          firstNameEn: true,
          lastNameEn: true,
          employeeNumber: true,
          department: { select: { id: true, name: true } },
          position: { select: { id: true, title: true } },
        },
      }),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const employeeMap = new Map(employees.map((e) => [e.userId, e]));

    return requests.map((req) => {
      const user = userMap.get(req.userId) || null;
      const emp = employeeMap.get(req.userId) || null;
      const employeeName = emp
        ? `${emp.firstName || ""} ${emp.lastName || ""}`.trim()
        : (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "موظف");

      return {
        ...req,
        user,
        employee: emp,
        employeeName,
      };
    });
  }

  /**
   * اتخاذ قرار بشأن طلب استثناء بصمة (موافقة أو رفض)
   * @param {string} companyId
   * @param {string} requestId
   * @param {object} params
   * @param {"APPROVED" | "REJECTED"} params.decision
   * @param {string} [params.note]
   * @param {string} params.decidedById
   * @returns {Promise<object>}
   */
  async decideExceptionRequest(companyId, requestId, { decision, note, decidedById }) {
    if (!["APPROVED", "REJECTED"].includes(decision)) {
      const error = new Error("قرار غير صالح. يجب أن يكون APPROVED أو REJECTED");
      error.statusCode = 400;
      throw error;
    }

    const request = await this.prisma.hrAttendanceExceptionRequest.findFirst({
      where: { id: requestId, companyId },
    });

    if (!request) {
      const error = new Error("طلب الاستثناء غير موجود");
      error.statusCode = 404;
      throw error;
    }

    // Idempotent: if already decided, return current state
    if (request.status !== "PENDING") {
      return request;
    }

    if (decision === "REJECTED") {
      const updated = await this.prisma.hrAttendanceExceptionRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          decidedById: decidedById || null,
          decidedAt: new Date(),
          decisionNote: note || null,
        },
      });

      try {
        await auditService.logAction(
          companyId,
          decidedById,
          "REJECT",
          "ATTENDANCE",
          requestId,
          { requestId, reason: request.reason, note }
        );
      } catch (auditErr) {
        console.warn("⚠️ [EXCEPTION-AUDIT] Failed to log audit:", auditErr?.message || auditErr);
      }

      return updated;
    }

    // decision === "APPROVED"
    const attempt = await this.prisma.hrAttendanceAttempt.findUnique({
      where: { id: request.attemptId },
    });

    const timezone = await getCompanyTimezone(companyId, this.prisma);
    const attendanceDate = normalizeDateForDb(new Date(request.attendanceDate), timezone);

    const existing = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: request.userId,
          date: attendanceDate,
        },
      },
    });

    const checkInTime = attempt?.attemptedAt || request.requestedAt || new Date();
    const noteParts = [
      request.reason ? `سبب الاستثناء: ${request.reason}` : null,
      request.distanceMeters != null ? `المسافة: ${request.distanceMeters}م` : null,
      request.accuracyMeters != null ? `دقة الموقع: ${request.accuracyMeters}م` : null,
      request.clientIp ? `IP: ${request.clientIp}` : null,
      note ? `ملاحظة الاعتماد: ${note}` : null,
    ].filter(Boolean);
    const noteDetails = noteParts.join(" | ");

    let attendance;
    if (existing) {
      attendance = await this.prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: existing.checkIn || checkInTime,
          checkInMethod: "exception_approved",
          isApproved: true,
          approvedBy: decidedById || null,
          notes: existing.notes ? `${existing.notes}\n${noteDetails}` : noteDetails,
        },
      });
    } else {
      attendance = await this.prisma.attendance.create({
        data: {
          companyId,
          userId: request.userId,
          date: attendanceDate,
          checkIn: checkInTime,
          checkInMethod: "exception_approved",
          isApproved: true,
          approvedBy: decidedById || null,
          notes: noteDetails,
          status: "PRESENT",
        },
      });
    }

    const updatedRequest = await this.prisma.hrAttendanceExceptionRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        decidedById: decidedById || null,
        decidedAt: new Date(),
        decisionNote: note || null,
        attendanceId: attendance.id,
      },
    });

    if (attempt) {
      await this.prisma.hrAttendanceAttempt.update({
        where: { id: attempt.id },
        data: { attendanceId: attendance.id },
      }).catch((err) => console.warn("⚠️ Failed to link attendanceId on attempt:", err?.message || err));
    }

    try {
      await auditService.logAction(
        companyId,
        decidedById,
        "APPROVE",
        "ATTENDANCE",
        attendance.id,
        { requestId, attendanceId: attendance.id, reason: request.reason, note }
      );
    } catch (auditErr) {
      console.warn("⚠️ [EXCEPTION-AUDIT] Failed to log audit:", auditErr?.message || auditErr);
    }

    return updatedRequest;
  }
}

module.exports = new AttendanceExceptionService();
