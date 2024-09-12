

// Quickyl define the constants
var PHYS = {

    PHYSICS_NULL:           1 << 0,
    PHYSICS_EMPTY:          1 << 1,
    PHYSICS_ALLEGIANCED:    1 << 2,         // sentient and usually owned by a team (non- zero team )
    PHYSICS_LEADER:         1 << 3,
    PHYSICS_RES:            1 << 4,
    PHYSICS_WALL:         1 << 5,
    PHYSICS_HOMEBASE:       1 << 6,
    PHYSICS_BLUEPRINT:      1 << 7,
    PHYSICS_WANDERING_WORKER:1 << 8,
    PHYSICS_RES_WORKER:     1 << 9,
    PHYSICS_HOM_WORKER:     1 << 10,
    PHYSICS_GOOD:           1 << 11,
    PHYSICS_EVIL:           1 << 12,
    PHYSICS_HOSTILE:        1 << 13,
    PHYSICS_GAIA_PEACE:     1 << 12,
    PHYSICS_WARRIOR:        1 << 13,
    PHYSICS_GAIA_PRIEST:    1 << 14,       
};

var VISON = {
    STD_STIMMER: 24,      // How much normal dim unit does
    STD_LEADER: 45,      // How much 
};

var DECY = {
    STD_VIS: 10,
    STD_EXPL: 15,
};

var DESIR = {
    DESIRE_NOTHING:         0,          // Nothing
    DESIRE_WANDER:          1,          // Wander
    DESIRE_RES:             2,          // res
    DESIRE_HOME:            3,          // homebound 
    DESIRE_CTRL:            4,          // controlled 
    DESIRE_AUTO:            5,          // controlled by last input
    DESIRE_FUNCER_ATTACK:   6,          // desire to attack stimmings
    DESIRE_FUNCER_WATER:    7,          // desire to get water
    DESIRE_DUNCER_DECAY:    8,          // desire to get decay

    DESIRE_BPER:            9,          // blueprint creator
}

// Clear indications of what comes next

// NOTE ***** -> IF 
var CL = {
    ANIMATION_VFAST:          3,
    ANIMATION_FAST:          9,
    ANIMATION_MED:          29,
    //  IF 10000000  most signifcant bit is flipped 
    // DONT MAKE THESE NUMBERS LARGER THAN 127 ^^^

    SCT_OLD_MAN:            0,
    SCT_STD_WALL:           0,

    DMG_OLD_MAN:            0,
 

    FREQ_0FAST:             1,
    FREQ_VFAST:             3,
    FREQ_FAST:              12,
    FREQ_MED:               28,
    FREQ_ORB:               7,//32,
    FREQ_SLOW:              40,
    FREQ_VSLOW:             57,

    // Resource amount for a standard tree idk
    RES_STD_AMT: 14,

    
    LDR_PWR_STD: 1, // leader power standard
    LDR_MAXIMUM_STD: 14*7, // leader max value to transition standard

 
    


    
};

// Zero entity....
var EntEntries = [
[
    "Nothing",                                              //Names
    "This is nothing",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_EMPTY,                                           // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 0, CL.ANIMATION_MED ), 0 ), //
    EZWG.createPackedU32( 0, 1, CL.FREQ_MED, DESIR.DESIRE_WANDER ),// Idk, steppable=0(1=yes), MoveFreq, Desire

    EZWG.createPackedU32_16( 0, 0 ),                    // Damage Profile ID (max of 65535), Scent Profile ID (max of 65535)

    0,                    // Goodness from profile  | Physics flags
    0,                    // Badness from profile,   | Physics flags
    0,                    // Trans1 from profile   | Physics flags
    0,                    // Trans2 from profile,   | Physics flags
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              	//  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            		// ??? idk ??, drop value every move
],

// (1) Old man
[
    "Old Man",                                                      // Names
    "a very old man",                                               // Desc
    ["", "", "", ""],                                               // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                       // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 1, CL.ANIMATION_MED ), 16 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_MED, DESIR.DESIRE_WANDER ), // Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 3 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (2) Wandering stim 2
[
    "Stimmers",                                              //Names
    "Wandering stim",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED | PHYS.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 683 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, DESIR.DESIRE_RES ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    PHYS.PHYSICS_RES,       // Goodness from profile
    0,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 0 ),   // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 1, 1 ),       // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 6 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (3) Res Debug Std.
[
    "Resource",                                              //Names
    "Res debug",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_RES,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(5, CL.ANIMATION_MED), 668 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_MED, DESIR.DESIRE_NOTHING ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 2 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                          // Goodness from profile
    PHYS.PHYSICS_RES_WORKER | PHYS.PHYSICS_LEADER,  // Badness from profile, 
    0,                                          // Trans1 from profile 
    0,                                          // Trans2 from profile, 
    
    EZWG.createPackedU32_16( CL.RES_STD_AMT, 65535 ),   // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 1, 1 ),  // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (4) Wall....
[
    "Wall",                                              //Names
    "Wall blocker",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_WALL | PHYS.PHYSICS_BREAKABLE,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_MED), 98 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_MED, DESIR.DESIRE_NOTHING ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 1 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                    // Goodness from profile
    PHYS.PHYSICS_LEADER,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 42, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],

// (5) Home base
[
    "Home",                                              //Names
    "Home bawse",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED | PHYS.PHYSICS_HOMEBASE,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(4, CL.ANIMATION_MED), 20 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_0FAST, DESIR.DESIRE_NOTHING ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 5 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    PHYS.PHYSICS_HOM_WORKER,// Goodness from profile
    0,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 11 ),  // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 1),       // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 2 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 1 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (6) Stim homebound
[
    "Stimmer Home",                                              //Names
    "Stim homer",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED | PHYS.PHYSICS_HOM_WORKER,                                     // Physics flags of the entity 
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 256 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, DESIR.DESIRE_HOME ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    PHYS.PHYSICS_HOMEBASE,  // Goodness from profile
    0,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 0 ),               // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 1 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 2 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (7) Leader
[
    "Leader",                                              //Names
    "Teh leader",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED | PHYS.PHYSICS_LEADER,                                     // Physics flags of the entity 
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(9, CL.ANIMATION_VFAST), 342 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_0FAST, DESIR.DESIRE_CTRL ),        // Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 3 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    PHYS.PHYSICS_RES,       // Goodness from profile
    0,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, CL.LDR_MAXIMUM_STD ),  // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( CL.LDR_PWR_STD, 1 ),       // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 7 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 1 ),     // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                            // 0 = self transofmr, 1 = spawn one ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (8) Auto Runner
[
    "Auto Miner",                                              //Names
    "Runner auto miner in one direction",                   //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED | PHYS.PHYSICS_LEADER,                                     // Physics flags of the entity 
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 747 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_VFAST, DESIR.DESIRE_AUTO ),        // Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 3 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    PHYS.PHYSICS_RES,       // Goodness from profile
    0,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, CL.LDR_MAXIMUM_STD ),  // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( CL.LDR_PWR_STD, 1 ),       // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 8 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 1 ),     // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                            // 0 = self transofmr, 1 = spawn one ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],

// (9) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 0",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 1, CL.ANIMATION_MED ), 406 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_FUNCER_ATTACK ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 7 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (10) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 1",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 1, CL.ANIMATION_MED ), 407 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_FUNCER_WATER ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 8 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (11) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 2",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 1, CL.ANIMATION_MED ), 408 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 9 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],

// (12) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 3 q block",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 3, CL.ANIMATION_MED ), 797 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 10 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],

// (13) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 4 note block",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 3, CL.ANIMATION_MED ), 800 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 11 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (14) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 5 weird block",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 13, CL.ANIMATION_MED ), 452 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 12 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (15) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 6 orang block",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 2, CL.ANIMATION_MED ), 718 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 13 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (16) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 7 sparkle block",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 4, CL.ANIMATION_MED ), 609 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 14 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

], 


// (17) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 8 nightmareworkm",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 4, CL.ANIMATION_MED ), 434 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 15 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

], 
// (18) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 9 bolt",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 4, CL.ANIMATION_MED ), 142 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 16 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

], 
// (19) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 10 bolt blue",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 4, CL.ANIMATION_MED ), 378 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 17 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

], 
// (20) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 11 dark rock",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 3, CL.ANIMATION_MED ), 516 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 18 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],  
// (21) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 12 dark rock",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 6, CL.ANIMATION_MED ), 577 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 19 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],  
// (22) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 13 chaos worm body",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 2, CL.ANIMATION_MED ), 714 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 20 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

], 
// (23) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 14 live worm",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 5, CL.ANIMATION_MED ), 720 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 21 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],  
// (24) Orb Type 
[
    "Orb Type",                                              //Names
    "orb type 15 live worm",                                           //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 3, CL.ANIMATION_MED ), 761 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_ORB, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 22 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

], 
// (25) MiniBoss
[
    "MiniBoss",                                              //Names
    "Mini boss very tough",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED | PHYS.PHYSICS_HOM_WORKER,                                     // Physics flags of the entity 
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(4, CL.ANIMATION_VFAST), 402 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_VSLOW, DESIR.DESIRE_HOME ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 24 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    PHYS.PHYSICS_HOMEBASE,  // Goodness from profile
    0,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 0 ),               // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 1 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 2 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 29 ),            // ??? idk ??, drop value every move

],
// (26) Vision bug
[
    "Vision Bug",                                              //Names
    "vision bug provides light ",                                      //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8( 2, CL.ANIMATION_MED ), 849 ), // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_SLOW, DESIR.DESIRE_WANDER ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 23 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                                                  // Goodness from profile
    0,                                                  // Badness from profile, 
    0,                                                  // Trans1 from profile 
    0,                                                  // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (27) Minion 1
[
    "Minion 1",                                              //Names
    "Goblin type minion",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED | PHYS.PHYSICS_HOM_WORKER,                                     // Physics flags of the entity 
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 230 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_SLOW, DESIR.DESIRE_DUNCER_DECAY ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 25 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    PHYS.PHYSICS_HOMEBASE,  // Goodness from profile
    0,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 0 ),               // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 1 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 2 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
// (28) Fence
[
    "Fence",                                              //Names
    "Fence that lets scents go through",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_WALL ,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(5, CL.ANIMATION_MED), 186 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_MED, DESIR.DESIRE_NOTHING ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 26 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                    // Goodness from profile
    PHYS.PHYSICS_LEADER,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 42, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),                    // ??? idk ??, drop value every move

],
// (29) Long Grass
[
    "Long Grass",                                              //Names
    "Steppable long gtass",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_WALL ,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(4, CL.ANIMATION_FAST), 1117 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 1, CL.FREQ_MED, DESIR.DESIRE_NOTHING ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 26 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                    // Goodness from profile
    0,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),                    // ??? idk ??, drop value every move

],
// (30) Worm Head
[
    "Worm Head",                                              //Names
    "Head of a worm",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_ALLEGIANCED | PHYS.PHYSICS_HOM_WORKER,                                     // Physics flags of the entity 
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 716 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_VSLOW, DESIR.DESIRE_HOME ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 24 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    PHYS.PHYSICS_HOMEBASE,  // Goodness from profile
    0,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 65535, 0 ),               // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 1 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 2 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 31 ),            // ??? idk ??, drop value every move

],
// (31) Body of worm
[
    "Worm Body",                                              //Names
    "Body of worm ",                                              //Desc
    ["", "", "", ""],                                       // Sounds
    PHYS.PHYSICS_WALL | PHYS.PHYSICS_BREAKABLE,                                     // Physics flags of the entity
    EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_MED), 714 ),  // animSize, animFreq, animStart (16 bytes)
    EZWG.createPackedU32( 0, 0, CL.FREQ_MED, DESIR.DESIRE_NOTHING ),// Idk, steppable=0(1=yes), MoveFreq, Desire
    
    EZWG.createPackedU32_16( 0, 1 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

    0,                    // Goodness from profile
    PHYS.PHYSICS_LEADER,                    // Badness from profile, 
    0,                    // Trans1 from profile 
    0,                    // Trans2 from profile, 
    
    EZWG.createPackedU32_16( 42, 65535 ),            // Badness max, Goodness max
    EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
    
    EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

    EZWG.createPackedU32_16( 1, 0 ),                    // Badness ambient, Goodness ambient
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

    EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
    EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

    EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                        // 0 = self transofmr, 1 = in desired scent direction, 2,3,4,5 in desired scent direction ( ADDS one to trans 2, trans 1, bad, good )

    EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
    EZWG.createPackedU32_16( 0, 0 ),            // ??? idk ??, drop value every move

],
];//DESIRE_FUNCER_ATTACK