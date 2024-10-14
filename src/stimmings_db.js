





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


// THIS BRINGS IN ALL THE FUNCTIONS FOR FAST


//-((((INSERT THE ENTITY TEMPLATER HERE HERE)))



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




SCHEMA_INDEX.ent_chunk = FullEntEntries[0].length-4;    // subtract exra vals

//FullEntEntries

var EntEntries = flattenArrayExceptFirstTwo(FullEntEntries);//EntEntries.flat()

SCHEMA_INDEX.ent_start = 0 + indTracker; 

totalbuffer =  totalbuffer.concat( EntEntries );
indTracker += EntEntries.length;


//-((EXACT LOCATION FOR THE SCENTS TO GO))


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

// SCENT*8 Profiles defined HEre ^^^^^^^^^^ in the all_scents.js file
// Go ahead and add in the random atactors
// for(let jk = 0;jk < 16;jk++){
//     ScentProfiles[ 7+jk ][ ScentProfiles[7+jk].length-1 ] = 
//         EZWG.createPackedU32_4(
//             r3test(jk), r3test(jk), r3test(jk), r3test(jk),
//             r3test(jk), r3test(jk), r3test(jk), r3test(jk)
//         ); 
//     ScentProfiles[ 7+jk ][ ScentProfiles[7+jk].length-2 ] = 
//         EZWG.createPackedU32_4( 
//             r3test(jk), r3test(jk), r3test(jk), r3test(jk),
//             r3test(jk), r3test(jk), r3test(jk), r3test(jk)
//         );
// }






SCHEMA_INDEX.sct_chunk = ScentProfiles[0].length;

ScentProfiles = ScentProfiles.flat()

SCHEMA_INDEX.sct_start = 0 + indTracker;

totalbuffer =  totalbuffer.concat( ScentProfiles );
indTracker += ScentProfiles.length;



//-((EXACT LOCATION FOR THE DMGPROFILES TO GO))




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








