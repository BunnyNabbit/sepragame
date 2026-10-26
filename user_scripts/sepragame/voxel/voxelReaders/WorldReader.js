class PrismarineReader {
	constructor(x, y, z, w, h, d, pWorld) { // MC Coords
		this.x = x // Position from corner
		this.y = y
		this.z = z
		this.w = w // Size
		this.h = h
		this.d = d
		this.pWorld = pWorld
	}

	async getBlockType(vec3) {
		const block = await this.pWorld.getBlockType(new Vector3(this.x + vec3.x, this.y + vec3.y, this.z + vec3.z))
		return block
	}
	async getBlockData(vec3) {
		const block = await this.pWorld.getBlockData(new Vector3(this.x + vec3.x, this.y + vec3.y, this.z + vec3.z))
		return block
	}
}


module.exports = PrismarineReader