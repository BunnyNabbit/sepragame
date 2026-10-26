async function tool(player, mcPos) {
	return player.message("This tool has been discontinued. Use \\c1/selection noise \\c0sub commands instead.")
	if (player.builderPermission == false) return

	let pickX = Math.floor(player.selectorBrick.position.x / 4 / 16) * 16
	let pickY = Math.floor(player.selectorBrick.position.y / 4 / 16) * 16

	for (let x = 0; x < 16; x++) {
		for (let y = 0; y < 16; y++) {
			for (let z = 200; z > 1; z--) {
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
					await voxelWorld.world.setBlockType(new Vector3(pickX + x, pickY + y, z), player.selectedColor)
				}
			}
		}
	}

	for (let z = 0; z < 8; z++) {
		voxelWorld.addSectionToQueue(Math.floor(pickX / 32), Math.floor(pickY / 32), z, player)
	}
	soundbrick(
		{
			url: "/sounds/generalExplosion1.flac", // [Required]
			isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
		},
		player
	)
}

let placeDebug = require("./placeDebug").use

module.exports = { use: tool, attackDescription: { name: "Paint Chunk", description: "Paint the whole chunk with the selected color" }, blockmode: "out" }
