const FS = require('fs');
const Path = require('path');

const ESC = '\u001B[';
const EraseLine = ESC + 40 + 'D' + ESC + '1K';

const Lib = require('../lib');

Promise.resolve()
.then(async function () {

	// Read a source file
	const source = Path.resolve(__dirname, '../data/cities1000.txt');
	const altNamesFile = Path.resolve(__dirname, '../data/altNames.txt');
	const dataFile = Path.resolve(__dirname, '../data/cities.dat');

	[altNamesFile, dataFile].map(file => {
		try {
			FS.unlinkSync(file);
		}
		catch (e) {}
	})

	let maxNameLength = 0;

	// //Sort source
	// process.stdout.write('Sorting...');
	// let lines = FS.readFileSync(source).toString().split('\n').filter(a => a).sort((a, b) => {
	// 	const aId = Number(a.split('\t')[0]);
	// 	const bId = Number(b.split('\t')[0]);
	// 	return aId - bId;
	// });
	//
	// const recordsCount = lines.length;
	//
	// FS.writeFileSync(source, lines.join('\n'));
	// lines = null;
	// console.log('Done');

	console.log('Generating altNames.txt');
	await Lib.processLineByLine(source, function (line, index) {
		const fields = line.split(/\t+/);
		const [id, name, asciiname, alternames, latitude, longitude, fclass, fcode, country] = fields;
		let altNames = alternames.split(',').map(n => n.toLowerCase().trim());
		altNames.unshift(asciiname);
		altNames.unshift(name);
		altNames = [...new Set(altNames)]; // Exclude dups

		FS.appendFileSync(altNamesFile, `${id},${altNames.join(',')}\n`);

		maxNameLength = Math.max(maxNameLength, name.length);

		if (index && index % 10000 == 0)
		{
			process.stdout.write(`${EraseLine}${index} done...`);
		}
	});

	console.log('\nDone');

	const schema = [
		{
			name: 'name',
			length: maxNameLength, // auto
			type: 'String',
		},
		{
			name: 'lat',
			length: 4,
			type: 'Number',
		},
		{
			name: 'lon',
			length: 4,
			type: 'Number',
		},
		{
			name: 'country',
			length: 2,
			type: 'String',
		},
	];

	FS.writeFileSync(Path.resolve(__dirname, '../data/data.json'), JSON.stringify(schema, null, '\t'));

	console.log('Generating cities.dat');
	await Lib.processLineByLine(source, function (line, index) {

		const [id, name, asciiname, alternames, latitude, longitude, fclass, fcode, country] = line.split(/\t+/);

		const record = Lib.createBufferFromObject(schema, {
			// id: Number(id),
			name,
			lat: latitude,
			lon: longitude,
			country,
		});
		FS.appendFileSync(dataFile, record);

		if (index && index % 10000 == 0)
		{
			process.stdout.write(`${EraseLine}${index} done...`);
		}
	});

	console.log('\nDone')

})
.catch(err => {
	console.error(err)
});
