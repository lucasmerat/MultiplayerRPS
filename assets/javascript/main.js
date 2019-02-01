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

function startGame() {
  $(".details").text("Player 1 has connected... Please enter your name");
  $(".add-name").on("click", updatePlayerName)
}

function updatePlayerName(name){
    if(connectedPlayers === 1){
        let playerOneName = $('.name-input').val();
        firebasePlayerCall(playerOneName);
        $('.name-input').val('')
        $(".details").text("Waiting for player 2...")
    }
    
    if (connectedPlayers === 2){
        $(".details").text("Player 2 has connected... Please enter your name");
        $(".add-name").on("click", function(){
            let playerTwoName = $('.name-input').val();
            $("#p2-name").text(playerTwoName);
            $('.name-input').val('')
        })

    }
}

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

function firebasePlayerCall(name){

database.ref("/players/").set({
    playerOneName: name
})

}

database.ref("/players/").on("value", function(snapshot) {
  // Print the initial data to the console.
  $("#p1-name").text(snapshot.val().playerOneName);

  console.log(snapshot.val());
});

var connectionsRef = database.ref("/connections");
console.log(connectionsRef);

var connectedRef = database.ref(".info/connected");

connectedRef.on("value", function(snap) {
  console.log(snap.val());

  if (snap.val()) {
    // Add user to the connections list.
    var con = connectionsRef.push(true);

    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

connectionsRef.on("value", function(snapshot) {
  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  connectedPlayers= snapshot.numChildren();
  if (connectedPlayers === 1) {
      console.log('One player has connected, starting game')
    startGame();
  }

  if (connectedPlayers === 2){
      console.log('player 2 connected, updating player 2 stuff')
      updatePlayerName();
  }
});
