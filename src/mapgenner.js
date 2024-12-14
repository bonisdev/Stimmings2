// Perlin noise
class PerlinNoise {
    constructor( rnd ) {
        this.perm = [...Array( 256 )].map(() => Math.floor(rnd.random() * 255));
        this.perm = this.perm.concat(this.perm); // Duplicate to avoid buffer overflow
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const fadeX = this.fade(x);
        const fadeY = this.fade(y);

        const p0 = this.perm[X] + Y;
        const p00 = this.perm[p0];
        const p01 = this.perm[p0 + 1];
        const p1 = this.perm[X + 1] + Y;
        const p10 = this.perm[p1];
        const p11 = this.perm[p1 + 1];

        const grad00 = this.grad(p00, x, y);
        const grad10 = this.grad(p10, x - 1, y);
        const grad01 = this.grad(p01, x, y - 1);
        const grad11 = this.grad(p11, x - 1, y - 1);

        return this.lerp(
            fadeY,
            this.lerp(fadeX, grad00, grad10),
            this.lerp(fadeX, grad01, grad11)
        );
    }

// You can add additional functions for 3D or 4D Perlin noise if needed
}

 
// Required for entity interaction

var STIMMINGS_MAP_GEN = {};

STIMMINGS_MAP_GEN.PLAYER_ZERO_ID = 0;
STIMMINGS_MAP_GEN.PLAYER_ONE_ID = 1;
STIMMINGS_MAP_GEN.ENEMY_TEAM_ID = 2;

STIMMINGS_MAP_GEN.getWhitePixels = function( canvas, img ){

    let ctx = canvas.getContext( '2d' );

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Get image data
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    var whitePixelCoordinates = [];

    // Loop through the image data to find white pixels
    for (var i = 0; i < data.length; i += 4) {
        var red = data[i];
        var green=data[i + 1];
        var blue= data[i + 2];

        // Check if the pixel is white (255, 255, 255)
        if (red === 255 && green === 255 && blue === 255) {
            var x = (i / 4) % canvas.width;
            var y = Math.floor((i / 4) / canvas.width);
            whitePixelCoordinates.push({ x: x, y: y });
        }
    }

    return whitePixelCoordinates;
};


STIMMINGS_MAP_GEN.uniqueColoursAndCubeMap = function( canvas, dbEntry ){


    let ctx = canvas.getContext( '2d' );
    canvas.width = 8;
    canvas.height = 8;

    let listOf2DSlices = [];

    let theNuMap = [];
    let allUniqCols = [];

    if(dbEntry.animation){
        let animLookup = ""+dbEntry.animation;
        animLookup = gol[animLookup];
    
        let listOfImages = [];
        if( animLookup.animOffset ){
            for(let u = 0;u < animLookup.anims.length;u+=2){
                listOfImages.push( animLookup.anims[u] );
            } 
        }
        else{
            listOfImages.push( animLookup );
        }
 
        // Loop through each image and compule it into a 2d array of colours
        // [x][y] = {r:22, g: 44, b: 63, a: 34}
        for(let d = 0; d < listOfImages.length;d++){
            
            let entirSlic = new Array( canvas.width );
            for(let b = 0;b < entirSlic.length;b++){
                entirSlic[b] = new Array( canvas.height );
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(listOfImages[d], 0, 0, listOfImages[d].width, listOfImages[d].height);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                let red = data[i];
                let green = data[i + 1];
                let blue = data[i + 2];
                let alph = data[i + 3]; 

                  
                // Check for a colour match
                let currColIndMatch = -1;
                if(alph > 0 ){
                    for(let a = 0;a < allUniqCols.length;a++){
                        if( allUniqCols[a].r === red && allUniqCols[a].g === green && allUniqCols[a].b === blue ){
                            currColIndMatch = a;
                        }
                    }
                    // Need to make new colour
                    if( currColIndMatch === -1 ){
                        allUniqCols.push({r: red, g: green, b: blue});
                        theNuMap.push(allUniqCols.length);
                    }
                    else{
                        theNuMap.push(currColIndMatch+1)
                    }

                }
                else{
                    theNuMap.push(0);
                }

                

                // Check if the pixel is white (255, 255, 255) 
                 
            }

            listOf2DSlices.push(
                entirSlic
            );

        }
 
    }

    return {l: listOf2DSlices, nm: theNuMap, cols:allUniqCols};
    
 
};

STIMMINGS_MAP_GEN.get4DCubeArray = function( canvas, dbEntry ){

    let ctx = canvas.getContext( '2d' );
    canvas.width = 8;
    canvas.height = 8;

    let listOf2DSlices = [];

    if(dbEntry.animation){
        let animLookup = ""+dbEntry.animation;
        animLookup = gol[animLookup];
    
        let listOfImages = [];
        if( animLookup.animOffset ){
            for(let u = 0;u < animLookup.anims.length;u+=2){
                listOfImages.push( animLookup.anims[u] );
            } 
        }
        else{
            listOfImages.push( animLookup );
        }
 
        // Loop through each image and compule it into a 2d array of colours
        // [x][y] = {r:22, g: 44, b: 63, a: 34}
        for(let d = 0; d < listOfImages.length;d++){
            
            let entirSlic = new Array( canvas.width );
            for(let b = 0;b < entirSlic.length;b++){
                entirSlic[b] = new Array( canvas.height );
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(listOfImages[d], 0, 0, listOfImages[d].width, listOfImages[d].height);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                let red =  data[i];
                let green =data[i + 1];
                let blue = data[i + 2];
                let alph = data[i + 3]; 
                // Check if the pixel is white (255, 255, 255) 
                var x = (i / 4) % canvas.width;
                var y = Math.floor((i / 4) / canvas.width);
                entirSlic[x][y] = {
                    r: red, g: green, b: blue, a: alph
                };
            }

            listOf2DSlices.push(
                entirSlic
            );

        }
 
    }

    return listOf2DSlices;
    
 
};




STIMMINGS_MAP_GEN.getBpByName = function(nameVal){
    for(let n = 0;n < ALLBPS.length;n++){
        if(ALLBPS[n].name === nameVal){
            return ALLBPS[n];
        }
    }
    return null;
};

STIMMINGS_MAP_GEN.randFrom = function( seed ){
    let a = 1664525;
    var c = 1013904223;
    c = a * seed + c;
    return (c & 0x00FFFFFF)  / 0x01000000;
}


 

STIMMINGS_MAP_GEN.createEntity = function( entType, initialState, glength, attlength, xx, yy, teamm ){

    // DO NOT ALLOW nothing entities to have a team assigned to them
    // (not TOO important because the shader is hard coded to remove team from "0" entitites)
    if( entType < 1 ){
        teamm = 0;
    }
    let entEntry = FullEntEntries[entType];
    if((entEntry[4] & PHYS.PHYSICS_ALLEGIANCED) > 0){

    }
    else{
        teamm = 0;
    }
                                                                                                                                                        // F             F                       FF              FFFF
    initialState[ (0*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( EZWG.createPackedU16_8(EZWG.createPackedU8(0, 4), teamm), entType );   // SNAPSHOThighlit, cpuHookLastOrientation,  TEAM #,   TYPE of entity wall
    initialState[ (1*attlength) + (xx*glength) + yy ] =                 
                            EZWG.createPackedU32( 0, 0, 121, EZWG.createPackedU8( 0, 4 ) );//lastCmdDetail, hiLiteTag, random prio, next movement direction
                            // (1-4) nextSpawn,   0-7 nextMove (4=stationary)
    initialState[ (2*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( 0, 0 );  // comes preloaded w 4 guys
    initialState[ (3*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( 0, 0 );

    initialState[ (4*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (5*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (6*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (7*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
        
    initialState[ (8*attlength) + (xx*glength) + yy ] =     // util scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (9*attlength) + (xx*glength) + yy ] =     // util scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (10*attlength) + (xx*glength) + yy ] =     // Function values
        EZWG.createPackedU32_4( 0,0,0,0,   0,0,0,0 );
    initialState[ (11*attlength) + (xx*glength) + yy ] =     // Function values
        EZWG.createPackedU32_4( 0,0,0,0,   0,0,0,0 );
        
    initialState[ (12*attlength) + (xx*glength) + yy ] =     // Light values
        EZWG.createPackedU32( 0, 0, 0, 0);
        
    // initialState[ (12*attlength) + (xx*glength) + yy ] =     // Atmosphere values
    //     EZWG.createPackedU32_4( 0,0,0,0,   0,0,0,0 );

};
STIMMINGS_MAP_GEN.createTC_5= function( initialState, glength, attlength, xx, yy, teamm ){

    initialState[ (0*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( EZWG.createPackedU16_8(EZWG.createPackedU8(0, 4), teamm), STAD.ent_stim_home_do );  // CPU Hook, TEAM #,     TYPE of entity homer
    initialState[ (1*attlength) + (xx*glength) + yy ] =   
                            EZWG.createPackedU32( 0, 0, 121, EZWG.createPackedU8( 0, 4 ) );//CTRL_detail, CTRL_tag, random prio, next movement direction
                                                                            // (1-4) nextSpawn,   0-7 nextMove (4=stationary)
    initialState[ (2*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( 0, 45 );  // comes preloaded w 4 guys
    initialState[ (3*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( 0, 0 );

    initialState[ (4*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (5*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (6*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (7*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
        
    initialState[ (8*attlength) + (xx*glength) + yy ] =     // util scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (9*attlength) + (xx*glength) + yy ] =     // util scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (10*attlength) + (xx*glength) + yy ] =     // Function values
        EZWG.createPackedU32_4( 0,0,0,0,   0,0,0,0 );
    initialState[ (11*attlength) + (xx*glength) + yy ] =     // Function values
        EZWG.createPackedU32_4( 0,0,0,0,   0,0,0,0 );
        
    initialState[ (12*attlength) + (xx*glength) + yy ] =     // Light values
        EZWG.createPackedU32( 0, 0, 0, 0);

};
STIMMINGS_MAP_GEN.createOrb= function( initialState, glength, attlength, xx, yy, teamm, orbVal ){

    initialState[ (0*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( EZWG.createPackedU16_8(EZWG.createPackedU8(0, 4), teamm), 9 + (orbVal%16) );  // CPU Hook, TEAM #,     TYPE of entity wall
    initialState[ (1*attlength) + (xx*glength) + yy ] =   
                            EZWG.createPackedU32( 0, 0, 121, EZWG.createPackedU8( 0, 4 ) );//CTRL_detail, CTRL_tag, random prio, next movement direction
                                                                            // (1-4) nextSpawn,   0-7 nextMove (4=stationary)
    initialState[ (2*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( 0, 0 ); 
    initialState[ (3*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( 0, 0 );

    initialState[ (4*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (5*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (6*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (7*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
        
    initialState[ (8*attlength) + (xx*glength) + yy ] =     // util scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (9*attlength) + (xx*glength) + yy ] =     // util scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (10*attlength) + (xx*glength) + yy ] =     // Function values
        EZWG.createPackedU32_4( 0,0,0,0,   0,0,0,0 );
    initialState[ (11*attlength) + (xx*glength) + yy ] =     // Function values
        EZWG.createPackedU32_4( 0,0,0,0,   0,0,0,0 );
        
    initialState[ (12*attlength) + (xx*glength) + yy ] =     // Light values
        EZWG.createPackedU32( 0, 0, 0, 0);

};


STIMMINGS_MAP_GEN.quadrantTypes = [
    // Sparse area
    {
        main: 0,
        speck: STAD.ent_classictree,        // res
        middle: 0,
        TEAM: 0
    },

    {
        main: STAD.ent_classictree,        // res
        speck: STAD.ent_std_wall,        // wall
        middle: 0,
        TEAM: 0
    },
    
    // Vision bug
    {
        main: 0,        // nffin
        speck: STAD.ent_classictree,        // trees
        middle: STAD.ent_ig_visionbug,      // vision bug,
        TEAM: 0
    },
    
    // Mini zBoss  
    {
        main: STAD.ent_longgrass,        // nffin
        speck: STAD.ent_eggmcfkin,        // Minion 1
        middle: STAD.ent_bonbon,      // Mini boss,
        TEAM: 0
    },
    
    // Worm  
    {
        main: 0,        // nffin
        speck: STAD.ent_std_wall,        // wall
        middle: STAD.ent_clubsandwhich,      // Worm
        TEAM: 0
    },
    
    // Classic Trees  
    {
        main: STAD.ent_yewtree,        // nffin
        speck: STAD.ent_burger,        // wall
        middle: STAD.ent_mischf_worm,      // Worm
        TEAM: 0
    },
    
    // Dark moss 
    {
        main: STAD.ent_darkmoss,        // nffin
        speck: STAD.ent_burger,        // wall
        middle: STAD.ent_pancakes,      // Worm
        TEAM: 0
    },
    // Pine Trees  
    {
        main: STAD.ent_pinetree,        // nffin
        speck: STAD.ent_burger,        // wall
        middle: STAD.ent_mischf_worm,      // Worm
        TEAM: 0
    },
    // Palm Trees  
    {
        main: STAD.ent_palmtree,        // nffin
        speck: STAD.ent_burger,        // wall
        middle: STAD.ent_mischf_worm,      // Worm
        TEAM: 0
    }
];

// for(let n = 0;n < 16;n++){
//     STIMMINGS_MAP_GEN.quadrantTypes.push(
//         {
//             main: 9+(n)%16,             // nffin
//             speck:26,                   // Minion 1
//             middle:   9+(n+8)%16        // Mini boss
//         }
//     );
// }

STIMMINGS_MAP_GEN.territoryTypes = [
    STAD.ent_vibranttree,
    STAD.ent_yewtree,
    STAD.ent_longgrass,
    STAD.ent_darkmoss,
    STAD.ent_shortgrass,
    STAD.ent_std_wall,
    STAD.ent_flash_crystal_off,
    STAD.ent_flash_crystal_on,
    STAD.ent_blackstone,
    STAD.ent_bee_wall,
    STAD.ent_spooky_wall
    
]

// QUADRANT location tracker
STIMMINGS_MAP_GEN.directTheQuadrantType = function( entType, initialState, glength, attlength, xx, yy, chunkdindf, teamm ){

    let valind = STIMMINGS_MAP_GEN.randFrom( chunkdindf );
 
    let qt = STIMMINGS_MAP_GEN.quadrantTypes[ Math.floor( chunkdindf % STIMMINGS_MAP_GEN.quadrantTypes.length ) ]

    if( STIMMINGS_MAP_GEN.randFrom( valind*12325 + xx*819 + yy*13 ) < 0.09 ){
        entType = qt.speck;  
    }
    else if( xx%27 === 13 && yy%27 === 13 ){
        entType = qt.middle; 
    }
    else{
        entType = qt.main;  
    } 

    let teamToUse = qt.TEAM +0;
    if( (FullEntEntries[entType][4] & PHYS.PHYSICS_ALLEGIANCED) < 1 ){teamToUse=0;}    // TODO is ther e amore graceful way to deal w this?! No Owenrhesip  - dont explictiyl dissalow it - dont add ruels for no reason 
    initialState[ (0*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( EZWG.createPackedU16_8(EZWG.createPackedU8(0, 4), teamToUse), entType );  // CPU Hook, TEAM #,     TYPE of entity wall
    initialState[ (1*attlength) + (xx*glength) + yy ] =   
                            EZWG.createPackedU32( 0, 0, 121, EZWG.createPackedU8( 0, 4 ) );//CTRL_detail, CTRL_tag, random prio, next movement direction
                            // (1-4) nextSpawn,   0-7 nextMove (4=stationary)
    initialState[ (2*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( 0, 0 );
    initialState[ (3*attlength) + (xx*glength) + yy ] = EZWG.createPackedU32_16( 0, 0 );

    initialState[ (4*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (5*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (6*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (7*attlength) + (xx*glength) + yy ] =     // scents
        EZWG.createPackedU32( 0, 0, 0, 0);
        
    initialState[ (8*attlength) + (xx*glength) + yy ] =     // util scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (9*attlength) + (xx*glength) + yy ] =     // util scents
        EZWG.createPackedU32( 0, 0, 0, 0);
    initialState[ (10*attlength) + (xx*glength) + yy ] =     // Function values
        EZWG.createPackedU32_4( 0,0,0,0,   0,0,0,0 );
    initialState[ (11*attlength) + (xx*glength) + yy ] =     // Function values
        EZWG.createPackedU32_4( 0,0,0,0,   0,0,0,0 );
    initialState[ (12*attlength) + (xx*glength) + yy ] =     // Light values
        EZWG.createPackedU32( 0, 0, 0, 0);

}

STIMMINGS_MAP_GEN.blankNuffin = function( rand, initialState, glength, attlength, NumOfRandomStructs, NumOfFoilageSpots ){ 
    let per = new PerlinNoise( rand ); 

    let valum = -0.1;

    for(let xx = 0;xx < glength;xx++){
        for(let yy = 0;yy < glength;yy++){

            STIMMINGS_MAP_GEN.createEntity( 0, initialState, glength, attlength, xx, yy, 0 );
        }
    }

}

STIMMINGS_MAP_GEN.perlin_W_TightWinding = function( rand, initialState, glength, attlength, NumOfRandomStructs, NumOfFoilageSpots ){ 
    let per = new PerlinNoise( rand ); 

    let valum = -0.1;

    for(let xx = 0;xx < glength;xx++){
        for(let yy = 0;yy < glength;yy++){
            
            let noise_here = per.noise( xx / 13, yy / 13 );

            // Basically combined make the id of the quadrant
            let chx = Math.floor(xx/27);
            let chy = Math.floor(yy/27);

            if( yy === 23 &&  xx === glength-24 ){
                STIMMINGS_MAP_GEN.createTC_5( initialState, glength, attlength, xx, yy, 1 );
            }
            // Manual mover
            else if( yy === 28 &&  xx === glength-24 ){
                STIMMINGS_MAP_GEN.createEntity( STAD.ent_leader_strt, initialState, glength, attlength, xx, yy, 1 );
            }
            // Auto mover
            else if( yy === 28 &&  xx === glength-29 ){
                STIMMINGS_MAP_GEN.createEntity( STAD.ent_std_miner1, initialState, glength, attlength, xx, yy, 1 );
            }
            // Empty space starting spawn area
            else if( yy > 15 && yy < 45 && xx > glength-43 && xx < glength-14 ){
                STIMMINGS_MAP_GEN.createEntity( 0, initialState, glength, attlength, xx, yy, 0 );
            }
            // On a special grid area 
            else if( chx%2===0 && chy%2===1 ){
                let TEAM_ID_OVERRIDE = 0;
                STIMMINGS_MAP_GEN.directTheQuadrantType( 0, initialState, glength, attlength, xx, yy, (Math.floor(chx/2)+(27*chy)), TEAM_ID_OVERRIDE );
                //STIMMINGS_MAP_GEN.createOrb( initialState, glength, attlength, xx, yy, TEAM_ID, (chx + chy*glength) );
                //STIMMINGS_MAP_GEN.createEntity( 8, initialState, glength, attlength, xx, yy, 1 );
            }
            else{
                if( noise_here > valum ){ 
                    STIMMINGS_MAP_GEN.createEntity( 0, initialState, glength, attlength, xx, yy, 0 );
                }
                // Just the normal wall (no team)
                else{
                    STIMMINGS_MAP_GEN.createEntity( STAD.ent_std_wall, initialState, glength, attlength, xx, yy, 0 );
                }
            }
             

        }
    }


    STIMMINGS_MAP_GEN.UNIVERSAL_PLACE_STRUCTURES(rand, initialState, glength, attlength, NumOfRandomStructs, NumOfFoilageSpots );



};

  

 



STIMMINGS_MAP_GEN.territoryPartition = function(rand, initialState, glength, attlength, NumOfRandomStructs, NumOfFoilageSpots ){
    // Define the grid dimensions and "p" value
    const GRID_SIZE = glength;
    let p = 0.45; // Adjust as needed
    let minIslandSize = 150;

    var largestTerritoyIndex = 0;
    var currLargestTerritoryCount = 0;

    var currTerrSize = 0;

    // Initialize the grid and connection weights
    const grid = new Array(GRID_SIZE).fill(null).map(() => new Array(GRID_SIZE).fill(null));
    const connections = new Array(GRID_SIZE).fill(null).map(() => new Array(GRID_SIZE).fill(null).map(() => ({
        top: rand.random(),
        down: rand.random(),
        left: rand.random(),
        right: rand.random()
    })));

    // Ensure connections are consistent between neighboring cells
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            const rightX = wrapIndex(x + 1);
            const downY = wrapIndex(y + 1);

            // Synchronize right/left connections
            connections[x][y].right = connections[rightX][y].left;

            // Synchronize down/top connections
            connections[x][y].down = connections[x][downY].top;
        }
    }

    // Initialize the territories array to track cell classification
    const territories = new Array(GRID_SIZE).fill(null).map(() => new Array(GRID_SIZE).fill(null));
    let territoryId = 0;
    let territorySize = [];

    // Function to wrap around grid indices
    function wrapIndex(index) {
        return (index + GRID_SIZE) % GRID_SIZE;
    }

    // Depth-first search to classify cells into territories
    function classifyTerritory(x, y, id) {
        const stack = [[x, y]];

        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            if (territories[cx][cy] !== null) continue; // Skip already classified cells

            // Assign the current cell to the territory
            territories[cx][cy] = id;

            // Explore neighbors if connections are below the threshold
            if (connections[cx][cy].right < p){stack.push([wrapIndex(cx + 1), cy]); currTerrSize++;}
            if (connections[cx][cy].down < p){ stack.push([cx, wrapIndex(cy + 1)]); currTerrSize++;}
            if (connections[cx][cy].left < p){ stack.push([wrapIndex(cx - 1), cy]); currTerrSize++;}
            if (connections[cx][cy].top < p){  stack.push([cx, wrapIndex(cy - 1)]); currTerrSize++;}
        }
    }

    // Main loop to classify all cells into territories
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (territories[x][y] === null) {
                classifyTerritory(x, y, territoryId);

                if( currTerrSize > currLargestTerritoryCount ){
                    currLargestTerritoryCount = currTerrSize;
                    largestTerritoyIndex = territoryId;
                }
                territorySize.push(0+currTerrSize);
                currTerrSize = 0;

                territoryId++;
            }
        }
    }

    //console.log(`Partitioned into ${territoryId} territories.`); 
    //// Example: Print a small section of the territories array for verification
    //console.log(territories.slice(0, 10).map(row => row.slice(0, 10)));


    for (let xx = 0; xx < GRID_SIZE; xx++) {
        for (let yy = 0; yy < GRID_SIZE; yy++) {

            let terr = territories[xx][yy];
            if (territories[xx][yy] !== null) {
                if( territorySize[terr] > minIslandSize && terr !== largestTerritoyIndex ){ // 
                    STIMMINGS_MAP_GEN.createEntity( STIMMINGS_MAP_GEN.territoryTypes[ Math.floor( terr % STIMMINGS_MAP_GEN.territoryTypes.length ) ], initialState, glength, attlength, xx, yy, 0 );
                

                    // if( terr === largestTerritoyIndex ){ 
                    //     STIMMINGS_MAP_GEN.createEntity( 0, initialState, glength, attlength, xx, yy, 0 );
                    // }
                    // // Just the normal wall (no team)
                    // else{
                    //     STIMMINGS_MAP_GEN.createEntity( STAD.ent_std_wall, initialState, glength, attlength, xx, yy, 0 );
                    // }


                }
                else{
                    STIMMINGS_MAP_GEN.createEntity( 0, initialState, glength, attlength, xx, yy, 0 );
                }

            }
        }

    }

    STIMMINGS_MAP_GEN.UNIVERSAL_PLACE_STRUCTURES(rand, initialState, glength, attlength, NumOfRandomStructs, NumOfFoilageSpots );

    // let folId = Math.floor( randoFoliage.length * rand.random() ); 
    // let topLeftX = Math.floor( glength * rand.random());
    // let topLeftY = Math.floor( glength * rand.random());
 
    // let yy = (topLeftX + Math.floor( 23 * rand.random())) % glength;
    // let xx = (topLeftY + Math.floor( 23 * rand.random())) % glength;

    // // MAKE THE PLACEMENT non- INVASIVE
    // if( (initialState[ (xx*glength) + yy ] & 0x0000FFFF) == 0 ){
    //     STIMMINGS_MAP_GEN.createEntity( randoFoliage[folId], initialState, glength, attlength, xx, yy, THE_TEAM_OF_STRUCTS );
    // } 


};
  




STIMMINGS_MAP_GEN.UNIVERSAL_PLACE_STRUCTURES = function(rand, initialState, glength, attlength, NumOfRandomStructs, NumOfFoilageSpots ){

    var bepgrid = new Array(glength*glength).fill(0);
    // Function to check if a square fits and update the grid
    function placeSquare(grid, x, y, width, height, glengeth) {

        //https://youtu.be/Ry1IjOft95c?si=0olJMRl8kjA9Osk1&t=1701


        const glength = glengeth;

        // Check if the area is all 0's
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const row = (y + i) % glength;
                const col = (x + j) % glength;
                
                if (grid[ (row*glength) + col ] !== 0) {
                    return false; // Return false if any part of the area is not 0
                }
            }
        }

        // If all values are 0, set the area to 1
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const row = (y + i) % glength;
                const col = (x + j) % glength;
                grid[ (row*glength) + col ] = 1;
            }
        }

        return true; // Return true if the area was successfully placed
    }

    // PLACE ALL THE STRUCTURES

    let THE_TEAM_OF_STRUCTS = 0;        // NEUTRALLLL


    // PLACE THEM 

    console.log('ALLBPS', ALLBPS.length)
    console.log(ALLBPS)

    // OR use this::: STIMMINGS_MAP_GEN.getBpByName()
    for(let a = 0;a < NumOfRandomStructs;a++){

        // GET RANDOM BP INDEX....
        let structId = Math.floor( ALLBPS.length * rand.random() );
     
        let beepee = ALLBPS[ structId ];
        if(beepee.name === 'bp_startconfig1'){
            structId = (structId + 1 ) % ALLBPS.length;
            beepee = ALLBPS[ structId ];
        }

        let topLeftX = Math.floor( glength * rand.random());
        let topLeftY = Math.floor( glength * rand.random());

        let placing_starting_tc_now = false;

        THE_TEAM_OF_STRUCTS = 0;

        // ONLY RUN THIS BLOCK ONCE......  
        if( a === NumOfRandomStructs-1 ){
            THE_TEAM_OF_STRUCTS = 1;            // <- adjust player ownership
            beepee = STIMMINGS_MAP_GEN.getBpByName("bp_startconfig1");
            topLeftX = Math.floor(glength/2);//0;           //      MIDDLE OF THE MAP
            topLeftY = Math.floor(glength/2);//0;
            placing_starting_tc_now = true;
        }

        // Place structures brick by brick, and check if it is conflicgin 
        let palcementVerdict = placeSquare( bepgrid, topLeftY, topLeftX,  beepee.width, beepee.height, glength );
        if( palcementVerdict || placing_starting_tc_now ){
            for(let i = 0;i < beepee.data.length;i++){
                let yy = (glength + topLeftY + ((i%beepee.width)) ) % glength;
                let xx = (glength + topLeftX + (beepee.height-Math.floor(i/beepee.width)) ) % glength;
                STIMMINGS_MAP_GEN.createEntity( beepee.data[i], initialState, glength, attlength, xx, yy, THE_TEAM_OF_STRUCTS );
            }
        }
        
    }



    // TODO ADD THES TARTIGN SPAWN STRUCTURE HERE, COMPLETE 




    let randoFoliage = [
        STAD.ent_longgrass,
        STAD.ent_shortgrass
    ];

    // PLACE A  PATCH OF FOLIAGE
    for(let a = 0;a< NumOfFoilageSpots;a++){

        let folId = Math.floor( randoFoliage.length * rand.random() ); 
        let topLeftX = Math.floor( glength * rand.random());
        let topLeftY = Math.floor( glength * rand.random());

        for(let j = 0;j < 24;j++){
            let yy = (topLeftX + Math.floor( 23 * rand.random())) % glength;
            let xx = (topLeftY + Math.floor( 23 * rand.random())) % glength;

            // MAKE THE PLACEMENT non- INVASIVE
            if( (initialState[ (xx*glength) + yy ] & 0x0000FFFF) == 0 ){
                STIMMINGS_MAP_GEN.createEntity( randoFoliage[folId], initialState, glength, attlength, xx, yy, THE_TEAM_OF_STRUCTS );
            }

        }


    }

}