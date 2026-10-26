async function tool(player) {
	if (player.builderPermission == false) return
	if (player.builderPermission == false) return player.message("\\c6Because of the large terrain changes this tool causes and all sorts of odditys that can happen, this tool is disabled for now.")

	const pickX = Math.floor(player.selectorBrick.position.x / 4) - 2
	const pickY = Math.floor(player.selectorBrick.position.y / 4) - 2
	let levelZ = player.selectorBrick.position.z / 4 - 1
	if (levelZ > 500) levelZ = 500

	let positions = []

	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = levelZ; z > -200; z--) {
				const block = await voxelWorld.world.getBlockType(new Vector3(pickX + x, pickY + y, z))

				if (block !== 0) {
					for (let height = y; height < levelZ + 1; height++) {
						positions.push([pickX + x, pickY + y, height])
					}
					break
				}
			}
		}
	}

	let lastBlockType = 0
	positions.forEach(async (p) => {
		let blockType = await voxelWorld.world.getBlockType(new Vector3(p[0], p[1], p[2]))
		if (blockType === 0) blockType = lastBlockType
		lastBlockType = blockType
		voxelWorld.placeblock(new Vector3(p[0], p[1], p[2]), blockType, player, false, false)
	})
}

module.exports = { use: tool, attackDescription: { name: "Raise Columns", description: "Set a 5x5 square of blocks up to the block cursor height" }, blockmode: "out" }
