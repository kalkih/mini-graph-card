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
  if ([TimeFormat.language, TimeFormat.system].includes(localeOptions.time_format)) {
    // get a flag by testing a "Date" object
    const testLanguage = localeOptions.time_format === TimeFormat.language
      ? localeOptions.language
      : undefined;
    const test = new Date('January 1, 2020 22:00:00').toLocaleString(testLanguage);
    return test.includes('10');
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
  const resolvedTimeZone = Intl.DateTimeFormat
    && Intl.DateTimeFormat().resolvedOptions
    && Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZone = option === TimeZone.local && resolvedTimeZone
    ? resolvedTimeZone
    : serverTimeZone;
  return timeZone;
};

/**
 * Get date formatting options
 * @param {object} config Card config
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {Intl.DateTimeFormatOptions} Date format
 */
const getDateFormat = (config, hass) => {
  const { hours_to_show } = config;
  if (hours_to_show === undefined || hours_to_show <= 24) {
    return {};
  }

  const localeOptions = hass.locale; // FrontendLocaleData object
  const serverTimeZone = hass.config.time_zone; // Server time zone
  const timeZone = resolveTimeZone(localeOptions.time_zone, serverTimeZone);

  let options = {
    timeZone,
  };
  let dateOptions;

  const { datetime_format, datetimeFormatParsed } = config; // user-defined datetime format
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
    if (datetimeFormatParsed && datetimeFormatParsed.day_weekday) {
      dateOptions = {
        day: 'numeric',
        weekday: 'short',
      };
    } else {
      dateOptions = {
        year: datetimeFormatParsed && datetimeFormatParsed.year_2digit
          ? '2-digit' : 'numeric',
        month: datetimeFormatParsed && datetimeFormatParsed.month_2digit
          ? '2-digit' : 'numeric',
        day: datetimeFormatParsed && datetimeFormatParsed.day_2digit
          ? '2-digit' : 'numeric',
      };
    }
  }

  options = { ...options, ...dateOptions };
  return options;
};

/**
 * Get time formatting options
 * @param {object} config Card config
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {Intl.DateTimeFormatOptions} Time formatting options
 */
const getTimeFormat = (config, hass) => {
  const localeOptions = hass.locale; // FrontendLocaleData object

  const serverTimeZone = hass.config.time_zone; // Server time zone
  const timeZone = resolveTimeZone(localeOptions.time_zone, serverTimeZone);

  const { hour24 } = config;
  const valueUseAmPm = useAmPm(localeOptions, hour24);
  const hourCycle = valueUseAmPm ? 'h12' : 'h23'; // accounting possibly defined "hour12"

  let options = {
    minute: '2-digit',
    hourCycle,
    timeZone,
  };

  let hourOption;
  const { datetime_format, datetimeFormatParsed } = config; // user-defined datetime format
  if (!datetime_format) {
    // follow global HA Frontend settings
    hourOption = {
      hour: valueUseAmPm ? 'numeric' : '2-digit',
    };
  } else {
    // use formatting settings from a card config
    // eslint-disable-next-line no-lonely-if
    if (datetimeFormatParsed && datetimeFormatParsed.day_weekday) {
      hourOption = {
        hour: valueUseAmPm ? 'numeric' : '2-digit',
      };
    } else {
      hourOption = {
        hour: datetimeFormatParsed && datetimeFormatParsed.hour_2digit
          ? '2-digit' : 'numeric',
      };
    }
  }

  options = { ...options, ...hourOption };
  return options;
};

/**
 * Returns formatting options to represent a date & time value
 * @param {string} dateTimeFormat Card config option to represent a date & time value
 * @returns {object} Formatting options
 */
const parseDateTimeFormat = (dateTimeFormat) => {
  const regex = /(M{1,2}|D{1,2}|Y{2,4})(\/|\.|-)(M{1,2}|D{1,2})(\/|\.|-)(M{1,2}|D{1,2}|Y{2,4}) H{1,2}:mm/g;
  /* Regex is used to check for these supported patterns:
    DD/MM/YYYY HH:mm  DD.MM.YYYY HH:mm  DD-MM-YYYY HH:mm
    MM/DD/YYYY HH:mm  MM.DD.YYYY HH:mm  MM-DD-YYYY HH:mm
    YYYY/MM/DD HH:mm  YYYY.MM.DD HH:mm  YYYY-MM-DD HH:mm
  where can be used YYYY or YY, MM or M, DD or D, HH or H.
  A singular whitespace must be used to separate date & time formats.
  Letter case does matter.
  Any values which do not match the regex - lead to a fallback to a "day weekday" format.
  */
  if (!dateTimeFormat || !regex.test(dateTimeFormat)) {
    // fallback to a default "legacy" format
    return { day_weekday: true };
  } else {
    const year_2digit = !dateTimeFormat.includes('YYYY') && dateTimeFormat.includes('YY');
    const month_2digit = dateTimeFormat.includes('MM');
    const day_2digit = dateTimeFormat.includes('DD');
    const hour_2digit = dateTimeFormat.includes('HH');
    const date_literal = dateTimeFormat.includes('-')
      ? '-'
      : dateTimeFormat.includes('/')
        ? '/'
        : '.';
    const order = dateTimeFormat.indexOf('M') === 0
      ? DateFormat.MDY
      : dateTimeFormat.indexOf('D') === 0
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
  }
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
  // 1st literal is considered as a "date literal"
  const dateLiteralPart = parts.find(value => value.type === 'literal');
  // use an explicitly defined separator or a standard separator
  const dateLiteral = date_literal || (dateLiteralPart && dateLiteralPart.value);

  const dayPart = parts.find(value => value.type === 'day');
  const day = dayPart && dayPart.value;

  const monthPart = parts.find(value => value.type === 'month');
  const month = monthPart && monthPart.value;

  const yearPart = parts.find(value => value.type === 'year');
  const year = yearPart && yearPart.value;

  // Compose a date string.
  // Note: some languages have an ending literal meaning "year"; this is not accounted here
  const formats = {
    [DateFormat.DMY]: `${day}${dateLiteral}${month}${dateLiteral}${year}`,
    [DateFormat.MDY]: `${month}${dateLiteral}${day}${dateLiteral}${year}`,
    [DateFormat.YMD]: `${year}${dateLiteral}${month}${dateLiteral}${day}`,
  };
  const composed = formats[orderDate];
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
  const hourPart = parts.find(value => value.type === 'hour');
  const hour = hourPart && hourPart.value;
  // Need to remove a leading zero sometimes even if 'numeric' was used in options.
  // This is how Intl works...
  if (!hour_2digit
    && hour.startsWith('0')) {
    hourPart.value = hourPart.value.slice(1);
  }
  const composed = parts.map(part => part.value).join('');
  return composed;
};

/**
 * Returns a formatted string for a date value dependently on a locale,
 * time zone & formatting options
 * @param {Date} dateObj "Date" object representing a date & time value
 * @param {object} config Card config
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {string} Formatted date string
 */
const formatDate = (
  dateObj,
  config,
  hass,
) => {
  const localeOptions = hass.locale; // FrontendLocaleData object
  const localeDate = localeOptions.date_format === DateFormat.system
    ? undefined : localeOptions.language;

  const { datetime_format, datetimeFormatParsed } = config; // user-defined datetime format
  if (!datetime_format) {
    // follow global HA Frontend settings
    const formatter = new Intl.DateTimeFormat(localeDate, config.date_format);
    if (localeOptions.date_format === DateFormat.language
        || localeOptions.date_format === DateFormat.system) {
      // use default auto-generated presentation
      const formatted = formatter.format(dateObj);
      return formatted;
    } else {
      // DMY, MDY or YMD format is selected - need to compose a result manually
      const parts = formatter.formatToParts(dateObj);
      // re-compose a string with a required order from localeOptions.date_format
      const composed = composeDateString(
        parts,
        localeOptions.date_format,
      );
      return composed;
    }
  } else {
    // use formatting settings from a card config
    // eslint-disable-next-line no-lonely-if
    if (datetimeFormatParsed && datetimeFormatParsed.day_weekday) {
      const formatter = new Intl.DateTimeFormat(localeDate, config.date_format);
      const formatted = formatter.format(dateObj);
      return formatted;
    } else {
      const formatter = new Intl.DateTimeFormat(undefined, config.date_format);
      const parts = formatter.formatToParts(dateObj);
      // re-compose a string with a required order
      const composed = composeDateString(
        parts,
        datetimeFormatParsed ? datetimeFormatParsed.order : '.',
        datetimeFormatParsed && datetimeFormatParsed.date_literal,
      );
      return composed;
    }
  }
};

/**
 * Returns a formatted string for a time value dependently on a locale,
 * time zone & formatting options
 * @param {Date} dateObj "Date" object representing a date & time value
 * @param {object} config Card config
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {string} Formatted time string
 */
const formatTime = (
  dateObj,
  config,
  hass,
) => {
  const localeOptions = hass.locale; // FrontendLocaleData object
  const localeTime = localeOptions.time_format === TimeFormat.system
    ? undefined : localeOptions.language;

  const { datetime_format, datetimeFormatParsed } = config; // user-defined datetime format
  if (!datetime_format) {
    // follow global HA Frontend settings
    const formatter = new Intl.DateTimeFormat(localeTime, config.time_format);
    const formatted = formatter.format(dateObj);
    return formatted;
  } else {
    // use formatting settings from a card config
    // eslint-disable-next-line no-lonely-if
    if (datetimeFormatParsed && datetimeFormatParsed.day_weekday) {
      const formatter = new Intl.DateTimeFormat(localeTime, config.time_format);
      const formatted = formatter.format(dateObj);
      return formatted;
    } else {
      const formatter = new Intl.DateTimeFormat(undefined, config.time_format);
      const parts = formatter.formatToParts(dateObj);
      // re-compose a string with a possibly needed fix for "hour" value
      const composed = composeTimeString(
        parts,
        datetimeFormatParsed && datetimeFormatParsed.hour_2digit,
      );
      return composed;
    }
  }
};

/**
 * Returns a formatted string for a date & time value dependently on a locale,
 * time zone & formatting options
 * @param {Date} dateObj "Date" object representing a date & time value
 * @param {object} config Card config
 * @param {HomeAssistant} hass HomeAssistant object
 * @returns {string} Formatted string
 */
const formatDateTime = (
  dateObj,
  config,
  hass,
) => {
  let timeString = formatTime(dateObj, config, hass);
  const { hours_to_show } = config;
  if (hours_to_show > 24) {
    const dateString = formatDate(dateObj, config, hass);
    // the ", " separator between date & time parts is hard-coded
    // (same as currently used in HA Frontend)
    timeString = `${dateString}, ${timeString}`;
  }
  return timeString;
};

export {
  parseDateTimeFormat,
  getDateFormat, getTimeFormat,
  formatDateTime,
  TimeZone, TimeFormat, DateFormat, // used in tests
};
