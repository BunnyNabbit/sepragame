const mongojs = require(`mongojs`)
const { Section } = require("./Section.js")
const BaseWorld = require("./index.js")
const voxelCollection = mongojs("bunny").collection("sepragameVoxel")

class LegacyMongoWorld extends BaseWorld {
	/**/
	getSection(vec3) {
		const key = LegacyMongoWorld.vec3Key(vec3)
		if (this.cache[key]) {
			return this.cache[key]
		} else {
			const promise = new Promise((resolve) => {
				voxelCollection.findOne({ _id: key }, (error, document) => {
					if (document) {
						const section = new Section(this.sectionSize, document.blocks.buffer)
						section.key = key
						resolve(section)
					} else {
						const section = new Section(this.sectionSize)
						section.key = key
						this.newSection(vec3) // Get user code to generate whatever. Blocks can be put outside in the newSection code but that'll possibly cause an infinite loop.
						resolve(section)
					}
				})
			})
			this.cache[key] = promise
			return promise
		}
	}

	async flushDirtySections() {
		const promises = []
		this.savePending.forEach((element) => {
			promises.push(
				new Promise((resolve) => {
					voxelCollection.replaceOne({ _id: element.key }, { _id: element.key, blocks: element.serialize() }, { upsert: true }, (err) => {
						if (err) console.error(err)
						this.savePending.delete(element)
						resolve()
					})
				})
			)
		})
		if (promises.length) {
			this.draining = true
			await Promise.allSettled(promises)
			this.draining = false
		}
	}
}

module.exports = LegacyMongoWorld
