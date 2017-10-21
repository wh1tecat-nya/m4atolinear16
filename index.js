"use strict";

const ffmpeg = require("fluent-ffmpeg");
const ism4a = require("is-m4a");
const btoa = require("btoa");
const stream = require("stream");

module.exports = buffer_m4a => new Promise((resolve, reject) => {
	if (!buffer_m4a) {
		reject(new Error("You must input m4a binary file."));
	}
	if (!ism4a(buffer_m4a)) {
		reject(new Error("this is not m4a files."));
	}
	try {
		const bufferStream = new stream.PassThrough();
		const outBufferStream = new stream.PassThrough();
		bufferStream.end(buffer_m4a);
		bufferStream.pipe();
		ffmpeg(bufferStream)
			.input()
			.outputOptions([
				"-f s16le",
				"-acodec pcm_s16le",
				"-vn",
				"-ac 1",
				"-ar 16k",
				"-map_metadata -1"
			])
			.pipe(outBufferStream)
			.on("end", () => resolve(outBufferStream));
	} catch (e) {
		reject(e);
	}
});
