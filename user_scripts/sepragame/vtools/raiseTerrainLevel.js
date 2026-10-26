async function tool(player) {
	if (player.builderPermission == false) return

	let pickX = Math.floor(player.selectorBrick.position.x / 4) - 2
	let pickY = Math.floor(player.selectorBrick.position.y / 4) - 2
	let levelZ = player.selectorBrick.position.z / 4 - 1
	if (levelZ > 200) levelZ = 200

	let positions = [] // x, y, z
	let lowestHeight = 3000000

	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = levelZ; z > -1000; z--) {
				const block = await voxelWorld.world.getBlockType(new Vector3(pickX + x, pickY + y, z))
				if (block !== 0) {
					if (lowestHeight >= z) {
						if (lowestHeight > z) {
							lowestHeight = z
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

	positions.forEach(async (p) => {
		const blockType = await voxelWorld.world.getBlockType(new Vector3(p.x, p.y, p.z))

		voxelWorld.placeblock(new Vector3(p.x, p.y, p.z + 1), blockType, player, "noInvaild")
	})

	//player.setPosition(new Vector3(player.position.x, player.position.y, player.position.z + 8))
}

module.exports = { use: tool, attackDescription: { name: "Raise Terrain", description: "Push a 5x5 square of blocks up" }, blockmode: "out" }
