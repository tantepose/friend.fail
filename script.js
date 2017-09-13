/*
   __      _                _    __      _ _
  / _|    (_)              | |  / _|    (_) |
 | |_ _ __ _  ___ _ __   __| | | |_ __ _ _| |
 |  _| '__| |/ _ \ '_ \ / _` | |  _/ _` | | |
 | | | |  | |  __/ | | | (_| |_| || (_| | | |
 |_| |_|  |_|\___|_| |_|\__,_(_)_| \__,_|_|_|

(C)2017 olepetterstokke.no

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

function Player(name,score,answers)	    //spilleren-objekt, ett nytt per spiller, inn i players-array
{
  this.name = name;
  this.score = score;
  this.answers = [];

  this.calculateMyScore = function()	//regne ut denne spillerens poeng
  {
    i=0;
    while(i<5)
    {
        if (players[currentFocus].answers[i] == this.answers[i])
            {
                this.score++;
            }
        i++;
    }
  }
}

window.onload = function()	//dokumentet lastes
{
    $("#playArea, #button-answer, #button-newRound, #button-newGame, #button-exitGame, #button-back, #menu-help, #menu-about").hide();
    hideQuestions();
    $("#topText").html("Add your players (2-6):");
}

function menuPlay() //menyen
{
    $("#menu").hide();
    $("#playArea").show();
}

function menuAbout()    //menyen
{
    $("#button-startGame, #button-help, #button-about").hide();
    $("#menu-about, #button-back").show();
    $("#span-Questions").html(questions.length);
}

function menuHelp() //menyen
{
    $("#button-startGame, #button-help, #button-about").hide();
    $("#menu-help, #button-back").show();
}

function menuBack() //menyen
{
    $("#menu-about, #menu-help, #button-back").hide();
    $("#button-startGame, #button-help, #button-about").show();
}

function confirmPlayers()	//TRYKK på ok-knapp på startskjerm
{
	writeDebug(arguments.callee.name);

    //legge til spillerne
    if (inputCounter>=1)
    {
        if (document.getElementById("input0").value && document.getElementById("input1").value)
        {
            i=0;
            while (i<document.getElementById("textFields").childNodes.length)
            {
                if (document.getElementById("input"+i).value)
                {
                    players.push(new Player (document.getElementById("input"+i).value,0));
                }
                i++;
            }

            playerCount = players.length;
            totalRounds = playerCount;
            turn = 1;

			//fjerne tekstfelt
            e=0;
            while (e<=inputCounter)
            {
                $("#input"+e).remove();
                e++;
            }

            //vise spillernavn uten å regne ut poeng, som gir bug første gang
            $("#scoreCounter").html("");
            i=0;
            while (i<playerCount)
            {
                document.getElementById("scoreCounter").innerHTML+=players[i].name.substring(0,3).toUpperCase() + ":" + players[i].score + " ";
                i++;
            }

            $("#button-add").hide();
            $("#button-confirm").hide();

            startNewRound();
        }

        else
        {
            $("#topText").html("Add your players (at least 2):");
        }
    }

    else
    {
        $("#topText").html("Add your players (at least 2):");
    }
}

function confirmAnswers()	//TRYKK på svareknapp, styrer rundene og hele logikken
{
	writeDebug(arguments.callee.name);

    i = 1;      //alle svar inn i objekt
    while (i<6)
    {
        players[currentPlayer].answers.push(document.getElementById("yes"+i).checked);
        i++;
    }

    if (currentPlayer==playerCount-1)   //hoppe fra eventuell sistemann til førstemann
    {
        currentPlayer=0;
    }
    else                                //gå fra forrigemann til nestemann vanligvis
    {
        currentPlayer++;
    }

    if (turn<playerCount-1)               //alle svar ikke avgitt
    {
        startNewTurn();
    }
    else if (turn==playerCount-1)
    {
        endRound();                     //alle svar avgitt, avslutt runda
    }
}

function startNewTurn ()	//starte ny turn, ny spiller skal svare
{
	writeDebug(arguments.callee.name);

    turn++;
    uncheckAll();
    window.scrollTo(0,0);
    $("#topText").html(players[currentPlayer].name + ", guess " + players[currentFocus].name + "'s answers, in secret:</br>");
}

function endRound ()	//round er ferdig, resultater skal gis
{
	writeDebug(arguments.callee.name);

    if (round==totalRounds)     //om alle av x runder spilt, ett game spilt
    {
        endGame();
    }
    else                        //bare runda er slutt, resultater og newround-knapp skal vises
    {
        hideQuestions();
        displayScores();
        writeEndRoundText();
        document.getElementById("topText").innerHTML += players[currentFocus].name + "'s round complete.</br> Next up: " + players[currentPlayer+1].name+"!";
        $("#button-answer").hide();
        $("#button-newRound").show();
    }
}

function startNewRound ()	//TRYKK på newround-knapp, eller fra newgame-knapp/funksjon
{
	writeDebug(arguments.callee.name);

    round++;
    turn = 0;

    if (currentFocus==playerCount-1)
    {
        currentFocus=0;
    }
    else
    {
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

function endGame()	//et game er slutt
{
	writeDebug(arguments.callee.name);

    hideQuestions();
    displayScores();
    writeEndRoundText();
    writeEndGameResults ();

    document.getElementById("topText").innerHTML+="More rounds?";
    $("#button-answer").hide();
    $("#button-newGame, #button-exitGame").show();
}

function startNewGame ()	//TRYKK på nytt game-knapp, starte nytt game
{
	writeDebug(arguments.callee.name);

    game++;
    totalRounds = totalRounds + playerCount;
    $("#button-newGame, #button-exitGame").hide();
    startNewRound();
}

function writeEndGameResults ()     //skrive teksten når alle runder og dermed game er over
{
    sortedPlayers.length = 0;               //tømme helt - alle rare måter skyldes bug hvor sorted tok over players
    sortedPlayers = players.slice();        //legge inn fra players - må ha to arrays så bare gjelder scoretekst
    sortedPlayers.sort(function (a, b)      //sortere etter score, ikke spør, ga mening en gang
    {
        return a.score - b.score;
    });

    document.getElementById("topText").innerHTML+="The results are in. Out of "+(game*(playerCount-1)*5)+" points:</br>";
    i=0;
    while (i<playerCount)
    {
        if (i<playerCount)              //ikke vinner
        {
            document.getElementById("topText").innerHTML+="&#8226; "+sortedPlayers[i].name+" got "+sortedPlayers[i].score+", and failed as a friend.</br>";
            i++;
        }
        if (i==(playerCount-1))    //vinner
        {
            document.getElementById("topText").innerHTML+="&#8226; "+sortedPlayers[i].name+" got "+sortedPlayers[i].score+", and wins!</br></br><hr></br>";
            return;
        }
    }
}

function loadQuestion()	//laste inn fem spørsmål til fem tekster
{
	writeDebug(arguments.callee.name);

    currentQuestions.length = 0;   //tømme arrayen før laste nye
    console.log("tømt arrayen, nå: " + currentQuestions);

    i=1;                //må starte på 1 og gå til 6 pga html-objektene som starter på 1
    while (i<6)
    {
        randomNumber = Math.floor((Math.random() * questions.length));
        randomQuestion = questions[randomNumber];
        currentQuestions.push(randomQuestion);
        $("#question"+i).html("</br>"+randomQuestion);
        $("#questionArea"+i).show();
        questions.splice(randomNumber,1);
        i++;
    }
    console.log("nye spørsmål: " + currentQuestions);
}

function writeEndRoundText()	//skrive teksten på slutten av hver runde
{
	writeDebug(arguments.callee.name);

    window.scrollTo(0,0);
    document.getElementById("topText").innerHTML = "";
    document.getElementById("topText").innerHTML += players[currentFocus].name + ", read the fails out loud: </br></br>";

    console.log("laster spørsmål: " + currentQuestions);

    i=0;                                                                                                //i = aktuelle spørsmålet
    while(i<5)
    {
        document.getElementById("topText").innerHTML += "<i>&laquo" + currentQuestions[i] + "&raquo</i></br>"; //dette spørsmålet:

        e=0;                                                                                            //hente fra motspillere (e)
        while(e<playerCount)
        {
            if (e==currentFocus)                                                                        //ikke hente fra current
            {
                e++;
            }
            else
            {
                if (players[e].answers[i] == players[currentFocus].answers[i])                          //om riktig svar
                {
                    document.getElementById("topText").innerHTML += "&#8226; " + players[e].name + " got it!</br>";
                }
                else                                                                                    //om galt svar
                {
                    document.getElementById("topText").innerHTML += "&#8226; " + players[e].name + " failed.</br>";
                }
                e++;
            }
        }
                                                                                                        //hva fasit er
        if (players[currentFocus].answers[i])                                                           //jeg agreed
        {
            document.getElementById("topText").innerHTML += "&#8226; I agreed.";
        }
        else                                                                                            //jeg disagreed
        {
            document.getElementById("topText").innerHTML += "&#8226; I disagreed.";
        }
            document.getElementById("topText").innerHTML += "</br></br><hr></br>";                               //separere bolker
        i++;
    }
}

function displayScores ()	//sette nye poeng i topptekst
{
	writeDebug(arguments.callee.name);

    //regne ut poeng for hver spiller
    e=0;
    while(e<playerCount)
    {
        if (e!=currentFocus)
        {
            players[e].calculateMyScore();
        }
        e++;
    }

    //sette poeng i toppteksten
    $("#scoreCounter").html("");
    i=0;
    while (i<playerCount)
    {
        document.getElementById("scoreCounter").innerHTML += players[i].name.substring(0,3).toUpperCase() + ":" + players[i].score + " ";
        i++;
    }
}

function hideQuestions ()	//skjule alle spørsmål
{
	writeDebug(arguments.callee.name);

    i=1;
    while (i<6)
    {
        $("#questionArea"+i).hide();
        i++;
    }
}

function clearAnswers ()	//fjerne svar fra player-objektet, så nye kan mates inn
{
	writeDebug(arguments.callee.name);

    i=0;
    while (i<playerCount)
    {
        players[i].answers=[];
        i++;
    }
}

function uncheckAll ()	//fjerne haker fra radioknappene
{
	writeDebug(arguments.callee.name);

    i=1;
    while (i<6)
    {
        $("#yes"+i).iCheck('uncheck');
        $("#no"+i).iCheck('uncheck');
        i++;
    }
}

function addTextField ()	//legge til navnetekstfelt
{
	writeDebug(arguments.callee.name);

    if (inputCounter<5)
    {
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

function exitGame () //TRYKK på ikke flere runder
{
    location.reload();
}

function writeDebug (functionName)	//skriver ut hvilken funksjon som kjøres, og hva statsa er
{
	if (functionName=="startNewGame" || functionName=="startNewRound")
	{
		console.log("------>"+functionName+"(focus:"+currentFocus+"|game:"+game+"|round:"+round+"|turn:"+turn+")");
	}
	else
	{
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

    speed=300;
    $("#questionArea1").fadeIn(speed,function(){
        $("#questionArea2").fadeIn(speed,function(){
        $("#questionArea3").fadeIn(speed,function(){
        $("#questionArea4").fadeIn(speed,function(){
        $("#questionArea5").fadeIn(speed)})})})});

*/
