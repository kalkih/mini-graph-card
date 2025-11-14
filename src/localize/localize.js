import * as en from './languages/en.json';
import * as de from './languages/de.json';

const languages = {
  en,
  de,
};

const DEFAULT_LANG = 'en';

function processTranslations(obj) {
  let keys = [];
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      const subKeys = processTranslations(obj[key]);
      keys = keys.concat(subKeys.map(subkey => `${key}.${subkey}`));
    } else {
      keys.push(key);
    }
  });
  return keys;
}

export default function setupTranslations(hass) {
  const lang = hass.locale.language || DEFAULT_LANG;
  const hassObject = hass;
  const resources = hassObject.resources[hass.locale.language];
  const languageObject = languages[lang] || languages[DEFAULT_LANG];

  const keys = processTranslations(languageObject);

  keys.forEach((key) => {
    if (!key.startsWith('default')) {
      const nestedKeys = key.split('.');
      const value = nestedKeys.reduce((a, c) => a[c], languageObject);

      if (value) {
        resources[`ui.panel.lovelace.editor.card.mgc.${key}`] = value;
      }
    }
  });
}

export { setupTranslations };
