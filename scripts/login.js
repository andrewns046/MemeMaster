export function handleSignIn(user) {
    if (user) {
      // User is signed in. Redirect them to their Gallery
      window.location = 'gallery.html';
    } else {
      // No user is signed in.
    }
}

export function login() {
    var usrEmail = document.getElementById("usrEmail").value;
    var usrPass = document.getElementById("usrPass").value;

    firebase.auth().signInWithEmailAndPassword(usrEmail, usrPass).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert("Error: " + errorMessage + "\nError Code: " + errorCode);
    });
}
