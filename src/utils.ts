import { merge, values, keyBy } from "lodash";
import {
  Chances,
  RewardConfiguration,
} from "./pages/api/nft_sendout_script/types";
const BLOCK_DURATION = 6000;
const EXPONENT_CONSTANTS = [3, 0.4];

const getEndDateByBlock = (
  blockNumber,
  currentBlockNumber,
  currentTimestamp
) => {
  let newStamp =
    parseInt(currentTimestamp.toString()) +
    (parseInt(blockNumber.toString()) - currentBlockNumber.toNumber()) *
      BLOCK_DURATION;
  return new Date(newStamp);
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomIntBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const microToKSM = (microKSM) => {
  return parseInt(microKSM) / 1000000000000;
};

const microToKSMFormatted = (microKSM) => {
  return KSMFormatted(microToKSM(microKSM));
};

const KSMFormatted = (KSM) => {
  return `${(KSM / 1000).toFixed(2)} K KSM`;
};

const trimAddress = (address, length = 3) => {
  return `${address.substring(0, length)}...${address.substring(
    address.length - length
  )}`;
};

/**
 * Merge two arrays (similar to join on mysql) based on key
 * https://stackoverflow.com/questions/35091975/how-to-use-lodash-to-merge-two-collections-based-on-a-key
 */
const mergeArrays = (a1, a2, key) => {
  const merged = merge(keyBy(a1, key), keyBy(a2, key));
  return values(merged);
};

/**
 * Merge two arrays (similar to join on mysql) based on key
 * https://stackoverflow.com/questions/35091975/how-to-use-lodash-to-merge-two-collections-based-on-a-key
 * @param {*} a1
 * @param {*} a2
 * @param {*} a1key
 * @param {*} a2key
 */
const joinArrays = (a1, a2, a1key, a2key) => {
  return a1.map((obj) => {
    return Object.assign(
      obj,
      a2.find((el) => el[a2key] === obj[a1key])
    );
  });
};

/**
 * Calculate the chances for a given ksm vote value and given options
 * @param n the ksm vote value
 * @param minIn
 * @param maxIn
 * @param minOut
 * @param maxOut
 * @param exponent
 * @param luckMultiplier
 * @returns a probability between 0 and 100
 */
const calculateLuck = (
  n: number,
  minIn: number,
  maxIn: number,
  minOut: number,
  maxOut: number,
  exponent: number,
  luckMultiplier: number
): number => {
  if (n > maxIn) {
    n = maxOut;
  } else if (n < minIn) {
    n = minOut;
  } else {
    // unscale input
    n -= minIn;
    n /= maxIn - minIn;
    n = Math.pow(n, exponent);
    // scale output
    n *= maxOut - minOut;
    n += minOut;
  }
  return n * luckMultiplier;
};

const getLuckMultiplier = (options, config) => {
  let luckMultiplier = 1.0;

  const { babyBonus, toddlerBonus, adolescentBonus, adultBonus } = config;

  if (options.babyEquipped) {
    luckMultiplier = babyBonus ? 1 + babyBonus / 100 : 1.0;
  } else if (options.toddlerEquipped) {
    luckMultiplier = toddlerBonus ? 1 + toddlerBonus / 100 : 1.0;
  } else if (options.adolescentEquipped) {
    luckMultiplier = adolescentBonus ? 1 + adolescentBonus / 100 : 1.0;
  } else if (options.adultEquipped) {
    luckMultiplier = adultBonus ? 1 + adultBonus / 100 : 1.0;
  }

  return luckMultiplier;
};

/**
 * return the chances array
 */
const lucksForConfig = (
  ksm: number,
  refConfig: RewardConfiguration,
  luckMultiplier: number
): Record<string, number> => {
  const lucks: Record<string, number> = {};

  if (ksm < refConfig.minValue) {
    return {
      common: 100,
      rare: 0,
      epic: 0,
    };
  }

  //do not calc luck for the last to items (common, default)
  //will be done below
  //TODO will have to find a filter that will filter the correct items
  const optionsToConsider = refConfig?.options.filter(
    (opt) => opt.rarity !== "common"
  );

  optionsToConsider?.forEach((option) => {
    if (ksm < refConfig.median) {
      lucks[`${option.rarity}`] = calculateLuck(
        ksm,
        refConfig.minValue,
        refConfig.median,
        option.minProbability,
        //this was before the sweetspot probability
        (option.maxProbability + option.minProbability) / 2,
        EXPONENT_CONSTANTS[0],
        luckMultiplier
      );
    } else {
      lucks[`${option.rarity}`] = calculateLuck(
        ksm,
        refConfig.median,
        refConfig.maxValue,
        (option.maxProbability + option.minProbability) / 2,
        option.maxProbability,
        EXPONENT_CONSTANTS[1],
        luckMultiplier
      );
    }
  });

  // console.log("final lucks before normalization:", lucks);

  lucks.rare = ((100 - lucks.epic) / 100) * lucks.rare;
  lucks.common = 100 - lucks.rare - lucks.epic;

  return lucks;
};

/**
 * Produce an animated svg that can be used as image placeholder
 * @param {Integer} w
 * @param {Integer} h
 * @returns html string
 */
const shimmer = (w, h) => `
  <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#fff" offset="20%" />
        <stop stop-color="#eee" offset="50%" />
        <stop stop-color="#fff" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#fff" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
  </svg>`;

/**
 * Base64 encode string, can be used for inline images
 * @param {String} str String to encode
 * @returns String
 */
const toBase64 = (str) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

const titleCase = (s) =>
  s.replace(/^_*(.)|_+(.)/g, (s, c, d) =>
    c ? c.toUpperCase() : " " + d.toUpperCase()
  );

/**
 * Stips all tags from html
 * @param {String} html
 * @returns String
 */
function stripHtml(html) {
  let doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

/**
 * Get a random item from an array of items based on weights
 * @param {*} rng random number generator
 * @param {*} items array of items
 * @param {*} weights array of weights
 * @returns item
 */
function weightedRandom(rng, items, weights) {
  var i;

  for (i = 1; i < weights.length; i++) weights[i] += weights[i - 1];

  var random = rng() * weights[weights.length - 1];

  for (i = 0; i < weights.length; i++) if (weights[i] > random) break;

  return items[i];
}

/**
 * Convert a stream to a JSON object
 * @param data
 */
async function* streamToJSON(
  data: ReadableStream<Uint8Array>
): AsyncIterableIterator<any> {
  const reader = data.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    console.log("streamToJson", value, done);
    if (done) {
      break;
    }

    if (value) {
      try {
        yield JSON.parse(decoder.decode(value));
      } catch (error) {
        console.error(error);
      }
    }
  }
}

export {
  getRandomInt,
  getRandomIntBetween,
  KSMFormatted,
  microToKSM,
  microToKSMFormatted,
  trimAddress,
  getEndDateByBlock,
  mergeArrays,
  joinArrays,
  lucksForConfig,
  getLuckMultiplier,
  shimmer,
  toBase64,
  titleCase,
  stripHtml,
  weightedRandom,
  streamToJSON,
};
