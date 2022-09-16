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
  return parseFloat((microToKSM(microKSM) / 1000).toFixed(2)) + 'K KSM';
}

export {
  getRandomInt,
  getRandomIntBetween,
  microToKSM,
  microToKSMFormatted,
}