

// 0, 1, 2, 3       SECOND half is counter
var SLOT0: u32 = EZ_CELL_VAL( EZX, 0, EZY, 0, 0 );
var entityType: u32 = SLOT0 & 0x0000FFFF;
var sfx_startingEnt: u32 = 0u + entityType;
var sfx_whichTrigg: u32 = 0;

var anim_start: u32 = ${SCHEMA_INDEX.anim_start}u;
var anim_chunk: u32 = ${SCHEMA_INDEX.anim_chunk}u;
var ent_start: u32 = ${SCHEMA_INDEX.ent_start}u;
var ent_chunk: u32 = ${SCHEMA_INDEX.ent_chunk}u;
var sct_start: u32 = ${SCHEMA_INDEX.sct_start}u;
var sct_chunk: u32 = ${SCHEMA_INDEX.sct_chunk}u;
var dmg_start: u32 = ${SCHEMA_INDEX.dmg_start}u;
var dmg_chunk: u32 = ${SCHEMA_INDEX.dmg_chunk}u; 
// var atm_start: 9999999,
// var atm_chunk: 45


// WASD input 
var wasd_input: u32 = u32( EZ_USER_INPUT[11] );//0u;

var last_team_sel: u32 = u32( EZ_USER_INPUT[12] );//0u;

var q_and_e: u32 = u32(EZ_USER_INPUT[15]);  // q or E seelcted


var teamNumber: u32 = (SLOT0 >> 16) & 0x0000FFFF;
var cpuHook: u32 = (teamNumber >> 8 ) & 0x0000000F;
var snapExps:u32 = (teamNumber >> 12) & 0x0000000F;
if(snapExps>0){snapExps=snapExps-1u;}                   // subtrract one
    // TODO this is not used ever really yet^^^^^^^
teamNumber = (teamNumber >> 0) & 0x000000FF;

var sfx_startingTemNum: u32 = 0u + teamNumber;          // used for sound calculating

var counter: u32 = u32(EZ_USER_INPUT[ EZ_USER_IN_SZE - 1 ]);
    // This Entity's Sepcial Random
//tesr = tesr % 1024;
 

var myPhysics = EZ_STORAGE[ 0u + ent_start + (entityType * ent_chunk) ];
var isAlgntedWarior: u32 = 0u;
                            // is this entity considered alleginated
                            // AND a warrior (this)
    // check Alleginaced,,, check Warrior
if( ((1 << 2) & myPhysics) > 0 && ((1 << 11) & myPhysics) > 0 ){
    isAlgntedWarior = 1u;
}

var myDesire = EZ_STORAGE[ 2u + ent_start + (entityType * ent_chunk) ];
var myFreq: u32 = (myDesire >> 8) & 0x000000FF;
var myStepable: u32 = (myDesire >> 16) & 0x000000FF;
myStepable = myStepable & 1u;   //JUST SUE THE FIRST BIT
var sprOrienProfile: u32 = (myDesire >> 24) & 0x000000FF;     // when to flip
myDesire = (myDesire >> 0) & 0x000000FF;

var sfx_startingSteppable: u32 = 0u + myStepable;


var currGood: u32 = EZ_CELL_VAL( EZX, 0, EZY, 0, 2u );      //Good + Bad points
var currBad: u32 = (currGood >> 16) & 0x0000FFFF;
currGood = (currGood >> 0) & 0x0000FFFF;
 
var currT1: u32 = EZ_CELL_VAL( EZX, 0, EZY, 0, 3u );        // Trans1 + Trans2 points
var currT2: u32 = (currT1 >> 16) & 0x0000FFFF;
currT1 = (currT1 >> 0) & 0x0000FFFF;



var scentId = EZ_STORAGE[ 3u + ent_start + (entityType * ent_chunk) ];
var dmgId = (scentId >> 16) & 0x0000FFFF;
scentId = (scentId >> 0) & 0x0000FFFF;


var goodFrom: u32 = EZ_STORAGE[ 4u + ent_start + (entityType * ent_chunk) ];
var badFrom: u32 =  EZ_STORAGE[ 5u + ent_start + (entityType * ent_chunk) ];
var t1From: u32 =   EZ_STORAGE[ 6u + ent_start + (entityType * ent_chunk) ];
var t2From: u32 =   EZ_STORAGE[ 7u + ent_start + (entityType * ent_chunk) ]; 


var goodBadMax: u32 =   EZ_STORAGE[ 8u + ent_start + (entityType * ent_chunk) ];
var transMax: u32 =     EZ_STORAGE[ 9u + ent_start + (entityType * ent_chunk) ];

// 10u and 11u the POWER you grab from others


var goodBadAmb: u32 =   EZ_STORAGE[ 12u + ent_start + (entityType * ent_chunk) ];
var transAmb: u32 =     EZ_STORAGE[ 13u + ent_start + (entityType * ent_chunk) ];

var badGoodResult: u32 =EZ_STORAGE[ 14u + ent_start + (entityType * ent_chunk) ];
var transResult: u32 =  EZ_STORAGE[ 15u + ent_start + (entityType * ent_chunk) ];

var resultMode: u32 =   EZ_STORAGE[ 16u + ent_start + (entityType * ent_chunk) ];

var oneShot: u32 =   EZ_STORAGE[ 17u + ent_start + (entityType * ent_chunk) ];
var dropVal: u32 =   EZ_STORAGE[ 18u + ent_start + (entityType * ent_chunk) ];  // probably teleport coordinates, and BP look up refs
dropVal = (dropVal >> 0) & 0x0000FFFF;



// 0, 1, 2, 3, 4, 5, 6, 7, 8   <-  (4 Stationary)
var nextMove: u32 = EZ_CELL_VAL( EZX, 0, EZY, 0, 1 );
var pPrior: u32 =    (nextMove >> 8) & 0x000000FF;     // IDK --- - What is this guys random priority ?! to always ensure a fill?
var hiLiteTag: u32 = (nextMove >> 16) & 0x000000FF;
var lastCmdDetail: u32 = (nextMove >> 24) & 0x000000FF;
nextMove = nextMove & 0x000000FF;                 // NEXT MOVE INTENTION before splitting once again
var nextSpawn: u32 = ((nextMove >> 4) & 0x0000000F);
nextMove = nextMove & 0x0000000F;

var tesr: u32 = counter / myFreq;
tesr = EZ_RAND_U( pPrior + EZX*(tesr)*23 + EZY*(tesr)*19 + EZ_RAND_U( (tesr)*(tesr) + EZX*439 + EZY*417 ) );
tesr = tesr + EZ_RAND_U( counter );//tesr + counter % 512;//


//          Stores 4 different scent values
var SLTINDX_STRT: u32 = 4u;
var SCSLTS: u32 = 6u;       // ALL SCENT SLOTS
//          First these values are filled with lowest of each scent 
const TTL_INSLTS: u32 = 48u;    //8 * SCSLTS;       // TOTAL IN SCENT VALS (u32s) 8 nghbs times each u32 val needed for scent
const TTL_OUTS: u32  = 24u;      //4 * SCSLTS;       // TOTAL scent outs (u8's) to write back
var inScents: array<u32, TTL_INSLTS>;
var outScents: array<u32, TTL_OUTS >;
var i: u32 = 0u;

loop { 
    if i >= TTL_OUTS { break; } 
    outScents[ i ] = 0u;
    i = i + 1u;
}
//      ^^   do this 
// outScents[0] = 0u;  // home
// outScents[1] = 0u;  // res
// outScents[2] = 0u;  // work
// outScents[3] = 0u;  // enemy

// outScents[4] = 0u;  // home
// outScents[5] = 0u;  // res
// outScents[6] = 0u;  // work
// outScents[7] = 0u;  // enemy

var funcScents: array<u32, 16>;
var FUNCINDX_STRT: u32 = 10u;

i = 0u;
loop {  
    if i >= 16 { break; } 
    funcScents[ i ] = 0u;
    i = i + 1u;
}

//      No matter what accumulate the neighbours' intentions
i = 0u;
    var iw: u32 = 0u;       // Used only sometimes when it gets complicated
var di: u32 = 0u;                   // Direction ind
var bitind: u32 = 0u;               // Scent ind (the 0-3 inside a u32)
var dx: i32 = -1i;
var dy: i32 = -1i;

var deathYes: u32 = 0u;         // USED now in calculating power hits
var goodYes: u32 = 0u;         //  and if these are 1 then u are looking to execute it
var trans1Yes: u32 = 0u;
var trans2Yes: u32 = 0u;

var potentilNxtSpwn: u32 = 0;   // this is the value of what u r gonna spawn ( if u have the ability tomove)
                // USED only when the transform Type is 1 (spawning outside urself)

var nghbrTeam: u32 = 0u;

var tmpsmlExp: u32 = 0u;

// FIRST MAKE ALL THE SCENT VALUE READS U NEED:
//      AND ALSO maybe include the transofrmations here
loop {                              // Goes 0-7 (inclusive)
    if i >= TTL_INSLTS { break; }   // from 0 to TTL_INSLTS-1
    di = (i%8) + ((i%8)/4u);        // Which way look around (0 - 7 SKIPS 4!(SELF))
    bitind = i / 8;                 // Which scent mem slot to be compiling (0 - 3)
    dx = -1 + i32(di%3u);           // X Value
    dy = -1 + i32(di/3u);           // Y Value
    inScents[ i ] = EZ_CELL_VAL( EZX, dx, EZY, dy, SLTINDX_STRT + bitind );
    
    

    // JUST WHILE UR HERE ACCUMULATE the physics too and check for any transformations
    if(i < 8){
        iw = EZ_CELL_VAL( EZX, dx, EZY, dy, 0u );      // The entity of the neibhr next 2 u
        nghbrTeam = (iw >> 16) & 0x000000FF;
        iw = iw & 0x0000FFFF;
        bitind = EZ_STORAGE[ 0u + ent_start + (iw * ent_chunk) ];   // The physics profile of the nighbr (from the ent val)
        
        if(i%4==0){ // update the spot in memory looking for the dmg value
            tmpsmlExp = EZ_STORAGE[ (i/4) + 0u + dmg_start + (dmgId * dmg_chunk) ];
        } 

        // PHYSICS FLAGS TRIGGERED?!  Grab the power of the neighboruiung entity that triggered this flag
        if( (goodFrom & bitind) > 0 ){
            currGood = currGood + ((EZ_STORAGE[ 10u + ent_start + (iw * ent_chunk) ] >> 0) & 0x0000FFFF); 
        }
        if( (badFrom & bitind) > 0 ||       //-(((THIS IS THE PARTICULARS AROUND WARFARE BETWEEN TEAMS)))
            (nghbrTeam != teamNumber && teamNumber > 0 && nghbrTeam > 0 &&      // DIFFERENT AND DECLARED TEAMS
            ((1 << 2) & myPhysics) > 0 && ((1 << 11) & bitind) > 0 && ((1 << 2) & bitind) > 0 ) ){  // BOTH HAVE ALLEGIANCE, AND THE ATTACKER (NGHBR) HAS WARRIOR 
            currBad = currBad + ((EZ_STORAGE[ 10u + ent_start + (iw * ent_chunk) ] >> 16) & 0x0000FFFF);
        }
        if( (t1From & bitind) > 0 ){
            currT1 = currT1 + ((EZ_STORAGE[ 11u + ent_start + (iw * ent_chunk) ] >> 0) & 0x0000FFFF); 
        }
        if( (t2From & bitind) > 0 ){
            currT2 = currT2 + ((EZ_STORAGE[ 11u + ent_start + (iw * ent_chunk) ] >> 16) & 0x0000FFFF);
        }

        // Neutral team number conversion if allegiance capable and SUGGESTIVE
        // Check if suggestive type influences what happesn to you
        if( nghbrTeam != teamNumber && teamNumber == 0 && nghbrTeam > 0 &&    
            ((1 << 14) & myPhysics) > 0 && ((1 << 2) & myPhysics) > 0  &&     // YOU are SUGGESTIVE and allegianced, and TEAM 0 (gaia..?)
            ((1 << 2) & bitind) > 0 ){                                        // The Attacker nghbr is also allegianced AND has a team > 0
            teamNumber = nghbrTeam;

        }

        // ALSO WHILE YOURE JUST STILL HERE check max thresholds of the damage profile
        iw = EZ_CELL_VAL( EZX, 0, EZY, 0, SLTINDX_STRT + 4u + (i/4) );

        if( ( (iw>>(8u*(i%4))) & 0x000000FF ) > ( (tmpsmlExp>>(8u*(i%4))) & 0x000000FF ) ){
            deathYes = 1u;  // You will die...
        }

        // Final checks
    }

    // TODO AFTER ACCUMUALTE THE HAZARD SCENTS

    i = i + 1u;
}


// AMBIENT CONTRIBUTORS
currGood = currGood + (goodBadAmb & 0x0000FFFF);
currBad = currBad + ((goodBadAmb >> 16) & 0x0000FFFF);
currT1 = currT1 + (transAmb & 0x0000FFFF);
currT2 = currT2 + ((transAmb >> 16) & 0x0000FFFF);

//  Somehow accumulate what appens ehre


// 
if( currT2 > ((transMax >> 16) & 0x0000FFFF) || (hiLiteTag > 0u && ((q_and_e%2u)==1u) && myDesire == 4u)){ // THE 'E'       //(((q_and_e>>1)&1)>1)
    trans2Yes = 1u;
    i = ((resultMode >> 24) & 0x000000FF);
    if( i > 0u ){                   //  **** REMINDER:L:: 0= SELF TRANSFORM, 1=SPAWN, 2=SPAWN NO TEAM
        potentilNxtSpwn = 4u;   // trans2
    }
    else{
        potentilNxtSpwn = 0u;
    }
}
if( currT1 > ((transMax >> 0) & 0x0000FFFF) || (hiLiteTag > 0u && (((q_and_e>>1u)%2u)==1u) && myDesire == 4u)){       // THE 'Q'      //((q_and_e&1)>1)
    trans1Yes = 1u;
    i = ((resultMode >> 16) & 0x000000FF);
    if( i > 0u ){                   //  **** REMINDER:L:: 0= SELF TRANSFORM, 1=SPAWN, 2=SPAWN NO TEAM
        potentilNxtSpwn = 3u;   // trans1
    }
    else{
        potentilNxtSpwn = 0u;
    }
}
if( currGood > ((goodBadMax >> 0) & 0x0000FFFF) ){// double check what you qualify for....
    goodYes = 1u;
    i = ((resultMode >> 0) & 0x000000FF);
    if( i > 0u ){               //  **** REMINDER:L:: 0= SELF TRANSFORM, 1=SPAWN, 2=SPAWN NO TEAM
        potentilNxtSpwn = 1u;   // Good 
    }
    else{
        potentilNxtSpwn = 0u;                   ///<----    NOTICE** ALWAYS RESET IT IF IT FAILS oTHERWISE IT INHERITS FROM OTHERS
    }
}

// OVERRIDE
if( currBad > ((goodBadMax >> 16) & 0x0000FFFF) ){ // BAD OUTCOME trumps all other transformations
    deathYes = 1u;
    i = ((resultMode >> 8) & 0x000000FF);
    if( i > 0u ){    // just check if the result mode of this guy is to SPAWN //  **** REMINDER:L:: 0= SELF TRANSFORM, 1=SPAWN, 2=SPAWN NO TEAM
        potentilNxtSpwn = 2u;   // Bad (this one shouldnt happen?!) < - why is badness spawning outside itself
    }
    else{
        potentilNxtSpwn = 0u;
    }
}



//  THIS PREVENTS STOMPABLE NETITIES FROM TRANSFORMING, CAUSE IDK 
//  HOW TO HANDLE THEIR MOVEMENT IF THEY CAN ALSO BE STEPPED ON YET.....
if( myStepable > 0u ){  //myDesire == 0u || 
    potentilNxtSpwn = 0u;
}
 
// // TODO add the one shot stuff here? i think?!
// if( ((oneShot >> 0) & 0x000000FF) == 1u ){ 
// }
// else if( ((oneShot >> 8) & 0x000000FF) == 2u ){ 
// }
// else if( ((oneShot >> 16) & 0x000000FF) == 3u ){ 
// }
// else if( ((oneShot >> 24) & 0x000000FF) == 4u ){ 
// }

// Cap the values so they do not go to heiehr
currGood = min( currGood, 65535 );
currBad = min( currBad, 65535 );
currT1 = min( currT1, 65535 );
currT2 = min( currT2, 65535 );

// ALL transofmrations 
// deathYes cannot work if ur next movement is locked in and not 4u:
// bbecause we ** cant iunclude another factor to check for in the receiving cell !!!




// SECOND LOOP THROUGH NEIGHBOURS AND GET THE MOVE INTENTION IF IT'S ON YOU
//
//
//          4  ( FOUR ) 
//
//
//
//                          IS LIKE THE 
//
//
//
//
//                                          -1  here
//
//
//



//          Attackers on ME
var numOfStomprs: u32 = 0u;         // Amount of stompers on me movement?
var comingFromLoc: u32 = 4u;        // Where is the stomper coming from

//          Attackers on DESTINATION
var movConflicts: u32 = 0u;         // USED if ur going away from ur current spot
var immintDestEntity: u32 = 0u;     // if the spot is empty or not
var uGotLowPrio: u32 = 0u;          // USED if you happened to have a same move ona spot your LOWER in priroity

//          Get your next destination
var bestMoveInd: u32 = 4u;          // DEFAULT STATIONARY
                                // USED FOR EHWN finalizing a NEXTMOVE _DECISION_

//          Quickly get the GOING-TO move spot of ur next move (IF UR GOIN THERE)
immintDestEntity = EZ_CELL_VAL( EZX, (-1 + i32(nextMove%3u)), EZY, (-1 + i32(nextMove/3u)), 0u );
immintDestEntity = immintDestEntity & 0x0000FFFF;
immintDestEntity = EZ_STORAGE[ 2u + ent_start + (immintDestEntity * ent_chunk) ];   // Get if it's ok to step on or not 
immintDestEntity = (immintDestEntity >> 16) & 0x000000FF;

i = 0u;         // USED for getting STOMPED on, ACUUMULATING PHYSICS,  "verifying DESTINATION still good".
loop {
    if i >= 8 { break; }
    di = (i%8) + ((i%8)/4u);        // Which way look around (0 - 7 SKIPS 4!(SELF))
    dx = -1 + i32(di%3u);           // X Value
    dy = -1 + i32(di/3u);           // Y Value

    // TODO IMPLEMENT PHYSICS TOUCHING HERE - ACCUMULATE TRANSFORMATION VALUES HERE

    //      Attackers on YOUR cell
    bitind = EZ_CELL_VAL( EZX, dx, EZY, dy, 1u );
    bitind = bitind & 0x0000000F;

    if( di == 8u - bitind ){
        numOfStomprs = numOfStomprs + 1u;   // USED in the case ur movement 
                                            // is blocked or ur not moving in the first place
        comingFromLoc = di;                 // Just add this number back on to 
                                            // yourself to get the attacker (WHO THIS CELL SHOULD BECOME)
    }
    
    //      Attackers on TO cell (USED when nextMove not 4)
    //      "verifying DESTINATION still good"
    bitind = EZ_CELL_VAL( EZX, dx + (-1 + i32(nextMove%3u)), EZY, dy + (-1 + i32(nextMove/3u)), 1u );
    //bitind = bitind & 0x000000FF;
    bitind = (bitind & 0x0000000F);
    if( di == 8u - ( (bitind >> 0) & 0x000000FF) ){      // The neighbour di around the going-to location is on the
        movConflicts = movConflicts + 1u;
                // The MoVe is coming from NOT U (but COUPLED with the fact ur in this if statement means its gotta be u)       
                //              AND the prio is greater or equal to u
        if( nextMove != ((bitind>>0)&0x000000FF) && ((bitind>>8)&0x000000FF) >= pPrior ){
            uGotLowPrio = 1u;   // USED in the case you are going to MOVE
                                // if 1 in total -> ur good to MOVE
                                    // NOTE* only gotta check this here because if it's a mvoe conflict when first ESTABLISHING this nextMove it would be
                                        // discarded anyways - it only has to be checked on the moving frame
        }
        // else if(  ) {// IF UR PRIORITY IS LOWER OR SAME AND ITS NOT URSELRF
        //     uGotLowPrio = 1u;                   // USED in the
        // }
        
        //uGotLowPrio
    }
    i = i + 1u;
}
 




















// Counter for the function jooses loop
var tii: u32 = 0;
// Value for the function jooses desired profile
var funcJoos: u32 = 0;// this will be a FFFFFFFF  collection of the desired func joose profile
// Holds current func joose mem slot of the potentialBestMove
var potBestJoos: u32 = 0u;

// Holder of team signature joose
var teamSigJoos: u32 = 0u;

// The natural scenrts (.2..) (slot 2 of 4 path finding scents) of the neighbour cell ur looking at
var naturalscnts: u32 = 0u;

// LOOKING FOR MOVES ON for DESIRED SCENTS

//          CHOOSING A NEXT INTENDED MOVEMENT

var otherIntentionsOnGoal: u32 = 0u;    // how many other guys have intentions on the same cell
  

var highestScore: u32 = 0u;
var currScScore: u32 = 0u;
var tesrHelper: u32 = EZ_RAND_U( pPrior*pPrior + tesr + EZX*tesr*17 + EZY*tesr*13 );

i = 0u;
loop {
    if i >= 8*8 { break; }
    iw = (i/8);                 // Looking at this neighbour  (iw)
    iw = (iw + tesr%256) % 8u;                  // RANDOM SPZICE SO IT's A TWO WAY - ROTATE TO DIAL WHEEL ON THE NEIGHBOURS
    if(tesrHelper%2==0u){
        iw = 8u - iw;
    }
    //  iw = iw ^ ((1u ^ (tesrHelper & 1u)) * 7u);
    iw = iw + ((iw/8)/4u);

    di = (i%8) + ((i%8)/4u);        // Looking at this NEIGHBOUR's neighbour
    dx = -1 + i32(di%3u);
    dy = -1 + i32(di/3u);


    bitind = EZ_CELL_VAL( EZX, dx + (-1 + i32(iw%3u)), EZY, dy + (-1 + i32(iw/3u)), 1u );
    //bitind = bitind & 0x000000FF;
    //      bitind is now the movement location of the guys
        

    if( di == 8u - (bitind & 0x0000000F) ){   // THere is one guy with opposite intentions and on me (this gets nextMove value from slot 1)
        otherIntentionsOnGoal = otherIntentionsOnGoal + 1u;
    }

    // Was the last otherIntentions check on this neibhgour
    //      AND no other neibhgours have intentions on it
    if( di % 8u == 7u && otherIntentionsOnGoal == 0u ){


        // Check the first 4 scents // = SLTINDX_STRT = 2u      // TODO use the inScent array you already gathered here instead of calling buffer again
        bitind = EZ_CELL_VAL( EZX, -1 + i32(iw%3u), EZY, -1 + i32(iw/3u), SLTINDX_STRT + 0u );
        naturalscnts = EZ_CELL_VAL( EZX, -1 + i32(iw%3u), EZY, -1 + i32(iw/3u), SLTINDX_STRT + 1u );
        //bitind    // is now the first 4 scents
        teamSigJoos = EZ_CELL_VAL( EZX, -1 + i32(iw%3u), EZY, -1 + i32(iw/3u), SLTINDX_STRT + 3u );// The last of 4 u32's -> path jooses
        
        currScScore = 0u;// RESET THIS?! I THINK?
        var desireOverideByFuncJooses: u32 = 0u;        // if every set to 1 then functino jooces desire override this

        // SAFEQUARD FOR no MOVEMENT on a STEPPABLE ENT
        if( myStepable > 0u ){  //myDesire == 0u || //<- if u leave this in - nothing spawns anymore XD
            currScScore = 0u;
        }
        // WANDER anywhere,         OR ttrying to spawm,  
        else if( myDesire == 1u || potentilNxtSpwn > 0u ){                 // Wander, anywhere good , OR if trying to spawn just pick RANDOM
            currScScore = EZ_RAND_U( iw*pPrior + tesr + ( pPrior*83+ EZX*iw*1173 + EZY*iw*1397 ) );
            currScScore = EZ_RAND_U( currScScore + iw*iw ) % 256;
        }
        else if( myDesire == 8u ){            // GO TO RES (stimmers)
            currScScore = (bitind >> 8) & 0x000000FF;   // Score the amount of res scent here
        }
        else if( myDesire == 7u ){            // GO TO HOME 
            currScScore = (bitind >> 16) & 0x000000FF;   // Score the amount of home scent here
            // if( iw == 0u ){   // Just this one direction
            //     currScScore = 9999u;
            // }
        }

        // This mode needs real time values to trigger
        // Desire catcher fr this (has no default behaviour)
        // So it wont move w out active input
        else if( myDesire == 4u ){
            if( hiLiteTag > 0u ){// command id meanas youre CURRENTLY highlighted   

                if( 4 != wasd_input && iw == wasd_input ){
                    currScScore = 255 + 1;
                    // lastCmdDetail = wasd_input;
                } 
            }
        }

        // While THIS mode uses the last input when it was highlighted
        // This one will retain its last command i guess
        else if( myDesire == 5u ){

            // Check if you're highlighted and if yes set the cmd detail
            if( hiLiteTag > 0u && wasd_input != 4u ){        // There IS highlgiht 
                // TOGGLA ABILITY
                if( lastCmdDetail-1u == 8-wasd_input ){
                    lastCmdDetail = 0u;     // SO that ur cancelling pout the mvoment w opsite direciton
                }   // Set to 0
                else{
                    lastCmdDetail = wasd_input + 1u;     // SO THAT u can use this when not highlgithed later 
                }
            }

            if( lastCmdDetail > 0u && lastCmdDetail != 4+1){// you have a saved up cmd detail to run which is its last instructions it was given when highlighted
                                    // if not then it's considered stationary , or no instruction
                if( 4 != (lastCmdDetail-1u) && iw == lastCmdDetail - 1u ){
                    currScScore = 255 + 1; 
                }
            }
        }

        // Desire for WAR.....
        else if( myDesire == 18 && teamNumber > 0u ){           //TODO dont hardcod enubmer of fteams? (4)
                                                        // > IT's teamnumber-1 to get the spot in memeory that holds the teams scent becaseut team=0 has NO SIGNATURE SCENT
            currScScore = max( currScScore, (teamSigJoos >> (((0+teamNumber+4u)%4)*8)) & 0x000000FF );
            currScScore = max( currScScore, (teamSigJoos >> (((1+teamNumber+4u)%4)*8)) & 0x000000FF );
            currScScore = max( currScScore, (teamSigJoos >> (((2+teamNumber+4u)%4)*8)) & 0x000000FF );
            currScScore = max( currScScore, (naturalscnts >> 0) & 0x000000FF );             // This is the HOSTILE GAIA SCent
        }
        //DESIRE_CIVILIZATION
        else if( myDesire == 19 ){
            currScScore = max( currScScore, (teamSigJoos >> (((0)%4)*8)) & 0x000000FF );   // All the 4 team scents
            currScScore = max( currScScore, (teamSigJoos >> (((1)%4)*8)) & 0x000000FF );
            currScScore = max( currScScore, (teamSigJoos >> (((2)%4)*8)) & 0x000000FF );
            currScScore = max( currScScore, (teamSigJoos >> (((3)%4)*8)) & 0x000000FF );
            currScScore = max( currScScore, (bitind >> 16) & 0x000000FF );                  //   the amount of home scent here)
        }
        // Chase orb and functional jooses try to match 
        // TODO somehow combine these functions with otoher desires? so some sensores pull them along 
        else if( myDesire > 5 && myDesire < 9 && 2 > 5 ){
            tii = 0u;
            loop{
                if tii >= 16 { break; }
                if( tii % 8 == 0 ){     // roll over to next func joos profile
                    funcJoos = EZ_STORAGE[ 14u + (tii/8u) + sct_start + (scentId * sct_chunk) ];
                }

                bitind = (funcJoos >> ((tii%8u)*4u) ) & 0x0000000F;// Now bitind is the desired amount of this jooce
                if( bitind > 0u ){      // If it's over 0 count it as relevant requirement
                
                    potBestJoos = EZ_CELL_VAL( EZX, -1 + i32(iw%3u), EZY, -1 + i32(iw/3u), FUNCINDX_STRT + (tii/8u) );
                    potBestJoos = ( potBestJoos >> ((tii%8u)*4u) ) & 0x0000000F; // get the exact func joose value at this potenaitl best neighbour
                    if( bitind > potBestJoos ){     // if the desire is greater than the val
                        currScScore = currScScore + 15u - ( bitind-potBestJoos );
                    }
                    else{                       // The desire is smaller than or equal to the val
                        currScScore = currScScore + 15u - ( potBestJoos-bitind );
                    }

                    // ^ now the CLOSER (hence 15u - dist ) to the value set by the scent desire the func chooses are, the higher the score
                    
                }

                tii = tii + 1u;
            }
            // bitind = EZ_CELL_VAL( EZX, -1 + i32(iw%3u), EZY, -1 + i32(iw/3u), FUNCINDX_STRT + 0u );

            // 
        }
 
        // if DESIRE_SUPPORT  <- reinstate these values at the bottom if there is none
        if( myDesire == 10u ){


            currScScore = max( currScScore, (naturalscnts >> 8) & 0x000000FF ); // the amount of support scent here
        }
    

        // Check if there's anything occupying this space as well... obviosuly 
        bitind = EZ_CELL_VAL( EZX, -1 + i32(iw%3u), EZY, -1 + i32(iw/3u), 0u );

        // IF there's a team or something
        if( ((bitind >> 16) & 0x0000FFFF) > 0u ){
            
        }

        bitind = bitind & 0x0000FFFF;

        //bitind    // is now the entityType of the spot youre going towareds

        var steppableThing = EZ_STORAGE[ 2u + ent_start + (bitind * ent_chunk) ];
        steppableThing = (steppableThing >> 16) & 0x000000FF;
        steppableThing = steppableThing & 1u;//just the first bit
        // TODO - bring this out of the ent meta value 
    

        if( steppableThing == 0u ){ // nope, not steppable
            currScScore = 0u;
        }

        if( currScScore > highestScore && steppableThing == 1u ){
            bestMoveInd = iw;
            highestScore = currScScore;
        }
        

    }

    i = i + 1u;
}




//         NOW HAVE ALL THE VALUES FOR THE "FINAL VERDICT "
// WHAT TO DO W ALL THIS INFORMATION..........
//
//                      POSSIIBLITIES

/////////               HMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
























// we can update this valuenow no biggie (this is what it will be if the ent doesnt  change on this )
pPrior = EZ_RAND_U( pPrior*pPrior + EZX*51 + counter + tesr + EZY*73 ) % 256;
// and this has to be updated after all this cause pPrior is read by neighburing cells  //TODO <- verify this claim

//   YOU ARE EMPTY SPACE =============================================
// ------------------------------------------------------------------
if( entityType == 0u || myStepable > 0u ){
    // RETRIEVE that one and copy its values into you
    if( numOfStomprs == 1u ){
        dx = -1 + i32(comingFromLoc%3u);           // X Value
        dy = -1 + i32(comingFromLoc/3u);           // Y Value
                    // DO NOT IMPLEMENT PHYSCS HERE....  i think..... // TODO IMPLEMENT PHYSICS TOUCHING HERE - ACCUMULATE TRANSFORMATION VALUES HERE


        // FIRST CHECK IF getting the SPAWNED entity 
        // OR getting the base entity
        bitind = EZ_CELL_VAL( EZX, dx, EZY, dy, 1u );
        nextMove = (bitind & 0x000000FF);
        pPrior = (bitind >> 8) & 0x000000FF;


        hiLiteTag = (bitind >> 16) & 0x000000FF;             // <- NOTICE all thse values default bing transfree
        lastCmdDetail = (bitind >> 24) & 0x000000FF; 
        nextSpawn = ((bitind >> 4) & 0x0000000F); 

        
        bitind = EZ_CELL_VAL( EZX, dx, EZY, dy, 0u );       // Get the entity that's mvoing on to this space
        teamNumber = (bitind >> 16) & 0x000000FF;
        var parentcpuHook: u32 = (bitind >> 24) & 0x0000000F;      // inherit the cpus hook (orineation) UNLESS - you are just spawning, 
        snapExps = (bitind >> 28) & 0x0000000F;
        if(snapExps>0){snapExps=snapExps-1u;}   // subtract one from snapexps       // TODO maybe not need to inehereit - kind of funny but idk if necessary

        bitind = (bitind >> 0) & 0x0000FFFF;   //<- ENtity TYPE of incoiming entity


        myFreq = EZ_STORAGE[ 2u + ent_start + (bitind * ent_chunk) ]; // override this varilable to store
        myFreq = (myFreq >> 24) & 0x000000FF;                       // the oritenatino profile
        if( ((myFreq >> (8u - nextMove) ) & 1) > 0 ){   // if allowed, update the thing
            cpuHook = 8u - nextMove;
        }
        else{                               // if not dont do anything , just let it be the parent's
            cpuHook = parentcpuHook;// 4u;
        }


            
        // RESET IT DOWN HERE - because just need this value to update the cpuidHook for the sprite orientaiton
        nextMove = 4u;  //(bitind & 0x000000FF);            // <- THIS GETS RESET because it has to go through the regular LOGIC again 


        // HERE WE CHECK IF a SPAWNED entity gonna be stomping on me, or the hub entity 
        if( nextSpawn > 0u ){
            nextSpawn = nextSpawn - 1u; // prepare the spawn value for bit manipulation
            // 14u
            // and 15u

            // Get if the SPawning is Retaining TEAM or NOT retaining team   
            // THE FACT THAT YOU ARE IN THIS IF STATEMENT MEANS YOU"RE SPAWNING - DETERMINED BY THE LAST INTENTION SETTING (IF YOU)
            // YOOIU ARE JUST CROSS CHECKING HOW TO SET THE TEAM OF THE SPAWNED ENTITY HERE
            var resetTeam: u32 = EZ_STORAGE[ 16u + ent_start + (bitind * ent_chunk) ];
            resetTeam = ( (resetTeam >> ((nextSpawn)*8)) & 0x000000FF );
            
            bitind = EZ_STORAGE[ (nextSpawn/2) + 14u + ent_start + (bitind * ent_chunk) ];  // Get the off spring 
            entityType = ( (bitind >> ((nextSpawn%2)*16)) & 0x0000FFFF );
            if(entityType < 1u || resetTeam > 1u){  // (it had to atleast be 1 to trigger the 'YES' to SPAWNING last step, so if it's 2 then no team)
                teamNumber = 0u;    // set the team to nothing if youre spawning nothing..
            } 

            currGood = 0u;
            currBad = 0u;
            currT1 = 0u;
            currT2 = 0u; 

            nextSpawn = 0u;
        }

        // OR IF IT'S THE HUB ENTITY - bring over all the crap - TODO test this 
        else{
            // Get the cell type, 
            bitind = EZ_CELL_VAL( EZX, dx, EZY, dy, 0u );  
            entityType =    bitind & 0x0000FFFF;
            //  DONT HAVE TO WATCH FOR SETTING TEAM on AN ENT=0 BECAUSE ENT0's never MOVE

            // Get the bood/bad/trans1/trans2 points
            bitind = EZ_CELL_VAL( EZX, dx, EZY, dy, 2u );
            currGood = bitind & 0x0000FFFF;
            currBad = (bitind >> 16) & 0x0000FFFF;
            bitind = EZ_CELL_VAL( EZX, dx, EZY, dy, 3u );  
            currT1 = bitind & 0x0000FFFF;
            currT2 = (bitind >> 16) & 0x0000FFFF;

        } 




            // Get the spawning type of the offending entity
            //      TODO take into account the spawn type if it's valiud
            //   AND also do the self damage if it's a '3' and it subtracts
            //var spawningSummin: u32 = EZ_STORAGE[ 16u + ent_start + (entityType * ent_chunk) ];


 

        pPrior = EZ_RAND_U( pPrior + EZX*171 + counter + EZY*134 ) % 256; 
    }
    // EMPTY and no one moving on to you... carry on nothingness somehow....
    else{
        // entity is already set,
        // teamNumber already went up
        // cpuHook already set? if it needs to be ....
        // snapExps is already set 
        nextMove = 4u;//is the same (4)
        //  nextSpawn is already set
        //  pPrior is already set
        //currGood, and currBad, and currT1, and currT2 shoudlnt matter what they are
    }
}

// YOU ARE ENTITY ==========================================================
//---------------------------------------
//          YOU are an ENTITY    Maybe Move   vs.  Maybe Stay
else{
    var allowedToTransform: u32 = 9990u;
    // Good to set new move 
    //      FINAL VERDICT: ->           // For setting new movement intention
    // FoR SETTING A NEW NEXT MOVE 
    // next move is stationary so its open to being set
    // the spot u are going to has no other INTENTIONS going there, and is an OPEN SLOT ( 0u )  
    // and the special random hit your frequency
    if( bestMoveInd != 4u && 
        nextMove == 4u &&
        // otherIntentionsOnGoal == 0u && <- this is factored into calcualting bestMoveInd
        (tesr%myFreq == 0u) ){
        // "entityType" is already set
        // "teamNumber" is already set
        // "cpuHook" is already set
        // "snapExps" is already set
        nextMove = bestMoveInd;

        // TODO set the nextSpawn here; Part 1
        // potentilNxtSpwn
        nextSpawn = potentilNxtSpwn;

        

        // CHECK TO DEPOSIT 
        
        // pPrior is already set
        // currGood, and currBad, and currT1, and currT2 are already set

        // Movement not happening so u can take into account ur transformations
        allowedToTransform = 1u;
    }

    // Will activate the movement you have SET -> 
    // You are going somwhere AND 
    //      iT is STILL good to move there
    else if( nextMove != 4u && (immintDestEntity & 1u) > 0 && movConflicts == 1u && uGotLowPrio == 0u ){ // Intension to move is still valid?
        

        // TODO 
        // Account for u are simply SPAWNING and not MOVING yourself
        if( nextSpawn > 0u ){

            // Keep yourself here, and simply DECREASE the POINTS for this one here
            // and take the MAX from  the effected point slot 



            // "entityType" is already set 
            // "teamNumber" is already set
            // "cpuHook" is already set
            // "snapExps" is already set
            
            // "hiLiteTag" is already set
            // "lastCmdDetail" is already set

            //Good
            if( nextSpawn == 1u ){      // subtract this guy
                currGood = currGood - ((goodBadMax >> 0) & 0x0000FFFF);
                // TODO CHECK TO SEE IF OVERAGE HERE - how is guarenateed this will never be negative?
            }
            else if( nextSpawn == 2u ){
                currBad = currBad - ((goodBadMax >> 16) & 0x0000FFFF);
            }
            else if( nextSpawn == 3u ){
                currT1 = currT1 - ((transMax >> 0) & 0x0000FFFF);
            }
            else if( nextSpawn == 4u ){
                currT2 = currT2 - ((transMax >> 16) & 0x0000FFFF);
            }
            sfx_whichTrigg = nextSpawn;// for sfx tracking

            nextMove = 4u;
            nextSpawn = 0u;// reset this part

            
        }
        // You are not spawning anything you are moving...
        // TODO add the -every drop here
        else{
            entityType = dropVal;//0u;
            // teamNumber = 0u;  is already set
            if(dropVal < 1u){
                teamNumber = 0u;    // dont set a team to nothing
            }
            cpuHook = 0u;
            //snapExps is already set
            nextMove = 4u;
            nextSpawn = 0u;
            // pPrior is already set
            hiLiteTag = 0u;
            lastCmdDetail = 0u;

            currGood = 0u;
            currBad = 0u;
            currT1 = 0u;
            currT2 = 0u; 
        }


        allowedToTransform = 0u; // Then set this flag to instill the transform
    }

    // YoU have to STAY - your movment was cancelled BUT ur other stats accumualte
    else{
        // "entityType" is already set 
        // "teamNumber" is already set
        // "cpuHook" is already set
        // "snapExps" is already set
        // "nextSpawn" is already set
        nextMove = 4u;// reset it back to nuffin agian - your move was cancelled
        nextSpawn = 0u; // shouldnt be necessary but good practice
        // pPrior is already set
        // hiLiteTag is laready set
        // lastCmdDetail is laready set
        // currGood, and currBad, and currT1, and currT2 are already set
        // Movement not happening (CANCELLED) so u can take into account ur accumulated value
        allowedToTransform = 1u;
    }






    // Now apply transformation (if any)
    if( allowedToTransform == 1u ){

                // TODO - also apply the "resultMode"   (255, 255, 255, 255) here - and wait for next hook to discharge 

            // ALSO only if the result is you are not spawning 

            //TODO check on this :
            //   but dont have to do anything here i think

        // if( potentilNxtSpwn > 0u &&  ){ 
        // } 
        // if( ((resultMode >> (8*(0))) & 0x000000FF) == 1u ){  
        // }

    // These variables set to death when dead 
        // "teamNumber" is already set   // set to death w
        // hiLiteTag = 0;// in the case of death maybe set these to 0? probs not just keep it consitnece
        // lastCmdDetail = 0;// in the case of death maybe set these to 0? probs not just keep it consitnece

        if( deathYes == 1u ){       // IT"S OWN IF-STATEMENT BECAUSE IT OVERRIDES IT
            // NOTE IN THE DEVLOG::: Death channel has NO SPWAN option - it always transforms itself...
            entityType = ( badGoodResult >> 16 ) & 0x0000FFFF;
            //"teamNumber" is already set       // TODO verify this is the correct thing to do 
            //"cpuHook" is already set          // TODO verify this is the correct thing to do 
            //"snapExps" is already googd   
            //cpuHook = 0u;                     // <- idk>?
            
            // else{
            // }        // these vals are already set! no woirse

            nextMove = 4u;
            nextSpawn = 0u;
            // pPrior is already set

            currGood = 0u;
            currBad = 0u;
            currT1 = 0u;
            currT2 = 0u;
            sfx_whichTrigg = 2;
        }
        else if( (goodYes==1 || trans1Yes==1 || trans2Yes==1) && potentilNxtSpwn < 1u ) {   // AND the spawning is 0
            // TODO carry over values if it's a result type that is just SPAWNING and not transforming,,,?
            
            currGood = 0u;
            currBad = 0u;
            currT1 = 0u;
            currT2 = 0u; 

            //"teamNumber" is already set        // TODO verify this is the correct thing to do 
            //"cpuHook" is already set        // TODO verify this is the correct thing to do 
            // snapExps is set...
            nextMove = 4u; 
            nextSpawn = 0u;                   
            // "pPrior" is already set
            //"hiLiteTag" is already set 
            //"lastCmdDetail" is already set 


            if( goodYes==1 ){
                entityType = ( badGoodResult >> 0 ) & 0x0000FFFF;
                sfx_whichTrigg = 1;
            }
            else if( trans1Yes==1 ){
                entityType = ( transResult >> 0 ) & 0x0000FFFF;
                sfx_whichTrigg = 3;
            }
            else if( trans2Yes==1 ){
                entityType = ( transResult >> 16 ) & 0x0000FFFF;
                sfx_whichTrigg = 4;
            }
        }

        // THIS IS DONE AT THE END -  if no entity - take awaay it's entity val
        //else{}  <- I think just kee things hwo they were
        if(entityType==0){
            teamNumber = 0u;
            cpuHook = 0u;
            hiLiteTag = 0u;
            lastCmdDetail = 0u;
        }
    }
 
}





// If there's any more than one contender it nulls the movement anyways
// from the other guys perpectivce


// TODO here:
// GRAB SCENT PROFILE + DAMAGE PROFILE and EVALUATE THE NEW SCENTS WITH THE NEW LOCATION
// AND UPDATE THE SCENTS THIS FRAME HERE - WITH THE NEW ENTITY VALUES 



var crvl: u32    = 0u;              // CUrrent scent val looking at 
var tmpcrvl: u32 = 0u;              // Current holding val for the contender for lwoestscent

// FIND THE HIGHEST SCENT AND SUB 
i = 0u;
loop {
    if i >= 8*4*SCSLTS { break; }   // each neigb, a scent(255)x4,    scent slots
    bitind = i / (8*4);             // which ring (refer to docs)
    di = i / 4;                     // which ind from inScents
    iw = bitind*4u + i%4;                     // 0 to 15 scents = in the outscents

    crvl = inScents[ di ];          // Get the entire u32 represeting the scents from this direction//EZ_CELL_VAL( EZX, dx, EZY, dy, 2u );
    crvl = ( crvl >> (8u*(i%4)) ) & 0x000000FF;     // Starts at FF and .. FF000000  <-then loops around for next scent slot 
    tmpcrvl = outScents[ iw ];
    if( crvl > tmpcrvl ){
        outScents[ iw ] = crvl;
    }
    i = i + 1u;
}




// BASED ON NEW entity on this cell :::
// NOW DO THE SCENTS - UDPATED

    scentId = EZ_STORAGE[ 3u + ent_start + (entityType * ent_chunk) ]; 
// CANT BE:::   entityType  because this changed possibly from the thing

scentId = (scentId >> 0) & 0x0000FFFF; 

bitind = 0u;    // re-used for scent decay
crvl = 0u;      // re-used for scent emitt
tmpcrvl = 0u;


i = 0u;
loop {               
    if i >= TTL_OUTS { break; }
    if( i % 4 == 0u ){  // Update which scent storage memory thing to get - split up for some reason (dumb)
        if( i > 15){    // THE LAST 16  - (AUGMENTED SCENT VISION, EXPL)
            bitind =    EZ_STORAGE[ 8u + ((i-16u)/4u) + sct_start + (scentId * sct_chunk) ];  // The entries in a scent profile for aug values (DECAY)
            crvl =      EZ_STORAGE[ 10u + ((i-16u)/4u) + sct_start + (scentId * sct_chunk) ];  // The entries in a scent profiel (EMISSION)
        }
        else{
            bitind =    EZ_STORAGE[ 0u + (i/4u) + sct_start + (scentId * sct_chunk) ];  // The first 4 entries in a scent profile (DECAY)
            crvl =      EZ_STORAGE[ 4u + (i/4u) + sct_start + (scentId * sct_chunk) ];  // The 4-7 entries in a scent profiel (EMISSION)
        }
    }

    // APPLY decay
    tmpcrvl = ( bitind >> (8u*(i%4)) ) & 0x000000FF;
    if( tmpcrvl > outScents[ i ] ){
        outScents[ i ] = 0u;    // down to zero
    }
    else{
        outScents[ i ] = outScents[ i ] - tmpcrvl;      // subtract the deacay
    }

    // APPLY emission (+/or if ALLEGIANCEd physics tag)
    tmpcrvl = ( crvl >> (8u*(i%4)) ) & 0x000000FF;      //-(((THIS IS THE OVERRIDE AREA WHERE TEAM SCENT GETS INJUECTED)))
    if( teamNumber > 0u && i < 16u && i > 11u){                           // REALLLY U G L Y   Code  but gotta check for team
        if(teamNumber-1u == i - 12u){
            tmpcrvl = 255;    
        }
        //tmpcrvl = tmpcrvl | (0x000000FFu << u32(((teamNumber)%4u) * 8u));
    }
    if( tmpcrvl > 0 && outScents[ i ] < tmpcrvl ){  // and dont down grade the emission
        outScents[ i ] = tmpcrvl;    // set it to the amount u gotta output
    }




    i = i + 1u;
}
 



// PUT THIS SOMEHWERE ELSE I GUESS, BUT THIS IS WHERE U COLLECT THE FUNC values 
i = 0u;
var fhelper: u32 = 0u;  // func calculaturoe helper  
var divHelper: u32 = 0u;    // becomes the scent calu 
loop {                              // Goes 0-7 (inclusive)
    if i >= 16*8 { break; }   // for each Fjoos get the 8 neihbours and update the func jooses
    di = (i%8) + ((i%8)/4u);        // Which way look around (0 - 7 SKIPS 4!(SELF))
    bitind = i / 8u;                 // Which scent mem slot to be compiling (0 - 16)
  

    dx = -1 + i32(di%3u);           // X Value
    dy = -1 + i32(di/3u);           // Y Value
    fhelper = EZ_CELL_VAL( EZX, dx, EZY, dy, FUNCINDX_STRT + (bitind / 8u) );
    fhelper = ( fhelper >> (4u*(bitind%8)) ) & 0x0000000F;

    if(fhelper > funcScents[ bitind ]){
        funcScents[ bitind ] = fhelper;
    }

    // Should be the last one in the thing
    if( i%8==7 ){  // now that u have the biggest val, subtract it down
        if( funcScents[ bitind ]>0u ){
            funcScents[ bitind ] = funcScents[ bitind ] - 1;
        }

        // Get new emit ememory slot?
        if(bitind%8==0){
            tmpcrvl = EZ_STORAGE[ 12u + (bitind/8u) + sct_start + (scentId * sct_chunk) ];
        }

        divHelper = ( tmpcrvl >> (4u*(bitind%8)) ) & 0x0000000F;// GET EMISSION VALUE FOR f jouce
        if( divHelper > 0u ){
            funcScents[ bitind ] = divHelper;   // set the emission value
        }
    }
    

    i = i + 1u;
}







// 0:  SET 
var myState: u32 = 0u;
myState = (entityType & 0x0000FFFF) | ((teamNumber & 0x000000FF) << 16) | ((cpuHook & 0x0000000F) << 24 ) | ((snapExps & 0x0000000F) << 28);

// 1: REMOVED THE bufferind 1 because furhter manpulation from user input is posible

// 2:    Good bad points 
currGood = currGood | ((currBad & 0x0000FFFF) << 16);

// 3:    Trans1 trans2 points
currT1 = currT1 | ((currT2 & 0x0000FFFF) << 16);

// 4: SCENTS
    // Path finding Jooces
EZ_STATE_OUT[ EZ_CELL_IND + SLTINDX_STRT * EZ_TOTAL_CELLS ] = 
    (outScents[0] & 0x000000FF) |
    ((outScents[1] & 0x000000FF) << 8) |
    ((outScents[2] & 0x000000FF) << 16) |
    ((outScents[3] & 0x000000FF) << 24);

EZ_STATE_OUT[ EZ_CELL_IND + (SLTINDX_STRT+1u) * EZ_TOTAL_CELLS ] = 
    (outScents[4] & 0x000000FF) |
    ((outScents[5] & 0x000000FF) << 8) |
    ((outScents[6] & 0x000000FF) << 16) |
    ((outScents[7] & 0x000000FF) << 24);
    
EZ_STATE_OUT[ EZ_CELL_IND + (SLTINDX_STRT+2u) * EZ_TOTAL_CELLS ] = 
    (outScents[8] & 0x000000FF) |
    ((outScents[9] & 0x000000FF) << 8) |
    ((outScents[10] & 0x000000FF) << 16) |
    ((outScents[11] & 0x000000FF) << 24);
    
// QUICK override 
//          THIS is really ugly code but i just gotta use this to override the team jooses here
//          if allegianced to a team, i guess  emit that scent?

EZ_STATE_OUT[ EZ_CELL_IND + (SLTINDX_STRT+3u) * EZ_TOTAL_CELLS ] = 
    (outScents[12] & 0x000000FF) |
    ((outScents[13] & 0x000000FF) << 8) |
    ((outScents[14] & 0x000000FF) << 16) |
    ((outScents[15] & 0x000000FF) << 24);


// Augmented jooses
EZ_STATE_OUT[ EZ_CELL_IND + (SLTINDX_STRT+4u) * EZ_TOTAL_CELLS ] = 
    (outScents[16] & 0x000000FF) |
    ((outScents[17] & 0x000000FF) << 8) |
    ((outScents[18] & 0x000000FF) << 16) |
    ((outScents[19] & 0x000000FF) << 24);
    
EZ_STATE_OUT[ EZ_CELL_IND + (SLTINDX_STRT+5u) * EZ_TOTAL_CELLS ] = 
    (outScents[20] & 0x000000FF) |
    ((outScents[21] & 0x000000FF) << 8) |
    ((outScents[22] & 0x000000FF) << 16) |
    ((outScents[23] & 0x000000FF) << 24);

// Function jooooces
EZ_STATE_OUT[ EZ_CELL_IND + (FUNCINDX_STRT+0u) * EZ_TOTAL_CELLS ] = 
    (funcScents[0] & 0x0000000F) |
    ((funcScents[1] & 0x0000000F) << 4) |
    ((funcScents[2] & 0x0000000F) << 8) |
    ((funcScents[3] & 0x0000000F) << 12) |
    ((funcScents[4] & 0x0000000F) << 16) |
    ((funcScents[5] & 0x0000000F) << 20) |
    ((funcScents[6] & 0x0000000F) << 24) |
    ((funcScents[7] & 0x0000000F) << 28);
    
EZ_STATE_OUT[ EZ_CELL_IND + (FUNCINDX_STRT+1u) * EZ_TOTAL_CELLS ] = 
    (funcScents[8] & 0x0000000F) |
    ((funcScents[9] & 0x0000000F) << 4) |
    ((funcScents[10] & 0x0000000F) << 8) |
    ((funcScents[11] & 0x0000000F) << 12) |
    ((funcScents[12] & 0x0000000F) << 16) |
    ((funcScents[13] & 0x0000000F) << 20) |
    ((funcScents[14] & 0x0000000F) << 24) |
    ((funcScents[15] & 0x0000000F) << 28);



var bufferInd0: u32 = EZ_CELL_IND + 0u * EZ_TOTAL_CELLS;
var bufferInd1: u32 = EZ_CELL_IND + 1u * EZ_TOTAL_CELLS;

var bufferInd2: u32 = EZ_CELL_IND  + 2u * EZ_TOTAL_CELLS;
var bufferInd3: u32 = EZ_CELL_IND  + 3u * EZ_TOTAL_CELLS;
 




// Calculate the offset in the window and then the SFX

var minX: u32 = min( ((u32(EZ_USER_INPUT[7]) ) % EZ_CELLS_ACROSS_X), ((u32(EZ_USER_INPUT[7]) + EZ_SFX_SIZE) % EZ_CELLS_ACROSS_X) );
var maxX: u32 = max( ((u32(EZ_USER_INPUT[7]) ) % EZ_CELLS_ACROSS_X), ((u32(EZ_USER_INPUT[7]) + EZ_SFX_SIZE) % EZ_CELLS_ACROSS_X) );

var minY: u32 = min( ((u32(EZ_USER_INPUT[8]) ) % EZ_CELLS_ACROSS_Y), ((u32(EZ_USER_INPUT[8]) - EZ_SFX_SIZE - 0) % EZ_CELLS_ACROSS_Y) );
var maxY: u32 = max( ((u32(EZ_USER_INPUT[8]) ) % EZ_CELLS_ACROSS_Y), ((u32(EZ_USER_INPUT[8]) - EZ_SFX_SIZE - 0) % EZ_CELLS_ACROSS_Y) );

var insideX: u32 = 0;
var insideY: u32 = 0;

// Wrap track is smaller
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
    if(EZX >= minX && EZX < maxX){
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
    if(EZY >= minY && EZY < maxY){
        insideY  = 1;
    }
    else{
        insideY = 0;
    }
}

// Yes youre a cell on the inside of the sound buffer
if( insideX == 1 && insideY == 1 ){
    //myState = 7;
    // Temporary x,y values

    // Wrap case.. for x value
    if( (EZ_CELLS_ACROSS_X-maxX)+minX < maxX-minX ){
        //bitind = //EZ_CELLS_ACROSS_X - EZX ((u32(EZ_USER_INPUT[7]) ) % EZ_CELLS_ACROSS_X) + ( EZX );
        if(EZX >= maxX){
            bitind = EZX - maxX;    // set to the little part 
        }
        else{
            bitind = EZX + (EZ_CELLS_ACROSS_X - maxX);
        }
    }
    else{
        bitind = EZX - minX;//((u32(EZ_USER_INPUT[7]) ) % EZ_CELLS_ACROSS_X);
    }
    
    // // Wrap case for y value
    if( (EZ_CELLS_ACROSS_Y-maxY)+minY < maxY-minY ){
        if(EZY < minY){
            crvl = minY - EZY;// + maxY;    // set to the little part 
        }
        else{
            crvl = (EZ_CELLS_ACROSS_Y - EZY) + minY;//(EZY - minY);// + (EZ_CELLS_ACROSS_Y - maxY);
        }
    }
    else{
        crvl = EZ_SFX_SIZE - ( EZY - minY);// ((u32(EZ_USER_INPUT[8]) ) % EZ_CELLS_ACROSS_Y);
        //crvl = crvl + 26;
    }

    //myState = ( bitind + EZ_SFX_SIZE*crvl) % 34; //<-for mapping
 
    // if( EZX == 1){
    //     myState = 4u;
    // }


    if( sfx_whichTrigg > 0 ){   // Normal 1,2,3,4 channel sfx trigggers
        EZ_SFX[bitind + crvl*EZ_SFX_SIZE] = (sfx_whichTrigg << 16) | sfx_startingEnt;//entityType;
    }
    else if(sfx_startingEnt != entityType && sfx_startingEnt == 0){    // Big step on special one
        EZ_SFX[bitind + crvl*EZ_SFX_SIZE] = (5 << 16) | entityType;
    }
    else if(sfx_startingTemNum != teamNumber && sfx_startingSteppable < 1u ){    // TEAM CONVERSION s[ecoa; trogger]
        EZ_SFX[bitind + crvl*EZ_SFX_SIZE] = (6 << 16) | entityType;
    }
    else{
        EZ_SFX[bitind + crvl*EZ_SFX_SIZE] = 0 | entityType;
    }
}





// Get the min max of the input coordinattres
minX = min( u32(EZ_USER_INPUT[0]),  u32(EZ_USER_INPUT[2]));
maxX = max( u32(EZ_USER_INPUT[0]),  u32(EZ_USER_INPUT[2]));
minY = min( u32(EZ_USER_INPUT[1]),  u32(EZ_USER_INPUT[3]));
maxY = max( u32(EZ_USER_INPUT[1]),  u32(EZ_USER_INPUT[3]));

insideX = 0;
insideY = 0;

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



if( EZ_USER_INPUT[6] > 0){
    if( insideX ==1 && insideY==1 ){
        // The case where the cell is in the bounding box of the user's click drag
        if( EZ_USER_INPUT[4] == 1){
            EZ_STATE_OUT[ bufferInd0 ] = myState;
            if( teamNumber > 0u ){  // if part of an old team
                hiLiteTag = 1u;
            }
            EZ_STATE_OUT[ bufferInd2 ] = currGood; 
            EZ_STATE_OUT[ bufferInd3 ] = currT1; 
        }
        // else if( EZ_USER_INPUT[4] == 2){
        //     // TODO iNSERT SAFE PLACE HERE.......
        //     // CHECK IF high enough vision and team scent (how do u know which team ?!)
        //     EZ_STATE_OUT[ bufferInd0 ] = myState;
        //     if( teamNumber > 0u ){
        //         hiLiteTag = 0u;
        //     }
        //     EZ_STATE_OUT[ bufferInd2 ] = currGood; 
        //     EZ_STATE_OUT[ bufferInd3 ] = currT1; 
        // }
        else if( EZ_USER_INPUT[4] == 3 || EZ_USER_INPUT[4] == 2){
            var safeQuard: u32 = 0;
            if( EZ_USER_INPUT[4] == 2 ){
                // TODO need to check for vision, correct
            }
            // IF DRAWING NOTHING - then auto set the team 
            if( u32(EZ_USER_INPUT[5]) > 0){
                cpuHook = 0;
                snapExps= 0;
                EZ_STATE_OUT[ bufferInd0 ] = u32(EZ_USER_INPUT[5]) | ( (last_team_sel & 0x000000FF) << 16 ) | ((cpuHook & 0x0000000F) << 24 ) | ((snapExps & 0x0000000F) << 28 ); // ADD FLAG IF      // Lat thing you clicked
            }
            else{ 
                EZ_STATE_OUT[ bufferInd0 ] = 0u; // just kille verything
            }
            
            nextMove = 4u;
            //EZ_STATE_OUT[ bufferInd1 ] = 4u;    // (stationary)
            hiLiteTag = 0u;
            lastCmdDetail = 0u;

            // Reset the good / bad, traasm1. tams 2popinmts
            EZ_STATE_OUT[ bufferInd2 ] = 0u;
            EZ_STATE_OUT[ bufferInd3 ] = 0u;
        }
        
        // Take a 'snapshot' by marking the 4 most signifcaint bits in  memory slot 0
        else if( EZ_USER_INPUT[4] == 4){
            snapExps = 15u; // MARK HIGHEST 
            myState = (entityType & 0x0000FFFF) | ((teamNumber & 0x000000FF) << 16) | ((cpuHook & 0x0000000F) << 24 ) | ((snapExps & 0x0000000F) << 28);
            EZ_STATE_OUT[ bufferInd0 ] = myState;

            EZ_STATE_OUT[ bufferInd2 ] = currGood; 
            EZ_STATE_OUT[ bufferInd3 ] = currT1; 
        }
        else{
            EZ_STATE_OUT[ bufferInd0 ] = 0;     // and coincenidenly sets the cpu hook and team to 0
            nextMove = 4u;
            //EZ_STATE_OUT[ bufferInd1 ] = 4u;    // (stationary)
            // Reset the good / bad, traasm1. tams 2popinmts
            EZ_STATE_OUT[ bufferInd2 ] = 0u;
            EZ_STATE_OUT[ bufferInd3 ] = 0u;

        }
    }
    else{
        EZ_STATE_OUT[ bufferInd0 ] = myState; 
        // EZ_STATE_OUT[ bufferInd1 ] = nextMove;
        hiLiteTag = 0u;
        EZ_STATE_OUT[ bufferInd2 ] = currGood; 
        EZ_STATE_OUT[ bufferInd3 ] = currT1; 
    }
}
else{
    EZ_STATE_OUT[ bufferInd0 ] = myState;
    // EZ_STATE_OUT[ bufferInd1 ] = nextMove;
    // hiLiteTag = 0u;
    EZ_STATE_OUT[ bufferInd2 ] = currGood; 
    EZ_STATE_OUT[ bufferInd3 ] = currT1; 
}




// 1:  SET this last spot in memory after 
// the highlighting possibilities have been checked + clicking off
//      nextMove
nextMove = nextMove | ((nextSpawn & 0x0000000F) << 4);  // smoosh next move back otegerh
EZ_STATE_OUT[ bufferInd1 ] = nextMove | ((pPrior & 0x000000FF) << 8) | ((hiLiteTag & 0x000000FF) << 16) | ((lastCmdDetail & 0x000000FF) << 24);

