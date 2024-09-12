
if (fragCoord.y >= grid.y) {
    return vec4f(0.0, 1.0, 0.0, 1.0);  // Skip out-of-bound fragments
}

var xx = ( EZ_RAW_COL / 64 );
var yy = ( EZ_RAW_ROW / 64 );

if( xx %2 == 0){

    EZ_OUTPUT.red = 1; 
    EZ_OUTPUT.blu = 0;


}
else{
    
    EZ_OUTPUT.red = 0; 
    EZ_OUTPUT.blu = 1;
}

if( yy %2 == 0){

    EZ_OUTPUT.grn = 1;  


}
else{
    EZ_OUTPUT.grn = 0;  
}
