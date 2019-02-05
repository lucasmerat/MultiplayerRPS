//Pseudocode
//When you join the game, status updates to "Player 1 joined, enter your name" append that status to battleground
//1 active player on page
//Type name in box. When you press play, new name replaces "Player 1" and status updates to say, "Waiting on player 2"
//When player 2 joins, status to "Player 2 joined, enter your name" - that goes up to a firebase variable
//When name is added, upate Player 2 heading
//Both players present, run function for main game - click listeners on player 1 RPS
//Status updates to "Player 1, choose your throw"
//When P1 clicks one, get the value of the attr associated with (this) that is clicked and store in p1Throw variable
//Status updates to "Player one move locked in, player 2, choose your throw"
//Click listener on P2 icons - when one is clicked, get value of that attr and store in p2Throw variable
//Compare two throws in RPS evaluator function, passing in two throws and display result in status bar
//Update wins losses and ties for each player
//restart the function for event listeners on for p1
//If someone disconnects from the app, change their name back to P1 or P2 and run the portion of the script if they are p1 or p2 that disconnected


//
//Global Variables
//

let connectedPlayers = 0;
let playerOneName;
let playerTwoName;
let p1wins = 0;
let p2wins = 0;
let p1losses = 0;
let p2losses = 0;
let ties = 0;

//
//Firebase config\
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
  if (connectedPlayers === 1) {
    resetGameData(); //For when game is reset to 1 player, data reloads
    $(".details").text("Player 1 has connected... Please enter your name");
    $(".add-name").on("click", updatePlayerName);
  }

  if (connectedPlayers === 2) {
    database
      .ref("/players/playeronename")
      .once("value")
      .then(function(snap) {
        $("#p1-name").text(snapshot.val().name);
      });
    $(".details").text("Player 2 has connected... Please enter your name");
    $(".add-name").on("click", updatePlayerName);
  }
});

function updatePlayerName() {
  //If first player has connected, run script to have player 1 choose a name
  if (connectedPlayers === 1) {
    playerOneName = $(".name-input").val();
    firebasePlayerAdd(playerOneName);
    $(".name-input").val("");
    $(".add-name").off();
    $(".details").text("Waiting for player 2...");
  }
  //If second player connected,
  if (connectedPlayers === 2) {
    playerTwoName = $(".name-input").val();
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
    playerOneThrow(snap.val().move);
  }
  if (snap.val().move === 2) {
    playerTwoThrow(snap.val().move);
  }
  if (snap.val().move === 3) {
      console.log("Move is 3, evaluating match")
    evaluateMatch();
    database.ref("/results/gameresult").remove()
    console.log("removed the results node")
  }
});

function playerOneThrow() {
  $(".details").text("Player 1, choose your throw");
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
  progressMove(3);
  console.log("Player 2 hand clicked");
  let hand = $(this).attr("data-value");
  console.log("Player 2 chose" + hand);
  database.ref("/throws/p2throw").child("/throwVal").set(hand);
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
          if(resultsnap.val() === "tie"){
              ties++
          } else if (resultsnap.val() === "p1 wins"){
              p1wins++
              p2losses++
          } else if(resultsnap.val() === "p2 wins"){
              p2wins++
              p1losses++
          }
          database.ref("/moves").child("/move").set(1); //Bring game back to p1throw point
          $(".details").prepend("The result was: " + resultsnap.val() + "<br><br>");
          $(".details").prepend(" Player 1 chose " + throwsnap.val().p1throw.throwVal + " and player 2 chose " + throwsnap.val().p2throw.throwVal + "<br><br>");
          database.ref("/throws").remove()
          console.log(ties + " ties")
          console.log(p1wins + " p1wins")
          console.log(p2wins + " p2wins") 
          //Update results on page 
          database.ref('/results/gameresult').on("value",function(snap){
            console.log("Updating screen for both because game result has changed")
            $("#p1-wins").text(p1wins)
            $("#p2-wins").text(p2wins)
            $("#p1-losses").text(p1losses)
            $("#p2-losses").text(p2losses)
            $(".ties").text(ties)
        })
    });
})

//
//CHAT FUNCTIONALITY
//

$("#send-button").on("click", sendMessage)

function sendMessage(){
    $(".chat-box").append("<p>" + $("#chat-input").val())
}