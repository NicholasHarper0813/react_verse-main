const pkg = require( './package.json' );
const archiver = require( 'archiver' );
const path = require( 'path' );
const fs = require( 'fs' );

const themeName = pkg.name.toLowerCase() || path.basename( __dirname );
const files = pkg.files;
if ( ! files || files.length < 1 ) 
{
	console.log( 'ERROR: Please add the files you want to publish to an array called `files` in package.json.' );
	return;
}

const output = fs.createWriteStream( path.resolve( __dirname, `./build/${ themeName }.zip` ) );
const archive = archiver( 'zip', {
	store: true // Sets the compression method to STORE.
} );

output.on( 'close', () => {
	console.log( archive.pointer() + ' total bytes' );
	console.log( 'archiver has been finalized and the output file descriptor has closed.' );
} );

archive.on( 'error', function( err ) {
	throw err;
} );

archive.pipe( output );
files.map( file => {
	console.log( `Adding ${file}` );
	archive.glob( file );
} );

console.log( `Saving the zip to ./build/${ themeName }.zip` );
archive.finalize();
