function getRandomInt( max ) {
  return Math.floor( Math.random() * max )
}

function getRandomIntBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export {
  getRandomInt,
  getRandomIntBetween,
}