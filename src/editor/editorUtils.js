
const stringToBoolean = (string) => {
  if (/^show$/i.test(string)) {
    return true;
  } else if (/^hide$/i.test(string)) {
    return false;
  }
  return string;
};

const booleanToString = (bool) => {
  if (typeof bool === 'boolean') {
    if (bool) {
      return 'show';
    } else {
      return 'hide';
    }
  }

  return bool;
};

const convertColorNameToHex = (color) => {
  const canvas = document.createElement('canvas').getContext('2d');
  canvas.fillStyle = color;
  return canvas.fillStyle;
};

const isValidHex = hex => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

export {
  stringToBoolean, booleanToString,
  convertColorNameToHex, isValidHex,
};
