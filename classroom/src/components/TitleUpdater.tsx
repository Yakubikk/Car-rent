import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// This component will update the document title based on the current language
const TitleUpdater = () => {
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    // Update document title when language changes
    const title = document.querySelector('title');
    if (title && title.dataset.i18n) {
      title.textContent = t(title.dataset.i18n);
    }
  }, [i18n.language, t]);
  
  return null; // This is a utility component that doesn't render anything
};

export default TitleUpdater;
