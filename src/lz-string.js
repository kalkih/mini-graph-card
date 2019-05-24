/* eslint-disable */

let i = 0;
const reverseDict = {};
const { fromCharCode } = String;
let streamData;
let streamDataVal;
let streamDataPosition;
let streamBitsPerChar;
let streamGetCharFromInt;
const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+';
const Base64CharArray = `${base}/=`.split('');
const UriSafeCharArray = `${base}-$`.split('');
while (i < 65) {
  if (i > 62) {
    reverseDict[UriSafeCharArray[i].charCodeAt(0)] = i;
  }
  reverseDict[Base64CharArray[i].charCodeAt(0)] = i++;
}

function streamBits(value, numBitsMask) {
  for (let i = 0; (numBitsMask >>= 1); i++) {
    // shifting has precedence over bitmasking
    streamDataVal = ((value >> i) & 1) | (streamDataVal << 1);
    if (++streamDataPosition === streamBitsPerChar) {
      streamDataPosition = 0;
      streamData.push(streamGetCharFromInt(streamDataVal));
      streamDataVal = 0;
    }
  }
}

function getCharFromBase64(a) {
  return Base64CharArray[a];
}
function getCharFromURISafe(a) {
  return UriSafeCharArray[a];
}
function getCharFromUTF16(a) {
  return fromCharCode(a + 32);
}
function _compress(uncompressed, bitsPerChar, getCharFromInt) {
  // data - empty stream
  streamData = [];

  if (uncompressed != null) {
    // davaVal
    streamDataVal = 0;
    // dataPosition
    streamDataPosition = 0;
    streamBitsPerChar = bitsPerChar;
    streamGetCharFromInt = getCharFromInt;
    let j = 0;
    let k = 0;
    let value = 0;
    let node = [3]; // first node will always be initialised like this.
    // we should never output the root anyway,
    // so we initiate with terminating token
    // Also, dictionary[1] will be overwritten
    // by the first charCode
    const dictionary = [2, 2, node];
    let freshNode = true;
    let c = 0;
    let dictSize = 3;
    let numBitsMask = 0b100;

    if (uncompressed.length) {
      // If there is a string, the first charCode is guaranteed to
      // be new, so we write it to output stream, and add it to the
      // dictionary. For the same reason we can initialize freshNode
      // as true, and new_node, node and dictSize as if
      // it was already added to the dictionary (see above).

      c = uncompressed.charCodeAt(0);

      // == Write first charCode token to output ==

      // 8 or 16 bit?
      value = c < 256 ? 0 : 1;

      // insert "new 8/16 bit charCode" token
      // into bitstream (value 1)
      streamBits(value, numBitsMask);
      streamBits(c, value ? 0b10000000000000000 : 0b100000000);

      // Add charCode to the dictionary.
      dictionary[1] = c;

      nextchar: for (j = 1; j < uncompressed.length; j++) {
        c = uncompressed.charCodeAt(j);
        // does the new charCode match an existing prefix?
        for (k = 1; k < node.length; k += 2) {
          if (node[k] == c) {
            node = node[k + 1];
            continue nextchar;
          }
        }
        // we only end up here if there is no matching char

        // Prefix+charCode does not exist in trie yet.
        // We write the prefix to the bitstream, and add
        // the new charCode to the dictionary if it's new
        // Then we set `node` to the root node matching
        // the charCode.

        if (freshNode) {
          // Prefix is a freshly added character token,
          // which was already written to the bitstream
          freshNode = false;
        } else {
          // write out the current prefix token
          streamBits(node[0], numBitsMask);
        }

        // Is the new charCode a new character
        // that needs to be stored at the root?
        k = 1;
        while (dictionary[k] != c && k < dictionary.length) {
          k += 2;
        }
        if (k == dictionary.length) {
          // increase token bitlength if necessary
          if (++dictSize >= numBitsMask) {
            numBitsMask <<= 1;
          }

          // insert "new 8/16 bit charCode" token,
          // see comments above for explanation
          value = c < 256 ? 0 : 1;
          streamBits(value, numBitsMask);
          streamBits(c, value ? 0b10000000000000000 : 0b100000000);

          dictionary.push(c);
          dictionary.push([dictSize]);
          // Note of that we already wrote
          // the charCode token to the bitstream
          freshNode = true;
        }
        // add node representing prefix + new charCode to trie
        node.push(c);
        node.push([++dictSize]);
        // increase token bitlength if necessary
        if (dictSize >= numBitsMask) {
          numBitsMask <<= 1;
        }
        // set node to first charCode of new prefix
        // k is guaranteed to be at the current charCode,
        // since we either broke out of the while loop
        // when it matched, or just added the new charCode
        node = dictionary[k + 1];
      }

      // === Write last prefix to output ===
      if (freshNode) {
        // character token already written to output
        freshNode = false;
      } else {
        // write out the prefix token
        streamBits(node[0], numBitsMask);
      }

      // Is c a new character?
      k = 1;
      while (dictionary[k] != c && k < dictionary.length) {
        k += 2;
      }
      if (k == dictionary.length) {
        // increase token bitlength if necessary
        if (++dictSize >= numBitsMask) {
          numBitsMask <<= 1;
        }
        // insert "new 8/16 bit charCode" token,
        // see comments above for explanation
        value = c < 256 ? 0 : 1;
        streamBits(value, numBitsMask);
        streamBits(c, value ? 0b10000000000000000 : 0b100000000);
      }
      // increase token bitlength if necessary
      if (++dictSize >= numBitsMask) {
        numBitsMask <<= 1;
      }
    }

    // Mark the end of the stream
    streamBits(2, numBitsMask);

    // Flush the last char
    streamDataVal <<= streamBitsPerChar - streamDataPosition;
    streamData.push(streamGetCharFromInt(streamDataVal));
  }
  return streamData;
}

function _decompress(length, resetBits, getNextValue) {
  const dictionary = [0, 1, 2];
  let enlargeIn = 4;
  let dictSize = 4;
  let numBits = 3;
  let entry = '';
  const result = [];
  let w = '';
  let bits = 0;
  let maxpower = 2;
  let power = 0;
  let c = '';
  let data_val = getNextValue(0);
  let data_position = resetBits;
  let data_index = 1;

  // Get first token, guaranteed to be either
  // a new character token (8 or 16 bits)
  // or end of stream token.
  while (power !== maxpower) {
    // shifting has precedence over bitmasking
    bits += ((data_val >> --data_position) & 1) << power++;
    if (data_position === 0) {
      data_position = resetBits;
      data_val = getNextValue(data_index++);
    }
  }

  // if end of stream token, return empty string
  if (bits === 2) {
    return '';
  }

  // else, get character
  maxpower = bits * 8 + 8;
  bits = power = 0;
  while (power !== maxpower) {
    // shifting has precedence over bitmasking
    bits += ((data_val >> --data_position) & 1) << power++;
    if (data_position === 0) {
      data_position = resetBits;
      data_val = getNextValue(data_index++);
    }
  }
  c = fromCharCode(bits);
  dictionary[3] = c;
  w = c;
  result.push(c);

  // read rest of string
  while (data_index <= length) {
    // read out next token
    maxpower = numBits;
    bits = power = 0;
    while (power !== maxpower) {
      // shifting has precedence over bitmasking
      bits += ((data_val >> --data_position) & 1) << power++;
      if (data_position === 0) {
        data_position = resetBits;
        data_val = getNextValue(data_index++);
      }
    }

    // 0 or 1 implies new character token
    if (bits < 2) {
      maxpower = 8 + 8 * bits;
      bits = power = 0;
      while (power !== maxpower) {
        // shifting has precedence over bitmasking
        bits += ((data_val >> --data_position) & 1) << power++;
        if (data_position === 0) {
          data_position = resetBits;
          data_val = getNextValue(data_index++);
        }
      }
      dictionary[dictSize] = fromCharCode(bits);
      bits = dictSize++;
      if (--enlargeIn === 0) {
        enlargeIn = 1 << numBits++;
      }
    } else if (bits === 2) {
      // end of stream token
      return result.join('');
    }

    if (bits > dictionary.length) {
      return null;
    }
    entry = bits < dictionary.length ? dictionary[bits] : w + w.charAt(0);
    result.push(entry);
    // Add w+entry[0] to the dictionary.
    dictionary[dictSize++] = w + entry.charAt(0);

    w = entry;

    if (--enlargeIn === 0) {
      enlargeIn = 1 << numBits++;
    }
  }
  return '';
}
function _compressToArray(uncompressed) {
  return _compress(uncompressed, 16, fromCharCode);
}
function _decompressFromArray(compressed) {
  if (compressed == null) return '';
  if (compressed.length === 0) return null;
  return _decompress(compressed.length, 16, index => compressed[index].charCodeAt(0));
}

export const compressToBase64 = input => {
  if (input == null) return '';
  const res = _compress(input, 6, getCharFromBase64);
  let i = res.length % 4; // To produce valid Base64
  while (i--) {
    res.push('=');
  }

  return res.join('');
};

export const decompressFromBase64 = input => {
  if (input == null) return '';
  if (input === '') return null;
  return _decompress(input.length, 6, index => reverseDict[input.charCodeAt(index)]);
};

export const compressToUTF16 = input => {
  if (input == null) return '';
  const compressed = _compress(input, 15, getCharFromUTF16);
  compressed.push(' ');
  return compressed.join('');
};

export const decompressFromUTF16 = compressed => {
  if (compressed == null) return '';
  if (compressed === '') return null;
  return _decompress(compressed.length, 15, index => compressed.charCodeAt(index) - 32);
};

// compress into uint8array (UCS-2 big endian format)
export const compressToUint8Array = uncompressed => {
  const compressed = _compressToArray(uncompressed);
  const buf = new Uint8Array(compressed.length * 2); // 2 bytes per character

  for (let i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
    const current_value = compressed[i].charCodeAt(0);
    buf[i * 2] = current_value >>> 8;
    buf[i * 2 + 1] = current_value & 0xff;
  }
  return buf;
};

// decompress from uint8array (UCS-2 big endian format)
export const decompressFromUint8Array = compressed => {
  if (compressed === null || compressed === undefined) {
    return _decompressFromArray(compressed);
  } else if (compressed.length === 0) {
    return null;
  }
  return _decompress(compressed.length, 8, index => compressed[index]);
};

// compress into a string that is already URI encoded
export const compressToEncodedURIComponent = input => {
  if (input == null) return '';
  return _compress(input, 6, getCharFromURISafe).join('');
};

// decompress from an output of compressToEncodedURIComponent
export const decompressFromEncodedURIComponent = input => {
  if (input == null) return '';
  if (input === '') return null;
  input = input.replace(/ /g, '+');
  return _decompress(input.length, 6, index => reverseDict[input.charCodeAt(index)]);
};

export const compress = uncompressed => _compressToArray(uncompressed).join('');

export const compressToArray = () => _compressToArray();

export const decompress = compressed => {
  if (compressed == null) return '';
  if (compressed === '') return null;
  return _decompress(compressed.length, 16, index => compressed.charCodeAt(index));
};

export const decompressFromArray = () => _decompressFromArray();
