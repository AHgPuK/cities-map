const FS = require('fs');
const Path = require('path');
const Readline = require('readline');
const { once: Once } = require('node:events');

async function processLineByLine(filename, cb) {

	// console.time('1');
	const fileStream = FS.createReadStream(filename);

	const rl = Readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});

	// rl.on('line', (line) => {
	// 	// Process the line.
	// 	cb(line);
	// });
	//
	// await Once(rl, 'close');

	for await (const line of rl) {
		// Each line in the text file will be successively available here as `line`.
		// console.log(`Line from file: ${line}`);
		cb(line);
	}

	fileStream.close();
	// console.timeEnd('1');
}

const Deferred = function () {
	let ful, rej;
	const deferred = new Promise(function (f, r) {
		ful = f, rej = r;
	});
	deferred.fulfill = ful;
	deferred.reject = rej;
	return deferred;
}

const DB = function () {

	let cityData = {};
	let alterNames = {};
	let promise = Deferred();

	return {
		lookup: (cityName) => {
			if (!cityName) return [];
			const cityIds = [...alterNames[cityName.toLowerCase().trim()]];
			return cityIds?.map(cityId => cityData[cityId]);
		},

		clear: () => {
			cityData = {}
			alterNames = {}
		},

		add: (names, id, data) => {
			cityData[id] = data;
			for (let i = 0; i < names.length; i++) {
				if (!alterNames[names[i]])
				{
					alterNames[names[i]] = new Set();
				}

				alterNames[names[i]].add(id);
			}
		},

		wait: function () {
			return promise;
		},

		end: function () {
			promise.fulfill();
		},
	}
}

const cities1000 = DB();

Promise.resolve()
.then(async function () {

	await processLineByLine(Path.resolve(__dirname, 'data/cities1000.txt'), function (line) {
		const fields = line.split(/\t+/);
		const [id, name, asciiname, alternames, latitude, longitude, fclass, fcode, country] = fields;
		let altNames = alternames.split(',');
		altNames.unshift(asciiname);
		altNames.unshift(name);
		cities1000.add(altNames.map(n => n.toLowerCase().trim()), id, {
			name: name,
			lat: latitude,
			lon: longitude,
			country: country,
		});
	});

	cities1000.end();

	if (process.argv[1] == __filename)
	{
		const test = ['Нагария', 'Одесса', 'London'];

		test.map(cityName => {
			const city = cities1000.lookup(cityName);
			console.log(city);
		})
	}

})
.catch(err => console.error(err));

let Module = async function () {
	await cities1000.wait();
	return cities1000;
}

module.exports = Module;
