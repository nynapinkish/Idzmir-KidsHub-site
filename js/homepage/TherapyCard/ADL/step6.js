    const questions = [
      {
        word: 'sabun',
        image: '../../../../assets/images/soap1.png',
        correctLetter: 's',
        options: ['d', 'k', 's']
      },
      {
        word: 'berus gigi',
        image: '../../../../assets/images/toothbrush1.png',
        correctLetter: 't',
        options: ['t', 'o', 'j']
      },
      {
        word: 'tab mandi',
        image: '../../../../assets/images/bathtub1.png',
        correctLetter: 'b',
        options: ['r', 'b', 'd']
      },
      {
        word: 'tuala',
        image: '../../../../assets/images/towel.png',
        correctLetter: 's',
        options: ['t', 'u', 'l']
      },
      {
        word: 'bantal',
        image: '../../../../assets/images/pillow1.png',
        correctLetter: 't',
        options: ['h', 'u', 'b']
      },
      {
        word: 'almari',
        image: '../../../../assets/images/wardrobe.png',
        correctLetter: 't',
        options: ['r', 'a', 'i']
      },
      {
        word: 'pisau',
        image: '../../../../assets/images/knife.png',
        correctLetter: 't',
        options: ['p', 'u', 'e']
      },
      {
        word: 'kuali',
        image: '../../../../assets/images/pan.png',
        correctLetter: 't',
        options: ['k', 'n', 't']
      },
      {
        word: 'baju',
        image: '../../../../assets/images/clothes.png',
        correctLetter: 't',
        options: ['h', 'b', 'p']
      },
      {
        word: 'cermin',
        image: '../../../../assets/images/mirror1.png',
        correctLetter: 't',
        options: ['c', 'z', 'i']
      },
      {
        word: 'meja',
        image: '../../../../assets/images/table.png',
        correctLetter: 't',
        options: ['t', 'm', 'p']
      },
      {
        word: 'komputer',
        image: '../../../../assets/images/computer.png',
        correctLetter: 't',
        options: ['k', 'w', 'c']
      },
      {
        word: 'peti ais',
        image: '../../../../assets/images/refrigerator1.png',
        correctLetter: 't',
        options: ['u', 'r', 'p']
      },
      {
        word: 'pengisar',
        image: '../../../../assets/images/blender.png',
        correctLetter: 't',
        options: ['m', 'w', 'b']
      },
      {
        word: 'garfu',
        image: '../../../../assets/images/fork.png',
        correctLetter: 't',
        options: ['h', 'g', 'p']
      },
      {
        word: 'gelas',
        image: '../../../../assets/images/glass.png',
        correctLetter: 't',
        options: ['g', 's', 'b']
      },
      {
        word: 'seterika',
        image: '../../../../assets/images/iron.png',
        correctLetter: 't',
        options: ['p', 's', 'c']
      },
      {
        word: 'kunci',
        image: '../../../../assets/images/key.png',
        correctLetter: 't',
        options: ['k', 'a', 'd']
      },
      {
        word: 'tilam',
        image: '../../../../assets/images/mattress.png',
        correctLetter: 't',
        options: ['k', 'n', 't']
      },
      {
        word: 'sudip',
        image: '../../../../assets/images/spatula.png',
        correctLetter: 't',
        options: ['k', 's', 't']
      },
      {
        word: 'surat khabar',
        image: '../../../../assets/images/newspaper.png',
        correctLetter: 't',
        options: ['s', 'n', 't']
      },
      {
        word: 'remote',
        image: '../../../../assets/images/remote.png',
        correctLetter: 't',
        options: ['k', 'r', 't']
      },
      {
        word: 'yo-yo',
        image: '../../../../assets/images/yoyo.png',
        correctLetter: 't',
        options: ['y', 'n', 't']
      },
      {
        word: 'xylophone',
        image: '../../../../assets/images/xylophone.png',
        correctLetter: 't',
        options: ['k', 'x', 't']
      },
    ];

    let currentQuestion = 0;
    let correctCount = 0;
    let wrongCount = 0;

    function loadQuestion() {
      if (currentQuestion >= questions.length) {
        showResult();
        return;
      }

      const q = questions[currentQuestion];
      document.getElementById('itemImage').src = q.image;
      document.getElementById('wordLabel').textContent = q.word;
      
      const container = document.getElementById('lettersContainer');
      container.innerHTML = '';
      
      q.options.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'letter-button';
        button.textContent = letter;
        button.onclick = () => checkAnswer(letter, button);
        container.appendChild(button);
      });
    }

    function checkAnswer(selectedLetter, button) {
      const q = questions[currentQuestion];
      const allButtons = document.querySelectorAll('.letter-button');
      
      // Disable all buttons
      allButtons.forEach(btn => btn.disabled = true);
      
      if (selectedLetter === q.correctLetter) {
        button.classList.add('correct');
        correctCount++;
        document.getElementById('correctCount').textContent = correctCount;
        
        setTimeout(() => {
          currentQuestion++;
          loadQuestion();
        }, 800);
      } else {
        button.classList.add('wrong');
        wrongCount++;
        document.getElementById('wrongCount').textContent = wrongCount;
        
        setTimeout(() => {
          currentQuestion++;
          loadQuestion();
        }, 800);
      }
    }

    function showResult() {
      const score = correctCount * 10;
      document.getElementById('finalCorrect').textContent = correctCount;
      document.getElementById('finalWrong').textContent = wrongCount;
      document.getElementById('finalScore').textContent = score;
      document.getElementById('overlay').classList.add('show');
      document.getElementById('resultPopup').classList.add('show');
    }

    function restartGame() {
      currentQuestion = 0;
      correctCount = 0;
      wrongCount = 0;
      document.getElementById('correctCount').textContent = '0';
      document.getElementById('wrongCount').textContent = '0';
      document.getElementById('overlay').classList.remove('show');
      document.getElementById('resultPopup').classList.remove('show');
      loadQuestion();
    }

    // Initialize game
    loadQuestion();