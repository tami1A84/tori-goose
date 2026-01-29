import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Language, languages, translations, Translations } from '../locales';

// デフォルト言語を日本語に設定
const DEFAULT_LANGUAGE: Language = 'ja';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  availableLanguages: typeof languages;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function loadLanguagePreference(): Language {
  const savedLanguage = localStorage.getItem('app_language');
  if (savedLanguage === 'en' || savedLanguage === 'ja') {
    return savedLanguage;
  }
  // デフォルトは日本語
  return DEFAULT_LANGUAGE;
}

function saveLanguagePreference(language: Language): void {
  localStorage.setItem('app_language', language);
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(loadLanguagePreference);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguagePreference(lang);

    // Broadcast to other windows via Electron if available
    if (window.electron?.broadcastLanguageChange) {
      window.electron.broadcastLanguageChange({ language: lang });
    }
  }, []);

  // Listen for language changes from other windows (via Electron IPC)
  useEffect(() => {
    if (!window.electron) return;

    const handleLanguageChanged = (_event: unknown, ...args: unknown[]) => {
      const languageData = args[0] as { language: Language };
      if (languageData.language && (languageData.language === 'en' || languageData.language === 'ja')) {
        setLanguageState(languageData.language);
        saveLanguagePreference(languageData.language);
      }
    };

    if (window.electron.on) {
      window.electron.on('language-changed', handleLanguageChanged);
      return () => {
        if (window.electron.off) {
          window.electron.off('language-changed', handleLanguageChanged);
        }
      };
    }
  }, []);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: translations[language],
    availableLanguages: languages,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// 言語コンテキストなしでも翻訳を取得できるヘルパー関数
export function getTranslations(language?: Language): Translations {
  const lang = language || loadLanguagePreference();
  return translations[lang];
}
