import React, { createContext, useContext } from 'react';
import { DEFAULT_THEME_ID, THEMES } from './themes';
import { Theme, ThemeId } from './tokens';

const ThemeContext = createContext<Theme>(THEMES[DEFAULT_THEME_ID]);

export function ThemeProvider({ themeId, children }: { themeId: ThemeId; children: React.ReactNode }) {
  return <ThemeContext.Provider value={THEMES[themeId]}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): Theme => useContext(ThemeContext);
