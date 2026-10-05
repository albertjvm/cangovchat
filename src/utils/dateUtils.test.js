import { formatDisplayDate, getMeetingDates } from './dateUtils';

describe('dateUtils', () => {
    test('collects unique parliamentary session dates in reverse chronological order', () => {
        const dates = getMeetingDates([
            { time: '2026-01-02 09:00:00' },
            { time: '2026-01-01 12:00:00' },
            { time: '2026-01-02 14:00:00' },
            { time: '2025-12-31 17:00:00' },
        ]);

        expect(dates).toEqual(['2026-01-02', '2026-01-01', '2025-12-31']);
    });

    test('formats a day key for a prominent sticky date label', () => {
        expect(formatDisplayDate('2026-01-02')).toBe('Jan 2, 2026');
    });
});
