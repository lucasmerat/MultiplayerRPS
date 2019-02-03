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

//Global Variables
let connectedPlayers = 0;
let playerOneName;
let playerTwoName;
let move = 0;

//Firebase config
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


function resetGameData(){
    $("#p1-name").text("Player 1")
    $("#p2-name").text("Player 2")
    database.ref("/moves/").set({
        move: 0
    })
    database.ref("players/playeronename/").set({
        name: "Player 1"
    })
    database.ref("players/playertwoname/").set({
        name: "Player 2"
    })
}



  //Setting up connetions ref
var connectionsRef = database.ref("/connections");

//Setting info ref
var connectedRef = database.ref(".info/connected");

//Listener on changes in number of connections
connectedRef.on("value", function(snap) {
  console.log(snap.val());

  if (snap.val()) {
    // Add user to the connections list.
    var con = connectionsRef.push(true);

    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});



//Listener to if connections ref changes
connectionsRef.on("value", function(snapshot) {
    console.log(snapshot.val())
//Update connectedPlayers variable based on number of children in node
  connectedPlayers = snapshot.numChildren();
//If we have one person conneted, display that to users and add click listener on start button
  if (connectedPlayers === 1) {
    resetGameData();//For when game is reset to 1 player, data reloads
    console.log("One player has connected, starting game");
    $(".details").text("Player 1 has connected... Please enter your name");
    $(".add-name").on("click", updatePlayerName);
  }

  if (connectedPlayers === 2) {
    database.ref("/players/playeronename").once('value').then(function(snap){
        $("#p1-name").text(snapshot.val().name);
        })
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
    progressMoveFirst()
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

//GAME MECHANICS

//Function to increase move count
function progressMoveFirst(){
    database.ref("/moves").child("/move").set(1)
}

function progressMoveSecond(){
    database.ref("/moves").child("/move").set(2)
}

//Listener for when move variable changes
database.ref("/moves").on("value", function(snap){
    console.log("Move just increased to " + snap.val().move)
    if(snap.val().move === 1){
        playerOneThrow(snap.val().move);
    }
    if(snap.val().move === 2){
        playerTwoThrow(snap.val().move);
    }
})

function playerOneThrow(move) {
    $(".details").text("Player 1, choose your throw");
    $(".p1-hands").on("click", playerOneChooseHand)
}

function playerOneChooseHand(){
    console.log('Player 1 hand clicked')
    let p1Throw = $(this).attr("data-value");
    progressMoveSecond();
    evaluateMatch(p1Throw);
}

function playerTwoThrow(move){
    $(".details").text("Player 1 has thrown, player 2, choose your throw");
    console.log('Move is now ' + move + ' player two is going to throw')
    $(".p2-hands").on("click", playerTwoChooseHand)
}

function playerTwoChooseHand(){
    console.log('Player 2 hand clicked')
    let p2Throw = $(this).attr("data-value");
    console.log(p2Throw)
    evaluateMatch(p2Throw);
}

function evaluateMatch(p1Throw,p2Throw){
    let first = p1Throw;
    let second = p2Throw;
    console.log(first)
    console.log(second)

}

//When there is a change in P1 or P2 nodes, update that on HTML -- need to fix this so that it does not auto
database.ref("/players/playeronename").on("value", function(snapshot) {
  $("#p1-name").text(snapshot.val().playerOneName);
});

database.ref("/players/playertwoname").on("value", function(snapshot) {
  // Print the initial data to the console.
  $("#p2-name").text(snapshot.val().playerTwoName);
});

//database.ref("/players/playeronename").once('value').then(function(snap){
    //console.log(snap.val().name)
    //$("#p1-name").text(snapshot.val().name);
    //})
