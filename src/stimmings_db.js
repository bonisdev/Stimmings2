





// GOOD->  the good purpose of this entity
// BAD ->  the badness is the bad outcome of the entity
// TRANS1-> drilling usually?
// TRANS2-> special




var SCHEMA_INDEX = {

    sprite_size: 16,

    anim_start: 9999999,
    anim_chunk: 64,         //<-gets updated uatomatically by sprite_size

    ent_start: 9999999,
    ent_chunk: 12,

    sct_start: 9999999,
    sct_chunk: 8,

    dmg_start: 9999999,
    dmg_chunk: 6,


    bg_start: 9999999
    // atm_start: 9999999,
    // atm_chunk: 45

};




// Sprite A, B, C
//var allsprites = [ -14410515, ...];
var indTracker = 0;



// IMPORTANT CHANGE WHEN CHANGING SPRITE SIZE:

SCHEMA_INDEX.sprite_size = 16;
SCHEMA_INDEX.anim_chunk = SCHEMA_INDEX.sprite_size * SCHEMA_INDEX.sprite_size;
//  ^^^      64 * 4;//(16x16)      // 64= 8x8    


var totalbuffer = [];

SCHEMA_INDEX.anim_start = 0;

totalbuffer =  totalbuffer.concat( entireImgBuffer);//allsprites );
indTracker += entireImgBuffer.length;//allsprites.length; 

//-((((INSERT THE ENTITIES JSON HERE)))




//-((((INSERT THE ENTITY TEMPLATER HERE HERE)))

SCHEMA_INDEX.ent_chunk = EntEntries[0].length-3;    // subtract exra vals

EntEntries = flattenArrayExceptFirstTwo(EntEntries);//EntEntries.flat()

SCHEMA_INDEX.ent_start = 0 + indTracker; 

totalbuffer =  totalbuffer.concat( EntEntries );
indTracker += EntEntries.length;

// SCent profiles
var ScentProfiles = [

    // 0 empty space (air )
    [
        EZWG.createPackedU32( 1, 1, 1, 1 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 1, 1, 1, 1 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 1, 1, 1, 1 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 1, 1, 1, 1 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 160, 4, 21, 1 ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),


    ],
    // 1 Wall scent profile
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    
    // 2 Res scent block
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),

    ],
    
    
    // 3 Old Man leader scent scent block
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 255 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, DECY.STD_EXPL, 1 ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, VISON.STD_LEADER ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),

    ],
    // 4 stimmer scent propfile
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 0, 255 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, VISON.STD_STIMMER ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),

    ],
    // 5 Home
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 255, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),

    ],
    
    // 6 Blueprint
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 255, 0, 0, 0 ),   // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),

    ],

    // 7 Rando-Orb Class A Orb 0
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 15 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],

    // 8 Rando-Orb Class A Orb 1
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 15, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    
    // 9 Rando-Orb Class A Orb 2
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 15, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    
    // 10 Rando-Orb Class A Orb 3
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  15, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 11 Rando-Orb Class A Orb 4
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 15,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 12 Rando-Orb Class A Orb 5
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 15, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 13 Rando-Orb Class A Orb 6
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 15, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 14 Rando-Orb Class A Orb 7
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 15, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 15 Rando-Orb Class A Orb 8
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 15 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 16 Rando-Orb Class A Orb 9
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 15, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 17 Rando-Orb Class A Orb 10
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 15, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 18 Rando-Orb Class A Orb 11
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  15, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 19 Rando-Orb Class A Orb 12
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 15,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 20 Rando-Orb Class A Orb 13
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 15, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 21 Rando-Orb Class A Orb 14
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 15, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 22 Rando-Orb Class A Orb 15
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 15, DECY.STD_VIS ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 15, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),
    ],
    // 23 Good Gaia visin profile (WILD?) Vision bug scent profile
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, DECY.STD_EXPL, 1 ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, VISON.STD_LEADER ),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),

    ],
    
    // 24 Mini boss enemy preofile
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, DECY.STD_EXPL, 1 ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 13),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 15 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),

    ],
    // 25 Minion 1
    [
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 255, 255, 255, 255 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 255, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, DECY.STD_EXPL, 1 ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 13),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 12 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),

    ],
    // 26 See through fence
    [
        EZWG.createPackedU32( 1, 1, 1, 1 ),     // Decay of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 1, 1, 1, 1 ),     // Decay of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 1, 1, 1, 1 ),     // Decay of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 1, 1, 1, 1 ),     // Decay of Idk..., PATTERN, WILD, STIMMER

        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of BUILD, DROPOFF, RES, LEADER
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of PHEREMONES, DECAY, MINERALS, MOISTURE
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of HOPE, WISDOM, INTELLECT, TOIL
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of Idk..., PATTERN, WILD, STIMMER
        
        EZWG.createPackedU32( 1, 12, 2, 1 ),  // Decay of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 1, 1, 1 ),     // Decay of idk..., RADIO, IONIZATION, PRESSURE
        
        EZWG.createPackedU32( 0, 0, 0, 0),     // EMISSION of ELECTRICITY, HEAT, EXPL, VISION
        EZWG.createPackedU32( 0, 0, 0, 0 ),     // EMISSION of idk..., RADIO, IONIZATION, PRESSURE

        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces
        // EZWG.createPackedU32_4( 1, 1, 1, 1,  1, 1, 1, 1 ),   // Decay of Forces  (always 1 no matter what)
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),   // EMISSION of Forces 

        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 12 ),      // DESIRED func juice conditions
        EZWG.createPackedU32_4( 0, 0, 0, 0,  0, 0, 0, 0 ),

    ],
];





// IMPLEMENT THE SEED FOR UNIQUE ORBS
// Now jumble the functive jooses

EZWG.SHA1.seed(randomSeedToUse + 'functjooses')
function r3test(indd){
    if(EZWG.SHA1.random() < 0.3){
        return 1 + Math.floor(EZWG.SHA1.random() * 14);
    }
    else{
        return 0;
    }

}

// Go ahead and add in the random atactors
for(let jk = 0;jk < 16;jk++){
    ScentProfiles[ 7+jk ][ ScentProfiles[7+jk].length-1 ] = 
        EZWG.createPackedU32_4(
            r3test(jk), r3test(jk), r3test(jk), r3test(jk),
            r3test(jk), r3test(jk), r3test(jk), r3test(jk)
        );
    
    ScentProfiles[ 7+jk ][ ScentProfiles[7+jk].length-2 ] = 
        EZWG.createPackedU32_4( 
            r3test(jk), r3test(jk), r3test(jk), r3test(jk),
            r3test(jk), r3test(jk), r3test(jk), r3test(jk)
        );
}






SCHEMA_INDEX.sct_chunk = ScentProfiles[0].length;

ScentProfiles = ScentProfiles.flat()

SCHEMA_INDEX.sct_start = 0 + indTracker;

totalbuffer =  totalbuffer.concat( ScentProfiles );
indTracker += ScentProfiles.length;

var DmgProfiles = [
    [
        EZWG.createPackedU32( 10, 10, 10, 10 ),             // MAX electricity, HEAT, EXPL, VISION
        EZWG.createPackedU32( 10, 10, 10, 10 ),             // MAX idk,   Radio, IOnization, Pressure

    ]
]


SCHEMA_INDEX.dmg_chunk = DmgProfiles[0].length;

DmgProfiles = DmgProfiles.flat()

SCHEMA_INDEX.dmg_start = 0 + indTracker;

totalbuffer =  totalbuffer.concat( DmgProfiles );
indTracker += DmgProfiles.length;






SCHEMA_INDEX.bg_start = 0 + indTracker;

totalbuffer =  totalbuffer.concat( entireBgBuffer); 
indTracker += entireBgBuffer.length; 



console.log("SCHEMA_INDEX--_____")
console.log(SCHEMA_INDEX)

var AtmProfiles = [

    // 0 no nothing air
    [ 
        EZWG.createPackedU32( 0, 0, 0, 1 ), // R, G, B, decay rate

        EZWG.createPackedU32_16( 0, 0 )      // Chance of spawning
    ]

];








