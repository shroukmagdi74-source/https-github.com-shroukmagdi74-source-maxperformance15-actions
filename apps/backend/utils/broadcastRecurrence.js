const { DateTime } = require('luxon');

const ZONE = 'Africa/Cairo';

/**
 * Compute the next run instant for a campaign after a given instant `from`.
 * 
 * @param {Object} options
 * @param {string} options.recurrence - 'none' | 'daily' | 'weekly' | 'monthly'
 * @param {number} [options.recurrenceInterval=1] - interval (every N days/weeks/months)
 * @param {number|null} [options.sendHour=0] - 0-23, Africa/Cairo wall clock
 * @param {number} [options.sendMinute=0] - 0-59, Africa/Cairo wall clock
 * @param {Date|string} [options.from=new Date()] - reference instant (strictly after this)
 * @param {Date|string} [options.startAt] - initial campaign start anchor
 * @param {number} [options.anchorDay] - day of month anchor (1-31)
 * @param {number} [options.anchorWeekday] - day of week anchor (1-7, Mon=1)
 * @returns {Date|null}
 */
function computeNextRunAt({
  recurrence,
  recurrenceInterval = 1,
  sendHour = 0,
  sendMinute = 0,
  from = new Date(),
  startAt,
  anchorDay,
  anchorWeekday,
} = {}) {
  if (!recurrence || recurrence === 'none') {
    return null;
  }

  const interval = Math.max(1, parseInt(recurrenceInterval, 10) || 1);
  const hour = (sendHour !== null && sendHour !== undefined) ? Number(sendHour) : 0;
  const minute = (sendMinute !== null && sendMinute !== undefined) ? Number(sendMinute) : 0;

  const fromDt = DateTime.fromJSDate(from instanceof Date ? from : new Date(from), { zone: ZONE });
  if (!fromDt.isValid) return null;

  if (recurrence === 'daily') {
    if (startAt) {
      const startDt = DateTime.fromJSDate(startAt instanceof Date ? startAt : new Date(startAt), { zone: ZONE });
      let candidate = startDt.set({ hour, minute, second: 0, millisecond: 0 });
      if (candidate < startDt) {
        candidate = candidate.plus({ days: 1 });
      }
      while (candidate <= fromDt) {
        candidate = candidate.plus({ days: interval });
      }
      return candidate.toJSDate();
    } else {
      let candidate = fromDt.set({ hour, minute, second: 0, millisecond: 0 });
      if (candidate <= fromDt) {
        candidate = candidate.plus({ days: interval });
      }
      while (candidate <= fromDt) {
        candidate = candidate.plus({ days: interval });
      }
      return candidate.toJSDate();
    }
  }

  if (recurrence === 'weekly') {
    const targetWeekday = anchorWeekday || (startAt ? DateTime.fromJSDate(new Date(startAt), { zone: ZONE }).weekday : fromDt.weekday);
    if (startAt) {
      const startDt = DateTime.fromJSDate(startAt instanceof Date ? startAt : new Date(startAt), { zone: ZONE });
      let candidate = startDt.set({ hour, minute, second: 0, millisecond: 0 });
      if (candidate.weekday !== targetWeekday) {
        const diff = (targetWeekday - candidate.weekday + 7) % 7;
        candidate = candidate.plus({ days: diff });
      }
      if (candidate < startDt) {
        candidate = candidate.plus({ weeks: 1 });
      }
      while (candidate <= fromDt) {
        candidate = candidate.plus({ weeks: interval });
      }
      return candidate.toJSDate();
    } else {
      const diff = (targetWeekday - fromDt.weekday + 7) % 7;
      let candidate = fromDt.plus({ days: diff }).set({ hour, minute, second: 0, millisecond: 0 });
      if (candidate <= fromDt) {
        candidate = candidate.plus({ weeks: interval });
      }
      while (candidate <= fromDt) {
        candidate = candidate.plus({ weeks: interval });
      }
      return candidate.toJSDate();
    }
  }

  if (recurrence === 'monthly') {
    const targetDay = anchorDay || (startAt ? DateTime.fromJSDate(new Date(startAt), { zone: ZONE }).day : fromDt.day);
    if (startAt) {
      const startDt = DateTime.fromJSDate(startAt instanceof Date ? startAt : new Date(startAt), { zone: ZONE });
      let k = 0;
      while (true) {
        const targetMonth = startDt.plus({ months: k * interval });
        const clampedDay = Math.min(targetDay, targetMonth.daysInMonth);
        const candidate = targetMonth.set({ day: clampedDay, hour, minute, second: 0, millisecond: 0 });
        if (candidate > fromDt) {
          return candidate.toJSDate();
        }
        k++;
      }
    } else {
      let m = 1;
      while (true) {
        const targetMonth = fromDt.plus({ months: m * interval });
        const clampedDay = Math.min(targetDay, targetMonth.daysInMonth);
        const candidate = targetMonth.set({ day: clampedDay, hour, minute, second: 0, millisecond: 0 });
        if (candidate > fromDt) {
          return candidate.toJSDate();
        }
        m++;
      }
    }
  }

  return null;
}

/**
 * Compute the first occurrence at or after `startAt`.
 *
 * @param {Object} options
 * @returns {Date|null}
 */
function computeFirstRunAt({
  recurrence,
  recurrenceInterval = 1,
  sendHour = 0,
  sendMinute = 0,
  startAt = new Date(),
  anchorDay,
  anchorWeekday,
} = {}) {
  if (!recurrence || recurrence === 'none') {
    return null;
  }

  const hour = (sendHour !== null && sendHour !== undefined) ? Number(sendHour) : 0;
  const minute = (sendMinute !== null && sendMinute !== undefined) ? Number(sendMinute) : 0;
  const startDt = DateTime.fromJSDate(startAt instanceof Date ? startAt : new Date(startAt), { zone: ZONE });
  if (!startDt.isValid) return null;

  if (recurrence === 'daily') {
    const candidate = startDt.set({ hour, minute, second: 0, millisecond: 0 });
    if (candidate >= startDt) {
      return candidate.toJSDate();
    }
    return computeNextRunAt({
      recurrence,
      recurrenceInterval,
      sendHour,
      sendMinute,
      from: startDt.toJSDate(),
      startAt,
      anchorDay,
      anchorWeekday,
    });
  }

  if (recurrence === 'weekly') {
    const targetWeekday = anchorWeekday || startDt.weekday;
    const diff = (targetWeekday - startDt.weekday + 7) % 7;
    const candidate = startDt.plus({ days: diff }).set({ hour, minute, second: 0, millisecond: 0 });
    if (candidate >= startDt) {
      return candidate.toJSDate();
    }
    return computeNextRunAt({
      recurrence,
      recurrenceInterval,
      sendHour,
      sendMinute,
      from: startDt.toJSDate(),
      startAt,
      anchorDay,
      anchorWeekday: targetWeekday,
    });
  }

  if (recurrence === 'monthly') {
    const targetDay = anchorDay || startDt.day;
    const clampedDay = Math.min(targetDay, startDt.daysInMonth);
    const candidate = startDt.set({ day: clampedDay, hour, minute, second: 0, millisecond: 0 });
    if (candidate >= startDt) {
      return candidate.toJSDate();
    }
    return computeNextRunAt({
      recurrence,
      recurrenceInterval,
      sendHour,
      sendMinute,
      from: startDt.toJSDate(),
      startAt,
      anchorDay: targetDay,
    });
  }

  return null;
}

/**
 * Format date as 'YYYY-MM-DD HH:mm' in Africa/Cairo zone.
 *
 * @param {Date|string} date
 * @returns {string}
 */
function describeNextRun(date) {
  if (!date) return '';
  const dt = DateTime.fromJSDate(date instanceof Date ? date : new Date(date), { zone: ZONE });
  if (!dt.isValid) return '';
  return dt.toFormat('yyyy-MM-dd HH:mm');
}

module.exports = {
  ZONE,
  computeNextRunAt,
  computeFirstRunAt,
  describeNextRun,
};
