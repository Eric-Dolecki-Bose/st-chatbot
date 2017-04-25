var $messages = $('.messages-content'),
    d, h, m,
    i = 0;
    var knownPreset = -1;

// For use with dynamic Google TTS service (providing mp3 playback).
// -----------------------------------------------------------------

var XML_CHAR_MAP = {
	'<': '&lt;',
	'>': '&gt;',
	'&': '&amp;',
	'"': '&quot;',
	"'": '&apos;'
};

function escapeXml (s) {
	return s.replace(/[<>&"']/g, function (ch) {
		return XML_CHAR_MAP[ch];
	});
}

// -----------------------------------------------------------------

var lastNowPlayingAlbum = "nothing";

$(window).load(function() {

	// Assign focus to the chat input.
	
	$(".message-input").focus()
	$messages.mCustomScrollbar();
	setTimeout(function() {
		fakeMessage();
	}, 100);
	
	// Notifications from the speaker. Incoming.
	
	var ip = $('#ipaddress').val();
	var webSocket = new WebSocket("ws://" + ip + ":8080" , "gabbo");
	var gotNowPlayingMessage = false;
	var timeout;
	
	webSocket.onerror = function(event) {
		console.log("Websocket Error " + event);
	}
	
	// These come fast & furious. Try to prevent multiples.
	webSocket.onmessage = function(event) 
	{	
		var xml = event.data;
		var isNowPlayingUpdated = $(xml).find('nowPlayingUpdated');
		var isVolumeUpdated = $(xml).find("volumeUpdated");
		
		if (isVolumeUpdated.length) {
			console.log("VOLUME UPDATE.");
			var ip = $('#ipaddress').val();
  			var postURL = "http://" + ip + ":8090";
			askForVolume(postURL)
			return;
		}

		// It's a now playing update.
		
		if (isNowPlayingUpdated.length)
		{
			var source = $(xml).find('nowPlaying').attr("source");			
			var stationName = $(xml).find('stationName').first().text();
			var albumName = $(xml).find('album').first().text(); // Never finds it?!?
			var album = $(xml).find('album');			
			
			// Update has a track associated with it.
			
			if (album.length && albumName != "")
			{				
				if(lastNowPlayingAlbum != albumName){					
					lastNowPlayingAlbum = albumName;
				} else {
					return; // We got the same notification in (Pandora, etc.) so let's stop right here.
				}
			}
			
			// Pandora ads kind of screw this up. We get stuff but not track, etc. Whatever, this is a prototype.
			
			if (source != undefined && stationName != undefined && gotNowPlayingMessage == false)
			{
				gotNowPlayingMessage = true;
				source = source.replace(/_/g, ' ');
				console.log(source);
				if (source.toLowerCase() == "standby"){
					displayResponse("Now in standby.");
				} else {
				
					var ip = $('#ipaddress').val();
  					var postURL = "http://" + ip + ":8090";
					setTimeout(function() {
						askForNowPlaying(postURL);
						updateScrollbar();
					}, 2000);
					updateScrollbar();
				}				
				
				// Prevent multiple now playing updates from getting into the chat from the bot. After 5 seconds, another can come in.
				
				clearTimeout(timeout);
				timeout = setTimeout(function(){ gotNowPlayingMessage = false; }, 5000);
			} 
		}
	}
});

// If the user leaves and comes back, assign focus.
$(window).focus(function() {
	$(".message-input").focus()
});

function updateScrollbar() {
  $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  });
}

// This was 24 hour. Made it 12 hour without am/pm.
function setDate() 
{
  d = new Date()
  
  // Prevent the repeated display with the same minute value. Only when different.
  
  if (m != d.getMinutes()) {
    m = d.getMinutes();
    if (m < 10){
    	m = "0" + m;
    }
    var h = d.getHours();
    if (h > 12){ h = h -12; }
    $('<div class="timestamp">' + h + ':' + m + '</div>').appendTo($('.message:last'));
  }
}

function randomNumberFromRange(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

var Sorry = [
  'I\'m sorry, but I am not playing anything at the moment.',
  'If you play something first, I can help with that.',
  'Nope. You need to play something first.',
  'I have no Now Playing information at this time.',
  'Play something first, silly!',
  'I\m sorry Dave, I can\'t do that. Sorry. But you need to play something first. ',
  'I wish I could tell you. You need to play something.',
  'Well... I got nothing. Play something.'
]

var Fake = [
  'Hi there, I am your Bose SoundTouch speaker.',
  'Bonjour. Or something like that...',
  'Hey, how\'s it going?',
  'I come in peace. What\'s up?',
  'What cool stuff can I do for you today?',
  'I\'m Batman. Not really. Sorry about that.',
  'Can I interest you in some awesome music?',
  'Greetings and salutations!',
  'Your wish is my command.'
]

var Hello = [
	'Hey to you too.', 'Hello right back atcha!', 'Have a great day!', 'Hi.', 'Hello.',
	'You look great today!', 'Make today special!', 'Hi. Let\'s do this!', 'Hey, \'sup?'
]

var Doing = [
	'I\'m great, thanks for asking!', 'I hunger to play some tunes!', 'It\'s all good.',
	'Well, after Rush ended touring, I can say I\"ve been better...', 'I feel really good today.',
	'I\'m smiling. This day is great!', 'Awesome. Awesome.', 'Righteous!', 'Good, or güd!'
]

var Joke = [
	'Knock, Knock.<br/>Who\'s there?<br/>Cows go.<br/>Cows go who?<br/>No, silly! Cows go moo!',
	'Q. What can you serve but never eat?<br/>A. A volleyball.',
	'Rick Astley will let you borrow any movie from his collection of Pixar films except one. He\'s never going to give you Up.',
	'Q. How do you find Will Smith in the snow?<br/>A. Look for the fresh prints.',
	'Q. Why did Mozart get rid of his chickens?<br/>A. They kept saying Bach, Bach!',
	'Q. What part of the turkey is musical?<br/>A. The drumstick!',
	'Q. What is the difference between a fish and a piano?<br/>A. You can\'t tuna fish!',
	'Q. What makes pirates such good singers?<br/>A. They can hit the high Cs!',
	'I waited and stayed up all night and tried to figure out where the sun was.<br/><br/>The it dawned on me.',
	'How does NASA organize a party?<br/>They planet.',
	'Knock, Knock.<br/>Who\s there?<br/>To.<br/>To who?<br/>It\'s to whom.',
	'Have you heard about corduroy pillows?<br/>They\'re making headlines.'
]

/*
	This is the main message parser for the chatbot. All text input passes 
	through here for evaluation and action.
*/
function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }
  
  var ip = $('#ipaddress').val();
  var postURL = "http://" + ip + ":8090";
  var message = msg.toLowerCase();
  
  if (message == "power"){
  	sendPowerKey(postURL);
  } else if (message == "preset 1"){
  	playPreset(postURL, "PRESET_1");
  } else if (message == "preset" || message == "play" || message == "play something" || message == "music"){
  
  	// Default to preset #1 in case they hit return too quickly.
  	
  	playPreset(postURL, "PRESET_1");
  	
  } else if (message == "preset 2"){
  	playPreset(postURL, "PRESET_2");
  } else if (message == "preset 3"){
  	playPreset(postURL, "PRESET_3");
  } else if (message == "preset 4"){
  	playPreset(postURL, "PRESET_4");
  } else if (message == "preset 5"){
  	playPreset(postURL, "PRESET_5");
  } else if (message == "preset 6"){
  	playPreset(postURL, "PRESET_6");
  } else if (message == "play"){
  	sendKeyCommand(postURL, "PLAY");
  } else if (message == "pause"){
  	sendKeyCommand(postURL, "PAUSE");
  } else if (message == "volume up"){
  	sendVolumeKey(postURL, "VOLUME_UP");
  } else if (message == "volume down"){
  	sendVolumeKey(postURL, "VOLUME_DOWN");
  } else if (message == "volume"){
  	askForVolume(postURL);
  } else if (message == "mute"){
  	sendKeyCommand(postURL, "MUTE");
  } else if (message == "stop"){
  	sendKeyCommand(postURL, "STOP");
  } else if (message == "now playing" || message == "what's playing"){
  	askForNowPlaying(postURL);
  } else if (message == "help" || message == "what can i ask" || message == "commands"){
   
	setTimeout(function() {
		displayResponse("Things I currently recognize: 'Power', 'Preset 1-6', 'Play', 'Pause', 'Volume up', 'Volume down', 'Mute', 'Stop', 'Now playing', 'Joke', 'Weather', 'Hello', 'How are you', 'Info', 'List', 'Time', 'bark', 'home', 'clear', 'set volume x', and 'Help'.")
	}, 500);
   
  } else if (message == "joke" || message == "tell me a joke" || message == "make me laugh"){
  
  	var len = Joke.length - 1;
  	var index = randomNumberFromRange(0, len);
  	setTimeout(function() {
  		displayResponse(Joke[index]);
  	}, 500);
  
  } else if (message == "weather" || message == "tell me the weather" || message == "what\'s it like outside" || message == "wether"){
  	
  	// This gets spoken too as an audio notification.
  	
  	getWeather();
  	
  } else if (message == "hello" || message == "hi" || message == "sup"){
  
  	// Random reply to this nice message.
  	
  	var len = Hello.length - 1;
  	var index = randomNumberFromRange(0, len);
  	setTimeout(function() {
  		displayResponse(Hello[index]);
  	}, 500);
  
  } else if (message == "how are you" || message == "how's it going?" || message == "you ok?" || message == "how are you?"){
  
  	// Random reply to the nice user asking how the bot is doing.
  	
  	var len = Doing.length - 1;
  	var index = randomNumberFromRange(0, len);
  	setTimeout(function() {
  		displayResponse(Doing[index]);
  	}, 500);
  
  } else if (message == "bark" || message == "dog") {
  	playAudioNotification(postURL, "bark");
  	setTimeout(function() {
  		displayResponse("🐶 bow wow...");
  	}, 500);
  
  } else if (message == "clear"){
  
  	// The user needs to be able to clear out the chat history.
  	
  	$( ".mCSB_container" ).empty();
  
  // Set the speaker to a specific volume.
  } else if (message.includes("set volume")){
  
  	var array = message.split(" ");
  	var amount = array[2];
  	amount = parseInt(amount);
  	if (amount < 0){
  		amount = 0;
  	}
  	if (amount > 100){
  		amount = 100;
  	}
  	
  	if (isNaN(amount)){
  		console.log("Not a number.");
  		alert("set volume requires a number between 0-100.");
  		return;
  	}
  	
  	console.log("set to specific volume: " + amount);
  	
  	// This will produce a web socket return message from the speaker.
  	
  	setToSpecificVolume(postURL, amount);
  	
  } else if (message == "home" || message == "trumpet" || message == "horn"){
  
	playAudioNotification(postURL, "horn");
	setTimeout(function() {
		displayResponse("Welcome home.");
	}, 500);
    
  } else if (message == "get info" || message == "info" || message == "details" || message == "tell me about yourself" || message == "tell me about youself" ||
  			 message == "tell me about you" || message == "who are you"){
  
  	getInformation(postURL);
  
  } else if (message == "list presets" || message == "list the presets" || message == "what are my presets" || message == "list" || message == "preset list" || 
  			 message == "presets list" || message == "presets"){
  
  	listThePresets(postURL);
  
  } else if (message == "time" || message == "what time is it" || message == "give me the time" || message == "what is the time" || message == "what is the time?"){
  
		var dt = new Date();
  		var ampm = "am";
  		var hours = dt.getHours();
  		if (hours > 12){
  			hours = hours - 12;
  			ampm = "pm";
  		}
  		var mins = dt.getMinutes();
		if (mins < 10) {
			mins = "0" + mins;
		}
		var time = hours + ":" + mins + " " + ampm + ".";
		setTimeout(function() {
			displayResponse("It is now " + time )
		}, 500);
  
  } else {  
  	setTimeout(function() {
		displayResponse("I didn't understand \"" + message + "\".")
	}, 500);
  }
  
  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
  setDate();
  $('.message-input').val(null);
  updateScrollbar();
  setTimeout(function(){
  	updateScrollbar();
  }, 250);
}

// Expose the local weather to the chatbot. Speaks it as an audio notification.
function getWeather() {
	reallySimpleWeather.weather({
    wunderkey: '', // leave blank for Yahoo
    location: 'Framingham, MA', //your location 
    woeid: '', // "Where on Earth ID"
    unit: 'f', // 'c' also works
    success: function(weather) {
		var message = weather.currently + " and " + weather.temp + "°" 
			+ weather.units.temp + " in " + weather.city + ", " 
			+ weather.region + ". The wind is " + weather.wind.direction 
			+ " at " + weather.wind.speed + " " + weather.units.speed + ".";
		
		var spokenMessage = "It's " + weather.currently + " and " + weather.temp + "°" 
			+ weather.units.temp + " in " + weather.city + ", " 
			+ weather.region + ".";
		
    	setTimeout(function() {
    		displayResponse(message);
		}, 500);
		
		// Let's speak the results too on the speaker.
		// -------------------------------------------
		// Convert spaces to +
		var editedMessage = spokenMessage.replace(/ /g,"+");
		
		// Convert MA to Massachusetts.
		editedMessage = editedMessage.replace("MA", "Massachusetts");
		
		// Let's speak the weather (removed the wind speed from the speech). The second
		// argument is whether to use CDATA or not. Alternative is to use XML encoding.
		// We need named parameters in Javascript. Gah.
		
		var useCDATA = false;
		playWeatherReport(editedMessage, useCDATA);
    },
    error: function(error) {
    	console.log(error);
    }
});
}

// Volume up and down requires a key press followed by a key release to work properly.
// The change is goofy - it's not +1 or -1 increments. API doesn't allow for setting
// the volume to an exact value. Weirdness I tell you!
function sendVolumeKey(postURL, keyValue) {

	// Here is the press.
	var data = "<key state='press' sender='Gabbo'>" + keyValue + "</key>";
	$.ajax({
		url: postURL + "/key",
		type: 'POST',
		crossDomain: true,
		data: data,
		dataType: 'text',
		success: function (result) {
		
			// Here is the release.
			
			setTimeout(function() {
				var data = "<key state='release' sender='Gabbo'>" + keyValue + "</key>";
				$.ajax({
					url: postURL + "/key",
					type: 'POST',
					crossDomain: true,
					data: data,
					dataType: 'text',
					success: function (result) {
						
						askForVolume(postURL);
				},
					error: function (jqXHR, tranStatus, errorThrown) {
					alert(
						'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
						'Response: ' + jqXHR.responseText
					);
				}
			});
			}, 10); //If this is longer, it changes in larger increments :)
		},
		error: function (jqXHR, tranStatus, errorThrown) {
			alert(
				'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
				'Response: ' + jqXHR.responseText
			);
		}
	});
}

function setToSpecificVolume(postURL, amount) {
	var data = "<volume>" + amount + "</volume>";
	$.ajax({
		url: postURL + "/volume",
		type: 'POST',
		crossDomain: true,
		data: data,
		dataType: 'text',
		success: function (result) {
			
			// Alright, alright, alright.

		},
		error: function (jqXHR, tranStatus, errorThrown) {
			alert(
				'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
				'Response: ' + jqXHR.responseText
			);
		}
	});
}




// Specific to weather reports and generating an audio notification for a successful response.
function playWeatherReport( stringValue, useCDATA ) 
{	
	var ip 			= $('#ipaddress').val();
  	var postURL 	= "http://" + ip + ":8090";
	var ericAppKey 	= "JGD9eUwCG5LP1fg6hMawWnfuIZ3VLJP5";
	var service 	= "Weather";
	var reason 		= "Conditions";
	var message		= "Report";
	var volume 		= "15";
	
	var audioURL, data;
	
	// Using CDATA works as well and might be more efficient? Yes. Could it be dangerous? I don't know yet.
	// If we don't use CDATA, XML encode the string using the method at the top of this file.
	
	if (useCDATA == false) {
		audioURL = escapeXml("http://translate.google.com/translate_tts?ie=UTF-8&tl=en&q=" + stringValue + "&client=tw-ob");
		data = "<play_info><app_key>" + ericAppKey + "</app_key><url>" + audioURL + 
			   "</url><service>" + service + "</service>" + "<reason>" + reason + 
	           "</reason><message>" + message + "</message><volume>" + volume + "</volume></play_info>";
	          	   
	// Use CDATA instead.
	
	} else {
		audioURL = "http://translate.google.com/translate_tts?ie=UTF-8&tl=en&q=" + stringValue + "&client=tw-ob";
		data = 	"<play_info><app_key>" + ericAppKey + "</app_key><url><![CDATA[" + audioURL + 
	    		"]]></url><service>" + service + "</service>" + "<reason>" + reason + 
	        	"</reason><message>" + message + "</message><volume>" + volume + "</volume></play_info>";
	}
          
	$.ajax({
		url: postURL + "/speaker",
		type: 'POST',
		crossDomain: true,
		data: data,
		dataType: 'text',
		success: function (result) {
		
			// Woohoo!
				
		},
		error: function (jqXHR, tranStatus, errorThrown) {
			alert(
				'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
				'Response: ' + jqXHR.responseText
			);
		}
	});
}




// Support all kinds of audio notifications.
function playAudioNotification(postURL, type) {

	var ericAppKey 	= "JGD9eUwCG5LP1fg6hMawWnfuIZ3VLJP5";
	var audioURL 	= "http://www.ericd.net/audio/trumpet.mp3";
	var service 	= "SmartThings";
	var reason 		= "Greetings";
	var message		= "Welcome home Eric";
	var volume 		= "15";
	
	// Default is horn. Other is bark.
	
	if (type == "bark") {
		audioURL 	= "http://www.ericd.net/audio/dog-barking.mp3";
		service 	= "Bose IoT";
		reason 		= "Door";
		message		= "Someone is here";
	} else {
		return;
	}
	
	var data = "<play_info><app_key>" + ericAppKey + "</app_key><url>" + audioURL + 
	           "</url><service>" + service + "</service>" + "<reason>" + reason + 
	           "</reason><message>" + message + "</message><volume>" + volume + "</volume></play_info>";
	$.ajax({
		url: postURL + "/speaker",
		type: 'POST',
		crossDomain: true,
		data: data,
		dataType: 'text',
		success: function (result) {
			
			if (type == "bark"){
				console.log("I should be playing a bark.");
			} else if (type == "horn") {
				console.log("I should be playing a horn.");
			} else {
				console.log("I should be playing the weather.");
			}
		},
		error: function (jqXHR, tranStatus, errorThrown) {
			alert(
				'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
				'Response: ' + jqXHR.responseText
			);
		}
	});
}





// Power command. Respond smartly.
function sendPowerKey(postURL) {
	var data = "<key state='press' sender='Gabbo'>POWER</key>";
	$.ajax({
		url: postURL + "/key",
		type: 'POST',
		crossDomain: true,
		data: data,
		dataType: 'text',
		success: function (result) {
			
			// Wait a bit so things can get settled.
					
		},
		error: function (jqXHR, tranStatus, errorThrown) {
			alert(
				'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
				'Response: ' + jqXHR.responseText
			);
		}
	});
}

function playPreset(postURL, presetNumber) {
	var data = "<key state='release' sender='Gabbo'>" + presetNumber + "</key>";
	$.ajax({
		url: postURL + "/key",
		type: 'POST',
		crossDomain: true,
		data: data,
		dataType: 'text',
		success: function (result) {
		
			// This is handled in the web socket return.

		},
		error: function (jqXHR, tranStatus, errorThrown) {
			alert(
				'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
				'Response: ' + jqXHR.responseText
			);
		}
	});
}

function sendKeyCommand(postURL, keyValue){
	var data = "<key state='release' sender='Gabbo'>" + keyValue + "</key>";
	console.log(keyValue);
	$.ajax({
		url: postURL + "/key",
		type: 'POST',
		crossDomain: true,
		data: data,
		dataType: 'text',
		success: function (result) {
			var key = keyValue.toLowerCase();
			
			// Remove any underscores for display.
			
			key = key.replace(/_/g, ' '); 
			key = key.substr(0,1).toUpperCase() + key.substr(1);
			displayResponse("I got your \"" + key + "\" command.")
			if (key == "Volume up" || key == "Volume down"){
				setTimeout(function() {
					askForVolume(postURL);
				}, 2200);				
			}
		},
		error: function (jqXHR, tranStatus, errorThrown) {
			alert(
				'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
				'Response: ' + jqXHR.responseText
			);
		}
	});
}

function askForVolume(postURL) {
	var getURL = postURL + "/volume";
	$.get( getURL, {})
	.done(function (xml){
		var clientid = $(xml).find('actualvolume').first().text();
		displayResponse("My current volume is " + clientid + ".")
	});
}

// The user would like to get the name, type, etc. about the speaker (bot).
function getInformation(postURL) {
	var getURL = postURL + "/info";
	$.get( getURL, {})
	.done(function (xml){
		var name = $(xml).find('name').first().text();
		var type = $(xml).find('type').first().text();
		var mac  = $(xml).find('info').attr('deviceID');
		//var cat	 = $(xml).find('componentCategory').first().text();
		var soft = $(xml).find('softwareVersion').first().text();
		var ser  = $(xml).find('serialNumber').first().text();
		var ip   = $(xml).find('ipAddress').first().text();
		
		displayResponse("My name is \"" + name + "\" and I am a " + type + ".<br/>My MAC Address is " + mac 
						 + ". Software: " + soft + "<br/>Serial: " + ser + ".<br/>You already know my IP address is " + ip + ".");
	});
}

// The user wants to get a numbered list of their current presets.
function listThePresets(postURL) {
	var getURL = postURL + "/presets";
	$.get( getURL, {})
	.done(function (xml){
		var stationNames = [];
		$(xml).find('preset').each(function(index){
            var presetName = $(this).find('itemName').text();
            if (presetName == ""){
            	presetName = "(empty)";
            }
            stationNames.push( (index + 1) + ". " + presetName);
        });
        var message = "Your current presets are:<br/>";
        for(var i = 0; i < stationNames.length; i++ ){
        	if (i != stationNames.length - 1){
        		message = message + stationNames[i] + "<br/>";
        	} else {
        		message = message + stationNames[i];
        	}
        }
		displayResponse(message);
	});
}

// What is playing right now? This is NOT complete. It needs to expose a lot more.
function askForNowPlaying(postURL, optionalMessage) {
	var getURL = postURL + "/now_playing";
	$.get( getURL, {})
	.done(function (xml){
	
		var station = $(xml).find('stationName').first().text();
		var track = $(xml).find('track').first().text();
		var artist = $(xml).find('artist').first().text();
		var album = $(xml).find('album').first().text();
		var albumArtURL = $(xml).find('art').first().text();
				
		var source = $(xml).find('nowPlaying').attr('source');
		source = source.replace(/_/g, ' ');
		source = source.toLowerCase();
		
		if (station == ""){
		
			var len = Sorry.length - 1;
			var index = randomNumberFromRange(0, len);
			var response = Sorry[index];
			displayResponse(response);
			
		// We have a station. 
		
		} else {
			
			if (optionalMessage == undefined || optionalMessage == ""){
			
				// No album art.
				
				if (albumArtURL == "" ){
					if (track == ""){
						displayResponse("Station: " + station + " on " + source + ".");
					} else {
						source = source.substr(0,1).toUpperCase() + source.substr(1);
						displayResponse("Song: \"" + track + "\" by " + artist + ". Station: " + station + " on " + source + ".");
					}
					
				// We have album artwork but were not supplied with optional message. Create the message.
				
				} else {
				
					source = source.substr(0,1).toUpperCase() + source.substr(1); // pandora to Pandora, internet radio to Internet radio
					var message = "Song: \"" + track + "\" by " + artist + ", from the album " + album + ". " + "Station: " + station + " on " + source + ".";			
					displayResponseWithImage(message, albumArtURL);					
				}
			} else {
				if (albumArtURL == "" ){
					if (track == ""){
						displayResponse(optionalMessage + "<br/>Station: " + station + " on " + source + ".");
					} else {
						displayResponse(optionalMessage + "<br/>Station: " + station + " on " + source + "." + "<br/>Song: " + track);
					}
				} else {
					displayResponseWithImage(optionalMessage + "<br/>Station: " + station + " on " + source + ".", albumArtURL);
				}
			}
		}
	});
	updateScrollbar();
}

// We have artwork to display. So this takes the URL for one.
function displayResponseWithImage(message, url)
{
	$('<div class="message loading new"><figure class="avatar"><img src="img/boseAvatar.jpg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
	updateScrollbar();
  	
  	setTimeout(function() {
    	$('.message.loading').remove();
        
    $('<div class="message new"><figure class="avatar"><img src="img/boseAvatar.jpg" /></figure>' + message + '<img class="resize" src="' + url + '" />' + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    updateScrollbar();
  }, 200 + (Math.random() * 20) * 100);
  
  // Make sure it's set.
  
  setTimeout(function() {
				updateScrollbar();
  }, 2500);
}

// I get used a ton. This is the chatbot's messaging mechanism.
function displayResponse(message){
	$('<div class="message loading new"><figure class="avatar"><img src="img/boseAvatar.jpg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
  	updateScrollbar();
  	
  	setTimeout(function() {
    $('.message.loading').remove();
    $('<div class="message new"><figure class="avatar"><img src="img/boseAvatar.jpg" /></figure>' + message + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    updateScrollbar();
  }, 200 + (Math.random() * 20) * 100);
  updateScrollbar();
}

$('.message-submit').click(function() {
  insertMessage();
});

$(window).on('keydown', function(e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }
})

// This is the intro message. A welcome if you will.
function fakeMessage() {
  if ($('.message-input').val() != '') {
    return false;
  }
  $('<div class="message loading new"><figure class="avatar"><img src="img/boseAvatar.jpg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
  updateScrollbar();

  setTimeout(function() {
    //$('.message.loading').remove();
    
    var len = Fake.length - 1
    var index = randomNumberFromRange(0, len);
    
    var days = ["It's Sunday.", "It's Monday.", "It's Tuesday", "It's Wednesday.",
    			"It's Thursday.", "It's Friday", "It's Saturday", "It's Sunday."
    ]
    var today = new Date().getDay();
    var todayMessage = days[today];
    
    // Let's inform on current play status.
    
    var ip = $('#ipaddress').val();
  	var postURL = "http://" + ip + ":8090";
    var getURL = postURL + "/now_playing";
	$.get( getURL, {})
	.done(function (xml){
		$('.message.loading').remove();
		console.log(xml);
		var source = $(xml).find('nowPlaying').attr('source');
		source = source.replace(/_/g, ' ');
		source = source.toLowerCase();
		
		var message;
		if (source == "standby"){
			message = "I am in standby."
		} else {
			message = "My source is " + source + ".";
		}
		
		$('<div class="message new"><figure class="avatar"><img src="img/boseAvatar.jpg" /></figure>' + Fake[index] + " " + todayMessage + ". " + message + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    updateScrollbar();
    i++;
	});    
  }, 1000 + (Math.random() * 20) * 100);
}

