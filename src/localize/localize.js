import * as en from './languages/en.json';

const languages = {
  en,
  de,
};

const DEFAULT_LANG = 'en';

export default function setupTranslations(hass) {
  const lang = hass.locale.language || DEFAULT_LANG;
  const hassObject = hass;
  const resources = hassObject.resources[hass.locale.language];
  const languageObject = languages[lang] || languages[DEFAULT_LANG];

  Object.entries(languageObject).forEach(([key, value]) => {
    if (key !== 'default') {
      resources[`ui.panel.lovelace.editor.card.mgc.${key}`] = value;
    }
  });
}

export { setupTranslations };
