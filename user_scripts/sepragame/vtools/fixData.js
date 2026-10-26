async function tool(player, mcPos) {
	if (player.builderPermission == false) return
	for (let x = -2; x < 3; x++) {
		for (let y = -2; y < 3; y++) {
			for (let z = -2; z < 3; z++) {
				let blockPos = new Vector3(Math.floor(player.selectorBrick.position.x / 4) + x, Math.floor(player.selectorBrick.position.y / 4) + y, Math.floor(player.selectorBrick.position.z / 4) + z)
				let type = await voxelWorld.world.getBlockType(blockPos)
				if (!type) {
					let data = await voxelWorld.world.getBlockData(blockPos)
					if (data) {
						voxelWorld.world.setBlockData(blockPos, 0)
						placeDebug(player, blockPos)
						soundbrick({
							url: "/sounds/soundbrickcore-disconnect.mp3", // [Required]
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
						}, player)
					}
				}
			}
		}
	}
}

let placeDebug = require("./placeDebug").use

module.exports = { use: tool, attackDescription: { name: "Fix", description: "Fix anomalies" }, blockmode: "in" }