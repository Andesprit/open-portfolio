/**
 * Utility functions for sorting items by date
 */

/**
 * Parse a date string into a comparable format
 * Handles various date formats including:
 * - "2021 - Present" -> extracts start year
 * - "may 2020" -> parses month/year
 * - "01/06/2022" -> parses full date
 * - "2013 - 2015" -> extracts start year
 */
function parseDate(dateStr: string): Date {
    if (!dateStr) return new Date(0); // fallback for missing dates
    
    const str = dateStr.toLowerCase().trim();
    
    // Handle "Present" cases - use current date
    if (str.includes('present')) {
        return new Date();
    }
    
    // Handle year ranges like "2021 - 2023" or "2013 - 2015"
    const yearRangeMatch = str.match(/(\d{4})\s*-\s*(\d{4}|\w+)/);
    if (yearRangeMatch) {
        const startYear = parseInt(yearRangeMatch[1]);
        return new Date(startYear, 0, 1);
    }
    
    // Handle single years like "2020"
    const singleYearMatch = str.match(/^\d{4}$/);
    if (singleYearMatch) {
        return new Date(parseInt(str), 0, 1);
    }
    
    // Handle month/year format like "may 2020" or "june 2019"
    const monthYearMatch = str.match(/(\w+)\s+(\d{4})/);
    if (monthYearMatch) {
        const month = monthYearMatch[1];
        const year = parseInt(monthYearMatch[2]);
        const monthNum = getMonthNumber(month);
        return new Date(year, monthNum, 1);
    }
    
    // Handle MM/DD/YYYY or DD/MM/YYYY format
    const dateMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dateMatch) {
        const part1 = parseInt(dateMatch[1]);
        const part2 = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);
        // Assume MM/DD/YYYY format
        return new Date(year, part1 - 1, part2);
    }
    
    // Try to parse with Date constructor as fallback
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/**
 * Convert month name to number (0-based for Date constructor)
 */
function getMonthNumber(monthName: string): number {
    const months: { [key: string]: number } = {
        january: 0, jan: 0,
        february: 1, feb: 1,
        march: 2, mar: 2,
        april: 3, apr: 3,
        may: 4,
        june: 5, jun: 5,
        july: 6, jul: 6,
        august: 7, aug: 7,
        september: 8, sep: 8,
        october: 9, oct: 9,
        november: 10, nov: 10,
        december: 11, dec: 11
    };
    
    return months[monthName.toLowerCase()] || 0;
}

/**
 * Check if an item has a date field
 */
function hasDateField(item: any): boolean {
    return item && typeof item.date === 'string' && item.date.trim() !== '';
}

/**
 * Sort an array of items by date in descending order (newest first)
 * Only sorts if the items have date fields
 * @param items - Array of items to sort
 * @returns Sorted array (or original array if no date fields found)
 */
export function sortItemsByDate(items: any[]): any[] {
    if (!items || items.length === 0) {
        return items;
    }
    
    // Check if any items have date fields
    const hasAnyDates = items.some(hasDateField);
    if (!hasAnyDates) {
        return items; // Return original order if no dates found
    }
    
    // Sort by date (newest first)
    return [...items].sort((a, b) => {
        const dateA = hasDateField(a) ? parseDate(a.date) : new Date(0);
        const dateB = hasDateField(b) ? parseDate(b.date) : new Date(0);
        
        return dateB.getTime() - dateA.getTime(); // Descending order
    });
}

/**
 * Check if a section should be sorted by date
 * Only applies to sections that have content with date fields
 */
export function shouldSortSectionByDate(section: any): boolean {
    if (!section || !section.content || !Array.isArray(section.content)) {
        return false;
    }
    
    return section.content.some(hasDateField);
} 


// sort the items by order and date
export const sortByOrderAndDate = (a: any , b: any ) => {
    const orderA = a.metadata.display_order ?? Infinity;
    const orderB = b.metadata.display_order ?? Infinity;

    // Primary sort: by order number
    if (orderA !== orderB) {
        return orderA - orderB;
    }

    // Secondary sort: by date (descending)
    const dateA = a.metadata.date ? new Date(a.metadata.date).getTime() : 0;
    const dateB = b.metadata.date ? new Date(b.metadata.date).getTime() : 0;

    // Handle potential invalid dates
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA; // Descending date order
};