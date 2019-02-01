
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

  database.ref('/folder').on("value", function(snapshot) {
    // Print the initial data to the console.
    console.log(snapshot.val());
  });

  var playerOneName = 'Lucas';

  database.ref('/folder').set({
      name:playerOneName;
  })