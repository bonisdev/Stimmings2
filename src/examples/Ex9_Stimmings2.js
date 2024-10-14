
//(INSERT ENTS CONSTANTS HERE)





var Ex9_Stimmings2 = ( ) => {

//-((INSERT QUICK THE ANIMATION NUMBERS FROM SCRUNCHER.JS))
// ^^^ this also includes all the helpful constants for organziiang and sorting
//-((QUICK INSTERT SFX THINGSTO LOAD))

//((((PUT UR ENTIRE IMG BUFFER HERE))))

//((((PUT UR ENTIRE BACKGROUND IMG BUFFER HERE))))

//(((THIS EXACT STRING GETS REPLACED WITH DATABSE)))


//(((USE THIS EXACT STRING TO PLACE THE BPS)))


ALL_ENTS = EntEntries;
ALL_IMGS = spriteb64s;
ALL_FULLENTS = FullEntEntries;

    let computeWGSL = 
`
((((PUT UR COMPUTE SHASDER HERe))))
`;



    let fragmentWGSL = 
`
((((PUT UR FRAGMENT SHASDER HERe))))
`;



    






    // Convert the images to their U32 arrays 
    // let sprtA = document.getElementById('exmplSprite1');
    // // Ensure the image is fully loaded
    // if (sprtA.complete && sprtA.naturalWidth !== 0) {
    //     const packedPixels = EZWG.processImagePixels(sprtA, 8, 8).concat(
    //         EZWG.processImagePixels(document.getElementById('exmplSprite2'), 8, 8)
    //     );
    //     // console.log(packedPixels);
    //     packedPixels.forEach((packedValue, index) => {
    //         const { r, g, b, a } = EZWG.unpackU32(packedValue);
    //         console.log(`Pixel ${index}: R=${r}, G=${g}, B=${b}, A=${a}`);
    //     });
    // } 
    // else {
    //     console.error('Image failed to load or is not accessible.');
    // }

    // let packedPixels = 
    //     EZWG.processImagePixels(document.getElementById('exmplSprite1'), 8, 8).concat(
    //         EZWG.processImagePixels(document.getElementById('exmplSprite2'), 8, 8)
    //     );
    //let packedPixels = [].concat( allsprites );

    // Sequenitally paintaikling load all the sfx 
    console.log('here are the sfxs to learn');
    console.log(ALL_SFX_KEYS);
    // Function to convert base64 to ArrayBuffer
    function base64ToArrayBuffer(base64) {
        const binaryString = atob(base64.split(',')[1]);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
    

    //var allSfxs = [];
    for(let e = 0;e < ALL_SFX_KEYS.length;e++){
        
        // const audio = new Audio( ''+STAD[''+ALL_SFX_KEYS[e]][1] );
        // audio.load(); // Ensures the audio is preloaded
        // STAD[''+ALL_SFX_KEYS[e]][2] = audio;

        // Convert the base64 string to an ArrayBuffer
        const arrayBuffer = base64ToArrayBuffer( ''+STAD[''+ALL_SFX_KEYS[e]][1] );

        // Synchronously decode the ArrayBuffer into an AudioBuffer
        audioContext.decodeAudioData(arrayBuffer, function(buffer) {
            STAD[''+ALL_SFX_KEYS[e]][2] = buffer;//audioFiles[i] = buffer; // Store the decoded AudioBuffer
            STAD[''+ALL_SFX_KEYS[e]][1] = ( STAD[''+ALL_SFX_KEYS[e]][1] ).length 
        }, function(error) {
            console.error('Error decoding audio data:', error);
        });


    }
 
    var randomSeedToUse = 'ddfdstimmefrs2dd' + Date.now() + Math.random();
    randomSeedToUse = EZWG.SHA1.sha1( randomSeedToUse );
    EZWG.SHA1.seed( randomSeedToUse );

    console.log("randomSeedToUse:", randomSeedToUse);
    document.getElementById('putseedhere').innerHTML = ''+randomSeedToUse;
    var lastReadBackTime = Date.now();
    
    // Usage example
    let config = {

        CELL_SIZE: 16,               // How many pixels across one cell is (fragment renderer
                                    // MUST get  evenly divided by PARTS_ACROSS
        CHUNK_SIZE: 1024,
        CHUNKS_ACROSS: 1,
        PARTS_ACROSS: 16,            // Note* frag shader considers each part one by one pixel

        CELL_VALS: 12,
        
            FRAG_PIXEL_MODE: true, // switches rendering logic to the fragment shader instead of
                                    // many draw calls to two traingle shape  
    
        READ_BACK_FREQ: -1,     // Every 15 time steps read back the gpu buffer
        READ_BACK_FUNC: ( currentStep, entireBuffer ) => {
            // console.log('------__________--------------')
            // console.log('entireBuffer', entireBuffer.length);
            // console.log('currentStep');
            // console.log(entireBuffer);

            let vills= 0;
            // for(let nn = 0;nn < entireBuffer.length;nn++){
            //     let enttt = entireBuffer[nn] & 0x0000FFFF;
            //     if(nn % 7700 === 0){
            //         //console.log(nn,':', entireBuffer[nn], enttt)
            //     }
            //     if(enttt === 2 || enttt === 6){
            //         vills++;
            //     }
            // }
            if( vills > 0 || true){
                //console.log('counting vills:', vills)
            }
            
            let diffinTime = Date.now();
            //console.log(`${diffinTime - lastReadBackTime}`)
            lastReadBackTime = diffinTime
        },

        SFX_HANDLER_FUNC: ( currentStep, entireBuffer, lastBuffer ) => {

            //console.log(CURRENT_ZOOM)
            
            let adjSpeed = 1;
            if( CURRENT_ZOOM > 4 ){ 
                adjSpeed *= 2;
            }
            else{ 
                adjSpeed /= CURRENT_ZOOM; 
            }
            if( isNaN(CURRENT_ZOOM) ) {adjSpeed = 1;}
            adjSpeed *= EZ_EXAMPLE.CELL_SIZE;
            //console.log(window.innerWidth  ,',', adjSpeed )

            let xem = Math.floor( window.innerWidth  / adjSpeed );
            let yem = Math.floor( window.innerHeight / adjSpeed );

            // i guess just 
            //let bpscX = 

            let hits = {};
            let wSOMETHIGNS = 0;
            let SFXBUFFERSIZE = 128;
            //console.log('SFX Buff', entireBuffer.length)
            for(let bn = 0; bn< entireBuffer.length;bn++){

                let xx = bn % SFXBUFFERSIZE;
                let yy = Math.floor(bn / SFXBUFFERSIZE);



                if( xx < xem && yy < yem ){
                    let valm = entireBuffer[bn];
                    let entt = (valm >> 0) & 0x0000FFFF;
                    valm = (valm >> 16) & 0x0000FFFF; 
                    // If value is stepp on
                    if(valm > 0 && entt > 0){//  && valm !==5
                        if(hits['entt'+entt]){
                            hits['entt'+entt][valm]++;
                        }
                        else{                                        // step on,  suggestive team conversion
                            hits['entt'+entt] = [0, 0, 0, 0,   0,    0, 0]; //step on, and suggestive conversion 
                            hits['entt'+entt][valm] = 1;
                        }
                        wSOMETHIGNS = 1;
                        
                    } 
                } 
            }

            if( wSOMETHIGNS > 0 ){
                let objskeys = Object.keys( hits );
                for(let j = 0;j < objskeys.length;j++){
                    let sfxvals = hits[objskeys[j]];
                    let en = objskeys[j].slice(4);
                    en = Number(en);

                    let songs = ALL_FULLENTS[en][2];
                    
                    for(let i = 0;i < songs.length;i++){
                        if(sfxvals[1+i] > 0 && songs[i].length > 0 ){
                            //addToConsole( 'sfx: '+ songs[i] + ' on ' + ALL_FULLENTS[en][0], { slowFade: true });
                            addToConsole( 'sfx: '+ STAD[''+songs[i]][0], { slowFade: true });
                            playSound( -1, STAD[''+songs[i]][2], ((EZ_EXAMPLE.step*119) % 28) );
                        }
                    }

                    // Conversion sound is positivbe
                    if(sfxvals[6] > 0 ){ 
                        addToConsole( 'sfx size: '+ STAD[''+'sfx_convert'][1], { slowFade: true });
                        playSound( -1, STAD[''+'sfx_convert'][2], (EZ_EXAMPLE.step % 28) );
                    }
                }
            }




            
            // IF SCREENSHOT MODE:  DO THE WHOLE LOOP AGAIN:: (AFter CLACUALTING)
            if( EZ_EXAMPLE.ezweb.grabNextBp ){

                // Camera snapping sound 
                addToConsole( 'sfx: '+ STAD[''+'sfx_dslr_cam'][0], { color: 'green' });
                playSound( -1, STAD[''+'sfx_dslr_cam'][2], ((EZ_EXAMPLE.step*119) % 28) );

                // console.log("searching for: ", 
                //     EZ_EXAMPLE.ezweb.gpGrabStartX, 
                //     EZ_EXAMPLE.ezweb.gpGrabStartY, 
                //     EZ_EXAMPLE.ezweb.gpGrabEndX, 
                //     EZ_EXAMPLE.ezweb.gpGrabEndY
                // );
                let minX = Math.min(EZ_EXAMPLE.ezweb.gpGrabStartX, EZ_EXAMPLE.ezweb.gpGrabEndX );
                let minY = Math.min(EZ_EXAMPLE.ezweb.gpGrabStartY, EZ_EXAMPLE.ezweb.gpGrabEndY );
                let maxX = Math.max(EZ_EXAMPLE.ezweb.gpGrabStartX, EZ_EXAMPLE.ezweb.gpGrabEndX );
                let maxY = Math.max(EZ_EXAMPLE.ezweb.gpGrabStartY, EZ_EXAMPLE.ezweb.gpGrabEndY );
                
                let finalEntValues = [];
                for(let bn = 0; bn< entireBuffer.length;bn++){
                    let xx = bn % SFXBUFFERSIZE;
                    let yy = Math.floor(bn / SFXBUFFERSIZE);
                    yy--;//???
                    // If within the bounds ::
                    if( xx >= minX && xx <= maxX && yy >= minY && yy <= maxY){
                        finalEntValues.push( (entireBuffer[bn] >> 0) & 0x0000FFFF );
                    }

                }
                
                let sizeOfBpX = 1 + (maxX - minX);
                let sizeOfBpY = 1 + (maxY - minY);
                // Example usage:
                const u32Array = new Uint32Array(finalEntValues);
                downloadU32ArrayAsFile(u32Array, sizeOfBpX + '_' + sizeOfBpY + '_' + EZ_EXAMPLE.step + '.txt');

                //console.log(finalEntValues);

                EZ_EXAMPLE.ezweb.grabNextBp = false;


                
            }

            //console.log(wSOMETHIGNS,'SFX Buff', entireBuffer.length)
            
        },

        STORAGE: totalbuffer,//packedPixels,

        BUFFER_TYPE: 'u32',
        STORAGE_TYPE: 'u32',

        CONTAINER_ID:   'demoCanvasContainer',    // DOM id to insdert canvas to
        RAND_SEED:      randomSeedToUse, 
        STARTING_CONFIG: EZWG.ALL_BINS,      // couldve been EZWG.ALL_ZERO
        COMPUTE_WGSL: `
            // The custom WGSL code goes here
            ${computeWGSL}
        `,

        FRAGMENT_WGSL: `
            // The custom WGSL code goes here
            ${fragmentWGSL}
        `
    };


    // Extra pre and post processing here :

    let glength = config.CHUNK_SIZE*config.CHUNKS_ACROSS;
    let attlength = glength * glength;
    
    let initialState = new Uint32Array(
        attlength *
        config.CELL_VALS );
    
    for(let b = 0;b < initialState.length;b++){
        initialState[b] = 5;
    }

    EZWG.SHA1.seed(randomSeedToUse + 'map_gen')

//(((THIS EXACT STRING GETS REPLACED WITH MAPGENNER)))



    
    if( WANT_TO_LOAD_NEW){
        console.log("WANNA LOAD AN EXISTING MAP");
        console.log('ENTIRE_LAST_LOADED.length', ENTIRE_LAST_LOADED.length)
        config.STARTING_BUFFER = ENTIRE_LAST_LOADED;
    }
    else{
        let NUM_OF_RANOMD_STRUCTS = 120;
        let NUM_OF_FOLIAGE_SPOTS = 200; 
        STIMMINGS_MAP_GEN.perlin_W_TightWinding(
            EZWG.SHA1, initialState, glength, attlength, 
            NUM_OF_RANOMD_STRUCTS, NUM_OF_FOLIAGE_SPOTS
        );
        console.log("NEW MAP FINE W ME");
        config.STARTING_BUFFER = initialState;
    }


    
    if( WANT_TO_LOAD_NEW){
        // EZ_EXAMPLE.step = INCOMING_STEP+1;
        WANT_TO_LOAD_NEW = false;
        
        config.CHUNKS_ACROSS = 0+INCOMING_CHUNKS;// = Number( kk[1].split('x')[0] );
        config.CHUNK_SIZE = 0+INCOMING_CHNK_SIZE;// = Number( kk[1].split('x')[1] );

        INCOMING_CHUNKS = -1;
        INCOMING_CHNK_SIZE = -1;
        document.getElementById('putseedhere').innerHTML = '-*unknwon*- (loaded)';
        //tried -1, -1  tried +1 , +1, tried 0, 0 
        // Intital set the default runner to this // TODO it's not perfect... some thing is off by one...........
        //........................................................................................
        //.......................................................................................
        // much to think about here....................................
        // mayche check the compute shdaer for when 
        // print out val s when saving?
        // waht the fuck it's different every time XDDDD da fuQ?W
        // WHerre da random nubmabs comin from
        
        EZ_EXAMPLE = new EZWG( config, { elevenMove: 4, stepLater: INCOMING_STEP } );
        EZ_EXAMPLE.step = INCOMING_STEP;
        EZ_EXAMPLE.liveInput[ 11 ] = 4; 
        EZWG.SHA1.seed( LAST_SEED_TOLAOD );

        // ENTIRE_LAST_LOADED = null;
        // INCOMING_STEP = -1;// this is done asynconsoult later
    }
    else{ 
        // Intital set the default runner to this
        EZ_EXAMPLE = new EZWG( config );
    }
    


    PRINT_OUT_NEXT_RUN = true;// TODO debgu fmreove for the detmeriensitic loading glitch

    EZ_EXAMPLE.UPDATE_INTERVAL = 55;//45;
    
};

//(((THIS EXACT STRING GETS REPLACED WITH PATH TO EDITOR)))