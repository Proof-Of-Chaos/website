import { merge, values, keyBy } from 'lodash'

function getRandomInt( max ) {
  return Math.floor( Math.random() * max )
}

function getRandomIntBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const microToKSM = (microKSM) => {
  return parseInt(microKSM) / 1000000000000;
}

const microToKSMFormatted = (microKSM) => {
  return KSMFormatted( microToKSM( microKSM ) )
}

const KSMFormatted = ( KSM ) => {
  return `${ parseFloat( KSM / 1000 ).toFixed(2) } K KSM`
}

const trimAddress = ( address, length = 3 ) => {
  return `${ address.substring(0,length) }...${ address.substring(address.length - length) }`
}

/**
 * Merge two arrays (similar to join on mysql) based on key
 * https://stackoverflow.com/questions/35091975/how-to-use-lodash-to-merge-two-collections-based-on-a-key
 */
const mergeArrays = (a1, a2, key) => {
  const merged = merge(keyBy(a1, key), keyBy(a2, key));
  return values(merged);
}

/**
 * Merge two arrays (similar to join on mysql) based on key
 * https://stackoverflow.com/questions/35091975/how-to-use-lodash-to-merge-two-collections-based-on-a-key
 * @param {*} a1
 * @param {*} a2
 * @param {*} a1key
 * @param {*} a2key
 */
const joinArrays = (a1, a2, a1key, a2key) => {
  return a1.map( obj => {
    return Object.assign(obj, a2.find( el => el[a2key] === obj[a1key] ) );
  })
}

export {
  getRandomInt,
  getRandomIntBetween,
  KSMFormatted,
  microToKSM,
  microToKSMFormatted,
  trimAddress,
  mergeArrays,
  joinArrays,
}