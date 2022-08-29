function getRandomInt( max ) {
  return Math.floor( Math.random() * max )
}

function getRandomIntBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function valueToKSM( val ) {
  return parseFloat(val?.toString()) / 1000000000000
}

export {
  getRandomInt,
  getRandomIntBetween,
  valueToKSM,
}