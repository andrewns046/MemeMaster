var curTextAlignTop = "left";
var curBoldTop = false;
var curItalicTop = false;
var curFontSizeTop = document.getElementById('textSizeTop').value;
var curFontTop = document.getElementById('textFontTop').value;
var curFontColorTop = document.getElementById('textColorTop').value;
var curShadowXOffset = 2;
var curShadowYOffset = 2;
var curShadowBlur = 6;
var curShadowColor ="black";
var imgSrc = "https://firebasestorage.googleapis.com/v0/b/mememaster-3b8a9.appspot.com/o/3kxl6sSMv5OUN4xE4zt1gCGrpat1%2Fpublic%2Fmm-no-image.gif?alt=media&token=b689c4c3-3e26-4fcb-967b-c46be8043b47";
var addImage = false;

export function clearCanvas() {
    window.location = './memeeditor.html';
}

/**not my code but super usuful**/
function dataURLtoBlob(dataURI) {

    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
}

function uploadMeme() {
    //save the meme to library
    var dataURL = document.getElementById('memeCanvas').toDataURL("image/png");
    var memeFile = dataURLtoBlob(dataURL);

    //get user ref
    var usr = firebase.auth().currentUser;

    var filename = prompt("Please enter a file name for the MEME.", "myspicymeme");

    //check if file is empty
    if(memeFile != null && usr != null) {
        //root reference
        var storageRef = firebase.storage().ref();
        //create reference for new image
        var ref = `${usr.uid}/public/${filename}`;
        var uploadTask = storageRef.child(ref).put(memeFile);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

                //set url and download btn
                document.getElementById('shareLink').value = downloadURL;
                var dLink = document.getElementById('downloadLink');

                dLink.download = filename;
                dLink.href = dataURL;

                //display share options
                document.getElementById('shareOpts').style.display = "block";

                //remove upload button from dom
                var elem = document.getElementById('createMemeBtn');
                elem.parentNode.removeChild(elem);

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


export function loadImage() {
    var imageFile = document.getElementById('imageFile').files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        imgSrc = e.target.result;
        imageOnCanvasFill();
        addImage = true;
    };
    reader.readAsDataURL(imageFile);
}

export function turnBoldOn() {
    var btn = document.getElementById('boldFont');
    var italicBtn = document.getElementById('italicFont');

    if(curBoldTop == true) {
        //turn off
        curBoldTop = false
        //unhighlight button
        btn.style.backgroundColor = "rgb(35,31,32)";
    } else {
        //turn on
        curBoldTop = true;
        //highlight button
        btn.style.backgroundColor = "dodgerblue";
        //turn off italic
        if(curItalicTop) {
            turnItalicOn();
        }
    }
}

export function turnItalicOn() {
    var btn = document.getElementById('boldFont');
    var italicBtn = document.getElementById('italicFont');

    if(curItalicTop == true) {
        //turn off
        curItalicTop = false
        //unhighlight button
        italicBtn.style.backgroundColor = "rgb(35,31,32)";
    } else {
        //turn on
        curItalicTop = true;
        //highlight button
        italicBtn.style.backgroundColor = "dodgerblue";
        //turn off bold
        if(curBoldTop) {
            turnBoldOn();
        }
    }
}

export function signedInEventHandle(user) {
    if (user) {
        var usr = firebase.auth().currentUser;
        if(usr != null) {
            document.getElementById('howdy').innerHTML = `Howdy, ${usr.displayName}`;
        }
    } else {
      // No user is signed in. Send them to login
      window.location = 'signout.html';
    }
}

export function invertColor() {
    var color = document.getElementById('textColorTop').value;
    curFontColorTop = color;
    var textColor;
    var textShadow;
    var textStrokeColor, textStrokeWidth;

    if( color == "white") {
        textColor = "white";
        textShadow = "2px 2px 6px black";
        textStrokeColor = "black";
        textStrokeWidth = "2px";
    } else {
        textColor = "black";
        textShadow = "none";
        textStrokeColor = "none";
        textStrokeWidth = "0px";
    }
}

export function updateFont() {
    var fontRef = document.getElementById('textFontTop');
    curFontTop = fontRef.value;
}

export function updateFontSize() {
    var fontSizeRef = document.getElementById('textSizeTop');
    curFontSizeTop = fontSizeRef.value;
}

function updateTextOnCanvas() {
    var canvas = document.getElementById('memeCanvas');
    var ctx = canvas.getContext('2d');
    var text = document.getElementById('textTop').value;

    //calculate how many lines of text there can be
    var lines = text.split("\n");
    var fontStyle = (curBoldTop)? "bold":(curItalicTop)?"italic":"";
    //font styles
    ctx.font = `${fontStyle} ${curFontSizeTop}px ${curFontTop}`;
    if( curFontColorTop == "white") {
        ctx.lineWidth = 4;
        ctx.lineJoin = "miter";
        ctx.shadowOffsetX = curShadowXOffset;
        ctx.shadowOffsetY = curShadowYOffset;
        ctx.shadowBlur = curShadowBlur;
        ctx.shadowColor = curShadowColor;
        ctx.font = `${fontStyle} ${parseInt(curFontSizeTop, 10)-2}px ${curFontTop}`;
    }

    ctx.textBaseline = "top";
    ctx.textAlign = curTextAlignTop;
    ctx.fillStyle = curFontColorTop;

    //padded start position
    var x = 10;
    var y = 10;
    var lineHeight = parseInt(curFontSizeTop,10) * 1.1;
    var i;

    for(i = 0; i < lines.length; ++i) {
        if(curFontColorTop == "white") {ctx.strokeText(lines[i], x, y);}
        ctx.fillText(lines[i], x, y);
        y = y + lineHeight;
    }
}

export function save() {
    //if empty
    var text = document.getElementById('textTop').value;
    if( text.length == 0 ) {
        alert("Oops ... Memes kinda need text.");
        return;
    }
    if( addImage == false ) {
        alert("Oops ... you have choose an image first.")
        return;
    }

    if( confirm("Are you sure this meme is spicy enough?") ) {
        uploadMeme();
    }
}

export function imageOnCanvasFill() {
    var canvas = document.getElementById('memeCanvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var x = 0;
    var y = 0;
    var width = 600;
    var height = 600;

    document.getElementById('memeImg');

    img.onload = function() {
        if(img.width > width) { //image larger than canvas
            img.height = scaleHeight(img, width);
            img.width = width;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        //borders
        if( document.getElementById('borderTop').checked ) {
            //offset to grow image height and image y coordinate
            var bHeight = parseInt(document.getElementById('borderTopHeight').value, 10);
            y = y + bHeight;
            canvas.height = canvas.height + bHeight;
        }

        if( document.getElementById('borderBottom').checked) {
            var bHeight = parseInt(document.getElementById('borderBottomHeight').value,10);
            canvas.height = canvas.height + bHeight;
        }

        ctx.fillStyle="#FFFFFF";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, img.width, img.height);
        updateTextOnCanvas();
    };

    img.src = imgSrc;
}

function scaledWidth(img, maxH) {
    var width = img.width;
    var height = img.height;

    var scaleFactor = hieght/maxH;

    return width/scaleFactor;
}

function scaleHeight(img, maxW) {
    var width = img.width;
    var height = img.height;

    var scaleFactor = width/maxW;

    return height/scaleFactor;
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
