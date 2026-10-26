class CanvasReader {
	constructor(canvasBuffer) {
		jimp.read(canvasBuffer, (err, img) => {
			this.img = img
		})
		// Offset (u change it)
		this.x = -this.img.bitmap.width / 2
		this.height = -this.img.bitmap.height / 2
		this.y = 0
		// Scale
		this.w = w
		this.h = h
		this.d = 1
	}

	getBlockType = function getBlockType(vec3) {
		const rawColor = jimp.intToRGBA(this.img.getPixelColor(vec3.x + this.x, vec3.y + this.height))
		return util.color.rgbToHex(rawColor.r, rawColor.g, rawColor.b)
	}

	getBlockData = function getBlockData() {
		return 0
	}
}


module.exports = CanvasReader