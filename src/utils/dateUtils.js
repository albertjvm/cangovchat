export const getDateKey = (value = '') => {
    const normalizedValue = String(value || '').trim();
    if (!normalizedValue) {
        return '';
    }

    const parsed = new Date(normalizedValue.replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return parsed.toISOString().slice(0, 10);
};

export const getMeetingDates = (speeches = []) => {
    const dateSet = new Set();

    speeches.forEach((speech) => {
        const dateKey = getDateKey(speech?.time);
        if (dateKey) {
            dateSet.add(dateKey);
        }
    });

    return Array.from(dateSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
};

export const formatDisplayDate = (dateKey = '') => {
    if (!dateKey) {
        return '';
    }

    const parsed = new Date(`${dateKey}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return dateKey;
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
};

export const formatShortDate = (dateKey = '') => {
    if (!dateKey) {
        return '';
    }

    const parsed = new Date(`${dateKey}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return dateKey;
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(parsed);
};
