var Question = require("../model/Question.js");

var GIFTParser = function (sTokenize, sParsedSymb) {
  this.parsedQuestions = [];
  this.symb = ["::", "{", "}", "~", "="];
  this.showTokenize = sTokenize;
  this.showParsedSymbols = sParsedSymb;
  this.errorCount = 0;
};

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
GIFTParser.prototype.tokenize = function (data) {
  data = data
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .filter((line) => !line.trim().startsWith("$CATEGORY:"))

    .join("\n");

  var separator = /(::|\{|\}|~|=|\[|\])/g;
  data = data.split(separator);

  data = data.map((s) => s.trim()).filter((s) => s.length > 0);

  if (this.showTokenize) {
    console.log(data);
  }

  return data;
};

// parse : analyze data by calling the first non terminal rule of the grammar
GIFTParser.prototype.parse = function (data) {
  var tData = this.tokenize(data);
  if (this.showTokenize) {
    console.log(tData);
  }
  this.listQuestions(tData);
};

// Parser operand

GIFTParser.prototype.errMsg = function (msg, input) {
  this.errorCount++;
  console.log("Parsing Error ! on " + input + " -- msg : " + msg);
};

// Read and return a symbol from input
GIFTParser.prototype.next = function (input) {
  var curS = input.shift();
  if (this.showParsedSymbols) {
    console.log(curS);
  }
  return curS;
};

// accept : verify if the arg s is part of the language symbols.
GIFTParser.prototype.accept = function (s) {
  var idx = this.symb.indexOf(s);
  // index 0 exists
  if (idx === -1) {
    return false;
  }

  return idx;
};

// check : check whether the arg elt is on the head of the list
GIFTParser.prototype.check = function (s, input) {
  if (this.accept(input[0]) === this.accept(s)) {
    return true;
  }
  return false;
};

// expect : expect the next symbol to be s.
GIFTParser.prototype.expect = function (s, input) {
  if (s == this.next(input)) {
    return true;
  } else {
    this.errMsg("symbol " + s + " doesn't match", input);
  }
  return false;
};

// Parser rules

GIFTParser.prototype.listQuestions = function (input) {
  while (input.length > 0) {
    if (this.check("::", input)) {
      this.question(input);
    } else {
      this.next(input);
    }
  }
};

// question = "::" question-title "::" question-text CRLF [answerset / metadata / subquestion *subquestion] *CRLF
GIFTParser.prototype.question = function (input) {
  //Titre de la question
  this.expect("::", input);
  const questionId = this.questionId(input);
  this.expect("::", input);

  let questionText = "";
  let reponses = [];
  let type = "DESC";
  let meta = {};

  while (input.length > 0) {
    // Gestion retours ligne
    if (input[0] === "\n" || input[0] === "\r") {
      this.next(input);
      continue;
    }

    //Si nouvelle question
    if (input[0] === "::") {
      break;
    }

    if (this.check("{", input)) {
      this.expect("{", input);
      let rep = this.answerset(input);

      reponses = reponses.concat(rep.reponses);

      if (type === "DESC") {
        type = this.type(
          rep.reponses,
          rep.possedeMauvaideReponse,
          rep.possedeAssocie
        );
      }

      this.expect("}", input);
    }
    // Si c'est [markdown] ou [html]
    else if (input[0] === "[") {
      this.next(input);
      let content = "";
      while (input.length > 0 && input[0] !== "]") {
        content += this.next(input);
      }
      this.expect("]", input);
    } else {
      let textSegment = this.enonce(input);
      if (textSegment) {
        questionText += (questionText ? " " : "") + textSegment;
      } else {
        if (input.length > 0 && !this.check("{", input) && input[0] !== "::") {
          this.next(input);
        }
      }
    }
  }

  const q = new Question(questionId, questionText.trim(), type, reponses);

  q.metadata = meta;
  this.parsedQuestions.push(q);

  return true;
};

GIFTParser.prototype.answerset = function (input) {
  var reponses = [];
  var possedeMauvaideReponse = false;
  var possedeAssocie = false;

  while (input.length > 0 && input[0] !== "}") {
    var sym = input[0];

    if (sym.includes(":") && !sym.startsWith("::")) {
      this.next(input);
      continue;
    }

    if (sym.startsWith("TRUE") || sym.startsWith("T#") || sym === "T") {
      this.next(input);
      reponses.push({ resp: "TRUE", isCorrect: true });
      continue;
    }

    if (sym.startsWith("FALSE") || sym.startsWith("F#") || sym === "F") {
      this.next(input);
      reponses.push({ resp: "FALSE", isCorrect: true });
      continue;
    }

    if (sym === "=" || sym === "~") {
      this.next(input);

      if (
        input.length > 0 &&
        (input[0] === "=" || input[0] === "~" || input[0] === "}")
      ) {
        continue;
      }

      var answerText = this.next(input);
      if (!answerText || answerText === "}") {
        continue;
      }

      if (answerText.includes("->")) {
        possedeAssocie = true;
        let parts = answerText.split("->");
        let left = parts[0].trim();
        let right = parts[1].trim();
        reponses.push({ resp: left, assoc: right, isCorrect: true });
        continue;
      }

      let parts = answerText.split("#");
      answerText = parts[0].trim();
      feedback = parts[1] ? parts[1].trim() : "";

      if (sym === "~") {
        if (feedback !== "") {
          reponses.push({ resp: answerText, isCorrect: false, feedback });
        } else {
          reponses.push({ resp: answerText, isCorrect: false });
        }
        possedeMauvaideReponse = true;
      } else if (sym === "=") {
        if (feedback !== "") {
          reponses.push({ resp: answerText, isCorrect: true, feedback });
        } else {
          reponses.push({ resp: answerText, isCorrect: true });
        }
      }
    } else {
      this.next(input);
    }
  }
  return {
    reponses,
    possedeMauvaideReponse,
    possedeAssocie,
  };
};

GIFTParser.prototype.enonce = function (input) {
  let result = [];

  while (
    input.length > 0 &&
    input[0] !== "{" &&
    input[0] !== "\n" &&
    input[0] !== "\r" &&
    input[0] !== "::" &&
    input[0] !== "}" &&
    input[0] !== "["
  ) {
    result.push(this.next(input));
  }

  return result.join(" ");
};

GIFTParser.prototype.questionId = function (input) {
  let questionId = [];
  while (input.length > 0 && input[0] !== "::") {
    questionId.push(this.next(input));
  }
  return questionId.join(" ");
};

GIFTParser.prototype.metadata = function (input) {
  let meta = {};
  while (input.length > 0 && input[0] === "[") {
    this.expect("[", input);
    let key = this.next(input);
    this.expect("]", input);
    let value = [];

    while (input.length > 0 && input[0] !== "\n" && input[0] !== "\r") {
      value.push(this.next(input));
    }

    meta[key] = value.join(" ").trim();

    if (input[0] === "\n" || input[0] === "\r") this.next(input);
  }
  return meta;
};

GIFTParser.prototype.type = function (
  reponses,
  possedeMauvaideReponse,
  possedeAssocie
) {
  if (possedeAssocie) {
    return "MATCH";
  }

  const bonneReponses = reponses.filter((r) => r.isCorrect);

  if (
    bonneReponses.length === 1 &&
    (bonneReponses[0].resp === "TRUE" || bonneReponses[0].resp === "FALSE")
  ) {
    return "TF";
  }

  if (bonneReponses.length === 0 && !possedeMauvaideReponse) {
    return "ESSAY";
  }

  if (bonneReponses.length > 0 && !possedeMauvaideReponse) {
    return "SA";
  }

  if (possedeMauvaideReponse) {
    return "MC";
  }

  return "UNKNOWN";
};

module.exports = GIFTParser;
