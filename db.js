const Lib = require('./lib');




const DB = function (schema, cityDataBuffer) {

	let cityData = {};
	let cityDataIndex = 0;
	let alterNames = {};
	let promise = Lib.Deferred();

	const recordSize = schema.reduce((a, f) => a + f.length, 0);
	const recordsCount = cityDataBuffer.length / recordSize;

	const unwind = (data) => {

		if (data.constructor == Buffer) return Lib.createObjectFromBuffer(data);

		return data;
	}

	const instance = {
		lookup: (cityName) => {
			if (!cityName) return [];
			const ids = [...alterNames[cityName.toLowerCase().trim()] || []];
			const data = ids?.map(id => {
				// if (cityData[id] === undefined) return;
				return instance.getById(id);
			}).filter(d => d);
			return data;
		},

		getById: id => {
			if (cityData[id]?.constructor == Object)
			{
				return cityData[id];
			}

			const offset = id * recordSize;
			return Lib.createObjectFromBuffer(schema, cityDataBuffer.slice(offset, offset + recordSize));
		},

		add: (names, id, data) => {
			const isNew = cityData[cityDataIndex] === undefined;

			if (cityDataIndex < recordsCount)
			{
				// cityData[id] = cityDataIndex;
			}
			else
			{
				// Add extra data (patches)
				cityData[cityDataIndex] = cityData[cityDataIndex] ?? data;
			}

			for (let i = 0; i < names.length; i++) {
				if (!alterNames[names[i]])
				{
					alterNames[names[i]] = new Set();
				}

				alterNames[names[i]].add(cityDataIndex);
			}

			if (isNew)
			{
				cityDataIndex++;
			}
		},

		wait: function () {
			return promise;
		},

		end: function () {
			promise.fulfill();
		},
	}

	return instance;
}

module.exports = DB;
