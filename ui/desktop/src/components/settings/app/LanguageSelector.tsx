import { useLanguage } from '../../../contexts/LanguageContext';
import { Language } from '../../../locales';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

export default function LanguageSelector() {
  const { language, setLanguage, t, availableLanguages } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-0">
        <CardTitle className="mb-1">{t.settings.language.title}</CardTitle>
        <CardDescription>{t.settings.language.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 px-4">
        <div className="flex gap-3">
          {(Object.keys(availableLanguages) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all duration-200
                ${
                  language === lang
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border-default hover:border-border-strong text-text-default hover:bg-background-default'
                }
              `}
            >
              {availableLanguages[lang].nativeName}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
