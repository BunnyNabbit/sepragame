const Vector3 = require("./class/Vector3.js")
const { Section } = require("./Section.js")

class BaseWorld {
	/**/
	constructor(props, newSection = () => {}) {
		this.regionSize = props.regionSize ?? 32 // Regions aren't used at the moment
		this.sectionSize = props.sectionSize ?? 32 // new Vector3(32, 32, 32)
		this.saveLocation = props.saveLocation ?? null // currently errors if null
		this.saveInterval = props.saveInterval ?? 20000
		this.newSection = newSection
		this.cache = {}
		this.savePending = new Set()
		setInterval(async () => {
			if (this.draining) return
			this.flushDirtySections()
		}, this.saveInterval)
	}
	/**@param {Vector3} vec3
	 * @returns {Promise<Section>}
	 */
	getSection(vec3) {
		throw new Error('"BaseWorld#getSection is abstract and must be implemented.')
	}

	async flushDirtySections() {
		throw new Error('"BaseWorld#flushDirtySections is abstract and must be implemented.')
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

	static vec3Key(vec3) {
		return vec3.x + "." + vec3.y + "." + vec3.z
	}
}

module.exports = BaseWorld
