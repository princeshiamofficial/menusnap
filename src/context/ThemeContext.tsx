
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useLayoutEffect } from 'react';

type Theme = 'default' | 'parlour';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('default');

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-default', 'theme-parlour'); 
    if (theme === 'parlour') {
      root.classList.add('theme-parlour');
    } else {
      root.classList.add('theme-default');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
