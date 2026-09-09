import { log } from './utils';
import { NBSP } from './const';

/**
 * HA Frontend time format settings
 */
const TimeFormat = Object.freeze({
  language: 'language',
  system: 'system',
  am_pm: '12',
  twenty_four: '24',
});

/**
 * HA Frontend number format settings
 */
const NumberFormat = Object.freeze({
  language: 'language',
  system: 'system',
  comma_decimal: 'comma_decimal',
  decimal_comma: 'decimal_comma',
  quote_decimal: 'quote_decimal',
  space_comma: 'space_comma',
  none: 'none',
});

/**
 * HA Frontend time zone settings - whether to use a server time zone or a local one
 */
const TimeZone = Object.freeze({
  local: 'local',
  server: 'server',
});

/**
 * HA Frontend date format settings
 */
const DateFormat = Object.freeze({
  language: 'language',
  system: 'system',
  DMY: 'DMY',
  MDY: 'MDY',
  YMD: 'YMD',
});

/* This is provided to understand a structure of FrontendLocaleData type
export enum FirstWeekday {
  language = 'language',
  monday = 'monday',
  tuesday = 'tuesday',
  wednesday = 'wednesday',
  thursday = 'thursday',
  friday = 'friday',
  saturday = 'saturday',
  sunday = 'sunday',
}

export interface FrontendLocaleData {
  language: string;
  number_format: NumberFormat;
  time_format: TimeFormat;
  date_format: DateFormat;
  first_weekday: FirstWeekday;
  time_zone: TimeZone;
}
*/

/**
 * Get "24h/12h" hour format dependently on a possibly defined corresponding card config option,
 * fallback to HA Frontend settings
 * @param {object} localeOptions Object containing a user-selected language and formatting settings
 * @param {boolean|undefined} hour24 Card config option to set a format explicitly
 * @returns {boolean} true: "12h" format, false: "24h" format
 */
const useAmPm = (localeOptions, hour24) => {
  if (hour24 !== undefined) {
    // return the explicitly defined hour24 flag
    return !hour24;
  }
  if (!localeOptions) {
    // safe fallback
    return false;
  }
  if ([TimeFormat.language, TimeFormat.system].includes(localeOptions.time_format)) {
    const testLanguage = localeOptions.time_format === TimeFormat.language
      ? localeOptions.language
      : undefined;

    // check for some languages
    let isHour12 = false;
    try {
      isHour12 = Intl.DateTimeFormat(testLanguage).resolvedOptions().hour12 === true;
    } catch (e) {
      log('useAmPm(): error');
    }

    // try testing a "Date" object
    const testTime = new Date('2020-01-01T22:00:00Z').toLocaleString(
      testLanguage,
      { timeZone: 'UTC' },
    );

    return testTime.includes('10') || /[a-z]/i.test(testTime) || isHour12;
  }
  // use an explicitly defined flag in HA Frontend settings
  return localeOptions.time_format === TimeFormat.am_pm;
};

/**
 * Returns a time zone based on a user profile option.
 * Server time zone is used when a local one cannot be determined
 * @param {TimeZone} option Which time zone to use - server or local
 * @param {string} serverTimeZone Server time zone
 * @returns {string} Resolved time zone
 */
const resolveTimeZone = (option, serverTimeZone) => {
  // attempting to determine a browser time zone from Intl
  const browserTimeZone = (typeof Intl !== 'undefined'
    && Intl.DateTimeFormat
    && Intl.DateTimeFormat().resolvedOptions)
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : null;
  const timeZone = (option === TimeZone.local)
    ? browserTimeZone || serverTimeZone || 'UTC'
    : serverTimeZone || browserTimeZone || 'UTC';
  return timeZone;
};

/**
 * Get date formatting options
 * @param {object} config Card config
 * @param {object} datetimeFormatFromCfgParsed Parsed datetime format taken from config
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {Intl.DateTimeFormatOptions} Date format
 */
const getDateFormat = (config, datetimeFormatFromCfgParsed, hass) => {
  const { hours_to_show, datetime_format } = config;

  if (hours_to_show === undefined || hours_to_show <= 24) {
    return {};
  }

  const localeOptions = hass.locale; // FrontendLocaleData object
  const serverTimeZone = hass.config.time_zone; // Server time zone
  const timeZone = resolveTimeZone(localeOptions.time_zone, serverTimeZone);

  let dateOptions;

  if (!datetime_format) {
    // follow global HA Frontend settings
    dateOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
  } else {
    // use formatting settings from a card config
    // eslint-disable-next-line no-lonely-if
    if (datetimeFormatFromCfgParsed && datetimeFormatFromCfgParsed.day_weekday) {
      dateOptions = {
        day: 'numeric',
        weekday: 'short',
      };
    } else {
      dateOptions = {
        year: datetimeFormatFromCfgParsed && datetimeFormatFromCfgParsed.year_2digit
          ? '2-digit' : 'numeric',
        month: datetimeFormatFromCfgParsed && datetimeFormatFromCfgParsed.month_2digit
          ? '2-digit' : 'numeric',
        day: datetimeFormatFromCfgParsed && datetimeFormatFromCfgParsed.day_2digit
          ? '2-digit' : 'numeric',
      };
    }
  }

  const options = { timeZone, ...dateOptions };
  return options;
};

/**
 * Get time formatting options
 * @param {object} config Card config
 * @param {object} datetimeFormatFromCfgParsed Parsed datetime format taken from config
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {Intl.DateTimeFormatOptions} Time formatting options
 */
const getTimeFormat = (config, datetimeFormatFromCfgParsed, hass) => {
  const localeOptions = hass.locale; // FrontendLocaleData object

  const serverTimeZone = hass.config.time_zone; // Server time zone
  const timeZone = resolveTimeZone(localeOptions.time_zone, serverTimeZone);

  const { hour24 } = config;
  const valueUseAmPm = useAmPm(localeOptions, hour24);
  const hourCycle = valueUseAmPm ? 'h12' : 'h23'; // accounting possibly defined "hour12"

  let hourOption;
  const { datetime_format } = config; // user-defined datetime format
  if (!datetime_format) {
    // follow global HA Frontend settings
    hourOption = {
      hour: valueUseAmPm ? 'numeric' : '2-digit',
    };
  } else {
    // use formatting settings from a card config
    // eslint-disable-next-line no-lonely-if
    if (datetimeFormatFromCfgParsed && datetimeFormatFromCfgParsed.day_weekday) {
      hourOption = {
        hour: valueUseAmPm ? 'numeric' : '2-digit',
      };
    } else {
      hourOption = {
        hour: datetimeFormatFromCfgParsed && datetimeFormatFromCfgParsed.hour_2digit
          ? '2-digit' : 'numeric',
      };
    }
  }
  const options = {
    minute: '2-digit',
    hourCycle,
    timeZone,
    ...hourOption,
  };
  return options;
};

/**
 * Returns formatting options to represent a date & time value from config
 * @param {string} dateTimeFormat Card config option to represent a date & time value
 * @returns {object} Formatting options
 */
const parseDateTimeFormatFromCfg = (dateTimeFormat) => {
  if (!dateTimeFormat) {
    return undefined;
  }

  const regex = /^(M{1,2}|D{1,2}|Y{2,4})(\/|\.|-)(M{1,2}|D{1,2})(\/|\.|-)(M{1,2}|D{1,2}|Y{2,4}) H{1,2}:mm$/;
  /* Regex is used to check for these supported patterns:
    DD/MM/YYYY HH:mm  DD.MM.YYYY HH:mm  DD-MM-YYYY HH:mm
    MM/DD/YYYY HH:mm  MM.DD.YYYY HH:mm  MM-DD-YYYY HH:mm
    YYYY/MM/DD HH:mm  YYYY.MM.DD HH:mm  YYYY-MM-DD HH:mm
  where can be used YYYY or YY, MM or M, DD or D, HH or H.
  A singular whitespace must be used to separate date & time formats.
  Letter case does matter.
  Any values which do not match the regex - lead to a fallback to a "day weekday" format.
  */
  const trimmed = dateTimeFormat.trim();
  if (!regex.test(trimmed)) {
    // invalid datetime_format
    // fallback to a default "legacy" format
    log(`invalid datetime_format [${dateTimeFormat}], fallback to legacy 'day_weekday'`);
    return { day_weekday: true };
  }

  const year_2digit = !trimmed.includes('YYYY') && trimmed.includes('YY');
  const month_2digit = trimmed.includes('MM');
  const day_2digit = trimmed.includes('DD');
  const hour_2digit = trimmed.includes('HH');
  const date_literal = trimmed.includes('-')
    ? '-'
    : trimmed.includes('/')
      ? '/'
      : '.';
  const order = trimmed.indexOf('M') === 0
    ? DateFormat.MDY
    : trimmed.indexOf('D') === 0
      ? DateFormat.DMY
      : DateFormat.YMD;
  return {
    year_2digit,
    month_2digit,
    day_2digit,
    hour_2digit,
    date_literal,
    order,
  };
};

/**
 * Returns a formatted string for a date value based on parts,
 * explicitly defined date separator & order of date components
 * @param {array} parts Parts of a date string
 * @param {string} orderDate Order of date components (same as in DateFormat)
 * @param {string} [date_literal] Explicitly defined separator between date components
 * @returns {string} Formatted string
 */
const composeDateString = (
  parts,
  orderDate,
  date_literal,
) => {
  let dateLiteralPart = null;
  let dayPart = null;
  let monthPart = null;
  let yearPart = null;

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (!dateLiteralPart && part.type === 'literal') dateLiteralPart = part;
    else if (!dayPart && part.type === 'day') dayPart = part;
    else if (!monthPart && part.type === 'month') monthPart = part;
    else if (!yearPart && part.type === 'year') yearPart = part;
  }

  // use an explicitly defined separator or a standard separator (fallback to '.')
  const rawLiteral = date_literal || (dateLiteralPart ? dateLiteralPart.value : '.');
  // clean up possible hidden symbols in some locales & browsers
  // replace an empty result with a '.'
  const dateLiteral = rawLiteral.replace(/[\u200E\u200F\u061C]/g, '') || '.';


  const day = dayPart && dayPart.value || '';
  const month = monthPart && monthPart.value || '';
  const year = yearPart && yearPart.value || '';

  if (!day || !month || !year) {
    return '';
  }

  // Compose a date string.
  // Note: some languages have an ending literal meaning "year"; this is not accounted here
  const formats = {
    [DateFormat.DMY]: `${day}${dateLiteral}${month}${dateLiteral}${year}`,
    [DateFormat.MDY]: `${month}${dateLiteral}${day}${dateLiteral}${year}`,
    [DateFormat.YMD]: `${year}${dateLiteral}${month}${dateLiteral}${day}`,
  };
  const composed = formats[orderDate] || '';
  return composed;
};

/**
 * Returns a formatted string for a time value based on parts,
 * with a needed fix of an "hour" value
 * @param {array} parts Parts of a time string
 * @param {boolean} hour_2digit Explicitly defined '2-digit' option for an hour
 * @returns {string} Formatted string
 */
const composeTimeString = (
  parts,
  hour_2digit,
) => {
  let composed = '';
  const len = parts.length;
  for (let i = 0; i < len; i += 1) {
    const part = parts[i];
    let value = part.value || '';
    if (!hour_2digit && part.type === 'hour' && value.indexOf('0') === 0) {
      // Need to remove a leading zero sometimes even if 'numeric' was used in options.
      // This is how Intl works...
      value = value.slice(1);
    }
    composed += value;
  }
  return composed;
};

/**
 * Returns a formatted string for a date value dependently on a locale,
 * time zone & formatting options
 * @param {Date} dateObj "Date" object representing a date & time value
 * @param {object} config Card config
 * @param {object} datetimeFormatFromCfgParsed Parsed datetime format taken from config
 * @param {Intl.DateTimeFormatOptions} datetimeFormatDateOptions Date format options
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {string} Formatted date string
 */
const formatDate = (
  dateObj,
  config,
  datetimeFormatFromCfgParsed,
  datetimeFormatDateOptions,
  hass,
) => {
  const localeOptions = hass.locale; // FrontendLocaleData object
  const localeDate = localeOptions.date_format === DateFormat.system
    ? undefined : localeOptions.language;
  let formatter;
  let formatted;
  let composed;
  let parts;
  const { datetime_format } = config; // user-defined datetime format

  if (!datetime_format) {
    // follow global HA Frontend settings
    formatter = new Intl.DateTimeFormat(localeDate, datetimeFormatDateOptions);
    if (localeOptions.date_format === DateFormat.language
        || localeOptions.date_format === DateFormat.system) {
      // use default auto-generated presentation
      formatted = formatter.format(dateObj);
      return formatted;
    }

    // DMY, MDY or YMD format is selected - need to compose a result manually
    parts = formatter.formatToParts(dateObj);
    // re-compose a string with a required order from localeOptions.date_format
    composed = composeDateString(
      parts,
      localeOptions.date_format,
    );
    return composed;
  }

  // use formatting settings from a card config
  if ((datetimeFormatFromCfgParsed && datetimeFormatFromCfgParsed.day_weekday)
    || !datetimeFormatFromCfgParsed) {
    formatter = new Intl.DateTimeFormat(localeDate, datetimeFormatDateOptions);
    formatted = formatter.format(dateObj);
    return formatted;
  }

  formatter = new Intl.DateTimeFormat(undefined, datetimeFormatDateOptions);
  parts = formatter.formatToParts(dateObj);
  // re-compose a string with a required order
  composed = composeDateString(
    parts,
    datetimeFormatFromCfgParsed.order,
    datetimeFormatFromCfgParsed.date_literal,
  );
  return composed;
};

/**
 * Returns a formatted string for a time value dependently on a locale,
 * time zone & formatting options
 * @param {Date} dateObj "Date" object representing a date & time value
 * @param {object} config Card config
 * @param {object} datetimeFormatFromCfgParsed Parsed datetime format taken from config
 * @param {Intl.DateTimeFormatOptions} datetimeFormatTimeOptions Time format options
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {string} Formatted time string
 */
const formatTime = (
  dateObj,
  config,
  datetimeFormatFromCfgParsed,
  datetimeFormatTimeOptions,
  hass,
) => {
  const localeOptions = hass.locale; // FrontendLocaleData object
  const localeTime = localeOptions.time_format === TimeFormat.system
    ? undefined : localeOptions.language;
  let formatter;
  let formatted;
  const { datetime_format } = config; // user-defined datetime format

  if (!datetime_format) {
    // follow global HA Frontend settings
    formatter = new Intl.DateTimeFormat(localeTime, datetimeFormatTimeOptions);
    formatted = formatter.format(dateObj);
    return formatted;
  }

  // use formatting settings from a card config
  if ((datetimeFormatFromCfgParsed && datetimeFormatFromCfgParsed.day_weekday)
    || !datetimeFormatFromCfgParsed) {
    formatter = new Intl.DateTimeFormat(localeTime, datetimeFormatTimeOptions);
    formatted = formatter.format(dateObj);
    return formatted;
  }

  formatter = new Intl.DateTimeFormat(undefined, datetimeFormatTimeOptions);
  const parts = formatter.formatToParts(dateObj);
  // re-compose a string with a possibly needed fix for "hour" value
  const composed = composeTimeString(
    parts,
    datetimeFormatFromCfgParsed.hour_2digit,
  );
  return composed;
};

/**
 * Returns a formatted string for a date & time value dependently on a locale,
 * time zone & formatting options
 * @param {Date} dateObj "Date" object representing a date & time value
 * @param {object} config Card config
 * @param {object} datetimeFormatFromCfgParsed Parsed datetime format taken from config
 * @param {Intl.DateTimeFormatOptions} datetimeFormatDateOptions Date format options
 * @param {Intl.DateTimeFormatOptions} datetimeFormatTimeOptions Time format options
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {string} Formatted string
 */
const formatDateTime = (
  dateObj,
  config,
  datetimeFormatFromCfgParsed,
  datetimeFormatDateOptions,
  datetimeFormatTimeOptions,
  hass,
) => {
  let timeString = formatTime(
    dateObj,
    config,
    datetimeFormatFromCfgParsed,
    datetimeFormatTimeOptions,
    hass,
  );
  const { hours_to_show } = config;
  if (hours_to_show > 24) {
    const dateString = formatDate(
      dateObj,
      config,
      datetimeFormatFromCfgParsed,
      datetimeFormatDateOptions,
      hass,
    );
    // the ", " separator between date & time parts is hard-coded
    // (same as currently used in HA Frontend)
    timeString = `${dateString}, ${timeString}`;
  }
  return timeString;
};

/**
 * Returns a possible language/languages based on a number format
 * @param {FrontendLocaleData} localeOptions Object containing
 * a user-selected language and formatting settings
 * @returns {string | string[] | undefined} Possible language/languages
 */
const numberFormatToLocale = (localeOptions) => {
  switch (localeOptions.number_format) {
    case NumberFormat.comma_decimal:
      return ['en-US', 'en']; // Use United States with fallback to English formatting 1,234,567.89
    case NumberFormat.decimal_comma:
      return ['de', 'es', 'it']; // Use German with fallback to Spanish then Italian formatting 1.234.567,89
    case NumberFormat.space_comma:
      return ['fr', 'sv', 'cs']; // Use French with fallback to Swedish and Czech formatting 1 234 567,89
    case NumberFormat.quote_decimal:
      return ['de-CH']; // Use German (Switzerland) formatting 1'234'567.89
    case NumberFormat.system:
      return undefined;
    default:
      return localeOptions.language;
  }
};

/**
 * Generates default options for Intl.NumberFormat
 * @param {string | number} num Number to format
 * @param {Intl.NumberFormatOptions} options Intl.NumberFormatOptions
 * that should be included in the returned options
 * @returns {Intl.NumberFormatOptions} Default options for Intl.NumberFormat
 */
const getDefaultFormatOptions = (
  num,
  options,
) => {
  const defaultOptions = {
    maximumFractionDigits: 2,
    ...options,
  };

  if (typeof num !== 'string') {
    return defaultOptions;
  }

  // Keep decimal trailing zeros if they are present in a string numeric value
  if (
    !options
    || (options.minimumFractionDigits === undefined
        && options.maximumFractionDigits === undefined)
  ) {
    const parts = num.split('.');
    const digits = parts.length > 1 ? parts[1].length : 0;
    defaultOptions.minimumFractionDigits = digits;
    defaultOptions.maximumFractionDigits = digits;
  }

  return defaultOptions;
};

/**
 * Returns an array of objects containing the formatted number in parts.
 * Similar to Intl.NumberFormat.prototype.formatToParts()
 * @param {string | number} num Number to format
 * @param {FrontendLocaleData} localeOptions Object containing
 * a user-selected language and formatting settings
 * @param {Intl.NumberFormatOptions} options Intl.NumberFormatOptions to use
 */
const formatNumberToParts = (
  num,
  localeOptions,
  options,
) => {
  if (num === '' || num === null || num === undefined) {
    return [{ type: 'literal', value: '' }];
  }

  const convertedNumber = Number(num);
  const locale = localeOptions
    ? numberFormatToLocale(localeOptions)
    : undefined;

  if (
    localeOptions
    && localeOptions.number_format !== NumberFormat.none
    && !Number.isNaN(convertedNumber)
  ) {
    return new Intl.NumberFormat(
      locale,
      getDefaultFormatOptions(num, options),
    ).formatToParts(convertedNumber);
  }

  if (
    !Number.isNaN(convertedNumber)
    && localeOptions
    && localeOptions.number_format === NumberFormat.none
  ) {
    // If NumberFormat is none, use en-US format without grouping.
    return new Intl.NumberFormat(
      'en-US',
      getDefaultFormatOptions(num, {
        ...options,
        useGrouping: false,
      }),
    ).formatToParts(convertedNumber);
  }

  return [{ type: 'literal', value: num }];
};

/**
 * Formats a number based on the user's preference with thousands separator(s)
 * and decimal character for better legibility.
 * @param {string | number} num Number to format
 * @param {FrontendLocaleData} localeOptions Object containing
 * a user-selected language and formatting settings
 * @param {Intl.NumberFormatOptions} options Intl.NumberFormatOptions to use
 * @returns {string} Formatted number
 */
const formatNumber = (
  num,
  localeOptions,
  options,
) => formatNumberToParts(num, localeOptions, options)
  .map(part => part.value)
  .join('');

/**
 * Memoized blankPercent dictionary for each language
 */
const blankPercentCache = new Map();

/**
 * Checks if a whitespace is needed before a "%" unit dependently on a locale
 * @param {FrontendLocaleData} localeOptions Object containing
 * a user-selected language and formatting settings
 * @returns {string} Whitespace if needed before "%", empty otherwise
 */
const blankBeforePercent = (localeOptions) => {
  const language = (localeOptions && localeOptions.language) || 'en';

  if (blankPercentCache.has(language)) {
    return blankPercentCache.get(language);
  }

  try {
    const parts = new Intl.NumberFormat(language, {
      style: 'percent',
    }).formatToParts(1);

    const hasSpace = parts.some(part => part.type === 'literal' && /\s/.test(part.value));
    const result = hasSpace ? NBSP : '';

    blankPercentCache.set(language, result);
    return result;
  } catch (e) {
    return '';
  }
};

export {
  formatNumber,
  parseDateTimeFormatFromCfg,
  getDateFormat, getTimeFormat,
  formatDateTime,
  TimeZone, TimeFormat, DateFormat, // used in tests
  blankBeforePercent,
};
