const Deferred = function () {
	let ful, rej;
	const deferred = new Promise(function (f, r) {
		ful = f, rej = r;
	});
	deferred.fulfill = ful;
	deferred.reject = rej;
	return deferred;
}



const DB = function (fields) {

	let cityData = {};
	let alterNames = {};
	let promise = Deferred();

	const unwind = (data) => {
		// const [name, lat, lon, country] = data;
		const res = {};
		for (let i = 0; i < fields.length; i++) {
			const name = fields[i];
			res[name] = data[i];
		}

		return res;
	}

	return {
		lookup: (cityName, isRawData) => {
			if (!cityName) return [];
			const ids = [...alterNames[cityName.toLowerCase().trim()] || []];
			const data = ids?.map(id => {
				if (!cityData[id]) return;
				return isRawData || !unwind ? cityData[id] : {id, ...unwind(cityData[id].split(','))};
			}).filter(d => d);
			return data;
		},

		getById: id => {
			return !unwind ? cityData[id] : unwind(cityData[id].split(','));
		},

		clear: () => {
			cityData = {}
			alterNames = {}
		},

		add: (names, id, data) => {
			data = data.join(',');
			cityData[id] = cityData[id] || data;
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

module.exports = DB;
