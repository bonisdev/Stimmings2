
console.log('Starting Values: ')

console.log('EntEntries.length', EntEntries.length)
//console.log('ScentProfiles.length:', ScentProfiles.length)

//console.log(JSON.stringify(SCHEMA_INDEX, 2));
console.log(SCHEMA_INDEX);

var ENTITY_LIST_NEXT_IND = EntEntries.length;
//var ENTITY_LIST_NEXT_IND = ScentProfiles.length;

var ENT_FOLDERS = [
    {lbl: 'Std. Resource', vals: []}
]


function NU_RES(  animStart, animLength, amtOfRes, miobj ){
    let enn = [ 
        ""+miobj.n,                                              //Names
        ""+miobj.d,                                              //Desc
        ["", "", "", ""],                                       // Sounds
        PHYS.PHYSICS_RES,                                     // Physics flags of the entity
        EZWG.createPackedU32_16( EZWG.createPackedU16_8(animLength, CL.ANIMATION_MED), animStart ), // animSize, animFreq, animStart (16 bytes)
        EZWG.createPackedU32( 0, 0, CL.FREQ_MED, DESIR.DESIRE_NOTHING ),// Idk, Idk, MoveFreq, Desire
        
        EZWG.createPackedU32_16( 0, 2 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

        0,                                          // Goodness from profile
        PHYS.PHYSICS_RES_WORKER | PHYS.PHYSICS_LEADER,  // Badness from profile, 
        0,                                          // Trans1 from profile 
        0,                                          // Trans2 from profile, 
        
        EZWG.createPackedU32_16( amtOfRes, 65535 ),   // Badness max, Goodness max
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

    ];

    EntEntries.push(enn);

    // The Res folder
    ENT_FOLDERS[0].vals.push(0 + ENTITY_LIST_NEXT_IND);



    let temp = ENTITY_LIST_NEXT_IND;
    ENTITY_LIST_NEXT_IND = ENTITY_LIST_NEXT_IND + 1;
    return temp;

}


// Normal type of resources
// let nuresIND = NU_RES(650, 3,      CL.RES_STD_AMT*2,  {n:"NuTree", d:"std Tree resource"} );
// console.log('nuresIND, ', nuresIND)
// console.log('In Message Templare!!!')
// console.log(EntEntries)