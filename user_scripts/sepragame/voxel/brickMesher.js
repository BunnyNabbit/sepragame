// mesh: Return an array of bricks from a VoxObject
const ndarray = require("ndarray")
const blockColors = require("./color/blockColors.js")

async function mesh(voxObject) {
	if (voxObject.readyChunk) voxObject.readyChunk()
	const isVisited = ndarray(new Uint8Array(32768), [32, 32, 32])
	const brickArray = []
	for (var y = 0; y < voxObject.h; y++) {
		for (var z = 0; z < voxObject.d; z++) {
			for (var x = 0; x < voxObject.w; x++) {
				if (isVisited.get(x, y, z)) continue

				const startX = x
				const startY = y
				const startZ = z
				const startType = await voxObject.getBlockType(new Vector3(x, y, z))
				if (startType == 0) continue

				let startMeta = await voxObject.getBlockData(new Vector3(x, y, z))
				if (startMeta > 1) startMeta = 0
				let endX = x
				let endY = y
				let endZ = z

				while (endX < voxObject.w - 1) {
					const newX = endX + 1

					const mctype = await voxObject.getBlockType(new Vector3(newX, y, z))

					if (mctype == 0) break

					if (mctype !== startType) break

					const mcmeta = await voxObject.getBlockData(new Vector3(newX, y, z))

					if (mcmeta !== startMeta && (startMeta === 1 || mcmeta === 1)) break

					isVisited.set(newX, y, z, 1)
					endX = newX
				}

				while (endZ < voxObject.d - 1) {
					var newZ = endZ + 1

					var isRowUseable = true

					for (var dx = startX; dx < endX + 1; dx++) {
						const mctype = await voxObject.getBlockType(new Vector3(dx, y, newZ))

						if (mctype == 0) {
							isRowUseable = false
							break
						}

						if (mctype !== startType) {
							isRowUseable = false
							break
						}

						const mcmeta = await voxObject.getBlockData(new Vector3(dx, y, newZ))

						if (mcmeta !== startMeta && (startMeta === 1 || mcmeta === 1)) {
							isRowUseable = false
							break
						}
					}

					if (isRowUseable == false) break

					for (var dx = startX; dx < endX + 1; dx++) {
						isVisited.set(dx, y, newZ, 1)
					}

					endZ = newZ
				}
				while (endY < voxObject.h - 1) {
					const newY = endY + 1

					let isRowUseable = true

					for (let dz = startZ; dz < endZ + 1; dz++) {
						for (let dx = startX; dx < endX + 1; dx++) {
							const mctype = await voxObject.getBlockType(new Vector3(dx, newY, dz))

							if (mctype == 0) {
								isRowUseable = false
								break
							}

							if (mctype !== startType) {
								isRowUseable = false
								break
							}

							const mcmeta = await voxObject.getBlockData(new Vector3(dx, newY, dz))

							if (mcmeta !== startMeta && (startMeta === 1 || mcmeta === 1)) {
								isRowUseable = false
								break
							}
						}
						if (isRowUseable == false) {
							break
						}
					}

					if (isRowUseable == false) break

					for (let dz = startZ; dz < endZ + 1; dz++) {
						for (let dx = startX; dx < endX + 1; dx++) {
							isVisited.set(dx, newY, dz, 1)
						}
					}

					endY = newY
				}

				// create brick from cuboid
				endX = endX + 1 - startX
				endY = endY + 1 - startY
				endZ = endZ + 1 - startZ
				var brick = new Brick(new Vector3(startX * 4, startY * 4, startZ * 4), new Vector3(endX * 4, endY * 4, endZ * 4), blockColors[startType].hexString) //.find(i => (i.colorId == startType)).hexString)
				if (startMeta == 1) {
					brickArray.push(brick)
					brick.collision = false
				} else {
					brickArray.push(brick)
				}
			}
		}
	}
	return brickArray
}

module.exports = mesh
