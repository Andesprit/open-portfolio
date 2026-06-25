import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'forest-light' | 'ocean-light' |'sunset-light' | 'forest-dark' | 'ocean-dark' | 'sunset-dark';
export const availableThemes: Theme[] = ['light', 'dark', 'forest-light', 'ocean-light', 'sunset-light', 'forest-dark', 'ocean-dark', 'sunset-dark'];
const defaultTheme: Theme = 'light';

export const themeLoading = writable(true);

// Theme storage interface
interface ThemeStorage {
    userPreference: Theme;
    portfolioBaseTheme: string;
    portfolioJsonTheme: Theme;
}

// Helper function to get theme storage
function getThemeStorage(): ThemeStorage | null {
    if (typeof window === 'undefined') return null;
    
    try {
        const stored = localStorage.getItem('theme-data');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

// Helper function to save theme storage
function saveThemeStorage(data: ThemeStorage): void {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem('theme-data', JSON.stringify(data));
    } catch {
        // Handle localStorage errors gracefully
    }
}

// Helper function to migrate old localStorage format
function migrateOldStorage(): ThemeStorage | null {
    if (typeof window === 'undefined') return null;
    
    const oldUserTheme = localStorage.getItem('user-theme-preference');
    const oldBaseTheme = localStorage.getItem('portfolio-base-theme');
    const oldJsonTheme = localStorage.getItem('portfolio-json-theme');
    
    if (oldUserTheme || oldBaseTheme || oldJsonTheme) {
        const migrated: ThemeStorage = {
            userPreference: (oldUserTheme as Theme) || defaultTheme,
            portfolioBaseTheme: oldBaseTheme || 'light',
            portfolioJsonTheme: (oldJsonTheme as Theme) || defaultTheme
        };
        
        // Save migrated data
        saveThemeStorage(migrated);
        
        // Clean up old keys
        localStorage.removeItem('user-theme-preference');
        localStorage.removeItem('portfolio-base-theme');
        localStorage.removeItem('portfolio-json-theme');
        
        return migrated;
    }
    
    return null;
}

function isValidTheme(themeName: any): themeName is Theme {
    return typeof themeName === 'string' && availableThemes.includes(themeName as Theme);
}

// Helper function to get base theme name (without -dark suffix)
function getBaseTheme(themeName: Theme): string {
    if (themeName.endsWith('-dark')) {
        return themeName.slice(0, -5) + '-light';
    }
    if (themeName === 'dark') {
        return 'light';
    }
    return themeName;
}

// Helper function to check if theme is dark variant
function isDarkTheme(themeName: Theme): boolean {
    return themeName === 'dark' || themeName.endsWith('-dark');
}

// Helper function to apply dark variant to base theme
function applyDarkVariant(baseTheme: string, shouldBeDark: boolean): Theme {
    if (baseTheme === 'light') {
        return shouldBeDark ? 'dark' : 'light';
    }
    if (baseTheme.endsWith('-light')) {
        const baseName = baseTheme.slice(0, -6); // Remove '-light'
        return shouldBeDark ? `${baseName}-dark` as Theme : baseTheme as Theme;
    }
    return baseTheme as Theme;
}

export function initializeTheme(portfolioTheme: Theme, overrideUserPreference: boolean = false): Theme {
    if (typeof window === 'undefined') return portfolioTheme;
    
    // Try to get existing storage or migrate from old format
    let themeStorage = getThemeStorage() || migrateOldStorage();
    
    const currentBaseTheme = getBaseTheme(portfolioTheme);
    
    if (themeStorage) {
        // Check if the JSON theme has changed (different from what we saved)
        const jsonThemeChanged = themeStorage.portfolioJsonTheme !== portfolioTheme;
        
        // Check if portfolio base theme changed or JSON theme changed or explicit override
        if (themeStorage.portfolioBaseTheme !== currentBaseTheme || overrideUserPreference || jsonThemeChanged) {
            if (overrideUserPreference || jsonThemeChanged) {
                // JSON theme changed or explicit override - use exact theme from JSON
                const newStorage: ThemeStorage = {
                    userPreference: portfolioTheme,
                    portfolioBaseTheme: currentBaseTheme,
                    portfolioJsonTheme: portfolioTheme
                };
                saveThemeStorage(newStorage);
                return portfolioTheme;
            } else {
                // Portfolio theme changed - apply new base theme but keep dark/light preference
                const wasDark = isDarkTheme(themeStorage.userPreference);
                const newTheme = applyDarkVariant(currentBaseTheme, wasDark);
                
                // Update storage with new base theme
                const newStorage: ThemeStorage = {
                    userPreference: newTheme,
                    portfolioBaseTheme: currentBaseTheme,
                    portfolioJsonTheme: portfolioTheme
                };
                saveThemeStorage(newStorage);
                
                return newTheme;
            }
        } else {
            // Portfolio theme hasn't changed - use saved preference
            return themeStorage.userPreference;
        }
    } else {
        // First time visit - save initial values
        const newStorage: ThemeStorage = {
            userPreference: portfolioTheme,
            portfolioBaseTheme: currentBaseTheme,
            portfolioJsonTheme: portfolioTheme
        };
        saveThemeStorage(newStorage);
        return portfolioTheme;
    }
}

// Update theme store creation
function createThemeStore() {
    // Start with the theme that should already be applied by the blocking script
    const initialTheme = browser ? 
        (getThemeStorage()?.userPreference || 'light') : 
        'light';
    
    const { subscribe, set, update } = writable<Theme>(initialTheme);
    
    return {
        subscribe,
        set: (value: Theme) => {
            if (browser) {
                const currentStorage = getThemeStorage();
                const newStorage: ThemeStorage = {
                    userPreference: value,
                    portfolioBaseTheme: currentStorage?.portfolioBaseTheme || getBaseTheme(value),
                    portfolioJsonTheme: currentStorage?.portfolioJsonTheme || value
                };
                saveThemeStorage(newStorage);
                
                // Update DOM classes - add null checks
                if (document.documentElement && document.body) {
                    availableThemes.forEach(t => {
                        document.documentElement.classList.remove(`theme-${t}`);
                        document.body.classList.remove(`theme-${t}`);
                    });
                    document.documentElement.classList.add(`theme-${value}`);
                    document.body.classList.add(`theme-${value}`);
                }
            }
            set(value);
        },
        update,
        init: (portfolioTheme: Theme, overrideUserPreference: boolean = false) => {
            // Theme should already be applied by blocking script
            // Just sync the store with what's already applied
            const currentTheme = browser ? 
                initializeTheme(portfolioTheme, overrideUserPreference) : 
                portfolioTheme;
            set(currentTheme);
            themeLoading.set(false);
        }
    };
}

export const theme = createThemeStore();

export function getThemeToggle(currentTheme: Theme): Theme {
    // Handle the basic light/dark toggle
    if (currentTheme === 'light') return 'dark';
    if (currentTheme === 'dark') return 'light';
    
    // Handle themed variants
    if (currentTheme.endsWith('-dark')) {
        // Remove '-dark' suffix and add '-light' suffix to get light variant
        const baseName = currentTheme.slice(0, -5);
        return `${baseName}-light` as Theme;
    } else if (currentTheme.endsWith('-light')) {
        // Remove '-light' suffix and add '-dark' suffix to get dark variant
        const baseName = currentTheme.slice(0, -6);
        return `${baseName}-dark` as Theme;
    }
    
    // Fallback (shouldn't reach here with the new naming convention)
    return currentTheme;
}