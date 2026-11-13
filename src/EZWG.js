// webgpu-ca.js

//const global = typeof window !== 'undefined' ? window : null;
// Correctly detect the global object in both environments (Node.js and browser)
const global = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : null);

const ssr = global === null;

// Save a couple of long function names that are used frequently.
// This optimization saves around 400 bytes.
const addEventListener = 'addEventListener';
const removeEventListener = 'removeEventListener';
const getBoundingClientRect = 'getBoundingClientRect';

// CellularAutomataConfig class definition      //used:  https://highlight.hohli.com/?theme=github
class EZWG {


    static ALL_ZERO = 0
    static ALL_RANDS = 1
    static ALL_BINS = 2

    // THE LENGTH OF A DAY, in sim steps (16384 = 18.2 real minutes at 15 ticks/sec).
    // The one copy: this.stepsPerDay is it, the fragment prelude bakes it as DAY_LEN,
    // and CL.MOON_TIMER_DAY_TIME / _NIGHT_TIME (util/ents_consts.js) split it into the
    // moon timer's day and night halves.
    // The sim never sees the time of day - the moon timer keeps to it by counting its
    // own ticks from step 0 - so change it here and the timer's halves follow.
    static STEPS_PER_DAY = 1024*16

    // The camera's ease-out (PAN_FLING_DAMP) is quoted per 50ms of real time.
    // updateCameraForFrame() measures its dt in these, so the camera keeps
    // scrolling at the same real-world speed no matter what the sim rate is set to.
    static PAN_TUNED_MS = 50

    // TRACKER CAM: how much of the remaining distance to the highlighted units the
    // camera closes per PAN_TUNED_MS. 0.06 works out to roughly 70% of the way
    // there over a second - a drift, not a snap. Higher = tighter/twitchier.
    static TRACKER_CAM_EASE = 0.06

    //  ──────────  GRAB PAN (right button = a hand on the map)  ──────────
    // The pan is POSITIONAL: the world cell you pressed on stays pinned under the
    // cursor until you let go, whatever the zoom does in between. These three only
    // shape what happens AFTER the release.
    //
    //   FLING   how much of the throw is kept when the button comes up.
    //           0 = dead stop the instant you release (the old behaviour).
    //   DAMP    fraction of the glide's speed that survives each PAN_TUNED_MS.
    //           THE ONE THAT DECIDES HOW FAST IT STOPS. Lower = shorter tail.
    //   SMOOTH  how much of the previous frame's velocity survives per
    //           PAN_TUNED_MS while measuring the throw. Higher = a steadier
    //           reading, so one stuttery frame at the end can't define the flick;
    //           too high and a quick flick is over before it is measured.
    //   STOP    speed (cells per PAN_TUNED_MS) below which the glide is over.
    //           Without it the camera creeps forever on a float that never zeroes.
    //           0.02 is about a tenth of a cell of travel still owed at this
    //           DAMP - dropping it costs nothing anyone can see.
    //
    // Scale to tune against: a glide coasts  dt/(1 - DAMP^dt)  times the distance
    // the hand covered in its last PAN_TUNED_MS - about 3.7x at DAMP 0.75, where
    // it was 12x at 0.92. Halving the distance is the smaller half of what that
    // does; the tail also goes from ~3.5s of invisible creep down to under a
    // second, which is the part that reads as the camera actually STOPPING.
    static PAN_RELEASE_FLING = 0.5
    static PAN_FLING_DAMP = 0.75
    static PAN_FLING_SMOOTH = 0.4
    static PAN_FLING_STOP = 0.02

    // How far, in screen px from where it was grabbed, a right-button drag has to
    // carry the map before it counts as the player moving the camera - the CAM_PAN
    // input (THE CAMERA PAN, AS AN INPUT). A right click that wobbles a pixel or
    // two is not a look around.
    static PAN_INPUT_MIN_PX = 24

    //  ──────────  ARROW-KEY PAN (a throttle, not a nudge)  ──────────
    // The arrow keys used to add PAN_SPEED cells to the camera per KEYDOWN, so the
    // map jumped a fixed distance per key repeat: harsh, tied to the OS repeat rate
    // (and to the gap before it starts), and the same distance whether a cell was 4
    // screen px across or 32. They now ease the camera up to a top speed and hand
    // the release over to the same coast-to-stop glide a thrown grab-pan uses.
    //
    //   TOP_PX_PER_SEC  top speed in SCREEN pixels per second. Cells per second is
    //                   this DIVIDED BY the current px-per-cell, which is what
    //                   makes it proportional to zoom: the map slides under the eye
    //                   at one constant speed, so zoomed out (4 px/cell) it covers
    //                   4x the cells that native zoom (16) does, and the map stays
    //                   a sensible number of seconds wide at every scale.
    //   ACCEL           fraction of the gap to top speed closed per PAN_TUNED_MS.
    //                   0.35 is ~0.25s up to speed - long enough to read as
    //                   acceleration, short enough that a tap still moves.
    //
    // The stop is PAN_FLING_DAMP / PAN_FLING_STOP: letting an arrow up is letting
    // go of the map, and it should feel like letting go of a drag.
    static KEY_PAN_TOP_PX_PER_SEC = 900
    static KEY_PAN_ACCEL = 0.35

    constructor( config = {}, specialLiveInputOverride ={}) {
 

        // Define default values
        const defaults = {
            BUFFER_TYPE: 'f32',
            STORAGE_TYPE: 'f32',
            CELL_VALS: 1,
            CHUNK_SIZE: 64,
            CHUNKS_ACROSS: 1,
            PARTS_ACROSS: 1,
            READ_BACK_FREQ: -1,
            CONTAINER_ID: 'putcahhere',
            RAND_SEED: 's'+Date.now() + "L" + Math.random(),
            STARTING_CONFIG: EZWG.ALL_ZERO,
            COMPUTE_WGSL: '',
            FRAGMENT_WGSL: '',
            BY_PIXEL: false,    // if this is true run the fragment shader from the perspective of each pixel instead of WidthxHeightxTriangles
            READ_BACK_FUNC: ( currentStep, entireBuffer ) => {},
            SFX_HANDLER_FUNC: ( currentStep, entireBuffer, lastBuffer ) => {},
            SAVE_META_FUNC: null,   // ( atStep, observedThroughStep ) => a plain object of game meta to ride along in the save file
            LOAD_META_FUNC: null,   // ( meta ) => called with whatever came back out of one
            PASS_INPUT_FUNC: null,  // ( step, liveInput ) => READ-ONLY look at exactly what pass `step` is about to read
            CELL_SIZE: 8,
            AUTO_RESIZE_CANVAS: false,  // canvas tracks the window instead of sitting at monitor size
            //  experimental right now
                FRAG_PIXEL_MODE: false, // if true, it's a fragment shader, and every pixel gets the fragment code run on it
                //FRAG_PIXEL_PER_COMP: 1,  // how many pixels per comp used in FRAG MODE ONLY 
            STORAGE: null,//(new Float32Array(0)),
            WORKGROUP_SIZE: 5,      // normally i leave it at 8 but it causes this weird flashing bug sometimes - could be a WebGPU bug
            STARTING_BUFFER: []     // if it's empty it will make a default random or all zeros or something
        };

        // Overrider 
        this.slio = specialLiveInputOverride;
        // Merge defaults with the provided config
        this.config = { ...defaults, ...config };
 
        // Assign values to instance variables with type checks
        this.BUFFER_TYPE = this.config.BUFFER_TYPE;
        this.STORAGE_TYPE = this.config.STORAGE_TYPE;
        // this.STORAGE_TYPE = ''+this.BUFFER_TYPE;

        this.CELL_VALS = this._validatePositiveInteger(this.config.CELL_VALS, 'CELL_VALS');
        this.CHUNK_SIZE = this._validatePositiveInteger(this.config.CHUNK_SIZE, 'CHUNK_SIZE');
        this.CHUNKS_ACROSS = this._validatePositiveInteger(this.config.CHUNKS_ACROSS, 'CHUNKS_ACROSS');
        this.PARTS_ACROSS = this._validatePositiveInteger(this.config.PARTS_ACROSS, 'PARTS_ACROSS');
        this.READ_BACK_FREQ = this._validateInteger(this.config.READ_BACK_FREQ, 'READ_BACK_FREQ');
        this.CONTAINER_ID = this._validateNonEmptyString(this.config.CONTAINER_ID, 'CONTAINER_ID');
        this.RAND_SEED = this._validateNonEmptyString(this.config.RAND_SEED, 'RAND_SEED');
        this.STARTING_CONFIG = this._validateInteger(this.config.STARTING_CONFIG, 'STARTING_CONFIG');
        this.COMPUTE_WGSL = this._validateString(this.config.COMPUTE_WGSL, 'COMPUTE_WGSL');
        this.FRAGMENT_WGSL = this._validateString(this.config.FRAGMENT_WGSL, 'FRAGMENT_WGSL');
        this.READ_BACK_FUNC = this.config.READ_BACK_FUNC;
        this.SFX_HANDLER_FUNC = this.config.SFX_HANDLER_FUNC;

        // The engine does not know or care what the game keeps outside the cell
        // grid - it only knows how to carry it. See THE SAVE FILE META TRAILER.
        this.SAVE_META_FUNC = this.config.SAVE_META_FUNC;
        this.LOAD_META_FUNC = this.config.LOAD_META_FUNC;

        // ...and what each pass is handed, for game state that is decided off
        // the inputs themselves (THE OBJECTIVES in index2.html). See the call in
        // run(), right under the input log.
        this.PASS_INPUT_FUNC = this.config.PASS_INPUT_FUNC;

        // The meta for the save currently in flight, frozen to a STRING at the
        // bottom of that same tick's readback handler - NOT when the grid copy is
        // encoded, which is a tick's worth of observations too early. Never a live
        // object. See THE META IS FROZEN AFTER THIS TICK'S READBACK in run() and
        // freezePendingSaveMeta().
        this.pendingSaveMetaJson = null;
        this.CELL_SIZE = this._validatePositiveInteger(this.config.CELL_SIZE, 'CELL_SIZE');
        this.AUTO_RESIZE_CANVAS = this.config.AUTO_RESIZE_CANVAS === true;

        this.FRAG_PIXEL_MODE =  this.config.FRAG_PIXEL_MODE;
            this.FRAG_PIXEL_PER_COMP = 1;   // defualt is 1 and it's not specifiable from the constructor it gets generated
        // If it's not an EVEN fit of parts into cell size then make a noise about it cause it's weird
        if( this.FRAG_PIXEL_MODE ){
            // 
            if( this.CELL_SIZE % this.PARTS_ACROSS !== 0 ){
                throw new Error("when in FRAG_PIXEL_MODE: this.PARTS_ACROSS does not fit evenly in this.CELL_SIZE | " + this.PARTS_ACROSS + " " + this.CELL_SIZE)
            }
            else{
                this.FRAG_PIXEL_PER_COMP = Math.floor( this.CELL_SIZE / this.PARTS_ACROSS );
                if( this.FRAG_PIXEL_PER_COMP !== 1){
                    //throw new Error("ummm zoom wouldnt really work if this was anything other than 1 | this.FRAG_PIXEL_PER_COMP: " + this.FRAG_PIXEL_PER_COMP + " ")
                }
            }
        }
        else{
            throw new Error("Stimmings 2 needs fragment mode now... | this.FRAG_PIXEL_MODE: " + this.FRAG_PIXEL_MODE + " ")
        }

        //this.FRAG_PIXEL_PER_COMP = this._validatePositiveInteger(this.config.FRAG_PIXEL_PER_COMP, 'FRAG_PIXEL_PER_COMP');

        this.STORAGE = this.config.STORAGE;         //this._validateArray(this.BUFFER_TYPE, this.config.STORAGE, 'STORAGE');
        this.WORKGROUP_SIZE = this._validatePositiveInteger(this.config.WORKGROUP_SIZE, 'WORKGROUP_SIZE');


        // OVerride for safe execution


        this.STARTING_BUFFER = this.config.STARTING_BUFFER;
        this.STORAGE_SIZE = this.STORAGE ? this.STORAGE.length : 0;     // this._validatePositiveInteger(this.config.STORAGE_SIZE, 'STORAGE_SIZE');

        
 
        // if(this.STORAGE.length < 2){
        //     this.STORAGE; 
        //     if( this.BUFFER_TYPE === 'f32' ){
        //         this.STORAGE = new Float32Array( this.STORAGE_SIZE)
        //         if( this.STARTING_CONFIG === EZWG.ALL_RANDS){
        //             this.initTheInitialCellStateAllRand( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
        //         }
        //         else if( this.STARTING_CONFIG === EZWG.ALL_BINS){
        //             this.initTheInitialCellStateAllRandBins( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
        //         }
        //         else{//if( this.STARTING_CONFIG === EZWG.ALL_ZERO){
        //             this.initTheInitialCellStateAllZeros( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
        //         }
        //     }
        //     // U32 disabled for now but we gotta get back to this
        //     else if( this.BUFFER_TYPE === 'u32' && false){
        //         this.STORAGE = new Uint32Array( this.STORAGE_SIZE );//[1.0, 1.0, 1.0, 1.0 ]); 
        //     } 
        //     for(let v = 0;v < this.STORAGE.length;v++){ 
        //         if(v < this.STORAGE_SIZE ) {
        //             this.STORAGE[v] = this.random();
        //         }
        //         else if(true){
        //             this.STORAGE[v] = this.random();
        //         }
        //     }
        // }


        // Game time specific variables
        //128 x 128
        this.GRID_SIZE = (this.CHUNK_SIZE * this.CHUNKS_ACROSS);

        // ── THE DRAWING BUFFER ──────────────────────────────────────────────
        // How many pixels the fragment shader is actually asked to shade. These
        // are a STARTING size only when AUTO_RESIZE_CANVAS is on - from init()
        // onward the canvas follows the window and these follow the canvas (see
        // resizeCanvasToWindow). Nothing else in the engine reads them.
        //
        // Without AUTO_RESIZE_CANVAS this stays what it always was: a canvas the
        // size of the MONITOR, with the window clipping off whatever does not
        // fit. That costs a full-screen worth of fragment shader no matter how
        // small the window is.
        this.render_canv_w =screen.width;//1024;//1600;//this.GRID_SIZE * this.CELL_SIZE;
        this.render_canv_h =screen.height;//1024;//900;//1536;//this.GRID_SIZE * this.CELL_SIZE;

        this.resizeHandler = null;      // window 'resize', rAF-coalesced
        this.resizeQueued = false;

        let goodArea = -1;
        for(let n = 2;n < 9;n++){
            if( this.GRID_SIZE % n === 0 ){
                goodArea = n;
            }
        }
        if( goodArea < 0 ){
            throw new Error("no good owkrpgrup size could be foind for GRID_SIZE: "+ this.GRID_SIZE)
        }
        else{
            this.WORKGROUP_SIZE = goodArea
        }


        this.TOTAL_CELLS = this.GRID_SIZE * this.GRID_SIZE
        this.UPDATE_INTERVAL = 55

        // ── SUB-FRAME RENDERING ──────────────────────────────────────────────
        // The SIM ticks once per UPDATE_INTERVAL. The PICTURE gets drawn
        // RENDERS_PER_TICK times inside that same window, each with a different
        // liveInput[17] (0..n-1), so the fragment shader can slide an entity part of
        // the way toward the cell the compute pass has already decided it is
        // stepping into, and so pan/zoom (which the sim never reads) keep up with
        // the mouse at the full 60/sec.
        //
        // These two are placeholders - the game sets them from CL.SIM_TICKS_PER_SECOND
        // and CL.RENDER_SUBFRAMES (util/ents_consts.js), which is also where the
        // fragment shader gets its copy of the sub-frame count. Change them THERE.
        this.RENDERS_PER_TICK = 3;
        this.INTERP_PHASE = 0;          // which draw of the tick is on screen
        this.subFrameTimers = [];       // pending draws for phases 1..n-1

        // 512 = the shared slots (0..PLAYER_INPUT_BASE-1), one block of
        // PLAYER_INPUT_STRIDE per team after them, and the step counter in the last
        // slot. It was 256 when only one player could reach the sim. See THE PLAYER
        // INPUT BLOCKS by INPUT_SLOT_RENDER_ONLY for the layout.
        this.USER_INPUT_BUFFER_SIZE = 512;

        this.MULTIPLAYER_MODE = false;  //<- only contorls .. idk
        this.CHEATS_ENABLED = true;     //<- allows the '3' key to be used

        // ⚠ 128 x 129, NOT 128 x 128. The compute shader writes the window's rows
        // as crvl = 1 .. 128 (crvl = EZ_SFX_SIZE - (EZY - minY)) and the CPU reads
        // them the same way ((sfxY + 1) * 128), so row 0 is never written and row
        // 128 is the window's bottom row. With 128*128 that bottom row was the
        // first 128 words of the CENSUS slice: two invocations stored to the same
        // word every tick, the winner undefined, and the census - relic finds
        // included - came out depending on where the CAMERA was. One more row, and
        // the window owns every word it writes.
        this.SFX_BUFFER_SIZE_LENGTH = 128;
        this.SFX_BUFFER_SIZE = this.SFX_BUFFER_SIZE_LENGTH * ( this.SFX_BUFFER_SIZE_LENGTH + 1 );

        // ── MAP CENSUS ──────────────────────────────────────────────────────────
        // A second region bolted onto the back of the SFX readback buffer (same
        // copy, same map, one handler - the SFX word window is nowhere near the
        // 128KB/tick that would make a separate buffer worth it).
        //
        // The SFX window only ever shows the 128x128 patch under the pan, so the
        // CPU has never been able to see the WHOLE map. The census fixes that by
        // sweeping it: every tick the compute shader dumps CENSUS_ROWS complete
        // rows of att 0 (SLOT0 - entityType + team/cpuHook/snap) here, walking the
        // map top to bottom, so after CENSUS_PASS_TICKS ticks every cell has been
        // seen exactly once. Nothing is instantaneous - it is a slow rolling
        // picture, which is all a tile count needs.
        this.CENSUS_PASS_TICKS = 64;                                        // ticks for one full sweep of the map
        this.CENSUS_ROWS = Math.ceil( this.GRID_SIZE / this.CENSUS_PASS_TICKS );  // rows dumped per tick (1024/64 = 16)
        this.CENSUS_CELLS = this.CENSUS_ROWS * this.GRID_SIZE;              // u32s of cell data per tick
        this.CENSUS_OFFSET = this.SFX_BUFFER_SIZE;                          // where the census starts in the buffer
        this.CENSUS_HEADER_INDEX = this.CENSUS_OFFSET + this.CENSUS_CELLS;  // +1 u32: which slice this actually is
        this.CENSUS_TOTAL = this.CENSUS_CELLS + 1;

        // -- RELIC DROP VERDICT --------------------------------------------------
        // FOUR more u32s on the back of the same readback, one per team: the
        // compute shader's answer to "did that relic drop actually take?". A drop
        // is a REQUEST (the RELIC_* slots of that team's player input block) and
        // the shader is the only thing that knows whether the target cell passed
        // the same safe-placement gate everything else does - so before this word
        // existed the CPU spent the relic and never found out it had been thrown
        // away. Team T's answer is at RELIC_VERDICT_INDEX + (T-1), so four
        // players dropping on the same tick never share a word.
        //
        // STICKY, deliberately: the shader writes it only on the tick a drop is
        // processed and NOTHING ever clears it. That is what makes it survive
        // the readback skipping ticks (READ_SFX_BUFFER_BUSY, saves, loads) - the
        // CPU is not racing to catch a one-frame pulse. RELIC_SEQ carries a
        // sequence number that the shader echoes back into the top byte, and the
        // CPU handles a word only when that byte is one it has not seen; a
        // re-read of the same verdict is therefore free and silent.
        //
        // WORD LAYOUT (unpacked in SFX_HANDLER_FUNC in Ex9_Stimmings2.js):
        //      bits  0-15  the relic entity id that was requested
        //      bits 16-23  verdict  1 = placed, 2 = cell occupied (or a lower
        //                           team built on it this same tick),
        //                           3 = unsafe ground for THIS team
        //                           (4 = no session team - old saves only)
        //      bits 24-31  the sequence number from that team's RELIC_SEQ slot
        this.RELIC_VERDICT_TEAMS = 4;
        this.RELIC_VERDICT_INDEX = this.CENSUS_HEADER_INDEX + 1;

        // -- WHERE THE KINGS ARE -------------------------------------------------
        // FOUR more u32s on the back of the same readback, one per team: the cell
        // that team's king is standing in this tick, written by that cell itself.
        // Team T's word is at KING_POS_INDEX + (T-1), so teams 1..4 and nothing
        // for team 0 - a neutral king belongs to no player and has no memorial to
        // keep (the undead abode blueprint, 31_22_undeadabodedecay14344, puts one
        // on the map, and it must never be able to claim a team's slot).
        //
        // WHY NOT THE CENSUS. The sweep only visits a given row once every
        // CENSUS_PASS_TICKS (64), so a king walking across the map would be found
        // roughly four seconds late and in the wrong place. This is each king
        // saying where he is, every tick, for the cost of one word each.
        //
        // Written at the BOTTOM of the compute shader, next to the census slice,
        // which means entityType/teamNumber have already been through the move and
        // transform blocks - so the cell reported is the one the king ENDS this
        // tick in, not the one he started it in.
        //
        // ── AND WHY THAT MAKES A GRAVESTONE PROVABLE ────────────────────────
        // Status 2 is not "there is a gravestone here". It is "the king who was
        // standing on THIS cell when the tick began is a gravestone now" - the
        // shader tests the cell's own type at the top of the tick against its type
        // at the bottom, which is a provenance test no amount of looking at a
        // finished grid can reproduce. A player who builds an ent_king_gravestone
        // was never a king at the top of any tick, so no built one can ever write
        // this word, and no built one can ever be mistaken for a death.
        //
        // That is also why this cannot be done by handing the CPU's idea of the
        // king's cell back to the shader through EZ_USER_INPUT. The readback SKIPS
        // TICKS (READ_SFX_BUFFER_BUSY, saves, loads), so anything derived from it
        // and fed back into a compute pass would make the simulation depend on
        // when a buffer copy happened to land - which is exactly the determinism
        // this engine is built to keep. The provenance test stays GPU-side, in the
        // one invocation that already knows both answers for free.
        //
        // STICKY, like the relic verdict: nothing ever clears these. Once a king
        // has died his team's word holds status 2 forever, because no king form of
        // that team is left alive to overwrite it - which is exactly the "forever
        // fixated on the gravestone" behaviour the CPU wants. The CPU latches the
        // death per team anyway (currentKingTracks in index2.html), so it never
        // has to trust the staleness, and an ADMIN-placed replacement king cannot
        // un-kill the old one.
        //
        // ⚠ THE DEATH WORD IS THE ONLY RECORD OF WHICH GRAVE IS REAL. A gravestone
        // sitting on a loaded grid looks identical to a built one, so this fact
        // cannot be recomputed after the fact and MUST ride in the save's meta
        // trailer (currentKingTracks / currentKingDeaths). Losing it does not
        // degrade the memorial, it fabricates a different one.
        //
        // WORD LAYOUT (unpacked in SFX_HANDLER_FUNC in Ex9_Stimmings2.js):
        //      bits  0-9   cell X   (0 .. GRID_SIZE-1)
        //      bits 10-19  cell Y
        //      bits 20-22  team number  (1-4, the king's own allegiance)
        //      bits 23-24  status  0 = never written (buffer is still zeroed)
        //                          1 = the living king is stood here
        //                          2 = the king died HERE, this is his real grave
        //
        // ⚠ 10 bits per axis, so this stops being big enough at GRID_SIZE > 1024.
        // The shader masks rather than clamps, so it would wrap silently. If the
        // grid ever grows, split it into two words rather than stealing the team
        // bits - the CPU needs the team to colour the memorial.
        //
        // ONE WRITER PER WORD, BY CONSTRUCTION - see KING POSITION GOES OUT in
        // stimmings_compute.wgsl for the argument (a king that dies cannot also
        // have moved, so the living-king case and the death case can never both
        // fire for one team in one tick).
        this.KING_POS_TEAMS = 4;
        this.KING_POS_INDEX = this.RELIC_VERDICT_INDEX + this.RELIC_VERDICT_TEAMS;

        // -- WHAT SHAPE THE KINGS ARE IN -----------------------------------------
        // THREE more u32s per team, right behind the king words: which form that
        // team's king is wearing and how full his channels are, for the KINGS
        // panel on the left of the screen (THE KINGS PANEL in index2.html). Team
        // T's three start at KING_VITALS_INDEX + 3*(T-1).
        //
        // Written by the SAME cell, in the SAME branch, as that team's king word
        // (KING POSITION GOES OUT in stimmings_compute.wgsl), so the one-writer
        // argument above covers these as well, and they are sticky the same way:
        // after a death they hold the gravestone the king became, forever. The
        // CPU only believes them while the king word says status 1.
        //
        // The form cannot come off the census either - he changes form for a few
        // ticks every time he uses Q or E, and he has to be read in the form he is
        // wearing NOW. And it cannot be read off the window: that is the 128x128
        // patch under the camera, and three of the four kings are not in it.
        //
        // Read-out only. Nothing in a compute pass reads EZ_SFX, so these can
        // never reach the sim, a replay or a save.
        //
        // WORD LAYOUT (unpacked in SFX_HANDLER_FUNC in Ex9_Stimmings2.js):
        //      +0  bits  0-15  the king's entityType - one of KING_FORMS
        //      +1  bits  0-15  currGood    (his faith, in the three king forms)
        //          bits 16-31  currBad     (damage taken - health is bad max minus this)
        //          ...which is attribute 2 of his cell, exactly as it is written out.
        //      +2  bits  0-15  currT1      (drives a ONE_WAY animation's frame - his
        //          bits 16-31  currT2       Q sprout regrowing - so the panel can draw
        //                                   the frame the map is drawing). Attribute 3.
        this.KING_VITALS_TEAMS = 4;
        this.KING_VITALS_WORDS = 3;
        this.KING_VITALS_INDEX = this.KING_POS_INDEX + this.KING_POS_TEAMS;

        // -- WHAT THE EYE DROPPER LANDED ON --------------------------------------
        // FOUR more u32s, one per team, behind the king vitals: what was in the
        // cell that team's last ONE-CELL eye dropper click landed on - a click with
        // TOOL 1 whose two corners are the same cell, the click the inspector opens
        // a card for. Team T's word is at INSPECT_INDEX + (T-1).
        //
        // For the objective that teaches the inspector (A Closer Look, THE
        // OBJECTIVES in index2.html): it pays a relic for clicking SOMETHING, and
        // what is in a cell is only known on the GPU. The inspector's own card is
        // read off the 128x128 window, which sits under the CAMERA - and the camera
        // is not in the input log, so a replay looking somewhere else reads some
        // other cell, or none. This word is written by the cell the CLICK names,
        // and the click is in the log.
        //
        // One writer: the single invocation whose cell that is, in the select
        // branch of the click block (THE FOUR PLAYERS in stimmings_compute.wgsl).
        // Nothing clears it, so it carries a STAMP - the step of the pass that read
        // the click. SFX_HANDLER_FUNC is handed step + 1, so a word stamped with
        // (that - 1) is a click this very pass acted on, and any other stamp is an
        // older click read again.
        //
        // Read-out only, like everything on EZ_SFX - no compute pass reads it.
        //
        // WORD LAYOUT (unpacked in SFX_HANDLER_FUNC in Ex9_Stimmings2.js):
        //      bits  0-15  the entity in the cell, as the click found it (0 = Nothing)
        //      bits 16-31  the step of the pass that read the click, low 16 bits
        this.INSPECT_TEAMS = 4;
        this.INSPECT_INDEX = this.KING_VITALS_INDEX + this.KING_VITALS_TEAMS * this.KING_VITALS_WORDS;

        // -- WHAT THE BUILDER PUT DOWN -------------------------------------------
        // FOUR more u32s, one per team, behind the eye dropper words: the last
        // time that team's builder click (TOOL 2 - build mode, b or 5) actually
        // laid a blueprint. Team T's word is at BUILD_INDEX + (T-1).
        //
        // For the objective that teaches building (Groundbreaker, THE OBJECTIVES in
        // index2.html). A build click is a REQUEST: the shader lays a blueprint
        // only on the cells this team may build on (its own scent, lit, empty, not
        // taken by a lower team this tick) and nothing else ever says which of the
        // cells under the drag took one. So the cells that did, write it here.
        //
        // MANY WRITERS, ONE VALUE. Every cell of the line that takes a blueprint
        // writes this team's word, and every one of them writes the same 32 bits -
        // the click's entity and this pass's step, both read off the same input -
        // so whichever lands last, the word is the same. Stamped and never cleared,
        // read exactly like the eye dropper's.
        //
        // Read-out only - no compute pass reads EZ_SFX.
        //
        // WORD LAYOUT (unpacked in SFX_HANDLER_FUNC in Ex9_Stimmings2.js):
        //      bits  0-15  the entity the blueprints will become (the click's ENT)
        //      bits 16-31  the step of the pass that laid them, low 16 bits
        this.BUILD_TEAMS = 4;
        this.BUILD_INDEX = this.INSPECT_INDEX + this.INSPECT_TEAMS;

        // words bolted on after the census header: one relic verdict per team,
        // then one king word per team, then three king vitals words per team, then
        // one eye dropper word per team, then one builder word per team
        this.SFX_EXTRA_TOTAL = this.RELIC_VERDICT_TEAMS + this.KING_POS_TEAMS
                             + this.KING_VITALS_TEAMS * this.KING_VITALS_WORDS
                             + this.INSPECT_TEAMS + this.BUILD_TEAMS;

        this.loaded = false;

        // ── PAUSE ────────────────────────────────────────────────────────────
        // Pausing is a SIM-TICK boundary event, never a mid-tick one. The tick
        // loop calls tick() at the same rate whether the game is paused or not;
        // all `paused` decides is whether that tick is allowed to spend a
        // compute pass. Everything the sim can see is therefore still a function
        // of (step, the input snapshot taken in run()) and of nothing else -
        // pausing, unpausing, panning and single-stepping cannot change it. See
        // the PAUSE / SINGLE STEP block above run().
        //
        //      paused          nothing steps unless a step is asked for
        //      pauseRequested  pause pressed mid-tick, lands at the next tick
        //      stepRequested   an input arrived that the sim has to see; the
        //                      NEXT tick spends one compute pass on it. Held as
        //                      a flag rather than run() being called on the spot
        //                      so that key auto-repeat, a mouse-up and a gamepad
        //                      button all collapse into at most one step per
        //                      tick - the sim can never run faster than its own
        //                      clock, however hard the input is mashed.
        this.paused = false;
        this.pauseRequested = false;
        this.stepRequested = false;
        this.resumeGlide = false;
        this.stepGlideEndsAt = 0;
        this.pausedRedrawQueued = false;
        this.pausedAnimOn = false;
        this.PAUSE_CHANGED_FUNC = null;     // index2.html hangs the UI off this

        this.placeByTheRules = true;

        this.GPUName = '';

        this.READ_BUFFER_BUSY = false;
        this.READ_SFX_BUFFER_BUSY = false;

        this.WANTING_TO_SAVE = false;
        this.CURRENTLY_SAVING = false;

        // ── THE DEFERRED SAVE META ──────────────────────────────────────────
        // A save's meta trailer is frozen AFTER that same tick's sfx/census
        // readback has been handled, not when the grid copy is encoded - see THE
        // META IS FROZEN AFTER THIS TICK'S READBACK in run(). These carry the
        // request from the one place to the other, and the promise is what the
        // download callback waits on, so it can never assemble a file around a
        // trailer that has not been taken yet. (pendingSaveMetaJson itself is
        // declared up with SAVE_META_FUNC, where the engine takes it in.)
        this.pendingSaveMetaWanted = false;
        this.pendingSaveMetaAtStep = 0;
        this.saveMetaReady = null;
        this.saveMetaReadyResolve = null;

        // The last step whose sfx/census readback the CPU actually received AND
        // handled to the end. -1 until the first one lands. This is the honest
        // answer to "what does the CPU know?", and it is what gets stamped into a
        // save's trailer so a loaded world can tell whether that trailer is level
        // with its own grid or behind it.
        this.lastObservedStep = -1;

        // ── THE READBACK IS NOT OPTIONAL ────────────────────────────────────
        // Set when a tick was computed and its sfx/census readback never reached
        // the CPU - a rejected mapAsync (device lost, buffer destroyed) or an
        // exception thrown out of SFX_HANDLER_FUNC part way through the census
        // walk. It STOPS THE SIM, and it has to:
        //
        // the shader deletes a collected relic on the pass AFTER the census read
        // its row, whether or not the CPU got that copy (COLLECTED BY THE CPU
        // CENSUS in stimmings_compute.wgsl). One more pass and those relics are
        // off the map and were never credited to anybody - a silent, permanent
        // discrepancy between what the world did and what the player has. There
        // is no way to ask for that slice again (it would mean re-running pass S)
        // and no way to gate the shader on a CPU acknowledgement without feeding
        // readback timing into a compute pass, which is the one thing determinism
        // forbids. So the rule is: a tick the CPU did not see is never followed by
        // another tick.
        //
        // A save is still allowed through, so the world can be rescued into a
        // file; resumePlay() refuses.
        this.READBACK_LOST = false;

        // ── THE INPUT LOG - EVERY INPUT THE SIMULATION EVER SAW ─────────────
        // One entry per tick on which any sim-visible slot of liveInput changed,
        // in the form [ step, slot, value, slot, value, ... ]. Ticks where the
        // player did nothing cost nothing at all, which is what keeps an hour of
        // play down to a few thousand entries instead of 54,000.
        //
        // Taken at the ONE instant that matters: immediately before the
        // writeBuffer that hands liveInput to the compute pass, and after the
        // render-only slots have been zeroed. So the log is by construction
        // exactly what the shader read, not an approximation of what the player
        // did - a key that was pressed and released between two ticks never
        // reached the sim and is not in here either.
        this.INPUT_LOG = [];
        this.INPUT_LOG_PREV = ( new Float32Array( this.USER_INPUT_BUFFER_SIZE ) ).fill( 0 );
        this.INPUT_LOG_RECORDING = true;

        // Playback. REPLAY_LIVE is the running reconstruction of every sim slot,
        // rebuilt by walking the deltas forward, and it is written over liveInput
        // wholesale each tick - so playback is AUTHORITATIVE: even if a stray live
        // input got past the UI lock, it cannot reach the pass.
        this.REPLAY_LOG = null;
        this.REPLAY_INDEX = 0;
        this.REPLAY_LIVE = null;
        this.REPLAY_LAST_STEP = -1;
        this.REPLAY_ACTIVE = false;
        this.REPLAY_DONE_FUNC = null;

        // THE WISDOM MARKERS - see THE WISDOM MARKER further down. One per team,
        // index T-1 for team T. WISDOM_MARKERS[i] is the marker standing in this
        // world ({ x, y, team, ticksLeft }, or null), WISDOM_PRESSES[i] the 'r' or
        // 'f' that team's player pressed last that no compute pass has seen yet
        // ({ x, y } for an 'r', { remove: true } for an 'f', or null). Both belong
        // to THIS world, so a new map, a portal and a replay all start with neither.
        this.WISDOM_MARKERS = [ null, null, null, null ];
        this.WISDOM_PRESSES = [ null, null, null, null ];

        // THE CAMERA PANS - see THE CAMERA PAN, AS AN INPUT further down. One per
        // team: true once a right-button drag has moved that team's camera with
        // king mode off, until a compute pass has been handed it.
        this.CAMERA_PANS = [ false, false, false, false ];

        // THE SPECIAL MOMENTS - see THE SPECIAL MOMENT, AS AN INPUT further down.
        // One per team: true once that team's player has pressed '9', until a
        // compute pass has been handed it.
        this.MOMENT_PRESSES = [ false, false, false, false ];

        // How many times a failed sfx/census map has been retried for the CURRENT
        // tick. Reset on every success. See mapSfxReadback().
        this.SFX_MAP_RETRIES = 0;

        this.READ_BACK_STEP = 0; // increases every time a SUCCESSFUL read back is performed

        this.soundToggled = true;

        this.step = 0;
        this.suicide = false;
        this.stepsPerDay = EZWG.STEPS_PER_DAY;

        this.canvas = null;
        this.context = null


        this.userInputTempStorage = null
        this.userIn_uniformBuffer = null
        this.simulationPipeline = null
        this.bindGroups = []

        this.cellStateArray = []

        this.device = null
        this.cellPipeline = null
        this.vertexBuffer = null
        this.vertices = []              // will end up being the square you draw over and over again (TODO look and see if drawing 2 triangle everytime for each thing

        this.cellStateStorageForRead = []
        this.cellSfxBufferForReadOnCPU = []

        this.cellStateStorage = []

 

        this.CELL_STIM_LOCATIONS = 4;  


        // this.dragStartX = -1
        // this.dragStartY = -1
        // this.isDragging = false;
        // this.LAST_CELL_X = -1
        // this.LAST_CELL_Y = -1

        this.liveInput = ( new Float32Array( this.USER_INPUT_BUFFER_SIZE ) ).fill(0);

        // Every team's block starts NEUTRAL - eye dropper in hand, standing still
        // - whether or not anybody ever drives it. A block nobody touches is then
        // a player doing nothing, rather than a player holding WASD direction 0
        // (down-left) at whatever their selection is.
        for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
            this.resetPlayerBlock( t );
        }

        if( this.slio && typeof this.slio.stepLater === 'number' ){
            this.liveInput[ this.USER_INPUT_BUFFER_SIZE-1 ] = this.slio.stepLater;
        }
        this.liveInput[ EZWG.VIEW_SLOT_TOOL ] = 1; // selection mode - the tool the overlay draws

        this.liveInpuUniform = ( new Float32Array( this.USER_INPUT_BUFFER_SIZE ) ).fill(0);
        this.lastKeyDetected = '';
        this.ezweb = {
            // lastSeenMouseX: 0,
            // lastSeenMouseY: 0,
            shownerShip: false,
            isDragging: false,
            CELL_SIZE: this.CELL_SIZE,
            GRID_SIZE: this.GRID_SIZE,

            liveDragX: 0,       // The last lcoatiuon of
            liveDragY: 0,

            grabNextBp: false,  // If set to true: use the next 4 variables to grab the snapshot from the Sfx buffer
            // (The next 4 variables)
            gpGrabStartX: 0,
            gpGrabStartY: 0,
            gpGrabEndX: 0,
            gpGrabEndY: 0,

            dragStartX: 0,
            dragStartY: 0,
            dragEndX: 0,
            dragEndY: 0,
            LAST_CELL_X: 0,
            LAST_CELL_Y: 0,

            CELL_PAN_IS_GOING: false,
            CELL_PAN_START_X: 0.0,      // canvas px where the grab started
            CELL_PAN_START_Y: 0.0,
            CELL_PAN_REPORTED: false,   // this grab is already in CAMERA_PANS (noteGrabPanMoved)

            CELL_PAN_CURR_X: 0.0,       // canvas px the cursor is at right now
            CELL_PAN_CURR_Y: 0.0,

            // The world point (in cells, y-UP, same space as CELL_FLOAT) that the
            // grab is holding. The camera is solved from this every drawn frame, so
            // zooming mid-drag keeps the same cell under the cursor for free.
            CELL_PAN_GRAB_X: 0.0,
            CELL_PAN_GRAB_Y: 0.0,

            CELL_FLOAT_X: 0.0,
            CELL_FLOAT_Y: 0.0,

            CELL_VEL_X: 0.0,
            CELL_VEL_Y: 0.0,

            // ARROW-KEY PAN: which way the arrow keys are currently asking the
            // camera to go, -1/0/+1 per axis, in CELL_FLOAT space (y is UP).
            // Held STATE, not an event - the acceleration happens per drawn frame
            // in updateCameraForFrame(), so how long a key is down is what decides
            // how far the map moves, not how often the OS repeats it.
            KEY_PAN_X: 0,
            KEY_PAN_Y: 0,

            // The release glide belongs to the arrow keys until it has spent
            // itself. Paused, this is the only thing that can tell an arrow throw
            // (which still has frames owed to it) from a stale velocity.
            KEY_PAN_GLIDING: false
          };
  
    }

    killdeath(){

        this.suicide = true;
        this.cancelSubFrames();

        // A grab pan holds document-level listeners; a load would otherwise leave
        // them pointing at a dead instance's canvas. Same for the window resize
        // handler - it would go on resizing a canvas that is about to be removed
        // from the dom, and drawing with a device that is about to be null.
        this.ezweb.CELL_PAN_IS_GOING = false;
        this.detachGrabPanListeners();
        this.detachResizeListener();
        window[ removeEventListener ]( 'mouseup', this.windowMouseUpHandler, true );
        window[ removeEventListener ]( 'mousemove', this.windowMouseMoveHandler, true );

        if (this.device) {
            this.vertexBuffer?.destroy();
            this.cellStateStorage?.forEach(buffer => buffer?.destroy());
            this.userInputTempStorage?.destroy();
            this.userIn_uniformBuffer?.destroy();
            this.sfxBuffer?.destroy();
            this.cellStateStorageForRead?.destroy();
            this.cellSfxBufferForReadOnCPU?.destroy();
            this.device = null;
            this.context = null;

            // Remove canvas
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

    async init() {
        if (!('gpu' in navigator)) {
            document.addEventListener('DOMContentLoaded', () => this._createNoWebGPUCanvas());
        }
        else{
            await this.getInsideThere()
        }
        // Additional initialization logic for WebGPU compatible environments
    }

    // Method to validate positive integers
    _validatePositiveInteger(value, propertyName) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
            throw new Error(`${propertyName} must be a positive integer`);
        }
        return value;
    }
    // Method to validate positive integers
    _validateInteger(value, propertyName) {
        if ( !Number.isInteger(value) ) {
            throw new Error(`${propertyName} must be a   integer`);
        }
        return value;
    }
    // Method to validate non-empty strings
    _validateNonEmptyString(value, propertyName) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error(`${propertyName} must be a non-empty string`);
        }
        return value;
    }
    // Method to validate non-empty strings
    _validateString(value, propertyName) {
        if (typeof value !== 'string' ) {
            throw new Error(`${propertyName} must be a non-empty string`);
        }
        return value;
    }
    // Method to validate array
    _validateArray(bufrtype, value, propertyName) {
        if( bufrtype === 'f32'){
            if ( value instanceof Float32Array ) {
                throw new Error(`${propertyName} must be an array of f32 val`);
            }
        }
        else if( bufrtype === 'u32' ){
            if ( value instanceof Uint32Array ) {
                throw new Error(`${propertyName} must be an array of u32 val`);
            }
        }
        return value;
    }


    // Method to create a canvas if WebGPU is not supported
    _createNoWebGPUCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.context.fillStyle = 'gray';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.font = `${20}px Arial`;

        let offsetX = 0;
        let offsetY = 0;

        document.getElementById(this.CONTAINER_ID).appendChild( this.canvas )
        
        setInterval(
            ((wobj) => {
                
                const text = 'no web gpu detected';
                const fontSize = 300;
                wobj.context.clearRect(0, 0, wobj.canvas.width, wobj.canvas.height);
                wobj.context.fillStyle = 'gray';
                wobj.context.fillRect(0, 0, wobj.canvas.width, wobj.canvas.height);
    
                function pseudoRandom(x, y, t) {
                    // A simple pseudo-random function
                    return Math.sin(x * 12.9898 + y * 78.233 + t * 0.5) * 43758.5453 % 1;
                }
                
                for (let i = 0; i < wobj.canvas.height / fontSize; i++) {
                    for (let j = 0; j < wobj.canvas.width / fontSize; j++) {
                        const pulse = Math.sin((wobj.step + (i + j) * 100) / 500) * 0.5 + 0.5;
                        wobj.context.fillStyle = `rgba(255, 0, 0, ${pulse})`;
                
                        const angle = (wobj.step / 1000) % (2 * Math.PI);
                        
                        // Add deterministic randomness
                        const offsetX = (pseudoRandom(i, j, wobj.step) - 0.5) * 10; // Adjust the multiplier for more/less spread
                        const offsetY = (pseudoRandom(i + 1, j + 1, wobj.step) - 0.5) * 10; // Adjust the multiplier for more/less spread
                
                        const x = j * fontSize + offsetX;
                        const y = i * fontSize + fontSize + offsetY;
                
                        wobj.context.save();
                        wobj.context.translate(x, y);
                        wobj.context.rotate(angle);
                        wobj.context.fillText(text, -wobj.context.measureText(text).width / 2, 0);
                        wobj.context.restore();
                        wobj.step++
                    }
                }
                
    
                offsetX += 1;
                offsetY += 1;
                if (offsetX > wobj.canvas.width) offsetX = 0;
                if (offsetY > wobj.canvas.height) offsetY = 0; 
                
            })(this), 
             50 );

        //requestAnimationFrame(drawText);
    }

    async getPreferredAdapter() {
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });
    
        if (!adapter) {
            console.error('No WebGPU adapters found.');
            return null;
        }
    
        // Check if the adapter matches the desired vendor (NVIDIA is 0x10DE)
        const adapterInfo = await adapter.requestAdapterInfo();
    
        if (adapterInfo.vendor === 0x10DE) { // NVIDIA vendor ID
            console.log("NVIDIA adapter selected:", adapterInfo.name);
            return adapter;
        } else {
            console.warn("Using non-NVIDIA adapter:", adapterInfo.name);
            return adapter; // Fallback to the adapter we got
        }
    }


    // The loading logic, buckle up
    async getInsideThere(){

        // let highestadapter = await this.getPreferredAdapter();
        // console.log("highestadapter");
        // console.log(highestadapter)

 
        // Navigator i guess?
        if (!navigator.gpu) {
            // document.getElementById("ucantplay").classList.remove("hidden");
            // document.getElementById("canvas2hide").classList.add("hidden");
            this._createNoWebGPUCanvas()
            throw new Error("WebGPU not supported on this browser.");
        }
        else{
            console.log('isogsodo')
        }

        const adapter = await navigator.gpu.requestAdapter({  powerPreference: 'high-performance' });//await this.getPreferredAdapter();//
        if (!adapter) {
            this._createNoWebGPUCanvas()
            throw new Error("No appropriate GPUAdapter found.");
        }
        else{
            console.log('is good')
        } 
        
        console.log(adapter)
        
        const maxBufferSize = adapter.limits.maxBufferSize;
		const maxStorageBufferBindingSize = adapter.limits.maxStorageBufferBindingSize;
		console.log("maxBufferSize", maxBufferSize, "maxStorageBufferBindingSize", maxStorageBufferBindingSize);

		// Try to get more detailed info if the API exists, otherwise fall back
		let gpuLabel = 'Unknown GPU';

		if ('requestAdapterInfo' in adapter) {
			try {
				const info = await adapter.requestAdapterInfo();
				// vendor / architecture / description may or may not be present
				const parts = [
					info.vendor,
					info.architecture,
					info.device || info.description
				].filter(Boolean);
				if (parts.length > 0) {
					gpuLabel = parts.join(' ');
				}
			} catch (e) {
				console.warn('adapter.requestAdapterInfo() failed or not allowed:', e);
			}
		}

		this.GPUName = gpuLabel + " | max:" + maxBufferSize;

 
        this.canvas = document.createElement('canvas'); 

        
		this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        // A PRESS HAS TO START ON THE MAP, BUT IT CAN END ANYWHERE. Only the
        // mousedown is on the canvas - a HUD element over the map takes the press
        // just by being pointer-events:auto. The release and the drag tracking are
        // on the WINDOW, in the CAPTURE phase, so they run before any element's own
        // handler: no HUD element, today's or a future one, can stopPropagation()
        // them, and letting go over the HUD still ends (and sends) the map click.
        // Both handlers are gated on a drag the canvas started, so a press that
        // began on the HUD is never read as a map click when it comes up.
        this.windowMouseUpHandler = this.handleMouseUp.bind(this);
        this.windowMouseMoveHandler = this.handleMouseMove.bind(this);
        window[ addEventListener ]( 'mouseup', this.windowMouseUpHandler, true );
        window[ addEventListener ]( 'mousemove', this.windowMouseMoveHandler, true );
        this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this)); // Disable right-click context menu

        //this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this));


		this.canvas.width = this.render_canv_w;//this.GRID_SIZE * this.CELL_SIZE;
		this.canvas.height = this.render_canv_h;//this.GRID_SIZE *  this.CELL_SIZE
        // NOTE: there is deliberately NO css size on the canvas. Its layout size
        // is its attribute size, so one canvas pixel is one css pixel and the
        // mouse maths below (EZ_SCREEN_TO_CELL_*, which work in canvas pixels)
        // needs no scale factor. Give it a css width/height and every click goes
        // to the wrong cell. (Two lines here used to assign a bare NUMBER to
        // style.width/height, which is invalid css and was silently ignored -
        // they never did anything.)
        console.log(this.CONTAINER_ID)
        let daparent = document.getElementById(this.CONTAINER_ID)
        if( !daparent ) throw (new Error("The parent container with ID " + this.CONTAINER_ID+ "for EzWebGPU is not found"));
        daparent.appendChild(this.canvas)

        // Has to be after the append - the fit is MEASURED off the live element.
        if( this.AUTO_RESIZE_CANVAS ){ this.resizeCanvasToWindow(); }


 
		if (!adapter) { 
			throw new Error("No appropriate GPUAdapter found!!!!5545445");
		}
		//this.device = await adapter.requestDevice();
		this.device = await adapter.requestDevice({
            requiredLimits: {
                maxBufferSize: maxBufferSize,
                maxStorageBufferBindingSize: maxStorageBufferBindingSize,
              },
        }); 
		this.context = this.canvas.getContext("webgpu");
		const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
		this.context.configure({
			device: this.device,
			format: canvasFormat,
		});

        // configure() is sticky: it survives every later change of canvas.width /
        // canvas.height, and the swapchain texture getCurrentTexture() hands back
        // simply comes out at the new size. So resizing costs two assignments -
        // no reconfigure, no pipeline rebuild, no bind group rebuild. Attached
        // now that there is a device to read maxTextureDimension2D off.
        if( this.AUTO_RESIZE_CANVAS ){ this.attachResizeListener(); }

		const PUstructType = [
			{ name: "position", type: "vec3" },
			{ name: "color", type: "vec4" }
		];

        let smolr = 1
        if(this.FRAG_PIXEL_MODE){
            this.vertices = new Float32Array([  
                -smolr,     -smolr,  // Bottom-left
                smolr,      -smolr,  // Bottom-right
                -smolr,     smolr,  // Top-left
                -smolr,     smolr,  // Top-left
                smolr,      -smolr,  // Bottom-right
                smolr,      smolr,  // Top-right
             
            ]);
        }
        else{
            this.vertices = new Float32Array([ 
                // X,    Y
                //-1, -1, // Triangle 1
                //1, -1,
                //1,  1, 
                //-1, -1, // Triangle 2
                //1,  1,
                //-1,  1,
    
                -smolr*(1/this.PARTS_ACROSS), -smolr*(1/this.PARTS_ACROSS), // Triangle 1
                smolr*(1/this.PARTS_ACROSS), -smolr*(1/this.PARTS_ACROSS),
                smolr*(1/this.PARTS_ACROSS),  smolr*(1/this.PARTS_ACROSS), 
                -smolr*(1/this.PARTS_ACROSS), -smolr*(1/this.PARTS_ACROSS), // Triangle 2
                smolr*(1/this.PARTS_ACROSS),  smolr*(1/this.PARTS_ACROSS),
                -smolr*(1/this.PARTS_ACROSS),  smolr*(1/this.PARTS_ACROSS), 
            
                //// Front face
                //-1, -1, 1,  // Vertex 0
                //1, -1, 1,   // Vertex 1
                //1, 1, 1,    // Vertex 2
                //-1, 1, 1,   // Vertex 3 
                //// Right face
                //1, -1, 1,   // Vertex 4 (Same as Vertex 1 of Front face)
                //1, -1, -1,  // Vertex 5
                //1, 1, -1,   // Vertex 6
                //1, 1, 1,    // Vertex 7 (Same as Vertex 2 of Front face) 
                //// Top face
                //-1, 1, 1,   // Vertex 8 (Same as Vertex 3 of Front face)
                //1, 1, 1,    // Vertex 9 (Same as Vertex 2 of Front face)
                //1, 1, -1,   // Vertex 10
                //-1, 1, -1,  // Vertex 11
            ]);
        }
        
		// SWUARE DEFINTION
		const vertexBufferLayout = {
			arrayStride: 8,//  2 x 4 byte coordinates = 8
			attributes: [{
				format: "float32x2",//"uint16x4"  <- another possible config
				offset: 0,
				shaderLocation: 0, // Position. Matches @location(0) in the @vertex shader.
			}],
		};
		this.vertexBuffer = this.device.createBuffer({
			label: "Cell this.vertices",
			size: this.vertices.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});
		this.device.queue.writeBuffer( this.vertexBuffer, /*buffer offset :o*/0, this.vertices );
 














        // Create the bind group layout and pipeline layout.
		const bindGroupLayout = this.device.createBindGroupLayout({
			label: "Cell Bind Group Layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
					buffer: {} // Grid uniform buffer
				}, 
				{
					binding: 1,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
					buffer: { type: "read-only-storage" } // Cell state input buffer
				}, 
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: "storage" } // Cell state output buffer
				}, 
				{
					binding: 3,
					visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
					buffer: { type: "storage" } // user input
				}, 
				{
					binding: 4,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
					buffer: { type: "read-only-storage" } // large static block of config numbers
				},{
                    binding: 5,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT, // Make sure the visibility includes VERTEX
                    buffer: { type: "uniform" } // Change from 'storage' to 'uniform'
                },
                {
                    binding: 6,
					visibility: GPUShaderStage.COMPUTE,
                    buffer: { type: "storage" } // SFX audio buffer lffggg
                }
                //,
				//{
				//	binding: 5,
				//	visibility: GPUShaderStage.COMPUTE,
				//	buffer: { type: "storage" } // Cell state output buffer
				//}
			]
		});

		const pipelineLayout = this.device.createPipelineLayout({
			label: "Cell Pipeline Layout",
			bindGroupLayouts: [ bindGroupLayout ],
		});

        var cellShaderWSGL = '';
        
        // Normal vertices (clunky)


        // TODO the CURRENT_ZOOM  DOES NOT EFFECT VERTEX MODE 




            

        if( !this.FRAG_PIXEL_MODE ){
            cellShaderWSGL = `
                struct VertexOutput {
                    @builtin(position) position: vec4f,
                    @location(0) cell: vec2f,
                    @location(1) red: f32,
                    @location(2) grn: f32,
                    @location(3) blu: f32
                };

                @group(0) @binding(0) var<uniform> grid: vec2f;
                @group(0) @binding(1) var<storage> EZ_STATE_IN: array<${this.BUFFER_TYPE}>;
                @group(0) @binding(3) var<storage, read_write> EZ_USER_INPUT: array<f32>;
                @group(0) @binding(4) var<storage> EZ_STORAGE: array<${this.STORAGE_TYPE}>;
                //@group(0) @binding(5) var<uniform> EZ_USER_INPUT_UNFM: array<f32>;
                @group(0) @binding(6) var<storage, read_write> EZ_SFX: array<${this.BUFFER_TYPE}>;

                // Confines to a chunk location
                fn EZ_helper_cellIndexChkRel(cell: vec2u, ogcx: u32, ogcy: u32, chk: u32) -> u32 {
                    var nuCellX: u32 = cell.x + (ogcx*chk);
                    var nuCellY: u32 = cell.y + (ogcy*chk);
                    return ((nuCellY+u32(grid.y)) % u32(grid.y)) * u32(grid.x) + ((nuCellX+u32(grid.x)) % u32(grid.x));
                }

                // Use any X,Y, deltaX, deltaY, attribute
                fn EZ_CELL_VAL(x: u32, dx: i32, y: u32, dy: i32, att: u32 ) -> ${this.BUFFER_TYPE} {
                    var eex: u32 = u32(( i32(x) + dx) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                    var eey: u32 = u32(( i32(y) + dy) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                    var ocxx: u32 = u32( x / ${this.CHUNK_SIZE} );
                    var ocyy: u32 = u32( y / ${this.CHUNK_SIZE} );
                    return EZ_STATE_IN[ att * u32( grid.x * grid.y ) + EZ_helper_cellIndexChkRel( vec2( eex, eey ), ocxx, ocyy, ${this.CHUNK_SIZE}u )  ];
                }

                
                fn EZ_RAND( seed: u32 ) -> f32 {
                    let a: u32 = 1664525u;
                    var c: u32 = 1013904223u;
                    c = a * seed + c;
                    return f32(c & 0x00FFFFFFu)  / f32(0x01000000u);
                }
                fn EZ_U32_TO_VEC4(value: u32) -> vec4<u32> {
                    // Extract each byte using bitwise operations
                    let byte0: u32 = (value & 0x000000FF);
                    let byte1: u32 = (value >> 8) & 0x000000FF;
                    let byte2: u32 = (value >> 16) & 0x000000FF;
                    let byte3: u32 = (value >> 24) & 0x000000FF;
                
                    // Return as a vector
                    return vec4<u32>(byte0, byte1, byte2, byte3);
                }
                    
                fn EZ_VEC4_TO_U32(v: vec4<u32>) -> u32 {
                    // Combine the bytes using bitwise operations
                    let combined: u32 =
                        (v.x & 0x000000FF) |
                        ((v.y & 0x000000FF) << 8) |
                        ((v.z & 0x000000FF) << 16) |
                        ((v.w & 0x000000FF) << 24);

                    // Return the packed u32 value
                    return combined;
                }

                // The builder's drag - see THE BUILD LINE (buildLineWgsl)
                ${EZWG.buildLineWgsl()}

                @vertex
                fn vertexMain(@location(0) position: vec2f, @builtin(instance_index) EZ_INSTANCE: u32) -> VertexOutput {
                    var EZ_OUTPUT: VertexOutput;
                    
                    var EZ_SFX_SIZE: u32 = ${this.SFX_BUFFER_SIZE_LENGTH};
                    var i = f32(EZ_INSTANCE);
                    let EZ_PARTS_ACROSS_F: f32 = ${this.PARTS_ACROSS}f;
                    let caWu: u32 = ${this.PARTS_ACROSS}u;

                    const EZ_USER_IN_SZE: u32 = ${this.USER_INPUT_BUFFER_SIZE}u;
                    ${EZWG.playerInputWgslConsts()}
                    const EZ_CELL_VALS: u32 = ${this.CELL_VALS}u;
                    const CHUNKS_ACROSS: u32 = ${this.CHUNKS_ACROSS}u;
                    const EZ_CHUNK_SIZE: u32 = ${this.CHUNK_SIZE}u;
                    var EZ_FRAG_PPC: u32 = ${this.FRAG_PIXEL_PER_COMP}u;  //FRAG_PIXEL_PER_COMP
                    let EZ_CELLS_ACROSS_X: u32 = u32( grid.x );
                    let EZ_CELLS_ACROSS_Y: u32 = u32( grid.y );
                    let EZ_TOTAL_CELLS = EZ_CELLS_ACROSS_X * EZ_CELLS_ACROSS_Y;

                    // Global grid counting each component as a cell
                        // now used in another context
                    // var EZ_RAW_COL: u32 = EZ_INSTANCE % (EZ_CELLS_ACROSS_X * caWu);
                    // var EZ_RAW_ROW: u32 = EZ_INSTANCE / (EZ_CELLS_ACROSS_Y * caWu); 
                    
                    var EZ_RAW_COL: u32 = EZ_INSTANCE % (EZ_CELLS_ACROSS_X * caWu);             // TODO the CURRENT_ZOOM in stimmings doesn't effect this one
                    var EZ_RAW_ROW: u32 = EZ_INSTANCE / (EZ_CELLS_ACROSS_Y * caWu); 
                    
                    let EZ_CELL = vec2f( f32(EZ_RAW_COL / caWu), f32(EZ_RAW_ROW / caWu) );

                    var EZX: u32 = EZ_RAW_COL / caWu;
                    var EZY: u32 = EZ_RAW_ROW / caWu;
                    var EZ_CELL_IND: u32 = EZX + ( EZY * EZ_CELLS_ACROSS_X);

                    var EZ_CHUNK_X: u32 = EZX / EZ_CHUNK_SIZE;
                    var EZ_CHUNK_Y: u32 = EZY / EZ_CHUNK_SIZE;
                    var EZ_CHUNK_IND: u32 = (EZ_CHUNK_X  + EZ_CHUNK_Y * CHUNKS_ACROSS);
                    
                    // Cell coordinates relative to their respective chunk
                    var EZX_R = EZX % EZ_CHUNK_SIZE;
                    var EZY_R = EZY % EZ_CHUNK_SIZE;

                    //--------------------------------------------------------- Extra values for drawing

                    // Component metas
                    var EZ_COMP_X: u32 = EZ_RAW_COL % caWu;
                    var EZ_COMP_Y: u32 = EZ_RAW_ROW % caWu;
                    var EZ_COMP_IND: u32 = EZ_COMP_X + EZ_COMP_Y * caWu;

                    // Gets you to the center of the cell
                    let EZ_h_cellOffset: vec2f = EZ_CELL / grid * 2;
                    var EZ_h_pos = (position+1) / grid - 1 + EZ_h_cellOffset;

                    // Cell size 
                    var EZ_h_clsX: f32 = (1 / grid.x) * 2;
                    var EZ_h_clsY: f32 = (1 / grid.y) * 2;
                    var EZ_h_smlDx: f32 = (1/EZ_PARTS_ACROSS_F) * EZ_h_clsX;
                    var EZ_h_smlDy: f32 = (1/EZ_PARTS_ACROSS_F) * EZ_h_clsY;

                    EZ_h_pos.x = EZ_h_pos.x + (f32(EZ_COMP_X) * EZ_h_smlDx) - (EZ_h_clsX*0.5) + EZ_h_smlDx/2;   // TODO the CURRENT_ZOOM in stimmings doesn't effect this one
                    EZ_h_pos.y = EZ_h_pos.y + (f32(EZ_COMP_Y) * EZ_h_smlDy) - (EZ_h_clsY*0.5) + EZ_h_smlDy/2;

                    EZ_OUTPUT.position = vec4f(EZ_h_pos, 0, 1);
                    EZ_OUTPUT.cell = EZ_CELL / (grid*1);

                    

                    const EZ_cellParts: u32 = ${this.PARTS_ACROSS}u; 
                    
                    

                    ${this.FRAGMENT_WGSL}
                    

                    return EZ_OUTPUT;
                }

                @fragment
                fn fragmentMain(input: VertexOutput) -> @location(0) vec4f { 
                    return vec4f( input.red, input.grn, input.blu, 1);
                }

            `
        }
        // Potentially better pixel by pixel way on the fragment shader
        else{
            cellShaderWSGL = `
            
                struct VertexOutput {
                    @builtin(position) position: vec4f,
                };
                struct FragOutput {
                    @location(0) red: f32,
                    @location(1) grn: f32,
                    @location(2) blu: f32
                };
                
                @group(0) @binding(0) var<uniform> grid: vec2f;
                @group(0) @binding(1) var<storage> EZ_STATE_IN: array<${this.BUFFER_TYPE}>;
                @group(0) @binding(3) var<storage, read_write> EZ_USER_INPUT: array<f32>;
                @group(0) @binding(4) var<storage> EZ_STORAGE: array<${this.STORAGE_TYPE}>;
                //@group(0) @binding(5) var<uniform> EZ_USER_INPUT_UNFM: array<f32>;
                @group(0) @binding(6) var<storage, read_write> EZ_SFX: array<${this.BUFFER_TYPE}>;

                // Confines to a chunk location
                fn EZ_helper_cellIndexChkRel(cell: vec2u, ogcx: u32, ogcy: u32, chk: u32) -> u32 {
                    var nuCellX: u32 = cell.x + (ogcx*chk);
                    var nuCellY: u32 = cell.y + (ogcy*chk);
                    return ((nuCellY+u32(grid.y)) % u32(grid.y)) * u32(grid.x) + ((nuCellX+u32(grid.x)) % u32(grid.x));
                }

                // Use any X,Y, deltaX, deltaY, attribute
                fn EZ_CELL_VAL(x: u32, dx: i32, y: u32, dy: i32, att: u32 ) -> ${this.BUFFER_TYPE} {
                    var eex: u32 = u32(( i32(x) + dx) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                    var eey: u32 = u32(( i32(y) + dy) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                    var ocxx: u32 = u32( x / ${this.CHUNK_SIZE} );
                    var ocyy: u32 = u32( y / ${this.CHUNK_SIZE} );
                    return EZ_STATE_IN[ att * u32( grid.x * grid.y ) + EZ_helper_cellIndexChkRel( vec2( eex, eey ), ocxx, ocyy, ${this.CHUNK_SIZE}u )  ];
                }

                
                fn EZ_RAND( seed: u32 ) -> f32 {
                    let a: u32 = 1664525u;
                    var c: u32 = 1013904223u;
                    c = a * seed + c;
                    return f32(c & 0x00FFFFFFu)  / f32(0x01000000u);
                }

                fn EZ_U32_TO_VEC4(value: u32) -> vec4<u32> {
                    // Extract each byte using bitwise operations
                    let byte0: u32 = (value & 0x000000FF);
                    let byte1: u32 = (value >> 8) & 0x000000FF;
                    let byte2: u32 = (value >> 16) & 0x000000FF;
                    let byte3: u32 = (value >> 24) & 0x000000FF;
                
                    // Return as a vector
                    return vec4<u32>(byte0, byte1, byte2, byte3);
                }
                fn EZ_VEC4_TO_U32(v: vec4<u32>) -> u32 {
                    // Combine the bytes using bitwise operations
                    let combined: u32 =
                        (v.x & 0x000000FF) |
                        ((v.y & 0x000000FF) << 8) |
                        ((v.z & 0x000000FF) << 16) |
                        ((v.w & 0x000000FF) << 24);

                    // Return the packed u32 value
                    return combined;
                }

                fn pseudoRandom(x: f32, y: f32, time: f32) -> f32 {
                    return fract(sin(dot(vec2<f32>(x, y), vec2<f32>(12.9898, 78.233))) * 43758.5453 + time);
                }

                // TRees noise 
                fn smoothNoise(x: f32, y: f32, time: f32) -> f32 {
                    // Use sin/cos to generate smooth variation over space and time
                    return sin(x * 0.05 + time * 0.01) * cos(y * 0.05 + time * 0.01);
                }
                // Function to interpolate between values for smooth transitions
                fn lerp(a: f32, b: f32, t: f32) -> f32 {
                    return a + t * (b - a);
                }
                // Function to generate cloud density between 0 and 255
                //
                // Takes FRACTIONAL cell coordinates and returns a float. It used to be
                // u32 in and u32 out, which meant the caller could only ever ask about
                // a whole cell and the answer came back quantised to 1 of 255 - so a
                // cloud edge stepped a whole cell at a time. The fragment shader now
                // feeds it the 16x16 sub-cell (sprite texel) grid instead. Handing it
                // whole numbers still gives exactly the old pattern; this only adds
                // precision in between them.
                fn getCloudDensity(x: f32, y: f32, time: f32) -> f32 {
                    let fx = x;
                    let fy = y;
                    let ft = time;

                    // Generate base noise pattern
                    let baseNoise = smoothNoise(fx, fy, ft);

                    // Simulate time-based variation and smooth transitions
                    let noiseVariation = smoothNoise(fx * 0.5, fy * 0.5, ft * 0.2) * 0.5;
                    let smoothTransition = lerp(baseNoise, noiseVariation, 0.5);

                    // Scale the result to a 0-255 range for cloud density
                    let cloudDensity = (smoothTransition + 1.0) * 127.5; // Shift to [0, 255] range

                    return clamp(cloudDensity, 0.0, 255.0);
                }
                // Function to apply rotation and constrain pixels within bounds
                fn rotate_pixel(x: u32, y: u32, angle: f32, sprt_sizee: u32) -> vec2<u32> {
                
                    let cosf: f32 = 0.7071; // cos(45 degrees)
                    let sinf: f32 = 0.7071; // sin(45 degrees) 
                    let fx = f32(x) - 8.0; // Centering on (8, 8)
                    let fy = f32(y) - 8.0;
                    let rotatedX = fx * cosf - fy * sinf;
                    let rotatedY = fx * sinf + fy * cosf;
                    
                    // Translate back to top-left corner and truncate to bounds
                    let boundedX = max(0, min(i32(sprt_sizee) - 1, i32(rotatedX + 8.0)));
                    let boundedY = max(0, min(i32(sprt_sizee) - 1, i32(rotatedY + 8.0)));
                    return vec2<u32>(u32(boundedX), u32(boundedY));
                }


                fn visionModFromTime(timeoday: f32) -> f32 {
                    return sin(timeoday*6.28318f) + 1f;
                }
                  
                // Function to smoothly interpolate between colors based on time of day, with wraparound handling
                fn getSunColor(timeOfDay: f32) -> vec3<f32> {
                    if (timeOfDay < 0.125) {
                        // Early Dawn (0.0 to 0.125): Dark night blue transitioning to light bluish hue before sunrise
                        return mix(vec3<f32>(0.05, 0.05, 0.2), vec3<f32>(0.15, 0.2, 0.35), timeOfDay * 8.0);
                    } else if (timeOfDay < 0.25) {
                        // Sunrise (0.125 to 0.25): Light blue to soft yellow glow of morning light
                        return mix(vec3<f32>(0.15, 0.2, 0.35), vec3<f32>(0.8, 0.75, 0.6), (timeOfDay - 0.125) * 8.0);
                    } else if (timeOfDay < 0.375) {
                        // Late Morning (0.25 to 0.375): Soft yellow to bright, warm midday tones
                        return mix(vec3<f32>(0.8, 0.75, 0.6), vec3<f32>(0.9, 0.9, 0.75), (timeOfDay - 0.25) * 8.0);
                    } else if (timeOfDay < 0.5) {
                        // Midday (0.375 to 0.5): Bright warm yellowish to a subtle blue tint for a clear sky at noon
                        return mix(vec3<f32>(0.9, 0.9, 0.75), vec3<f32>(0.7, 0.85, 1.0), (timeOfDay - 0.375) * 8.0); // Subtle blue tint
                    } else if (timeOfDay < 0.625) {
                        // Sunset (0.5 to 0.625): Warm reddish-orange as the sun sets
                        return mix(vec3<f32>(0.7, 0.85, 1.0), vec3<f32>(0.9, 0.6, 0.4), (timeOfDay - 0.5) * 8.0);
                    } else if (timeOfDay < 0.75) {
                        // After Sunset (0.625 to 0.75): Fading into cooler pinkish tones transitioning toward twilight
                        return mix(vec3<f32>(0.9, 0.6, 0.4), vec3<f32>(0.45, 0.25, 0.35), (timeOfDay - 0.625) * 8.0);
                    } else if (timeOfDay < 0.875) {
                        // Twilight (0.75 to 0.875): Fading pink to deep bluish-gray with hints of moonlight
                        return mix(vec3<f32>(0.45, 0.25, 0.35), vec3<f32>(0.2, 0.2, 0.4), (timeOfDay - 0.75) * 8.0);
                    } else if (timeOfDay < 1.0) {
                        // Night (0.875 to 1.0): Cool moonlit tones, transitioning to the same as dawn for a seamless wrap
                        return mix(vec3<f32>(0.2, 0.2, 0.4), vec3<f32>(0.05, 0.05, 0.2), (timeOfDay - 0.875) * 8.0);
                    } else {
                        // Midnight (Exactly 1 or 0.0): Same as 0.0 to wrap around smoothly
                        return vec3<f32>(0.05, 0.05, 0.2); // Midnight deep blue
                    }
                }

                // The builder's drag preview - the SAME function the compute pass
                // builds the line with. See THE BUILD LINE (buildLineWgsl).
                ${EZWG.buildLineWgsl()}






                @vertex
                fn vertexMain(@location(0) position: vec2f) -> VertexOutput {
                    var output: VertexOutput;

                    // ⚠ THIS QUAD MUST COVER THE WHOLE SCREEN. It is the only geometry
                    // drawn in FRAG_PIXEL_MODE, and any part of the target it does not
                    // cover keeps the render pass clearValue - which is pure black.
                    //
                    // This used to translate by (0, +0.1). Clip space is -1..1, i.e. 2
                    // units tall, so 0.1 of it is exactly 5% of the height: the quad's
                    // bottom edge sat at -0.9 and left a black bar across the bottom of
                    // the window 5% of its height, growing with it. (Measured: 27px at
                    // 535, 42px at 835, 57px at 1135.) The matching 5% off the top was
                    // pushed past +1 and clipped away.
                    //
                    // Nothing compensated for it anywhere, and nothing could: the
                    // fragment shader works out the world position from fragCoord, the
                    // FRAMEBUFFER pixel, which does not care where the quad is. So the
                    // offset never moved the picture - it only decided which pixels got
                    // shaded at all. Removing it is pixel-identical for every pixel that
                    // was already being drawn, and simply fills in the bar.
                    var translation = vec2<f32>(0.0f, 0.0f);
                    var transformedPosition = (position + translation) * 1f;

                    output.position = vec4f(transformedPosition, 0.0, 1.0);
                    return output;
                }

                @fragment
                fn fragmentMain(@builtin(position) fragCoord: vec4f) -> @location(0) vec4f {

                    var EZ_OUTPUT: FragOutput;
                     
                    let EZ_PARTS_ACROSS_F: f32 = ${this.PARTS_ACROSS}f;
                    let caWu: u32 = ${this.PARTS_ACROSS}u;      // used in the vertex mode 
                    var cFaWu: u32= ${this.PARTS_ACROSS*this.FRAG_PIXEL_PER_COMP}u;

                    const EZ_USER_IN_SZE: u32 = ${this.USER_INPUT_BUFFER_SIZE}u;
                    ${EZWG.playerInputWgslConsts()}
                    var EZ_SFX_SIZE: u32 = ${this.SFX_BUFFER_SIZE_LENGTH};
                    const EZ_CELL_VALS: u32 = ${this.CELL_VALS}u;
                    const CHUNKS_ACROSS: u32 = ${this.CHUNKS_ACROSS}u;
                    const EZ_CHUNK_SIZE: u32 = ${this.CHUNK_SIZE}u;
                    var EZ_FRAG_PPC: u32 = ${this.FRAG_PIXEL_PER_COMP}u;  //FRAG_PIXEL_PER_COMP
                    var EZ_CELLS_ACROSS_X: u32 = CHUNKS_ACROSS * EZ_CHUNK_SIZE;
                    var EZ_CELLS_ACROSS_Y: u32 = CHUNKS_ACROSS * EZ_CHUNK_SIZE;
                    let EZ_TOTAL_CELLS = EZ_CELLS_ACROSS_X * EZ_CELLS_ACROSS_Y;

                    // Global grid counting each component as a cell
                    var EZ_RAW_COL: u32 = u32(floor(fragCoord.x)) / 1;                                  // TODO the CURRENT_ZOOM in stimmings doesn't effect the VERTEX version of this variable
                        // TODO this issue right here
                    var EZ_RAW_ROW: u32 = (EZ_CELLS_ACROSS_Y*cFaWu) - (u32(fragCoord.y)) - 1u; 
                                                                  //clamp(u32(floor(fragCoord.y)), 0u, u32(grid.y - 1.0));
                    let EZ_CELL = vec2f( f32(EZ_RAW_COL / cFaWu), f32(EZ_RAW_ROW / cFaWu) );

                    var EZX: u32 = EZ_RAW_COL / cFaWu;
                    var EZY: u32 = EZ_RAW_ROW / cFaWu;
                    var EZ_CELL_IND: u32 = EZX + ( EZY * EZ_CELLS_ACROSS_X);

                    var EZ_CHUNK_X: u32 = EZX / EZ_CHUNK_SIZE;
                    var EZ_CHUNK_Y: u32 = EZY / EZ_CHUNK_SIZE;
                    var EZ_CHUNK_IND: u32 = (EZ_CHUNK_X  + EZ_CHUNK_Y * CHUNKS_ACROSS);
                    
                    // Cell coordinates relative to their respective chunk
                    var EZX_R = EZX % EZ_CHUNK_SIZE;
                    var EZY_R = EZY % EZ_CHUNK_SIZE;

                    // --------------------------------------------------------- Extra values for drawing

                    // Component metas
                    var EZ_COMP_X: u32 = (EZ_RAW_COL % cFaWu) / EZ_FRAG_PPC;
                    var EZ_COMP_Y: u32 = (EZ_RAW_ROW % cFaWu) / EZ_FRAG_PPC;
                    var EZ_COMP_IND: u32 = EZ_COMP_X + EZ_COMP_Y * (EZ_TOTAL_CELLS*caWu);
					
                    var EZ_cellParts: u32 = ${this.PARTS_ACROSS}u;

                    var DAY_LEN: u32 = ${this.stepsPerDay}u;
                    var DAY_LENf: f32 = ${this.stepsPerDay}f;
 
                    ${this.FRAGMENT_WGSL}
					//return vec4f(fragCoord.x / grid.x, fragCoord.y / grid.y, 0.0, 1.0);
                    return vec4f(EZ_OUTPUT.red, EZ_OUTPUT.grn, EZ_OUTPUT.blu, 1.0);
                }

            `;
        }






















		// Create the shader that will render the cells.
		const cellShaderModule = this.device.createShaderModule({
			label: "Cell shader",
			code: cellShaderWSGL
		});

		// Create a pipeline that renders the cell.
		this.cellPipeline = this.device.createRenderPipeline({
			label: "Cell pipeline",
			layout: pipelineLayout,
			vertex: {
				module: cellShaderModule,
				entryPoint: "vertexMain",
				buffers: [ vertexBufferLayout ]
			},
			fragment: {
				module: cellShaderModule,
				entryPoint: "fragmentMain",
				targets: [ {
					format: canvasFormat
				} ]
			}
		});

















        /////   TO USE__________________________
     

        //fn TRIPLEInit1(x: u32) -> u32 {
        //    var result = x;
        //    result ^= result >> 16u;
        //    result *= 0x7feb352d;
        //    result ^= result >> 15u;
        //    result *= 0x846ca68b;
        //    result ^= result >> 16u;
        //    return result;
        //} 
        //fn TRIPLEInit2(x: u32) -> u32 {
        //    var result = x;
        //    result ^= result >> 17u;
        //    result *= 0xed5ad4bb;
        //    result ^= result >> 11u;
        //    result *= 0xac4c1b51;
        //    result ^= result >> 15u;
        //    result *= 0x31848bab;
        //    result ^= result >> 14u;
        //    return result;
        //} 
        //fn TRIPLENext(seed: u32) -> u32 {
        //    return (1664525u * seed + 1013904223u);
        //} 
        //fn TRIPLERandF01(seed: u32) -> f32 {
        //    return f32(seed) / f32(0xffffffffu);
        //}

 




        let simulationWSGLCode = `
			@group(0) @binding(0) var<uniform> grid: vec2f;

			@group(0) @binding(1) var<storage> EZ_STATE_IN: array<${this.BUFFER_TYPE}>;
			@group(0) @binding(2) var<storage, read_write> EZ_STATE_OUT: array<${this.BUFFER_TYPE}>;
			@group(0) @binding(3) var<storage, read_write> EZ_USER_INPUT: array<f32>;
			@group(0) @binding(4) var<storage> EZ_STORAGE: array<${this.STORAGE_TYPE}>;
            //@group(0) @binding(5) var<uniform> EZ_USER_INPUT_UNFM: array<f32>;
            @group(0) @binding(6) var<storage, read_write> EZ_SFX: array<${this.BUFFER_TYPE}>;

            // Confines to entire grid space
			// fn EZ_helper_cellIndex(cell: vec2u) -> u32 {
			// 	return ((cell.y+u32(grid.y)) % u32(grid.y)) * u32(grid.x) + ((cell.x+u32(grid.x)) % u32(grid.x));
			// }

            // Confines to a chunk location
            fn EZ_helper_cellIndexChkRel(cell: vec2u, ogcx: u32, ogcy: u32, chk: u32) -> u32 {
                var nuCellX: u32 = cell.x + (ogcx*chk);
                var nuCellY: u32 = cell.y + (ogcy*chk);
				return ((nuCellY+u32(grid.y)) % u32(grid.y)) * u32(grid.x) + ((nuCellX+u32(grid.x)) % u32(grid.x));
			}

            // Use any X,Y, deltaX, deltaY, attribute
            // (NEW)
            fn EZ_CELL_VAL(x: u32, dx: i32, y: u32, dy: i32, att: u32 ) -> ${this.BUFFER_TYPE} {
                var eex: u32 = u32(( i32(x) + dx) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                var eey: u32 = u32(( i32(y) + dy) + ${this.CHUNK_SIZE}) % ${this.CHUNK_SIZE};
                var ocxx: u32 = u32( x / ${this.CHUNK_SIZE} );
                var ocyy: u32 = u32( y / ${this.CHUNK_SIZE} );
                return EZ_STATE_IN[ att * u32( grid.x * grid.y ) + EZ_helper_cellIndexChkRel( vec2( eex, eey ), ocxx, ocyy, ${this.CHUNK_SIZE}u )  ];
            }

            // Use any X,Y, deltaX, deltaY, attribute
            // (OLD)
            // fn EZ_CELL_VAL(x: u32, dx: i32, y: u32, dy: i32, att: u32 ) -> ${this.BUFFER_TYPE} {
            //     var ocxx: u32 = u32( x / ${this.CHUNK_SIZE} );
            //     var ocyy: u32 = u32( y / ${this.CHUNK_SIZE} );
            //     var eex: u32 = u32( (i32(x)+dx+i32(${this.CHUNK_SIZE})) ) % ${this.CHUNK_SIZE};
            //     var eey: u32 = u32( (i32(y)+dy+i32(${this.CHUNK_SIZE})) ) % ${this.CHUNK_SIZE};
            //     eex = eex + (ocxx*${this.CHUNK_SIZE});
            //     eey = eey + (ocyy*${this.CHUNK_SIZE}); 
			//     return EZ_STATE_IN[ (att * ${this.TOTAL_CELLS}) + eex + (eey*${this.GRID_SIZE})];//EZ_helper_cellIndexChkRel( vec2( eex, eey ), ocxx, ocyy, ${this.CHUNK_SIZE}u )  ];
			// }

            // This old version still works somehow?
            // fn EZ_GET_CELL(x: u32, y: u32, att: u32, ocx: u32, ocy: u32 ) -> f32 {
			// 	  return EZ_STATE_IN[ att * u32( grid.x * grid.y ) + EZ_helper_cellIndexChkRel( vec2( (x+`+this.CHUNK_SIZE+`u)%`+this.CHUNK_SIZE+`u,(y+`+this.CHUNK_SIZE+`u)%`+this.CHUNK_SIZE+`u ), ocx, ocy, `+this.CHUNK_SIZE+`u )  ];
			// }
            
            fn EZ_RAND( seed: u32 ) -> f32 {
                let a: u32 = 1664525u;
                var c: u32 = 1013904223u;
                c = a * seed + c;
                return f32(c & 0x00FFFFFFu)  / f32(0x01000000u);
            }
            // The compute shader NEVER carries an RNG state around - there is
            // nowhere to put one, a cell is 13 u32s of game state. So every
            // random number in the sim is this function applied to whatever
            // numbers the cell happens to have: EZX, EZY, counter, pPrior, the
            // neighbour index. Those seeds are dense, adjacent and correlated by
            // construction - the cell next door differs by 1, the next tick
            // differs by 1 - which makes this a HASH problem, not a stream-RNG
            // problem. It has to avalanche: one bit of seed has to flip about
            // half the output bits.
            //
            // It used to be ONE step of the numerical-recipes LCG plus a single
            // xorshift:  (1664525*seed + 1013904223) ^ (that >> 16).  An LCG is
            // a stream generator, and it is only decent when you keep iterating
            // it and read the HIGH bits. Used as a hash, one round, it does not
            // avalanche at all downward: mod 8 the whole thing collapses to
            //     low3(out) = (5*low3(seed) + 7) mod 8  ^  bits16..18
            // i.e. the bottom bits are close to a straight relabelling of the
            // seed. The sim reads exactly those bottom bits everywhere -
            // tesr%256, tesrHelper%2, tesr%myFreq, %8 - so neighbouring cells and
            // consecutive ticks were getting patterned, not independent, rolls.
            //
            // This is Wellons' lowbias32 finaliser (xor-shift / multiply x2),
            // measured to have far lower avalanche bias than murmur3's fmix32,
            // and bijective - no value is ever unreachable. The Weyl constant on
            // the way in stops EZ_RAND_U(0) being 0 and keeps the very common
            // "seed is a small counter" case well spread.
            //
            // Cost is ~6 ALU ops more than before, per call, on a shader whose
            // inner loop is 64 EZ_STATE_IN fetches - it does not show up.
            fn EZ_RAND_U( seed: u32 ) -> u32 {
                var result: u32 = seed + 0x9E3779B9u;
                result ^= result >> 16u;
                result *= 0x7FEB352Du;
                result ^= result >> 15u;
                result *= 0x846CA68Bu;
                result ^= result >> 16u;
                return result;
            }


            fn EZ_U32_TO_VEC4(value: u32) -> vec4<u32> {
                // Extract each byte using bitwise operations
                let byte0: u32 = (value & 0x000000FF);
                let byte1: u32 = (value >> 8) & 0x000000FF;
                let byte2: u32 = (value >> 16) & 0x000000FF;
                let byte3: u32 = (value >> 24) & 0x000000FF;
                // Return as a vector
                return vec4<u32>(byte0, byte1, byte2, byte3);
            }
            fn EZ_VEC4_TO_U32(vec: vec4<u32>) -> u32 {
                // Combine each byte into a single u32 value using bitwise operations
                let value: u32 = (vec.x & 0x000000FF) |
                    ((vec.y & 0x000000FF) << 8) |
                    ((vec.z & 0x000000FF) << 16) |
                    ((vec.w & 0x000000FF) << 24);
                return value;
            }

             

            //  = = = =   INTEGER MATH FOR ANYTHING THAT REACHES THE CELL GRID   = = = =
            //
            //  ⚠ THE SIMULATION MAY NOT USE FLOATS. WGSL pins +,-,* and / to IEEE
            //  754, but it does NOT pin normalize / inverseSqrt / distance / pow -
            //  those are specified only to a ULP bound - and it permits a compiler
            //  to contract a*b+c into an FMA. So the same shader on a different GPU
            //  or a newer driver can land one ULP away, and one ULP is a whole unit
            //  once the value is quantised into a u32 and written to the grid.
            //
            //  That is not a theoretical worry here: the light beam block writes
            //  finalLightsVerdict into cell attribute LIGHTINDX_STR, and the vision
            //  byte it carries gates safePlacement through SP_MIN_VIS. A one-unit
            //  difference flips whether a placement is allowed, and light propagates
            //  cell to cell, so the divergence spreads. These two helpers are what
            //  let that block be written in pure integers instead.
            //
            //  FIXED POINT THROUGHOUT IS 1/2048 (EZ_FP_ONE). That is not arbitrary -
            //  the beam direction is stored as 12 bits per axis over [-1,1], so
            //  2048 units per 1.0 makes the pack and unpack exact shifts with no
            //  rounding of their own:  stored = fp + 2048,  fp = stored - 2048.

            //  floor(sqrt(n)), exact for every u32, by the classic restoring
            //  bit-pair method. 16 iterations, no division, no floats. Verified
            //  against Math.floor(Math.sqrt(n)) across the full u32 range.
            fn EZ_ISQRT( nIn: u32 ) -> u32 {
                var n: u32 = nIn;
                var rem: u32 = 0u;
                var root: u32 = 0u;
                var i: u32 = 0u;
                loop {
                    if( i >= 16u ){ break; }
                    root = root << 1u;
                    rem = (rem << 2u) | (n >> 30u);
                    n = n << 2u;
                    if( root < rem ){
                        root = root + 1u;
                        rem = rem - root;
                        root = root + 1u;
                    }
                    i = i + 1u;
                }
                return root >> 1u;
            }

            //  pow(x, 1.3) for x in [0,1], in and out as 1/2048 fixed point, by a
            //  33 entry table with linear interpolation between the rungs. Max
            //  error 0.0011 against the real pow (measured over all 2049 inputs),
            //  which is a third of one unit of the 8 bit intensity this ends up in.
            //
            //  The table is a function-scope var rather than a module const so the
            //  dynamic index is unambiguously legal in every WGSL implementation.
            fn EZ_POW13_FP( x: u32 ) -> u32 {
                var tbl = array<u32, 33>(
                    0u, 23u, 56u, 94u, 137u, 183u, 232u, 284u,
                    338u, 394u, 451u, 511u, 572u, 635u, 699u, 765u,
                    832u, 900u, 969u, 1040u, 1112u, 1184u, 1258u, 1333u,
                    1409u, 1486u, 1564u, 1642u, 1722u, 1802u, 1883u, 1965u,
                    2048u
                );

                if( x >= 2048u ){ return 2048u; }

                let idx: u32 = x >> 6u;             // x * 32 / 2048
                let frac: u32 = x & 63u;            // remainder within the rung
                let lo: u32 = tbl[ idx ];
                let hi: u32 = tbl[ idx + 1u ];
                return lo + ( (hi - lo) * frac ) / 64u;
            }

            //  The builder's click (SHAPE = LINE) - the SAME function the drag
            //  preview draws it with. See THE BUILD LINE (buildLineWgsl).
            ${EZWG.buildLineWgsl()}

            fn convert_to_di(dx_f32: f32, dy_f32: f32) -> u32 {
                var gg: u32 = 0;
                var clst: f32 = 4f;
                var bestest: u32 = 0;
                loop {                              // Goes 0-7 (inclusive)
                    if gg >= 1*8 { break; }   // from 0 to TTL_INSLTS-1
                    var di = (gg%8) + ((gg%8)/4u);        // Which way look around (0 - 7 SKIPS 4!(SELF)) 
                    var dx = -1 + i32(di%3u);           // X Value
                    var dy = -1 + i32(di/3u);           // Y Value
 
                    var ddd: f32 = distance( vec2<f32>(dx_f32, dy_f32), vec2<f32>(f32(dx), f32(dy)) );
                    if( ddd < clst ){
                        clst = ddd;
                        bestest = di;
                    }

                    gg = gg + 1u;

                }
                
                return bestest;
            }

            




			@compute @workgroup_size( ${this.WORKGROUP_SIZE}, ${this.WORKGROUP_SIZE} )
			fn computeMain(@builtin(global_invocation_id) EZ_CELL: vec3u) {
                
                let EZ_PARTS_ACROSS_F: f32 = ${this.PARTS_ACROSS}f;
                let caWu: u32 = ${this.PARTS_ACROSS}u;      // used for idk what yet.. came with EZ_^
            
                const EZ_USER_IN_SZE: u32 = ${this.USER_INPUT_BUFFER_SIZE}u;
                var EZ_SFX_SIZE: u32 = ${this.SFX_BUFFER_SIZE_LENGTH};

                // Map census - see the CENSUS block in the constructor. Only the
                // invocations with EZY < EZ_CENSUS_ROWS do any of this work.
                const EZ_CENSUS_PASS_TICKS: u32 = ${this.CENSUS_PASS_TICKS}u;
                const EZ_CENSUS_ROWS: u32       = ${this.CENSUS_ROWS}u;
                const EZ_CENSUS_OFFSET: u32     = ${this.CENSUS_OFFSET}u;
                const EZ_CENSUS_HEADER: u32     = ${this.CENSUS_HEADER_INDEX}u;

                // Relic drop verdicts - see the RELIC DROP VERDICT block in the
                // constructor for the word layout. Team T's is at
                // EZ_RELIC_VERDICT + (T-1), written by the ONE invocation that owns
                // that team's drop cell, and never cleared by anything.
                const EZ_RELIC_VERDICT: u32     = ${this.RELIC_VERDICT_INDEX}u;

                // The four players' input blocks - see THE PLAYER INPUT BLOCKS.
                // Team T's input X is EZ_USER_INPUT[ EZ_PLAYER_BASE +
                // (T-1u)*EZ_PLAYER_STRIDE + EZ_PIN_X ].
                ${EZWG.playerInputWgslConsts()}

                // Where the kings are - see the WHERE THE KINGS ARE block in the
                // constructor for the word layout. Team T's word is at
                // EZ_KING_POS + (T-1), written by the ONE cell holding that team's
                // king (or the ONE cell his death turned into a gravestone), and
                // never cleared by anything.
                const EZ_KING_POS: u32          = ${this.KING_POS_INDEX}u;
                const EZ_KING_POS_TEAMS: u32    = ${this.KING_POS_TEAMS}u;

                // ...and what shape each king is in - see WHAT SHAPE THE KINGS ARE
                // IN in the constructor. Team T's words start at
                // EZ_KING_VITALS + (T-1)*EZ_KING_VITALS_WORDS, written by the same
                // cell as its king word.
                const EZ_KING_VITALS: u32       = ${this.KING_VITALS_INDEX}u;
                const EZ_KING_VITALS_WORDS: u32 = ${this.KING_VITALS_WORDS}u;

                // ...and what each team's last one-cell eye dropper click landed
                // on - see WHAT THE EYE DROPPER LANDED ON in the constructor. Team
                // T's word is at EZ_INSPECT + (T-1), written by the clicked cell.
                const EZ_INSPECT: u32           = ${this.INSPECT_INDEX}u;

                // ...and each team's last build click that laid a blueprint - see
                // WHAT THE BUILDER PUT DOWN. Team T's word is at EZ_BUILD + (T-1).
                const EZ_BUILD: u32             = ${this.BUILD_INDEX}u;

                const EZ_CELL_VALS: u32  = ${this.CELL_VALS}u;
                const EZ_CHUNKS_ACROSS: u32 = ${this.CHUNKS_ACROSS}u;
                const EZ_CHUNK_SIZE: u32 = ${this.CHUNK_SIZE}u;
                let EZ_CELLS_ACROSS_X: u32 = u32( grid.x );
                let EZ_CELLS_ACROSS_Y: u32 = u32( grid.y );
                let EZ_TOTAL_CELLS = EZ_CELLS_ACROSS_X * EZ_CELLS_ACROSS_Y;
  
                let EZX = EZ_CELL.x;
                let EZY = EZ_CELL.y;                                //  old version
                let EZ_CELL_IND = EZX + ( EZY * EZ_CELLS_ACROSS_X); // EZ_helper_cellIndex(EZ_CELL.xy);
    
                // Chunk logic
                var EZ_CHUNK_X: u32 = EZX / EZ_CHUNK_SIZE;
                var EZ_CHUNK_Y: u32 = EZY / EZ_CHUNK_SIZE;
                var EZ_CHUNK_IND: u32 = EZ_CHUNK_X + EZ_CHUNK_Y*EZ_CHUNKS_ACROSS;

                // Cell coordinates relative to their respective chunk
                let EZX_R = EZX % EZ_CHUNK_SIZE;
                let EZY_R = EZY % EZ_CHUNK_SIZE;

                ${this.COMPUTE_WGSL}

				
			}
		`;
  
		// Create the compute shader that will process the game of life simulation.
		const simulationShaderModule = this.device.createShaderModule({
			label: "Life simulation shader",
			code: simulationWSGLCode
		});

		// Create a compute pipeline that updates the game state.
		this.simulationPipeline = this.device.createComputePipeline({
			label: "Simulation pipeline",
			layout: pipelineLayout,
			compute: {
				module: simulationShaderModule,
				entryPoint: "computeMain",
			}
		});

		// Create a uniform buffer that describes the grid.
		var uniformArray;
        //if( this.BUFFER_TYPE === 'f32' ){
        uniformArray = new Float32Array([ this.GRID_SIZE, this.GRID_SIZE ]);
        //}
        // else if(this.BUFFER_TYPE === 'u32'){
        //     //uniformArray = new Uint32Array([ this.GRID_SIZE, this.GRID_SIZE ]);
        // }
        // else{
        //     //throw new Error('Unkjnown buffer_type')
        // }
         
		const uniformBuffer = this.device.createBuffer({
			label: "Grid Uniforms",
			size: uniformArray.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		this.device.queue.writeBuffer( uniformBuffer, 0, uniformArray );


















		

		// Create an array representing the active state of each cell.
		let dbug_cell_state_buffer_info=false;
        
        if( this.BUFFER_TYPE === 'f32' ){
            this.cellStateArray = (new Float32Array( this.TOTAL_CELLS * this.CELL_VALS )).fill(0);
        }
        else if(this.BUFFER_TYPE === 'u32'){
            this.cellStateArray = (new Uint32Array( this.TOTAL_CELLS * this.CELL_VALS )).fill(0);
        }
        else{
            throw new Error('Unkjnown BUFFER_TYPE: '+ this.BUFFER_TYPE)
        }
		if(dbug_cell_state_buffer_info)console.log('seeed', this.RAND_SEED);
		if(dbug_cell_state_buffer_info)console.log('this.cellStateArray.byteLength', this.cellStateArray.byteLength);
		if(dbug_cell_state_buffer_info)console.log('4 bytes times:', this.CELL_VALS );
		if(dbug_cell_state_buffer_info)console.log('Grid length', this.GRID_SIZE);
		if(dbug_cell_state_buffer_info)console.log('Total cells ', this.TOTAL_CELLS);

		// Create two storage buffers to hold the cell state.
		this.cellStateStorage = [
			this.device.createBuffer({
				label: "Cell State A",
				size: this.cellStateArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
			}),
			this.device.createBuffer({
				label: "Cell State B",
				size: this.cellStateArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC, //GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			})
		];

		//0-mouseX pos, 1-mouseY pos, 2- special inst, 3-specialinst
        // This the one that gets changed on the CPU side and is red in
        //this.liveInput = ( new Float32Array( this.USER_INPUT_BUFFER_SIZE ) ).fill(0);
		this.userInputTempStorage = 
			this.device.createBuffer({
				label: "Temp User Input 1",
				size: this.liveInput.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			});
		this.device.queue.writeBuffer( this.userInputTempStorage, 0, this.liveInput );

 
        // CURRENTLY DEAD, deliberately kept. `EZ_USER_INPUT_UNFM` (binding 5) is
        // commented out in all three shaders, and liveInpuUniform is zero-filled at
        // construction and never touched again - so nothing on the GPU can read this.
        // The buffer stays because binding 5 is still declared in the bind group
        // layout, and it gets written ONCE here so its contents are defined.
        //
        // It used to be re-uploaded every tick from run(). That has been removed. If
        // you ever wire the uniform up for real, put the per-tick write back next to
        // the userInputTempStorage one - don't restore it just to keep it "in sync",
        // it has nothing to sync with.
        this.userIn_uniformBuffer =
            this.device.createBuffer({
            label: "User Input uniform",
            size: this.liveInpuUniform.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(this.userIn_uniformBuffer, 0, this.liveInpuUniform);



 
        // [ 0 .. SFX_BUFFER_SIZE )  the 128x128 sfx word window (rows 1-128 of a
        //                          129-row block - see SFX_BUFFER_SIZE)
        // [ CENSUS_OFFSET .. +CENSUS_CELLS )  this tick's slice of map rows
        // [ CENSUS_HEADER_INDEX ]  which slice that was (0 .. CENSUS_PASS_TICKS-1)
        // [ RELIC_VERDICT_INDEX .. +4 ) each team's last relic drop verdict, team T at
        //                          +(T-1) (sticky - see above)
        // [ KING_POS_INDEX .. +4 ) where each team's king is right now, team T at
        //                          +(T-1) (sticky - see above)
        // [ KING_VITALS_INDEX .. +12 ) each team's king's form and channels, team T's
        //                          three at +3*(T-1) (sticky - see above)
        // [ INSPECT_INDEX .. +4 )  what each team's last one-cell eye dropper click
        //                          landed on, team T at +(T-1) (stamped - see above)
        // [ BUILD_INDEX .. +4 )    each team's last build click that laid a blueprint,
        //                          team T at +(T-1) (stamped - see above)
        this.sfxValues = ( new Uint32Array( this.SFX_BUFFER_SIZE + this.CENSUS_TOTAL + this.SFX_EXTRA_TOTAL ) ).fill(0);
		this.sfxBuffer =
			this.device.createBuffer({
				label: "Sfx buffer",
				size: this.sfxValues.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
			});
		this.device.queue.writeBuffer( this.sfxBuffer, 0, this.sfxValues );




        this.cellSfxBufferForReadOnCPU = 
            this.device.createBuffer({
                label: "SFX holderbuffer for cpu",
                size: this.sfxValues.byteLength,
				usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
                // usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });









        // console.log(this.STORAGE)


        let finalStorageArray = null;

        // If you specified a storage
        if( this.STORAGE_SIZE > 0 ){
            if( this.STORAGE_TYPE === 'f32' ){
                finalStorageArray = new Float32Array( this.STORAGE );//new Float32Array( this.STORAGE_SIZE );
                // for(let b = 0;b < this.STORAGE_SIZE;b++){
                //     finalStorageArray[b] = this.STORAGE[b];
                // }
            }
            else if( this.STORAGE_TYPE === 'u32' ){
                finalStorageArray = new Uint32Array( this.STORAGE );//new Uint32Array( this.STORAGE_SIZE );
                // for(let b = 0;b < this.STORAGE_SIZE;b++){
                //     finalStorageArray[b] = this.STORAGE[b];
                // }
            }
        }
        else{
            this.STORAGE_SIZE = 1;
            if( this.STORAGE_TYPE === 'f32' ){
                finalStorageArray = new Float32Array( 1 );
            }
            else if( this.STORAGE_TYPE === 'u32' ){
                finalStorageArray = new Uint32Array( 1 );
            }
        }

        
        
		const extraConfigStorage = 
			this.device.createBuffer({
				label: "Extra config sotrage",
				size: finalStorageArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			});
		this.device.queue.writeBuffer( extraConfigStorage, 0, finalStorageArray );


        
        // Create the buffer you do the async read back to the CPu from: 
        this.cellStateStorageForRead = 
            this.device.createBuffer({
                label: "Cell State C",
                size: this.cellStateArray.byteLength,
				usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
                // usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });
        //this.device.queue.writeBuffer( cellStateStorageForRead, 0, this.cellStateArray );

		// Set each cell to a random state, then copy the JavaScript array into
		// the storage buffer.
		//for (let i = 0; i < TOTAL_CELLS; i++) {
		//    this.cellStateArray[i] = Math.random() > 0.66 ? 1 : 0;
		//}
		// Add the extra bit of information per cell+
		
        // If exact buff not specified just generate it based on starting config
        //
        // ⚠ A NON-EMPTY buffer of the wrong length lands here too, and silently
        // becomes a brand new map - which looks exactly like "the save didn't
        // load" with no clue as to why. The commonest cause now that save files
        // carry a meta trailer is handing the WHOLE file here instead of just its
        // grid part (see EZWG.gridWordCount). Say so out loud.
        if( this.STARTING_BUFFER.length > 0 &&
            this.STARTING_BUFFER.length !== this.TOTAL_CELLS*this.CELL_VALS ){
            console.log( '⚠ STARTING_BUFFER IS THE WRONG LENGTH -',
                         this.STARTING_BUFFER.length, 'words, expected',
                         this.TOTAL_CELLS*this.CELL_VALS,
                         '- GENERATING A NEW MAP INSTEAD. If you meant to load a save,',
                         'strip the meta trailer first: EZWG.gridWordCount(...).' );
        }
        if(this.STARTING_BUFFER.length !== this.TOTAL_CELLS*this.CELL_VALS ){
            if( this.STARTING_CONFIG === EZWG.ALL_RANDS){
                this.initTheInitialCellStateAllRand( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
            }
            else if( this.STARTING_CONFIG === EZWG.ALL_BINS){
                this.initTheInitialCellStateAllRandBins( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
            }
            else{//if( this.STARTING_CONFIG === EZWG.ALL_ZERO){
                this.initTheInitialCellStateAllZeros( this.cellStateArray, this.RAND_SEED, this.GRID_SIZE );
            }
        }
        else{
            // console.log('yes using the repbuilt guy:')
            // console.log(this.STARTING_BUFFER)
            this.cellStateArray = this.STARTING_BUFFER
        }

        console.log('starting with : ')
        //console.log( this.cellStateArray )
 
		// ── WHICH HALF OF THE PING/PONG THE WORLD STARTS IN ────────────────────
		// The state for the START of step S lives in cellStateStorage[ S % 2 ].
		// That is the whole contract, and it comes straight out of run(), which
		// binds bindGroups[ step % 2 ] - group A has IN = storage[0], group B has
		// IN = storage[1].
		//
		// A fresh map starts at step 0 and so lands in storage[0]. A LOAD does not:
		// Ex9 sets this.step to the step recorded in the save filename BEFORE init()
		// is awaited, so the loaded grid has to go into whichever half of the pair
		// that step's parity names.
		//
		// This used to be hardcoded to [0], and it worked only because the save
		// deliberately waited for an odd step so that the number it wrote into the
		// filename was always EVEN. Two distant pieces of code silently agreeing on
		// a parity is exactly the sort of thing that breaks the moment either one is
		// touched - and it breaks SILENTLY, into a world that simulates a buffer
		// nobody ever filled. Indexing by the step removes the agreement altogether,
		// which is what let the save drop its odd-step wait (see run()). Old saves,
		// which all carry even steps, land in storage[0] exactly as they always did.
		this.device.queue.writeBuffer( this.cellStateStorage[ this.step % 2 ], 0, this.cellStateArray );


		// Create a bind group to pass the grid uniforms into the pipeline
		this.bindGroups = [
			this.device.createBindGroup({
				label: "Cell renderer bind group A",
				layout: bindGroupLayout,
				entries: [{
					binding: 0,
					resource: { buffer: uniformBuffer }
				}, {
					binding: 1,
					resource: { buffer: this.cellStateStorage[0] }
				}, {
					binding: 2,
					resource: { buffer: this.cellStateStorage[1] }
				}, {
					binding: 3,
					resource: { buffer: this.userInputTempStorage }
				}, {
					binding: 4,
					resource: { buffer: extraConfigStorage }
				}, {
					binding: 5,
					resource: { buffer: this.userIn_uniformBuffer }
				}, {
					binding: 6,
					resource: { buffer: this.sfxBuffer }
				}
                ],
			}),
			this.device.createBindGroup({
				label: "Cell renderer bind group B",
				layout: bindGroupLayout,
				entries: [{
					binding: 0,
					resource: { buffer: uniformBuffer }
				}, {
					binding: 1,
					resource: { buffer: this.cellStateStorage[1] }
				}, {
					binding: 2,
					resource: { buffer: this.cellStateStorage[0] }
				}, {
					binding: 3,
					resource: { buffer: this.userInputTempStorage }
				}, {
					binding: 4,
					resource: { buffer: extraConfigStorage }
				}, {
					binding: 5,
					resource: { buffer: this.userIn_uniformBuffer }
				}, {
					binding: 6,
					resource: { buffer: this.sfxBuffer }
				}
                ],
			}),
		];



        this.loaded = true;
        //and call back?
    }

    //  ══════════════════  PAUSE / SINGLE STEP  ══════════════════
    //  The tick loop in index2.html calls tick() SIM_TICKS_PER_SECOND times a
    //  second and does not know or care whether the game is paused. This is the
    //  only thing that decides whether that tick spends a compute pass:
    //
    //      running          run() every tick
    //      paused           run() only when an input has asked for a step, so
    //                       at most one step per tick however fast the input
    //                       arrives (see stepRequested in the constructor)
    //
    //  Because a stepped tick goes through the SAME run(), with the same input
    //  snapshot and the same step counter, one step while paused is byte for
    //  byte the tick that would have happened anyway. Nothing about being paused
    //  reaches the compute pass - the render-only slots are zeroed before the
    //  snapshot is written (see run()).
    tick(){

        if( this.paused ){
            // Cleared only if the pass actually happened. run() no-ops whenever a
            // readback is still mapped or a save is in flight, and a step dropped
            // on the floor there would look like the click did nothing.
            if( this.stepRequested && this.run() ){
                this.stepRequested = false;
            }
            return;
        }

        // One tick window given over to drawing the move the pause was sitting on
        // top of, so the picture does not jump when the sim starts again. See
        // resumePlay.
        if( this.resumeGlide ){
            this.resumeGlide = false;

            // Land first, for the same reason scheduleStepGlide opens with a
            // draw: resuming DURING a step glide would otherwise have its
            // landing frame cancelled by the scheduleSubFrames below, and the
            // picture would skip from three quarters of a cell to one and a
            // quarter. An idempotent redraw of the resting frame otherwise.
            this.renderFrame( 0 );

            this.scheduleSubFrames();
            return;
        }

        this.run();
    }

    //  ══════════  THE INPUT LOG  ══════════
    //
    //  Both of these are called from run(), in this order, in the gap between the
    //  render-only slots being zeroed and the writeBuffer that hands liveInput to
    //  the compute pass. That gap is the only honest place for either of them: it
    //  is the exact set of numbers the shader is about to read.

    //  Overwrite every sim slot from the log. Returns nothing; when the log runs
    //  out it switches recording back on and tells whoever asked.
    applyReplayInput(){

        if( !this.REPLAY_ACTIVE || !this.REPLAY_LOG ){ return; }

        // Walk the deltas forward to this step. A while loop rather than an
        // index-by-step lookup because the log is sparse - most ticks have no
        // entry at all - and because it stays correct if a tick is ever skipped.
        while( this.REPLAY_INDEX < this.REPLAY_LOG.length
               && this.REPLAY_LOG[ this.REPLAY_INDEX ][0] <= this.step ){
            const e = this.REPLAY_LOG[ this.REPLAY_INDEX ];
            for(let k = 1; k + 1 < e.length; k += 2){
                const slot = e[k] | 0;
                if( slot >= 0 && slot < this.USER_INPUT_BUFFER_SIZE ){
                    this.REPLAY_LIVE[ slot ] = e[k+1];
                }
            }
            this.REPLAY_INDEX++;
        }

        // AUTHORITATIVE. Not "apply the changes" - assign every sim slot, so a
        // live input that got past the UI lock is overwritten rather than mixed in.
        for(let i = 0; i < this.USER_INPUT_BUFFER_SIZE - 1; i++){
            if( EZWG.isRenderOnlyInputSlot( i ) ){ continue; }
            this.liveInput[ i ] = this.REPLAY_LIVE[ i ];
        }

        // ...and the end of the log is the end of the replay. The step being
        // encoded right now is the last one the log covers, so this pass is played
        // FROM the log and the next one is the player's again.
        if( this.step >= this.REPLAY_LAST_STEP ){
            this.REPLAY_ACTIVE = false;

            // Hand the recorder a correct baseline so the first live tick after a
            // replay diffs against what the log actually left in the buffer, not
            // against whatever it held before the replay started.
            this.INPUT_LOG_PREV.set( this.liveInput );
            this.INPUT_LOG_RECORDING = true;

            if( this.REPLAY_DONE_FUNC ){
                try{ this.REPLAY_DONE_FUNC(); }catch(e){ console.log('replay done handler threw', e); }
            }
        }
    }

    //  One line in the log, if anything moved.
    recordInputSnapshot(){

        if( !this.INPUT_LOG_RECORDING ){ return; }

        let entry = null;

        for(let i = 0; i < this.USER_INPUT_BUFFER_SIZE - 1; i++){
            if( EZWG.isRenderOnlyInputSlot( i ) ){ continue; }

            const v = this.liveInput[ i ];
            if( v !== this.INPUT_LOG_PREV[ i ] ){
                if( entry === null ){ entry = [ this.step ]; }
                entry.push( i, v );
                this.INPUT_LOG_PREV[ i ] = v;
            }
        }

        if( entry !== null ){ this.INPUT_LOG.push( entry ); }
    }

    //  Start playing a log back. The caller is responsible for the world already
    //  being at step 0 of the right seed - this only drives the input, it does not
    //  build the world, and handing it a log recorded on a DIFFERENT seed would
    //  play every input at the right tick into the wrong map. startReplay() in
    //  index2.html is what pairs the two.
    beginReplay( log, onDone ){

        if( !log || !log.length ){ return false; }

        this.REPLAY_LOG = log;
        this.REPLAY_INDEX = 0;
        this.REPLAY_LIVE = ( new Float32Array( this.USER_INPUT_BUFFER_SIZE ) ).fill( 0 );
        this.REPLAY_LAST_STEP = log[ log.length - 1 ][0] | 0;
        this.REPLAY_ACTIVE = true;
        this.REPLAY_DONE_FUNC = onDone || null;

        // Recording is off FOR THE DURATION, and the log being played is adopted
        // as this world's own history. That is what lets the player save (or
        // replay again) after a replay has run out and carry on from there with
        // one continuous record, rather than a history that starts mid-game.
        this.INPUT_LOG_RECORDING = false;
        this.INPUT_LOG = log.slice();
        this.INPUT_LOG_PREV.fill( 0 );

        return true;
    }

    //  Take over the input log a SAVE FILE carried, so a loaded world keeps the
    //  history it was saved with and can still be replayed from step 0. Recording
    //  carries straight on from it.
    //
    //  The recorder's baseline is the log FOLDED FORWARD - every slot as the log
    //  last left it, which is exactly what REPLAY_LIVE will hold when a replay of
    //  this log reaches the loaded step. It must not be zeros: this engine's
    //  liveInput is fresh, so a slot that was non-zero in the saved world and is 0
    //  now would never differ from a zero baseline, never be logged, and a replay
    //  would carry the stale value on past the load. Against the folded baseline
    //  the first live tick logs exactly what changed across the load, no more.
    //
    //  ── AND THE FOUR PLAYERS COME BACK HOLDING WHAT THEY WERE HOLDING ───────
    //  The fold is also put back into liveInput itself, one-shots excepted. With
    //  one player that hardly mattered - the page drove every sim slot again on
    //  the first tick - but three of the four blocks are NOT driven by this page
    //  (another machine, or nobody while the switcher is elsewhere), so a fresh
    //  liveInput would hand the loaded world three players with king mode off
    //  where the saved world had it on. The
    //  fold is exactly what the save pass read, so the loaded world starts from
    //  the same standing inputs the saved one had. The one-shots go back to 0:
    //  the save pass consumed them, and the grid in the file is that pass's
    //  output. Whatever the page then writes into its own block is a real input
    //  at the load step and is logged as one.
    adoptInputLog( log ){

        if( !Array.isArray( log ) ){ return false; }

        this.INPUT_LOG = log;
        this.INPUT_LOG_PREV.fill( 0 );

        for(let n = 0; n < log.length; n++){
            const e = log[n];
            if( !Array.isArray( e ) ){ continue; }
            for(let k = 1; k + 1 < e.length; k += 2){
                const slot = e[k] | 0;
                if( slot >= 0 && slot < this.USER_INPUT_BUFFER_SIZE ){
                    this.INPUT_LOG_PREV[ slot ] = e[k+1];
                }
            }
        }

        for(let i = 0; i < this.USER_INPUT_BUFFER_SIZE - 1; i++){
            if( EZWG.isRenderOnlyInputSlot( i ) ){ continue; }
            this.liveInput[ i ] = this.INPUT_LOG_PREV[ i ];
        }
        for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
            for(let k = 0; k < EZWG.PLAYER_ONE_SHOT_SLOTS.length; k++){
                this.liveInput[ EZWG.playerSlot( t, EZWG.PLAYER_ONE_SHOT_SLOTS[k] ) ] = 0;
            }
        }

        this.INPUT_LOG_RECORDING = true;
        return true;
    }

    //  Which slot layout an input log is in. 2 = the player blocks; a save that
    //  says nothing (inputLogFormat missing) is 1, the one-player layout below.
    //  Written into every save's trailer by collectGameMeta() in index2.html.
    static INPUT_LOG_FORMAT = 2;

    //  The team a one-player (format 1) log's player was: the LAST value its
    //  session slot (16) was logged at, if that was a team, else 1 - which is what
    //  every such log says, since nothing in the old UI could change it. Used by
    //  migrateInputLogV1() for the inputs and by applyGameMeta() for that player's
    //  relic stash, key slots and marker, so the two can never disagree.
    static legacySessionTeam( log ){
        let team = 1;
        if( !Array.isArray( log ) ){ return team; }
        for(let n = 0; n < log.length; n++){
            const e = log[n];
            if( !Array.isArray( e ) ){ continue; }
            for(let k = 1; k + 1 < e.length; k += 2){
                if( (e[k] | 0) === 16 ){
                    const v = Math.floor( e[k+1] );
                    team = ( v >= 1 && v <= EZWG.PLAYER_TEAMS ) ? v : 1;
                }
            }
        }
        return team;
    }

    //  ── A LOG WRITTEN BEFORE THERE WERE FOUR PLAYERS ────────────────────────
    //  Format 1 is every input log saved before the player blocks existed: ONE
    //  player, whose inputs sat in the old fixed slots - 0-6 the click, 11 WASD,
    //  12 the ADMIN team, 15 Q/E/F, 16 the session team, 22-26 the relic drop,
    //  27-28 king mode, 29-32 the wisdom marker - with 13/14 (ownership overlay,
    //  is-dragging) logged too although the compute shader never read them.
    //
    //  Each old slot is moved to the same input in the block of the team slot 16
    //  named at that point in the log (always 1 in practice - nothing in the old
    //  UI could change it - but read rather than assumed). 13, 14 and 16 are
    //  dropped: they are render-only now, and a replay must not inject them. The
    //  other three teams get the neutral block a fresh engine starts with, put in
    //  the first entry, so a migrated log and a new one mean the same thing about
    //  a player who never touched anything.
    //
    //  The old shader with its one player and the new shader with three idle
    //  blocks make the same decisions on every cell (see THE FOUR PLAYERS in
    //  stimmings_compute.wgsl for the cases that were checked), which is what
    //  lets an old save still replay. Returns a NEW array; the input is untouched.
    static migrateInputLogV1( log ){

        if( !Array.isArray( log ) ){ return log; }

        const OLD_TO_PIN = {
             0: EZWG.PIN.DRAG_X0,   1: EZWG.PIN.DRAG_Y0,   2: EZWG.PIN.DRAG_X1,   3: EZWG.PIN.DRAG_Y1,
             4: EZWG.PIN.TOOL,      5: EZWG.PIN.ENT,       6: EZWG.PIN.CLICK,
            11: EZWG.PIN.WASD,     12: EZWG.PIN.TEAM_SEL, 15: EZWG.PIN.QEF,
            22: EZWG.PIN.RELIC_ENT, 23: EZWG.PIN.RELIC_X, 24: EZWG.PIN.RELIC_Y,
            25: EZWG.PIN.RELIC_GO,  26: EZWG.PIN.RELIC_SEQ,
            27: EZWG.PIN.KING,      28: EZWG.PIN.KING_WIPE,
            29: EZWG.PIN.WIS_PRESS, 30: EZWG.PIN.WIS_X,   31: EZWG.PIN.WIS_Y,  32: EZWG.PIN.WIS_STATE
        };

        let team = 1;
        let out = [];

        for(let n = 0; n < log.length; n++){
            const e = log[n];
            if( !Array.isArray( e ) || !e.length ){ continue; }

            // slot 16 first, wherever it sits in the entry - the rest of this
            // tick's inputs belong to whichever team it says
            for(let k = 1; k + 1 < e.length; k += 2){
                if( (e[k] | 0) === 16 ){
                    const v = Math.floor( e[k+1] );
                    team = ( v >= 1 && v <= EZWG.PLAYER_TEAMS ) ? v : 1;
                }
            }

            let moved = [ e[0] ];

            if( out.length === 0 ){
                for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
                    if( t === team ){ continue; }
                    moved.push( EZWG.playerSlot( t, EZWG.PIN.TOOL ), 1,
                                EZWG.playerSlot( t, EZWG.PIN.WASD ), 4 );
                }
            }

            for(let k = 1; k + 1 < e.length; k += 2){
                const pin = OLD_TO_PIN[ e[k] | 0 ];
                if( pin === undefined ){ continue; }
                moved.push( EZWG.playerSlot( team, pin ), e[k+1] );
            }

            if( moved.length > 1 ){ out.push( moved ); }
        }

        return out;
    }

    //  ══════════  THE PACKED INPUT LOG - HOW A SAVE CARRIES IT  ══════════
    //
    //  In memory the log stays exactly what the recorder writes and the replay
    //  reads - [ step, slot, value, slot, value, ... ], one entry per tick on which
    //  a sim slot changed. This is only how it travels in a save file:
    //  packInputLog() is the save's half (collectGameMeta in index2.html),
    //  unpackInputLog() the load's (handleDrop), and between them they change
    //  nothing. pack unpacks its own answer before handing it over and gives up -
    //  null - on any log it cannot get back word for word, and the save then
    //  carries the plain array, as every save before this one did. So a packed log
    //  replays exactly as the log it was packed from, by construction rather than
    //  by this code being right.
    //
    //  Why it is worth it: the trailer is JSON packed four bytes to a u32 and
    //  written out in decimal, so each character of it costs about 2.75 in the
    //  file. A Q press was two entries, [12345,137,1],[12346,137,0] - 28
    //  characters of JSON. Packed, a few ticks after the entry before it, it is 3.
    //  Over a log the file's share of it comes out about 3x smaller
    //  (util/verify_input_log_codec.js measures it).
    //
    //  THE DIGITS. Every number is a whole number >= 0 written in base 32, least
    //  significant digit first, one character per digit. The 64 characters are
    //  base64url (nothing JSON has to escape): the low 5 bits of a character are
    //  its digit, and bit 5 says another digit follows. 0-31 is one character, up
    //  to 1023 two, up to 32767 three.
    //
    //  ONE ENTRY is
    //
    //      head      (its step - the last entry's step) * 4 + min( pairs, 3 )
    //      more      pairs - 3, only when the low two bits of head are 3
    //      a pair, repeated:
    //        slot    slot - the previous slot in this entry (the first is measured
    //                from INPUT_LOG_PACK_SLOT_ORIGIN, 127 - the slot before team 1's
    //                block), when that is 1 or more - the recorder writes an entry's
    //                slots in increasing order, so it nearly always is. Otherwise a
    //                0, then the slot itself.
    //        value   zigzag( value - this slot's last value in the log ) * 2 + RESET.
    //                Every slot's last value starts at 0, as the replay's own
    //                reconstruction does; zigzag folds the sign in (0, -1, 1, -2 ...
    //                become 0, 1, 2, 3 ...).
    //
    //  RESET is the one thing the packing knows about how the log is made, and it
    //  is only this: a ONE-SHOT (CLICK, QEF, MOMENT ...) is set on one tick, run()
    //  zeroes it after that pass, and so the next tick's entry carries it back to 0.
    //  That second pair says nothing a reader cannot work out, so RESET = 1 on a
    //  pair means "and on the next tick this slot is 0 again", and the pair that
    //  says so is left out. It is taken wherever a slot does that - nothing here
    //  lists which slots are one-shots, so a new one-shot changes nothing about the
    //  packing - but only where the reader can put the pair back exactly where it
    //  was: the 0 is in the FIRST entry of the very next step, that entry's slots
    //  increase (so sorted order is its own order), and nothing in between mentions
    //  the slot. An entry left with nothing in it is dropped and the reader makes
    //  it again - unless another entry of the same step follows it, which the
    //  reader would then take for the first, so then it is written with no pairs.
    //
    //  ⚠ OLD SAVES ARE WRITTEN IN THIS. Change how it reads and every packed save
    //  stops bringing its log back. A different layout goes under a new trailer key
    //  (this one is inputLogPacked), and this reader stays as it is.
    static INPUT_LOG_PACK_DIGITS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    //  What a packed log may hold: whole steps and values no bigger than 2^40
    //  either way, and slots under 2^20. Every slot the sim reads holds a whole
    //  number (a cell, an entity, a key, a flag) - liveInput is Float32 only
    //  because it is a GPU buffer - so a real log never comes near either limit,
    //  and nothing the packing writes passes 2^43, well inside what a double holds
    //  exactly. A log outside them is not packed.
    static INPUT_LOG_PACK_LIMIT = 1099511627776;      // 2^40
    static INPUT_LOG_PACK_SLOTS = 1048576;            // 2^20

    //  Where an entry's first slot is measured from. Part of the format - it is
    //  PLAYER_INPUT_BASE - 1 today, but it is written here as a number so the
    //  packing can never move with anything else.
    static INPUT_LOG_PACK_SLOT_ORIGIN = 127;

    static __packDigitTable = null;

    //  Character code -> its 0..63, or -1 for a character that is not a digit.
    static inputLogPackDigitTable(){
        if( !EZWG.__packDigitTable ){
            const t = new Int8Array( 128 ).fill( -1 );
            for(let i = 0; i < EZWG.INPUT_LOG_PACK_DIGITS.length; i++){
                t[ EZWG.INPUT_LOG_PACK_DIGITS.charCodeAt( i ) ] = i;
            }
            EZWG.__packDigitTable = t;
        }
        return EZWG.__packDigitTable;
    }

    //  Two logs that say the same thing in the same words: the same entries, the
    //  same numbers, in the same order.
    static sameInputLog( a, b ){
        if( !Array.isArray( a ) || !Array.isArray( b ) || a.length !== b.length ){ return false; }
        for(let i = 0; i < a.length; i++){
            const x = a[i], y = b[i];
            if( !Array.isArray( x ) || !Array.isArray( y ) || x.length !== y.length ){ return false; }
            for(let k = 0; k < x.length; k++){
                if( x[k] !== y[k] ){ return false; }
            }
        }
        return true;
    }

    //  The log -> its packed string, or null if it will not pack exactly (the
    //  caller then saves it as it is). Never changes the log it is handed.
    static packInputLog( log ){

        if( !Array.isArray( log ) ){ return null; }
        const LIM = EZWG.INPUT_LOG_PACK_LIMIT;
        const n = log.length;

        // ── what it will take ──────────────────────────────────────────────
        // Steps that never go back, an entry that is a step and whole pairs, and
        // whole numbers inside the limits. Anything else is somebody else's log.
        let total = 0;
        let prevStep = 0;
        for(let i = 0; i < n; i++){
            const e = log[i];
            if( !Array.isArray( e ) || ( e.length & 1 ) === 0 ){ return null; }
            if( !Number.isSafeInteger( e[0] ) || e[0] < prevStep || e[0] > LIM ){ return null; }
            prevStep = e[0];
            for(let k = 1; k < e.length; k += 2){
                if( !Number.isSafeInteger( e[k] ) || e[k] < 0 || e[k] >= EZWG.INPUT_LOG_PACK_SLOTS ){ return null; }
                if( !Number.isSafeInteger( e[k+1] ) || Math.abs( e[k+1] ) > LIM ){ return null; }
            }
            total += ( e.length - 1 ) >> 1;
        }

        // ── every pair, in log order ───────────────────────────────────────
        const pEntry = new Int32Array( total );
        const pSlot  = new Int32Array( total );
        const pValue = new Float64Array( total );
        const first  = new Int32Array( n + 1 );         // entry i's pairs are first[i] .. first[i+1]-1
        let g = 0;
        for(let i = 0; i < n; i++){
            first[i] = g;
            const e = log[i];
            for(let k = 1; k < e.length; k += 2, g++){
                pEntry[g] = i;
                pSlot[g]  = e[k];
                pValue[g] = e[k+1];
            }
        }
        first[n] = g;

        // The first entry after i with a later step (-1: none), and whether an
        // entry's slots strictly increase.
        const firstLater = new Int32Array( n ).fill( -1 );
        for(let i = n - 2; i >= 0; i--){
            firstLater[i] = ( log[i+1][0] > log[i][0] ) ? i + 1 : firstLater[i+1];
        }
        const rising = new Uint8Array( n );
        for(let i = 0; i < n; i++){
            let ok = 1;
            for(let q = first[i] + 1; q < first[i+1]; q++){
                if( !( pSlot[q] > pSlot[q-1] ) ){ ok = 0; break; }
            }
            rising[i] = ok;
        }

        // The next pair of the same slot, for every pair (-1: none).
        const nextSame = new Int32Array( total ).fill( -1 );
        const seen = new Map();
        for(let q = total - 1; q >= 0; q--){
            const nx = seen.get( pSlot[q] );
            if( nx !== undefined ){ nextSame[q] = nx; }
            seen.set( pSlot[q], q );
        }

        // ── RESET: which pairs say "and 0 again next tick", and which pairs
        //    that leaves out ────────────────────────────────────────────────
        const reset = new Uint8Array( total );
        const left  = new Uint8Array( total );
        for(let q = 0; q < total; q++){
            if( pValue[q] === 0 ){ continue; }
            const q2 = nextSame[q];
            if( q2 < 0 || pValue[q2] !== 0 ){ continue; }
            const i = pEntry[q], j = pEntry[q2];
            if( j !== firstLater[i] || log[j][0] !== log[i][0] + 1 || !rising[j] ){ continue; }
            reset[q] = 1;
            left[q2] = 1;
        }

        // ── written out ────────────────────────────────────────────────────
        const D = EZWG.INPUT_LOG_PACK_DIGITS;
        const parts = [];
        const put = ( x ) => {
            for(;;){
                const d = x % 32;
                x = ( x - d ) / 32;
                if( x > 0 ){ parts.push( D[ d + 32 ] ); }
                else{ parts.push( D[ d ] ); return; }
            }
        };

        // Each slot's last value as the reader will have it when it gets here.
        // Updated on every pair, left-out ones too: the reader puts those back
        // before it reads that slot again.
        const last = new Map();
        let lastStep = 0;

        for(let i = 0; i < n; i++){
            const e = log[i];
            let keep = 0;
            for(let q = first[i]; q < first[i+1]; q++){ if( !left[q] ){ keep++; } }

            const emptied = ( keep === 0 && first[i+1] > first[i] );
            const dropIt  = emptied && ( i === n - 1 || log[i+1][0] > e[0] );

            if( !dropIt ){
                put( ( e[0] - lastStep ) * 4 + Math.min( keep, 3 ) );
                if( keep >= 3 ){ put( keep - 3 ); }
                lastStep = e[0];
            }

            let prevSlot = EZWG.INPUT_LOG_PACK_SLOT_ORIGIN;
            for(let q = first[i]; q < first[i+1]; q++){
                const s = pSlot[q], v = pValue[q];
                const was = last.has( s ) ? last.get( s ) : 0;
                last.set( s, v );
                if( left[q] ){ continue; }

                if( s - prevSlot >= 1 ){ put( s - prevSlot ); }
                else{ put( 0 ); put( s ); }
                prevSlot = s;

                const dv = ( v - was ) + 0;                 // + 0: never a -0
                put( ( dv >= 0 ? dv * 2 : -dv * 2 - 1 ) * 2 + reset[q] );
            }
        }

        const packed = parts.join( '' );

        // ── and read back, before anybody is handed it ─────────────────────
        if( !EZWG.sameInputLog( EZWG.unpackInputLog( packed ), log ) ){
            console.log( '⚠ the input log would not pack exactly - saving it unpacked' );
            return null;
        }
        return packed;
    }

    //  A packed string -> the log, or null if it is not one (a bad character, a
    //  number cut off, something past the limits). The trailer's checksum has
    //  already vouched for the bytes, so null here means a bug or a hand edit.
    static unpackInputLog( packed ){

        if( typeof packed !== 'string' ){ return null; }
        const LIM = EZWG.INPUT_LOG_PACK_LIMIT;
        const table = EZWG.inputLogPackDigitTable();
        const len = packed.length;
        let pos = 0;
        let bad = false;

        const get = () => {
            let x = 0, mul = 1;
            for(let k = 0; k < 10; k++){                    // 50 bits is more than any number written
                if( pos >= len ){ bad = true; return 0; }
                const c = packed.charCodeAt( pos++ );
                const d = ( c < 128 ) ? table[c] : -1;
                if( d < 0 ){ bad = true; return 0; }
                x += ( d & 31 ) * mul;
                if( ( d & 32 ) === 0 ){ return x; }
                mul *= 32;
            }
            bad = true;
            return 0;
        };

        const out = [];
        const last = new Map();
        const due = [];         // [ slot, the step it is 0 again ] for every RESET read, in step order
        let step = 0;

        // Resets due before `before` whose entry was dropped: an entry each, in
        // step order, slots in increasing order.
        const makeDropped = ( before ) => {
            while( due.length && due[0][1] < before ){
                const at = due[0][1];
                const slots = [];
                while( due.length && due[0][1] === at ){ slots.push( due.shift()[0] ); }
                slots.sort( ( a, b ) => a - b );
                const made = [ at ];
                for(let k = 0; k < slots.length; k++){
                    made.push( slots[k], 0 );
                    last.set( slots[k], 0 );
                }
                out.push( made );
            }
        };

        while( pos < len ){
            const head = get();
            if( bad ){ return null; }
            let count = head % 4;
            step += ( head - count ) / 4;
            if( count === 3 ){ count += get(); }
            if( bad || step > LIM ){ return null; }

            makeDropped( step );

            const e = [ step ];
            let prevSlot = EZWG.INPUT_LOG_PACK_SLOT_ORIGIN;
            for(let p = 0; p < count; p++){
                const d = get();
                const slot = ( d >= 1 ) ? prevSlot + d : get();
                const code = get();
                if( bad || slot >= EZWG.INPUT_LOG_PACK_SLOTS ){ return null; }

                const z  = ( code - ( code % 2 ) ) / 2;
                const dv = ( z % 2 === 0 ) ? z / 2 : -( z + 1 ) / 2;
                const v  = ( last.has( slot ) ? last.get( slot ) : 0 ) + dv;
                if( Math.abs( v ) > LIM ){ return null; }
                last.set( slot, v );
                e.push( slot, v );
                if( code % 2 === 1 ){ due.push( [ slot, step + 1 ] ); }
                prevSlot = slot;
            }

            // Resets due ON this step go back into this entry - the first of its
            // step - each in its place in slot order.
            while( due.length && due[0][1] === step ){
                const s = due.shift()[0];
                let k = 1;
                while( k < e.length && e[k] < s ){ k += 2; }
                e.splice( k, 0, s, 0 );
                last.set( s, 0 );
            }

            out.push( e );
        }

        makeDropped( Infinity );
        return out;
    }

    //  ══════════  THE WISDOM MARKER  ══════════
    //
    //  'r' drops a marker on the cell under the mouse. For CL.WISDOM_MARKER_LIFETIME
    //  ticks the compute shader forces the WISDOM scent to 63 on that cell, claimed
    //  for the marker's team, and the ordinary scent propagation carries it out from
    //  there (WISDOM MARKER in stimmings_compute.wgsl). Pressing 'r' again anywhere
    //  moves it there and restarts the count. 'f' takes it down early - to the
    //  shader that is just the marker expiring this tick, and the field it laid
    //  fades the way an expired one's does.
    //
    //  ONE MARKER PER TEAM. Each player has their own, in their own block, and
    //  they never share anything: team T's marker is WISDOM_MARKERS[T-1], its
    //  press is WISDOM_PRESSES[T-1], and it reaches the sim through team T's
    //  WIS_* slots. Two markers on the same cell is settled in the shader - the
    //  lower team keeps the cell, the same tie-break the scent itself uses.
    //
    //  A marker is CPU state and it reaches the sim only through liveInput, in
    //  two layers, per team:
    //
    //    THE PRESS     WIS_PRESS = 1 on the one tick an 'r' reaches the sim (a
    //                  one-shot, zeroed after the writeBuffer like CLICK/RELIC_GO/
    //                  KING_WIPE), WIS_X/WIS_Y = the cell under the mouse when it
    //                  was pressed. Or WIS_REMOVE = 1 on the one tick an 'f' does
    //                  (a one-shot too), which needs no cell: a team has only the
    //                  one marker to take down.
    //    THE MARKER    WIS_X/WIS_Y = where the marker stands, WIS_STATE = 0 for no
    //                  marker or its team + 1. This is all the shader reads.
    //
    //  Every one of those is a sim slot, so the input log records both layers
    //  without being asked. That is what makes the marker replay: the one function
    //  that turns a press into a marker, applyWisdomMarkerInput(), runs AFTER
    //  applyReplayInput(), so it reads the press out of the log during a replay and
    //  off the keyboard otherwise, and builds the identical marker either way - and
    //  takes it down on the identical tick. The lifetime is never logged tick by
    //  tick - it is a pure function of which tick the press landed on (and of the
    //  removal, which is logged), and counting it down on every tick would put an
    //  entry in the log for every one of them.
    //
    //  The countdown is one per compute pass that actually RAN (ageWisdomMarker(),
    //  next to this.step++), so a press on tick S is live on passes S .. S+LIFE-1,
    //  a pause holds it, and a paused single step spends exactly one tick of it.
    //
    //  They ride in the save meta as `wisdomMarkers` (collectGameMeta /
    //  applyGameMeta in index2.html). The trailer is frozen after the save tick's
    //  readback, which is after this pass's ageWisdomMarker(), so ticksLeft in the
    //  file is exactly what the first pass of the loaded world starts from.
    //
    //  `team` on a marker is the 2-bit WISDOM team (0 = team 1), the same number
    //  the scent's top bits carry, so it is always T-1 for the marker in slot T-1.

    //  An 'r' at canvas pixel px, py, for the team this page is driving. Taken at
    //  the moment of the key press - it is where the mouse was THEN that the player
    //  meant, not where it has drifted to by the next tick - and held until run()
    //  hands it to a compute pass. A second 'r' before that tick simply replaces
    //  the first. Refused during a replay: playback overwrites the press slots
    //  anyway, so it could never land.
    requestWisdomMarker( px, py ){
        if( this.REPLAY_ACTIVE ){ return false; }
        const team = EZWG.sessionTeam();
        if( team < 1 ){ return false; }
        this.WISDOM_PRESSES[ team - 1 ] = {
            x: this.EZ_SCREEN_TO_CELL_X( px ),
            y: this.EZ_SCREEN_TO_WORLD_Y( py )
        };
        return true;
    }

    //  An 'f' - take down the marker of the team this page is driving, wherever it
    //  stands. It waits in the same place an 'r' does, so of the two keys the one
    //  pressed LAST before the tick is the one that goes out: 'r' then 'f' lands
    //  as no marker, 'f' then 'r' as the new one - what the player did. Accepted
    //  with no marker standing too: the pass still sees it and the log still
    //  records it, it just changes nothing. Refused during a replay, like 'r'.
    requestWisdomMarkerRemoval(){
        if( this.REPLAY_ACTIVE ){ return false; }
        const team = EZWG.sessionTeam();
        if( team < 1 ){ return false; }
        this.WISDOM_PRESSES[ team - 1 ] = { remove: true };
        return true;
    }

    //  Called from run() BEFORE applyReplayInput(): a live press goes into its
    //  team's press slots - or its WIS_REMOVE, for an 'f' - where the replay (if
    //  one is driving) can overwrite it. Every team, not just the session's - a
    //  press made a moment before the switcher moved belongs to the team that
    //  made it.
    stageWisdomPress(){
        for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
            const press = this.WISDOM_PRESSES[ t - 1 ];
            if( !press ){ continue; }
            if( press.remove ){
                this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_REMOVE ) ] = 1;
            }
            else{
                this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_PRESS ) ] = 1;
                this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_X ) ]     = press.x;
                this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_Y ) ]     = press.y;
            }
            this.WISDOM_PRESSES[ t - 1 ] = null;
        }
    }

    //  Called from run() AFTER applyReplayInput() and before recordInputSnapshot():
    //  turn this tick's presses (live or replayed) into markers, then write every
    //  marker into the slots the shader reads. This is also what puts a marker
    //  restored from a save back in front of the shader on the loaded world's
    //  first tick.
    //
    //  A removal is taken BEFORE a press. No page sends both on one tick (the
    //  later key replaces the earlier, see requestWisdomMarkerRemoval), but a
    //  block has to mean one thing whoever filled it, and with both in it that
    //  is the press: a fresh marker, standing whether or not one was before.
    applyWisdomMarkerInput(){
        for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
            if( this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_REMOVE ) ] > 0 ){
                this.WISDOM_MARKERS[ t - 1 ] = null;
            }

            if( this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_PRESS ) ] > 0 ){
                this.WISDOM_MARKERS[ t - 1 ] = {
                    x:         this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_X ) ],
                    y:         this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_Y ) ],
                    team:      t - 1,
                    ticksLeft: EZWG.wisdomMarkerLifetime()
                };
            }

            const m = this.WISDOM_MARKERS[ t - 1 ];
            if( m ){
                this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_X ) ]     = m.x;
                this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_Y ) ]     = m.y;
                this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_STATE ) ] = m.team + 1;
            }
            else{
                // X/Y are left holding the last marker's cell: with STATE at 0 the
                // shader never looks at them, and leaving them alone keeps the
                // expiry (or an 'f') down to one entry in the input log instead of
                // three.
                this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.WIS_STATE ) ] = 0;
            }
        }
    }

    //  One tick of every marker's lifetime, spent by a compute pass that really ran.
    ageWisdomMarker(){
        for(let t = 0; t < EZWG.PLAYER_TEAMS; t++){
            const m = this.WISDOM_MARKERS[ t ];
            if( !m ){ continue; }
            m.ticksLeft--;
            if( m.ticksLeft <= 0 ){
                this.WISDOM_MARKERS[ t ] = null;
            }
        }
    }

    //  ══════════  THE CAMERA PAN, AS AN INPUT  ══════════
    //
    //  The camera is render-only and the sim never sees it (INPUT_SLOT_RENDER_ONLY).
    //  One fact about it is game state all the same: the objective that teaches it
    //  (Lay of the Land, THE OBJECTIVES in index2.html) pays a relic into a stash,
    //  so "this player dragged the map about with king mode off" has to reach the
    //  input log the way a key press does, or a replay could never earn it on the
    //  tick the run did.
    //
    //  So it travels the way an 'r' does. noteGrabPanMoved() takes it when it
    //  happens, CAMERA_PANS holds it per team, and stageCameraPan() hands it to the
    //  next pass - before the replay has its say - as that team's CAM_PAN slot, a
    //  one-shot the pass spends. Once per grab: the first time the drag has carried
    //  the map PAN_INPUT_MIN_PX from where it was grabbed WITH KING MODE OFF. With
    //  it on, the camera belongs to the king and a drag only borrows it - the
    //  objective is about taking it back. The objective checks KING again in the
    //  same pass, off the logged slot (noteObjectiveInputs()).
    //
    //  Where the camera went is still nowhere in the sim: CAM_PAN is 1 or 0 and no
    //  shader reads it. A pan made while PAUSED books no step - looking around must
    //  never move the world - so it waits for the next tick, the way a relic bound
    //  to a key while paused does. A replay drives every sim slot itself, so none
    //  is taken while one is playing.
    noteGrabPanMoved(){
        if( this.ezweb.CELL_PAN_REPORTED || this.REPLAY_ACTIVE ){ return; }
        if( typeof KING_MODE !== 'undefined' && KING_MODE ){ return; }

        const dx = this.ezweb.CELL_PAN_CURR_X - this.ezweb.CELL_PAN_START_X;
        const dy = this.ezweb.CELL_PAN_CURR_Y - this.ezweb.CELL_PAN_START_Y;
        if( dx*dx + dy*dy < EZWG.PAN_INPUT_MIN_PX * EZWG.PAN_INPUT_MIN_PX ){ return; }

        const team = EZWG.sessionTeam();
        if( team < 1 ){ return; }
        this.CAMERA_PANS[ team - 1 ] = true;
        this.ezweb.CELL_PAN_REPORTED = true;
    }

    //  Called from run() next to stageWisdomPress(), BEFORE applyReplayInput().
    //  Every team's, not just the seated one's - a pan made a moment before the
    //  switcher moved belongs to the team that made it.
    stageCameraPan(){
        for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
            if( !this.CAMERA_PANS[ t - 1 ] ){ continue; }
            this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.CAM_PAN ) ] = 1;
            this.CAMERA_PANS[ t - 1 ] = false;
        }
    }

    //  ══════════  THE SPECIAL MOMENT, AS AN INPUT  ══════════
    //
    //  '9' marks a SPECIAL MOMENT: the player saying "something happened here",
    //  so the tick can be found again - in the save, and in a replay of it. Any of
    //  the four players can, and each one's lands in their own block.
    //
    //  It changes nothing in the world - MOMENT is a one-shot no shader reads - but
    //  WHEN it happened is a fact a save has to keep and a replay has to give back,
    //  so it travels the way an 'f' does: requestSpecialMoment() takes the press
    //  for the team this page is playing, MOMENT_PRESSES holds it, and
    //  stageSpecialMoment() hands it to the next pass - before the replay has its
    //  say - as that team's MOMENT slot. The input log records it like any other
    //  slot, and the moment itself is written down off what the pass READ
    //  (noteSpecialMomentInputs() in index2.html, through PASS_INPUT_FUNC), never
    //  off the key - so a replay marks the same moments on the same ticks without
    //  being told, and a key let go of before any pass saw it marks nothing.
    //
    //  Paused, the key books one step, the way a click does (stepForInput() in
    //  index2.html): the press has to reach a pass to be a moment at all. Refused
    //  during a replay - playback drives every sim slot itself, and the moments it
    //  is replaying are already in its log.
    requestSpecialMoment(){
        if( this.REPLAY_ACTIVE ){ return false; }
        const team = EZWG.sessionTeam();
        if( team < 1 ){ return false; }
        this.MOMENT_PRESSES[ team - 1 ] = true;
        return true;
    }

    //  Called from run() next to stageCameraPan(), BEFORE applyReplayInput().
    //  Every team's, not just the seated one's - a '9' pressed a moment before the
    //  switcher moved belongs to the team that pressed it.
    stageSpecialMoment(){
        for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
            if( !this.MOMENT_PRESSES[ t - 1 ] ){ continue; }
            this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.MOMENT ) ] = 1;
            this.MOMENT_PRESSES[ t - 1 ] = false;
        }
    }

    //  ══════════  THE KING'S TELEPORT - WHERE HE IS, SENT WITH THE DROP  ══════════
    //
    //  A relic drop that MOVES a king (ent_relic_king_teleport - THE KING'S TELEPORT in
    //  util/all_ents.js and stimmings_compute.wgsl) needs two cells on the one tick: where
    //  he goes, which the drop carries, and where he IS, so that his cell and the drop cell
    //  can both see the move and agree on it. No cell can search the map for him, so the
    //  second one goes out in the same team's block, KING_X / KING_Y.
    //
    //  It is the one input made from a readback, and it is EXACT rather than a tick stale,
    //  because of where it is taken: here, the moment this pass's inputs are put together,
    //  and no pass is ever encoded while the last one's readback is still out
    //  (READ_SFX_BUFFER_BUSY gates run()). So the king word just handled IS where he
    //  stands as this pass begins - a click-time copy could be one move behind. The shader
    //  trusts none of it: the cell has to hold a living form of that team's king at the start
    //  of the tick, or the drop is refused and handed back. And it is an input like any
    //  other - recorded, replayed, carried by a save's log - so the sim is still a function
    //  of the seed and the log alone.
    //
    //  relicDropKingCell( team, relicEnt ) in index2.html says which drops move a king and
    //  where he is (off currentKingTracks), or null. Called BEFORE applyReplayInput(), so a
    //  replay drives these slots out of its log like every other. Every team's block, for
    //  the same reason the wisdom press is staged for every team.
    stageRelicDropKing(){
        if( typeof relicDropKingCell !== 'function' ){ return; }
        for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
            if( !( this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.RELIC_GO ) ] > 0 ) ){ continue; }
            const cell = relicDropKingCell( t, this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.RELIC_ENT ) ] );
            if( !cell ){ continue; }
            this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.KING_X ) ] = cell.x;
            this.liveInput[ EZWG.playerSlot( t, EZWG.PIN.KING_Y ) ] = cell.y;
        }
    }

    //  CL is defined by the compiled Ex9 bundle, not by this file - read it
    //  defensively so the engine still stands on its own.
    static wisdomMarkerLifetime(){
        return ( typeof CL !== 'undefined' && CL && CL.WISDOM_MARKER_LIFETIME > 0 )
                ? Math.floor( CL.WISDOM_MARKER_LIFETIME ) : 95;
    }

    //  ══════════  THE SFX / CENSUS READBACK, AND WHY IT RETRIES  ══════════
    //
    //  ⚠ A FAILED MAP IS RECOVERABLE, AND IT USED NOT TO BE TREATED THAT WAY.
    //  The words this readback wants are sitting in this.sfxBuffer on the GPU, and
    //  NOTHING can overwrite them while the map is outstanding: the only writer of
    //  sfxBuffer is a compute pass, and run() refuses to encode one while
    //  READ_SFX_BUFFER_BUSY is set. So a rejected mapAsync has destroyed nothing -
    //  it has only failed to fetch something that is still there. Copy again, map
    //  again, and the tick is not lost at all.
    //
    //  That is worth doing because of what losing it costs. The shader deletes a
    //  collected relic on the pass AFTER the census read its row, whether or not
    //  the CPU got that copy, so an unread slice is relics credited to nobody and
    //  the only honest response is to stop the world (noteReadbackLost). Retrying
    //  first turns the ordinary transient failure into one extra frame of latency
    //  instead of a game that has to be saved and reloaded.
    //
    //  WHAT IS DELIBERATELY NOT RETRIED:
    //
    //    a throw out of SFX_HANDLER_FUNC   The data arrived intact - the CONSUMER
    //                                      is broken, and it may have applied half
    //                                      a census walk before it threw. Running
    //                                      it again would double count the half it
    //                                      did manage, which is worse than losing
    //                                      it. Stop, exactly as before.
    //
    //    suicide                           clearExample() destroyed the buffers on
    //                                      purpose for a load or a level change.
    //                                      Nothing to recover, and anything said
    //                                      about it would land in the world that
    //                                      replaced this one.
    //
    //  Past SFX_MAP_MAX_RETRIES the device is almost certainly lost, at which point
    //  retrying would fail forever and silently, so it falls through to the same
    //  hard stop it always had. A save is still allowed out of that stop and is
    //  still lossless - see A RESCUE SAVE DOES NOT BOOK A COMPUTE PASS.
    mapSfxReadback(){

        if( this.suicide || !this.device ){ return; }

        this.READ_SFX_BUFFER_BUSY = true;

        this.cellSfxBufferForReadOnCPU.mapAsync( GPUMapMode.READ, 0, this.sfxValues.byteLength ).then(mappedStaginBuffer => {

            // NO COPY. The handler gets a view straight onto the mapped range -
            // this used to slice(0) the whole thing first, which meant allocating
            // and memcpying the entire readback (128KB now that the census rides
            // along) 15 times a second, for nothing. The handler is synchronous and
            // unmap() happens the moment it returns, so a private copy buys no
            // safety.
            //
            // The one rule that comes with it: SFX_HANDLER_FUNC must READ the
            // buffer, never KEEP it. After unmap() the ArrayBuffer is detached and
            // any stashed view silently reads as empty - it will not throw. Copy out
            // the values you need, not the array.
            let remaped = this.cellSfxBufferForReadOnCPU.getMappedRange( 0, this.sfxValues.byteLength );

            // try/finally because the handler touches live mapped memory: if it
            // throws, the unmap still has to happen or the buffer stays mapped
            // forever and the next tick's copyBufferToBuffer fails against it -
            // which reads as the whole game freezing.
            let handlerThrew = null;
            try{
                if(this.BUFFER_TYPE ==='f32'){
                    this.SFX_HANDLER_FUNC( this.step, new Float32Array(remaped) )
                }
                else if(this.BUFFER_TYPE === 'u32'){
                    this.SFX_HANDLER_FUNC( this.step, new Uint32Array(remaped) )
                }

                // This readback belongs to pass this.step - 1: step was incremented
                // by the run() that encoded the copy. Recorded only on the path
                // where the handler ran to the END, because this is what the save
                // trailer will claim the CPU knows.
                this.lastObservedStep = this.step - 1;

                // The map worked AND was consumed, so the next tick starts with a
                // full retry budget again.
                this.SFX_MAP_RETRIES = 0;
            }
            catch( e ){
                handlerThrew = e;
            }
            finally{
                this.cellSfxBufferForReadOnCPU.unmap();
                this.READ_SFX_BUFFER_BUSY = false;
            }

            // ...and NOW the CPU knows everything this tick did, which is the
            // instant a save's trailer has to be taken. No-op on any tick that is
            // not carrying a save.
            this.freezePendingSaveMeta();

            if( handlerThrew ){
                this.noteReadbackLost( 'SFX_HANDLER_FUNC threw: ' + handlerThrew.message, handlerThrew );
            }
        }).catch( error => {

            this.READ_SFX_BUFFER_BUSY = false;

            // Not a failure - the instance is being thrown away on purpose.
            if( this.suicide ){ return; }

            // THE RECOVERY. sfxBuffer still holds this tick's words because no pass
            // can have run, so ask for them again rather than declaring them lost.
            if( this.SFX_MAP_RETRIES < EZWG.SFX_MAP_MAX_RETRIES && this.device ){
                this.SFX_MAP_RETRIES++;
                console.log( 'sfx/census map failed - retry ' + this.SFX_MAP_RETRIES
                             + ' of ' + EZWG.SFX_MAP_MAX_RETRIES + ' for step ' + (this.step - 1), error );

                const again = this.device.createCommandEncoder();
                again.copyBufferToBuffer(
                    this.sfxBuffer, 0,
                    this.cellSfxBufferForReadOnCPU, 0,
                    this.sfxValues.byteLength
                );
                this.device.queue.submit( [ again.finish() ] );

                this.mapSfxReadback();
                return;
            }

            // Out of retries. This tick was computed and its census slice, its king
            // words and its relic verdict went with it. A save already in flight is
            // still finished - with a trailer that says, truthfully, that it only
            // knows up to lastObservedStep, which is what makes the load repair the
            // difference from the grid.
            this.freezePendingSaveMeta();

            console.log('errrr mapping sfxxxx ', error);
            this.noteReadbackLost( 'the sfx/census readback did not map after '
                                   + EZWG.SFX_MAP_MAX_RETRIES + ' retries', error );
        });
    }

    // Ask to pause. It does NOT take effect here: the tick in flight keeps its
    // queued sub-frames, and the pause lands at the end of the next compute pass
    // (bottom of run()), on phase 0 - the one frame where every entity is drawn
    // exactly on the cell the sim says it is in. That is what makes a click while
    // paused pick the cell you are actually looking at.
    requestPause(){
        if( this.paused || this.pauseRequested ){ return; }
        this.pauseRequested = true;
    }

    resumePlay(){
        // A world stopped by a lost readback does not resume. The next pass is
        // exactly the one that would delete the relics nobody counted - see THE
        // READBACK IS NOT OPTIONAL. Save it and load the file back instead.
        if( this.READBACK_LOST ){
            console.log( 'cannot resume - a readback was lost after step', this.step );
            if( typeof addToConsole === 'function' ){
                addToConsole( 'cannot resume - this world stopped because a tick was never read back. '
                              + 'save it and load the file.', { color: 'red' } );
            }
            return;
        }

        this.pauseRequested = false;
        if( !this.paused ){ return; }
        this.paused = false;
        this.stepRequested = false;

        // The mirror image of the step glide, and the same defect the other way
        // round. The screen is resting on phase 0 of state K with K's move
        // already decided and not yet drawn; if the next tick computed straight
        // away, its phase 0 would put every mover a whole cell along in a single
        // frame. So the first tick after resume spends its window drawing K's
        // sub-frames instead, and the compute lands on the frame they were
        // heading for - exactly as it does on every other tick.
        //
        // Costs one tick of not simulating, once, at the moment of resuming.
        // Nothing else: no step, no snapshot, so it cannot touch determinism.
        this.resumeGlide = true;

        if( this.PAUSE_CHANGED_FUNC ){ this.PAUSE_CHANGED_FUNC( false ); }
    }

    // An input arrived that the SIM has to see - a click, a leader command, a
    // movement key. Paused, the readback is not running, so nothing on the CPU
    // can answer "what is in that cell" or apply a highlight until a compute pass
    // happens; this books the next tick to be one. Ignored while running, where
    // the next tick was going to happen anyway.
    requestSimStep(){
        if( !this.paused ){ return; }
        this.stepRequested = true;
    }

    // Ask for a save. Like an input, it BOOKS A COMPUTE PASS - and it has to, by
    // construction: the file holds the state at the start of step S+1, which is
    // the OUT buffer of the pass it rides on, so there has to BE a pass. Running,
    // one was coming anyway and requestSimStep() no-ops. PAUSED, nothing steps
    // unless something asks, and without this the save sat on WANTING_TO_SAVE
    // until the player happened to unpause or step - which looked exactly like
    // the button doing nothing.
    //
    // So a paused save advances the world by exactly one tick. That is a choice,
    // not an oversight. The alternative was to copy the IN buffer with no pass at
    // all and write step S - the frame actually on screen - but that is a SECOND
    // save path, with its own buffer, its own step and its own relationship to
    // the meta trailer and the census slice. Booking the step keeps ONE path:
    // paused and running produce a file built the same way, off the same buffer,
    // and everything that has been proved about save/load fidelity holds for both
    // without being proved twice.
    //
    // ⚠ THE ONE EXCEPTION IS A SAVE TAKEN AFTER A LOST READBACK. There, booking
    // the step is not neutral - it is the pass that deletes the census slice the
    // CPU never received, so the rescue would spend exactly the relics it was
    // taken to save. run() detects that (RESCUE_SAVE) and copies the IN half with
    // no pass at all. It is a second save path and it is admitted only there,
    // because only there does the one path provably lose state.
    //
    // Returns false if a save is already in flight, so the caller can say so.
    requestSave(){
        if( this.CURRENTLY_SAVING || this.WANTING_TO_SAVE ){ return false; }

        this.WANTING_TO_SAVE = true;

        // The whole reason this method exists rather than the flag being set
        // from the UI. No-op while running.
        this.requestSimStep();

        return true;
    }

    // ── TAKING THE SAVE'S META TRAILER ──────────────────────────────────────
    // Armed by run() on a save tick and called from that tick's sfx/census
    // readback the moment SFX_HANDLER_FUNC has returned - and from that
    // readback's FAILURE path too, because a save already in flight has to be
    // finished either way. Idempotent: whoever gets here first takes the
    // trailer and every later call is a no-op.
    //
    // lastObservedStep is handed to SAVE_META_FUNC as the second argument and is
    // the whole point of the exercise. It is the step whose readback the CPU has
    // actually handled, so the trailer states what it knows instead of being
    // assumed to be level with the grid. On the normal path that is S, the pass
    // the file is the output of, and the loaded world has nothing to make up. On
    // the failure path it is whatever last landed, and the load repairs the
    // difference out of the grid (seedCensusFromLoadedGrid in Ex9_Stimmings2.js).
    freezePendingSaveMeta(){
        if( !this.pendingSaveMetaWanted ){ return; }
        this.pendingSaveMetaWanted = false;
        this.pendingSaveMetaJson = null;

        if( typeof this.SAVE_META_FUNC === 'function' ){
            try{
                this.pendingSaveMetaJson = EZWG.metaToJson(
                    this.SAVE_META_FUNC( this.pendingSaveMetaAtStep, this.lastObservedStep ) );
            }
            catch( e ){
                console.log( 'SAVE_META_FUNC threw - saving grid only:', e.message );
                this.pendingSaveMetaJson = null;
            }
        }

        // Whoever is holding the grid copy can assemble the file now.
        if( this.saveMetaReadyResolve ){
            const resolveIt = this.saveMetaReadyResolve;
            this.saveMetaReadyResolve = null;
            resolveIt();
        }
    }

    // ── A TICK THAT WAS COMPUTED AND NEVER READ BACK ────────────────────────
    // The sim stops here. Why it must is the note over READBACK_LOST; this is
    // what that costs and how it says so.
    //
    // The world rests on the last state the CPU has a complete picture of, and
    // the PAUSE machinery is reused rather than reinvented, so the HUD, the
    // camera, the drag box and the click tools all behave exactly as they do at
    // any other pause. The one difference is that resumePlay() will not lift it:
    // the next pass is precisely the one that would delete the relics nobody
    // counted. Saving still works, and a loaded save comes back clean - the
    // trailer says which step it was observed through and the load repairs the
    // rest from the grid.
    //
    // suicide means clearExample() destroyed the buffers on purpose for a load
    // or a level change. That rejects any readback still in flight and it is not
    // a failure - the instance it belongs to is being thrown away, and halting or
    // announcing anything would land in the world that replaced it.
    noteReadbackLost( why, err ){
        if( this.suicide ){ return; }
        if( this.READBACK_LOST ){ return; }     // already stopped, already said so

        this.READBACK_LOST = true;

        console.log( 'READBACK LOST after step', this.step, '-', why, err ? err : '' );
        console.log( '  the sim is STOPPED. last fully observed step:', this.lastObservedStep );

        this.paused = true;
        this.pauseRequested = false;
        this.stepRequested = false;
        this.cancelSubFrames();
        if( this.PAUSE_CHANGED_FUNC ){ this.PAUSE_CHANGED_FUNC( true ); }

        if( typeof addToConsole === 'function' ){
            addToConsole( 'THE WORLD HAS STOPPED - tick ' + this.step + ' was computed but never read back ('
                          + why + '). save the game and load the file back: carrying on from here would lose '
                          + 'whatever that tick found.', { color: 'red' } );
        }
    }

    // The left-drag rectangle and the is-dragging flag, taken straight off the
    // mouse into the VIEW slots (0-3, 14). EVERY DRAW calls it, so the box on
    // screen tracks the cursor at 60/sec rather than at the tick rate - and, the
    // reason it exists, so that it tracks at all while the game is PAUSED, where
    // run() is not being called and the shader would otherwise be drawing a
    // rectangle from before the pause.
    //
    // Sim-safe by construction now: these are render-only slots, zeroed before
    // every compute pass and never logged. The rectangle the sim ACTS on is a
    // different thing - handleMouseUp() writes it into the player's own block
    // (DRAG_X0..DRAG_Y1) together with the click, once, at the mouseup. So a
    // half-pulled box no longer lands in the input log every tick it is held.
    sampleLiveDrag(){

        if( this.ezweb.isDragging ){

            // An ARMED ACTION KEY turns the mouseup into one relic drop on the cell
            // it comes up on (relicArmedInterceptMouseUp in index2.html) - not the
            // box, and not the builder's line, although the builder is the tool in
            // hand while it is armed. So the drag shows just that cell.
            const dropOnly = ( typeof RELIC_ARMED_SLOT !== 'undefined' && RELIC_ARMED_SLOT >= 0 );

            this.liveInput[0] = dropOnly ? this.ezweb.liveDragX : this.ezweb.dragStartX;
            this.liveInput[1] = (this.ezweb.GRID_SIZE - 1) - ( dropOnly ? this.ezweb.liveDragY : this.ezweb.dragStartY );
            this.liveInput[2] = this.ezweb.liveDragX;
            this.liveInput[3] = (this.ezweb.GRID_SIZE - 1) - this.ezweb.liveDragY;
        }

        this.liveInput[ 14 ] = this.ezweb.isDragging ? 1 : 0;
    }

    //  ── THE VIEW SLOTS ──────────────────────────────────────────────────────
    //  The fragment shader draws the world from ONE player's seat - the team this
    //  page is playing as - and these are what it needs to know about that seat:
    //  the tool in hand (the build overlay), the ownership sparkle, which team it
    //  is (fog, safe placement, whose highlights get the box), and that team's
    //  wisdom marker. Plus the drag box, which sampleLiveDrag() does, and what
    //  that drag will cover - a box, or the builder's line - which is the same
    //  clickShapeForTool() answer handleMouseUp() sends with the click.
    //
    //  All of them are INPUT_SLOT_RENDER_ONLY: never logged, never injected by a
    //  replay, and zeroed before every compute pass. That is what makes the team
    //  switcher a debugging view rather than an input - flipping it changes these
    //  and nothing the sim can read. The marker is COPIED out of the team's own
    //  block, which only run() writes, so a draw always shows the marker the last
    //  pass forced the scent under.
    stampViewSlots(){
        const team = EZWG.sessionTeam();

        this.liveInput[ EZWG.VIEW_SLOT_TOOL ]      = ( typeof CURRENT_TOOL !== 'undefined' ) ? CURRENT_TOOL : 1;
        this.liveInput[ EZWG.VIEW_SLOT_SHAPE ]     = EZWG.clickShapeForTool( this.liveInput[ EZWG.VIEW_SLOT_TOOL ] );
        this.liveInput[ EZWG.VIEW_SLOT_OWNERSHIP ] = this.ezweb.shownerShip ? 1 : 0;
        this.liveInput[ EZWG.VIEW_SLOT_TEAM ]      = team;

        if( team >= 1 ){
            this.liveInput[ EZWG.VIEW_SLOT_WIS_X ]     = this.liveInput[ EZWG.playerSlot( team, EZWG.PIN.WIS_X ) ];
            this.liveInput[ EZWG.VIEW_SLOT_WIS_Y ]     = this.liveInput[ EZWG.playerSlot( team, EZWG.PIN.WIS_Y ) ];
            this.liveInput[ EZWG.VIEW_SLOT_WIS_STATE ] = this.liveInput[ EZWG.playerSlot( team, EZWG.PIN.WIS_STATE ) ];
        }
        else{
            this.liveInput[ EZWG.VIEW_SLOT_WIS_STATE ] = 0;
        }
    }

    //  ── THE PLAYER BLOCK OF THE TEAM THIS PAGE IS DRIVING ───────────────────
    //  A player who has stopped being driven - the switcher moved off them, or a
    //  world was just loaded - lets go of what they were HOLDING. Standing
    //  instructions (king mode, and the last click's tool, entity and team, which
    //  nothing reads without a new click) stay exactly as they were left: a real
    //  player who looked away would still have them set. Q/E/F needs nothing
    //  here, it is a one-shot.
    releasePlayerHeldInputs( team ){
        if( !( team >= 1 && team <= EZWG.PLAYER_TEAMS ) ){ return; }
        this.liveInput[ EZWG.playerSlot( team, EZWG.PIN.WASD ) ] = 4;
    }

    //  What a fresh engine gives every team before anybody touches anything:
    //  the eye dropper in hand and standing still. Everything else is 0.
    resetPlayerBlock( team ){
        if( !( team >= 1 && team <= EZWG.PLAYER_TEAMS ) ){ return; }
        for(let k = 0; k < EZWG.PLAYER_INPUT_STRIDE; k++){
            this.liveInput[ EZWG.playerSlot( team, k ) ] = 0;
        }
        this.liveInput[ EZWG.playerSlot( team, EZWG.PIN.TOOL ) ] = 1;
        this.liveInput[ EZWG.playerSlot( team, EZWG.PIN.WASD ) ] = 4;
    }

    // Do a full pass
    run(){


        // READBACK_LOST stops ordinary ticks dead (see the note over it) and lets
        // exactly one thing through: a save, because the player needs their world
        // in a file.
        //
        // That save does NOT get a compute pass. This used to read "that pass
        // cannot make the loss any worse - the relics the lost slice was carrying
        // are still standing on the map, and the file catches them there", and it
        // was exactly backwards: pass Q deletes the relics pass Q-1 dumped, so the
        // pass a rescue save would book is precisely the one that deletes the
        // slice the lost readback never delivered, and the file is that pass's
        // OUTPUT. See A RESCUE SAVE DOES NOT BOOK A COMPUTE PASS just below.
        if( !this.READ_BUFFER_BUSY && !this.READ_SFX_BUFFER_BUSY && this.device && !this.CURRENTLY_SAVING && !WANT_TO_LOAD_NEW
            && ( !this.READBACK_LOST || this.WANTING_TO_SAVE ) ){

            // -- A RESCUE SAVE DOES NOT BOOK A COMPUTE PASS -------------------
            // The one case where running a pass is the DESTRUCTIVE act rather
            // than the harmless one. A collectible relic takes its TRANS2 decay
            // on the pass AFTER the census read its row (COLLECTED BY THE CPU
            // CENSUS in stimmings_compute.wgsl), so pass Q deletes exactly the
            // relics pass Q-1 dumped. When pass S's readback is the one that was
            // lost, the next pass - S+1, which is the one a rescue save would
            // book - deletes precisely the slice the CPU never received, and the
            // file is the OUTPUT of that pass, so it does not catch them either.
            // The relics the stop existed to protect are spent by the rescue.
            //
            // So the rescue takes the IN half with no pass at all:
            // cellStateStorage[ step % 2 ] is the output of pass S, where those
            // relics are still standing, and the step in the filename does not
            // move. The trailer then says it was observed through S-1 against a
            // grid that is the output of S, which is exactly the "behind" case
            // seedCensusFromLoadedGrid() already repairs - and the blind slice it
            // works out, (loadStep + PASS - 1) % PASS, IS the lost slice.
            //
            // AND THE REPAIR IS BIT-IDENTICAL TO THE TICK IT REPLACES, which
            // falls straight out of not moving the step. The live sweep catalogues
            // pass P's slice with timeIndex = P+1 (SFX_HANDLER_FUNC is handed
            // this.step, already incremented), and catalogRelicType() picks the
            // specific relic type from relicPickHash( timeIndex, x, y ). A rescue
            // save leaves step at S+1, so the file says S+1, so the load's repair
            // catalogues the blind slice with timeIndex = S+1 - the very number
            // the uninterrupted run would have used. Same cells, same step, same
            // hash, same picks. Had the step moved, the counts would have come
            // back right and the relic TYPES would have silently differed from
            // what the same seed and the same inputs produce with no interruption.
            //
            // This is a second save path, which the design otherwise refuses (see
            // requestSave). It is worth it only here, because here the ordinary
            // path provably loses state; everywhere else the two would be the
            // same file built two ways.
            const RESCUE_SAVE = ( this.READBACK_LOST && this.WANTING_TO_SAVE );

            let encoder = this.device.createCommandEncoder();
            // Start a compute pass
            let computePass = encoder.beginComputePass();


            
            //console.log('INCOMING_STEP', INCOMING_STEP); // TODO remove..
            if( INCOMING_STEP > -1 ){
                this.step = 0+INCOMING_STEP;

                // A loaded world starts with every player standing still. The
                // standing inputs came back with the input log (adoptInputLog),
                // held movement does not - nobody is holding a key in a world
                // that was just opened, and three of the four blocks have no
                // keyboard behind them to let go of it.
                for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
                    this.releasePlayerHeldInputs( t );
                }


                EZWG.SHA1.seed( LAST_SEED_TOLAOD )
                LAST_SEED_TOLAOD = '';

                INCOMING_STEP = -1;
            }

            this.liveInput[ this.USER_INPUT_BUFFER_SIZE - 1 ] = this.step

            // (The live drag rectangle is a VIEW slot now and only the draws need
            //  it - sampleLiveDrag() is called by renderFrame(). The click the sim
            //  acts on is written into the player's block by handleMouseUp.)


            // The camera used to be advanced right here, once per sim tick. It now
            // advances once per DRAWN FRAME inside renderFrame(), so a drag-pan or a
            // scroll-zoom reads at the full 60/sec. (updateCameraForFrame)

            // ── THE INPUT SNAPSHOT ───────────────────────────────────────────
            // Every slot the compute pass reads is filled in HERE, above the
            // writeBuffer, so the pass about to be encoded sees the keys and
            // buttons as they are right now.
            //
            // This block used to sit BELOW the write, which cost it a whole tick:
            // writeBuffer copies at call time, so a key pressed during tick N was
            // only stamped into liveInput at the bottom of run() N and did not
            // reach a compute pass until N+1. Running, that was a 66ms delay
            // nobody had noticed. PAUSED it is fatal - a single step exists
            // precisely to let the sim see one input, and it would have seen the
            // input from before the pause instead, needing a second step to catch
            // up. Same snapshot either way, one tick earlier.
            //
            // ── THIS PAGE DRIVES ONE BLOCK ───────────────────────────────────
            // Everything below goes into the block of the team this page is
            // playing as (CURRENT_SESSION_PLAYER_ID, which the team switcher in
            // the top right moves). The other three blocks are left exactly as
            // they stand - whatever their own player last set, or neutral - so a
            // switch is not an input and is not in the log. What IS in the log is
            // what each block then held, which is all the sim ever reads.
            this.liveInput[ 10 ] =CURRENT_RMODE;   // rendre mode

            const pageTeam = EZWG.sessionTeam();

            // ── WASD -> ONE OF THE NINE ─────────────────────────────────────
            // The WASD slot is a 3x3 NEIGHBOUR INDEX, not a key code. The shader reads
            // it as `dx = -1 + i32(iw%3)`, `dy = -1 + i32(iw/3)`, so the numbers
            // lay out exactly like a numpad with Y counting UP the way EZY does:
            //
            //      6  7  8         up-left    up      up-right
            //      3  4  5         left      STAY     right
            //      0  1  2         down-left  down    down-right
            //
            // This used to be an if/else chain over the four keys, which could
            // only ever name the four cardinals - W beat D, so a player holding
            // both walked straight up. Everything downstream was ALREADY built
            // for nine: the neighbour scan in stimmings_compute.wgsl walks all
            // eight surrounding cells and takes `iw == wasd_input` as the
            // top-scoring move whichever one it is, and scent-driven units have
            // been moving diagonally on their own the whole time. It was only
            // this encoding that could not say "up and right".
            //
            // So it is built from the two AXES instead of picked from a list.
            // Opposite keys held together cancel that axis rather than one
            // winning by being higher up an if/else - which is what makes
            // W+A+D come out as plain W, and is the only reading that
            // generalises. It is a real change to one case: W+S used to mean up
            // and now means stay put.
            //
            // 'x' is the DEAD STOP, and it is deliberately still checked after
            // the directions and not folded into them: 9 is off the 3x3 grid
            // entirely, so it matches no neighbour and the unit stands - which
            // is a different instruction from 4 ("move to my own cell"), and one
            // a held direction key still overrides exactly as it did before.
            if( pageTeam >= 1 ){
                const wasdX = ( RT_RIGHT ? 1 : 0 ) - ( RT_LEFT ? 1 : 0 );
                const wasdY = ( RT_UP    ? 1 : 0 ) - ( RT_DOWN ? 1 : 0 );
                const wasdSlot = EZWG.playerSlot( pageTeam, EZWG.PIN.WASD );

                if( wasdX !== 0 || wasdY !== 0 ){
                    this.liveInput[ wasdSlot ] = (wasdY + 1) * 3 + (wasdX + 1);
                }
                else if( RT_X ){
                    this.liveInput[ wasdSlot ] = 9;   // dead stop ('x'  button)
                }
                else{
                    this.liveInput[ wasdSlot ] = 4;
                }

                // (The ADMIN team - CURRENT_TEAM_SEL - is NOT written here any
                //  more. It only means anything to a click, so it travels WITH
                //  the click: handleMouseUp() puts it in the block next to the
                //  tool and the entity. Written here every tick as well, it would
                //  overwrite a pending click's team with whatever the page had
                //  moved on to by the tick.)

                // A one-shot now, like CLICK: zeroed with the others after the
                // writeBuffer. It always was one in effect - the SEND_* flags are
                // spent at the bottom of every run() - but a block this page has
                // stopped driving would otherwise go on holding the last press
                // forever, and that player's units would fire it every tick.
                this.liveInput[ EZWG.playerSlot( pageTeam, EZWG.PIN.QEF ) ] =
                    (SEND_SPACE_NEXT?(1 << 2):(0)) | (SEND_E_NEXT?(1 << 1):(0)) | (SEND_Q_NEXT?(1 << 0):(0));

                // ── KING MODE IS AN INPUT, NOT A CAMERA SETTING ──────────────
                // 'm' is render-only - it moves the camera and the sim never hears
                // about it. 'k' is NOT: king mode holds the king HIGHLIGHTED, and a
                // highlight is what makes WASD and the Q/E/F channels reach a leader
                // at all (see the myDesire == 3/4 branches in stimmings_compute.wgsl).
                // So it belongs in the snapshot with the other keys, and a replay of
                // the same seed plus the same inputs still gives the same world - king
                // mode is simply one more of those inputs. Per team: each player's
                // own flag lights that player's own king.
                this.liveInput[ EZWG.playerSlot( pageTeam, EZWG.PIN.KING ) ] =
                    ( typeof KING_MODE !== 'undefined' && KING_MODE ) ? 1 : 0;

                // ── WHICH ACTION KEYS HOLD A RELIC ───────────────────────────
                // A bitmask, bit k-1 for key k (relicKeysInputFor() in index2.html,
                // off this team's teamRelicKeySlots). The shader never reads it: it
                // is here so the one objective that is about the relic HUD - "equip a
                // relic to an action key" - is decided off a logged input like every
                // other one (THE OBJECTIVES in index2.html). A binding is UI state and
                // a replay does not re-make it, but the log does carry this, so the
                // replay earns the objective on the same tick the run did. Written
                // every tick like KING, so it can never disagree with the HUD for
                // longer than one tick. The other three blocks keep what their own
                // team last had - a team's keys only change while it is seated here.
                this.liveInput[ EZWG.playerSlot( pageTeam, EZWG.PIN.RELIC_KEYS ) ] =
                    ( typeof relicKeysInputFor === 'function' ) ? relicKeysInputFor( pageTeam ) : 0;
            }

            // An 'r' (or an 'f') pressed since the last tick goes into its team's
            // slots here, where a replay can still overwrite it. See THE WISDOM
            // MARKER. So does a right-button drag that moved the camera with king
            // mode off - see THE CAMERA PAN, AS AN INPUT - a '9' (THE SPECIAL
            // MOMENT, AS AN INPUT), and the king's cell that goes out with a relic
            // drop that moves him (THE KING'S TELEPORT).
            this.stageWisdomPress();
            this.stageCameraPan();
            this.stageSpecialMoment();
            this.stageRelicDropKing();

            // ── RENDER-ONLY SLOTS ARE ZEROED FOR THE SIM ─────────────────────
            // These belong to the DRAW, or to the one player sitting at this
            // screen: which interpolation phase it is, whether the game is paused,
            // a wall clock that keeps running while it is, the channel reaction
            // flash, and the VIEW slots - the drag box under the mouse, the tool
            // in hand, the ownership sparkle, which team this page is playing as
            // and that team's wisdom marker. renderFrame() writes the same buffer
            // the compute pass reads, so the only thing standing between them and
            // the simulation is this: they go out as zero to every compute pass,
            // and are put back by the very next draw.
            //
            // Nothing in stimmings_compute.wgsl reads them, and this is the
            // guarantee that adding a reader could never make a paused game
            // simulate differently from a running one - or make the TEAM
            // SWITCHER, which is not an input, change what the world does.
            for(let z = 0; z < EZWG.INPUT_SLOT_ZEROED_FOR_COMPUTE.length; z++){
                this.liveInput[ EZWG.INPUT_SLOT_ZEROED_FOR_COMPUTE[z] ] = 0;
            }

            // ── THE REPLAY SPEAKS LAST, AND THE LOG LISTENS ─────────────────
            // Both of these sit in the one gap where liveInput is final: the
            // render-only slots are zeroed above, and the writeBuffer below is
            // what the compute pass will actually read. Anything earlier would log
            // a number the shader never saw; anything later would log it after the
            // one-shots have been spent.
            //
            // Order matters. The replay overwrites every sim slot FIRST so that it
            // beats any live input that got past the UI lock, and the recorder runs
            // second so that - were recording ever left on during a replay - it
            // would still write down what the pass really received.
            //
            // The wisdom markers sit between the two, and they are the one thing
            // that may: derived state, rebuilt from each team's press slot AFTER the
            // replay has had its say, so a replayed press builds the same marker a
            // live one did - and BEFORE the recorder, so the log holds the marker
            // slots the shader actually read. See THE WISDOM MARKER.
            this.applyReplayInput();
            this.applyWisdomMarkerInput();
            this.recordInputSnapshot();

            // ── ...AND THE GAME READS THE SAME NUMBERS THE LOG JUST WROTE DOWN ─
            // PASS_INPUT_FUNC is handed liveInput exactly as this pass will read it:
            // final, replay applied, one-shots not yet spent. The objectives that are
            // about INPUTS - a Q in king mode, a relic on an action key, a wisdom
            // marker standing, the camera dragged with king mode off - are decided
            // here (THE OBJECTIVES in index2.html) and
            // never in a key handler, which fires between ticks for presses a pass
            // may never see, and not at all during a replay. So "earned" means "the
            // simulation was handed it", in a run and in its replay alike.
            //
            // ⚠ READ-ONLY. Anything it wrote into liveInput now would go to the GPU
            // without being in the log above, and a replay would drift. Not called
            // on a rescue save: that runs no pass, so nothing was read.
            if( !RESCUE_SAVE && typeof this.PASS_INPUT_FUNC === 'function' ){
                try{ this.PASS_INPUT_FUNC( this.step, this.liveInput ); }
                catch( e ){ console.log( 'PASS_INPUT_FUNC threw', e ); }
            }

            // Write value of the buffer w users values
            // (userIn_uniformBuffer is NOT re-uploaded here - see the note where it is
            //  created. It is zeros, nothing reads it, and it was being written every
            //  single tick.)
            this.device.queue.writeBuffer( this.userInputTempStorage, 0, this.liveInput);

            // ── THE ONE-SHOTS ARE SPENT ─────────────────────────────────────
            // Every team's, by the pass that has just been recorded with them in
            // it. A step taken while paused consumes them exactly like a running
            // tick does, so an input can never be applied twice by pausing around
            // it. EZWG.PLAYER_ONE_SHOT_SLOTS is the list:
            //
            //   CLICK      the box drag / blueprint / force place
            //   QEF        the three leader channels (the SEND_* flags behind the
            //              page's own block are spent at the bottom of run() too)
            //   RELIC_GO   a relic drop - its own trigger, so a drop can never
            //              collide with a box selection. RELIC_ENT/X/Y are left
            //              as they are (harmless once GO is 0), and RELIC_SEQ is
            //              deliberately NOT cleared: it is what the shader stamps
            //              into the verdict word, and that word is read back long
            //              after this tick has gone.
            //   KING_WIPE  king mode's OFF -> ON edge. A separate slot from KING
            //              rather than an edge the shader works out for itself: a
            //              cell has no memory of what KING said last tick.
            //   WIS_PRESS  an 'r' - already turned into WISDOM_MARKERS, which
            //              carries it from here on; WIS_X/Y keep the marker's cell.
            //   WIS_REMOVE an 'f' - already taken out of WISDOM_MARKERS, the same.
            //   CAM_PAN    a right-button drag that moved the camera - CAMERA_PANS
            //              let go of it when it was staged.
            //   MOMENT     a '9' - MOMENT_PRESSES let go of it when it was staged,
            //              and noteSpecialMomentInputs() has already written the
            //              moment down off PASS_INPUT_FUNC above.
            for(let t = 1; t <= EZWG.PLAYER_TEAMS; t++){
                for(let k = 0; k < EZWG.PLAYER_ONE_SHOT_SLOTS.length; k++){
                    this.liveInput[ EZWG.playerSlot( t, EZWG.PLAYER_ONE_SHOT_SLOTS[k] ) ] = 0;
                }
            }


            // TODO should remove this when debugin done
            if( PRINT_OUT_NEXT_RUN ){
                console.log( "this.step for PRINT_OUT_NEXT_RUN:", this.step )
            }
            PRINT_OUT_NEXT_RUN = false;

            //}
            //// The real indicator is userIn
            //else{
            //	let deadInput = ( new Float32Array( USER_INPUT_BUFFER_SIZE) ).fill( 0.0 );
            //	this.device.queue.writeBuffer( userInputTempStorage, 0, deadInput);
            //}

            // An EMPTY pass on a rescue save - begun and ended, never dispatched,
            // which is legal and keeps one encoder shape for both paths. See
            // A RESCUE SAVE DOES NOT BOOK A COMPUTE PASS above.
            if( !RESCUE_SAVE ){
                computePass.setPipeline( this.simulationPipeline ); 
                computePass.setBindGroup( 0, this.bindGroups[ this.step % 2 ] );

                let workgroupCount = Math.ceil( this.GRID_SIZE / this.WORKGROUP_SIZE );
                computePass.dispatchWorkgroups( workgroupCount, workgroupCount );
            }
            computePass.end();


            
            // const resolveBuffer = this.device.createBuffer({
            //     size: 16,
            //     usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
            // });
            // encoder.resolveQuerySet(myQuerySet, 0, 2, resolveBuffer, 0); 
            // // Currently, we have to create a separate GPUBuffer mapped for reading and use copyBufferToBuffer()...
            // const resultBuffer = this.device.createBuffer({
            //     size: 16,
            //     usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            // });
            // encoder.copyBufferToBuffer(resolveBuffer, 0, resultBuffer, 0, 16);

            // ── WHAT GETS COPIED BACK TO THE CPU THIS TICK ───────────────────
            // The sfx + census copy is UNCONDITIONAL. It used to be the ELSE of
            // the big-grid copy, which meant a save silently ate that tick's census
            // slice: CENSUS_ROWS of map that the sweep had promised to deliver once
            // every CENSUS_PASS_TICKS simply never arrived, and those rows then had
            // to wait a whole further pass. That turns the one thing the census is
            // FOR - "anything sitting still for one full sweep is always seen" -
            // from a guarantee into a probability, and the failure is invisible:
            // the per-slice counts just leave the stale numbers standing.
            //
            // The two copies write to different staging buffers and are waited on
            // through different busy flags, so there was never a reason for them to
            // be alternatives beyond the shape of the if/else. Cost of doing both on
            // a save tick: one extra 128KB copy, on a tick that is already copying
            // the entire ~52MB cell grid.
            let wantSaveNow = this.WANTING_TO_SAVE;
            let doReadBack  = wantSaveNow ||
                              ( this.READ_BACK_FREQ > -1 && (this.step % this.READ_BACK_FREQ === 0) );

            const encoder_mr_cpu_helper = this.device.createCommandEncoder();

            // ALWAYS - except on a rescue save, which ran no pass, so sfxBuffer
            // still holds the output of the pass whose readback was LOST. Copying
            // it would either re-deliver a slice the handler already half consumed
            // before it threw, or re-deliver one the trailer is about to declare
            // (through metaObservedThroughStep) that the CPU never saw - and the
            // load would then catalogue it a second time. Nothing is observed on a
            // rescue tick; the trailer says so, and the load repairs it from the
            // grid.
            if( !RESCUE_SAVE ){
                encoder_mr_cpu_helper.copyBufferToBuffer(
                    this.sfxBuffer, 0, // Source offset
                    this.cellSfxBufferForReadOnCPU, 0, // Destination offset
                    this.sfxValues.byteLength   // sfx word window + this tick's census slice
                );
            }

            if( doReadBack ){
                // ── THE HALF OF THE PING/PONG A SAVE HAS TO GRAB ─────────────
                // State for the start of step S lives in cellStateStorage[ S % 2 ],
                // so the pass encoded above (step S - this.step is still
                // pre-increment here) is writing storage[ (S+1) % 2 ]. That OUT
                // buffer is the state as of the start of step S+1, and S+1 is
                // exactly the number stamped into the save filename below, which is
                // what init() then uses to put the grid back into the correct half
                // on load. The frame and the buffer are ONE decision, not two.
                //
                // Ordering is submit order, not luck: the compute encoder goes into
                // the same submit() ahead of this one, so the copy always sees the
                // finished pass.
                encoder_mr_cpu_helper.copyBufferToBuffer(
                    // Normally the OUT half of the pass just encoded. On a rescue
                    // save there was no pass, so it is the IN half - the output of
                    // the last pass that really ran, which is the state the step in
                    // the filename already names.
                    this.cellStateStorage[ RESCUE_SAVE ? (this.step % 2) : ((this.step+1) % 2) ], 0, // Source offset
                    this.cellStateStorageForRead, 0, // Destination offset
                    this.cellStateArray.byteLength
                );
            }


            // A rescue save computed nothing, so the world is still at the start
            // of this.step and the filename must keep saying so. Moving it here
            // would stamp a step whose pass never happened.
            if( !RESCUE_SAVE ){
                this.step++; // Increment the this.step count

                // ...and the wisdom marker has stood for one more of them. Same
                // gate, same reason: a rescue save ran no pass, so no tick of the
                // marker's life went by either.
                this.ageWisdomMarker();
            }

            // ── THE META IS FROZEN AFTER THIS TICK'S READBACK, NOT HERE ─────
            // The grid copy encoded above is the output of pass S - the state at
            // the start of step S+1 - and this.step is S+1 as of the line above.
            // The trailer has to describe THAT moment, and a good half of what
            // rides in it is not known yet: this tick's census slice, this tick's
            // king words (a death among them) and this tick's relic drop verdict
            // are all sitting in a staging buffer that has not been mapped.
            //
            // Freezing here, as this used to, made the trailer the CPU's view as
            // of pass S-1 against a grid that was the output of pass S. Everything
            // only pass S's readback could teach was therefore missing from the
            // file, and the two things that cannot be recovered from a grid made
            // that a real hole: a king who died on the save's own tick came back
            // ALIVE at a stale cell with his grave read as somebody's masonry, and
            // a relic drop rejected on the save's own tick came back spent with
            // nothing on the board. The census slice WAS recoverable, and was being
            // recovered by a whole block of load-side repair (THE ONE SLICE AN
            // OLDER SAVE CANNOT CARRY in Ex9_Stimmings2.js) that only ever existed
            // because of this.
            //
            // So the trailer is ARMED here and taken at the bottom of this tick's
            // sfx readback handler instead, the instant SFX_HANDLER_FUNC returns -
            // the first moment the CPU knows everything pass S did, and still
            // inside the same synchronous block, so nothing can interleave between
            // the last observation and the stringify. The grid copy waits on it:
            // the two mapAsync promises come off one submit with no ordering
            // between them, so whichever lands first, the file is built from a
            // trailer and a grid that describe the same instant.
            //
            // ⚠ IT IS STILL A STRING TAKEN AT ONE INSTANT, and it has to be - the
            // download callback runs whenever the mapAsync resolves and a live
            // relics array is a reference. What that instant no longer is, is
            // "before this tick was looked at".
            //
            // ⚠ AND THE ONE GAP IT OPENS IS CLOSED IN index2.html. Between run()
            // returning and this readback resolving, the browser can dispatch a
            // click - and a relic drop spends its relic on the CPU the moment it is
            // clicked, while the placement itself waits for a compute pass that
            // CURRENTLY_SAVING is holding back. That would write the relic into the
            // trailer as spent with nothing in the file's grid to show for it, so
            // requestRelicDrop() refuses while a save is in flight.
            if( doReadBack ){
                this.pendingSaveMetaJson = null;
                this.pendingSaveMetaWanted = true;
                this.pendingSaveMetaAtStep = this.step;
                this.saveMetaReady = new Promise( resolve => { this.saveMetaReadyResolve = resolve; } );
            }

            // A rescue save has no sfx/census readback coming, so the thing that
            // normally takes the trailer will never run. Take it here instead -
            // still synchronously, still before anything can interleave, and with
            // lastObservedStep left exactly where the lost readback left it. That
            // gap between it and the grid is the whole signal the load repairs on.
            if( RESCUE_SAVE ){ this.freezePendingSaveMeta(); }

            SEND_Q_NEXT =       false;
            SEND_E_NEXT =       false;
            SEND_SPACE_NEXT =   false;

            // NOTE: the drawing is NOT part of this command buffer any more. The
            // picture gets drawn RENDERS_PER_TICK times per tick (renderFrame below +
            // the timers in scheduleSubFrames), and each of those draws re-uploads
            // liveInput with a new interpolation phase / camera. Keeping the draws in
            // their own submits is what stops that fresher input from leaking back
            // into the compute pass that has already been recorded here - the sim
            // still only ever sees the one snapshot taken at the top of run().

            // ONE submit for the compute pass and whichever copies were encoded
            // above it. Order within a submit is program order, so every copy sees
            // the finished pass.
            this.device.queue.submit( [
                encoder.finish(),
                encoder_mr_cpu_helper.finish()
            ] );

            if( doReadBack === true ){
                this.READ_BUFFER_BUSY = true;

                // The copy is already encoded against the correct ping/pong half, so
                // the save has no PASS left to wait for - it does wait for this tick's
                // meta trailer, which is a different thing and is below. This used to
                // hold out for an EVEN post-increment step (i.e. to save ON an odd one)
                // purely so the step in the filename made load's hardcoded storage[0]
                // correct.
                // init() indexes by parity now, so a save lands on the very next
                // tick at whatever parity that is - and it no longer spends the
                // census slice it used to skip while waiting.
                if( wantSaveNow ){
                    this.WANTING_TO_SAVE = false;
                    this.CURRENTLY_SAVING = true;
                }

                
                // Map the staging buffer
                this.cellStateStorageForRead.mapAsync( GPUMapMode.READ, 0, this.cellStateArray.byteLength ).then(async mappedStaginBuffer => {
                    // Read and print the contents
                    // Same no-copy rule as the sfx readback below - see the long note
                    // there. This one matters more than it looks: the slice(0) that
                    // used to be here cloned the ENTIRE cell grid (GRID² x CELL_VALS
                    // x 4 = ~52MB at 1024) on every save, purely to hand it to a
                    // reader that consumes it synchronously.
                    let remaped = this.cellStateStorageForRead.getMappedRange( 0, this.cellStateArray.byteLength );
                    //let theUi8 = new Uint8Array( dudata );
                    var uint32ArrayBuffer = null;

                    if( !this.CURRENTLY_SAVING ){
                        if(this.BUFFER_TYPE ==='f32'){
                            //console.log(float32ArrayBuffer)
                            //goThroughF32ValsAndReprint( float32ArrayBuffer, this );
                            this.READ_BACK_FUNC( this.step, new Float32Array(remaped) )
                        }
                        else if(this.BUFFER_TYPE === 'u32'){
                            this.READ_BACK_FUNC( this.step, new Uint32Array(remaped) )
                        }
                        this.cellStateStorageForRead.unmap();
                        this.READ_BUFFER_BUSY = false;
                    }

                    // Yes saving, ge tthe download link
                    else{

                        // ── WAIT FOR THIS TICK'S TRAILER, THEN WRITE THE FILE ───
                        // The trailer is taken at the bottom of this same tick's
                        // sfx/census readback (THE META IS FROZEN AFTER THIS TICK'S
                        // READBACK in run()), and these two mapAsync promises come
                        // off one submit with no guaranteed order between them. So
                        // the grid waits for it rather than racing it.
                        //
                        // The mapped range stays mapped across the await and that
                        // costs nothing: CURRENTLY_SAVING has the sim stopped, so
                        // nothing is going to copy into this buffer behind us. The
                        // wait itself is one readback - the grid copy it is waiting
                        // on the other side of is ~52MB, so this is noise.
                        if( this.saveMetaReady ){
                            await this.saveMetaReady;
                            this.saveMetaReady = null;
                        }

                        uint32ArrayBuffer = new Uint32Array(remaped);
                        //this.READ_BACK_FUNC( this.step, uint32ArrayBuffer )

                        // Convert Uint32Array to a string of space-separated numbers
                        const textContent = uint32ArrayBuffer.join(' ');

                        // ── AND THE META TRAILER, IN THE SAME NUMBER STREAM ──
                        // Appended as more space-separated u32s so the file stays
                        // ONE format and the loader stays one split(). See THE SAVE
                        // FILE META TRAILER. Null trailer => byte-identical to the
                        // old format, which is what keeps this backward compatible
                        // in both directions.
                        const metaWords = EZWG.encodeMetaTrailer( this.pendingSaveMetaJson );
                        this.pendingSaveMetaJson = null;

                        // Two Blob parts rather than one concatenated string: the
                        // grid text is ~55MB and concatenating would copy all of it
                        // again to bolt a few hundred bytes on the end.
                        const parts = metaWords
                            ? [ textContent, ' ', metaWords.join(' ') ]
                            : [ textContent ];

                        // Create a Blob object with the content
                        const blob = new Blob(parts, { type: 'text/plain' });
                    
                        // Create a link to download the file
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = STIMMINGS_APP_VERSION + 
                            '_' + this.CHUNKS_ACROSS + 'x' + this.CHUNK_SIZE
                            + '_' + 
                            this.step + '_' + 
                            EZWG.SHA1.state.lastseed + '.txt'; // Filename
                        link.click();
                    
                        // Clean up the URL object after the download
                        URL.revokeObjectURL(link.href); 
                        
                        // console.log("done savin..");
                        // console.log('Makin usre -- everying is known...')
                        // console.log('this.step', this.step)
                        // console.log(this.liveInput)
                        this.CURRENTLY_SAVING = false;
                        this.READ_BUFFER_BUSY = false;

                        this.cellStateStorageForRead.unmap();
                        // TODO should remove this when debugin done
                        PRINT_OUT_NEXT_RUN = true;
                        
                    }
                    
                }).catch( error => {
                    this.READ_BUFFER_BUSY = false;

                    // The save (or the periodic readback) is dead. Disarm the
                    // trailer request so the next one starts clean and let go of a
                    // promise nobody is waiting on any more, then say so out loud:
                    // this used to leave CURRENTLY_SAVING set forever, which reads
                    // in game as the world freezing for no stated reason.
                    this.pendingSaveMetaWanted = false;
                    this.pendingSaveMetaJson = null;
                    this.saveMetaReadyResolve = null;
                    this.saveMetaReady = null;
                    if( this.CURRENTLY_SAVING ){
                        this.CURRENTLY_SAVING = false;
                        console.log( 'SAVE FAILED - the grid copy never mapped. Nothing was written.' );
                        if( typeof addToConsole === 'function' ){
                            addToConsole( 'save failed - the grid could not be read back. nothing was written.',
                                          { color: 'red' } );
                        }
                    }

                    console.log('errrr mapping big grid', error);
                }); 
            }
            // A BARE BLOCK, not an else: the sfx + census readback happens on EVERY
            // tick, save ticks included. See the note above the copies.
            //
            // The body of it lives in mapSfxReadback() so that a FAILED map can ask
            // for the very same words again - see the long note on that method.
            {
                this.SFX_MAP_RETRIES = 0;
                this.mapSfxReadback();
            }



            // ── WHERE A PAUSE LANDS ──────────────────────────────────────────
            // A pause asked for mid-tick has been riding pauseRequested until
            // now. This compute pass is the one it lands on: the tick it was
            // pressed during got to finish its sub-frames, and the picture comes
            // to rest on the phase 0 below - entities exactly on their cells,
            // which is what makes clicking, the inspector and the drag outline
            // agree with what is on screen.
            //
            // Set BEFORE the draw so that draw already carries the paused flag.
            let enteringPause = false;
            if( this.pauseRequested ){
                this.pauseRequested = false;
                this.paused = true;
                this.stepRequested = false;
                enteringPause = true;

                // Spend nothing later: a pan glide still in flight would sit on
                // its velocity for the whole pause and cash it in on unpause,
                // which reads as the camera drifting off on its own.
                //
                // A HELD ARROW KEY is the exception. It gets its own rAF loop the
                // moment the pause lands (below), so its speed is being spent
                // every frame and there is nothing banked to cash in - dropping it
                // here would just make the camera stumble the instant you hit
                // pause with an arrow down.
                if( this.ezweb.KEY_PAN_X === 0 && this.ezweb.KEY_PAN_Y === 0 ){
                    this.ezweb.CELL_VEL_X = 0.0;
                    this.ezweb.CELL_VEL_Y = 0.0;
                    this.ezweb.KEY_PAN_GLIDING = false;
                }

                if( this.PAUSE_CHANGED_FUNC ){ this.PAUSE_CHANGED_FUNC( true ); }

                // Paused, the tick loop stops drawing, so anything mid-motion at
                // the boundary has to be handed the paused loop or it freezes
                // until the next input event. Self-guarded, and it stops itself
                // as soon as nothing wants it.
                if( this.pausedAnimWanted() ){ this.startPausedAnim(); }
            }

            if( this.paused && !enteringPause ){
                // A rescue save moved nothing, so there is no move to play out -
                // gliding here would replay the last one and read as the world
                // ticking after it was told it had stopped.
                if( RESCUE_SAVE ){
                    this.renderFrame( 0 );
                    this.cancelSubFrames();
                }
                else{
                    // A SINGLE STEP. Do not draw the new state yet - play the move
                    // that just executed first, and land on it at the end. See
                    // scheduleStepGlide.
                    this.scheduleStepGlide();
                }
            }
            else{
                // Draw the state that was just computed - phase 0 is the sim tick
                // itself (every entity sitting exactly on its cell), then two more
                // draws get queued inside this same 1/UPDATE_INTERVAL window to
                // fill in the gaps.
                this.renderFrame( 0 );

                if( enteringPause ){
                    // Rest here. No sub-frames: phases 1..n-1 would slide entities
                    // toward a tick that is not going to be computed. Nothing
                    // jumps - the sub-frames of the tick the pause was pressed
                    // during were predicting exactly this frame.
                    this.cancelSubFrames();
                }
                else{
                    this.scheduleSubFrames();
                }
            }

            //console.log("this.step==>", this.step);
            //console.log(resultBuffer);
            //https://developer.mozilla.org/en-US/docs/Web/API/GPUQuerySet
            //https://github.com/gpuweb/gpuweb/issues/4383
            //what da spruce man

            return true;    // a compute pass really did happen - see tick()
        }
        else if(!this.device){
            console.log("ERRROOORRRR how is there no device?!")
        }
        else{
            console.log('READ BUFFER BUSY: ', this.READ_BUFFER_BUSY, 'at time index', this.step)
        }
        //}

        // Nothing stepped: a readback is still mapped, or a save or a load has the
        // buffers. tick() keeps the step request alive on the strength of this, so
        // an input asked for while paused is never quietly dropped.
        return false;
    }


    //  ══════════  SUB-FRAME RENDERING (60 draws a second, whatever the tick)  ══════════
    //  run() does exactly one compute pass per UPDATE_INTERVAL and that is the ONLY
    //  thing that touches the simulation. Everything below just re-draws the state
    //  that pass produced, so none of it can change what the sim does.
    //
    //      phase 0    -  drawn immediately by run(), entities on their own cells
    //      phase p    -  p/RENDERS_PER_TICK through the tick, movers slid that far
    //
    //  (at 4 sub-frames: 0, a quarter, a half, three quarters of a cell)
    //
    //  The compute pass has already written each entity's next move intention into
    //  attribute 1, so the shader knows where a mover is headed before it gets
    //  there - see the SUB-FRAME INTERPOLATION block in stimmings_fragment.wgsl.

    // Drop any draws that are still queued for the tick that just ended.
    cancelSubFrames(){
        if( !this.subFrameTimers ){ return; }
        for( let t = 0;t < this.subFrameTimers.length;t++ ){
            clearTimeout( this.subFrameTimers[ t ] );
        }
        this.subFrameTimers.length = 0;
    }

    // Queue phases 1..RENDERS_PER_TICK-1 evenly across the rest of this tick.
    scheduleSubFrames(){
        this.cancelSubFrames();

        for( let p = 1;p < this.RENDERS_PER_TICK;p++ ){
            let whenMs = Math.round( (this.UPDATE_INTERVAL * p) / this.RENDERS_PER_TICK );
            this.subFrameTimers.push(
                setTimeout( () => { this.renderFrame( p ); }, whenMs )
            );
        }
    }

    //  ══════════  THE STEP GLIDE (paused single step)  ══════════
    //  A stepped tick shows the move that JUST EXECUTED, not the one after it.
    //
    //  Running, the sub-frames are a PREDICTION and they get away with it: the
    //  state on screen slides toward where the next compute pass will put it, and
    //  that pass always arrives 66ms later to catch it. Paused it never arrives,
    //  so playing the same frames after a single step made the entity slide 3/4
    //  of a cell toward a move that was not going to happen and then snap back.
    //  Drawing the NEW state at phase 0 first made it worse - that is a whole-cell
    //  teleport, and then the slide-and-rewind on top of it.
    //
    //  So a step replays the OUTGOING state's sub-frames instead. Attribute 1 of
    //  state N already holds the move that executes on the way to N+1 (the compute
    //  pass writes each intention a tick before it happens), so state N at phase p
    //  is the entity p/n of the way through the move it just made:
    //
    //      [N p0]  [N p1]  [N p2]  [N p3]      [N+1 p0]
    //       rest    <-- the move being made -->  rest
    //
    //  These are the exact four frames the running game draws for that tick, in
    //  the same order - a step is now a normal tick played at whatever speed the
    //  player asks for it.
    //
    //  The opening [N p0] is drawn IMMEDIATELY and is why held keys stay even. It
    //  is a harmless redraw of the resting frame when it follows a rest, and when
    //  it follows another step it is the landing frame that step's timer never got
    //  to draw - the next tick cancels the timer at the moment it was due. Either
    //  way every quarter cell gets one frame and no position is skipped.
    scheduleStepGlide(){
        this.cancelSubFrames();

        // the glide owns the screen for one tick window - startPausedAnim reads
        // this so a left-drag's rAF loop cannot draw phase 0 over every frame
        this.stepGlideEndsAt = performance.now() + this.UPDATE_INTERVAL;

        this.renderFrame( 0, true );        // land the transition BEFORE this one

        for( let p = 1;p < this.RENDERS_PER_TICK;p++ ){
            let whenMs = Math.round( (this.UPDATE_INTERVAL * p) / this.RENDERS_PER_TICK );
            this.subFrameTimers.push(
                setTimeout( () => { this.renderFrame( p, true ); }, whenMs )
            );
        }

        // ...and land THIS one, which becomes the resting frame
        this.subFrameTimers.push(
            setTimeout( () => { this.renderFrame( 0 ); }, Math.round( this.UPDATE_INTERVAL ) )
        );
    }

    // Advance the camera by ONE DRAWN FRAME.
    //
    // This used to run once per sim tick with dt baked in as 1. Now it runs
    // RENDERS_PER_TICK times per tick, so the impulse, the ease-out and the distance
    // travelled all get scaled by dt and still add up to what they were before.
    //
    // dt is measured in PAN_TUNED_MS, not in ticks. The camera is the one thing here
    // that belongs to the player rather than to the simulation, so slowing the sim
    // down must not slow down how fast the map scrolls under the mouse. At 60fps dt
    // works out to 1/3 whether the sim is running at 20 ticks x 3 draws or 15 x 4.
    // Shortest way from a to b along a wrapping GRID_SIZE axis, signed. Without
    // this the tracker cam would take the long way round whenever the units it is
    // chasing sit on the other side of the world seam.
    shortestWrapDelta( a, b ){
        const G = this.GRID_SIZE;
        let d = ( ( (b - a) % G ) + G ) % G;
        if( d > G*0.5 ){ d -= G; }
        return d;
    }

    // ── IS THE CAMERA DRIVING ITSELF RIGHT NOW? ─────────────────────────────
    // Two toggles reach the same glide: the tracker cam ('m', follow the middle
    // of the highlight) and KING MODE ('k', follow the king and nothing else).
    // They are asked as one question in all three of the places that care -
    // the drift itself, the arrow-key release and the grab-pan release - because
    // what those three actually want to know is "is something else steering",
    // and answering it in one place is what stops a mode being added and one of
    // the three quietly not hearing about it.
    //
    // KING MODE WINS where they disagree, and it wins in SFX_HANDLER_FUNC rather
    // than here: with king mode on, that handler aims TRACKER_CAM_TARGET_* at the
    // king instead of at the highlight average, so 'm' being on as well changes
    // nothing. One target, one glide, no two cameras pulling against each other.
    //
    // PAUSED, NOTHING FOLLOWS. A pause is when the player stops to look and to
    // place things, and the paused draws (a left-drag's rAF loop, a relic
    // placement's step glide, every mousemove redraw) would each spend another
    // slice of the glide - so the map slid off toward the king mid-placement.
    // Both toggles stay on; they just take the camera back on unpause. Asked here
    // rather than at the drift so the arrow-key release coasts like any other
    // paused throw instead of being cancelled for a follower that is not moving.
    camIsAutoFollowing(){
        if( this.paused ){ return false; }
        return ( typeof KING_MODE   !== 'undefined' && KING_MODE   )
            || ( typeof TRACKER_CAM !== 'undefined' && TRACKER_CAM );
    }

    // ...and does it know where it is going? Separate because "following" decides
    // whether the player's own throw gets cancelled (it must, the instant the
    // toggle goes on) while "has a target" only decides whether there is anywhere
    // to drift to this frame.
    camHasFollowTarget(){
        return ( typeof TRACKER_CAM_HAS_TARGET !== 'undefined' && TRACKER_CAM_HAS_TARGET );
    }

    updateCameraForFrame(){

        const dt = (this.UPDATE_INTERVAL / this.RENDERS_PER_TICK) / EZWG.PAN_TUNED_MS;

        // GRAB PAN: the map is dragged, not pushed. The cell that was under the
        // cursor when the button went down is put back under the cursor, every
        // drawn frame - so the world tracks the mouse 1:1 with no lag and no
        // run-on, the way a canvas does under a finger.
        //
        // Solving for the pan from a held WORLD point (rather than integrating a
        // screen-pixel delta) is what makes a zoom mid-drag free: EZ_PX_PER_CELL()
        // is re-read here, so a wheel notch while the button is down rescales
        // about the grabbed cell instead of sliding the map out from under it.
        //
        // These two are the inverses of EZ_SCREEN_TO_CELL_X / _WORLD_Y further
        // down - change those and change these. They stay CONTINUOUS on purpose:
        // those two floor the pixel (they answer "which CELL did you point at"),
        // while a held grab has to track the cursor sub-pixel or the map jerks
        // along a pixel at a time. Do not floor these.
        //      worldX = px/z + panX          ->  panX = grabX - px/z
        //      worldY = GRID - (py+1)/z + panY   ->  panY = grabY - GRID + (py+1)/z
        if( this.ezweb.CELL_PAN_IS_GOING ){

            const z = this.EZ_PX_PER_CELL();

            let wantX = this.ezweb.CELL_PAN_GRAB_X - (this.ezweb.CELL_PAN_CURR_X / z);
            let wantY = this.ezweb.CELL_PAN_GRAB_Y - this.GRID_SIZE + ((this.ezweb.CELL_PAN_CURR_Y + 1) / z);

            // Measure the throw as we go, in cells per PAN_TUNED_MS - the same
            // units the ease-out below runs in. Smoothed, because the last frame
            // before a release is very often the one where the hand had already
            // stopped, and an unsmoothed reading would throw that nothing.
            const keep = Math.pow( EZWG.PAN_FLING_SMOOTH, dt );
            this.ezweb.CELL_VEL_X = this.ezweb.CELL_VEL_X * keep + ((wantX - this.ezweb.CELL_FLOAT_X) / dt) * (1 - keep);
            this.ezweb.CELL_VEL_Y = this.ezweb.CELL_VEL_Y * keep + ((wantY - this.ezweb.CELL_FLOAT_Y) / dt) * (1 - keep);

            this.ezweb.CELL_FLOAT_X = wantX;
            this.ezweb.CELL_FLOAT_Y = wantY;
        }

        // ARROW-KEY PAN: a held arrow is a throttle. The camera eases toward a top
        // speed in the pressed direction instead of teleporting a fixed number of
        // cells per keydown, and it writes into the SAME CELL_VEL_X/Y the grab-pan
        // throw uses - so letting the key up needs no code of its own, it just
        // falls through to the coast below and stops like a released drag.
        //
        // Top speed is quoted in SCREEN pixels and divided by px-per-cell here,
        // which is the whole of "proportional to zoom": one constant speed under
        // the eye, more cells per second the further out you are. EZ_PX_PER_CELL()
        // is re-read every frame, so a wheel notch mid-hold retunes it live.
        //
        // Diagonals are normalised - two keys must not be 1.41x faster than one.
        else if( this.ezweb.KEY_PAN_X !== 0 || this.ezweb.KEY_PAN_Y !== 0 ){

            const z = this.EZ_PX_PER_CELL();

            let dirX = this.ezweb.KEY_PAN_X;
            let dirY = this.ezweb.KEY_PAN_Y;
            const len = Math.sqrt( dirX*dirX + dirY*dirY );
            dirX /= len;
            dirY /= len;

            // cells per PAN_TUNED_MS, the units the whole camera runs in
            const top = ( EZWG.KEY_PAN_TOP_PX_PER_SEC / z ) * ( EZWG.PAN_TUNED_MS / 1000 );

            const closeBy = 1 - Math.pow( 1 - EZWG.KEY_PAN_ACCEL, dt );

            this.ezweb.CELL_VEL_X += ( dirX*top - this.ezweb.CELL_VEL_X ) * closeBy;
            this.ezweb.CELL_VEL_Y += ( dirY*top - this.ezweb.CELL_VEL_Y ) * closeBy;

            this.ezweb.CELL_FLOAT_X += this.ezweb.CELL_VEL_X * dt;
            this.ezweb.CELL_FLOAT_Y += this.ezweb.CELL_VEL_Y * dt;

            // Claim the glide, so a paused release still gets the frames it needs
            // to spend the throw (see pausedAnimWanted).
            this.ezweb.KEY_PAN_GLIDING = true;
        }

        // ...and coast to a stop after the release, shedding PAN_FLING_DAMP of
        // the speed every PAN_TUNED_MS however many frames that takes.
        else if( this.ezweb.CELL_VEL_X !== 0.0 || this.ezweb.CELL_VEL_Y !== 0.0 ){

            let damp = Math.pow( EZWG.PAN_FLING_DAMP, dt );
            this.ezweb.CELL_VEL_X *= damp;
            this.ezweb.CELL_VEL_Y *= damp;

            if( Math.abs(this.ezweb.CELL_VEL_X) < EZWG.PAN_FLING_STOP &&
                Math.abs(this.ezweb.CELL_VEL_Y) < EZWG.PAN_FLING_STOP ){
                this.ezweb.CELL_VEL_X = 0.0;
                this.ezweb.CELL_VEL_Y = 0.0;

                // The throw is spent; a paused rAF loop kept alive by it can stop.
                this.ezweb.KEY_PAN_GLIDING = false;
            }

            this.ezweb.CELL_FLOAT_X += this.ezweb.CELL_VEL_X * dt;
            this.ezweb.CELL_FLOAT_Y += this.ezweb.CELL_VEL_Y * dt;
        }

        // TRACKER CAM: drift toward the middle of whatever is highlighted - or, in
        // KING MODE, at the king and nothing else. The target is worked out once
        // per tick in SFX_HANDLER_FUNC (it needs the readback to know what is
        // highlighted, and to know where the king is); the drift runs per DRAWN
        // FRAME like the rest of the camera, so it is smooth at 60fps and
        // dt-normalised exactly the way the drag-pan is. A right-drag pan wins
        // while it is held.
        else if( this.camIsAutoFollowing() && this.camHasFollowTarget() ){

            const closeBy = 1 - Math.pow( 1 - EZWG.TRACKER_CAM_EASE, dt );

            this.ezweb.CELL_FLOAT_X += this.shortestWrapDelta( this.ezweb.CELL_FLOAT_X, TRACKER_CAM_TARGET_X ) * closeBy;
            this.ezweb.CELL_FLOAT_Y += this.shortestWrapDelta( this.ezweb.CELL_FLOAT_Y, TRACKER_CAM_TARGET_Y ) * closeBy;
        }

        // SMOOTH ZOOM: the pan keeps its FRACTION now (it used to be rounded to a
        // whole cell, which made the world jitter by up to half a cell while the
        // scale was changing). Wrapped into [0, GRID_SIZE) so the shader can treat
        // it as a positive offset, and so u32() in the compute shader still lands
        // on the same whole cell it always did.
        CURRENT_PAN_X = ( (this.ezweb.CELL_FLOAT_X % this.GRID_SIZE) + this.GRID_SIZE ) % this.GRID_SIZE;
        CURRENT_PAN_Y = ( (this.ezweb.CELL_FLOAT_Y % this.GRID_SIZE) + this.GRID_SIZE ) % this.GRID_SIZE;

        this.liveInput[ 7 ] = CURRENT_PAN_X;
        this.liveInput[ 8 ] = CURRENT_PAN_Y;
        this.liveInput[ 9 ] = this.EZ_PX_PER_CELL();
    }

    // Draw the current GPU state at one interpolation phase. Renders only - no
    // compute pass, no readback, no step change, so this is safe to call as often
    // as we like without moving the simulation.
    //
    // replayPrev draws the OUTGOING state instead - the one the compute pass just
    // consumed, which is still sitting untouched in the other half of the double
    // buffer until the NEXT pass overwrites it. That is a whole tick away, and the
    // queue orders these draws ahead of it anyway, so the read is safe.
    //
    // It exists for the paused single step: see scheduleStepGlide. Its clock goes
    // back a tick with it, because a state is always drawn one step behind the
    // counter (run() stamps liveInput[last] BEFORE incrementing), and a sprite
    // whose animation frame jumped forward and back again would undo the point of
    // the exercise.
    renderFrame( interpPhase, replayPrev ){

        if( !this.device || !this.loaded || this.suicide || !this.cellPipeline ){ return; }

        const drawStep = replayPrev ? Math.max( 0, this.step - 1 ) : this.step;

        if( replayPrev ){
            this.liveInput[ this.USER_INPUT_BUFFER_SIZE - 1 ] = Math.max( 0, this.step - 2 );
        }

        this.INTERP_PHASE = interpPhase % this.RENDERS_PER_TICK;
        this.liveInput[ 17 ] = this.INTERP_PHASE;

        // Paused, and a clock that keeps running while the sim's does not.
        // gametime and RENDER_STEP are both frozen during a pause (they are built
        // out of the step counter), so anything that has to keep moving while
        // stopped - the pulsing selection outline - has to be driven from here.
        // Both are wiped before the next compute pass writes its snapshot, so
        // neither can reach the simulation. See RENDER-ONLY SLOTS in run().
        this.liveInput[ 18 ] = this.paused ? 1 : 0;
        this.liveInput[ 19 ] = performance.now() * 0.001;

        // ── SCENT MODE, RE-STAMPED PER DRAW ─────────────────────────────────
        // Slot 10 is written by run() as well, and that write is the one the
        // compute pass sees - this is purely so the picture can follow the mode
        // while the sim is STOPPED. Before this, pressing 't' paused changed the
        // toggle, the console line and CURRENT_RMODE, and then nothing happened on
        // screen until somebody took a step: setScentMode's requestPausedRedraw()
        // dutifully drew a frame with the OLD mode still in the buffer.
        //
        // Safe by construction: nothing in stimmings_compute.wgsl reads slot 10
        // (only rMode in the fragment shader does), and run() overwrites it with
        // CURRENT_RMODE immediately above its own writeBuffer regardless, so every
        // compute pass sees exactly the value it saw before.
        //
        // It matters more than it used to: BOTH flashing overlays are keyed to this
        // mode now - leaders flash in mode 2, the channel reaction flash takes modes
        // 0 and 1 - and the channel half is gated in JS, so it switches instantly.
        // Without this the two would disagree for a whole tick while paused.
        if( typeof CURRENT_RMODE !== 'undefined' ){
            this.liveInput[ 10 ] = CURRENT_RMODE;
        }

        // -- CHANNEL REACTION FLASH ------------------------------------------
        // Slot 20 is the entity in the inspector, slot 21 is how hard to tint
        // everything that feeds its channels - the decaying pulse after a click
        // with HELP up, or the steady hold of scent mode 2. That envelope is a
        // WALL CLOCK animation, so it is worked out per DRAWN FRAME, here, and
        // never per tick: it has to keep flashing while the sim is stopped, which
        // is exactly when somebody is sat reading the inspector.
        //
        // Render only, and zeroed for every compute pass alongside 17/18/19 above.
        // The GAME owns the state (channelFlashForFrame in index2.html) - the other
        // examples in src/examples have no inspector, hence the guard.
        let chFlash = ( typeof channelFlashForFrame === 'function' ) ? channelFlashForFrame() : null;
        this.liveInput[ 20 ] = chFlash ? chFlash[0] : 0;
        this.liveInput[ 21 ] = chFlash ? chFlash[1] : 0;

        // Where the mouse has dragged to as of THIS frame. Paused this is the
        // only thing keeping the selection box under the cursor at all, since
        // run() is not being called - see sampleLiveDrag.
        this.sampleLiveDrag();

        // ...and the rest of what the screen needs to know about the player sat
        // at it. run() zeroes all of these for the compute pass; this puts them
        // back for every draw. See THE VIEW SLOTS.
        this.stampViewSlots();

        this.updateCameraForFrame();

        // Fresh camera + phase for the shader. The compute pass for this tick was
        // submitted before this write, so it never sees any of it.
        this.device.queue.writeBuffer( this.userInputTempStorage, 0, this.liveInput );

        const rEncoder = this.device.createCommandEncoder();
        const pass = rEncoder.beginRenderPass( {
            colorAttachments: [ {
                view: this.context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: { r: 0, g: 0, b: 0, a: 1 },//{ r: 0, g: 0, b: 0.4, a: 1.0 },
                storeOp: "store",
            } ]
        } );

        // Draw the grid.
        pass.setPipeline( this.cellPipeline );
        pass.setBindGroup( 0, this.bindGroups[ drawStep % 2 ] ); // Updated!
        pass.setVertexBuffer( 0, this.vertexBuffer );

        if( this.FRAG_PIXEL_MODE ){
            pass.draw( 6, 1 );
        }
        else{
            pass.draw( this.vertices.length / 2, this.GRID_SIZE * this.GRID_SIZE * (this.PARTS_ACROSS*this.PARTS_ACROSS) );
        }

        // End the render pass and submit the command buffer
        pass.end();

        this.device.queue.submit( [ rEncoder.finish() ] );

        // Put the clock back where run() left it, so the next draw is a normal one
        if( replayPrev ){
            this.liveInput[ this.USER_INPUT_BUFFER_SIZE - 1 ] = Math.max( 0, this.step - 1 );
        }
    }

    // ── DRAWING WHILE PAUSED ────────────────────────────────────────────────
    // Two ways the picture keeps moving with the sim stopped, and they are for
    // different jobs:
    //
    //   requestPausedRedraw()  ONE frame, coalesced per animation frame. For
    //                          something that moved because the mouse moved -
    //                          a grab pan, a wheel notch. No mouse event, no
    //                          frame, so an idle pause costs nothing.
    //   startPausedAnim()      a rAF LOOP, for something that has to keep
    //                          animating on its own: the pulsing dotted outline
    //                          under a left-drag. Stops itself the moment the
    //                          drag ends or the game unpauses.
    //
    // Render only, both of them: no step, no readback, no sim (pitfall 7).
    startPausedAnim(){

        if( !this.paused || this.pausedAnimOn ){ return; }

        this.pausedAnimOn = true;

        const spin = () => {

            if( !this.paused ){ this.pausedAnimOn = false; return; }

            // A step glide owns the screen while it plays. It is drawing the move
            // that just executed, one phase at a time, and a phase-0 draw on top
            // would wipe out every frame of it. Keep spinning, just do not draw -
            // and do not stop either, so a drag that ended mid-glide still gets
            // its final frame below once the glide is done.
            if( performance.now() < this.stepGlideEndsAt ){
                requestAnimationFrame( spin );
                return;
            }

            // Stopping still costs ONE more frame. The frame that ends the drag
            // is the frame that has to rub the outline out - requestPausedRedraw
            // is suppressed while this loop owns the screen, so if the loop just
            // returned here the dotted box would sit there until the step it
            // booked got round to drawing, and longer than that if the step was
            // held up by a readback.
            if( !this.pausedAnimWanted() ){
                this.pausedAnimOn = false;
                this.renderFrame( 0 );
                return;
            }

            this.renderFrame( 0 );
            requestAnimationFrame( spin );
        };

        requestAnimationFrame( spin );
    }

    // What is worth burning 60 frames a second on while nothing is simulating.
    // The arrow keys are in here twice over: while one is held there is a camera
    // to accelerate, and after it comes up there is still a throw to spend - and
    // a glide that stopped drawing halfway through would just be the old jump
    // back again, with extra steps.
    pausedAnimWanted(){
        return this.ezweb.isDragging || this.ezweb.CELL_PAN_IS_GOING
            || this.ezweb.KEY_PAN_X !== 0 || this.ezweb.KEY_PAN_Y !== 0
            || this.ezweb.KEY_PAN_GLIDING

            // The channel reaction flash, which breathes on the wall clock and does
            // not expire - so unlike everything above it, this can hold the loop
            // open indefinitely while paused. That is deliberate: the overlay is
            // supposed to keep flashing while stopped, and a pause is exactly when
            // somebody is sat reading the inspector it belongs to. Render only, so
            // it costs GPU and nothing else, and closing the inspector, turning HELP
            // off or switching to scent mode 2 each end it immediately.
            || ( typeof channelFlashAnimating === 'function' && channelFlashAnimating() );
    }

    // ── ARROW-KEY PAN: the only way in ──────────────────────────────────────
    // index2.html calls this with the CURRENT held direction (-1/0/+1 per axis,
    // y UP) whenever an arrow goes down or comes up - and with (0,0) on blur,
    // because a key held as the window loses focus never sends its keyup and the
    // camera would scroll off on its own forever.
    //
    // RENDER ONLY, on purpose. It moves the camera and nothing else: no step, no
    // stepForInput(), no readback, no RNG (pitfall 7). Paused it draws frames
    // WITHOUT running the sim, which is exactly what makes it work while stopped -
    // the pan reaches the compute pass in slots 7/8 the same way a grab pan or a
    // wheel notch does, and the same way it always has.
    setKeyPan( dirX, dirY ){

        this.ezweb.KEY_PAN_X = dirX;
        this.ezweb.KEY_PAN_Y = dirY;

        if( dirX !== 0 || dirY !== 0 ){

            // A held arrow takes the map off the grab-pan/tracker glide the way a
            // finger on a scrolling page does. (A right-drag still wins while it
            // is held - it is checked first in updateCameraForFrame.)
            this.ezweb.KEY_PAN_GLIDING = true;

            // Paused there is no tick drawing anything, so the acceleration needs
            // its own frames. The loop stops itself once the throw is spent.
            this.startPausedAnim();
        }
        else if( this.camIsAutoFollowing() ){

            // Same call the grab pan makes on release: the tracker cam and king
            // mode are both standing instructions, so they take the camera back
            // the moment the player is off the controls rather than fighting a
            // coasting throw.
            this.ezweb.CELL_VEL_X = 0.0;
            this.ezweb.CELL_VEL_Y = 0.0;
            this.ezweb.KEY_PAN_GLIDING = false;
            this.requestPausedRedraw();
        }
    }


    // ── THE CANVAS FOLLOWS THE WINDOW ───────────────────────────────────────
    // Resizing is RENDER ONLY, and structurally so: no compute pass reads the
    // canvas size, or the zoom, or anything else about the screen. The only
    // screen-ish thing stimmings_compute.wgsl looks at is the pan (slots 7/8),
    // and only to anchor the SFX readback window - never to decide what a cell
    // does. So this cannot touch determinism, saves or replays, in the same way
    // and for the same reason that zoom cannot.
    //
    // It is also nearly free. There is one render target and it is the
    // swapchain (see renderFrame) - no depth buffer, no msaa, no offscreen
    // textures sized to the canvas - and the draw is a clip-space fullscreen
    // quad, so no geometry depends on the resolution either.
    //
    // The fragment shader needs nothing: it works out the world position from
    // fragCoord anchored at the TOP LEFT, and its y flip is against
    // EZ_CELLS_ACROSS_Y - the GRID height, not the canvas height. Growing the
    // canvas therefore reveals more world down and to the right and leaves
    // everything already on screen exactly where it was.

    // The size that fills the window from wherever the canvas starts.
    //
    // ⚠ MEASURE THE CONTAINER, NEVER THE CANVAS. The canvas' own rect depends on
    // the canvas' own size, so feeding it back in is a loop: #demoCanvasContainer
    // is text-align:center, so a canvas narrower than the window is CENTRED,
    // reporting a positive left, which asks for a narrower canvas again. It
    // converges eventually but it is wrong on the way, and it took two resizes
    // to notice. The container is a block: its width is its containing block's
    // width and its top is decided by the content above it, so neither moves
    // when the canvas does. That is what makes this measurement stable.
    //
    // The top matters because the canvas is in flow with content above it - in
    // index2.html the hidden #tempcanvem sits right before the container - and
    // any row below the fold is a row shaded for nobody.
    measureCanvasFitToWindow(){

        const host = this.canvas.parentNode;
        const rect = host ? host[ getBoundingClientRect ]() : { left: 0, top: 0, width: window.innerWidth };

        const left = Math.max( 0, rect.left );
        const top  = Math.max( 0, rect.top );

        // getCurrentTexture() cannot hand back a texture bigger than this.
        const lim = ( this.device && this.device.limits && this.device.limits.maxTextureDimension2D ) || 8192;

        return {
            w: Math.max( 1, Math.min( lim, Math.floor( Math.min( rect.width, window.innerWidth - left ) ) ) ),
            h: Math.max( 1, Math.min( lim, Math.floor( window.innerHeight - top ) ) )
        };
    }

    // Set the drawing buffer. render_canv_w/h are kept in step so they stay
    // honest - nothing else in the engine reads them, but they are the first
    // thing anyone greps for. Returns whether anything actually changed.
    applyCanvasSize( w, h ){

        if( !this.canvas ){ return false; }
        if( this.canvas.width === w && this.canvas.height === h ){ return false; }

        this.canvas.width  = w;
        this.canvas.height = h;

        this.render_canv_w = w;
        this.render_canv_h = h;

        return true;
    }

    resizeCanvasToWindow(){

        if( !this.canvas || this.suicide ){ return false; }

        const fit = this.measureCanvasFitToWindow();
        if( !this.applyCanvasSize( fit.w, fit.h ) ){ return false; }

        // A resized canvas comes back CLEARED. Running, the next tick would
        // repaint it - but that is up to a whole tick of black; paused, nothing
        // ever would. renderFrame is safe to call at any time (it is render
        // only - no step, no readback, no sim) and it no-ops until the pipeline
        // exists, which is what makes the call from getInsideThere harmless.
        //
        // The one thing that must not be drawn over is a step glide, which owns
        // the screen while it plays - same guard startPausedAnim uses. Its next
        // frame is at most 16ms away and repaints at the new size anyway.
        if( performance.now() >= this.stepGlideEndsAt ){
            this.renderFrame( this.INTERP_PHASE );
        }

        return true;
    }

    // 'resize' arrives in bursts while a window is being dragged, and each one
    // would otherwise throw away a swapchain. Coalesced to one per animation
    // frame, and applyCanvasSize drops it entirely if the size did not move.
    attachResizeListener(){

        if( this.resizeHandler ){ return; }

        this.resizeHandler = () => {

            if( this.resizeQueued ){ return; }
            this.resizeQueued = true;

            requestAnimationFrame( () => {
                this.resizeQueued = false;
                if( this.suicide ){ return; }
                this.resizeCanvasToWindow();
            } );
        };

        window[ addEventListener ]( 'resize', this.resizeHandler );
    }

    detachResizeListener(){

        if( !this.resizeHandler ){ return; }

        window[ removeEventListener ]( 'resize', this.resizeHandler );
        this.resizeHandler = null;
        this.resizeQueued = false;
    }


    // Called to initiate the values in the grid.
    initTheInitialCellStateArray_withNeighbours( cellStateArray, seeed, grid_size ){
        let nuSeed = 'insI2' + seeed;
        
        let rand = new PseudRand( nuSeed  );

        // Intiial bullshi
        for(let ii = 0;ii < this.CHUNKS_ACROSS;ii++){
            for(let jj = 0;jj < this.CHUNKS_ACROSS;jj++){
                
                let offX = ii * this.CHUNK_SIZE;
                let offY = jj * this.CHUNK_SIZE;

                for(let kk = 0;kk < 2;kk++){

                    let theX = Math.floor(rand.random()*this.CHUNK_SIZE) + offX;//locations[k].x;
                    let theY = Math.floor(rand.random()*this.CHUNK_SIZE) + offY;//locations[k].y;

                    for(let rg = 0;rg < 256;rg++){
                        if(rand.random() < 0.42){
                            for(let c = 0;c < this.CELL_VALS;c++){
                                cellStateArray[
                                    (theX+Math.floor(rg/16))*grid_size + (theY+(rg%16)) + c*(grid_size*grid_size)
                                ] = rand.random()<0.5?rand.random():1.0;
                            }
                        }
                    } 
                }
            }
        } 
        
        // Set the neighbours
        for(let xx = 0;xx < this.CHUNKS_ACROSS;xx++){
            for(let yy = 0;yy < this.CHUNKS_ACROSS;yy++){

                
                let offX = xx * this.CHUNK_SIZE;
                let offY = yy * this.CHUNK_SIZE;

                for(let ii = 0;ii < this.CHUNK_SIZE;ii++){
                    for(let jj = 0;jj < this.CHUNK_SIZE;jj++){

                        let theX = Math.floor(ii) + offX;
                        let theY = Math.floor(jj) + offY;
                        let nOffset = 0+Math.floor( rand.random()*259 );//4;//
                        
                        let nnn = 0;
                        for(let c = this.joosValuesPerCell;c < this.CELL_VALS;c++){
                            let wrapNeighbour = (nnn + nOffset)%9;
                            
                            //if( xx === 0 && yy === 1 && ii === 23 && jj === 12){
                            //    console.log('wrapNeighbour', wrapNeighbour, 'c', c);
                            //}

                            if( wrapNeighbour === 4 ){
                                c--;// just skip this middle one of (3x3)
                                    // this works because 'nnn' increases even thouugh this goes back
                            }
                            else{
                                let ngh_offx = Math.floor((wrapNeighbour)%3) - 1;
                                let ngh_offy = Math.floor((wrapNeighbour)/3) - 1;
                                //ngh_offx += ngh_offy;
                                //ngh_offy = 0;
                                cellStateArray[
                                    (theX) + (theY*grid_size) + c*(grid_size*grid_size)
                                ] = ( (ii+this.CHUNK_SIZE+ngh_offx) % this.CHUNK_SIZE ) +
                                    ( (jj+this.CHUNK_SIZE+ngh_offy) % this.CHUNK_SIZE ) * 1000;
                            }

                            
                            nnn++;
                        }


                    }
                }

            }
        } 
    }
    initTheInitialCellStateAllRand( cellStateArray, seeed, grid_size ){
        EZWG.SHA1.seed( seeed )  // TODO keep dont assume global EZWG access

        let daBigONe = this.CHUNKS_ACROSS * this.CHUNKS_ACROSS * this.CHUNK_SIZE * this.CHUNK_SIZE
        for(let ii = 0;ii < daBigONe;ii++){ 
            for(let c = 0;c < this.CELL_VALS;c++){
                if( this.BUFFER_TYPE === 'f32' ){
                    cellStateArray[
                        ii + c*(grid_size*grid_size)
                    ] =  EZWG.SHA1.random();
                }
                else if( this.BUFFER_TYPE === 'u32' ){
                    cellStateArray[
                        ii + c*(grid_size*grid_size)
                    ] =  EZWG.randomU32( EZWG.SHA1.random() );
                }
                
            } 
        }
    }
    initTheInitialCellStateAllRandBins( cellStateArray, seeed, grid_size ){
        EZWG.SHA1.seed( seeed )  // TODO keep dont assume global EZWG access

        let daBigONe = this.CHUNKS_ACROSS * this.CHUNKS_ACROSS * this.CHUNK_SIZE * this.CHUNK_SIZE
        for(let ii = 0;ii < daBigONe;ii++){
            for(let c = 0;c < this.CELL_VALS;c++){
                cellStateArray[
                    ii + c*(grid_size*grid_size)
                ] =  EZWG.SHA1.random()<0.5?0:1;
            } 
        }
    }
    initTheInitialCellStateAllZeros( cellStateArray, seeed, grid_size ){
        EZWG.SHA1.seed( seeed )  // TODO keep dont assume global EZWG access

        let daBigONe = this.CHUNKS_ACROSS * this.CHUNKS_ACROSS * this.CHUNK_SIZE * this.CHUNK_SIZE
        for(let ii = 0;ii < daBigONe;ii++){
            for(let c = 0;c < this.CELL_VALS;c++){
                cellStateArray[
                    ii + c*(grid_size*grid_size)
                ] = 0;
            } 
        }
    }

    // ─────────────────  SMOOTH ZOOM helpers  ─────────────────
    // CURRENT_ZOOM is screen pixels per cell as a float (see index2.html). These
    // are the ONLY place screen pixels get turned into cells, and they mirror the
    // fragment shader's SMOOTH ZOOM block exactly - keep them in step with it.
    //
    // ⚠ TWO THINGS HAVE TO MATCH THE GPU HERE, and each one costs a WHOLE CELL when
    // it doesn't - which is the "I clicked that cell and the inspector showed its
    // neighbour" bug:
    //
    //  1. THE PIXEL ARRIVES FRACTIONAL. It is clientX/Y minus the canvas rect, and
    //     that rect is fractional the moment windows is display-scaled - the canvas
    //     is floor()ed to a whole pixel and then CENTRED in its container, so half a
    //     pixel of left/top offset is the normal case, not the odd one. The shader
    //     shades WHOLE pixels (it works off floor(fragCoord)), so skipping that floor
    //     here leaves the mouse up to one pixel out of step with the picture. At
    //     64px/cell that is 1/64th of a cell and nobody ever sees it; at ZOOM_MIN
    //     (4px/cell) it is a QUARTER of a cell and roughly one click in eight reads
    //     the wrong one. Hence "it depends on the zoom". Floor first, always.
    //
    //  2. THE PAN AND ZOOM ARE f32 ON THE GPU. liveInput is a Float32Array, so the
    //     shaders see CURRENT_PAN_* rounded to f32 - and the SFX window ANCHOR is a
    //     ceil() of it. A pan resting a hair above a whole cell (exactly where the
    //     tracker cam settles - it eases in asymptotically and stays there) can ceil
    //     one way in f64 and the other in f32, and then the WHOLE readback window is
    //     off by a row for as long as the camera sits there. Read the value the GPU
    //     was handed, never the f64 original.

    // The zoom the shaders see: f32, clamped the way the SMOOTH ZOOM block clamps it.
    // (ZOOM_MIN/MAX in index2.html keep it well inside this range anyway.)
    EZ_PX_PER_CELL() {
        let z = CURRENT_ZOOM;
        if( typeof z !== 'number' || !isFinite(z) || z <= 0 ){ z = this.CELL_SIZE; }
        return Math.min( 4096, Math.max( 1, Math.fround( Math.abs( z ) ) ) );
    }

    // The pan the shaders were HANDED - liveInput[7]/[8], written together with
    // CURRENT_PAN_X/Y once a frame in updateCameraForFrame(). ax: 0 = X, 1 = Y.
    EZ_PAN_SEEN( ax ) {
        const v = this.liveInput ? this.liveInput[ 7 + ax ] : 0;
        return isFinite( v ) ? v : 0;
    }

    // Mouse pixel -> the canvas pixel the fragment shader actually shaded. Clamped
    // into the drawing buffer: a click is always ON the canvas and fragCoord never
    // leaves it, so neither may this.
    EZ_PIXEL_X( px ) {
        const w = ( this.canvas && this.canvas.width ) || 1;
        return Math.min( w - 1, Math.max( 0, Math.floor( px ) ) );
    }
    EZ_PIXEL_Y( py ) {
        const h = ( this.canvas && this.canvas.height ) || 1;
        return Math.min( h - 1, Math.max( 0, Math.floor( py ) ) );
    }

    // canvas pixel -> world cell column  (shader: worldXf, then max(,0), then floor)
    EZ_SCREEN_TO_CELL_X( px ) {
        const worldX = Math.max( 0,
            this.EZ_PIXEL_X( px ) / this.EZ_PX_PER_CELL() + this.EZ_PAN_SEEN( 0 ) );
        const v = Math.floor( worldX );
        return ( (v % this.GRID_SIZE) + this.GRID_SIZE ) % this.GRID_SIZE;
    }

    // canvas pixel -> world cell row, y-UP, exactly the shader's EZY
    EZ_SCREEN_TO_WORLD_Y( py ) {
        const worldY = Math.max( 0,
            this.GRID_SIZE - (this.EZ_PIXEL_Y( py ) + 1) / this.EZ_PX_PER_CELL()
            + this.EZ_PAN_SEEN( 1 ) );
        const v = Math.floor( worldY );
        return ( (v % this.GRID_SIZE) + this.GRID_SIZE ) % this.GRID_SIZE;
    }

    // canvas pixel -> world cell row, counted DOWN from the top (the "dragStartY"
    // convention the mouse code has always used; liveInput[1] flips it back)
    EZ_SCREEN_TO_CELL_Y( py ) {
        return (this.GRID_SIZE - 1) - this.EZ_SCREEN_TO_WORLD_Y( py );
    }

    // canvas pixel -> offset inside the SFX_BUFFER_SIZE_LENGTH² readback window.
    //
    // The compute shader fills that window in WORLD space, anchored at the pan
    // TRUNCATED to a whole cell (it reads liveInput[7]/[8] through u32()). The pan
    // itself is fractional, and floor(px/zoom) + floor(pan) != floor(px/zoom + pan),
    // so these have to go through the world cell or the readback lands one cell off -
    // which is what the inspector and the BP grab read.
    EZ_SCREEN_TO_SFX_X( px ) {
        const off = this.EZ_SCREEN_TO_CELL_X( px ) - Math.floor( this.EZ_PAN_SEEN( 0 ) );
        return ( (off % this.GRID_SIZE) + this.GRID_SIZE ) % this.GRID_SIZE;
    }

    // Returned pre-decremented: Ex9 indexes the buffer as (thisValue + 1) * width,
    // mirroring the shader's `crvl = EZ_SFX_SIZE - (EZY - minY)`. The Y anchor CEILs
    // to match the compute shader's sfxAnchorY (the window runs upward from it) - and
    // it ceils the SAME f32 the shader ceils, see note 2 up top.
    EZ_SCREEN_TO_SFX_Y( py ) {
        const anchor = Math.ceil( this.EZ_PAN_SEEN( 1 ) ) % this.GRID_SIZE;
        const crvl = anchor - this.EZ_SCREEN_TO_WORLD_Y( py );
        return ( (crvl % this.GRID_SIZE) + this.GRID_SIZE ) % this.GRID_SIZE - 1;
    }

    handleContextMenu(event) {
        event.preventDefault(); // Prevent the right-click context menu
    }


    //  ──────────  GRAB PAN  ──────────
    // Take hold of the world cell under the cursor. Everything after this is
    // solved from that held point in updateCameraForFrame(); nothing here moves
    // the camera itself.
    beginGrabPan( xx, yy ){

        const z = this.EZ_PX_PER_CELL();

        this.ezweb.CELL_PAN_IS_GOING = true;

        this.ezweb.CELL_PAN_START_X = xx;
        this.ezweb.CELL_PAN_START_Y = yy;
        this.ezweb.CELL_PAN_CURR_X = xx;
        this.ezweb.CELL_PAN_CURR_Y = yy;
        this.ezweb.CELL_PAN_REPORTED = false;

        // canvas px -> world cells, unwrapped and fractional (CELL_FLOAT space)
        this.ezweb.CELL_PAN_GRAB_X = (xx / z) + this.ezweb.CELL_FLOAT_X;
        this.ezweb.CELL_PAN_GRAB_Y = this.GRID_SIZE - ((yy + 1) / z) + this.ezweb.CELL_FLOAT_Y;

        // A new grab kills any glide still running from the last one - grabbing
        // a moving map has to stop it dead, like a finger on a scrolling page.
        // An arrow-key throw is a glide like any other, so it goes too.
        this.ezweb.CELL_VEL_X = 0.0;
        this.ezweb.CELL_VEL_Y = 0.0;
        this.ezweb.KEY_PAN_GLIDING = false;

        this.attachGrabPanListeners();

        // Paused, a held pan wants a frame a time whether the mouse is moving or
        // not - a wheel notch mid-drag rescales about the grabbed cell and there
        // is no mousemove to redraw it.
        this.startPausedAnim();
    }

    // The drag has to keep working when the cursor leaves the canvas - over the
    // HUD, off the window edge, or out of the app entirely - and it has to END
    // even if the button comes up somewhere we never hear about. The canvas'
    // own listeners can't do either, so a held pan borrows the document's.
    attachGrabPanListeners(){

        if( this.grabPanMoveHandler ){ return; }

        this.grabPanMoveHandler = ( ev ) => {
            const rect = this.canvas[ getBoundingClientRect ]();
            this.ezweb.CELL_PAN_CURR_X = ev.clientX - rect.left;
            this.ezweb.CELL_PAN_CURR_Y = ev.clientY - rect.top;
            this.noteGrabPanMoved();
            this.requestPausedRedraw();
        };
        this.grabPanUpHandler = ( ev ) => {
            if( ev.button === 2 ){ this.endGrabPan(); }
        };
        this.grabPanBlurHandler = () => { this.endGrabPan(); };

        document[ addEventListener ]( 'mousemove', this.grabPanMoveHandler );
        document[ addEventListener ]( 'mouseup', this.grabPanUpHandler );
        window[ addEventListener ]( 'blur', this.grabPanBlurHandler );
    }

    detachGrabPanListeners(){

        if( !this.grabPanMoveHandler ){ return; }

        document[ removeEventListener ]( 'mousemove', this.grabPanMoveHandler );
        document[ removeEventListener ]( 'mouseup', this.grabPanUpHandler );
        window[ removeEventListener ]( 'blur', this.grabPanBlurHandler );

        this.grabPanMoveHandler = null;
        this.grabPanUpHandler = null;
        this.grabPanBlurHandler = null;
    }

    endGrabPan(){

        if( !this.ezweb.CELL_PAN_IS_GOING ){
            this.detachGrabPanListeners();
            return;
        }

        this.ezweb.CELL_PAN_IS_GOING = false;
        this.detachGrabPanListeners();

        this.ezweb.CELL_VEL_X *= EZWG.PAN_RELEASE_FLING;
        this.ezweb.CELL_VEL_Y *= EZWG.PAN_RELEASE_FLING;

        // The tracker cam (and king mode) are standing instructions, so they take
        // the camera back the moment the hand is off it. Coasting first would just
        // be the glide and the tracker pulling in different directions.
        //
        // Paused, the throw is dropped as well: the glide is spent one drawn
        // frame at a time and paused draws only happen when the mouse asks for
        // one, so a kept velocity would sit there and cash itself in on unpause.
        //
        // Unless an arrow key is down: then the keys own the camera the moment
        // the hand is off it, they are spending the speed themselves every frame,
        // and there is a paused loop running to do it with.
        if( ( this.paused || this.camIsAutoFollowing() )
            && this.ezweb.KEY_PAN_X === 0 && this.ezweb.KEY_PAN_Y === 0 ){
            this.ezweb.CELL_VEL_X = 0.0;
            this.ezweb.CELL_VEL_Y = 0.0;
            this.ezweb.KEY_PAN_GLIDING = false;
        }

        this.requestPausedRedraw();
    }

    // Paused, nothing calls run(), so nothing draws - and a camera that only
    // moves while the sim does is a camera that looks broken every time you
    // stop to look at something. Draw phase 0 again, coalesced to one per
    // animation frame. (See DRAWING WHILE PAUSED above.)
    requestPausedRedraw(){

        if( !this.paused || this.pausedAnimOn || this.pausedRedrawQueued ){ return; }

        this.pausedRedrawQueued = true;
        requestAnimationFrame( () => {
            this.pausedRedrawQueued = false;
            if( this.paused ){ this.renderFrame( 0 ); }
        } );
    }

    handleMouseDown(event) {
        if (event.button === 2) {

            // NOT gated on the replay lock. Right-drag is the pan, the pan is
            // camera, and the camera is on INPUT_SLOT_RENDER_ONLY - it is neither
            // logged nor injected, so looking around during a replay cannot
            // perturb it. This is the one map control that stays live.
            const rect = this.canvas.getBoundingClientRect();
            this.beginGrabPan( event.clientX - rect.left, event.clientY - rect.top );
        }
        else if (event.button === 0) {

            // Every map ACTION is on the left button - select, place, build, the
            // blueprint grab - and all of them are refused while a replay is
            // driving. Playback would overwrite the liveInput half a moment later
            // anyway; what this actually stops is the CPU-side half (a tool that
            // spends something, an inspector that reads a cell the replay is
            // about to change) acting on a world it is not steering.
            if( typeof REPLAY_LOCK !== 'undefined' && REPLAY_LOCK ){ return; }

            this.ezweb.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            const xx = event.clientX - rect.left;
            const yy = event.clientY - rect.top;
            this.ezweb.dragStartX = this.EZ_SCREEN_TO_CELL_X( xx );
            this.ezweb.dragStartY = this.EZ_SCREEN_TO_CELL_Y( yy );

            // Record for the snapshot (if any) - offset inside the SFX readback window
            this.ezweb.gpGrabStartX = this.EZ_SCREEN_TO_SFX_X( xx );
            this.ezweb.gpGrabStartY = this.EZ_SCREEN_TO_SFX_Y( yy );

            // (JUST FOR THE DRAGGING)
            this.ezweb.liveDragX = 0+ this.ezweb.dragStartX;
            this.ezweb.liveDragY = 0+ this.ezweb.dragStartY;

            // Paused there are no draws to show the box being pulled out, so the
            // drag brings its own: the pulsing dotted outline in the fragment
            // shader needs a frame a time to pulse in.
            this.startPausedAnim();
        }
    }

    handleMouseMove(event){
        // (a held grab pan tracks the mouse on the DOCUMENT instead - see
        //  attachGrabPanListeners - so that it survives leaving the canvas)
        if( this.ezweb.isDragging ){

            const rect = this.canvas.getBoundingClientRect();
            const xx = event.clientX - rect.left;
            const yy = event.clientY - rect.top;
            this.ezweb.liveDragX = this.EZ_SCREEN_TO_CELL_X( xx );
            this.ezweb.liveDragY = this.EZ_SCREEN_TO_CELL_Y( yy );

            this.requestPausedRedraw();
        }

        // const rect = this.canvas.getBoundingClientRect();
        // this.ezweb.lastSeenMouseX = event.clientX - rect.left;
        // this.ezweb.lastSeenMouseY = event.clientY - rect.top;
        // console.log( 'xy', this.ezweb.lastSeenMouseX, this.ezweb.lastSeenMouseY );
    }

    handleMouseUp(event) {
        
        if (event.button === 2) {
            this.endGrabPan();      // (the document handler usually gets here first)
        }
        else if (event.button === 0) {
            if (this.ezweb.isDragging) {
                this.ezweb.isDragging = false;
                const rect = this.canvas.getBoundingClientRect();
                const xx = event.clientX - rect.left;
                const yy = event.clientY - rect.top;
                // Where the inspector reads the clicked entity from (SFX window offset)
                lastMouseXDRX = this.EZ_SCREEN_TO_SFX_X( xx );
                lastMouseYDRY = this.EZ_SCREEN_TO_SFX_Y( yy );

                this.ezweb.dragEndX = this.EZ_SCREEN_TO_CELL_X( xx );
                this.ezweb.dragEndY = this.EZ_SCREEN_TO_CELL_Y( yy );
                // Record for the snapshot (if any) <- ending, SFX window offset
                this.ezweb.gpGrabEndX = this.EZ_SCREEN_TO_SFX_X( xx );
                this.ezweb.gpGrabEndY = this.EZ_SCREEN_TO_SFX_Y( yy );

                // AN ARMED ACTION KEY OWNS THE CLICK. index2.html decides (see
                // relicArmedInterceptMouseUp there) - the tool is still the
                // ordinary builder while a relic key is armed, so without this the
                // one click would BOTH drop the relic and blueprint whatever the
                // inspector happened to be showing. Asked before anything below
                // fills in liveInput, so nothing half-happens.
                if( typeof relicArmedInterceptMouseUp === 'function'
                    && relicArmedInterceptMouseUp( xx, yy ) ){
                    return;
                }

                // ...and so does a builder pointed at an entity nobody may build
                // (unbuildableInterceptMouseUp there). Refused before liveInput
                // too, so the click never reaches the sim or the input log.
                if( typeof unbuildableInterceptMouseUp === 'function'
                    && unbuildableInterceptMouseUp() ){
                    return;
                }

                // SCREENSHOT MODE....
                if( CURRENT_TOOL === 4 ){
                    this.ezweb.grabNextBp = true;
                }

                // ── THE CLICK GOES INTO THIS PAGE'S PLAYER BLOCK ─────────────
                // The team the page is playing as when the button comes UP owns
                // the click - the rectangle, the tool, the entity, the trigger.
                // A spectator (no team) has no block, so nothing reaches the sim,
                // but the step below is still booked: the inspector reads the cell
                // off the readback either way.
                const clickTeam = EZWG.sessionTeam();
                const clickSlot = ( pin ) => EZWG.playerSlot( clickTeam, pin );

                if( clickTeam >= 1 && this.liveInput[ clickSlot( EZWG.PIN.CLICK ) ] < 1 ){
                    this.liveInput[ clickSlot( EZWG.PIN.DRAG_X0 ) ] = this.ezweb.dragStartX;
                    this.liveInput[ clickSlot( EZWG.PIN.DRAG_Y0 ) ] = (this.ezweb.GRID_SIZE - 1) - this.ezweb.dragStartY;
                    this.liveInput[ clickSlot( EZWG.PIN.DRAG_X1 ) ] = this.ezweb.dragEndX;
                    this.liveInput[ clickSlot( EZWG.PIN.DRAG_Y1 ) ] = (this.ezweb.GRID_SIZE - 1) - this.ezweb.dragEndY;


                    this.liveInput[ clickSlot( EZWG.PIN.TOOL ) ] = CURRENT_TOOL;       // DEFUALT SET IT UP HERE

                    if( CURRENT_TOOL === 3 || CURRENT_TOOL === 2 ){

                        // IF UNLAWAFUL EYE DROPPPING OF AN ENTITY THAT DOESNT BELONG TO YOU
                        if( CURRENT_TOOL === 2 && LAST_ENT_SELECTED_HAS_ALLEG && LAST_ENT_TEAM_SELECTED !== CURRENT_SESSION_PLAYER_ID ){

                            this.liveInput[ clickSlot( EZWG.PIN.TOOL ) ] = 0;      // cancel movment
                        }

                        else{

                            if( this.placeByTheRules ){
                                CURRENT_TOOL = 2;
                            }
                            else{
                                CURRENT_TOOL = 3;
                            }

                            this.liveInput[ clickSlot( EZWG.PIN.TOOL ) ] = CURRENT_TOOL;
                        }


                    }

                    // if( this.lastKeyDetected === '2' ){
                    //     this.liveInput[4] = 2;
                    // }
                    // else if( this.lastKeyDetected === '3' ){
                    //     this.liveInput[4] = 3;
                    // }
                    // else if( this.lastKeyDetected === '4' ){
                    //     this.liveInput[4] = 4;
                    // }
                    // else if( this.lastKeyDetected === '5' ){
                    //     this.liveInput[4] = 5;
                    // }
                    // else if( this.lastKeyDetected === '6' ){
                    //     this.liveInput[4] = 6;
                    // }
                    // else if( this.lastKeyDetected === '7' ){
                    //     this.liveInput[4] = 7;
                    // }
                    // else if( this.lastKeyDetected === '8' ){
                    //     this.liveInput[4] = 8;
                    // }
                    // else if( this.lastKeyDetected === '1'){// || true ){
                    //     this.liveInput[4] = 1;
                    // }
    
    
                    // What the two corners cover. The builder (2 / 3, and the 0 it
                    // turns into above - it is still the builder the player was
                    // dragging) draws a LINE; select and snapshot keep the box. The
                    // tool in hand decides, through the same call the preview uses
                    // (stampViewSlots), so the cells it showed are the cells this is.
                    this.liveInput[ clickSlot( EZWG.PIN.SHAPE ) ] = EZWG.clickShapeForTool( CURRENT_TOOL );

                    // Grab the last entitiy clicked
                    this.liveInput[ clickSlot( EZWG.PIN.ENT ) ] = LAST_CLICKED_ENT;

                    // ...and the ADMIN team it is built for. Taken WITH the click
                    // and nowhere else, so the click is whole on its own: neither a
                    // switch to another team nor the ADMIN box changing before the
                    // tick can change what this one builds. (It used to be written
                    // every tick by run(), which with one player came to the same
                    // thing - the click always went out on the very next pass.)
                    this.liveInput[ clickSlot( EZWG.PIN.TEAM_SEL ) ] =
                        ( typeof CURRENT_TEAM_SEL !== 'undefined' ) ? Math.floor( Number( CURRENT_TEAM_SEL ) ) || 0 : 0;


                    this.liveInput[ clickSlot( EZWG.PIN.CLICK ) ] = 1;

                    this.ezweb.LAST_CELL_X = this.ezweb.dragStartX;
                    this.ezweb.LAST_CELL_Y = this.ezweb.dragStartY;
                    //console.log('set new input:', this.liveInput)

                    // IF WAS A DETAIL DRILL DOWN REQUEST
                    if( CURRENT_TOOL === 1 ){
                        if( this.ezweb.dragStartX === this.ezweb.dragEndX && this.ezweb.dragStartY === this.ezweb.dragEndY){

                            if( GET_ENT_FROM_LAST_CLICK === false ){
                                GET_ENT_FROM_LAST_CLICK = true;
                                //detailRequestX = this.ezweb.dragStartX;
                                //detailRequestY = this.ezweb.dragStartY;
                            }
                        }
                        
                    }

                    // IF REQUEST WENT THROUGH - reset the tool back tio pointer:
                    if( CURRENT_TOOL === 4 ){
                        // Through the setter when the page has one, so the
                        // top-right snapshot icon goes out with the tool - it is
                        // painted by whatever moves CURRENT_TOOL, and this is the
                        // one place the ENGINE moves it.
                        if( typeof setCurrentTool === 'function' ){
                            setCurrentTool( 1 );        //<- TO PREVENT DOUBLE CLICKING
                        }
                        else{
                            CURRENT_TOOL = 1;
                            this.liveInput[ EZWG.VIEW_SLOT_TOOL ] = CURRENT_TOOL;
                        }
                    }

                    // THE input that has to step the sim while paused, and the
                    // one the whole single-step idea exists for. Everything the
                    // CPU learns about a cell - what is in it (the inspector),
                    // the highlight the drag just applied, the blueprint grab -
                    // arrives through the readback at the bottom of run(), and
                    // paused there are no runs. Book one.
                    //
                    // Last thing in the block on purpose: the click is filled in
                    // above and the step must carry it.
                    this.requestSimStep();
                }
                else{
                    console.log('rejected input')
                }
            }
        }
        
    }
    
    handleKeyInput(keyString) {
        //console.log(keyString);
        this.lastKeyDetected = keyString;

    }

    //  ══════════  THE PLAYER INPUT BLOCKS - FOUR PLAYERS, ONE BUFFER  ══════════
    //
    //  Every input that can change the world belongs to a TEAM, and each team has
    //  a block of liveInput to itself:
    //
    //      team T's input X  is  liveInput[ PLAYER_INPUT_BASE + (T-1)*PLAYER_INPUT_STRIDE + PIN.X ]
    //                         =  EZWG.playerSlot( T, EZWG.PIN.X )
    //
    //  so four players - this page, other machines one day, or this page driving
    //  each of them in turn through the team switcher - can all speak on the same
    //  tick without overwriting one another, and the input log records all four in
    //  one entry per tick, in the same [ step, slot, value, ... ] form it always
    //  had. Player T IS team T. There is no "local player" anywhere the sim can
    //  see: a page drives whichever block CURRENT_SESSION_PLAYER_ID names, and that
    //  number only ever reaches the VIEW slots below, which the sim cannot read.
    //
    //  Below PLAYER_INPUT_BASE is shared - the camera, the render-only state and
    //  the view slots - and the LAST slot is the step counter. The old single
    //  player's slots that are not view slots now (5, 6, 11, 12, 15, 22-29) are
    //  RETIRED: nothing writes or reads them. They stay off the render-only list
    //  so that a stray write would be logged rather than silently lost.
    //  migrateInputLogV1() is what moves an old save's log into the blocks.
    //
    //  How the shader settles two players reaching for the same cell on the same
    //  tick is written up once, at THE FOUR PLAYERS in stimmings_compute.wgsl.
    //
    //  ⚠ APPEND, NEVER RENUMBER. A slot number is written into every save's input
    //  log, and moving one makes every replay of every save drift. A new per-player
    //  input takes the next free offset (PLAYER_SLOTS_USED says where that is), and
    //  the shaders get it as EZ_PIN_<name> for free - see playerInputWgslConsts().
    static PLAYER_TEAMS        = 4;
    static PLAYER_INPUT_BASE   = 128;
    static PLAYER_INPUT_STRIDE = 64;

    static PIN = {
        DRAG_X0:    0,   // the clicked box, corner A cell X
        DRAG_Y0:    1,   //   corner A cell Y, FLIPPED (GRID_SIZE-1-y) like the old 0-3
        DRAG_X1:    2,   //   corner B
        DRAG_Y1:    3,
        TOOL:       4,   // what the click does: 1 select, 2 build, 3 force place, 4 snapshot, 0 erase
        ENT:        5,   // the entity a build / force place puts down
        CLICK:      6,   // ONE-SHOT - the box above is a click to act on this tick
        WASD:       7,   // 3x3 neighbour index, 4 = stand, 9 = dead stop
        TEAM_SEL:   8,   // the ADMIN team a placement is built for - taken with the click
        QEF:        9,   // ONE-SHOT - leader channel bits: Q = 1, E = 2, 4 = the third, which nothing
                         //   reads - a gamepad button only now; its key, F, takes the wisdom marker down
        RELIC_ENT: 10,   // relic drop: the entity
        RELIC_X:   11,   //   drop cell X
        RELIC_Y:   12,   //   drop cell Y, FLIPPED like DRAG_Y*
        RELIC_GO:  13,   //   ONE-SHOT confirm
        RELIC_SEQ: 14,   //   1-255, echoed back in the verdict word - NOT zeroed
        KING:      15,   // king mode is on (a standing instruction)
        KING_WIPE: 16,   // ONE-SHOT - king mode just came ON: clear this team's highlights first
        WIS_PRESS: 17,   // ONE-SHOT - an 'r' landed this tick
        WIS_X:     18,   // wisdom marker cell X (EZX)
        WIS_Y:     19,   // wisdom marker cell Y (EZY - y UP, already flipped)
        WIS_STATE: 20,   // 0 = no marker, else the marker's team + 1 (which is T)
        SHAPE:     21,   // what the click's two corners cover - EZWG.CLICK_SHAPE, taken with the click
        WIS_REMOVE: 22,  // ONE-SHOT - an 'f' landed this tick: this team's wisdom marker comes down
        RELIC_KEYS: 23,  // which of this team's action keys hold a relic, bit k-1 for key k. Read by
                         //   the CPU (THE OBJECTIVES in index2.html), not the shader
        CAM_PAN:   24,   // ONE-SHOT - a right-button drag moved this team's camera with king mode off
                         //   (THE CAMERA PAN, AS AN INPUT). Read by the CPU (THE OBJECTIVES), not the shader
        KING_X:    25,   // where this team's king stands as the pass begins (EZX), sent with a relic
        KING_Y:    26,   //   drop that moves him - see THE KING'S TELEPORT, stageRelicDropKing(). EZY, y UP
        MOMENT:    27    // ONE-SHOT - a '9' landed this tick: this player marked a SPECIAL MOMENT (THE
                         //   SPECIAL MOMENT, AS AN INPUT). Read by the CPU (THE SPECIAL MOMENTS in
                         //   index2.html), not the shader
    };
    static PLAYER_SLOTS_USED = 28;

    //  ── WHAT A CLICK COVERS ─────────────────────────────────────────────────
    //  DRAG_X0..DRAG_Y1 are two corners, and SHAPE says what they mean. BOX is the
    //  rectangle between them, and it is 0 on purpose: it is what every click meant
    //  before there was a choice, so a log that never wrote SHAPE - every save from
    //  before the builder drew lines - replays as boxes, through the very branch of
    //  the shader it always took. LINE is the builder's: the cells of the line from
    //  the mouse-down corner to the mouse-up one, no diagonal steps (see THE BUILD
    //  LINE, buildLineWgsl() below).
    //
    //  clickShapeForTool() is the ONE place the choice is made. handleMouseUp()
    //  sends its answer with the click and stampViewSlots() puts the same answer
    //  in front of the preview, so what is drawn while dragging is what is built.
    static CLICK_SHAPE = { BOX: 0, LINE: 1 };

    static clickShapeForTool( tool ){
        return ( tool === 2 || tool === 3 ) ? EZWG.CLICK_SHAPE.LINE : EZWG.CLICK_SHAPE.BOX;
    }

    //  ── THE BUILD LINE ──────────────────────────────────────────────────────
    //  Is cell (x, y) on the line from (x0, y0) to (x1, y1)? Written ONCE, here,
    //  and put into the compute prelude AND the fragment prelude, so the cells the
    //  drag preview lights and the cells the click builds on are the same cells by
    //  construction rather than by two copies agreeing.
    //
    //  The line is 4-CONNECTED: each step goes one cell across OR one cell up,
    //  never both, so consecutive cells always share an edge. That is what lets it
    //  be a wall. A Bresenham line steps diagonally and leaves exactly the corner
    //  gaps a unit walks through (every mover here takes diagonal steps). |dx| +
    //  |dy| + 1 cells.
    //
    //  It is the arithmetic "standard" digital line. With u, v how far a cell is
    //  from the start along each axis, the cells on it are the ones whose remainder
    //  r = ay*u - ax*v lands in a window ax + ay wide. A step across adds ay to r,
    //  a step up takes ax off it, and from inside the window exactly one of those
    //  two stays inside - so the walk is unique, never steps both ways at once, and
    //  arrives at the far corner (r = 0 there). The window is centred on 0 so the
    //  cells hug the true line (no cell centre is ever more than 0.71 of a cell off
    //  it); an even width leaves one tie, broken toward the step along y.
    //
    //  The map wraps, so each axis goes the SHORTER way round - the rule the box
    //  uses (wrap when the wrapped run is strictly shorter). The ends are put in a
    //  fixed order first, so a line dragged A to B and one dragged B to A are the
    //  same cells. Integers only, like everything that reaches the grid.
    static buildLineWgsl(){
        return `
            fn EZ_ON_BUILD_LINE( x: u32, y: u32, x0In: u32, y0In: u32, x1In: u32, y1In: u32, gx: u32, gy: u32 ) -> bool {
                let x0: u32 = x0In % gx;
                let y0: u32 = y0In % gy;
                let x1: u32 = x1In % gx;
                let y1: u32 = y1In % gy;

                var dx: i32 = i32( x1 ) - i32( x0 );
                var dy: i32 = i32( y1 ) - i32( y0 );
                if( i32( gx ) - abs( dx ) < abs( dx ) ){ dx = dx - select( -i32( gx ), i32( gx ), dx > 0 ); }
                if( i32( gy ) - abs( dy ) < abs( dy ) ){ dy = dy - select( -i32( gy ), i32( gy ), dy > 0 ); }

                var sx: u32 = x0;
                var sy: u32 = y0;
                if( dx < 0 || ( dx == 0 && dy < 0 ) ){
                    sx = x1;
                    sy = y1;
                    dx = -dx;
                    dy = -dy;
                }

                let ax: u32 = u32( dx );
                let ay: u32 = u32( abs( dy ) );

                let u: u32 = ( ( x % gx ) + gx - sx ) % gx;
                var v: u32 = ( ( y % gy ) + gy - sy ) % gy;
                if( dy < 0 ){ v = ( sy + gy - ( y % gy ) ) % gy; }
                if( u > ax || v > ay ){ return false; }

                let w: i32 = i32( ax + ay );
                if( w == 0 ){ return true; }
                let r: i32 = i32( ay * u ) - i32( ax * v );
                let lo: i32 = -( w / 2 );
                return r >= lo && r < lo + w;
            }
        `;
    }

    //  The same test in JS, for the tests that check the shader against it
    //  (util/verify_build_lines.js). Not used by the game.
    static onBuildLine( x, y, x0, y0, x1, y1, gx, gy ){
        x0 = ( ( x0 % gx ) + gx ) % gx;  y0 = ( ( y0 % gy ) + gy ) % gy;
        x1 = ( ( x1 % gx ) + gx ) % gx;  y1 = ( ( y1 % gy ) + gy ) % gy;
        x  = ( ( x  % gx ) + gx ) % gx;  y  = ( ( y  % gy ) + gy ) % gy;

        let dx = x1 - x0, dy = y1 - y0;
        if( gx - Math.abs( dx ) < Math.abs( dx ) ){ dx -= ( dx > 0 ) ? gx : -gx; }
        if( gy - Math.abs( dy ) < Math.abs( dy ) ){ dy -= ( dy > 0 ) ? gy : -gy; }

        let sx = x0, sy = y0;
        if( dx < 0 || ( dx === 0 && dy < 0 ) ){ sx = x1; sy = y1; dx = -dx; dy = -dy; }

        const ax = dx, ay = Math.abs( dy );
        const u = ( x + gx - sx ) % gx;
        const v = ( dy < 0 ) ? ( sy + gy - y ) % gy : ( y + gy - sy ) % gy;
        if( u > ax || v > ay ){ return false; }

        const w = ax + ay;
        if( w === 0 ){ return true; }
        const r = ay * u - ax * v;
        const lo = -Math.trunc( w / 2 );
        return r >= lo && r < lo + w;
    }

    //  Spent by the pass that reads them - run() zeroes these in every block right
    //  after the writeBuffer, and a load starts them at 0.
    static PLAYER_ONE_SHOT_SLOTS = [ EZWG.PIN.CLICK, EZWG.PIN.QEF, EZWG.PIN.RELIC_GO,
                                     EZWG.PIN.KING_WIPE, EZWG.PIN.WIS_PRESS, EZWG.PIN.WIS_REMOVE,
                                     EZWG.PIN.CAM_PAN, EZWG.PIN.MOMENT ];

    static playerSlot( team, pin ){
        return EZWG.PLAYER_INPUT_BASE + ( team - 1 ) * EZWG.PLAYER_INPUT_STRIDE + pin;
    }

    //  The team THIS PAGE is playing as, 1-4, or 0 for none. The game keeps it in
    //  CURRENT_SESSION_PLAYER_ID (index2.html - the team switcher moves it); read
    //  defensively so the engine still stands on its own in the other examples.
    static sessionTeam(){
        const t = ( typeof CURRENT_SESSION_PLAYER_ID !== 'undefined' )
                  ? Math.floor( Number( CURRENT_SESSION_PLAYER_ID ) ) : 0;
        return ( t >= 1 && t <= EZWG.PLAYER_TEAMS ) ? t : 0;
    }

    //  The same layout as WGSL consts, put into the compute AND the fragment
    //  preludes, so both shaders index the blocks by these names and neither ever
    //  carries a slot number of its own.
    static playerInputWgslConsts(){
        let s = 'const EZ_PLAYER_TEAMS: u32 = ' + EZWG.PLAYER_TEAMS + 'u;\n'
              + 'const EZ_PLAYER_BASE: u32 = ' + EZWG.PLAYER_INPUT_BASE + 'u;\n'
              + 'const EZ_PLAYER_STRIDE: u32 = ' + EZWG.PLAYER_INPUT_STRIDE + 'u;\n';
        const names = Object.keys( EZWG.PIN );
        for(let n = 0; n < names.length; n++){
            s += 'const EZ_PIN_' + names[n] + ': u32 = ' + EZWG.PIN[ names[n] ] + 'u;\n';
        }
        return s;
    }

    //  ── THE VIEW SLOTS - THE ONE PLAYER SAT AT THIS SCREEN ─────────────────
    //  What the fragment shader draws from: the drag box being pulled out right
    //  now, the tool in hand, the ownership sparkle, which team this page is and
    //  that team's wisdom marker. They kept the old single player's slot numbers
    //  so the fragment shader reads them where it always did - but they are VIEW
    //  now, not input: render-only, zeroed for every compute pass, re-stamped by
    //  every draw (sampleLiveDrag, stampViewSlots). The input the sim acts on is in
    //  the player blocks above.
    static VIEW_SLOT_TOOL      =  4;
    static VIEW_SLOT_OWNERSHIP = 13;
    static VIEW_SLOT_DRAGGING  = 14;
    static VIEW_SLOT_TEAM      = 16;
    static VIEW_SLOT_WIS_X     = 30;
    static VIEW_SLOT_WIS_Y     = 31;
    static VIEW_SLOT_WIS_STATE = 32;
    static VIEW_SLOT_SHAPE     = 33;   // what the drag being pulled out will cover - EZWG.CLICK_SHAPE

    //  ── SLOTS THE SIMULATION NEVER SEES ────────────────────────────────────
    //  liveInput is one buffer shared by the compute pass and the draws, so some
    //  of it is camera and UI. Those slots are neither RECORDED into the input log
    //  nor INJECTED during a replay, and both halves of that matter:
    //
    //    recording   - a log full of camera pans would be enormous and would say
    //                  nothing about what the player actually did to the world.
    //    injecting   - the replay would seize the camera. The player is explicitly
    //                  allowed to look around during a replay, so pan/zoom must
    //                  stay live even while every sim input is being dictated.
    //
    //    0-3, 14 the drag box being pulled out, is-dragging  - VIEW (above)
    //    4       the tool in hand                            - VIEW
    //    7, 8    CURRENT_PAN_X / Y      - camera. Read by the compute shader ONLY
    //                                     to anchor the 128x128 sfx readback
    //                                     window, which writes EZ_SFX and never
    //                                     EZ_STATE_OUT. Verified: no state write
    //                                     in that block.
    //    9       px per cell (zoom)     - render only
    //    10      CURRENT_RMODE          - scent vision mode, render only
    //    13      the ownership sparkle                       - VIEW
    //    16      the team this page plays as                 - VIEW (the switcher)
    //    17-21   phase / paused / clock / channel flash - render only
    //    30-32   that team's wisdom marker                   - VIEW
    //    33      what the drag being pulled out will cover   - VIEW (the shape
    //            the sim acts on goes into the player's block with the click)
    //
    //  Every one of them except 7-10 is also ZEROED before every compute pass
    //  (INPUT_SLOT_ZEROED_FOR_COMPUTE), which is what makes "render only" a fact
    //  about the GPU and not just about the log.
    //
    //  ⚠ IF YOU MAKE ONE OF THESE SIM-VISIBLE, TAKE IT OUT OF HERE. The failure is
    //  silent: replays drift instead of erroring. Everything NOT listed is logged,
    //  so a new sim slot is captured automatically - the list is deliberately a
    //  denylist for exactly that reason.
    static INPUT_SLOT_RENDER_ONLY = [ 0, 1, 2, 3, 4, 7, 8, 9, 10, 13, 14, 16, 17, 18, 19, 20, 21, 30, 31, 32, 33 ];

    static INPUT_SLOT_ZEROED_FOR_COMPUTE = [ 0, 1, 2, 3, 4, 13, 14, 16, 17, 18, 19, 20, 21, 30, 31, 32, 33 ];

    //  How many times a failed sfx/census map is re-attempted before the world is
    //  stopped. Three is chosen to be obviously more than a transient hiccup and
    //  obviously less than a hang: each attempt is one extra submit of a 128KB
    //  copy, and a genuinely lost device fails all three within a frame or two.
    static SFX_MAP_MAX_RETRIES = 3;

    static isRenderOnlyInputSlot( i ){
        return EZWG.INPUT_SLOT_RENDER_ONLY.indexOf( i ) !== -1;
    }

    static SHA1 = {
        state: {
            lastseed: '',
            tot: 0
        },
        hashToFloat(hash) {
            const hexPart = hash.substring(0, 8); // Take only the first 8 characters for 32 bits
            const intVal = parseInt(hexPart, 16);
            const maxInt = Math.pow(2, 32) - 1;
            return intVal / maxInt;
        },
        
        seed(setseed){
            this.state.lastseed = ''+setseed;
        },
        random(){
            this.state.lastseed = this.sha1(this.state.lastseed)
            this.state.tot++;
            return this.hashToFloat(this.state.lastseed)
        },
        sha1(msg) {
            function rotateLeft(n, s) {
                return (n << s) | (n >>> (32 - s));
            }
        
            function toHexStr(n) {
                let s = "", v;
                for (let i = 7; i >= 0; i--) {
                    v = (n >>> (i * 4)) & 0x0f;
                    s += v.toString(16);
                }
                return s;
            }
        
            function utf8Encode(str) {
                return unescape(encodeURIComponent(str));
            }
        
            const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
        
            msg = utf8Encode(msg);
        
            const msgLength = msg.length;
        
            let wordArray = [];
            for (let i = 0; i < msgLength - 3; i += 4) {
                wordArray.push((msg.charCodeAt(i) << 24) | (msg.charCodeAt(i + 1) << 16) | (msg.charCodeAt(i + 2) << 8) | msg.charCodeAt(i + 3));
            }
        
            switch (msgLength % 4) {
                case 0:
                    wordArray.push(0x080000000);
                    break;
                case 1:
                    wordArray.push((msg.charCodeAt(msgLength - 1) << 24) | 0x0800000);
                    break;
                case 2:
                    wordArray.push((msg.charCodeAt(msgLength - 2) << 24) | (msg.charCodeAt(msgLength - 1) << 16) | 0x08000);
                    break;
                case 3:
                    wordArray.push((msg.charCodeAt(msgLength - 3) << 24) | (msg.charCodeAt(msgLength - 2) << 16) | (msg.charCodeAt(msgLength - 1) << 8) | 0x80);
                    break;
            }
        
            while ((wordArray.length % 16) != 14) {
                wordArray.push(0);
            }
        
            wordArray.push(msgLength >>> 29);
            wordArray.push((msgLength << 3) & 0x0ffffffff);
        
            let H0 = 0x67452301;
            let H1 = 0xefcdab89;
            let H2 = 0x98badcfe;
            let H3 = 0x10325476;
            let H4 = 0xc3d2e1f0;
        
            let W = new Array(80);
            let a, b, c, d, e;
            for (let i = 0; i < wordArray.length; i += 16) {
                for (let t = 0; t < 16; t++) {
                    W[t] = wordArray[i + t];
                }
                for (let t = 16; t < 80; t++) {
                    W[t] = rotateLeft(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
                }
        
                a = H0;
                b = H1;
                c = H2;
                d = H3;
                e = H4;
        
                for (let t = 0; t < 80; t++) {
                    let temp;
                    if (t < 20) {
                        temp = (rotateLeft(a, 5) + ((b & c) | (~b & d)) + e + W[t] + K[0]) & 0x0ffffffff;
                    } else if (t < 40) {
                        temp = (rotateLeft(a, 5) + (b ^ c ^ d) + e + W[t] + K[1]) & 0x0ffffffff;
                    } else if (t < 60) {
                        temp = (rotateLeft(a, 5) + ((b & c) | (b & d) | (c & d)) + e + W[t] + K[2]) & 0x0ffffffff;
                    } else {
                        temp = (rotateLeft(a, 5) + (b ^ c ^ d) + e + W[t] + K[3]) & 0x0ffffffff;
                    }
        
                    e = d;
                    d = c;
                    c = rotateLeft(b, 30);
                    b = a;
                    a = temp;
                }
        
                H0 = (H0 + a) & 0x0ffffffff;
                H1 = (H1 + b) & 0x0ffffffff;
                H2 = (H2 + c) & 0x0ffffffff;
                H3 = (H3 + d) & 0x0ffffffff;
                H4 = (H4 + e) & 0x0ffffffff;
            }
        
            return toHexStr(H0) + toHexStr(H1) + toHexStr(H2) + toHexStr(H3) + toHexStr(H4);
        }
    }

    static print = {
        goThroughF32ValsAndReprint( f32CopiedValues, ca_obj ){

            let lstCellX = -1;
            let lstCellY = -1;

            let chunk_att_size = ca_obj.TOTAL_CHUNKS * ca_obj.TOTAL_CHUNKS * ca_obj.CHUNK_SIZE * ca_obj.CHUNK_SIZE; 
            let offX = 26;// x coordinate RELATIVE TO EACH CHUNK
            let offY = 44;// y coor... 
            for(let ii = 0;ii < ca_obj.TOTAL_CHUNKS;ii++){
                for(let jj = 0;jj < ca_obj.TOTAL_CHUNKS;jj++){ 
                    let theX = Math.floor(ii) + offX;
                    let theY = Math.floor(jj) + offY; 
                    let c = 16;
                    //for(c = ca_obj.joosValuesPerCell;c < ca_obj.uniqueValuesPerCell;c++){
                    //}
                    for(c = 0;c < ca_obj.uniqueValuesPerCell;c++){
                        let hgh = f32CopiedValues[
                            (theX) + (theY * ca_obj.CHUNK_SIZE*ca_obj.TOTAL_CHUNKS) + (c*chunk_att_size)
                        ]; 
                        //console.log( ':-:-:-:-', ii, jj, hgh ); 
                    } 
                    //console.log( '---===============;' );
                }
            }

            if(lstCellX > -1 && lstCellY > -1){
                for(let c = 0;c < ca_obj.uniqueValuesPerCell;c++){
                    let hgh = f32CopiedValues[
                        (lstCellX) + 
                        (lstCellY * ca_obj.CHUNK_SIZE*ca_obj.TOTAL_CHUNKS) + 
                        (c*chunk_att_size)
                    ]; 
                    let wrpX = lstCellX % (ca_obj.CHUNK_SIZE);
                    let wrpY = lstCellY % (ca_obj.CHUNK_SIZE);
                    //console.log( wrpX, wrpY, hgh ); 
                }

            }

            

            // console.log('neghbrs:--_____');//ca_obj.joosValuesPerCell
            // for(let c = 0;c < ca_obj.uniqueValuesPerCell;c++){ 
            //     let theX = Math.floor(32); // + offX;
            //     let theY = Math.floor(44); // + offY; 
            //     let hgh = f32CopiedValues[
            //         (theX) + (theY*ca_obj.CHUNK_SIZE*ca_obj.TOTAL_CHUNKS) + (c*chunk_att_size)
            //     ]; 
            //     theX = theX % ca_obj.CHUNK_SIZE;
            //     theY = theY % ca_obj.CHUNK_SIZE;
            //     console.log( theX, theY, hgh);
            // }
                    

            //f32CopiedValues

        } 
    }

    // Use like this:
    // let sprtA = document.getElementById('exmplSprite1'); 
    // if (sprtA.complete && sprtA.naturalWidth !== 0) {
    //     const packedPixels = EZWG.processImagePixels(sprtA, 8, 8);
    //     console.log(packedPixels);
    //     packedPixels.forEach((packedValue, index) => {
    //         const { r, g, b, a } = EZWG.unpackU32(packedValue);
    //         console.log(`Pixel ${index}: R=${r}, G=${g}, B=${b}, A=${a}`);
    //     });
    // }

    static randomU32(zeroToOne) {
        // Ensure the input is between 0 and 1
        if (zeroToOne < 0 || zeroToOne > 1) {
            throw new Error("Input must be a float between 0 and 1");
        }
        // Scale the float to the range of a 32-bit unsigned integer
        return Math.floor(zeroToOne * 0xFFFFFFFF);
    }


 
    static processImagePixels(img, width, height) {
        // Create a canvas and draw the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // Disable image smoothing to maintain pixel-perfect quality
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        // Set the image element properties to ensure pixel-perfect rendering
        img.style.imageRendering = 'pixelated';
        img.style.imageRendering = 'crisp-edges'; // for some browsers
        img.width = width;  // set the display width
        img.height = height; // set the display height

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, width, height);
        // Get the image data
        const imageData = ctx.getImageData(0, 0, width, height).data;
        // Initialize an array to hold the packed u32 values
        const packedPixels = [];
        for (let y = height - 1; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4; // Calculate the index for the RGBA values
                const r = imageData[index];
                const g = imageData[index + 1];
                const b = imageData[index + 2];
                const a = imageData[index + 3];
                // Convert RGBA to a u32 number
                const packedValue = (a << 24) | (b << 16) | (g << 8) | r;
                // Push the packed value to the array
                packedPixels.push(packedValue);
            }
        }
        return packedPixels;
    }

    //  ══════════  THE SAVE FILE META TRAILER  ══════════
    //
    //  A save file is one flat list of space-separated u32s, and the loader is a
    //  split(' ').map(Number). Anything the game needs to save that is NOT in the
    //  cell grid - relics, territory, where the main character is standing - has to
    //  come back through that same pipe or it is a second file to keep in sync, and
    //  a second file is a thing that goes missing.
    //
    //  So: the grid, then a trailer of more u32s. Layout:
    //
    //      [ grid ]  GRID_SIZE^2 * CELL_VALS words, exactly as before
    //      [ 0 ]     MAGIC        0x53544D32  'STM2'
    //      [ 1 ]     FORMAT       META_FORMAT
    //      [ 2 ]     BYTE_COUNT   UTF-8 bytes of JSON payload
    //      [ 3 ]     CHECKSUM     FNV-1a 32 over those bytes
    //      [ 4.. ]   PAYLOAD      4 bytes per word, big-endian in the word, zero padded
    //      [ last ]  MAGIC        again, as a tail sentinel
    //
    //  Three things this shape buys, none of them accidental:
    //
    //  BACKWARD COMPATIBLE. The grid comes FIRST and is a fixed, computable length
    //  (the dimensions are in the filename), so an old save is simply one with no
    //  trailer - length === gridLen and nothing more to read. No version sniffing.
    //
    //  IT CANNOT BE HALF-READ. The magic is at BOTH ends. A file truncated by a
    //  failed download has a plausible head and no tail, and is rejected as a whole
    //  rather than decoded into a half-populated game. The checksum catches the
    //  rest. On any failure the loader keeps the grid and defaults the meta, which
    //  is the honest degradation - the world is still there.
    //
    //  IT IS EXACT. JSON round-trips every finite JS number bit-for-bit (number ->
    //  string is specified to produce the shortest form that parses back to the
    //  same double), so 0.1 comes back as 0.1 and 2^53-1 comes back whole. What it
    //  does NOT survive: NaN and +-Infinity (they become null), -0 (becomes 0),
    //  undefined and functions (dropped), and Map/Set (become {}). Keep game meta
    //  to finite numbers, strings, booleans, arrays and plain objects and none of
    //  that can bite. encodeMetaTrailer refuses outright if it cannot round-trip.
    static META_MAGIC = 0x53544D32;     // 'STM2'
    static META_FORMAT = 1;
    static META_HEAD_WORDS = 4;         // magic, format, byteCount, checksum
    static META_TAIL_WORDS = 1;         // magic again

    // FNV-1a, 32 bit. Not a security hash - it is here to catch a truncated or
    // mangled trailer before it becomes a silently wrong game.
    static metaChecksum( bytes ){
        let h = 0x811c9dc5;
        for(let i = 0; i < bytes.length; i++){
            h ^= bytes[i];
            // h *= 16777619, kept in 32 bits without losing the high end to the
            // float mantissa (Math.imul is the whole reason this is exact).
            h = Math.imul( h, 0x01000193 );
        }
        return h >>> 0;
    }

    //  Object -> JSON string. SEPARATE from the encode below, and deliberately:
    //  this is the step that has to happen at the exact instant the grid is
    //  copied, while the encode can happen whenever the download callback gets
    //  round to it. A string cannot be mutated behind our back; a live relics
    //  array can. See the call site in run().
    static metaToJson( metaObj ){
        if( metaObj === null || metaObj === undefined ){ return null; }
        try{
            const json = JSON.stringify( metaObj );
            return ( json === undefined ) ? null : json;
        }
        catch( e ){
            // A cycle, or a BigInt. Either way this is a bug in the game code that
            // built the object, and it must not take the SAVE down with it - the
            // grid is the irreplaceable part.
            console.log( 'META SAVE FAILED - could not stringify:', e.message );
            return null;
        }
    }

    //  JSON string -> Uint32Array trailer. Returns null when there is nothing to
    //  write, so a game with no meta produces a byte-identical file to the old
    //  format - which is what makes this change invisible to old tooling.
    static encodeMetaTrailer( json ){
        if( json === null || json === undefined ){ return null; }

        const bytes = new TextEncoder().encode( json );
        const payloadWords = Math.ceil( bytes.length / 4 );
        const out = new Uint32Array( EZWG.META_HEAD_WORDS + payloadWords + EZWG.META_TAIL_WORDS );

        out[0] = EZWG.META_MAGIC;
        out[1] = EZWG.META_FORMAT;
        out[2] = bytes.length;
        out[3] = EZWG.metaChecksum( bytes );

        for(let i = 0; i < bytes.length; i++){
            const w = EZWG.META_HEAD_WORDS + (i >> 2);
            out[w] |= bytes[i] << (24 - 8 * (i & 3));
        }
        out[ out.length - 1 ] = EZWG.META_MAGIC;

        return out;
    }

    //  The whole loaded file + how long the grid is -> { ok, meta, why }.
    //  NEVER throws: a bad trailer is a reason to default the meta, not a reason
    //  to lose the world sitting in front of it.
    static decodeMetaTrailer( allWords, gridLen ){
        if( !allWords || allWords.length <= gridLen ){
            return { ok: true, meta: null, why: 'no trailer (pre-meta save)' };
        }

        const t = gridLen;                       // first word of the trailer
        const avail = allWords.length - t;
        if( avail < EZWG.META_HEAD_WORDS + EZWG.META_TAIL_WORDS ){
            return { ok: false, meta: null, why: 'trailer too short: ' + avail + ' words' };
        }
        if( allWords[t] !== EZWG.META_MAGIC ){
            return { ok: false, meta: null, why: 'bad head magic 0x' + (allWords[t] >>> 0).toString(16) };
        }
        if( allWords[t+1] !== EZWG.META_FORMAT ){
            return { ok: false, meta: null, why: 'meta format ' + allWords[t+1] + ', this build reads ' + EZWG.META_FORMAT };
        }

        const byteCount = allWords[t+2] >>> 0;
        const payloadWords = Math.ceil( byteCount / 4 );
        const expected = EZWG.META_HEAD_WORDS + payloadWords + EZWG.META_TAIL_WORDS;
        if( avail !== expected ){
            return { ok: false, meta: null, why: 'trailer is ' + avail + ' words, header says ' + expected };
        }
        if( allWords[ t + expected - 1 ] !== EZWG.META_MAGIC ){
            return { ok: false, meta: null, why: 'bad tail magic - file is truncated' };
        }

        const bytes = new Uint8Array( byteCount );
        for(let i = 0; i < byteCount; i++){
            const w = allWords[ t + EZWG.META_HEAD_WORDS + (i >> 2) ];
            bytes[i] = (w >>> (24 - 8 * (i & 3))) & 0xFF;
        }

        const sum = EZWG.metaChecksum( bytes );
        if( sum !== (allWords[t+3] >>> 0) ){
            return { ok: false, meta: null, why: 'checksum ' + sum + ' != ' + (allWords[t+3] >>> 0) };
        }

        try{
            return { ok: true, meta: JSON.parse( new TextDecoder().decode( bytes ) ), why: '' };
        }
        catch( e ){
            return { ok: false, meta: null, why: 'JSON parse failed: ' + e.message };
        }
    }

    //  How long the grid part of a save file is, given what the filename said.
    //  Both ends of the load need this and they must not compute it differently.
    static gridWordCount( chunksAcross, chunkSize, cellVals ){
        const g = chunksAcross * chunkSize;
        return g * g * cellVals;
    }

    // Least signifcant bit is the first one
    // 0 - 255,  
    static createPackedU32( s4, s3, s2, s1 ){
        return (s4 << 24) | (s3 << 16) | (s2 << 8) | s1;
    }

    
    static createPackedU8( s2, s1 ){
        return   (s2 << 4) | s1;
    }
    
    static createPackedU32_4( s8, s7, s6, s5, s4, s3, s2, s1 ){
        return (s8 << 28) | (s7 << 24) | (s6 << 20) | (s5 << 16) | (s4 << 12) | (s3 << 8) | (s2 << 4) | s1;
    }

    // 0 - 65535,
    static createPackedU32_16( s2, s1 ){
        return  (s2 << 16) | s1;
    }
    static createPackedU16_8( s2, s1 ){
        return  (s2 << 8) | s1;
    }
    
    static unpackU32(packedValue) {
        const a = (packedValue >> 24) & 0xFF;
        const b = (packedValue >> 16) & 0xFF;
        const g = (packedValue >> 8) & 0xFF;
        const r = packedValue & 0xFF;
        return { r, g, b, a };
    }
    
    static unpackU32_16(packedValue) {
        const b = (packedValue >> 16) & 0xFFFF;
        const a = packedValue & 0xFFFF;
        return { a, b };
    }
    

} 

// Always assign to global (works for both Node.js and browser)
global.EZWG = EZWG;