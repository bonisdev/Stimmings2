var gametime: f32 = EZ_USER_INPUT[ EZ_USER_IN_SZE - 1 ];

var xPan: u32 = u32(EZ_USER_INPUT[7]);
var yPan: u32 = u32(EZ_USER_INPUT[8]);

var showAleg: f32 = abs(EZ_USER_INPUT[13]); // show a llageince or not

var isDragging: u32 = u32(EZ_USER_INPUT[14]); //1 if the left mouse button is being held down
var mouseToolMode: u32 = u32(EZ_USER_INPUT[4]); // 1= jut selecting, 3, is placing

var SP_MAX_ENEMY_SCENT: u32 = 235u;// max enemy scent for a safe
var SP_MIN_YOUR_SCENT:  u32 = 221u;// min ur own scent for safe placement
var SP_MIN_VIS: u32 = 21u;
 
var time_of_day = u32(gametime) % DAY_LEN;//4096;//8192;//16384;//32768;//
var daytime_f = f32(time_of_day);
var daytimeTrigger: u32 = u32(DAY_LENf * 0.125f);
daytime_f = daytime_f / DAY_LENf;//(GET HTE 0-1 time of day)

var days_completed: u32 = u32(gametime) / DAY_LEN;

// WEATHER SYSYEM::::::::::::::::::

var cloudSize: f32 = 130f + sin(gametime/120f) * 20f;

//::::::::::::::::::::::::::::::::::::::

var sessTeamNum: u32 = u32(abs(EZ_USER_INPUT[16])); // browser session's team number
var safePlacement: u32 = 0u;    // if set to 1 then you can PLACE safely!
var sessTeamWasArrived: u32 = 0u;
if( sessTeamNum > 0u ){
    sessTeamWasArrived = 1u;
    sessTeamNum = sessTeamNum - 1u;
    sessTeamNum = sessTeamNum % 4u;
}

var cloudAmountFromZoom: f32 = 0f;

var cZoom: f32 = abs(EZ_USER_INPUT[9]); 
// Wrap around for ZOOM in fact...
var totalrgbs: f32 = cZoom * cZoom;
var cZumU: u32 = u32( cZoom );

// WTHis actually means ZOOM - around and do zoom instead
if(cZoom > 4f){
    cZoom = 0.5f;
    totalrgbs = 1f;             // NOTE * <- - - THIS variable how many pixels have to be aggregated
    cZumU = 2u;
    
    
    EZ_RAW_ROW = (EZ_CELLS_ACROSS_Y*cFaWu*cZumU) - (u32(floor(fragCoord.y))/1) - 1u;  

    // Recalcualte the cells
    EZX = EZ_RAW_COL / (cFaWu * cZumU);  // If zoom is 2 then accelerate the rate at which the fragment shader goes through cells
    EZY = EZ_RAW_ROW / (cFaWu * cZumU);

    //var EZ_RAW_COL: u32 = u32(floor(fragCoord.x)) / 1; 
    // EZ_RAW_ROW = (EZ_CELLS_ACROSS_Y*cFaWu*cZumU) - (u32(floor(fragCoord.y))/1) - 1u;  
    // EZ_COMP_X = (EZ_RAW_COL % cFaWu) / EZ_FRAG_PPC;
    // EZ_COMP_Y = (EZ_RAW_ROW % cFaWu) / EZ_FRAG_PPC;
    // EZ_COMP_IND = EZ_COMP_X + EZ_COMP_Y * (EZ_CELLS_ACROSS_X*caWu);

    EZ_COMP_X = (EZ_RAW_COL % (cFaWu*cZumU)) / cZumU;
    EZ_COMP_Y = (EZ_RAW_ROW % (cFaWu*cZumU)) / cZumU;
    EZ_COMP_IND = EZ_COMP_X + EZ_COMP_Y * (EZ_CELLS_ACROSS_X*caWu);
    
    cZumU = 1u; // this is to set the loop to one iteration only
                // and the "cZoom" 
    
}
else{

    //if(cZoom)
    cloudAmountFromZoom = cZoom;
    
    // Recalcualte the cells
    EZX = EZ_RAW_COL / (cFaWu / cZumU);  // If zoom out is goin
    EZY = EZ_RAW_ROW / (cFaWu / cZumU);

    EZ_COMP_X = (EZ_COMP_X) % (EZ_cellParts/cZumU);
    EZ_COMP_Y = (EZ_COMP_Y) % (EZ_cellParts/cZumU);
    EZ_COMP_IND = EZ_COMP_X + EZ_COMP_Y * (EZ_CELLS_ACROSS_X*caWu); 
}

var rMode: u32 = u32(EZ_USER_INPUT[10]);

var anim_start: u32 = ${SCHEMA_INDEX.anim_start}u;
var anim_chunk: u32 = ${SCHEMA_INDEX.anim_chunk}u;
var ent_start: u32 = ${SCHEMA_INDEX.ent_start}u;
var ent_chunk: u32 = ${SCHEMA_INDEX.ent_chunk}u;
var sct_start: u32 = ${SCHEMA_INDEX.sct_start}u;
var sct_chunk: u32 = ${SCHEMA_INDEX.sct_chunk}u;
var dmg_start: u32 = ${SCHEMA_INDEX.dmg_start}u;
var dmg_chunk: u32 = ${SCHEMA_INDEX.dmg_chunk}u;

var bg_start: u32 = ${SCHEMA_INDEX.bg_start}u;

var sprt_size: u32 = ${SCHEMA_INDEX.sprite_size}u;
var sprt_sizfe: f32= ${SCHEMA_INDEX.sprite_size}f;






var cellCols: array<vec3<f32>, 16> = array<vec3<f32>, 16>(
    vec3<f32>(1.0, 0.0, 0.0),  // Red
    vec3<f32>(0.0, 1.0, 0.0),  // Green
    vec3<f32>(0.0, 0.0, 1.0),  // Blue
    vec3<f32>(1.0, 1.0, 0.0),  // Yellow
    vec3<f32>(1.0, 0.0, 1.0),  // Magenta
    vec3<f32>(0.0, 1.0, 1.0),  // Cyan
    vec3<f32>(0.5, 0.5, 0.5),  // Gray
    vec3<f32>(1.0, 0.5, 0.0),  // Orange
    vec3<f32>(0.5, 0.0, 1.0),  // Purple
    vec3<f32>(0.5, 1.0, 0.0),  // Lime Green
    vec3<f32>(1.0, 0.0, 0.5),  // Pinkish Red
    vec3<f32>(0.0, 0.5, 1.0),  // Sky Blue
    vec3<f32>(0.5, 0.0, 0.5),  // Dark Purple
    vec3<f32>(0.5, 0.5, 0.0),  // Olive
    vec3<f32>(0.0, 0.5, 0.5),  // Teal
    vec3<f32>(0.3, 0.3, 0.3)   // Dark Gray 
);

var teamColsHighlts: array<vec3<f32>, 5> = array<vec3<f32>, 5>(
    vec3<f32>(1.0, 1.0, 1.0),  // White
    vec3<f32>(0.0, 0.0, 1.0),  // Blue
    vec3<f32>(1.0, 0.0, 0.0),  // Red
    vec3<f32>(0.0, 1.0, 0.0),  // Green
    vec3<f32>(1.0, 1.0, 0.0)  // Yellow 
);




// Update the panning 
EZX = (EZX + xPan + EZ_CELLS_ACROSS_X) % EZ_CELLS_ACROSS_X;
EZY = (EZY + yPan + EZ_CELLS_ACROSS_Y) % EZ_CELLS_ACROSS_Y;

EZ_CELL_IND = EZX + ( EZY * EZ_CELLS_ACROSS_X);

EZ_CHUNK_X = EZX / EZ_CHUNK_SIZE;
EZ_CHUNK_Y = EZY / EZ_CHUNK_SIZE;
EZ_CHUNK_IND = (EZ_CHUNK_X  + EZ_CHUNK_Y * CHUNKS_ACROSS);

// Cell coordinates relative to their respective chunk
EZX_R = EZX % EZ_CHUNK_SIZE;
EZY_R = EZY % EZ_CHUNK_SIZE;


// //EZ_FRAG_PPC = EZ_FRAG_PPC * cZoom;
// cFaWu = cFaWu * cZoom;
// EZ_RAW_COL = u32(floor(fragCoord.x)) / cZoom;  
// EZ_RAW_ROW = (EZ_CELLS_ACROSS_Y*cFaWu) - (u32(floor(fragCoord.y))/cZoom) - 1u;



// EZ_COMP_X= u32(floor(fragCoord.x)) % (cZoom*cFaWu);
// EZ_COMP_Y= (cZoom*cFaWu) - ( u32(floor(fragCoord.y)) % (cZoom*cFaWu) ) - 1u;
// EZ_COMP_X= EZ_COMP_X / cZoom;
// EZ_COMP_Y= EZ_COMP_Y / cZoom;

 
EZ_OUTPUT.red = 0f;
EZ_OUTPUT.grn = 0f;
EZ_OUTPUT.blu = 0f;

// TAke the avg o dis shiet

// TODO test what quadrant y'all in finna shnngg

var zi: u32 = 0u;
var cmprsX: u32 = 0u;
var cmprsY: u32 = 0u;
var cmprsfX: f32 = 0f;
var cmprsfY: f32 = 0f;

// EZ_COMP_X = EZ_COMP_X % (sprt_size/cZumU);
// EZ_COMP_Y = EZ_COMP_Y % (sprt_size/cZumU);










//      MIGRATE THE CELL-WIDE VARIABLES OUT OF THE LOOP

// (we did that ) -> see until end migration tag

// 0, 1, 2, 3       SECOND half is coutner 
let SLOT_0 = EZ_STATE_IN[ EZ_CELL_IND + 0u * EZ_TOTAL_CELLS]; 
let entityType = SLOT_0 & 0x0000FFFF;
var teamNumber: u32 = (SLOT_0 >> 16) & 0x0000FFFF;
var cpuHook: u32 =  (teamNumber >> 8 ) & 0x0000000F;
var snapExps: u32 = (teamNumber >> 12) & 0x0000000F;
teamNumber = (teamNumber >> 0) & 0x000000FF;
//teamNumber = teamNumber + EZX * 12u + EZY * 27u;
var counter: u32 = u32(gametime) + EZX * 1252u + EZY * 1787u;
var counteSr: u32 = u32(gametime);

var ENT_LOOKED = EZ_STORAGE[ 1u + ent_start + (entityType * ent_chunk) ];
var ALLOWED_ORIENT = EZ_STORAGE[ 2u + ent_start + (entityType * ent_chunk) ];
var SYNCEDANIM = (ALLOWED_ORIENT >> 16) & 0x2;
var WINDANIM =   (ALLOWED_ORIENT >> 16) & 0x4;
ALLOWED_ORIENT = (ALLOWED_ORIENT >> 24) & 0x000000FF;

var badPoints = EZ_STATE_IN[ EZ_CELL_IND + 2u * EZ_TOTAL_CELLS];
badPoints = (badPoints >> 16) & 0x0000FFFF;
var trans1Popints = EZ_STATE_IN[ EZ_CELL_IND + 3u * EZ_TOTAL_CELLS];
trans1Popints = (trans1Popints >> 0) & 0x0000FFFF;
var animStart: u32 = ( ENT_LOOKED >> 0 ) & 0x0000FFFF;
var animFreq: u32 =  ( ENT_LOOKED >> 16 ) & 0x0000FFFF;
var animSize: u32 = ( animFreq >> 8 ) & 0x000000FF;
var animOneWay: u32 = animSize & 128;
animSize = animSize & 127u;

//animFreq = animFreq & 0x000000FF;
var flipAnimHor: u32 = animFreq & 128u;     
animFreq = animFreq & 127u;// ALL but the flip bit...
animFreq = max(1, animFreq);
var animFrame: u32 = 0;

// Get the movement details of this entity 
// CMD HIGHLGIHTED?
// LAST HIGHLIGHTED VAL?

var nextMove: u32 = EZ_STATE_IN[ EZ_CELL_IND + 1u * EZ_TOTAL_CELLS]; 
var pPrior: u32 =    (nextMove >> 8) & 0x000000FF;     // IDK --- - What is this guys random priority ?! to always ensure a fill?
var cmdIdTag: u32 = (nextMove >> 16) & 0x000000FF;
var cmdDetail: u32 = (nextMove >> 24) & 0x000000FF;
nextMove = nextMove & 0x000000FF;                 // NEXT MOVE INTENTION before splitting once again
var nextSpawn: u32 = ((nextMove >> 4) & 0x0000000F);
nextMove = nextMove & 0x0000000F;



// Get the min max of the input coordinattres
var minX = min( u32(EZ_USER_INPUT[0]),  u32(EZ_USER_INPUT[2]));
var maxX = max( u32(EZ_USER_INPUT[0]),  u32(EZ_USER_INPUT[2]));
var minY = min( u32(EZ_USER_INPUT[1]),  u32(EZ_USER_INPUT[3]));
var maxY = max( u32(EZ_USER_INPUT[1]),  u32(EZ_USER_INPUT[3]));

var insideX = 0;
var insideY = 0;

// Wrap track is smaller               ( wraped a round the edge)
if( (EZ_CELLS_ACROSS_X-maxX)+minX < maxX-minX ){
    if(EZX >= maxX || EZX <= minX){
        insideX  = 1;
    }
    else{
        insideX = 0;
    }
}
// Normal track is smaller
else{ 
    if(EZX >= minX && EZX <= maxX){
        insideX  = 1;
    }
    else{
        insideX = 0;
    }
}

// Wrap track is smaller
if( (EZ_CELLS_ACROSS_Y-maxY)+minY < maxY-minY ){
    if(EZY >= maxY || EZY <= minY){
        insideY  = 1;
    }
    else{
        insideY = 0;
    }
}
// Normal track is smaller
else{ 
    if(EZY >= minY && EZY <= maxY){
        insideY  = 1;
    }
    else{
        insideY = 0;
    }
}


var softHighlight: u32 = 0;
// Mouse is being dragged
if( isDragging == 1u ){

    // Cell is inside and just hihglgihting
    if( insideX == 1 && insideY==1 ){
        softHighlight = 1u;
    }
}










/// END OF MIGRATION = =============================

























loop{
    if zi >= cZumU*cZumU { break; }
    // rMode USE DIS.....

    //ZOOM IN
    if( cZoom < 1f ){
        cmprsX = EZ_COMP_X;//*cZumU;//cmprsX + 
        cmprsY = EZ_COMP_Y;//*cZumU;//cmprsY + 
    }
    // Normal ZOOMOUT
    else{
        cmprsX = zi % cZumU;
        cmprsX = cmprsX + EZ_COMP_X*cZumU;
        cmprsY = zi / cZumU;
        cmprsY = cmprsY + EZ_COMP_Y*cZumU;
    }

    cmprsfX = f32( cmprsX );
    cmprsfY = f32( cmprsY );

    


    var startOcells: u32 = 4u;
    var lightInd: u32 = 12u;
    //      SCENTS
    var scntSlot0: u32 = EZ_STATE_IN[ EZ_CELL_IND + 2u*EZ_TOTAL_CELLS];
    var scntSlot1: u32 = EZ_STATE_IN[ EZ_CELL_IND + 3u*EZ_TOTAL_CELLS];

    var nScents: u32 = 16u;

    var gottenR: f32 = 0;
    var gottenG: f32 = 0;
    var gottenB: f32 = 0;
    var tempi: u32 = 0;
    var memval: u32 = 0;

    var scentsRawSumTotal: f32 = 0f;            // ( 0-32 value ) mapped from the highest value 
    var refinedSCentsSumTotal: f32 = 0f;        // Total refined scent ( ^ this number through pow(4))
    var allScentsSignficantlyBright: f32 = 0f;  // # of scents that are brighter than 255-32

    var allScentsPresentAtAll: f32 = 0f; 

    // var rawTotalScent: f32 = 0;     // The schmorgesborg view 


    // FIRST 3 path finding slots
    var i: u32 = 0u;
    loop {               
        if i >= nScents { break; }
        tempi = i / 4;      // The mem slot
        if( i % 4 == 0 ){
            memval = EZ_STATE_IN[ EZ_CELL_IND + (startOcells + tempi)*EZ_TOTAL_CELLS];
        }




        // GENERATE THE DIFFERETN TYPES OF COLOUR for each scent
        //tempi = EZ_RAND( tempi * 1237 + memval * 3171 );
        tempi = ( (memval >> ( (i%4u)*8u) ) & 0x000000FF );

        
        // HIJACK QUICKLY FOR CHECKING IF PROPER SAFE PALCEMENT
        // WHILE YOURE HERE JUST DOUBLE CHECK IF TEAM SCENT IS ENOUGH FOR SAFE PLACE
        if( i > nScents - 4u - 1u ){
            if( tempi > SP_MIN_YOUR_SCENT && (i-12u) == sessTeamNum ){
                safePlacement = safePlacement + 1u;
            }
            else if( tempi < SP_MAX_ENEMY_SCENT && (i-12u) != sessTeamNum ){
                safePlacement = safePlacement + 1u;
            } 
        }



        if( tempi > 1u ){           // Colour fades rapidly after this distance anyways 
                                    //so dont include less signficant scents than this
            var intensirty: f32 = f32(tempi) / 255f;

            // if( intensirty > 0.78 ){
            //     allScentsThatAreSignif+=1f;
            // } 

            intensirty = max(0f, ((intensirty-(220f/255f)) / (35f/255f)) );
            scentsRawSumTotal = scentsRawSumTotal + intensirty;
            
            if( intensirty > 0f ){
                allScentsSignficantlyBright = allScentsSignficantlyBright + 1f;
            }  

            var tempDesirdVal: f32 = 0f + intensirty;
            intensirty = pow( intensirty, 4); 

            refinedSCentsSumTotal = refinedSCentsSumTotal + intensirty*3;//1.5f; 
            allScentsPresentAtAll = allScentsPresentAtAll + 1f;

            // Glow mode:
            if( rMode == 1u ){
                gottenR = gottenR + cellCols[i].x * intensirty;  //EZ_RAND( 1491 + i * 7237 + i*i*33 ) * intensirty;
                gottenG = gottenG + cellCols[i].y * intensirty;  //EZ_RAND( 1491 + i * 8137 + i*i*17 ) * intensirty;
                gottenB = gottenB + cellCols[i].z * intensirty;  //EZ_RAND( 1491 + i * 5887 + i*i*11 ) * intensirty;
            }
            // Schmorgesbrog
            // else if( rMode == 2u ){
            //     //intensirty = f32(tempi);
            //     gottenR = gottenR + cellCols[i].x;//*intensirty;  //EZ_RAND( 1491 + i * 7237 + i*i*33 ) * intensirty;
            //     gottenG = gottenG + cellCols[i].y;//*intensirty;  //EZ_RAND( 1491 + i * 8137 + i*i*17 ) * intensirty;
            //     gottenB = gottenB + cellCols[i].z;//*intensirty;  //EZ_RAND( 1491 + i * 5887 + i*i*11 ) * intensirty;
            // }
        }



        
        
        //refinedSCentsSumTotal = refinedSCentsSumTotal + 1;

        i = i + 1u;
    }


    // Depending on whatchu want
    // Glow mode
    if(rMode == 1u){
        gottenR = gottenR / max(1,allScentsPresentAtAll);
        gottenG = gottenG / max(1,allScentsPresentAtAll);
        gottenB = gottenB / max(1,allScentsPresentAtAll);
        scentsRawSumTotal = scentsRawSumTotal /  max(1,allScentsPresentAtAll);
    }
    // Schmorgesborg
    else if(rMode == 2u){
        // gottenR = gottenR / max(1,allScentsPresentAtAll);
        // gottenG = gottenG / max(1,allScentsPresentAtAll);
        // gottenB = gottenB / max(1,allScentsPresentAtAll);
        // scentsRawSumTotal = scentsRawSumTotal /  max(1,allScentsPresentAtAll);
    }


   

    //var homScent: f32 = f32( scntSlot0 & 0x000000FF );
    //var resScent: f32 = f32( (scntSlot0 >> 8) & 0x000000FF ); 
    //homScent = max(0, 1 - (1-homScent/255f)*63 );
    //resScent = max(0, 1 - (1-resScent/255f)*63 );


    var thisPixBg: u32 = 0;
    if (entityType > 0u) {

        if( animOneWay > 0 ){ 
            animFrame = animStart + min( ((trans1Popints)/(animFreq)), animSize-1 );// WAS badPoints//((trans1Popints)/(animFreq)) % animSize ;
        }
        else{
            // DO SYNCED
            if( SYNCEDANIM > 0 ){   // if true dont randomize animation playback (syncup is required)
                animFrame = animStart + ((counteSr/animFreq) % animSize); 
            }
            else{
                // DO WIND
                if( WINDANIM > 0 ){
                    // Simulate gust using pseudo-randomness based on (x, y) and time
                    let windEffect = sin(f32(EZX) * 0.1f + gametime * 0.05f) + cos(f32(EZY) * 0.1f + gametime * 0.05f);

                    // Apply pseudo-random effect to make the wind feel less uniform
                    let gustEffect = windEffect + pseudoRandom(f32(EZX), f32(EZY), gametime * 0.01f);

                    // Use gustEffect to determine the animation frame
                    //let frame = (gustEffect * f32(animSize)) % animSize; 
                    //animFrame = animStart + ((counter/animFreq) % animSize);

                    animFrame = animStart + u32(gustEffect * f32(animSize)) % animSize; 
                }
                // JUST NORMAL CUCLE
                else{
                    animFrame = animStart + ((counter/animFreq) % animSize);
                } 
            }
            
        }

        var colorVec = 0u;

        // Take into account if the animation frames are in the wrong orientation so you just flip it around 
        var normalXPixel: u32 = 0;
        var flippedXPixel: u32 = 0;
        if( flipAnimHor > 0 ){
            normalXPixel = (sprt_size - cmprsX - 1);
            flippedXPixel = cmprsX;
        }
        else{
            normalXPixel = cmprsX;
            flippedXPixel = (sprt_size - cmprsX - 1);
        }

        // Rotation transformations
        // Define rotation transformations for 45 degrees (sine and cosine values for 45 degrees)
 
        var entpi: f32 = 90f;

        // SPRITE ORIENTATION
        if( ((ALLOWED_ORIENT >> cpuHook ) & 1) > 0 ){

            // if (cpuHook == 0) { // Northeast
            //     let coords = rotate_pixel(normalXPixel, cmprsY, -45.0, sprt_size);
            //     colorVec = EZ_STORAGE[(anim_chunk * animFrame) + coords.x + coords.y * sprt_size];
            // } 
            // else if (cpuHook == 2) { // Southeast
            //     let coords = rotate_pixel(normalXPixel, cmprsY, 45.0 + 180, sprt_size);
            //     colorVec = EZ_STORAGE[(anim_chunk * animFrame) + coords.x + coords.y * sprt_size];
            // } 
            // else if (cpuHook == 4) { // Southwest
            //     let coords = rotate_pixel(flippedXPixel, cmprsY, 45.0, sprt_size);
            //     colorVec = EZ_STORAGE[(anim_chunk * animFrame) + coords.x + coords.y * sprt_size];
            // } 
            // else if (cpuHook == 6) { // Northwest
            //     let coords = rotate_pixel(flippedXPixel, cmprsY, -45.0, sprt_size);
            //     colorVec = EZ_STORAGE[(anim_chunk * animFrame) + coords.x + coords.y * sprt_size];
            // }
            
            if( cpuHook==5 || cpuHook == 2 || cpuHook==0){//5<- face left //3<- right  //1<-up   //7<- GOING DOWN
                colorVec = EZ_STORAGE[(anim_chunk * (animFrame)) + (flippedXPixel) + (cmprsY)*sprt_size];
            }
            else if( cpuHook==7 ){ // should face up 
                colorVec = EZ_STORAGE[(anim_chunk * (animFrame)) + (sprt_size-cmprsY-1) + (normalXPixel)*sprt_size];
            }
            else if( cpuHook==1 ){ // 7 goin DOWN
                colorVec = EZ_STORAGE[(anim_chunk * (animFrame)) + (cmprsY) + (flippedXPixel)*sprt_size];
            }
            else if( cpuHook==6 || cpuHook == 4 ){// North East + South east (default)
                // DEFAULT ORIENTATION
                colorVec = EZ_STORAGE[(anim_chunk * (animFrame)) + (normalXPixel) + (cmprsY)*sprt_size];
            } 
            else {// 3 face right (classic)  (DEFAULT ORITIENATION, IS SPRITES ARE FACING RIGHT)
                // DEFAULT ORIENTATION
                colorVec = EZ_STORAGE[(anim_chunk * (animFrame)) + (normalXPixel) + (cmprsY)*sprt_size];
            } 

            
        }
        // DEFAULT ORIENTATION
        else{
            colorVec = EZ_STORAGE[(anim_chunk * (animFrame)) + (normalXPixel) + (cmprsY)*sprt_size]; 
        }
        var alpha: u32 = (colorVec >> 24) & 0xFF;

        var colorFromPix: u32 = 0u;
        if(alpha == 254 && teamNumber > 0u ){           //<--  APPLY team colour!
            gottenR = f32(colorVec & 0xFF) / 255.0;
            gottenR = gottenR + (teamColsHighlts[ teamNumber ].x - gottenR) * 0.59f;
            gottenG = f32((colorVec >> 8) & 0xFF) / 255.0;
            gottenG = gottenG + (teamColsHighlts[ teamNumber ].y - gottenG) * 0.59f;
            gottenB = f32((colorVec >> 16) & 0xFF) / 255.0;
            gottenB = gottenB + (teamColsHighlts[ teamNumber ].z - gottenB) * 0.59f;
            colorFromPix = 1;
        }
        else if( alpha > 0 ){    // TODO change to 253 and under, 254 means it needs it team colours to com through 
            gottenR = f32(colorVec & 0xFF) / 255.0;
            gottenG = f32((colorVec >> 8) & 0xFF) / 255.0;
            gottenB = f32((colorVec >> 16) & 0xFF) / 255.0;
            colorFromPix = 1;
        }
        else{
            thisPixBg = 1;
        }


        // If highlighted apply some filters
        if(softHighlight == 1 && colorFromPix == 1){
            
            // Using for selection
            if(  mouseToolMode == 1 ){
                // Just draggin the selectino box over entity 
                if( teamNumber > 0u){
                    gottenR = gottenR + (teamColsHighlts[ teamNumber ].x-gottenR)*0.3 + sin(gametime/3 + f32(teamNumber*1193u*teamNumber))*((teamColsHighlts[ teamNumber ].x-gottenR)*0.1);
                    gottenG = gottenG + (teamColsHighlts[ teamNumber ].y-gottenG)*0.3 + sin(gametime/3 + f32(teamNumber*1193u*teamNumber))*((teamColsHighlts[ teamNumber ].y-gottenG)*0.1);
                    gottenB = gottenB + (teamColsHighlts[ teamNumber ].z-gottenB)*0.3 + sin(gametime/3 + f32(teamNumber*1193u*teamNumber))*((teamColsHighlts[ teamNumber ].z-gottenB)*0.1);
                }
                else{
                    gottenR = gottenR + (1-gottenR)*0.041;
                    gottenG = gottenG + (1-gottenG)*0.041;
                    gottenB = gottenB + (1-gottenB)*0.041;
                } 
            }
            // Ysing to palce stuff
            else if( mouseToolMode == 3){ 

            }
        }


        // Add the DayTIme SHining notif
        
        // SHINING effect from day start glow
        if( time_of_day > daytimeTrigger && time_of_day < daytimeTrigger + 172 ){
            // The effect lasts time
            var distFromTod: f32 = f32( time_of_day - daytimeTrigger );
            distFromTod = sin(distFromTod/52f) / 1f;
            
            if( distFromTod > 0f ){                                         // LOOK: the 0.4 is how much closer to white to move the team col, then 0.65 for how close the pixels shuld go to the guy
                gottenR += ((teamColsHighlts[ teamNumber ].x+(1f-teamColsHighlts[ teamNumber ].x)*0.4)*0.65 - gottenR ) * distFromTod;
                gottenG += ((teamColsHighlts[ teamNumber ].y+(1f-teamColsHighlts[ teamNumber ].y)*0.4)*0.65 - gottenG ) * distFromTod;
                gottenB += ((teamColsHighlts[ teamNumber ].z+(1f-teamColsHighlts[ teamNumber ].z)*0.4)*0.65 - gottenB ) * distFromTod;
            }
        }
        
        
    }

    




    // INTERMISSION JUST TO GRAB THE MINIMUM VISION VALUE TO SEE IF SAFE PALCE ALLOWED ORNOT
    startOcells = 8u;
    var visionValue: f32 = 0f;
    var explValue: f32 = 0f;
    var elecValue: f32 = 0f;
    var radiValue: f32 = 0f;//radiation value

    var firstLight: f32 = 0f;

    memval = EZ_STATE_IN[EZ_CELL_IND + (startOcells + 0)*EZ_TOTAL_CELLS]; 
    tempi = ((memval >> ((0%4u)*8u)) & 0x000000FF);

    if( tempi > SP_MIN_VIS ){       // MINIMUM VISION TO PLACE SOMETHING SAFE PLACE MIN THRESHOLD
        safePlacement = safePlacement + 1u;// the final boost 
    }






    // A certified back ground pixel or no entity at all her
    if( thisPixBg == 1u || entityType < 1u ){
         
        var tBgX: u32 = (EZX%128) * 16 + cmprsX; 

        var tBgY: u32 = (EZY%128) * 16 + cmprsY; 

        // GET THE BG VAL
        var bgPix = EZ_STORAGE[bg_start + tBgY + tBgX*2048];


        // If more than one scent found here (NOT!),
        //      AND   Depending on render mode maybe dont ebeven disapyl the agoten
        if( rMode == 0u ){     //allScentsPresentAtAll < 1f || 

            gottenR = f32(bgPix & 0xFF) / 255f;         //0f;
            gottenG = f32((bgPix >> 8) & 0xFF) / 255f;
            gottenB = f32((bgPix >> 16) & 0xFF) / 255f; 

           // gottenR = 21f / 255f;
           // gottenG = 23f / 255f;
           // gottenB = 26f / 255f;
        }
        // For GLOW
        else if(rMode == 1u){
            gottenR -= (gottenR  - (f32(bgPix&0xFF)/255f))           * ( 0.45*scentsRawSumTotal );//refinedSCentsSumTotal
            gottenG -= (gottenG  - (f32((bgPix >> 8) & 0xFF)/255f))  * ( 0.45*scentsRawSumTotal );//refinedSCentsSumTotal
            gottenB -= (gottenB  - (f32((bgPix >> 16) & 0xFF)/255f)) * ( 0.45*scentsRawSumTotal );//refinedSCentsSumTotal
        }
        // For crounge
        else if(rMode == 2u){

            //if(entityType == 0 && safePlacement == 5u && sessTeamWasArrived > 0u ){ //also include if correct
            if(entityType > 0u){
                gottenR = teamColsHighlts[teamNumber].x;
                gottenG = teamColsHighlts[teamNumber].y;
                gottenB = teamColsHighlts[teamNumber].z;

            }
            // // also throw in if good to build
            // else if(entityType == 0u &&safePlacement == 5u && sessTeamWasArrived > 0u){
            //     gottenR += (1f - gottenR) * 0.45f;
            //     gottenG += (1f - gottenG) * 0.45f;
            //     gottenB += (1f - gottenB) * 0.45f;
            // }
            // // invalid for safe placement of blocks - so just show the normal SCHMORGESBORG OF SCENTS
            // else{
            //     gottenR -= ( gottenR - (f32( bgPix & 0xFF)/255f)          ) * 0.62; 
            //     gottenG -= ( gottenG - (f32((bgPix >> 8) & 0xFF)/255f)    ) * 0.62;
            //     gottenB -= ( gottenB - (f32((bgPix >> 16) & 0xFF)/255f)   ) * 0.62;
            // }


        }
        
    }

    // If cmd tag is not nothin - then highlight in here:
    if( cmdIdTag > 0u && teamNumber > 0u ){
        // If it's the border thing
        if( cmprsX == 0 || cmprsY == 0 || cmprsX == sprt_size-1 || cmprsY == sprt_size-1 ){
            gottenR = teamColsHighlts[ teamNumber ].x;
            gottenG = teamColsHighlts[ teamNumber ].y;
            gottenB = teamColsHighlts[ teamNumber ].z;
        }
    }
    // If ever=present optino to show allgaeinced units is on highlgiht sumin diff:
    // (SPARKLE HIGHLIGHT)
    if( (showAleg > 0f && teamNumber > 0u) ){
        if( u32(EZ_RAND(counter+cmprsY*193+cmprsX*111)*24) % 16 == 0 ){
            gottenR = teamColsHighlts[ teamNumber ].x;
            gottenG = teamColsHighlts[ teamNumber ].y;
            gottenB = teamColsHighlts[ teamNumber ].z;
        }
    }





    // Just draggin the selectino box over entity - this takes all the stuff  in the cell (so even if no sprites are on the cell it will chagne the col of the )
    if(softHighlight == 1){
        
        // Hihgliting stuff
        if( mouseToolMode == 1){
            if( teamNumber > 0u){
                gottenR += (teamColsHighlts[ teamNumber ].x-gottenR)*0.09f;
                gottenG += (teamColsHighlts[ teamNumber ].y-gottenG)*0.09f;
                gottenB += (teamColsHighlts[ teamNumber ].z-gottenB)*0.09f;
            }
            else{
                gottenR += (1f - gottenR) * 0.041f;
                gottenG += (1f - gottenG) * 0.041f;
                gottenB += (1f - gottenB) * 0.041f;
            }
        }
        // Safe placing stuff (NON-CHEAT)
        else if( mouseToolMode == 2){


            // Need to double check what team u can draw on 
            // TODO note that if a session does not have a team number it cant interact (SPECTATOR MODE)
            if( sessTeamWasArrived > 0u ){
                if( entityType == 0u && safePlacement == 5u){
                    gottenR += (0.15f-gottenR)*0.441f;
                    gottenG += (0.82f-gottenG)*0.441f;
                    gottenB += (0.2f-gottenB)* 0.441f;
                }
                else{ 
                    gottenR += (0.91f-gottenR)*0.541f;
                    gottenG += (0.23f-gottenG)*0.541f;
                    gottenB += (0.10f-gottenB)*0.541f;
                }
            }
            else{// idk just black (you are s pectator i guess?) TODO TBD...
                gottenR = 0f;
                gottenG = 0f;
                gottenB = 0f;
            }

        }
        // Force placing stuff (CHEATS)
        else if( mouseToolMode == 3){
            if( entityType > 0u ){
                gottenR = gottenR + (0-gottenR)*0.641;
                gottenG = gottenG + (0-gottenG)*0.641;
                gottenB = gottenB + (0-gottenB)*0.641;
            }
            else{ 
                gottenR = gottenR + (1-gottenR)*0.641;
                gottenG = gottenG + (1-gottenG)*0.641;
                gottenB = gottenB + (1-gottenB)*0.641;
            }
        }
        // About tot ake snapshoty
        else if( mouseToolMode == 4){
            gottenR = gottenR + (0.8-gottenR)*0.541;
            gottenG = gottenG + (0.8-gottenG)*0.541;
            gottenB = gottenB + (0.1-gottenB)*0.541;
        }
    }



    // SECOND 2 utility scents (vision, expl, ......)
    // VISUAL MODIFIERS ON TOP OF EVERYTHING AFTER THE BACKGROUDNA DNT EHS SPRITES
          
    

    visionValue = f32( tempi );
    //if (tempi > 0u) {
        // gottenR += sin(f32(gametime) * 0.1 + f32(cmprsX) * 0.1) * (f32(tempi) / 255.0);
    //}
 
    tempi = ((memval >> ((1%4u)*8u)) & 0x000000FF);
    explValue = f32( tempi );
    tempi = ((memval >> ((2%4u)*8u)) & 0x000000FF);
    elecValue = f32( tempi );
    
    tempi = ((memval >> ((3%4u)*8u)) & 0x000000FF);
    radiValue = f32( tempi );
    if (tempi > 0u) {
        // gottenB += cos(f32(gametime) * 0.05) * (f32(tempi) / 255.0);
    }
  
    // This is the next set of util scents - used for LIGHTS? i guess
    memval = EZ_STATE_IN[EZ_CELL_IND + (startOcells + 1)*EZ_TOTAL_CELLS];
    tempi = ((memval >> ((0%4u)*8u)) & 0x000000FF);

    // REMINDER: this goes through every cell NOT Component (16x16 of them in a cell (at least in Stimmings 2))
    // Go through... area (ur still in the LOOP) so can do PIXEL?!
    
    var posHit: f32 = 0;

    var dx: i32 = 0i;
    var dy: i32 = 0i;
    var distHolder: f32  = 0f;//vec2<f32>(0,0);
    
    var lsize: u32 = 2u;
    var rayChcks: u32 = 1u;//<- should just be 14 i think
    var totalw: u32 = 2u*lsize + 1u;
    var maxrlen: u32= lsize;
    var cvec: u32 = 0;
    var raystep: u32 = 0;
    if( cZoom != 4f && 3 > 4 ){  // the max zoom out 
    loop {
        if cvec >= totalw*totalw*rayChcks { break; }

        raystep = cvec % rayChcks;

        // Last ray step eval
        if( raystep == 0u ){//rayChcks-1){
            dx = -i32(lsize) + i32((cvec/rayChcks)%totalw);           // X Value
            dy = -i32(lsize) + i32((cvec/rayChcks)/totalw);           // Y Value
            tempi = EZ_CELL_VAL( EZX, dx, EZY, dy, startOcells + 1);

            distHolder = length( vec2<f32>( f32(dx) - 0.5f+0.00012f + (sprt_sizfe-1-cmprsfX)*(1f/sprt_sizfe), 
                f32(dy) - 0.5f+0.0001f + (sprt_sizfe-1-cmprsfY)*(1f/sprt_sizfe) ) );//vec2<f32>(f32(dx), f32(dy));

            if( (tempi&0x000000FF) > 0u ){
                posHit += 1f / ( (f32(tempi&0x000000FF)) * 0.0273f * distHolder * distHolder); 
            }
        }

        

        //if(tempi)

        cvec = cvec + 1u;
    }
    }


    // IF ANY LIGHT AT ALL...
    if( posHit > 0f ){
        posHit = pow( posHit, 2 );
        gottenR += (1f - gottenR) * posHit;// 0f;
        gottenG += (0f - gottenG) * posHit;// 1f;
        gottenB += (0f - gottenB) * posHit;// 0f;
    }




    //  ^^^  OLD RADIATING LIGHT - PER- PIXEL - VERY EXPENSIVE.


    // > this just usese
    // This is the next set of util scents - used for LIGHTS? i guess
    memval = EZ_STATE_IN[EZ_CELL_IND + (lightInd + 0)*EZ_TOTAL_CELLS];
    tempi = ((memval >> (24u)) & 0x000000FF);

    if( tempi > 0u ){
        distHolder = f32(tempi)/255f;
        // distHolder = max(0f, distHolder - 0.9f) * 10f;
        // distHolder = pow(distHolder, 2f);
        
        gottenR += (1f - gottenR) * distHolder;
        gottenG += (1f - gottenG) * distHolder;
        gottenB += (1f - gottenB) * distHolder;
        
    }











    // Last check for functional jooses
    var totalLineTypes: f32 = 0f;
    var funcLineR: f32 = 0f;
    var funcLineG: f32 = 0f;
    var funcLineB: f32 = 0f;
    startOcells = 10u;
    i = 0u;
    loop {               
        if i >= 16 { break; }
        if( i % 8 == 0 ){
            memval = EZ_STATE_IN[EZ_CELL_IND + (startOcells + (i/8))*EZ_TOTAL_CELLS]; 
        }
        tempi = ((memval >> ((i%8u)*4u)) & 0x0000000F);
        if( tempi == 1){// if right at the end of the Functinal outskirt
            funcLineR = funcLineR + cellCols[i].x;
            funcLineG = funcLineG + cellCols[i].y;
            funcLineB = funcLineB + cellCols[i].z;
            totalLineTypes = totalLineTypes + 1f;
        }
        i = i + 1u;
    }





    // Radiation
    if( radiValue > 0f ){
        gottenR += (gottenR - radiValue/14f)  * 0.1f;
        gottenG += (gottenG - radiValue/45f)  * 0.1f;
        gottenB += (gottenB - radiValue/243f) * 0.1f;
    }

    // Explostion
    if( explValue > 0f ){
        gottenR = explValue/15f;
        gottenG = explValue/255f;
        gottenB = explValue/255f;
    }

    // Electricity
    if( elecValue > 0f ){
        gottenR = elecValue/15f;
        gottenG = elecValue/34f;
        gottenB = elecValue/255f;
    }




    // If there is one positive hit line
    if( totalLineTypes > 0f && rMode > 0u ){
        gottenR = funcLineR / totalLineTypes;
        gottenG = funcLineG / totalLineTypes;
        gottenB = funcLineB / totalLineTypes;
    }




    // Less than 25 vision start to make it dark

    var tovm: f32 = visionModFromTime( daytime_f);//-0.14f ); // day night cycle in here...
                ///                     phase shift so vision shrinks a little off from te sin wave
 

    // 1 to 2 to 0 ...
    if( visionValue < (13f) + ((2f-tovm)*15) ){                              /// FADE TO WAHT COLOR . THAT"S THE DETERMINATION
        visionValue = visionValue / (12f+ ((2f-tovm)*15));
        visionValue = pow(visionValue, 1 + ((2f-tovm)*3f) );
        visionValue = 1f - visionValue;

        // Move towards the sun color a bit...
        var coldif = getSunColor( daytime_f );
        coldif *= 0.12f + (tovm*0.095f); // (make it darker)

        gottenR += (((coldif.x) - gottenR) * visionValue);//gottenR - 
        gottenG += (((coldif.y) - gottenG) * visionValue);//gottenG - 
        gottenB += (((coldif.z) - gottenB) * visionValue);//gottenB - 
    }

    //Total rub off from sunlight?
    //if()

    
    // Cloud cover (OVERRIDES VISION?!)
    if( cloudAmountFromZoom > 0.5f ){

        
        var daycol = getSunColor( daytime_f+0.1f );// ahead in the future loool 
        daycol *= 0.50f + (tovm*0.2f); // (make it darker)1

        var cDens: u32 = getCloudDensity( EZX, EZY, u32(gametime) );

        
        if( cDens < u32(cloudSize) ){
            cDens = u32(cloudSize) - cDens;
            var cds: f32 = f32(cDens) / cloudSize;// <0 to  1

            // if( cloudAmountFromZoom > 4f ){
            //     //cds = pow(cds, 2.4);      // very far awaygetting far away now
            //     cds = pow(cds, 3);      // close to ground
            // }
            // if( cloudAmountFromZoom > 2f ){
            //     cds = pow(cds, 1.3);      // getting far away now
            // }
            // else{
            //     cds = pow(cds, 2);      // a little far away (1x)
            // }
            //cds = 1f - cds;

            if( cloudAmountFromZoom == 1f ){
                cds = 0;
            }
            

            gottenR += (daycol.x - gottenR) * cds;// + ( sin(gametime*0.04f) * (1f - cds)* EZ_RAND( EZX*u32(gametime) * EZY*1271u));
            gottenG += (daycol.y - gottenG) * cds;// + ( sin(gametime*0.04f) * (1f - cds)* EZ_RAND( EZX*u32(gametime) * EZY*1271u));
            gottenB += (daycol.z - gottenB) * cds;// + ( sin(gametime*0.04f) * (1f - cds)* EZ_RAND( EZX*u32(gametime) * EZY*1271u));
        }
    }

    /*
    var lightBeamR: f32 = 0f;
    var lightBeamG: f32 = 0f;
    var lightBeamB: f32 = 0f;
    // Constants to control the god ray effect
    let numRays: u32 = 50u;       // Increased number of rays
    let rayWidth: f32 = 0.005;    // Skinnier rays
    let rayIntensity: f32 = 0.8;  // Base intensity of the god rays

    // Origin of the light source (e.g., sun)
    let lightOriginX: f32 = 0.5;  // Normalized screen coordinates (0-1)
    let lightOriginY: f32 = 0.25;

    // Get the fragment coordinates in a normalized 0-1 range
    let normalizedX: f32 = fragCoord.x / 2560;
    let normalizedY: f32 = fragCoord.y / 1440;

    // Vector from the light source to the current pixel
    let dirToLightX: f32 = normalizedX - lightOriginX;
    let dirToLightY: f32 = normalizedY - lightOriginY;
    let distanceToLight: f32 = length(vec2<f32>(dirToLightX, dirToLightY));

    // Add a time-varying effect based on gametime
    let timeEffect: f32 = sin(gametime * 0.1);
    // Calculate the angle between the pixel and the light source
    let angle: f32 = atan2(dirToLightY, dirToLightX);
    // Create multiple rays by repeating the angle at regular intervals
    for (var i: u32 = 0u; i < numRays; i = i + 1u) {
        let rayAngle: f32 = f32(i) * (2.0 * 3.14159) / f32(numRays); // Spread rays in a full circle
        let angleDifference: f32 = abs(angle - rayAngle);

        // The closer to the center of the ray, the stronger the intensity
        if (angleDifference < rayWidth) {
            let falloffFactor: f32 = 1.0 - (angleDifference / rayWidth); // Decrease intensity further from ray center
            let intensityFactor: f32 = rayIntensity / (distanceToLight + 0.1) * (1.0 + timeEffect) * falloffFactor;

            lightBeamR += intensityFactor;
            lightBeamG += intensityFactor * 0.9; // Slightly warmer tint
            lightBeamB += intensityFactor * 0.8;
        }
    }

    // Clamp the light beam values to [0, 1]
    lightBeamR = clamp(lightBeamR, 0.0, 1.0);
    lightBeamG = clamp(lightBeamG, 0.0, 1.0);
    lightBeamB = clamp(lightBeamB, 0.0, 1.0); 
    gottenR += (lightBeamR - gottenR) * 0.6f;// + ( sin(gametime*0.04f) * (1f - cds)* EZ_RAND( EZX*u32(gametime) * EZY*1271u));
    gottenG += (lightBeamG - gottenG) * 0.6f;// + ( sin(gametime*0.04f) * (1f - cds)* EZ_RAND( EZX*u32(gametime) * EZY*1271u));
    gottenB += (lightBeamB - gottenB) * 0.6f;// + ( sin(gametime*0.04f) * (1f - cds)* EZ_RAND( EZX*u32(gametime) * EZY*1271u));
    */


    // SCREENSHOT
    if( snapExps > 0 ){
        gottenR = 1f;
        gottenG = 1f;
        gottenB = 1f;
    }
    // 24 vision or over = clear skies 



    



    EZ_OUTPUT.red = EZ_OUTPUT.red + gottenR;
    EZ_OUTPUT.grn = EZ_OUTPUT.grn + gottenG;
    EZ_OUTPUT.blu = EZ_OUTPUT.blu + gottenB;




    // cmprsX
    // cmprsY
    // gametime 
 

    zi = zi + 1u;
}

EZ_OUTPUT.red = EZ_OUTPUT.red / totalrgbs;
EZ_OUTPUT.grn = EZ_OUTPUT.grn / totalrgbs;
EZ_OUTPUT.blu = EZ_OUTPUT.blu / totalrgbs;

