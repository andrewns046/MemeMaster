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

function uploadImage() {
    //image to upload
    var imageFile = document.getElementById('imageFile').files[0];
    //alert(imageFile.name);
    var usr = firebase.auth().currentUser;

    //check if file is empty
    if(imageFile != null && usr != null) {
        //root reference
        var storageRef = firebase.storage().ref();
        //create reference for new image
        var ref = `${usr.uid}/public/${imageFile.name}`;
        var uploadTask = storageRef.child(ref).put(imageFile);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.getElementById('uploadProg').value = progress;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
            }
        }, function(error) {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
                case 'storage/unauthorized':
                // User doesn't have permission to access the object
                    alert('Oops, user does not have permission to Upload. Try signing back in.')
                break;

                case 'storage/canceled':
                // User canceled the upload
                    alert('Upload was canceled.');
                break;

                case 'storage/unknown':
                  // Unknown error occurred, inspect error.serverResponse
                  alert('Oops, something went wrong with the server.');
                break;
        }
        }, function() {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                console.log('File available at', downloadURL);
            });
        });

        } else {
            alert("Oops, look like a file to upload was not chosen.");
        }
}

window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sgnOutLnk').addEventListener('click',()=>{
        signOut();
    });
    document.getElementById('uploadImgBtn').addEventListener('click',()=>{
        uploadImage();
    });
});
