/*
   __      _                _    __      _ _
  / _|    (_)              | |  / _|    (_) |
 | |_ _ __ _  ___ _ __   __| | | |_ __ _ _| |
 |  _| '__| |/ _ \ '_ \ / _` | |  _/ _` | | |
 | | | |  | |  __/ | | | (_| |_| || (_| | | |
 |_| |_|  |_|\___|_| |_|\__,_(_)_| \__,_|_|_|

(C) 2017 olepetterstokke.no

*/

var turn = 0;							//tur, = antall spillere per runde
var round = 0;							//runde, = maks antall spillere
var game = 1;							//spill, = telles en og en for hver gang alle runder spilt, brukes ikke
var totalRounds = 0;                    //antall runder som skal spilles, for riktig telling
var players = [];						//array med alle spillerobjektene, for å finne en og en spiller
var playerCount = 0; 					//antall spillere totalt, for å telle turer osv
var currentPlayer = 0;					//den spilleren som svarer/gjetter
var currentFocus = -1;					//den spilleren som svarer, altså gir fasit
var inputCounter = -1;					//teller for å lage/slette navne-tekstboksene
var currentQuestions = [];				//lagrer spørsmåla for å hente tilbake til resultater
var sortedPlayers = [];                 //array for poengsortert vinnerliste

//spilleren-objekt, ett nytt per spiller, inn i players-array
function Player(name,score,answers) {
  this.name = name;
  this.score = score;
  this.answers = [];

  //regne ut denne spillerens poeng
  this.calculateMyScore = function() {
    for (i = 0; i < 5; i++) {
        if (players[currentFocus].answers[i] == this.answers[i]) {
            this.score++;
        }
    }
  }
}

//dokumentet lastes
window.onload = function() { 
    $("#playArea, #button-answer, #button-newRound, #button-newGame, #button-exitGame, #button-back, #menu-help, #menu-about").hide();
    hideQuestions();
    $("#topText").html("Add your players (2-6):");
}

//menyen
function menuPlay() {
    $("#menu").hide();
    $("#playArea").show();
}

//menyen
function menuAbout() { 
    $("#button-startGame, #button-help, #button-about").hide();
    $("#menu-about, #button-back").show();
    $("#span-Questions").html(questions.length);
}

//menyen
function menuHelp() { 
    $("#button-startGame, #button-help, #button-about").hide();
    $("#menu-help, #button-back").show();
}

//menyen
function menuBack() { 
    $("#menu-about, #menu-help, #button-back").hide();
    $("#button-startGame, #button-help, #button-about").show();
}

//TRYKK på ok-knapp på startskjerm
function confirmPlayers() { 
	writeDebug(arguments.callee.name);

    //legge til spillerne
    if (inputCounter>=1) {
        if (document.getElementById("input0").value && document.getElementById("input1").value) {

            for (i = 0; i < document.getElementById("textFields").childNodes.length; i++) {
                if (document.getElementById("input"+i).value) {
                    players.push(new Player (document.getElementById("input"+i).value,0));
                }
            }

            playerCount = players.length;
            totalRounds = playerCount;
            turn = 1;

			//fjerne tekstfelt
            for (i = 0; i <= inputCounter; i++) {
                $("#input" + i).remove();
            }

            //vise spillernavn uten å regne ut poeng, som gir bug første gang
            $("#scoreCounter").html("");
            for (i = 0; i < playerCount; i++) {
                document.getElementById("scoreCounter").innerHTML+=players[i].name.substring(0,3).toUpperCase() + ":" + players[i].score + " ";
            }

            $("#button-add").hide();
            $("#button-confirm").hide();

            startNewRound();
        }

        else {
            $("#topText").html("Add your players (at least 2):");
        }
    }

    else {
        $("#topText").html("Add your players (at least 2):");
    }
}

//TRYKK på svareknapp, styrer rundene og hele logikken
function confirmAnswers() { 
	writeDebug(arguments.callee.name);

    //alle svar inn i objekt
    for (i = 1; i < 6; i++) {
        players[currentPlayer].answers.push(document.getElementById("yes"+i).checked);
    }

    if (currentPlayer==playerCount-1) { //hoppe fra eventuell sistemann til førstemann
        currentPlayer=0;
    }

    else { //gå fra forrigemann til nestemann vanligvis
        currentPlayer++;
    }

    if (turn<playerCount-1) { //alle svar ikke avgitt
        startNewTurn();
    }
    else if (turn==playerCount-1) { //alle svar avgitt, avslutt runda
        endRound();
    }
}

//starte ny turn, ny spiller skal svare
function startNewTurn () { 
	writeDebug(arguments.callee.name);

    turn++;
    uncheckAll();
    window.scrollTo(0,0);
    $("#topText").html(players[currentPlayer].name + ", guess " + players[currentFocus].name + "'s answers, in secret:</br>");
}

//round er ferdig, resultater skal gis
function endRound () { 
	writeDebug(arguments.callee.name);

    if (round==totalRounds) { //om alle av x runder spilt, ett game spilt
        endGame();
    }

    else { //bare runda er slutt, resultater og newround-knapp skal vises
        hideQuestions();
        displayScores();
        writeEndRoundText();
        document.getElementById("topText").innerHTML += players[currentFocus].name + "'s round complete.</br> Next up: " + players[currentPlayer+1].name+"!";
        $("#button-answer").hide();
        $("#button-newRound").show();
    }
}

//TRYKK på newround-knapp, eller fra newgame-knapp/funksjon
function startNewRound () {
	writeDebug(arguments.callee.name);

    round++;
    turn = 0;

    if (currentFocus==playerCount-1) {
        currentFocus=0;
    }

    else {
        currentFocus++;
    }

    currentPlayer=currentFocus;

    clearAnswers();

    $("#button-newRound").hide();
    $("#button-answer").show();
    $("#roundCounter").html("Round " + round + "/" + totalRounds + ": Let's talk about");
    $("#roundName").html("<i class='material-icons md-36'>favorite</i>" + players[currentFocus].name+"<i class='material-icons md-36'>favorite</i>");
    $("#topText").html(players[currentPlayer].name + ", give us the truth, in secret:");
    window.scrollTo(0,0);

    loadQuestion();
    uncheckAll();
}

//et game er slutt
function endGame() {
	writeDebug(arguments.callee.name);

    hideQuestions();
    displayScores();
    writeEndRoundText();
    writeEndGameResults ();

    document.getElementById("topText").innerHTML+="More rounds?";
    $("#button-answer").hide();
    $("#button-newGame, #button-exitGame").show();
}

//TRYKK på nytt game-knapp, starte nytt game
function startNewGame () {
	writeDebug(arguments.callee.name);

    game++;
    totalRounds = totalRounds + playerCount;
    $("#button-newGame, #button-exitGame").hide();
    startNewRound();
}

//skrive teksten når alle runder og dermed game er over
function writeEndGameResults () {
    sortedPlayers.length = 0;               //tømme helt - alle rare måter skyldes bug hvor sorted tok over players
    sortedPlayers = players.slice();        //legge inn fra players - må ha to arrays så bare gjelder scoretekst
    
    sortedPlayers.sort(function (a, b) {     //sortere etter score, ikke spør, ga mening en gang
        return a.score - b.score;
    });

    document.getElementById("topText").innerHTML += "The results are in. Out of " + (game*(playerCount-1)*5) + " points:</br>";

    for (i = 0; i < playerCount; i++) {
        if (i<playerCount) { //ikke vinner
            document.getElementById("topText").innerHTML+="&#8226; "+sortedPlayers[i].name+" got "+sortedPlayers[i].score+", and failed as a friend.</br>";
        }
        if (i==(playerCount-1)) { //vinner
            document.getElementById("topText").innerHTML+="&#8226; "+sortedPlayers[i].name+" got "+sortedPlayers[i].score+", and wins!</br></br><hr></br>";
            return;
        }
    }

}

//laste inn fem spørsmål til fem tekster
function loadQuestion()	{
	writeDebug(arguments.callee.name);

    currentQuestions.length = 0; //tømme arrayen før laste nye
    console.log("tømt arrayen, nå: " + currentQuestions);

    //må starte på 1 og gå til 6 pga html-objektene som starter på 1
    for (i = 1; i < 6; i++) {
        randomNumber = Math.floor((Math.random() * questions.length));
        randomQuestion = questions[randomNumber];
        currentQuestions.push(randomQuestion);
        $("#question"+i).html("</br>"+randomQuestion);
        $("#questionArea"+i).show();
        questions.splice(randomNumber,1);
    }

    console.log("nye spørsmål: " + currentQuestions);
}

//skrive teksten på slutten av hver runde
function writeEndRoundText() {
	writeDebug(arguments.callee.name);

    window.scrollTo(0,0);
    document.getElementById("topText").innerHTML = "";
    document.getElementById("topText").innerHTML += players[currentFocus].name + ", read the fails out loud: </br></br>";

    console.log("laster spørsmål: " + currentQuestions);

    //i = aktuelle spørsmålet
    for (i = 0; i < 5; i++) {
        document.getElementById("topText").innerHTML += "<i>&laquo" + currentQuestions[i] + "&raquo</i></br>"; //dette spørsmålet:

        e = 0; //hente fra motspillere (e)
        while(e < playerCount) {
            if (e==currentFocus) { //ikke hente fra current
                e++;
            }
            else {
                if (players[e].answers[i] == players[currentFocus].answers[i]) { //om riktig svar
                    document.getElementById("topText").innerHTML += "&#8226; " + players[e].name + " got it!</br>";
                }
                else { //om galt svar
                    document.getElementById("topText").innerHTML += "&#8226; " + players[e].name + " failed.</br>";
                }
                e++;
            }
        }
 
        //hva fasit er
        if (players[currentFocus].answers[i]) { //jeg agreed
            document.getElementById("topText").innerHTML += "&#8226; I agreed.";
        }
        else { //jeg disagreed
            document.getElementById("topText").innerHTML += "&#8226; I disagreed.";
        }

        document.getElementById("topText").innerHTML += "</br></br><hr></br>"; //separere bolker
    }
}

//sette nye poeng i topptekst
function displayScores () {
	writeDebug(arguments.callee.name);

    //regne ut poeng for hver spiller
    for (i = 0; i < playerCount; i++) {
        if (i != currentFocus) {
            players[i].calculateMyScore();
        }
    }

    //sette poeng i toppteksten
    $("#scoreCounter").html("");
    for (i = 0; i < playerCount; i++) {
        document.getElementById("scoreCounter").innerHTML += players[i].name.substring(0,3).toUpperCase() + ":" + players[i].score + " ";
    }
}

//skjule alle spørsmål
function hideQuestions () {
	writeDebug(arguments.callee.name);

    for (i = 1; i < 6; i++) {
        $("#questionArea"+i).hide();
    }
}

//fjerne svar fra player-objektet, så nye kan mates inn
function clearAnswers () {
	writeDebug(arguments.callee.name);

    for (i = 0; i < playerCount; i++) {
        players[i].answers=[];
    }
}

//fjerne haker fra radioknappene
function uncheckAll () {
	writeDebug(arguments.callee.name);

    for (i = 1; i < 6; i++) {
        $("#yes"+i).iCheck('uncheck');
        $("#no"+i).iCheck('uncheck');
    }
}

//legge til navnetekstfelt
function addTextField () {
	writeDebug(arguments.callee.name);

    if (inputCounter<5) {
        inputCounter++;

        var newField = document.createElement("input");
            newField.id = "input" + inputCounter;
            newField.type = "text";
            newField.style = "display:none";
            newField.placeholder = "name";
            newField.maxLength = "10";

        var element = document.getElementById("textFields");
            element.appendChild(newField);

        $("#input"+inputCounter).show()
    }
}

//TRYKK på ikke flere runder
function exitGame () {
    location.reload();
}

//skriver ut hvilken funksjon som kjøres, og hva statsa er
function writeDebug (functionName) {
	if (functionName=="startNewGame" || functionName=="startNewRound") {
		console.log("------>"+functionName+"(focus:"+currentFocus+"|game:"+game+"|round:"+round+"|turn:"+turn+")");
    }
    
	else {
		console.log(functionName+"(focus:"+currentFocus+"|game:"+game+"|round:"+round+"|turn:"+turn+")");
	}
}

/*
   __      _                _    __      _ _
  / _|    (_)              | |  / _|    (_) |
 | |_ _ __ _  ___ _ __   __| | | |_ __ _ _| |
 |  _| '__| |/ _ \ '_ \ / _` | |  _/ _` | | |
 | | | |  | |  __/ | | | (_| |_| || (_| | | |
 |_| |_|  |_|\___|_| |_|\__,_(_)_| \__,_|_|_|
                                             (C)2017
*/