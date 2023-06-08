const Path = require('path');
const DB = require('./db');
const Lib = require('./lib');

const getMemoryUsageJSON = function (epgMemory = 0) {
	const Os = require('os');
	var ONE_GIGABYTE = 1024 * 1024 * 1024;
	var ONE_MEGABYTE = 1024 * 1024;
	var totalMemory = Os.totalmem();
	var memoryLoad = ((totalMemory - Os.freemem()) / ONE_GIGABYTE).toFixed(1);
	totalMemory = (totalMemory / ONE_GIGABYTE).toFixed(1);

	var memoryUsage = process.memoryUsage();

	// var processMemoryUsage = ((memoryUsage.heapUsed + memoryUsage.rss + memoryUsage.external) / ONE_MEGABYTE).toFixed(1);
	var processMemoryUsage = ((memoryUsage.rss) / ONE_MEGABYTE) + Number(epgMemory);

	processMemoryUsage = processMemoryUsage.toFixed(1);

	return {
		processMemoryUsage,
		memoryLoad,
		totalMemory,
	}
}

const cities1000 = DB(Lib.schema,
	// Buffer.from(''),
	require('fs').readFileSync(Path.resolve(__dirname, 'data/cities.dat')),
);

Promise.resolve()
.then(function () {

})
.then(async function () {

	await Lib.processLineByLine(Path.resolve(__dirname, 'data/altNames.txt'), function (line, index) {
		let altNames =  line.split(',');
		cities1000.add(altNames.map(n => n.toLowerCase().trim()), index, null);
	});

	cities1000.end();

	if (process.argv[1] == __filename)
	{
		// cities1000.clear();

		const test = ['Нагария', 'Одесса', 'London'];

		test.map(cityName => {
			const city = cities1000.lookup(cityName);
			console.log(city);
		});

		// const ids = [5367815,];
		// ids.map(id => {
		// 	const city = cities1000.getById(id);
		// 	console.log(city);
		// });

		console.log(`Memory usage:`, getMemoryUsageJSON())
		global.gc && global.gc();

		setTimeout(function () {
			console.log(`Memory usage:`, getMemoryUsageJSON())
		}, 5 * 1000);

		setTimeout(function () {

		}, 1000000);
	}

})
.catch(err => console.error(err));

let Module = async function () {
	await cities1000.wait();
	return cities1000;
}

module.exports = Module;
