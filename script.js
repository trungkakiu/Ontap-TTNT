const subjects = {
    TTHCM: "TTHCM",
    TTNT: "TTNT"
}

const onlyDisplayNonAnswer = false;
let isExamInProgress = false;
let userAnswers = [];
let correctAnswers = 0;

// Start final exam with 50 random questions from all JSON files
function startExam(subject) {
    if (isExamInProgress) {
        alert("Bạn phải nộp bài hiện tại trước khi bắt đầu bài mới.");
        return;
    }

    const questionCountElement = document.getElementById("question-count");
    let files = [];
    const questions = [];

    switch (subject) {
        case subjects.TTHCM:
            files.push('data/TTHCM1.json', 'data/TTHCM2.json', 'data/TTHCM3.json', 'data/TTHCM4.json', 'data/TTHCM5.json', 'data/TTHCM6.json', 'data/KTKiNang2.json');
            break;
        case subjects.TTNT:
            files.push('data/TTNT1.json', 'data/TTNT2.json', 'data/TTNT3.json', 'data/TTNT4.json', 'data/TTNT5.json', 'data/TTNT6.json', 'data/TTNT7.json', 'data/TTNT8.json', 'data/TTNT9.json')
            break;
    }

    // Fetch data from all files and combine into one array
    Promise.all(files.map(file => fetch(file).then(response => response.json())))
        .then(results => {
            results.forEach(result => {
              if (onlyDisplayNonAnswer == true) {
                result.forEach(question => {
                  if (question.correct_answer < 1 || question.correct_answer > 4)
                    questions.push(question);
                })
              }
              else {
                result.forEach(question => {
                  if (question.correct_answer >= 1 & question.correct_answer <= 4)
                    questions.push(question);
                })
              }
            }); // Gộp tất cả câu hỏi vào một mảng

            let questionCount = 0;
            if (questionCountElement.value === 'all') {
              questionCount = questions.length;
            } else {
              questionCount = parseInt(document.getElementById("question-count").value);
            }

            const randomQuestions = getRandomQuestions(questions, questionCount); // Lấy câu hỏi ngẫu nhiên
            displayQuestions(randomQuestions); // Hiển thị câu hỏi
            isExamInProgress = true;
            document.getElementById("submit-btn").style.display = "block"; // Hiển thị nút nộp bài
        })
        .catch(error => console.error("Lỗi khi tải file JSON:", error));
}

// Randomly select 'count' questions from a list
function getRandomQuestions(questions, count) {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getShuffleAnwsers(answers) {
  const shuffled = answers.sort(() => 0.5 - Math.random());
  return shuffled;
}

// Display questions on the page
function displayQuestions(questions) {
    const questionsContainer = document.getElementById("questions");
    const resultContainer = document.getElementById("result");
    const scoreElement = document.getElementById("score");
    const scoreTexts = document.querySelectorAll(".score-text");
    const shuffleAnswers = document.getElementById("shuffle-answers").checked;

    // Clear old content
    questionsContainer.innerHTML = "";
    scoreElement.textContent = "";
    resultContainer.style.display = "none";
    scoreTexts.forEach(e => {
      e.classList.remove("score-low-result", "score-medium-result")
    })


  questions.forEach((question, index) => {
      const questionDiv = document.createElement("div");
      const questionHeaderDiv = document.createElement("div");

      questionDiv.classList.add("question");
      questionDiv.dataset.correctAnswer = question.correct_answer; // Store correct answer

      questionHeaderDiv.classList.add("question-header");

      // Display question text
      const questionNumber = document.createElement("p");
      const questionText = document.createElement("p");

      questionNumber.textContent = `Câu ${index + 1}: (ID - ${question.id})`
      questionNumber.classList.add("question-number");

      if (question.correct_answer == 0) {
        questionNumber.classList.add("question-no-answer");
      }

      questionText.innerHTML = `${question.question_direction}`;

      questionHeaderDiv.appendChild(questionNumber);
      questionHeaderDiv.appendChild(questionText);

      questionDiv.appendChild(questionHeaderDiv);

      const answerDiv = document.createElement("div");
      answerDiv.classList.add("answer-div");

      const optionLabels = ['A', 'B', 'C', 'D'];
      let answerOptions = question.answer_option;

      // Shuffle answer options if the checkbox is checked
      if (shuffleAnswers) {
          answerOptions = getShuffleAnwsers(answerOptions);
      }

      // Display answer options
      answerOptions.forEach((option, optionIndex) => {
          const answerOptionDiv = document.createElement("div");
          const label = document.createElement("label");
          const input = document.createElement("input");
          const optionText = document.createElement("span");
          const optionTextP = document.createElement("p");
          const optionLabel = document.createElement("span");

          answerOptionDiv.classList.add("answer-option-div");
          
          optionLabel.classList.add("option-label-text");
          optionLabel.textContent = optionLabels[optionIndex];
          
          input.type = "radio";
          input.name = `question_${question.id}`;
          input.value = option.id;

          label.classList.add("option-label"); // Add a class for styling
          label.appendChild(input);
          label.appendChild(optionText);
          
          // Use innerHTML to render HTML content in the option value
          optionTextP.innerHTML = option.value;
          optionText.appendChild(optionTextP);
          
          answerOptionDiv.appendChild(optionLabel);
          answerOptionDiv.appendChild(label);
          answerDiv.appendChild(answerOptionDiv);

          input.addEventListener('change', () => {
            if (isExamInProgress) {
            document.querySelectorAll(`input[name="question_${question.id}"]`).forEach(radio => {
              radio.parentElement.classList.remove('selected');
            });
            if (input.checked) {
                label.classList.add('selected');
              }
            }
          });
      });

      questionDiv.appendChild(answerDiv);
      questionsContainer.appendChild(questionDiv);
  });
}

// Submit exam and display results
function submitExam() {
    const questionContainers = document.getElementsByClassName("question");
    const resultContainer = document.getElementById("result");
    const scoreElement = document.getElementById("score");
    const scoreTexts = document.querySelectorAll(".score-text");

    correctAnswers = 0;
    userAnswers = [];

    // Check user answers
    const questions = document.querySelectorAll('.question');
    questions.forEach((questionDiv) => {
        const selectedOption = questionDiv.querySelector('input[type="radio"]:checked');
        const correctAnswer = questionDiv.dataset.correctAnswer;

        let userAnswerText = "Chưa chọn";
        if (selectedOption) {
            const userAnswer = selectedOption.value;
            const correctOption = questionDiv.querySelector(`input[value="${correctAnswer}"]`).nextSibling.textContent;

            userAnswerText = selectedOption.nextSibling.textContent;
            userAnswers.push({ userAnswer: userAnswerText, correctAnswer: correctOption });

            if (userAnswer === correctAnswer) {
                correctAnswers++;
                selectedOption.parentElement.classList.add('correct-answer');
            } else {
                selectedOption.parentElement.classList.add('incorrect-answer');
                questionDiv.querySelector(`input[value="${correctAnswer}"]`).parentElement.classList.add('correct-answer');
            }
        } else {
            const correctOption = questionDiv.querySelector(`input[value="${correctAnswer}"]`).nextSibling.textContent;

            userAnswers.push({ userAnswer: "Chưa chọn", correctAnswer: correctOption });
            questionDiv.querySelector(`input[value="${correctAnswer}"]`).parentElement.classList.add('unanswered');
        }

        // Hide radio buttons
        const radioButtons = questionDiv.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.classList.add('hidden-radio');
        });
    });

    // Display results
    const totalQuestions = questions.length;
    const score = ((correctAnswers / totalQuestions) * 10).toFixed(2); // Score out of 10

    userAnswers.forEach((answer, index) => {
        const answerDiv = questionContainers[index];
        answerDiv.classList.add(answer.userAnswer === answer.correctAnswer ? 'correct' : 'incorrect');
    });

    scoreTexts.forEach(e => {
      if (score < 5) {
        e.classList.add("score-low-result");
      } else if (score < 8) {
        e.classList.add("score-medium-result");
      }
    })

    // Result Popup
    const resultPopupScore = document.getElementById("popup-score");
    const resultPopupDetail = document.getElementById("popup-detail");

    resultPopupScore.textContent = `Điểm của bạn: ${score}`;
    resultPopupDetail.textContent = `Số câu trả lời đúng: ${correctAnswers}/${totalQuestions}`;

    showResultPopup(true);

    scoreElement.textContent = `Điểm của bạn: ${score} (Số câu trả lời đúng: ${correctAnswers}/${totalQuestions})`;
    resultContainer.style.display = "block";
    document.getElementById("submit-btn").style.display = "none";
    isExamInProgress = false;
}

document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the customize options from localStorage
    let savedQuestionCount = localStorage.getItem('questionCount');
    let savedShuffleAnswers = localStorage.getItem('shuffleAnswers');

    if (!savedQuestionCount) {
        // If no saved question count, set default to 30
        savedQuestionCount = '30';
        localStorage.setItem('questionCount', savedQuestionCount);
    }
    document.getElementById('question-count').value = savedQuestionCount;

    if (savedShuffleAnswers) {
        document.getElementById('shuffle-answers').checked = JSON.parse(savedShuffleAnswers);
    }
});

function saveQuestionCount() {
    const questionCount = document.getElementById('question-count').value;
    localStorage.setItem('questionCount', questionCount);
}

function saveShuffleAnswers() {
  const shuffleAnswers = document.getElementById('shuffle-answers').checked;
  localStorage.setItem('shuffleAnswers', shuffleAnswers);
}

function showResultPopup(show) {
    const resultPopupContainer = document.getElementById("result-popup");
    
    if (show) {
        resultPopupContainer.classList.add("popup-active");
    } else {
        resultPopupContainer.classList.remove("popup-active");
    }
}