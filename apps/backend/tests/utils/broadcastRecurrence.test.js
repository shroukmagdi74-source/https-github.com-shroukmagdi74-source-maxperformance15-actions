const { DateTime } = require('luxon');
const {
  ZONE,
  computeNextRunAt,
  computeFirstRunAt,
  describeNextRun,
} = require('../../utils/broadcastRecurrence');

describe('broadcastRecurrence', () => {
  describe('none recurrence', () => {
    it('returns null when recurrence is none or falsy', () => {
      expect(computeNextRunAt({ recurrence: 'none' })).toBeNull();
      expect(computeNextRunAt({ recurrence: '' })).toBeNull();
      expect(computeNextRunAt({})).toBeNull();
      expect(computeFirstRunAt({ recurrence: 'none' })).toBeNull();
    });
  });

  describe('Cairo wall clock honoured', () => {
    it('anchors on Cairo wall clock (19:00 Cairo is not 19:00 UTC)', () => {
      // 15 Jan 2026 10:00 Cairo
      const from = DateTime.fromISO('2026-01-15T10:00:00', { zone: ZONE }).toJSDate();
      const nextRun = computeNextRunAt({
        recurrence: 'daily',
        recurrenceInterval: 1,
        sendHour: 19,
        sendMinute: 0,
        from,
      });

      expect(nextRun).not.toBeNull();
      const dtCairo = DateTime.fromJSDate(nextRun, { zone: ZONE });
      const dtUtc = DateTime.fromJSDate(nextRun, { zone: 'utc' });

      // In Cairo, it must be 19:00
      expect(dtCairo.hour).toBe(19);
      expect(dtCairo.minute).toBe(0);

      // In UTC, Cairo is UTC+2 in January, so 19:00 Cairo is 17:00 UTC (NOT 19:00 UTC)
      expect(dtUtc.hour).toBe(17);
      expect(dtUtc.hour).not.toBe(19);
    });
  });

  describe('daily recurrence with recurrenceInterval 2', () => {
    it('steps by 2 days strictly after from', () => {
      const from = DateTime.fromISO('2026-01-10T19:30:00', { zone: ZONE }).toJSDate();
      const nextRun = computeNextRunAt({
        recurrence: 'daily',
        recurrenceInterval: 2,
        sendHour: 19,
        sendMinute: 30,
        from,
      });

      expect(nextRun).not.toBeNull();
      const dtCairo = DateTime.fromJSDate(nextRun, { zone: ZONE });
      expect(dtCairo.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-01-12 19:30');
    });
  });

  describe('weekly recurrence with recurrenceInterval 2', () => {
    it('steps by 2 weeks on the same weekday strictly after from', () => {
      // 2026-01-06 is a Tuesday
      const startAt = DateTime.fromISO('2026-01-06T19:00:00', { zone: ZONE }).toJSDate();
      const from = DateTime.fromISO('2026-01-06T19:00:00', { zone: ZONE }).toJSDate();

      const nextRun = computeNextRunAt({
        recurrence: 'weekly',
        recurrenceInterval: 2,
        sendHour: 19,
        sendMinute: 0,
        startAt,
        from,
      });

      expect(nextRun).not.toBeNull();
      const dtCairo = DateTime.fromJSDate(nextRun, { zone: ZONE });
      expect(dtCairo.weekday).toBe(2); // Tuesday
      // 2 weeks after Jan 6 is Jan 20
      expect(dtCairo.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-01-20 19:00');
    });
  });

  describe('monthly recurrence with recurrenceInterval 2', () => {
    it('steps by 2 months preserving anchor day', () => {
      const from = DateTime.fromISO('2026-01-15T19:00:00', { zone: ZONE }).toJSDate();
      const nextRun = computeNextRunAt({
        recurrence: 'monthly',
        recurrenceInterval: 2,
        sendHour: 19,
        sendMinute: 0,
        from,
      });

      expect(nextRun).not.toBeNull();
      const dtCairo = DateTime.fromJSDate(nextRun, { zone: ZONE });
      expect(dtCairo.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-03-15 19:00');
    });
  });

  describe('monthly clamp without drift (31 Jan -> 28 Feb -> 31 Mar)', () => {
    it('clamps 31 Jan to 28 Feb (non-leap 2026) and restores 31 Mar without drift', () => {
      const startAt = DateTime.fromISO('2026-01-31T19:00:00', { zone: ZONE }).toJSDate();
      const jan31 = startAt;

      // 1st step: Jan 31 -> Feb 28
      const febRun = computeNextRunAt({
        recurrence: 'monthly',
        recurrenceInterval: 1,
        sendHour: 19,
        sendMinute: 0,
        from: jan31,
        startAt,
        anchorDay: 31,
      });

      expect(febRun).not.toBeNull();
      const dtFeb = DateTime.fromJSDate(febRun, { zone: ZONE });
      expect(dtFeb.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-02-28 19:00');
      expect(dtFeb.day).toBe(28);

      // 2nd step: Feb 28 -> Mar 31 (anchor day 31 preserved)
      const marRun = computeNextRunAt({
        recurrence: 'monthly',
        recurrenceInterval: 1,
        sendHour: 19,
        sendMinute: 0,
        from: febRun,
        startAt,
        anchorDay: 31,
      });

      expect(marRun).not.toBeNull();
      const dtMar = DateTime.fromJSDate(marRun, { zone: ZONE });
      expect(dtMar.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-03-31 19:00');
      expect(dtMar.day).toBe(31);
    });
  });

  describe('DST stability', () => {
    it('crossing last Friday of April changes UTC offset but keeps Cairo local hour stable', () => {
      // In 2026, April 24 is the last Friday (DST transition in Egypt: UTC+2 -> UTC+3)
      const preDst = DateTime.fromISO('2026-04-20T19:00:00', { zone: ZONE }).toJSDate();
      const nextRun = computeNextRunAt({
        recurrence: 'daily',
        recurrenceInterval: 7, // 7 days later: 2026-04-27 (post-DST)
        sendHour: 19,
        sendMinute: 0,
        from: preDst,
      });

      expect(nextRun).not.toBeNull();
      const dtPre = DateTime.fromJSDate(preDst, { zone: ZONE });
      const dtPost = DateTime.fromJSDate(nextRun, { zone: ZONE });

      // Local hour remains 19:00
      expect(dtPre.hour).toBe(19);
      expect(dtPost.hour).toBe(19);

      // UTC offset changed from +2 to +3
      expect(dtPre.offset / 60).toBe(2);
      expect(dtPost.offset / 60).toBe(3);

      // UTC hours differ: 17:00 UTC vs 16:00 UTC
      expect(dtPre.toUTC().hour).toBe(17);
      expect(dtPost.toUTC().hour).toBe(16);
    });

    it('crossing last Thursday of October changes UTC offset but keeps Cairo local hour stable', () => {
      // In 2026, October 29 is the last Thursday (DST ends: UTC+3 -> UTC+2)
      const preEndDst = DateTime.fromISO('2026-10-26T19:00:00', { zone: ZONE }).toJSDate();
      const nextRun = computeNextRunAt({
        recurrence: 'daily',
        recurrenceInterval: 7, // 7 days later: 2026-11-02 (standard time)
        sendHour: 19,
        sendMinute: 0,
        from: preEndDst,
      });

      expect(nextRun).not.toBeNull();
      const dtPre = DateTime.fromJSDate(preEndDst, { zone: ZONE });
      const dtPost = DateTime.fromJSDate(nextRun, { zone: ZONE });

      expect(dtPre.hour).toBe(19);
      expect(dtPost.hour).toBe(19);

      expect(dtPre.offset / 60).toBe(3);
      expect(dtPost.offset / 60).toBe(2);
    });
  });

  describe('describeNextRun', () => {
    it('formats accurately in Cairo time', () => {
      const date = DateTime.fromISO('2026-05-10T14:30:00Z').toJSDate(); // 14:30 UTC = 17:30 Cairo (UTC+3 in May)
      expect(describeNextRun(date)).toBe('2026-05-10 17:30');
    });

    it('returns empty string on null or invalid input', () => {
      expect(describeNextRun(null)).toBe('');
      expect(describeNextRun(undefined)).toBe('');
    });
  });
});
