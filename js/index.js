class Termo {
  constructor() {
    this.letters = document.querySelectorAll(".letter");
    this.buttons = document.querySelectorAll(".buttons");
    this.secretsWords = [];
    this.words = [];
    this.indexList = 0;
    this.cursor = 0;
  }

  async loadWords() {
    const response = await fetch("../words/words.json");
    const { words } = await response.json();
    this.words = words;
  }

  async loadSecretWords() {
    const response = await fetch("../words/secretsWords.json");
    const { secretsWords } = await response.json();
    this.secretsWords = secretsWords;
  }

  defineSecretWord() {
    const currentDate = new Date().toLocaleDateString();
    const saved = localStorage.getItem("secret");

    const toGenerate = () => {
      const random = Math.floor(Math.random() * this.secretsWords.length);
      const generatedDate = new Date().toLocaleDateString();
      const secret = this.secretsWords[random];

      const save = {
        date: generatedDate,
        wordSecret: secret,
      }

      localStorage.setItem("secret", JSON.stringify(save));
    }

    if (saved === null) {
      toGenerate();
      return;
    }

    const { date } = JSON.parse(saved);

    if (date !== currentDate) {
      toGenerate();
    }
  }

  activeIndexList() {
    this.letters.forEach(el => {
      el.classList.remove("activeField");

      if (+el.dataset.indexlist === this.indexList) {
        el.classList.add("activeField");
      }
    });
  }

  addLetter(letter) {
    const activeLetters = document.querySelectorAll(".activeField");
    activeLetters[this.cursor].innerHTML = letter;
    this.cursor > 4 ? this.cursor = 4 : this.cursor++
  }

  deleteLetter() {
    const activeLetters = document.querySelectorAll(".activeField");
    activeLetters[this.cursor - 1].innerHTML = "";
    this.cursor <= 0 ? this.cursor = 0 : this.cursor--
  }

  cursorActive() {
    const activeLetters = document.querySelectorAll(".activeField");

    activeLetters.forEach(el => {
      el.classList.remove("activeFieldTransition");
    });

    activeLetters[this.cursor].classList.add("activeFieldTransition");
  }

  async checkLetter() {
    const activeLetters = document.querySelectorAll(".activeField");
    let concatenatedLetters = "";

    activeLetters.forEach(el => {
      concatenatedLetters += el.innerHTML;
    });

    if (concatenatedLetters.length < 5) {
      this.alertMsg("Complete todos os campos.");
      return;
    }

    const include = this.words.some(word => this.removeAccents(word).toLowerCase().includes(concatenatedLetters));
    const index = this.words.findIndex(word => this.removeAccents(word).toLowerCase().includes(concatenatedLetters));

    if (include) {
      this.CheckingLetter(index)
    } else {
      this.alertMsg("Essa palavra é inválida.");
      this.resetActiveLetters();
    }
  }

  CheckingLetter(indexWord) {
    const activeLetters = document.querySelectorAll(".activeField");
    const word = this.words[indexWord];
    const saved = localStorage.getItem("secret");
    const { wordSecret } = JSON.parse(saved);
    const colors = {
      fieldColor: "#312A2C",
      fieldIncludeColor: "#D3AD69",
      fieldRightPlaceColor: "#3AA394",
    }
    const time = 400;
    let index = 0;

    const timer = setInterval(() => {
      activeLetters[index].classList.add("transition");
      const letter = word[index];

      activeLetters[index].style.border = "0px solid transparent";
      activeLetters[index].style.background = colors.fieldColor;
      activeLetters[index].innerHTML = letter;

      if (this.removeAccents(wordSecret).includes(this.removeAccents(letter))) {
        activeLetters[index].style.border = "0px solid transparent";
        activeLetters[index].style.background = colors.fieldIncludeColor;
      }

      if (this.removeAccents(wordSecret)[index] === this.removeAccents(letter)) {
        activeLetters[index].style.border = "0px solid transparent";
        activeLetters[index].style.background = colors.fieldRightPlaceColor;
      }

      index++;

      if (index >= activeLetters.length) {
        clearInterval(timer);

        setTimeout(() => {
          this.nextLine(word);
        }, time);
      }
    }, time);
  }

  nextLine(word) {
    const saved = localStorage.getItem("secret");
    const { wordSecret } = JSON.parse(saved);

    if (word === wordSecret) {
      this.screenEnd(this.indexList)
    } else {
      this.indexList >= 5 ? this.screenEnd(this.indexList + 1) : this.indexList++;
      this.cursor = 0;
      this.activeIndexList();
    }
  }

  screenEnd(index) {
    const messageWord = document.querySelector(".message-word");
    const screenEnd = document.querySelector(".screen-end");
    const keyboard = document.querySelector(".keyboard");
    const area = document.querySelectorAll(".area");
    const table = document.querySelector(".table");
    const timer = document.querySelector(".timer");
    const compliments = ["Magnífico", "Esplêndido", "Maravilhoso", "Impressionante", "Excelente", "Ótimo", "Derrota"]

    screenEnd.classList.add("active");
    keyboard.classList.add("disabled");
    table.classList.add("disabled");

    setInterval(() => {
      timer.innerHTML = this.updateCountdown();
    }, 1000);

    messageWord.innerHTML = compliments[index];
    area[index].classList.add("active");
  }

  updateCountdown() {
    const date = new Date();

    const time = date.toLocaleTimeString("pt-br", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const [hh, mm, ss] = time.split(":");

    const hour = 23 - +hh;
    const minute = 59 - +mm;
    const second = 59 - +ss;

    return `${hour < 10 ? "0" + hour : hour}:${minute < 10 ? "0" + minute : minute}:${second < 10 ? "0" + second : second}`;
  }

  removeAccents(word) {
    return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  resetActiveLetters() {
    const activeLetters = document.querySelectorAll(".activeField");

    activeLetters.forEach(el => {
      el.innerHTML = "";
    });

    this.cursor = 0;
  }

  alertMsg(msg) {
    const alertBox = document.querySelector(".alert");
    const msgSpan = document.querySelector(".msg");
    const closeAlertBox = 3000;

    msgSpan.innerHTML = msg;
    alertBox.classList.add("active");

    setTimeout(() => {
      alertBox.classList.remove("active");
      msgSpan.innerHTML = "";
    }, closeAlertBox);
  }

  keyboard() {
    const handleClick = (event) => {
      const btn = event.target.closest(".buttons").value;

      try {
        if (btn === "del") {
          this.deleteLetter();
        } else if (btn === "enter") {
          this.checkLetter();
        } else {
          this.addLetter(btn);
        }

        this.cursorActive();
      } catch { }
    }

    this.buttons.forEach(btn => {
      btn.addEventListener("click", handleClick);
    });
  }

  async init() {
    await this.loadWords();
    await this.loadSecretWords();
    this.defineSecretWord();
    this.activeIndexList();
    this.keyboard();
  }
}

const termo = new Termo();
termo.init();
