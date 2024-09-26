
//(INSERT ENTS CONSTANTS HERE)





var Ex9_Stimmings2 = ( ) => {

//-((INSERT QUICK THE ANIMATION NUMBERS FROM SCRUNCHER.JS))
// ^^^ this also includes all the helpful constants for organziiang and sorting

//((((PUT UR ENTIRE IMG BUFFER HERE))))

//((((PUT UR ENTIRE BACKGROUND IMG BUFFER HERE))))

//(((THIS EXACT STRING GETS REPLACED WITH DATABSE)))


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
                    if(valm > 0 && valm !==5 && entt > 0){  
                        if(hits['entt'+entt]){
                            hits['entt'+entt][valm] = 1;
                        }
                        else{
                            hits['entt'+entt] = [0, 0, 0, 0, 0];
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
                        if(sfxvals[1+i] > 0 && songs[i].length>0){
                            addToConsole( 'sfx: '+ songs[i] + ' on ' + ALL_FULLENTS[en][0], { slowFade: true });
                        }
                    }



                }
                //console.log(hits);
                // addToConsole( ''+JSON.stringify(hits), { slowFade: true });
                // console.log('SOMETHINGS:', wSOMETHIGNS)
                // console.log('@'+currentStep)
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
        STIMMINGS_MAP_GEN.perlin_W_TightWinding(EZWG.SHA1, initialState, glength, attlength )
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