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
  data = data
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .filter((line) => !line.trim().startsWith("$CATEGORY"))
    .join("\n");

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
    //console.log("Reckognized! "+s)
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

// question = title "::" question-title "::" question-text CRLF [answerset / metadata / subquestion *subquestion] *CRLF
GIFTParser.prototype.question = function (input) {
  // 1. :: title ::
  //const title = this.title(input);
  //this.expect("::", input);

  // 2. :: question-title ::
  this.expect("::", input);
  const questionTitle = this.questionTitle(input);
  this.expect("::", input);

  // 3. question-text / enonce
  const questionText = this.questionText(input);

  // 4. Bloc réponses
  this.expect("{", input);
  let { reponses, bonneReponses, type } = this.answerset(input);

  // 5. Metadata
  let meta = this.metadata(input);

  // 6. Sous-questions
  let subs = this.subquestions(input);

  this.expect("}", input);

  // 7. Construire l’objet Question
  const q = new Question(
    questionTitle,
    questionText,
    type || "MC",
    reponses,
    bonneReponses
  );

  q.metadata = meta;
  q.subquestions = subs;
  this.parsedQuestions.push(q);

  return true;
};

GIFTParser.prototype.title = function (input) {
  return this.next(input);
};

GIFTParser.prototype.answerset = function (input) {
  var reponses = [];
  var bonneReponses = [];
  var typeQuestion = null;

  const prefixRegex = /^(\d+):(MC|SA|TF|NUM|MATCH|ESSAY|DESC):/;

  while (input.length > 0 && input[0] !== "}") {
    var sym = input[0];
    this.next(input);
    var answerText = this.next(input);

    const prefixMatch = answerText.match(prefixRegex);

    if (prefixMatch) {
      typeQuestion = prefixMatch[2];
      answerText = answerText.replace(prefixRegex, "").trim();
    }

    switch (sym) {
      case "~":
        reponses.push(answerText);
        break;
      case "=":
        reponses.push(answerText);
        bonneReponses.push(reponses.length);
        break;
      default:
        break;
    }
  }
  return { reponses, bonneReponses };
};

GIFTParser.prototype.questionText = function (input) {
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

GIFTParser.prototype.subquestions = function (input) {
  let subs = [];
  while (this.check("::", input)) {
    this.expect("::", input);
    let id = this.questionTitle(input);
    this.expect("::", input);
    let text = this.questionText(input);
    let answers = this.answerset(input);
    subs.push({ id, text, answers });
  }
  return subs;
};

GIFTParser.prototype.questionTitle = function (input) {
  // :: identifier ::
  //identifier = 1*(ALPHA / DIGIT / "_" / "-" / "." / " ")
  return this.next(input);
};

GIFTParser.prototype.metadata = function (input) {
  let meta = {};
  while (input.length > 0 && input[0] === "[") {
    this.expect("[", input);
    let key = this.next(input); // récupère le nom
    this.expect("]", input);
    let value = [];

    // collecter le reste de la ligne jusqu’au CRLF
    while (input.length > 0 && input[0] !== "\n" && input[0] !== "\r") {
      value.push(this.next(input));
    }

    meta[key] = value.join(" ").trim();

    // consommer le CRLF
    if (input[0] === "\n" || input[0] === "\r") this.next(input);
  }
  return meta;
};

module.exports = GIFTParser;
