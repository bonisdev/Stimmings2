var EntEntries = [
                
                    // Wandering stim 2
                    [
                        "Nothing",                                              //Names
                        ["", "", "", ""],                                       // Sounds
                        CL.PHYSICS_ALLEGIANCED | CL.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
                        EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 129 ), // animSize, animFreq, animStart (16 bytes)
                        EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, CL.DESIRE_RES ),// Idk, Idk, MoveFreq, Desire
                        
                        EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

                        CL.PHYSICS_RES,       // Goodness from profile
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
                
                    // Wandering stim 2
                    [
                        "Old Man",                                              //Names
                        ["", "", "", ""],                                       // Sounds
                        CL.PHYSICS_ALLEGIANCED | CL.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
                        EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 129 ), // animSize, animFreq, animStart (16 bytes)
                        EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, CL.DESIRE_RES ),// Idk, Idk, MoveFreq, Desire
                        
                        EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

                        CL.PHYSICS_RES,       // Goodness from profile
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
                
                    // Wandering stim 2
                    [
                        "Stimmers",                                              //Names
                        ["", "", "", ""],                                       // Sounds
                        CL.PHYSICS_ALLEGIANCED | CL.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
                        EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 129 ), // animSize, animFreq, animStart (16 bytes)
                        EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, CL.DESIRE_RES ),// Idk, Idk, MoveFreq, Desire
                        
                        EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

                        CL.PHYSICS_RES,       // Goodness from profile
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
                
                    // Wandering stim 2
                    [
                        "Resource",                                              //Names
                        ["", "", "", ""],                                       // Sounds
                        CL.PHYSICS_ALLEGIANCED | CL.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
                        EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 129 ), // animSize, animFreq, animStart (16 bytes)
                        EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, CL.DESIRE_RES ),// Idk, Idk, MoveFreq, Desire
                        
                        EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

                        CL.PHYSICS_RES,       // Goodness from profile
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
                
                    // Wandering stim 2
                    [
                        "Wall",                                              //Names
                        ["", "", "", ""],                                       // Sounds
                        CL.PHYSICS_ALLEGIANCED | CL.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
                        EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 129 ), // animSize, animFreq, animStart (16 bytes)
                        EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, CL.DESIRE_RES ),// Idk, Idk, MoveFreq, Desire
                        
                        EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

                        CL.PHYSICS_RES,       // Goodness from profile
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
                
                    // Wandering stim 2
                    [
                        "Home",                                              //Names
                        ["", "", "", ""],                                       // Sounds
                        CL.PHYSICS_ALLEGIANCED | CL.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
                        EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 129 ), // animSize, animFreq, animStart (16 bytes)
                        EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, CL.DESIRE_RES ),// Idk, Idk, MoveFreq, Desire
                        
                        EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

                        CL.PHYSICS_RES,       // Goodness from profile
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
                
                    // Wandering stim 2
                    [
                        "Stimmer Home",                                              //Names
                        ["", "", "", ""],                                       // Sounds
                        CL.PHYSICS_ALLEGIANCED | CL.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
                        EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 129 ), // animSize, animFreq, animStart (16 bytes)
                        EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, CL.DESIRE_RES ),// Idk, Idk, MoveFreq, Desire
                        
                        EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

                        CL.PHYSICS_RES,       // Goodness from profile
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
                
                    // Wandering stim 2
                    [
                        "Leader",                                              //Names
                        ["", "", "", ""],                                       // Sounds
                        CL.PHYSICS_ALLEGIANCED | CL.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
                        EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 129 ), // animSize, animFreq, animStart (16 bytes)
                        EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, CL.DESIRE_RES ),// Idk, Idk, MoveFreq, Desire
                        
                        EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

                        CL.PHYSICS_RES,       // Goodness from profile
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
                
                    // Wandering stim 2
                    [
                        "Auto Miner",                                              //Names
                        ["", "", "", ""],                                       // Sounds
                        CL.PHYSICS_ALLEGIANCED | CL.PHYSICS_RES_WORKER,                                     // Physics flags of the entity
                        EZWG.createPackedU32_16( EZWG.createPackedU16_8(2, CL.ANIMATION_VFAST), 129 ), // animSize, animFreq, animStart (16 bytes)
                        EZWG.createPackedU32( 0, 0, CL.FREQ_FAST, CL.DESIRE_RES ),// Idk, Idk, MoveFreq, Desire
                        
                        EZWG.createPackedU32_16( 0, 4 ),                    //  Damage Profile ID (max of 65535),Scent Profile ID (max of 65535),

                        CL.PHYSICS_RES,       // Goodness from profile
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
                
            ];

            