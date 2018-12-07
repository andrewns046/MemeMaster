export function signedInEventHandle(user) {
    if (user) {
        var usr = firebase.auth().currentUser;
        if(usr != null) {
            updateUserName(usr);
            initData(usr);
            window.location = "gallery.html";
        }
    } else {
        // No user is signed in.
    }
}

function updateUserName(user) {
    var name = document.getElementById('usrName').value;
    user.updateProfile({displayName: name}).then(function(){
        //profile updated
    }).catch(function(error){});
}

export function createAct() {
    var name = document.getElementById('usrName').value;
    var email = document.getElementById('usrEmail').value;
    var password = document.getElementById('usrPass').value;
    var vPass = document.getElementById('vrfyPass').value;

    // check if password's match
    if( vPass != password ) {
        alert("Passwords did not match. Please try again.");
        return;
    }

    // check that user did not leave any fields blank
    if( email.length == 0 || password.length == 0 || name.length == 0 ||
        vPass.length == 0) {
            alert("Must enter info in all fields.");
            return;
        }

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("Error: " + errorMessage + "\nError Code: " + errorCode);
        return;
    });
}

function initData (user) {
    firebase.database().ref(`${user.uid}/public`).set({
        urls: ["empty"]
    });
    firebase.database().ref(`${user.uid}/archive`).set({
        urls: ["empty"]
    });
}
