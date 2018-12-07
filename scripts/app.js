var numImgs = 0;

export function signedInEventHandle(user, location) {
    if (user) {
      // User is signed in.
      var usr = firebase.auth().currentUser;
      if(usr != null) {
          document.getElementById('howdy').innerHTML = `Howdy, ${usr.displayName}`;
          downloadUsrImages(location);
      }
    } else {
      // No user is signed in. Send them to login
      window.location = 'signout.html';
    }
}

export function signOut() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location = "signout.html"
    }).catch(function(error) {
        // An error happened.
        alert("Oops, we couldn't sign you out.");
    });
}


// TODO mirror cloud uploads in database
export function uploadImage() {
    //image to upload
    var imageFile = document.getElementById('imageFile').files[0];
    //get user ref
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
                    alert("Oops, you can't upload that. Try choosing an image" +
                    " that's a gif, jpg, or png file");
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

                appendUrlArr(`${usr.uid}/public`, downloadURL);

                //update in gallery
                var gallery = document.getElementById('gallery');

                if(numImgs == 0) {
                    gallery.innerHTML = createImageItem(downloadURL, numImgs);
                } else {
                    var htmlText = gallery.innerHTML;
                    htmlText = createImageItem(downloadURL, numImgs) + htmlText;
                    gallery.innerHTML = htmlText;
                }
                //increment
                ++numImgs;

                //reset input and progress bar
                document.getElementById('uploadProg').value = 0;
                document.getElementById('shareLink').value = `${downloadURL}`;

                //show successful
                console.log('File available at', downloadURL);
            });
        });

        } else {
            alert("Oops, look like a file to upload was not chosen.");
        }
}

function appendUrlArr(path, url) {
    var writeRef = path;
    var readRef = path + "/urls";
    firebase.database().ref(readRef).once('value', function(snapshot){
        var urlArr = snapshot.val();

        if(urlArr[0] == "empty") {
            //replace empty
            urlArr[0] = url;
        } else {
            //append arr
            urlArr.push(url);
        }
        firebase.database().ref(writeRef).set({
            urls: urlArr
        });
    });
}

export function showUploadModule() {
    //clear fields
    document.getElementById('uploadProg').value = 0;
    document.getElementById('shareLink').value = "";
    document.getElementById('imageFile').value = "";
    document.getElementById('uploadDiag').showModal();
}

/*Location either "public or archive"*/
function downloadUsrImages(location) {
    if( location != "public" && location != "archive") {
        alert("Sorry the library you are trying to access does not exist.");
        return;
    }
    //get references
    var usr = firebase.auth().currentUser;
    var urlsRef = firebase.database().ref(`${usr.uid}/${location}/urls`);

    urlsRef.once('value', function(snapshot){
        var urlArr = snapshot.val();
        if(urlArr.length == 0) {
            return;
        } else if(urlArr[0] == "empty") {
            return;
        } else {
            var gallery = document.getElementById('gallery');
            var htmlText = "";
            var i;
            for(i = (urlArr.length-1); i >= 0; --i) {
                htmlText = htmlText + createImageItem(urlArr[i], i);
            }
            gallery.innerHTML = htmlText;

            numImgs = urlArr.length;
        }
    });
}

//creates an image to be added to the gallery
function createImageItem(url, index) {
    return `<div class="galleryItem"><img src="${url}" onclick="openImg(${index})" alt="no image available"></div>`;
}

export function handleSelectedImage(location, index) {
    var usr = firebase.auth().currentUser;
    var urlsRef = firebase.database().ref(`${usr.uid}/${location}/urls`);

    urlsRef.once('value', function(snapshot){
        var urlArr = snapshot.val();

        if( index >= urlArr.size || index < 0) {
            alert("The item you are looking for is no longer available.");
            return;
        }

        var url = urlArr[index];

        document.getElementById('diagImg').src = url;
        document.getElementById('imageView').showModal();
        //modify onclick listener on buttons and give them the index
        if( location == "public") {
            document.getElementById('archBtn').onclick = function() {
                var result = confirm("You are about to archive this image. Continue?")

                if(result) {
                    archiveImg(index, url);
                }
            }

            //download
            document.getElementById('download').download = parseFileName(url);
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function(event) {
                document.getElementById('download').href = window.URL.createObjectURL(xhr.response);
            }
            xhr.open('GET', url);
            xhr.send();
            document.getElementById('shareLink2').href = url;

        } else if (location == "archive") {
            document.getElementById('unarchBtn').onclick = function() {
                var result = confirm("You are about to unarchive this image. Continue?")
                if(result) {
                    unarchiveImg(index, url);
                }
            }
            document.getElementById('deleteBtn').onclick = function() {
                var result = confirm("You are about to permanently delete this image. Continue?");
                if(result) {
                    //file deleted
                    removeFromUrlArr(`${usr.uid}/archive`, index);

                    //update in gallery
                    var gallery = document.getElementById('gallery');

                    --numImgs;

                    if(numImgs == 0) {
                        gallery.innerHTML = "<p class='greyHeading'>No Archived Memes</p>";
                    } else {
                        //refresh page index and repaint
                        setTimeout(function(){downloadUsrImages("archive");}, 2000);
                    }
                }
            }
        } else {
            alert("Oops, something went wrong, try refreshing the page");
        }
    });
}

function deleteMeme(index, url) {
    var fileName = parseFileName(url);
    var usr = firebase.auth().currentUser;
    var fileRef = firebase.storage().ref(`${usr.uid}/public/${fileName}`);

    alert(fileRef);

    fileRef.delete().then(function() {
        //file deleted
        removeFromUrlArr(`${usr.uid}/archive`, index);

        //update in gallery
        var gallery = document.getElementById('gallery');

        --numImgs;

        if(numImgs == 0) {
            gallery.innerHTML = "<p class='greyHeading'>No Archived Memes</p>";
        } else {
            //refresh page index and repaint
            setTimeout(function(){downloadUsrImages("archive");}, 2000);
        }
    }).catch(function(error) {
        //error occurred
        alert("Sorry we coudn't delete that file.\nError Code:\n" + error);
    });
}

function parseFileName(url) {
    var startStr = "%2Fpublic%2F";
    var startIndex = url.indexOf(startStr);
    var startIndex = startIndex + startStr.length;
    var endIndex = url.indexOf("?alt");
    return url.slice(startIndex, endIndex);
}

function archiveImg(index, url) {
    var usr = firebase.auth().currentUser;
    // add to archive
    appendUrlArr(`${usr.uid}/archive`, url);
    //remove from url arr
    removeFromUrlArr(`${usr.uid}/public`, index);

    //update in gallery
    var gallery = document.getElementById('gallery');

    --numImgs;

    if(numImgs == 0) {
        gallery.innerHTML = "<p class='greyHeading'>Seems like you haven't added memes yet ... click create to get started or click upload and add some memes from your computer.</p>";
    } else {
        //refresh page index and repaint
        setTimeout(function(){downloadUsrImages("public");}, 2000);
    }
}

function unarchiveImg(index, url) {
    var usr = firebase.auth().currentUser;
    //add to gallery
    appendUrlArr(`${usr.uid}/public`, url);
    //remove from archive
    removeFromUrlArr(`${usr.uid}/archive`, index);
    //update in gallery
    var gallery = document.getElementById('gallery');

    --numImgs;

    if(numImgs == 0) {
        gallery.innerHTML = "<p class='greyHeading'>No Archived Memes</p>";
    } else {
        //refresh page index and repaint
        setTimeout(function(){downloadUsrImages("archive");}, 2000);
    }
}

function removeFromUrlArr(path, index) {
    var writeRef = path;
    var readRef = path + "/urls";

    firebase.database().ref(readRef).once('value', function(snapshot){
        var urlArr = snapshot.val();

        if(urlArr[0] == "empty") {
            //nothing to delete
            alert("Nothing to remove.");
        } else if ( urlArr.length == 1) {
            urlArr[0] = "empty";
        }
        else {
            //remove
            urlArr.splice(index,1);
        }

        firebase.database().ref(writeRef).set({
            urls: urlArr
        });
    });
}
