//
//Global Variables
//

let connectedPlayers = 0;
let myName = "A player";
let p1wins = 0;
let p2wins = 0;
let p1losses = 0;
let p2losses = 0;
let ties = 0;

//
//Firebase config
//

var config = {
  apiKey: "AIzaSyAkKIGuNWl7S3MPGZ1YoRqrzI338vidvB8",
  authDomain: "multiplayerrps-4204d.firebaseapp.com",
  databaseURL: "https://multiplayerrps-4204d.firebaseio.com",
  projectId: "multiplayerrps-4204d",
  storageBucket: "multiplayerrps-4204d.appspot.com",
  messagingSenderId: "967846374460"
};
firebase.initializeApp(config);

var database = firebase.database();

function resetGameData() {
  $("#p1-name").text("Player 1");
  $("#p2-name").text("Player 2");
  database.ref("/moves/").set({
    move: 0
  });
  database.ref("players/playeronename/").set({
    name: "Player 1"
  });
  database.ref("players/playertwoname/").set({
    name: "Player 2"
  });
  database.ref("/results/gameresult").remove()
}

//
//NAMING MECHANICS
//

//Setting up connetions ref
var connectionsRef = database.ref("/connections");

//Setting info ref
var connectedRef = database.ref(".info/connected");

//Listener on changes in number of connections
connectedRef.on("value", function(snap) {

  if (snap.val()) {
    // Add user to the connections list.
    var con = connectionsRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

//Listener to if connections ref changes
connectionsRef.on("value", function(snapshot) {
  console.log(snapshot.val());
  //Update connectedPlayers variable based on number of children in node
  connectedPlayers = snapshot.numChildren();
  //If we have one person conneted, display that to users and add click listener on start button
  if (connectedPlayers === 0) {
    resetGameData()
  }

  if (connectedPlayers === 1) {
    resetGameData(); //For when game is reset to 1 player, data reloads
    $(".enter-name").slideDown("slow")
    $(".details").text("Player 1 has connected... Please enter your name");
    $("#p1-name").css("color","green")
    $("#p2-name").css("color","#333")
    $(".add-name").on("click", updatePlayerName);
  }

  if (connectedPlayers === 2) {
    database
      .ref("/players/playeronename")
      .once("value")
      .then(function(snap) {
        $("#p1-name").text(snap.val().name);
        $("#p1-name").css("color","green")
      });
    $(".details").text("Player 2 has connected... Please enter your name");
    $(".enter-name").slideDown("slow")
    $("#p2-name").css("color","green")
    $(".add-name").on("click", updatePlayerName);
  }
});

function updatePlayerName() {
  //If first player has connected, run script to have player 1 choose a name
  if (connectedPlayers === 1) {
    playerOneName = $(".name-input").val();
    myName = $(".name-input").val();
    firebasePlayerAdd(playerOneName);
    $(".name-input").val("");
    $(".add-name").off();
    $(".enter-name").slideUp("slow")
    $(".details").text("Waiting for player 2...");
  }
  //If second player connected,
  if (connectedPlayers === 2) {
    playerTwoName = $(".name-input").val();
    myName = $(".name-input").val();
    firebasePlayerAdd(playerTwoName);
    $(".name-input").val("");
    $(".add-name").off();
    progressMove(1);
  }
}

//Function to update P1 and P2 name in database
function firebasePlayerAdd(name) {
  if (connectedPlayers === 1) {
    database.ref("/players/playeronename").set({
      playerOneName: name
    });
  } else {
    database.ref("/players/playertwoname").set({
      playerTwoName: name
    });
  }
}

//When there is a change in P1 or P2 nodes, update that on HTML -- need to fix this so that it does not auto
database.ref("/players/playeronename").on("value", function(snapshot) {
  $("#p1-name").text(snapshot.val().playerOneName);
});

database.ref("/players/playertwoname").on("value", function(snapshot) {
  // Print the initial data to the console.
  $("#p2-name").text(snapshot.val().playerTwoName);
});


//
//GAME MECHANICS
//


//Function to increase move count
function progressMove(num) {
  database
    .ref("/moves")
    .child("/move")
    .set(num);
}

//Listener for when move variable changes
database.ref("/moves").on("value", function(snap) {
  console.log("Move just changed to " + snap.val().move);
  if (snap.val().move === 1) {
    $(".enter-name").slideUp("slow")
    playerOneThrow(snap.val().move);
  }
  if (snap.val().move === 2) {
    playerTwoThrow(snap.val().move);
  }
});

function playerOneThrow() {
  $(".details").html("<br><p>Player 1 choose your throw");
  $(".p1-hands").on("click", playerOneChooseHand);
}

function playerOneChooseHand() {
  $(".p1-hands").off()
  let hand = $(this).attr("data-value");
  console.log("Player 1 chose" + hand);
  progressMove(2);
  database.ref("/throws/p1throw").child("/throwVal").set(hand);
}

function playerTwoThrow() {
  $(".details").text("Player 1 has thrown, player 2, choose your throw");
  $(".p2-hands").on("click", playerTwoChooseHand);
}

function playerTwoChooseHand() {
  $(".p2-hands").off()
  console.log("Player 2 hand clicked");
  let hand = $(this).attr("data-value");
  console.log("Player 2 chose" + hand);
  database.ref("/throws/p2throw").child("/throwVal").set(hand);
  evaluateMatch();
}

function evaluateMatch() {
    database.ref("/throws/")
    .once("value")
    .then(function(throwsnap) {
        console.log("Displaying throws node once for match evaluation")
        console.log(throwsnap.val())
            let p1throw = throwsnap.val().p1throw.throwVal;
            let p2throw = throwsnap.val().p2throw.throwVal;
            if (p1throw === p2throw){
                database.ref('/results/gameresult').child("/outcome").set("tie")
            } else if(p1throw === "rock"){
                if(p2throw === "paper"){
                database.ref('/results/gameresult').child("/outcome").set("p2 wins")
                } else if(p2throw === "scissors")
                database.ref('/results/gameresult').child("/outcome").set("p1 wins")
            } else if (p1throw === "paper"){
                if(p2throw === "rock"){
                database.ref('/results/gameresult').child("/outcome").set("p1 wins")
                } else if (p2throw === "scissors"){
                database.ref('/results/gameresult').child("/outcome").set("p2 wins")
                }
            } else if(p1throw === "scissors"){
                if(p2throw === "paper"){
                database.ref('/results/gameresult').child("/outcome").set("p1 wins")
                } else if (p2throw === "rock"){
                 database.ref('/results/gameresult').child("/outcome").set("p2 wins")
                }
            }
        });
    }

//Listens for change in results, triggered by setting outcome and results above

database.ref('/results/gameresult').on("child_added",function(resultsnap){
    console.log("Displaying results node because a child was added", resultsnap.val())
    database.ref("/throws/").once("value").then(function(throwsnap) {
          console.log("Displaying the throws node just once since a child was added to the game results node")
        console.log(throwsnap.val()) 
        console.log(throwsnap.val())
        database.ref("/moves").child("/move").set(1); //Bring game back to p1throw point   
        database.ref("/players").once("value").then(function(playersnap){ 
          if(resultsnap.val() === "tie"){
              ties++
              $(".details").prepend("Tie game! <br>");
              $(".ties").text(ties + " ")
          } else if (resultsnap.val() === "p1 wins"){
              p1wins++
              p2losses++
              $(".details").prepend(playersnap.val().playeronename.playerOneName + " wins! <br>");
              $("#p1-wins").text(p1wins + " ")
              $("#p2-losses").text(p2losses + " ")
          } else if(resultsnap.val() === "p2 wins"){
              p2wins++
              p1losses++
              $(".details").prepend(playersnap.val().playertwoname.playerTwoName + " wins! <br>");
              $("#p2-wins").text(p2wins + " ")
              $("#p1-losses").text(p1losses + " ")
          }
                   
          $(".details").prepend(playersnap.val().playeronename.playerOneName + " chose " + throwsnap.val().p1throw.throwVal + " ... " + playersnap.val().playertwoname.playerTwoName + " chose " + throwsnap.val().p2throw.throwVal + "<br><br>");
        })
    });
    database.ref("/results/gameresult").remove()
})

//
//CHAT FUNCTIONALITY
//


$("#send-button").on("click", sendMessage)

//Pushes message to message tree with value of what is in chat input with name of user
function sendMessage(event){
    event.preventDefault()
    let chatBox = $(".chat-box")
    database.ref("/messages").push(myName + ": " + $("#chat-input").val());
    $("#chat-input").val("")
    chatBox.scrollTop(chatBox[0].scrollHeight) //Snaps chat to bottom of box
}

database.ref("/messages").on("value",function(messagesSnap){
    let messages = messagesSnap.val()
    let objectKeys = Object.keys(messages);
    $(".chat-box").empty() //clears chat box before iterating thru list of messages
    for (let i = 0; i < objectKeys.length; i++) {
        let k = objectKeys[i];
        let theMessage = messages[k]
        $(".chat-box").append("<p>" + theMessage)
    }
    let chatBox = $(".chat-box")
    chatBox.scrollTop(chatBox[0].scrollHeight) //Snaps chat to bottom of box
})