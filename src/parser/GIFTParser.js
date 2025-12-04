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
    this.errMsg("symbol " + s + " unknown", [" "]);
    return false;
  }

  return idx;
};

// check : check whether the arg elt is on the head of the list
GIFTParser.prototype.check = function (s, input) {
  if (this.accept(input[0]) == this.accept(s)) {
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
  this.expect("::", input);
  const questionId = this.questionId(input);
  this.expect("::", input);

  let questionText = this.enonce(input);

  const hasAnswerBlock = this.check("{", input);

  if (hasAnswerBlock) {
    this.expect("{", input);
    let { reponses, bonneReponses, possedeMauvaideReponse, possedeAssocie } =
      this.answerset(input);

    let meta = this.metadata(input);

    this.expect("}", input);

    let suiteQuestion = this.enonce(input);

    if (suiteQuestion.length > 0) {
      questionText += " ___ " + suiteQuestion;
    }

    let type = this.type(bonneReponses, possedeMauvaideReponse, possedeAssocie);

    const q = new Question(
      questionId,
      questionText,
      type,
      reponses,
      bonneReponses
    );

    q.metadata = meta;
    this.parsedQuestions.push(q);
  } else {
    while (input.length > 0 && (input[0] === "\n" || input[0] === "\r")) {
      this.next(input);
    }

    const q = new Question(questionId, questionText, "DESC", [], []);
    this.parsedQuestions.push(q);
  }

  return true;
};

GIFTParser.prototype.answerset = function (input) {
  var reponses = [];
  var bonneReponses = [];
  var possedeMauvaideReponse = false;
  var possedeAssocie = false;

  while (input.length > 0 && input[0] !== "}") {
    var sym = input[0];
    if (sym.startsWith("TRUE") || sym.startsWith("T#") || sym === "T") {
      this.next(input);
      reponses.push("TRUE");
      reponses.push("FALSE");
      bonneReponses.push("TRUE");
      continue;
    }

    if (sym.startsWith("FALSE") || sym.startsWith("F#") || sym === "F") {
      this.next(input);
      reponses.push("TRUE");
      reponses.push("FALSE");
      bonneReponses.push("FALSE");
      continue;
    }

    if (sym === "=" || sym === "~") {
      this.next(input);

      var answerText = this.next(input);
      if (!answerText || answerText === "}") {
        continue;
      }

      if (answerText.includes("->")) {
        possedeAssocie = true;
        let parts = answerText.split("->");
        let left = parts[0].trim();
        let right = parts[1].trim();
        reponses.push(left);
        bonneReponses.push(right);
        continue;
      }

      answerText = answerText.split("#")[0].trim();

      if (sym === "~") {
        reponses.push(answerText);
        var possedeMauvaideReponse = true;
      } else if (sym === "=") {
        reponses.push(answerText);
        bonneReponses.push(answerText);
      }
    } else {
      this.next(input);
    }
  }
  return {
    reponses,
    bonneReponses,
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
    input[0] !== "::"
  ) {
    result.push(this.next(input));
  }

  return result.join(" ");
};

GIFTParser.prototype.questionId = function (input) {
  return this.next(input);
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
  bonneReponses,
  possedeMauvaideReponse,
  possedeAssocie
) {
  if (possedeAssocie) {
    return "MATCH";
  }

  if (
    bonneReponses.length === 1 &&
    (bonneReponses[0] === "TRUE" || bonneReponses[0] === "FALSE")
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
