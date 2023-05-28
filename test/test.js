const CITIES = require('../index');

Promise.resolve()
.then(async function () {

	const cities = await CITIES();

	const res = cities.lookup('волгодонск');

	console.log(res);

})
