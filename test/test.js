const CITIES = require('../index');

const DB_LOADED = 'DB is loaded and ready for a lookup';
const DB_LOOKUP = 'City lookup';

Promise.resolve()
.then(async function () {

	console.time(DB_LOADED);
	const citiesDB = await CITIES();

	console.timeEnd(DB_LOADED);

	const citiesToTest = [
		'волгодонск',
		'просто город',
		'Dudinka',
		'Оффенбах',
	]

	citiesToTest.map(function (city) {
		console.time(DB_LOOKUP);
		const res = citiesDB.lookup(city);
		console.timeEnd(DB_LOOKUP);
		console.log(`City: ${city}`, res);
	})


})
