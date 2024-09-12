var Ex9_Stimmings2 = ( ) => { 

//((((PUT UR ENTIRE IMG BUFFER HERE))))

//((((PUT UR ENTIRE BACKGROUND IMG BUFFER HERE))))

//(((THIS EXACT STRING GETS REPLACED WITH DATABSE)))


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
 
    var randomSeedToUse = EZWG.SHA1.seed('ddfdstimmers2dd' + Date.now() + Math.random())
    randomSeedToUse = EZWG.SHA1.sha1( randomSeedToUse );
    console.log("randomSeedToUse:", randomSeedToUse)
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
    
        READ_BACK_FREQ: 111,     // Every 15 time steps read back the gpu buffer
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
        initialState[b] = 0;
    }

    EZWG.SHA1.seed(randomSeedToUse + 'map_gen')

//(((THIS EXACT STRING GETS REPLACED WITH MAPGENNER)))

    STIMMINGS_MAP_GEN.perlin_W_TightWinding(EZWG.SHA1, initialState, glength, attlength )


 
    config.STARTING_BUFFER = initialState;

    // Intital set the default runner to this
    EZ_EXAMPLE = new EZWG( config);
    EZ_EXAMPLE.UPDATE_INTERVAL = 55;//45;
    
};

//(((THIS EXACT STRING GETS REPLACED WITH PATH TO EDITOR)))