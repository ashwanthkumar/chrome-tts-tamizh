/*
  To test the url pass the following query params
  - gender = hts_tamil_male | hts_tamil_female
  - text = <text in tamil script>
*/
var TTS_SERVER = "http://labs.ashwanthkumar.in/tts-tamil/";

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var voice; // ref to stop the
var speakListener = function(utterance, options, sendTtsEvent) {
  var gender = "hts_tamil_" + (options.gender || "female");
  // var ttsServiceUrl = TTS_SERVER + "?gender=hts_tamil_" + gender + "&text=" + encodeURIComponent(utterance);
  console.debug("Synthesizing the text for speech");
  $.post(TTS_SERVER, {"gender" : gender, "text": utterance}, function(response) {
    console.debug(response);
    speakBuffered(response.url, utterance, sendTtsEvent);
  });
};

var stopSpeaking = function() {
  if(voice) {
    voice.stop();
  }
  console.debug("Stopped speaking");
};

chrome.ttsEngine.onSpeak.addListener(speakListener);
chrome.ttsEngine.onStop.addListener(stopSpeaking);

// For debugging
chrome.contextMenus.create({"title": "Speak Tamil (Female)", "contexts":["selection"], "onclick": speak("female")});
chrome.contextMenus.create({"title": "Speak Tamil (Male)", "contexts":["selection"], "onclick": speak("male")});
chrome.contextMenus.create({"title": "Stop Speaking", "contexts":["selection"], "onclick": stop});

// Stop all speaking, removes the queued ones as well.
function stop() {
  chrome.tts.stop();
}

function speak(gender) {
  return function(info, tab) {
    chrome.tts.speak(info.selectionText, {
      lang: "ta-IN",
      gender: gender
    });
  }
}

function speakBuffered(url, utterance, sendTtsEvent) {
  var loader = new AudioSampleLoader();
  loader.ctx = audioCtx;
  loader.src = url;
  loader.onload = function () {
    console.debug("I'm speaking - " + utterance);

    sendTtsEvent({'type': 'start', 'charIndex': 0});
    voice = audioCtx.createBufferSource();
    voice.buffer = loader.response;
    voice.connect(audioCtx.destination);
    voice.onended = function() {
      sendTtsEvent({'type': 'end', 'charIndex': utterance.length});
      console.debug("Finished speaking");
    }
    console.debug("Started speaking");
    voice.start();
  };
  loader.send();
}

// FIXME - This is a WIP
function speakFromAudio(url, utterance, sendTtsEvent) {
  // mySound = new Audio
  console.debug("Started speaking");
  console.debug("I'm speaking - " + utterance);

  sendTtsEvent({'type': 'start', 'charIndex': 0});
  var audio = new Audio(url)
  audio.volume = 1;
  voice = audioCtx.createMediaElementSource(audio);
  voice.onended = function() {
    sendTtsEvent({'type': 'end', 'charIndex': utterance.length});
    console.debug("Finished speaking");
  }
  voice.connect(audioCtx.destination);
  // voice.start();
}
