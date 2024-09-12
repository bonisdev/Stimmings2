const fs = require('fs');
const path = require('path');

var OUTPTUFODLER = "final_compiled"; 

// Function to get all directories in a folder
function getDirectories(source) {
    return fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && /^batch\d+test$/.test(dirent.name))
        .map(dirent => dirent.name)
        .sort((a, b) => {
            // Extract the number from "batchXtest"
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        });
}

// Function to get all PNG files in a directory
function getPngFiles(directory) {
    console.log('directory', directory)
    let kkk = directory.split('\\');
    kkk = kkk[kkk.length-1]
    if( kkk === 'batch0test'){
        return fs.readdirSync(directory)
            .filter(file => file.endsWith('.png'))
            .sort((a, b) => a.localeCompare(b)); //   alphabetical order
    }
    else{
        return fs.readdirSync(directory)
            .filter(file => file.endsWith('.png'))
            .sort((a, b) => b.localeCompare(a)); // Reverse alphabetical order
    }
}
// Main function to create the hub array
function createHubArray(baseDir) {
    const hubArray = [];
    const directories = getDirectories(baseDir);

    directories.forEach(directory => {
        const fullDirPath = path.join(baseDir, directory);
        const pngFiles = getPngFiles(fullDirPath);

        pngFiles.forEach(file => {
            hubArray.push(path.join(fullDirPath, file));
        });
    });

    return hubArray;
}

// Function to write images to the final directory with new filenames
function writeImagesToFinalDirectory(hubArray, outputDir) {
    // Ensure the final directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    hubArray.forEach((filePath, index) => {
        const newFileName = `${String(index + 1).padStart(4, '0')}.png`;
        const newFilePath = path.join(outputDir, newFileName);

        // Copy the file to the new location with the new name
        fs.copyFileSync(filePath, newFilePath);
    });
}

// Example usage
const baseDirectory = __dirname;//'R:\\git\\Stimmings2\\util\\';
const hubArray = createHubArray(__dirname);//baseDirectory);
const outputDirectory = path.join(baseDirectory, OUTPTUFODLER);

writeImagesToFinalDirectory(hubArray, outputDirectory);
 

for(let n = 0;n < hubArray.length;n++){
	console.log('n',n, hubArray[n]);
} 

// OK FInal new thing
//var EXACT_PXIIEL = 8;
var EXACT_PXIIEL = 16;

// Process image pixels function
const { createCanvas, loadImage } = require('canvas');

// Process image pixels function
async function processImagePixels(imagePath, width, height) {
    // Load the image from file
    const img = await loadImage(imagePath);
    
    // Create a canvas and context
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Disable image smoothing for a pixelated effect
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Calculate extra pixel padding (epp)
    const EXACT_PIXEL = 16; // Example value, adjust as needed
    const epp = Math.floor(EXACT_PIXEL / img.width);
    if (epp < 1) {
        console.error('Error: Exact pixel padding (epp) calculation resulted in:', epp);
        return null;
    }

    // Get image data and process pixels
    const imageData = ctx.getImageData(0, 0, width, height).data;
    const packedPixels = [];
    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const a = imageData[index + 3];
            
            const packedValue = (a << 24) | (b << 16) | (g << 8) | r;
            packedPixels.push(packedValue);

            // Uncomment and adjust if extra pixel padding is required
            // for (let j = 0; j < epp; j++) {
            //     for (let i = 0; i < epp; i++) {
            //         // Add padding pixels if necessary
            //     }
            // }
        }
    }

    return packedPixels;
}

// Process image pixels function
async function processImageForBg(imagePath) {
    var width = 2048;
    var height = 2048;
    // Load the image from file
    const img = await loadImage(imagePath);
    
    // Create a canvas and context
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Disable image smoothing for a pixelated effect
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0, width, height);
 

    // Get image data and process pixels
    const imageData = ctx.getImageData(0, 0, width, height).data;
    const packedPixels = [];
    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const a = imageData[index + 3];
            
            const packedValue = (a << 24) | (b << 16) | (g << 8) | r;
            packedPixels.push(packedValue);
 
        }
    }

    return packedPixels;
}
// Function to process files sequentially
async function processFilesSequentially(files) {
    const processedResults = []; 
    //output.innerHTML = ''; // Clear previous output
    //output.appendChild(imageList);

    for (const file of files) {
        try {
            //const img = fs.readFileSync(file);//await readFile(file); 
            const result = await processImagePixels(file, EXACT_PXIIEL, EXACT_PXIIEL);
            // console.log('woow ', file)
            // console.log(result)
            processedResults.push(result);
            //console.log(`Processed pixels for ${file.name}:`, result);
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
        }
    }

    

    // Concatenate the results
    //console.log('Final concatenated results:', processedResults.flat());
    console.log('entries:', processedResults.length)
    var ting = `var entireImgBuffer = [ ${processedResults.flat()} ];`;
    fs.writeFileSync("finaloutspritesbuffer.txt", ""+ting);


    // For the BG image:
    const bg_res = await processImageForBg( path.join( __dirname, '/final_bgs/one.png') );//file);
    console.log('bg size:', bg_res.length)
    var tong = `var entireBgBuffer = [ ${bg_res.flat()} ];`;
    fs.writeFileSync("finalout2048bg.txt", ""+tong);
}



console.log('calling w ', hubArray.length)


processFilesSequentially(hubArray);