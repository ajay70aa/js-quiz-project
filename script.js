let quizData = null;

document.addEventListener("DOMContentLoaded", function () {
  fetch("https://ajay70aa.github.io/quizData/quizData.json")
    .then((response) => response.json())
    .then((data) => {
      quizData = data;
      initSections();
      function initSections() {
        const sections = document.querySelectorAll(".section");
        sections.forEach((section) => {
          section.addEventListener("click", function () {
            const sectionIndex = parseInt(this.getAttribute("data-section"));
            startQuiz(sectionIndex);
          });
        });
      }
      function startQuiz(sectionIndex) {
        const currentQuestions = quizData.sections[sectionIndex].questions;
        let remainingIndices = Array.from(currentQuestions.keys());
        let score = 0;

        const sectionTitle = quizData.sections[sectionIndex].sectionTitle;
        let highScore = parseInt(localStorage.getItem(`${sectionTitle}_highScore`)) || 0;
        let answerSelected = false;

        document.getElementById("home-container").style.display = "none";
        document.getElementById("question-container").style.display = "block";
        document.getElementById("question-container").innerHTML = `
        <p id="score">score: 0 | High Score: ${highScore}</p>
        <div id="question"></div>
        <div id="options"></div>
        <button id="next-button">Next</button>
        `;
        showQuestions();

        function showQuestions() {
          if (remainingIndices.length === 0) {
            quizOver();
            return;
          }
        
          const randomIndex = Math.floor(Math.random() * remainingIndices.length);
          let currentQuestionIndex = remainingIndices.splice(randomIndex, 1)[0];
        
          const questionData = currentQuestions[currentQuestionIndex];

          const questionElement = document.getElementById("question");
          const optionsElement = document.getElementById("options");

          questionElement.textContent = questionData.question;
          optionsElement.innerHTML = "";

          if (questionData.questionType === "mcq") {
            questionData.options.forEach((option) => {
              const optionElement = document.createElement("div");
              optionElement.textContent = option;
              optionElement.addEventListener("click", function () {
                if (!answerSelected) {
                  answerSelected = true;
                  optionElement.classList.add("selected");
                  checkAnswer(option, questionData.answer);
                }
              });
              optionsElement.appendChild(optionElement);
            });
          } else if (questionData.questionType === "true_false") {
            ["True", "False"].forEach((option) => {
              const optionElement = document.createElement("div");
              optionElement.textContent = option;
              optionElement.addEventListener("click", function () {
                if (!answerSelected) {
                  answerSelected = true;
                  optionElement.classList.add("selected");
                  checkAnswer(option, questionData.answer);
                }
              });
              optionsElement.appendChild(optionElement);
            })
          }
          else {
            const inputElement = document.createElement("input");
            inputElement.type =
              questionData.questionType === "number" ? "number" : "text";
            const submitButton = document.createElement("button");
            submitButton.textContent = "Submit Answer";
            submitButton.className = "submit-answer";

            submitButton.onclick = () => {
              if (!answerSelected) {
                answerSelected = true;
                const userAnswer = inputElement.value;
                checkAnswer(
                  userAnswer.toString(),
                  questionData.answer.toString()
                );
              }
            };
            optionsElement.appendChild(inputElement);
            optionsElement.appendChild(submitButton);
          }
        }
        document.getElementById("next-button").addEventListener("click", function () {
          answerSelected = false;
          showQuestions();
        });

        function checkAnswer(userAnswer, correctAnswer) {
          const feedbackElement = document.createElement("div");
          feedbackElement.id = "feedback";
          if (
            userAnswer === correctAnswer ||
            userAnswer.toString().toLowerCase() === correctAnswer.toString().toLowerCase()
          ) {
            score++;
            feedbackElement.textContent = "Correct!";
            feedbackElement.style.color = "green";
          } else {
            feedbackElement.textContent =
              "Wrong! The correct answer is: " + correctAnswer;
            feedbackElement.style.color = "red";
          }
          const optionsElement = document.getElementById("options");
          optionsElement.appendChild(feedbackElement);
          updateScore();
        }
        function updateScore() {
          const scoreElement = document.getElementById("score");
          scoreElement.textContent = `Score: ${score} | High Score: ${highScore}`;
        }
        function updateHighScore() {
          if (score > highScore) {
            highScore = score;
            localStorage.setItem(`${sectionTitle}_highScore`, highScore);
          }
        }
        function quizOver() {
          updateHighScore();
          let questionContainer = document.getElementById("question-container");
          let homeContainer = document.getElementById("home-container");
          questionContainer.innerHTML = `
          <h1>Quiz completed!</h1>
          <p>Your score is: ${score}/${currentQuestions.length}</p>
          <p>Your highest score in "${sectionTitle}" is: ${highScore}</p>
          <button id='home-button'>Go to Home</button>
          `;
          document
            .getElementById("home-button")
            .addEventListener("click", function () {
              homeContainer.style.display = "flex";
              questionContainer.style.display = "none";
            });
        }
      }
    })
    .catch((error) => console.error("Error fetching quiz data:", error));
});
