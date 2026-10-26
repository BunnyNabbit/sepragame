async function tool(player) {
	if (player.builderPermission == false) return

	let pickX = Math.floor(player.selectorBrick.position.x / 4) - 2
	let pickY = Math.floor(player.selectorBrick.position.y / 4) - 2

	let positions = []

	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 200; z > 3; z--) {
				const block = await voxelWorld.world.getBlockType(new Vector3(pickX + x, pickY + y, z))
				if (block !== 0) {
					positions.push({
						x: pickX + x,
						y: pickY + y,
						z: z,
					})
					break
				}
			}
		}
	}

	let blockbuff = []

	positions.forEach(async (p) => {
		let blockType = voxelWorld.world.getBlockType(new Vector3(p.x, p.y, p.z))
		if (blockType) {
			let points = 0

			if ((await voxelWorld.world.getBlockType(new Vector3(p.x, p.y - 1, p.z))) != 0) points++
			if ((await voxelWorld.world.getBlockType(new Vector3(p.x - 1, p.y, p.z))) != 0) points++
			if ((await voxelWorld.world.getBlockType(new Vector3(p.x + 1, p.y, p.z))) != 0) points++
			if ((await voxelWorld.world.getBlockType(new Vector3(p.x, p.y, p.z - 1))) != 0) points++
			if ((await voxelWorld.world.getBlockType(new Vector3(p.x, p.y, p.z + 1))) != 0) points++
			if (points < 4)
				blockbuff.push({
					x: p.x,
					y: p.y,
					z: p.z,
				})
		}
	})

	blockbuff.forEach(async (p) => {
		voxelWorld.placeblock(new Vector3(p.x, p.y, p.z), 0, player, true)
	})
}

module.exports = { use: tool, attackDescription: { name: "Smooth", description: 'Removes any blocks that appear "rough"' }, blockmode: "out" }
