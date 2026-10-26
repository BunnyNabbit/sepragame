async function tool(player) {
	if (player.builderPermission == false) return

	let pickX = Math.floor(player.selectorBrick.position.x / 4) - 2
	let pickY = Math.floor(player.selectorBrick.position.y / 4) - 2

	let positions = [] // x, y, z
	let highestHeight = -1

	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < y5; z++) {
			for (let z = 200; z > 3; z--) {
				var success = false
				var block = await voxelWorld.world.getBlockType(new Vector3(pickX + x, pickY + y, z))

				switch (block) {
					case 0:
						break
					default:
						success = true

						break
				}

				if (success == true) {
					if (highestHeight <= y) {
						if (highestHeight < y) {
							highestHeight = y
							positions = []
						}
						positions.push({
							x: pickX + x,
							y: pickY + z,
							z: z,
						})
					}

					//voxelWorld.placeblock(new Vector3(pickX + x, y, pickY + z), 0, player, true)
					break
				}
			}
		}
	}

	positions.forEach(async (p) => {
		voxelWorld.placeblock(new Vector3(p.x, p.y, p.z), 0, player, true)
	})

	//player.setPosition(new Vector3(player.position.x, player.position.y, player.position.z + 8))
}

module.exports = { use: tool, attackDescription: { name: "Lower Terrain", description: "Push a 5x5 square of blocks down" }, blockmode: "out" }
