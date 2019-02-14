const Story = require('inkjs').Story;
const fs = require('fs');

function InkedTie()
{

    delay_min = 1700;
    delay_max = 15000;

theme = new Theme();
theme.install(document.body);
theme.start();

var tabdataJSON = fs.readFileSync('./story/story.json', 'UTF-8').replace(/^\uFEFF/, '');
var tabdata = JSON.parse(tabdataJSON);

var picleft = document.createElement('img');
picleft.setAttribute("src", "story/"+tabdata.pics["left"]);
picleft.classList.add("profile_pic");
var picright = document.createElement('img');
picright.setAttribute("src", "story/"+tabdata.pics["right"]);
picright.classList.add("profile_pic");

madeAChoice = false;

//load the ink file
//var inkFile = fs.readFileSync('./story/eddy.json', 'UTF-8').replace(/^\uFEFF/, '');
var inkFile = fs.readFileSync('./story/'+tabdata.file, 'UTF-8').replace(/^\uFEFF/, '');

var storyContainer = document.querySelectorAll('#story')[0];
document.querySelector("#story_title").innerHTML = tabdata.title;

//create a new story
var myStory = new Story(inkFile);

storyVar = {};

//myStory.BindExternalFunction("read", function(val) {console.log("doof"); storyVar[val] = "Qoxonfamase"});
//myStory.BindExternalFunction("get", function(val) {return storyVar[val]});

//TODO .currentTags .variablesState["player_health"] = 100;


//continueStory();
//processLine();

function showAfter(delay, el) {
    setTimeout(function() { el.classList.add("show") }, delay);
}

function scrollToBottom() {
    var progress = 0.0;
    var start = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    var dist = document.body.scrollHeight - window.innerHeight - start;
    if( dist < 0 ) return;

    var duration = 300 + 300*dist/100;
    var startTime = null;
    function step(time) {
        if( startTime == null ) startTime = time;
        var t = (time-startTime) / duration;
        var lerp = 3*t*t - 2*t*t*t;
        window.scrollTo(0, start + lerp*dist);
        if( t < 1 ) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function processLine() {
    console.log("CALLING");
    if (!myStory.canContinue && myStory.currentChoices.length === 0) end();

    if(myStory.canContinue) {

        // Get ink to generate the next paragraph
        var paragraphText = myStory.Continue().replace(/^\uFEFF/, '');

        while (paragraphText == "") {
            paragraphText = myStory.Continue();
        }

        if (paragraphText.substring(0, 3) == ">>>") {
            //paragraphText.
            makeTextBox(paragraphText.split(" ")[1].replace(/\s/g,''));
            return;
        }

        console.log(paragraphText);

        mess_container = document.createElement('div');
        mess_container.classList.add("container_mess");

        if (madeAChoice) {
            mess_container.classList.add("right");

            mess_container.appendChild(picright.cloneNode(true));
            madeAChoice = false;
        }
        else {
            mess_container.classList.add("left");

            mess_container.appendChild(picleft.cloneNode(true));
        }

        // Create paragraph element
        var paragraphElement = document.createElement('p');
        paragraphElement.classList.add("mess");
        paragraphElement.innerHTML = paragraphText;
        mess_container.appendChild(paragraphElement);


        storyContainer.appendChild(mess_container);

        // Fade in paragraph after a short delay
        showAfter(0, mess_container);

        //delay += 200.0;
        //delay += paragraphText.length * 100.0
        //console.log(clamp(paragraphText.length * 50.0,delay_min,delay_max));
        setTimeout(function() { processLine() }, clamp(paragraphText.length * 50.0,delay_min,delay_max));

        
    }
    else {
        delay = 0.0;
        choiceContainer = document.createElement('div');
        choiceContainer.classList.add("choice_container");
        myStory.currentChoices.forEach(function(choice) {

            // Create paragraph with anchor element
            choiceParagraphElement = createChoice(choice.text,delay);
            choiceContainer.appendChild(choiceParagraphElement);

            // Fade choice in after a short delay
            //showAfter(delay, choiceParagraphElement);
            delay += 200.0;
            //console.log(delay);

            // Click on choice
            //var choiceAnchorEl = choiceParagraphElement.querySelectorAll("a")[0];
            choiceAnchorEl = choiceParagraphElement;
            choiceAnchorEl.addEventListener("click", function(event) {

                // Don't follow <a> link
                event.preventDefault();

                // Remove all existing choices
                //var existingChoices = storyContainer.querySelectorAll('p.choice');
                var existingChoices = storyContainer.querySelectorAll('a.choice');
                for(var i=0; i<existingChoices.length; i++) {
                    var c = existingChoices[i];
                    c.parentNode.removeChild(c);
                }

                // Tell the story where to go next
                myStory.ChooseChoiceIndex(choice.index);

                madeAChoice = true;

                // Aaand loop
                processLine();
            });
        });
        storyContainer.appendChild(choiceContainer);
    }

    scrollToBottom();
}

function makeTextBox(val){
    console.log(val);
    var container = document.createElement("div");
    container.classList.add("choice_container");

    var x = document.createElement("INPUT");
    x.setAttribute("type", "text");
    x.classList.add("mess");
    //x.focus();
    showAfter(0, x);
    x.focus();
    

    function send(){
        //myStory.variablesState.$(val, x.innerHTML);
        myStory.variablesState[val] = x.value;
        event.preventDefault();
        container.parentNode.removeChild(container);
        sendMessage(x.value);
        //processLine();
        
    }

    x.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            send();
        }
    });

    /*var y = document.createElement("a");
    y.innerHTML = "send";
    y.classList.add("choice");
    y.setAttribute("href", "#");
    showAfter(delay, choiceParagraphElement);*/
    var y = createChoice("Send",10.0)
    container.appendChild(x);
    container.appendChild(y);

    y.addEventListener("click", function(event) {
        send();
    });

    storyContainer.appendChild(container);
}

function end(){
    console.log('THE END');
    storyContainer.appendChild(createChoice("Restart",0.2));
}

function createChoice(txt,delay) {
    var choiceParagraphElement = document.createElement('a');
    choiceParagraphElement.classList.add("choice");
    choiceParagraphElement.setAttribute("href", "#");
    choiceParagraphElement.innerHTML = txt;
    showAfter(delay, choiceParagraphElement);
    return choiceParagraphElement;
}


    this.start = function() {
        console.log("START");
        processLine();
    }

    sendMessage = function(_txt) {
        mess_container = document.createElement('div');
        mess_container.classList.add("container_mess");
        mess_container.classList.add("right");
        mess_container.appendChild(picright.cloneNode(true));
        var paragraphElement = document.createElement('p');
        paragraphElement.classList.add("mess");
        paragraphElement.innerHTML = _txt;
        mess_container.appendChild(paragraphElement);
        storyContainer.appendChild(mess_container);
        showAfter(0, mess_container);
        setTimeout(function() { processLine() }, clamp(_txt.length * 50.0,delay_min,delay_max));
    }

    function clamp(num, min, max) {
        return num <= min ? min : num >= max ? max : num;
      }
}

exports.InkedTie = new InkedTie();