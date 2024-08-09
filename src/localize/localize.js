import * as en from './languages/en.json';

const languages = {
  en,
};

const DEFAULT_LANG = 'en';

function getTranslatedString(key, lang) {
  try {
    return key.split('.').reduce((o, i) => o[i], languages[lang]);
  } catch (_) {
    return undefined;
  }
}

export default function localize(key, hass) {
  const lang = hass.locale.language || DEFAULT_LANG;

  let translated = getTranslatedString(key, lang);
  if (!translated) {
    translated = getTranslatedString(key, DEFAULT_LANG);
  }
  return translated || key;
}

export { localize };
