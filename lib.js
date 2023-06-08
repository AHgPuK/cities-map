const FS = require('fs');
const Readline = require('readline');
const { once: Once } = require('node:events');

const Lib = {
	schema: require('./data/data.json'),

	processLineByLine: async function (filename, cb) {

		let fileStream = FS.createReadStream(filename);

		let rl = Readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity
		});

		// rl.on('line', (line) => {
		// 	// Process the line.
		// 	cb(line);
		// });
		//
		// await Once(rl, 'close');

		let index = 0;
		for await (const line of rl) {
			// Each line in the text file will be successively available here as `line`.
			// console.log(`Line from file: ${line}`);
			cb(line, index++);
		}

		fileStream.close();
		fileStream = null;
		rl.close();
		rl = null;
	},

	createBufferFromObject: function (schema, obj) {

		const buffer = Buffer.concat(schema.map(f => {
			const byteLength = f.length;
			const value = obj[f.name];
			let buf = Buffer.alloc(byteLength, 0);
			switch (f.type)
			{
				case 'String': {
					buf.write(value);
					break;
				}
				case 'Number': {
					buf.writeFloatBE(value);
					break;
				}
			}
			return buf;
		}));

		return buffer;
	},

	createObjectFromBuffer: function (schema, buffer) {
		let obj = {};
		let offset = 0;

		schema.forEach(f => {
			const byteLength = f.length;
			let buf = buffer.slice(offset, offset + byteLength);
			if (buf.length > 0) {
				switch (f.type) {
					case 'String': {
						obj[f.name] = buf.toString('utf-8').replaceAll('\0', '');
						break;
					}
					case 'Number': {
						obj[f.name] = buf.readFloatBE(0);
						break;
					}
				}
			}
			// Move the offset for the next field
			offset += byteLength;
		});

		return obj;
	},

	Deferred: function () {
		let ful, rej;
		const deferred = new Promise(function (f, r) {
			ful = f, rej = r;
		});
		deferred.fulfill = ful;
		deferred.reject = rej;
		return deferred;
	},

	hashCode: function(str) {
		let hash = 0;

		for (let i = 0; i < str.length; i++) {
			let char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}

		hash = hash.toString(16);
		if (hash[0] == '-')
		{
			hash = 'n' + hash.substr(1);
		}

		return hash;
	},
}

module.exports = Lib;
