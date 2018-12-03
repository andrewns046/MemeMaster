firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.

    var usr = firebase.auth().currentUser;

    if(usr != null) {
        var name = usr.displayName;
        document.getElementById('howdy').innerHTML = `Howdy, ${name}`;
    }

  } else {
    // No user is signed in. Send them to login
    window.location = 'signout.html';
  }
});

function signOut() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location = "signout.html"
    }).catch(function(error) {
        // An error happened.
        alert("Oops, we couldn't sign you out.");
    });
}

window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sgnOutLnk').addEventListener('click',()=>{
        signOut();
    });
});
