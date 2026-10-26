async function tool(player) {
	if (player.builderPermission == false) return

	let pickX = Math.floor(player.selectorBrick.position.x / 4) - 2
	let pickY = Math.floor(player.selectorBrick.position.y / 4) - 2
	let levelZ = player.selectorBrick.position.z / 4
	if (levelZ > 1000) levelZ = 1000

	let positions = [] // x, y, z
	let highestHeight = -1001

	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = levelZ; z > -1000; z--) {
				const block = await voxelWorld.world.getBlockType(new Vector3(pickX + x, pickY + y, z))

				if (block !== 0) {
					if (highestHeight <= z) {
						if (highestHeight < z) {
							highestHeight = z
							positions = []
						}
						positions.push({
							x: pickX + x,
							y: pickY + y,
							z: z,
						})
					}
					break
				}
			}
		}
	}

	positions.forEach((p) => {
		voxelWorld.placeblock(new Vector3(p.x, p.y, p.z), 0, player, true)
	})
}

module.exports = { use: tool, attackDescription: { name: "Lower Terrain", description: "Push a 5x5 square of blocks down" }, blockmode: "out" }
