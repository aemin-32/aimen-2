
/**
 * 🕰️ SAFE DATE PARSER
 * Ensures we don't crash on invalid date values.
 */
export const safeDate = (dateVal: string | number | Date | null | undefined): Date => {
    if (!dateVal) return new Date();
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    return isNaN(d.getTime()) ? new Date() : d;
};

/**
 * Formats a date reliably for UI headers.
 */
export const formatHeaderDate = (date: Date, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string => {
    try {
        return date.toLocaleDateString(undefined, options);
    } catch (e) {
        console.error("Date formatting error:", e);
        return "Invalid Date";
    }
};

/**
 * Adds days to a date safely.
 */
export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
