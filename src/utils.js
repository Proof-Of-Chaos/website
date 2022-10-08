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
  return KSMFormatted( microKSM( microKSM ) )
}

const KSMFormatted = ( KSM ) => {
  return `${ parseFloat( KSM / 1000 ).toFixed(2) } K KSM`
}

const trimAddress = ( address, length = 3 ) => {
  return `${ address.substring(0,length) }...${ address.substring(address.length - length) }`
}

export {
  getRandomInt,
  getRandomIntBetween,
  KSMFormatted,
  microToKSM,
  microToKSMFormatted,
  trimAddress,
}