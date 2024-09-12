var gametime: f32 = EZ_USER_INPUT[63];

var xPan: u32 = u32(EZ_USER_INPUT[7]);
var yPan: u32 = u32(EZ_USER_INPUT[8]);

var cZoom: f32 = EZ_USER_INPUT[9]; 
// Wrap around for ZOOM in fact...
var totalrgbs: f32 = cZoom * cZoom;
var cZumU: u32 = u32( cZoom );

// Clicked too many times wrap around and do zoom instead
if(cZoom > 4f){
    cZoom = 0.5f;
    totalrgbs = 1f;
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

// EZ_COMP_X = EZ_COMP_X % (sprt_size/cZumU);
// EZ_COMP_Y = EZ_COMP_Y % (sprt_size/cZumU);

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

    // 0, 1, 2, 3       SECOND half is coutner 
    let SLOT_0 = EZ_STATE_IN[ EZ_CELL_IND + 0u * EZ_TOTAL_CELLS]; 
    let entityType = SLOT_0 & 0x0000FFFF;
    var teamNumber: u32 = (SLOT_0 >> 16) & 0x0000FFFF;
    //teamNumber = teamNumber + EZX * 12u + EZY * 27u;
    var counter: u32 = u32(gametime) + EZX * 1252u + EZY * 1787u;

    var ENT_LOOKED = EZ_STORAGE[ 1u + ent_start + (entityType * ent_chunk) ];

    var animStart: u32 = ( ENT_LOOKED >> 0 ) & 0x0000FFFF;
    var animFreq: u32 =  ( ENT_LOOKED >> 16 ) & 0x0000FFFF;
    var animSize: u32 = ( animFreq >> 8 ) & 0x000000FF;
    animFreq = animFreq & 0x000000FF;
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
    


    var startOcells: u32 = 4u;
    //      SCENTS
    var scntSlot0: u32 = EZ_STATE_IN[ EZ_CELL_IND + 2u*EZ_TOTAL_CELLS];
    var scntSlot1: u32 = EZ_STATE_IN[ EZ_CELL_IND + 3u*EZ_TOTAL_CELLS];

    var nScents: u32 = 16u;

    var gottenR: f32 = 0;
    var gottenG: f32 = 0;
    var gottenB: f32 = 0;
    var tempi: u32 = 0;
    var memval: u32 = 0;
    var scsntsCountred: f32 = 0;    // Total scent weight


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
        if( tempi > 1u ){         // Colour fades rapidly after this distance anyways 
                                    //so dont include less signficant scents than this
            var intensirt: f32 = min( (254f / 255f), f32(tempi) / 255f ); 
            intensirt = max( 0, intensirt - (1 - intensirt) * 23f );
            intensirt = pow( intensirt, 2 ); 
            scsntsCountred = scsntsCountred + intensirt*intensirt*1.584;  // add a times 2 to make even dimmer 

            gottenR = gottenR + cellCols[i].x*intensirt;  //EZ_RAND( 1491 + i * 7237 + i*i*33 ) * intensirt;
            gottenG = gottenG + cellCols[i].y*intensirt;  //EZ_RAND( 1491 + i * 8137 + i*i*17 ) * intensirt;
            gottenB = gottenB + cellCols[i].z*intensirt;  //EZ_RAND( 1491 + i * 5887 + i*i*11 ) * intensirt;
        }
        //scsntsCountred = scsntsCountred + 1;

        i = i + 1u;
    }



   

    //var homScent: f32 = f32( scntSlot0 & 0x000000FF );
    //var resScent: f32 = f32( (scntSlot0 >> 8) & 0x000000FF ); 
    //homScent = max(0, 1 - (1-homScent/255f)*63 );
    //resScent = max(0, 1 - (1-resScent/255f)*63 );


    var thisPixBg: u32 = 0;
    if (entityType > 0u) {

        animFrame = animStart + ((counter/animFreq) % animSize);

        var colorVec = EZ_STORAGE[(anim_chunk * (animFrame)) + (cmprsX) + (cmprsY)*sprt_size];
        var alpha: u32 = (colorVec >> 24) & 0xFF;

        if( alpha > 0 ){    // TODO change to 253 and under, 254 means it needs it team colours to com through 
            gottenR = f32(colorVec & 0xFF) / 255.0;
            gottenG = f32((colorVec >> 8) & 0xFF) / 255.0;
            gottenB = f32((colorVec >> 16) & 0xFF) / 255.0;
        }
        else{
            thisPixBg = 1;
        }
        
    }

    // A certified back ground pixel or no entity at all her
    if( thisPixBg == 1u || entityType < 1u ){
         
        var tBgX: u32 = ( EZX*16 + cmprsX + (xPan) );
        tBgX = tBgX + 2048*120;
        tBgX = tBgX % 2048;

        var tBgY: u32 = (EZY*16 + cmprsY + (yPan ));
        tBgY = tBgY + 2048*120;
        tBgY = tBgY % 2048;

        // GET THE BG VAL
        var bgPix = EZ_STORAGE[bg_start + tBgY + tBgX*2048];


        // If more than one scent found here (NOT!),
        //      AND   Depending on render mode maybe dont ebeven disapyl the agoten
        if( !(scsntsCountred > 0f) || rMode == 0u ){        
            gottenR = f32(bgPix & 0xFF) / 255.0;//0f;
            gottenG = f32((bgPix >> 8) & 0xFF) / 255.0;
            gottenB = f32((bgPix >> 16) & 0xFF) / 255.0;
        }
        else {
            gottenR = gottenR / scsntsCountred;
            gottenG = gottenG / scsntsCountred;
            gottenB = gottenB / scsntsCountred;
        }
    }

    // If cmd tag is not nothin - then highlight in here:
    if( cmdIdTag > 0u ){
        // If it's the border thing
        if( cmprsX == 0 || cmprsY == 0 || cmprsX == sprt_size-1 || cmprsY == sprt_size-1 ){
            gottenR = 1f;
            gottenG = 1f;
            gottenB = 1f;
        }
    }




    // SECOND 2 utility scents (vision, expl, ......)
    // VISUAL MODIFIERS ON TOP OF EVERYTHING AFTER THE BACKGROUDNA DNT EHS SPRITES
          
    startOcells = 8u;//startOcells + 6u; // move past the 4 path finding secnts
   

    // GENERATE THE DIFFERETN TYPES OF COLOUR for each scent
    //tempi = EZ_RAND( tempi * 1237 + memval * 3171 );
    //tempi = ( (memval >> ( (i%4u)*8u) ) & 0x000000FF ); 
                                //so dont include less signficant scents than this



    var visionValue: f32 = 0f;
    var explValue: f32 = 0f;

    // Modifier 0: Sinusoidal Wave on Red Channel
    // Creates a wave effect based on the pixel's x position and time.
    memval = EZ_STATE_IN[EZ_CELL_IND + (startOcells + 0)*EZ_TOTAL_CELLS]; 
    tempi = ((memval >> ((0%4u)*8u)) & 0x000000FF);
    visionValue = f32( tempi );
    //if (tempi > 0u) {
        // gottenR += sin(f32(gametime) * 0.1 + f32(cmprsX) * 0.1) * (f32(tempi) / 255.0);
    //}
 
    tempi = ((memval >> ((1%4u)*8u)) & 0x000000FF);
    explValue = f32( tempi );
    if (tempi > 0u) {
        // gottenG += cos(f32(gametime) * 0.05) * (f32(tempi) / 255.0);
    }
 
    let noise = fract(sin(dot(vec2<f32>(f32(cmprsX), f32(cmprsY)), vec2<f32>(12.9898, 78.233))) * 43758.5453);
    tempi = ((memval >> ((2%4u)*8u)) & 0x000000FF);
    if (tempi > 0u) {
        // gottenB += noise * (f32(tempi) / 255.0);
    } 

    let dist_from_center = length(vec2<f32>(f32(cmprsX) - 8.0, f32(cmprsY) - 8.0)) / 8.0;
    tempi = ((memval >> ((3%4u)*8u)) & 0x000000FF);
    if (tempi > 0u) {
        // gottenR += (1.0 - dist_from_center) * (f32(tempi) / 255.0);
    }
 
    memval = EZ_STATE_IN[EZ_CELL_IND + (startOcells + 1)*EZ_TOTAL_CELLS];
    tempi = ((memval >> ((0%4u)*8u)) & 0x000000FF);
    if (tempi > 0u) {
        // gottenG += step(f32(gametime % 16f), f32(cmprsY)) * (f32(tempi) / 255.0);
    }
 
    tempi = ((memval >> ((1%4u)*8u)) & 0x000000FF);
    if (tempi > 0u) {
        // gottenB += sin(dist_from_center * 10.0 - f32(gametime) * 0.2) * (f32(tempi) / 255.0);
    }
 
    tempi = ((memval >> ((2%4u)*8u)) & 0x000000FF);
    if (tempi > 0u) {
        // gottenR += sin(f32(gametime) * 0.02) * (f32(tempi) / 255.0);
        // gottenG += cos(f32(gametime) * 0.02) * (f32(tempi) / 255.0);
    }
 
    let strobe = step(0.5, fract(f32(gametime) * 0.1));
    tempi = ((memval >> ((3%4u)*8u)) & 0x000000FF);
    if (tempi > 0u) {
        // gottenR += strobe * (f32(tempi) / 255.0);
        // gottenG += strobe * (f32(tempi) / 255.0);
        // gottenB += strobe * (f32(tempi) / 255.0);
    }

    // Clamp the final RGB values to ensure they are within the valid range [0.0, 1.0]
    // gottenR = clamp(gottenR, 0.0, 1.0);
    // gottenG = clamp(gottenG, 0.0, 1.0);
    // gottenB = clamp(gottenB, 0.0, 1.0);


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

    // If there is one positive hit line
    if( totalLineTypes > 0f && rMode > 0u ){
        gottenR = funcLineR / totalLineTypes;
        gottenG = funcLineG / totalLineTypes;
        gottenB = funcLineB / totalLineTypes;
    }


    // Less than 25 vision start to make it dark
    if( visionValue < 29f ){
        visionValue = visionValue /  28f;
        visionValue = (visionValue*visionValue);
        gottenR = (gottenR * visionValue);//gottenR - 
        gottenG = (gottenG * visionValue);//gottenG - 
        gottenB = (gottenB * visionValue);//gottenB - 
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

