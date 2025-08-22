import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: ThemeMode;
  fontFamily: string;
  setTheme: (mode: ThemeMode) => void;
  setFontFamily: (font: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const resolved: 'light' | 'dark' = mode === 'auto'
    ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  root.setAttribute('data-theme', resolved);
  
  // Apply theme globally to ensure consistency
  document.body.setAttribute('data-theme', resolved);
}

function applyFont(fontFamily: string) {
  const root = document.documentElement;
  root.style.setProperty('--app-font', fontFamily);
  document.body.style.fontFamily = fontFamily;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => (localStorage.getItem('app_theme') as ThemeMode) || 'light');
  const [fontFamily, setFontFamilyState] = useState<string>(() => localStorage.getItem('app_font') || 'Inter, ui-sans-serif, system-ui');

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    applyFont(fontFamily);
    localStorage.setItem('app_font', fontFamily);
  }, [fontFamily]);

  const value = useMemo<ThemeContextType>(() => ({
    theme,
    fontFamily,
    setTheme: setThemeState,
    setFontFamily: setFontFamilyState,
  }), [theme, fontFamily]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}


