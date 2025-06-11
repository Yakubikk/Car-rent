import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  // Keep local state in sync with i18n language
  useEffect(() => {
    setSelectedLang(i18n.language);
  }, [i18n.language]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'be', name: 'Беларуская' },
    { code: 'zh', name: '中文' }
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setSelectedLang(langCode);
  };

  return (
    <div className="language-selector">
      <label htmlFor="language-select">{t('changeLanguage')}: </label>
      <select 
        id="language-select"
        value={selectedLang}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
