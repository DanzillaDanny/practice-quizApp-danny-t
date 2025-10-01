class Question {
  constructor(question, choices, answerIndex, feedback) {
    this.question = question;
    this.choice = choices;
    this.answer = answerIndex;
    this.feedback = feedback;
  }
  checkAnswer(userChoiceIndex) {
    return userChoiceIndex === this.answer;
  }
}

const questionList = []; 

let index = 0;
let selectedAnswer = null;
let submitted = false;

function setButtonsDisabled(disabled) {
  document.querySelectorAll('.options').forEach(btn => (btn.disabled = disabled));
}

function clearVisuals() {
  document.querySelectorAll('.options').forEach(btn => {
    btn.classList.remove('selected', 'correct', 'incorrect');
  });
}

function renderQuestion() {
  const current = questionList[index];
  document.getElementById("question").textContent = current.question;

  document.getElementById('option1').textContent = current.choice[0];
  document.getElementById('option2').textContent = current.choice[1];
  document.getElementById('option3').textContent = current.choice[2];
  document.getElementById('option4').textContent = current.choice[3];

  document.getElementById("feedback").textContent = '';
  document.getElementById("userSelection").textContent = '';

  selectedAnswer = null;
  submitted = false;
  clearVisuals();
  setButtonsDisabled(false);
}

function evaluateSelection() {
  if (selectedAnswer === null || submitted) return;

  const currentQuestion = questionList[index];
  const isCorrect = currentQuestion.checkAnswer(selectedAnswer);

  const buttons = [
    document.getElementById('option1'),
    document.getElementById('option2'),
    document.getElementById('option3'),
    document.getElementById('option4')
  ];

  if (isCorrect) {
    document.getElementById("feedback").textContent = "Correct!";
    buttons[selectedAnswer].classList.add('correct');
  } else {
    document.getElementById("feedback").textContent = currentQuestion.feedback || "Not quite.";
    buttons[selectedAnswer].classList.add('incorrect');
    buttons[currentQuestion.answer].classList.add('correct');
  }

  setButtonsDisabled(true);
  submitted = true;
}

const answersContainer = document.querySelector('.answer-buttons-container');
answersContainer.addEventListener('click', (e) => {
  if (submitted) return;
  const btn = e.target.closest('.options');
  if (!btn) return;

  const idToIndex = { option1: 0, option2: 1, option3: 2, option4: 3 };
  const idx = idToIndex[btn.id];
  if (idx === undefined) return;

  selectedAnswer = idx;
  document.getElementById("userSelection").textContent = questionList[index].choice[idx];

  clearVisuals();
  btn.classList.add('selected');


  evaluateSelection();
});

document.getElementById('nextquestion').addEventListener('click', () => {
  if (index >= questionList.length - 1) {
    document.getElementById("feedback").textContent = "Quiz complete! 🎉";
    return;
  }
  index++;
  renderQuestion();
});


async function loadQuestions() {
  const res = await fetch("https://opentdb.com/api.php?amount=4&type=multiple");
  const data = await res.json();

  const decode = (str) => {
    const t = document.createElement("textarea");
    t.innerHTML = str;
    return t.value;
  };

  const newQuestions = data.results.map(q => {
    const correct = decode(q.correct_answer);
    const incorrects = q.incorrect_answers.map(decode);
    const allChoices = [...incorrects, correct].sort(() => Math.random() - 0.5);
    const answerIndex = allChoices.indexOf(correct);
    return new Question(decode(q.question), allChoices, answerIndex, "Not quite.");
  });

  questionList.push(...newQuestions);
}

window.onload = async function () {
  await loadQuestions();
  renderQuestion();
};
