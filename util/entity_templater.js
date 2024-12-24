
console.log('DEFINING ENTITY TEMPALTES');
console.log('building out all the indexing as well::::')

//var ENTITY_LIST_NEXT_IND = EntEntries.length;
//var ENTITY_LIST_NEXT_IND = ScentProfiles.length;

var ENT_FOLDERS = [
    // {lbl: 'Natural Resources', vals: []},
    // {lbl: 'Steppable', vals: []},
    // {lbl: 'Alleganced', vals: []}
];

var GLOBAL_VAR1 = null;
var testArray = [
    GLOBAL_VAR1 = {name: 'tester'}
]

function NU_ORB(  animStart, animLength, amtOfRes, ind ){

}




function NU_ENT( variableString, entireDef){
    STAD[''+variableString] = FullEntEntries.length;
    FullEntEntries.push(
        entireDef
    );
} 
  
 
function NU_RES_ENT( entNameVariable, miobj, amtOfRes, frameTime, animationMode ){
    NU_ENT( ""+entNameVariable, [
        ""+miobj.n,                                              //Names
        ""+miobj.d,                                              //Desc
        ["sfx_phit_ting", "", "", ""],                                       // Sounds
        ""+miobj.animpckge,                                                 // Animation package
        PHYS.PHYSICS_RES,                                     // Physics flags of the entity
        EZWG.createPackedU32_16( EZWG.createPackedU16_8(STAD[""+miobj.animpckge][2], frameTime), STAD[""+miobj.animpckge][1] ),  // animSize, animFreq, animStart (16 bytes)
        EZWG.createPackedU32( 0, ( animationMode.sync?(0^CL.DESYNC_ANIM_BIT):(0) ) + (animationMode.wind?4:0), CL.FREQ_VFAST, DESIR.DESIRE_NOTHING ),// Flippaleprofile, [0x4bit for wind 0x2 bit (0=desynced, 1=synced animations) steppable=0(1=yes)], MoveFreq, Desire
        
        EZWG.createPackedU32_16( animationMode.waterfloat?(STAD.dmg_wall_water_proof):0, STAD.scnt_res_block ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),
    
        PHYS.PHYSICS_MINER | PHYS.PHYSICS_HOMEBASE,                    // Goodness from profile
        PHYS.PHYSICS_RES_WORKER | PHYS.PHYSICS_MINER | PHYS.PHYSICS_HOMEBASE,  // Badness from profile, 
        0,                    // Trans1 from profile 
        0,                    // Trans2 from profile, 
        
        EZWG.createPackedU32_16( amtOfRes, CL.STD_VFX_TRGER ),            // Badness max, Goodness max
        EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
        
        EZWG.createPackedU32_16( 1, 1 ),                    // Badness power, Goodness power (badness amt hurts YOU when spawn of result t ype 4 occured)
        EZWG.createPackedU32_16( 1, 1 ),                    // Trans 2 power, Trans 1 power
    
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient
    
        EZWG.createPackedU32_16( animationMode.replacerEnt?animationMode.replacerEnt:0,         //<-----//Badness result
            animationMode.visualEntOveride?animationMode.visualEntOveride:STAD.ent_dust_chips),//STAD.ent_smw_coin ),                    //   Goodness result
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result
    
        EZWG.createPackedU32( 0, 0, 0, 1 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                            // 0 = self transofmr, 1 = random direction spawn, 2=random direction spawn NO TEAM,     3 = inherit velocity..., 4=damage yurself on spawn from OWN power
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
        EZWG.createPackedU32_16( Math.floor(Math.ceil(amtOfRes/CL.PROD_STIM_HOME)*2), 0 ),            // BP build cost, drop value every move
    
    ]);
}

function NU_DECAY_ENT( entNameVariable, miobj, amtOfRes, frameTime, animationMode ){
    NU_ENT( ""+entNameVariable, [
        ""+miobj.n,                                                 //Names
        ""+miobj.d,                                                 //Desc
        ["sfx_pang", "", "", ""],                                   // Sounds
        ""+miobj.animpckge,                                         // Animation package
        PHYS.PHYSICS_DECAY,                                         // Physics flags of the entity
        EZWG.createPackedU32_16( EZWG.createPackedU16_8(STAD[""+miobj.animpckge][2], frameTime), STAD[""+miobj.animpckge][1] ),  // animSize, animFreq, animStart (16 bytes)
        EZWG.createPackedU32( 0, ( animationMode.sync?(0^CL.DESYNC_ANIM_BIT):(0) ) + ( animationMode.wind?4:0 ), CL.FREQ_VFAST, DESIR.DESIRE_NOTHING ),// Flippaleprofile, [0x4bit for wind 0x2 bit (0=desynced, 1=synced animations) steppable=0(1=yes)], MoveFreq, Desire
        
        EZWG.createPackedU32_16( 0, STAD.scnt_decay_block ),        //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),
    
        0,                 // Goodness from profile
        PHYS.PHYSICS_DETRIVORE,  // Badness from profile, 
        0,                    // Trans1 from profile 
        0,                    // Trans2 from profile, 
        
        EZWG.createPackedU32_16( amtOfRes, CL.STD_VFX_TRGER ),      // Badness max, Goodness max
        EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
        
        EZWG.createPackedU32_16( 1, 1 ),                    // Badness power, Goodness power (badness amt hurts YOU when spawn of result t ype 4 occured)
        EZWG.createPackedU32_16( 1, 1 ),                    // Trans 2 power, Trans 1 power
    
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient
    
        EZWG.createPackedU32_16( animationMode.replacerEnt?animationMode.replacerEnt:0,         //<-----//Badness result
            animationMode.visualEntOveride?animationMode.visualEntOveride:STAD.ent_dust_chips),//STAD.ent_smw_coin ),                    //   Goodness result
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result
    
        EZWG.createPackedU32( 0, 0, 0, 1 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                            // 0 = self transofmr, 1 = random direction spawn, 2=random direction spawn NO TEAM,     3 = inherit velocity..., 4=damage yurself on spawn from OWN power
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
        EZWG.createPackedU32_16( CL.BP_STD_BUILD_COST, 0 ),            // BP build cost, drop value every move
    
    ]);
}

function NU_JOLT_RECEIVER( entNameVariable, miobj, destinationEntity, frameTime, animationMode ){ 
    NU_ENT( ""+entNameVariable, [
        ""+miobj.n,                                              //Names
        ""+miobj.d,                                              //Desc
        ["sfx_pang", "", "", ""],                                       // Sounds
        ""+miobj.animpckge,                                                 // Animation package
        PHYSPROFS.STD_WALL | (animationMode.isSuggestive?(PHYS.PHYSICS_SUGGESTIVE|PHYS.PHYSICS_ALLEGIANCED):0),                                     // Physics flags of the entity
        EZWG.createPackedU32_16( EZWG.createPackedU16_8(STAD[""+miobj.animpckge][2], frameTime), STAD[""+miobj.animpckge][1] ),  // animSize, animFreq, animStart (16 bytes)
        EZWG.createPackedU32( 0, ( animationMode.sync?(0^CL.DESYNC_ANIM_BIT):(0) ) + (animationMode.wind?4:0), CL.FREQ_0FAST, DESIR.DESIRE_NOTHING ),// Flippaleprofile, [0x4bit for wind 0x2 bit (0=desynced, 1=synced animations) steppable=0(1=yes)], MoveFreq, Desire
        
        EZWG.createPackedU32_16( 0, STAD.scnt_std_wall ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),
    
        0,                    // Goodness from profile
        PHYSPROFS.STD_WALL_placement_badnessfrom,        // Badness from profile, 
        PHYS.PHYSICS_JOLT,                    // Trans1 from profile 
        0,                    // Trans2 from profile, 
        
        EZWG.createPackedU32_16( CL.STD_WALL_HEALTH, 65535 ),            // Badness max, Goodness max
        EZWG.createPackedU32_16( 65535, 0 ),            // Trans 2 max, Trans 1 max
        
        EZWG.createPackedU32_16( 1, 1 ),                    // Badness power, Goodness power (badness amt hurts YOU when spawn of result t ype 4 occured)
        EZWG.createPackedU32_16( 0, 1 ),                    // Trans 2 power, Trans 1 power
    
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient
    
        EZWG.createPackedU32_16( 0, STAD.ent_poof_visual ),   // Badness result, Goodness result
        EZWG.createPackedU32_16( 0, destinationEntity ),                    // Trans 2 result, Trans 1 result
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                            // 0 = self transofmr, 1 = random direction spawn, 2=random direction spawn NO TEAM,     3 = inherit velocity..., 4=damage yurself on spawn from OWN power
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
        EZWG.createPackedU32_16( CL.BP_STD_BUILD_COST, 0 ),            // BP build cost, drop value every move
    
    ]);

}

  
 
function NU_HOSTILE_GAIA( entNameVariable, miobj, frameTime, deathOset, healthh, dmgPower ){  
    NU_ENT( ""+entNameVariable, [
        ""+miobj.n,                                              //Names
        ""+miobj.d,                                              //Desc
        ["", ""+deathOset, "", ""],                                       // Sounds
        ""+miobj.animpckge,                                                 // Animation package
        PHYS.PHYSICS_GAIA_HOSTILE,                                     // Physics flags of the entity
        EZWG.createPackedU32_16( EZWG.createPackedU16_8(STAD[""+miobj.animpckge][2], frameTime), STAD[""+miobj.animpckge][1] ),  // animSize, animFreq, animStart (16 bytes)
        EZWG.createPackedU32( CL.LEFTNRIT_DIR_ANIMS, 0, CL.FREQ_FAST, DESIR.DESIRE_CIVILIZATION ),// Flippaleprofile, [0x4bit for wind 0x2 bit (0=desynced, 1=synced animations) steppable=0(1=yes)], MoveFreq, Desire
        
        EZWG.createPackedU32_16( 0, STAD.scnt_hostile_gaia ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),
    
       
        0,  // Goodness from profile
        PHYSPROFS.TYPICAL_WARIR_VICTIMS,   // Badness from profile, 
        0,                    // Trans1 from profile 
        0,                    // Trans2 from profile, 
        
        EZWG.createPackedU32_16( healthh, 65535 ),               // Badness max, Goodness max
        EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
        
        EZWG.createPackedU32_16( dmgPower, 1 ),                    // Badness power, Goodness power (badness amt hurts YOU when spawn of result t ype 4 occured)
        EZWG.createPackedU32_16( 1, 1 ),                    // Trans 2 power, Trans 1 power
    
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient
    
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                            // 0 = self transofmr, 1 = random direction spawn, 2=random direction spawn NO TEAM,     3 = inherit velocity..., 4=damage yurself on spawn from OWN power
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
        EZWG.createPackedU32_16( CL.BP_AVE_HG_BUILD_COST, 0 ),            // BP build cost, drop value every move
    
    ]);

}


function NU_WALL_ENT( entNameVariable, miobj, amtOfHealth, frameTime, deathEntityIndVal ){  
    NU_ENT( ""+entNameVariable, [
        ""+miobj.n,                                              //Names
        ""+miobj.d,                                              //Desc
        ["sfx_little_pebble", "sfx_stone_crumble", "", ""],                                       // Sounds
        ""+miobj.animpckge,                                                 // Animation package
        PHYSPROFS.STD_BUILT_WALL,                                     // Physics flags of the entity
        EZWG.createPackedU32_16( EZWG.createPackedU16_8(STAD[""+miobj.animpckge][2], frameTime), STAD[""+miobj.animpckge][1] ),  // animSize, animFreq, animStart (16 bytes)
        EZWG.createPackedU32( 0, 0, CL.FREQ_VFAST, DESIR.DESIRE_NOTHING ),// Flippaleprofile, [0x4bit for wind 0x2 bit (0=desynced, 1=synced animations) steppable=0(1=yes)], MoveFreq, Desire
        
        EZWG.createPackedU32_16( 0, STAD.scnt_std_wall ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),
    
        PHYS.PHYSICS_MINER,                    // Goodness from profile
        PHYSPROFS.STD_WALL_placement_badnessfrom,        // Badness from profile, 
        0,                    // Trans1 from profile 
        0,                    // Trans2 from profile, 
        
        EZWG.createPackedU32_16( amtOfHealth, CL.STD_VFX_TRGER ),            // Badness max, Goodness max
        EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
        
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power (badness amt hurts YOU when spawn of result t ype 4 occured)
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power
    
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient
    
        EZWG.createPackedU32_16( deathEntityIndVal, STAD.ent_poof_visual ),   // Badness result, Goodness result
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result
    
        EZWG.createPackedU32( 0, 0, 0, 1 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                            // 0 = self transofmr, 1 = random direction spawn, 2=random direction spawn NO TEAM,     3 = inherit velocity..., 4=damage yurself on spawn from OWN power
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
        EZWG.createPackedU32_16( CL.BP_STD_BUILD_COST, 0 ),            // BP build cost, drop value every move
    
    ]);

}
function NU_TRANSFORM_ENT( entNameVariable, miobj, frameTime, transformTo, successSund, badnessFrom, ambientlyMakeThisEnt, approxHowManyOfThem, animMode ){

    animMode = animMode?animMode:{};

    // Life time based off of frame time and how many different animation frames there are
    let lifeTime = (frameTime * (STAD[""+miobj.animpckge][2]) );
    lifeTime = Math.max(2, lifeTime);

    lifeTime = Math.max( lifeTime, 0 );
    lifeTime = Math.min( lifeTime, 65535 );

    NU_ENT( ""+entNameVariable, [
        ""+miobj.n,                                              //Names
        ""+miobj.d,                                              //Desc
        [""+successSund, "", "", ""],                                       // Sounds
        ""+miobj.animpckge,                                                 // Animation package
        PHYS.PHYSICS_WALL | (animMode.isSuggestive?(PHYS.PHYSICS_SUGGESTIVE|PHYS.PHYSICS_ALLEGIANCED):0),                                     // Physics flags of the entity
        EZWG.createPackedU32_16( EZWG.createPackedU16_8( STAD[""+miobj.animpckge][2] ^ CL.ONE_WAY_ANIM, Math.min(frameTime, 127)),  STAD[""+miobj.animpckge][1] ),  // animSize, animFreq, animStart (16 bytes)
        EZWG.createPackedU32( 0, 0, CL.FREQ_0FAST, DESIR.DESIRE_NOTHING ),// Flippaleprofile, [0x4bit for wind 0x2 bit (0=desynced, 1=synced animations) steppable=0(1=yes)], MoveFreq, Desire
        
        EZWG.createPackedU32_16( 0, STAD.scnt_std_wall ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),
    
        0,                    // Goodness from profile
        badnessFrom,        // Badness from profile, 
        0,                    // Trans1 from profile 
        0,                    // Trans2 from profile, 
        
        // NOTICE ->> IF THERE'S SOMETHING YOU WANT TO SPAWN IT GETS SPANWED 2 TIKC BESORE
        approxHowManyOfThem > 0 ? (EZWG.createPackedU32_16( CL.STD_TRANSITNRY_HEALTH_PLAYER, Math.min( lifeTime-1, Math.floor(lifeTime/approxHowManyOfThem))) ) :             // Badness max, Goodness max
                                  (EZWG.createPackedU32_16( CL.STD_TRANSITNRY_HEALTH_PLAYER, 65535  ) ),
        // NOTICE AGAIN IF IT"S NOT MAKING ANYTHING JUST DIE ON SCHEDULE

        EZWG.createPackedU32_16( 65535, lifeTime ),            // Trans 2 max, Trans 1 max
        
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power (badness amt hurts YOU when spawn of result t ype 4 occured)
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power
    
        approxHowManyOfThem > 0 ? (EZWG.createPackedU32_16( 0, 1 )) :           // Badness ambient, Goodness ambient
                                  (EZWG.createPackedU32_16( 0, 0 )),             // NOTE *** it is dependant o nif ur also trying spawn stuff
        EZWG.createPackedU32_16( 0, 1 ),                    // Trans 2 ambient, Trans 1 ambient
    
        EZWG.createPackedU32_16( STAD.ent_poof_visual, ambientlyMakeThisEnt ),// Badness result, Goodness result
        EZWG.createPackedU32_16( STAD.ent_poof_visual, STAD[""+transformTo] ),                    // Trans 2 result, Trans 1 result
    
        EZWG.createPackedU32( 0, 0, 0, ambientlyMakeThisEnt>0?1:0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                            // 0 = self transofmr, 1 = random direction spawn, 2=random direction spawn NO TEAM,     3 = inherit velocity..., 4=damage yurself on spawn from OWN power
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
        EZWG.createPackedU32_16( CL.BP_UNN_BUILD_COST, 0 ),            // BP build cost, drop value every move
    
    ]);

}
 


// More based on the VISUAL compoennt 
function NU_VISUAL_ENT( entNameVariable, miobj, frameTime ){
    NU_ENT( ""+entNameVariable, [
        ""+miobj.n,                                              //Names
        ""+miobj.d,                                              //Desc
        ["", "", "", ""],                                       // Sounds
        ""+miobj.animpckge,                                                 // Animation package
        PHYS.PHYSICS_WALL,                                     // Physics flags of the entity
        EZWG.createPackedU32_16( EZWG.createPackedU16_8(STAD[""+miobj.animpckge][2] ^ CL.ONE_WAY_ANIM, frameTime), STAD[""+miobj.animpckge][1] ),  // animSize, animFreq, animStart (16 bytes)
        EZWG.createPackedU32( 0, 0, CL.FREQ_0FAST, DESIR.DESIRE_NOTHING ),// Flippaleprofile, [0x4bit for wind 0x2 bit (0=desynced, 1=synced animations) steppable=0(1=yes)], MoveFreq, Desire
        
        EZWG.createPackedU32_16( 0, STAD.scnt_std_wall ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),
    
        0,                    // Goodness from profile
        0,                    // Badness from profile, 
        0,                    // Trans1 from profile 
        0,                    // Trans2 from profile, 
        
        EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
        EZWG.createPackedU32_16( 65535, frameTime*(STAD[""+miobj.animpckge][2]) - 1 ),            // Trans 2 max, Trans 1 max
        
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power (badness amt hurts YOU when spawn of result t ype 4 occured)
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power
    
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
        EZWG.createPackedU32_16( 0, 1 ),                    // Trans 2 ambient, Trans 1 ambient
    
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                            // 0 = self transofmr, 1 = random direction spawn, 2=random direction spawn NO TEAM,     3 = inherit velocity..., 4=damage yurself on spawn from OWN power
    
        EZWG.createPackedU32( 0, 0, 0, 0 ),              //  -ONE Shot or not (1 yes, 0 is cummulatibve)
        EZWG.createPackedU32_16( CL.BP_STD_BUILD_COST, 0 ),            // BP build cost, drop value every move
    
    ]);

}
 
// CANT USE THIS - BECAUSE stompable entities are not allowed to transform themselves to death
// THEY can only be stepped on - no movements.. or transformations...  SAD.
 

function NU_STOMPABLE_ENT( entNameVariable, miobj, animFrequ, exactScentId, animationMode ){
    NU_ENT(""+entNameVariable, [ 
        ""+miobj.n,                                              //Names
        ""+miobj.d,                                              //Desc
        ["", "", "", ""],                                       // Sounds
        miobj.animpckge,                                            // ANimatino package
        PHYS.PHYSICS_NULL,                                     // Physics flags of the entity
        EZWG.createPackedU32_16( EZWG.createPackedU16_8(STAD[''+miobj.animpckge][2], animFrequ), STAD[''+miobj.animpckge][1] ), // animSize, animFreq, animStart (16 bytes)
        EZWG.createPackedU32( 0, 1 + ( animationMode.sync?(0^CL.DESYNC_ANIM_BIT):(0) ) + (animationMode.wind?4:0), CL.FREQ_MED, DESIR.DESIRE_NOTHING ),// Flippaleprofile, [0x4bit for wind 0x2 bit (0=desynced, 1=synced animations) steppable=0(1=yes)], MoveFreq, Desire
        
        EZWG.createPackedU32_16( 0, STAD[""+exactScentId] ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

        0,                    // Goodness from profile
        0,                    // Badness from profile, 
        0,                    // Trans1 from profile 
        0,                    // Trans2 from profile, 
        
        EZWG.createPackedU32_16( 65535, 65535 ),            // Badness max, Goodness max
        EZWG.createPackedU32_16( 65535, 65535 ),            // Trans 2 max, Trans 1 max
        
        EZWG.createPackedU32_16( 0, 0 ),                    // Badness power, Goodness power (badness amt hurts YOU when spawn of result t ype 4 occured)
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 power, Trans 1 power

        EZWG.createPackedU32_16( 0, 0 ),                    // Badness ambient, Goodness ambient
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 ambient, Trans 1 ambient

        EZWG.createPackedU32_16( 0, 0 ),                    // Badness result, Goodness result
        EZWG.createPackedU32_16( 0, 0 ),                    // Trans 2 result, Trans 1 result

        EZWG.createPackedU32( 0, 0, 0, 0 ),                 // TYPE OF TRANSOFRM, trans 2, trans 1, bad, good
                                                            // 0 = self transofmr, 1 = random direction spawn, 2=random direction spawn NO TEAM,     3 = inherit velocity..., 4=damage yurself on spawn from OWN power

        EZWG.createPackedU32( 0, 0, 0, 0 ),                 //  -ONE Shot or not (1 yes, 0 is cummulatibve)
        EZWG.createPackedU32_16( CL.BP_STD_BUILD_COST, 0 ),                    // BP build cost, drop value every move

    ]);
}


// Normal type of resources
// let nuresIND = NU_RES(668, 5,      CL.RES_STD_AMT*2,  {n:"Std. Tree", d:"just a tree resource"}, 3 );
// console.log('nuresIND, ', nuresIND)
// console.log('In Message Templare!!!')
// console.log(EntEntries)