firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        usr = firebase.auth().currentUser;
        if(usr != null) {
            var name = document.getElementById('usrName').value;
            usr.updateProfile({displayName: name}).then(function(){
                //profile updated
            }).catch(function(error){});
            window.location = 'gallery.html';
        }
    } else {
        // No user is signed in.
    }
});

function createAct() {

    var email = document.getElementById('usrEmail').value;
    var password = document.getElementById('usrPass').value;
    var vPass = document.getElementById('vrfyPass').value;

    // check if password's match
    if( vPass != password ) {
        alert("Passwords did not match. Please try again.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("Error: " + errorMessage + "\nError Code: " + errorCode);
        // ...
    });
}

window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('createBtn').addEventListener('click',()=>{
        createAct();
    });
});
