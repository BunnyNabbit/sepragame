async function tool(player, mcPos) {
	if (player.builderPermission == false) return
	let types = []
	for (let x = -2; x < 3; x++) {
		for (let y = -2; y < 3; y++) {
			for (let z = -2; z < 3; z++) {
				let blockPos = new Vector3(Math.floor(player.selectorBrick.position.x / 4) + x, Math.floor(player.selectorBrick.position.y / 4) + y, Math.floor(player.selectorBrick.position.z / 4) + z)
				let data = await voxelWorld.world.getBlockData(blockPos)
				if (data) {
					placeDebug(player, blockPos)
					types.push(data)
				}
			}
		}
	}
	player.message(types.toString())
}

let placeDebug = require("./placeDebug").use

module.exports = { use: tool, attackDescription: { name: "Debug Type", description: "Find block types" }, blockmode: "out" }
