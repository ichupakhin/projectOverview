
var initTime;
var intervalTime;
var intervalSpeed;
var intervalPosition;
var distance;
var lastLon;
var lastLat;
var lastTime;
var watchId;


function startTour() { 
    document.getElementById('videoHolder').innerHTML = "<video class='video1' id='vid1'></video>";
    document.getElementById("buttonHolder").innerHTML = "<button id='stopTour' class='button2 grad2 text1' onclick='stopTour()'>Radtour<br>beenden</button>";
    document.getElementById("zeit").innerHTML = "Zeit: 0:0:0";
    distance = 0;
    lastTime = 0;
    lastLon = undefined;
    lastLat = undefined;
    initTime = new Date().getTime();
    intervalTime = window.setInterval(getElapsedTime, 100);
    intervalSpeed = window.setInterval(getSpeedAndDistance, 4000);
    intervalPosition = window.setInterval(getLocation, 10000);
    startVideoRecording();
}


function stopTour() {
    document.getElementById("buttonHolder").innerHTML = "<button class='button1 grad1 text1' onclick='startTour()'>Radtour<br>starten</button>";
    clearInterval(intervalTime);
    clearInterval(intervalSpeed);
    clearInterval(intervalPosition);
    document.getElementById("geschwindigkeit").innerHTML = "Geschwind.: 0 km/h";
}


function getElapsedTime() {   
    var newTime = new Date().getTime();
    newTime = (newTime - initTime) / 1000; 
    var seconds = Math.floor(newTime % 60);
    var minutes = Math.floor(newTime / 60);
    var hours = Math.floor(newTime / 3600);
    document.getElementById("zeit").innerHTML = "Zeit: " + hours + ":" + minutes + ":" + seconds;  
}


function getSpeedAndDistance() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showSpeedAndDistance); 
    } else {
        document.getElementById("karte").innerHTML = "Geolocation is not supported by this browser.";
    }
}


function showSpeedAndDistance (position) {
    var time = position.timestamp;
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    
    if (lastLat == undefined && lastLon == undefined) {
        lastLat = lat;
        lastLon = lon;
    }
    
    var newDistance = computeDistance(lastLon, lastLat, lon, lat);
    
    //Wenn neue Zwischendistanz groesser als 0.3 Kilometer ist, dann sind GPS-Koordinaten offensichtlich fehlerhaft. 
    if(newDistance < 0.3) {
        distance += newDistance;
        document.getElementById("strecke").innerHTML = "Strecke: " + distance.toFixed(2) + " km";
    
        if(lastTime != 0 && lastTime != time) {
            var speed = newDistance / ( (time - lastTime) / (1000 * 60 * 60) );
            document.getElementById("geschwindigkeit").innerHTML = "Geschwind.: " + speed.toFixed(0) + " km/h"/* + "time=" + time + ";lastTime=" + lastTime + ";dist=" + distance + ";speedfunc=" + position.coords.speed*/;
        }
    }
    
    lastLat = lat;
    lastLon = lon;
    lastTime = time;
    /*
    var apiSpeed = position.coords.speed; 
    
    if (apiSpeed != null) {
        speed = apiSpeed * 3.6;
    } 
    */  
    
}


function getLocation() {
    if (lastLat != undefined && lastLon != undefined) 
    {
    var latlon = lastLat + "," + lastLon;
    var url = "https://www.google.com/maps?q="+latlon+"&output=embed";
    document.getElementById("karte").innerHTML = "<iframe class='map1' id='map'src="+url+"></iframe>";
    }
}


function computeDistance(lon1, lat1, lon2, lat2) {
  var R = 6371; // Erdradius in km
  var toRad = Math.PI / 180;
  var dLat = (lat2-lat1) * toRad;
  var dLon = (lon2-lon1) * toRad; 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distanz in km
  return d;
}


function startVideoRecording() {
    var constraintObj = { 
        audio: false, 
        video: { 
            facingMode: "user", 
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 } 
        } 
    };
   
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
            devices.forEach(function (device) {
                console.log(device.kind.toUpperCase(), device.label);
            });
    });

    navigator.mediaDevices.getUserMedia(constraintObj)
    .then(function(mediaStreamObj) {
        //verknuepfe media stream zum "Video"-Element
        var video = document.getElementById('vid1');/*document.querySelector('video')*/;
        video.srcObject = mediaStreamObj;
        video.onloadedmetadata = function(ev) {
            //zeige im "Video"-Element, was Kamera empfaengt
            video.play();
        };
            
        //listeners zum Speichern video/audio
        var stop = document.getElementById('stopTour'/*'btnStop'*/);
        var mediaRecorder = new MediaRecorder(mediaStreamObj);
        var chunks = [];

        //Startet Videoaufeichnung (ohne einen Knopf druecken zu muessen)
        mediaRecorder.start();
        console.log(mediaRecorder.state);

        stop.addEventListener('click', function (ev) {
            mediaRecorder.stop();
            console.log(mediaRecorder.state);
        });
        mediaRecorder.ondataavailable = function(ev) {
            chunks.push(ev.data);
        }
        mediaRecorder.onstop = function (ev) {
            
            var blob = new Blob(chunks, { 'type' : 'video/mp4;' });
            chunks = [];
            var videoURL = window.URL.createObjectURL(blob);
            document.getElementById('videoHolder').innerHTML = "<video class='video1' id='vid2' controls></video>";
            document.getElementById('vid2').src = videoURL;
        }
    });
    
}  

 

 
            