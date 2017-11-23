"use strict";

const ffmpeg = require("fluent-ffmpeg");
const ism4a = require("is-m4a");
const stream = require("stream");

module.exports = buffer_m4a => new Promise(async (resolve, reject) => {
	if (!buffer_m4a) {
		reject(new Error("You must input m4a binary file."));
	}
	if (!ism4a(buffer_m4a)) {
		reject(new Error("this is not m4a files."));
	}
	try {
		const Writer = new stream.Writable();
		Writer.data = [];
		Writer.data.push(new Buffer("524946464618010057415645666D74201000000001000100803E0000007D0000020010004C4953541A000000494E464F495346540E0000004C61766635372E37312E313030006461746100180100","hex"));
		Writer._write = (chunk, chunk2, callback) => {
			Writer.data.push(chunk);
			callback();
		};

		const inputstream = (buffer) => {
			const istream = new stream.Duplex();
			istream.push(buffer);
			istream.push(null);
			return stream;
		};

		await ffmpeg()
			.input(inputstream(buffer_m4a))
			.outputOptions([
				"-f s16le",
				"-acodec pcm_s16le",
				"-vn",
				"-ac 1",
				"-ar 16k",
				"-map_metadata -1"
			])
			.on("error", (error, stdout, stderr) => {
				console.log(error);
				console.log(stdout);
				console.log(stderr);
			})
			.on("end", (stdout) => {
				Writer.data = Buffer.concat(Writer.data);
				resolve(Writer.data);
			})
			.stream(Writer);
	} catch (e) {
		reject(e);
	}
});
