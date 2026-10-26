const readVox = require('vox-reader');
const colorbyid = require('../color/blockColors.js')

class VoxReader { // WIP
	constructor(voxBuf) {
		this.vox = readVox(voxBuf)
		this.voxels = {}
		this.vox.xyzi.values.forEach(voxel => {
			this.voxels[`${voxel.x} ${voxel.y} ${voxel.z}`] = voxel
		})
		this.x = 0 // Position from corner [unused]
		this.y = 0
		this.z = 0
		this.w = this.vox.size.x // Size
		this.h = this.vox.size.y
		this.d = this.vox.size.z
	}

	#colorCache = {}
	getBlockType = function getBlockType(vec3) {
		const voxel = this.voxels[`${vec3.x} ${vec3.y} ${vec3.z}`]
		if (typeof voxel !== "undefined") {
			return this.getColor(voxel.i, this.vox.rgba.values[voxel.i - 1])
		} else {
			return 0
		}
	}

	getBlockData = function getBlockData() {
		return 0
	}
	getColor = function (index, rgb) {
		let color = this.#colorCache[index]
		if (color) {
			return color
		} else {
			color = convertHex(rgbToHex(rgb.r, rgb.g, rgb.b)) // Convert the RGB to a BlockBorne color ID
			this.#colorCache[index] = color
			return color
		}
	}
}
function convertHex(msg) {
	msg = hexToRgb(msg)
	if (msg === null) return
	//colorCompl = hexToRgb("#000001")
	var colorComp = 1000
	var topColor = 0

	var mName = "None"
	var mHexC = "#000001"
	colorbyid.forEach(element => {
		let value = deltaE(msg, hexToRgb(element.hexString))
		if (value < colorComp) {
			if (element.colorId != 0) {
				colorComp = value
				topColor = element.colorId
				mName = element.name
				mHexC = element.hexString
			}
		}
	})
	return topColor
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	] : null;
}

function deltaE(rgbA, rgbB) {
	let labA = rgb2lab(rgbA);
	let labB = rgb2lab(rgbB);
	let deltaL = labA[0] - labB[0];
	let deltaA = labA[1] - labB[1];
	let deltaB = labA[2] - labB[2];
	let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
	let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
	let deltaC = c1 - c2;
	let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
	deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
	let sc = 1.0 + 0.045 * c1;
	let sh = 1.0 + 0.015 * c1;
	let deltaLKlsl = deltaL / (1.0);
	let deltaCkcsc = deltaC / (sc);
	let deltaHkhsh = deltaH / (sh);
	let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
	return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb) {
	let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
	r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
	g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
	b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
	x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
	y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
	z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
	x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
	y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
	z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;
	return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

function componentToHex(c) {
	let hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


module.exports = VoxReader