//optimize titlecard
//var opttRandom = 
EZWG.SHA1.seed( "sumseed" );
    //new CustomRandom_sha( "sumseed", 120, null );
var opttWidth = 230;
var opttHeight = 230;

var widthofcube = 10;
var worldSideLength = 16;
var configurationVersion = 0;
var opttCubeReciprocity = -0.94;
var opttCubeMediumViscocity = 0.81;//0.945;
var opttCubeSpeed = 0.03;//0.0105;//0.0022;
var opttTempAngleTicker = 0.0;

var animCounterRefresher = 0;
//var optCollisionDelta = {x: 0, y: 0, z:0};

var opttPillars = new Array(256);
//Create the pillars
for(let i = 0;i < opttPillars.length;i++){
	let diamOfBox = widthofcube;
	opttPillars[i] = {
		x: (299*EZWG.SHA1.random()-150),
		y: (299*EZWG.SHA1.random()-150),
		z: (299*EZWG.SHA1.random()-150),

		xv: (2*EZWG.SHA1.random()-1)*0.1,
		yv: (2*EZWG.SHA1.random()-1)*0.1,
		zv: (2*EZWG.SHA1.random()-1)*0.1,

		xt: (Math.floor(worldSideLength*EZWG.SHA1.random())*widthofcube) - worldSideLength*widthofcube/2,
		yt: (Math.floor(worldSideLength*EZWG.SHA1.random())*widthofcube) - worldSideLength*widthofcube/2,
		zt: (Math.floor(worldSideLength*1)*widthofcube) - worldSideLength*widthofcube/5,

		a: EZWG.SHA1.random(),
		d: Math.floor(widthofcube*0.4),		//hiot box
		dd: widthofcube,					//actual displayed size
		cd: 10 + EZWG.SHA1.random()*5,//58+EZWG.SHA1.random()*40,
		show: true,

		r: EZWG.SHA1.random()*256, 
		g: EZWG.SHA1.random()*256, 
		b: EZWG.SHA1.random()*256,
		rt: EZWG.SHA1.random()*256, 
		gt: EZWG.SHA1.random()*256, 
		bt: EZWG.SHA1.random()*256
	};
	opttTempAngleTicker+=0.02;
}


var p5ezViewer = function(sk){

    let lastFrameCubesOrganizedAround = -1;
	sk.setup = function() {
		sk.createCanvas( 200, 220, sk.WEBGL ); 
		sk.ellipseMode(sk.CENTER);
		sk.rectMode(sk.CORNER); 
		sk.noSmooth();
		sk.frameRate(24); 
		//defineNewConfiguration();
		sk.lights();
	};
	sk.draw = function() {
        
        if( animCounterRefresher < 32){
            animCounterRefresher++;
            //for canvas 1
            sk.background(0);//, 0);
        
            sk.translate(0, 0, 10);
            sk.rotateY(-0.2);
            sk.rotateX(0.1);
            //sk.rotateZ(-0.2);
            //sk.rotateZ(Math.PI/2);
            //Ambient lighting 
            //sk.fill(200, 240, 200);

            
            sk.ambientLight(3.95);
            //sk.directionalLight(255, 255, 255, 0.15, 0.05, 0);
            sk.pointLight(255, 255, 255, 
                13 + Math.sin(sk.frameCount/33)*2, -50 + Math.cos(sk.frameCount/27)*22, 60.2);   
            
            //Collide logN time
            for(let i = 0;i < opttPillars.length;i++){
                
                //Update vel base don current trajectory
                opttPillars[i].xv += (opttPillars[i].xt - opttPillars[i].x) * opttCubeSpeed;
                opttPillars[i].yv += (opttPillars[i].yt - opttPillars[i].y) * opttCubeSpeed;
                opttPillars[i].zv += (opttPillars[i].zt - opttPillars[i].z) * opttCubeSpeed;
                //add vel and check
                opttPillars[i].x += opttPillars[i].xv;
                opttPillars[i].y += opttPillars[i].yv;
                opttPillars[i].z += opttPillars[i].zv;
                //Viscoss medium
                opttPillars[i].xv *= opttCubeMediumViscocity;
                opttPillars[i].yv *= opttCubeMediumViscocity;
                opttPillars[i].zv *= opttCubeMediumViscocity;

                //Cplour adjust
                opttPillars[i].r += (opttPillars[i].rt - opttPillars[i].r) / opttPillars[i].cd;
                opttPillars[i].g += (opttPillars[i].gt - opttPillars[i].g) / opttPillars[i].cd;
                opttPillars[i].b += (opttPillars[i].bt - opttPillars[i].b) / opttPillars[i].cd;
                
            }

            //Draw the pillars
            for(let i = 0;i < opttPillars.length;i++){

                if(opttPillars[i].show){
                    sk.push();
                    sk.translate(opttPillars[i].x, opttPillars[i].y, opttPillars[i].z);
                    sk.rotateX(Math.cos(sk.frameCount/21*opttPillars[i].a) * Math.sin(opttPillars[i].a*1.0)*0.12);
                    sk.rotateY(Math.sin(sk.frameCount/21*opttPillars[i].a) * Math.cos(opttPillars[i].a*2.3)*0.07);
                    sk.rotateZ(Math.cos(sk.frameCount/21*opttPillars[i].a) * Math.sin(opttPillars[i].a*4.4)*0.08);
                    sk.noStroke();
                    sk.fill(opttPillars[i].r, opttPillars[i].g, opttPillars[i].b); 
                    //if(opttPillars[i].show) 
                        sk.box(opttPillars[i].dd);
                    sk.pop();
                }
            }

            //sk.noLoop();
        }
		
		 
	};
 
	

	//sk.keyPressed = function(){
	//	sk.defineNewConfiguration();
	//};
	sk.mousePressed = function(){

	};
};
 
//Define new targets
var defineNewConfiguration = function(NMM, NCC, globalSketchReference){
    animCounterRefresher = 0;
    if(globalSketchReference){
        globalSketchReference.loop();
    }
    for(let i = 0;i < opttPillars.length;i++){
        opttPillars[i].xv = EZWG.SHA1.random()*1 - 0.5;
        opttPillars[i].yv = EZWG.SHA1.random()*1 - 0.5;
        opttPillars[i].zv = EZWG.SHA1.random()*1 - 0.5;
    }


    let counter = 0;
    for(let i = 0;i < opttPillars.length;i++){
        opttPillars[i].xt = (Math.floor(worldSideLength*EZWG.SHA1.random())*widthofcube) - worldSideLength*widthofcube/2;
        opttPillars[i].yt = (Math.floor(worldSideLength*EZWG.SHA1.random())*widthofcube) - worldSideLength*widthofcube/2;
        opttPillars[i].zt = (Math.floor(worldSideLength*EZWG.SHA1.random())*widthofcube) - worldSideLength*widthofcube/2;
        opttPillars[i].rt = Math.floor(256*EZWG.SHA1.random());
        opttPillars[i].gt = Math.floor(256*EZWG.SHA1.random());
        opttPillars[i].bt = Math.floor(256*EZWG.SHA1.random());
    }


    let newMap = [
        0,0,0,0,0,0,1,1, 0,0,0,0,0,0,1,1, 
        0,0,0,0,1,1,1,1, 0,0,0,0,1,1,1,1,
        0,0,2,1,1,1,1,1, 0,0,2,1,1,1,1,1,
        0,0,1,1,1,1,1,1, 0,0,1,1,1,1,1,1,
        0,4,1,1,1,1,1,1, 0,4,1,1,1,1,1,1,
        0,4,5,1,1,1,1,1, 0,4,5,1,1,1,1,1,
        1,4,4,1,1,1,1,1, 1,4,4,1,1,1,1,1,
        1,4,4,1,1,1,1,1, 1,4,4,1,1,1,1,1, 

        0,0,0,0,0,0,1,1, 0,0,0,0,0,0,1,1, 
        0,0,0,0,1,1,1,1, 0,0,0,0,1,1,1,1,
        0,0,2,1,1,1,1,1, 0,0,2,1,1,1,1,1,
        0,0,1,1,1,1,1,1, 0,0,1,1,1,1,1,1,
        0,4,1,1,1,1,1,1, 0,4,1,1,1,1,1,1,
        0,4,5,1,1,1,1,1, 0,4,5,1,1,1,1,1,
        1,4,4,1,1,1,1,1, 1,4,4,1,1,1,1,1,
        1,4,4,1,1,1,1,1, 1,4,4,1,1,1,1,1, 
    ];
    if( NMM ) newMap = NMM;


    let newColours = [
        {r:27.0, g:38.0, b:59.0},
        {r:142.0, g:148.0, b:158.0},
        {r:217.0, g:219.0, b:222.0},
        {r:11.0, g:179.0, b:191.0},
        {r:19.0, g:106.0, b:123.0},
        {r:14.0, g:146.0, b:160.0},
        {r:171.0, g:176.0, b:183.0}
    ];
    if( NCC ) newColours = NCC;


    for(let i = 0;i < newMap.length && counter < opttPillars.length;i++){
        if(newMap[i] > 0){
            opttPillars[counter].xt = (Math.floor(i%worldSideLength)*widthofcube) - worldSideLength*widthofcube/2;
            opttPillars[counter].yt = (Math.floor(i/worldSideLength)*widthofcube) - worldSideLength*widthofcube/2;
            opttPillars[counter].zt = (Math.floor(0)*widthofcube);// - worldSideLength*widthofcube/2;
            opttPillars[counter].rt = newColours[newMap[i]-1].r;
            opttPillars[counter].gt = newColours[newMap[i]-1].g;
            opttPillars[counter].bt = newColours[newMap[i]-1].b;
            opttPillars[counter].show = true;
            counter++;
        }
    }

    //Send rest to the back
    for(let i = counter;i < opttPillars.length;i++){
        opttPillars[i].xt = 0;
        opttPillars[i].yt = 0;
        opttPillars[i].zt = -90;
        opttPillars[i].rt = Math.floor(256*EZWG.SHA1.random());
        opttPillars[i].gt = Math.floor(256*EZWG.SHA1.random());
        opttPillars[i].bt = Math.floor(256*EZWG.SHA1.random());
        opttPillars[i].show = false;
    }


    configurationVersion+=1;
};