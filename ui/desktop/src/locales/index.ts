import en from './en.json';
import ja from './ja.json';

export type Language = 'ja' | 'en';

export const languages: Record<Language, { name: string; nativeName: string }> = {
  ja: { name: 'Japanese', nativeName: '日本語' },
  en: { name: 'English', nativeName: 'English' },
};

export const translations: Record<Language, typeof ja> = {
  ja,
  en,
};

export type Translations = typeof ja;

export { en, ja };
