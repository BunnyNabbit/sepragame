const Vector3 = require("./class/Vector3.js")
const fs = require("fs")
const ndarray = require("ndarray")
const { SmartBuffer } = require("smart-buffer")
const mongojs = require(`mongojs`)
const voxelCollection = mongojs("bunny").collection("sepragameVoxel")

function vec3Key(vec3) {
	return vec3.x + "." + vec3.y + "." + vec3.z
}

class Section {
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

class World {
	constructor(props, newSection = () => { }) {
		this.regionSize = props.regionSize ?? 32 // Regions aren't used at the moment
		this.sectionSize = props.sectionSize ?? 32 // new Vector3(32, 32, 32)
		this.saveLocation = props.saveLocation ?? null // currently errors if null
		this.saveInterval = props.saveInterval ?? 20000
		this.newSection = newSection
		// this.useSlaps = props.useSlaps ?? true
		// this.mergeSlaps = props.mergeSlaps ?? 20

		this.cache = {}
		this.savePending = new Set()

		// setInterval(() => {
		// 	if (this.draining) return
		// 	this.savePending.forEach(element => {
		// 		fs.writeFileSync(`${this.saveLocation}/${element.key}.vws`, element.serialize())
		// 	})
		// 	this.savePending.clear()
		// }, this.saveInterval)
		setInterval(async () => {
			if (this.draining) return
			const promises = []
			this.savePending.forEach(element => {
				promises.push(new Promise(resolve => {
					voxelCollection.replaceOne({ _id: element.key }, { _id: element.key, blocks: element.serialize() }, { upsert: true }, (err) => {
						if (err) console.error(err)
						this.savePending.delete(element)
						resolve()
					})
				}))
			})
			if (promises.length) {
				this.draining = true
				await Promise.allSettled(promises)
				this.draining = false
			}
		}, this.saveInterval)
	}

	async getSection(vec3) {
		const key = vec3Key(vec3)
		if (this.cache[key]) {
			return await this.cache[key]
		} else {
			// const fileLocation = `${this.saveLocation}/${key}.vws`
			const promise = new Promise(resolve => {
				voxelCollection.findOne({ _id: key }, (err, doc) => {
					if (doc) {
						const section = new Section(this.sectionSize, doc.blocks.buffer)
						section.key = key
						this.cache[key] = section
						resolve(section)
					} else {
						const section = new Section(this.sectionSize)
						section.key = key
						this.cache[key] = section
						this.newSection(vec3) // Get user code to generate whatever. Blocks can be put outside in the newSection code but that'll possibly cause an infinite loop.
						resolve(section)
					}
				})
			})
			return promise
		}
	}

	async setBlockData(vec3, block) {
		vec3 = new Vector3(Math.floor(vec3.x), Math.floor(vec3.y), Math.floor(vec3.z))
		const sectionVec3 = new Vector3(Math.floor(vec3.x / this.sectionSize), Math.floor(vec3.y / this.sectionSize), Math.floor(vec3.z / this.sectionSize))
		const section = await this.getSection(sectionVec3)
		const sectionSizeOffset = this.sectionSize - 1

		section.blockData.set(vec3.x & sectionSizeOffset, vec3.y & sectionSizeOffset, vec3.z & sectionSizeOffset, block)
		this.savePending.add(section)
	}

	async setBlockType(vec3, block) {
		vec3 = new Vector3(Math.floor(vec3.x), Math.floor(vec3.y), Math.floor(vec3.z))
		const sectionVec3 = new Vector3(Math.floor(vec3.x / this.sectionSize), Math.floor(vec3.y / this.sectionSize), Math.floor(vec3.z / this.sectionSize))
		const section = await this.getSection(sectionVec3)
		const sectionSizeOffset = this.sectionSize - 1

		section.typeData.set(vec3.x & sectionSizeOffset, vec3.y & sectionSizeOffset, vec3.z & sectionSizeOffset, block)
		this.savePending.add(section)
	}

	async getBlockData(vec3) {
		vec3 = new Vector3(Math.floor(vec3.x), Math.floor(vec3.y), Math.floor(vec3.z))
		const sectionVec3 = new Vector3(Math.floor(vec3.x / this.sectionSize), Math.floor(vec3.y / this.sectionSize), Math.floor(vec3.z / this.sectionSize))
		const section = await this.getSection(sectionVec3)
		const sectionSizeOffset = this.sectionSize - 1

		return section.blockData.get(vec3.x & sectionSizeOffset, vec3.y & sectionSizeOffset, vec3.z & sectionSizeOffset)
	}

	async getBlockType(vec3) {
		vec3 = new Vector3(Math.floor(vec3.x), Math.floor(vec3.y), Math.floor(vec3.z))
		const sectionVec3 = new Vector3(Math.floor(vec3.x / this.sectionSize), Math.floor(vec3.y / this.sectionSize), Math.floor(vec3.z / this.sectionSize))
		const section = await this.getSection(sectionVec3)
		const sectionSizeOffset = this.sectionSize - 1

		return section.typeData.get(vec3.x & sectionSizeOffset, vec3.y & sectionSizeOffset, vec3.z & sectionSizeOffset)
	}
}

module.exports = World