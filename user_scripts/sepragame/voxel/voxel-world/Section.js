const ndarray = require("ndarray")
const { SmartBuffer } = require("smart-buffer")

class Section {
	/**/
	constructor(size, data) {
		if (data) {
			const buff = new SmartBuffer()
			buff.writeBuffer(data)
			this.blockData = ndarray(buff.readBuffer(32768), [32, 32, 32])
			this.typeData = ndarray(buff.readBuffer(32768), [32, 32, 32])
		} else {
			this.blockData = ndarray(new Uint8Array(32768), [32, 32, 32])
			this.typeData = ndarray(new Uint8Array(32768), [32, 32, 32])
		}
	}

	serialize() {
		const buff = new SmartBuffer()
		buff.writeBuffer(Buffer.from(this.blockData.data))
		buff.writeBuffer(Buffer.from(this.typeData.data))
		return buff.toBuffer()
	}
}
exports.Section = Section
