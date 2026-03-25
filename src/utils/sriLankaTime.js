/**
 * Display DB / API timestamps in Sri Lanka standard time (UTC+5:30, Asia/Colombo).
 */
export const ASIA_COLOMBO = 'Asia/Colombo';

const safeDate = (value) => {
    if (value == null || value === '') return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
};

/** Full date + time in Sri Lanka (e.g. booking time, payment time). */
export function formatDateTimeLK(value, options = {}) {
    const d = safeDate(value);
    if (!d) return '—';
    return d.toLocaleString('en-GB', {
        timeZone: ASIA_COLOMBO,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        ...options
    });
}

/** Date only (calendar day in Colombo) for an instant. */
export function formatDateInstantLK(value, options = {}) {
    const d = safeDate(value);
    if (!d) return '—';
    return d.toLocaleDateString('en-GB', {
        timeZone: ASIA_COLOMBO,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    });
}

/** Time only for an instant, in Colombo. */
export function formatTimeInstantLK(value, options = {}) {
    const d = safeDate(value);
    if (!d) return '—';
    return d.toLocaleTimeString('en-GB', {
        timeZone: ASIA_COLOMBO,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        ...options
    });
}

/** Medium date + short time (cashier lists, etc.). */
export function formatMediumDateTimeLK(value) {
    const d = safeDate(value);
    if (!d) return '—';
    return d.toLocaleString('en-GB', {
        timeZone: ASIA_COLOMBO,
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

/** Medium date only in Colombo. */
export function formatMediumDateLK(value) {
    const d = safeDate(value);
    if (!d) return '—';
    return d.toLocaleDateString('en-GB', {
        timeZone: ASIA_COLOMBO,
        dateStyle: 'medium'
    });
}

/**
 * Schedule calendar date (YYYY-MM-DD from DB) shown as that day in Sri Lanka
 * (avoids UTC midnight shifting the displayed day).
 */
export function formatScheduleDateLK(dateValue) {
    if (dateValue == null || dateValue === '') return '—';
    const str = String(dateValue);
    const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) {
        const d = safeDate(dateValue);
        return d ? formatDateInstantLK(d) : '—';
    }
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    const d = new Date(Date.UTC(y, mo, day, 6, 30, 0));
    return d.toLocaleDateString('en-GB', {
        timeZone: ASIA_COLOMBO,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/** MySQL TIME / wall-clock slot time (same numbers as in Sri Lanka schedules). */
export function formatWallTime12(timeValue) {
    if (timeValue == null || timeValue === '') return '—';
    const str = String(timeValue).trim();
    const timeMatch = str.match(/^(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
        const d = safeDate(str);
        return d ? formatTimeInstantLK(d) : '—';
    }
    let h = parseInt(timeMatch[1], 10);
    const min = parseInt(timeMatch[2], 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(min).padStart(2, '0')} ${ampm}`;
}
