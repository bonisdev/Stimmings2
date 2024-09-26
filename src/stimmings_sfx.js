 
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioFiles = []; // Array to store preloaded audio buffers
const lastTimePlayed = [];
//each value negative to positive  
const pitchOrders = []; //-4 to +4 and 0 so 9 in total
//console.log()

// Function to preload audio files
function preloadAudio(url) {
    return fetch(url)
    .then(response => response.arrayBuffer())
    .then(buffer => audioContext.decodeAudioData(buffer))
    .catch(error => console.error('Error loading audio file:', error));
}

// Preload audio files
// Promise.all([
//     preloadAudio('util/sfx/tap.mp3'),       // ind === 0     faith mage discharge  
//     preloadAudio('util/sfx/tendu/LUB__dub.ogg'),               // ind === 1      // DEVIL DYING 2 
// ]).then(buffers => {
//     audioFiles.push(...buffers);
//     for(let n = 0;n < audioFiles.length;n++){
//         lastTimePlayed.push(0);
//     }
// });

// Function to play a sound
function htmlSound( index, pChange ) {
    if( EZ_EXAMPLE && EZ_EXAMPLE.soundToggled && canPlaySound){
        let pitchhhh = isNaN(pChange) ? 0 : pChange; 
        let noww = Date.now();
        if( noww > lastTimePlayed[index] + 120){  
            lastTimePlayed[ index ] = noww; 
        } 
        const source = audioContext.createBufferSource();
        source.buffer = audioFiles[ index ]; 
        const gainNode = audioContext.createGain();
        gainNode.connect( audioContext.destination ); 
        // Connect the source to the gain node
        source.connect(gainNode); 
        source.detune.value = pitchhhh * 200; 
        // Play the audio
        source.start();
    }
}


function playOstTrack( songInd ){
    if( OST_STATE.audioSourceObject ){
        OST_STATE.audioSourceObject.stop();
        OST_STATE.audioSourceObject.disconnect();
    } 
    htmlSongChannel( songInd );
}

function stopOstTrack(){
    if( OST_STATE.audioSourceObject ){
        OST_STATE.audioSourceObject.stop();
        OST_STATE.audioSourceObject.disconnect();
        OST_STATE.audioSourceObject = null;
    }
}

var OST_STATE = {
    playingOneRn: false,
    audioSourceObject: null,
    timeStarted: 0,     // Gets set to 0
}

function htmlSongChannel( index, pChange ) {
    if( canPlaySound ){
        let pitchhhh = isNaN(pChange) ? 0 : pChange;

        OST_STATE.audioSourceObject = audioContext.createBufferSource();
        OST_STATE.audioSourceObject.buffer = audioFiles[ index ];
        const gainNode = audioContext.createGain();
        gainNode.connect( audioContext.destination );

        gainNode.gain.value = 1.4;

        // Connect the source to the gain node
        OST_STATE.audioSourceObject.connect(gainNode);
        OST_STATE.audioSourceObject.detune.value = pitchhhh * 200;

        // Play the audio
        OST_STATE.audioSourceObject.start();
    }
}