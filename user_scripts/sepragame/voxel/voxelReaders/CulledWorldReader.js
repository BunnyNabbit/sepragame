const cullOffsets = [
	new Vector3(0, 1, 0),
	new Vector3(0, -1, 0),
	new Vector3(1, 0, 0),
	new Vector3(-1, 0, 0),
	new Vector3(0, 0, 1),
	new Vector3(0, 0, -1)
]

class CulledPrismarineReader {
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
		if (block) {
			// Cull
			let cull = true;
			for (const co of cullOffsets) {
				const cullVec = new Vector3(this.x + vec3.x + co.x, this.y + vec3.y + co.y, this.z + vec3.z + co.z)
				const cullCheckBlock = await this.pWorld.getBlockType(cullVec)
				if (cullCheckBlock === 0) {
					cull = false
					break
				}
				const cullCheckMeta = await this.pWorld.getBlockData(cullVec)
				if (cullCheckMeta === 1) {
					cull = false
					break
				}
			}
			if (cull) return 0

			return block
		}
		return block
	}

	async getBlockData(vec3) {
		const block = await this.pWorld.getBlockData(new Vector3(this.x + vec3.x, this.y + vec3.y, this.z + vec3.z))
		return block
	}
}


module.exports = CulledPrismarineReader