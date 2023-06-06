const FS = require('fs');
const Path = require('path');

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
	await Lib.processLineByLine(source, function (line, index) {
		const fields = line.split(/\t+/);
		const [id, name, asciiname, alternames, latitude, longitude, fclass, fcode, country] = fields;
		let altNames = alternames.split(',').map(n => n.toLowerCase().trim());
		altNames.unshift(asciiname);
		altNames.unshift(name);
		altNames = [...new Set(altNames)]; // Exclude dups

		FS.appendFileSync(altNamesFile, `${id},${altNames.join(',')}\n`);

		maxNameLength = Math.max(maxNameLength, name.length);
	});

	const schema = {
		name: maxNameLength,
		lat: 4,
		lon: 4,
		country: 2,
	}

	FS.writeFileSync(Path.resolve(__dirname, '../data/data.json'), JSON.stringify(schema, null, '\t'));

	await Lib.processLineByLine(source, function (line, index) {
		const fields = line.split(/\t+/);
		const [id, name, asciiname, alternames, latitude, longitude, fclass, fcode, country] = fields;

		let nameBuf = Buffer.alloc(schema.name, 0);
		nameBuf.write(name);
		let latBuf = Buffer.alloc(schema.lat, 0);
		latBuf.writeFloatBE(latitude);
		let lonBuf = Buffer.alloc(schema.lat, 0);
		lonBuf.writeFloatBE(longitude);
		let countryBuf = Buffer.alloc(schema.country, 0);
		countryBuf.write(country);
		const record = Buffer.concat([nameBuf, latBuf, lonBuf, countryBuf]);
		FS.appendFileSync(dataFile, record);
	});

})
.catch(err => {
	console.error(err)
});
