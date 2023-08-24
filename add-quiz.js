const fetch = require('node-fetch');
const fs = require('fs');

const configUrl = 'https://gateway.ipfs.io/ipns/k2k4r8l0pjhpwtaaia4zch6tr1d2lvplkd0wn46xkob6mw93qniyh8c5'

const readline = require('readline');
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let mode = null;
let questionNo = 1;
let answerNo = 1;
let ref = null
let type = null
let q = null
let answers = []
let questions = []

function askQuestion(question) {
  rl.question(question, function (response) {
    q = response
    rl.question('Answer type? 1: radio, 2: checkbox: ', function (response) {
      type = response
      mode = 'answers';
      getAnswer(`Answer ${answerNo}: `);
    });
  });
}

function getAnswer(question) {
  rl.question(question, function (response) {
    if (response) {
      answers.push(response);
    }
    answerNo++;
    getAnswer(`Answer ${answerNo}: `);
  });
}

function tryToQuit() {
  if (mode === 'answers') {
    mode = null
    answerNo = 1;
    questionNo++;

    if (q && type && answers.length > 0) {
      questions.push({
        'question': q,
        'type': type === '2' ? 'checkbox' : 'radio',
        'answers': answers,
      });
      answers = [];

      rl.close()

      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.on('close', tryToQuit);

      askQuestion(`Question ${questionNo}: `);
    } else {
      // console.log("\nAdd at least 1 question / answer")
    }
  } else {

    if (questions.length > 0) {
      rl.close()
      console.log("\n\nQuiz:\n" + JSON.stringify(questions) + "\n\n")

      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Hit enter to save, CTRL + c to cancel', function (response) {
        console.log('\nFetching current file...')
        fetch(configUrl).then((res) => {
          console.log(res)
          res.json().then((res) => {
            console.log(res)
          });
        })
        process.exit(0);
      });
    } else {
      process.exit(0);
    }

  }
}


//console.log('\nFetching current file...')
/*fetch(configUrl).then((res) => {
  console.log(1)
  res.json().then((res) => {
    console.log(res)
  });
})*/


rl.question("Welcome to the quiz builder script!\nStart adding adding a new referendum and press 'CTRL + c' after adding answers or questions to continue to the next step.\nFor which referendum would you like to add a quiz? ", function (response) {
  ref = response
  askQuestion(`Question ${questionNo}: `);
});

rl.on('close', tryToQuit);