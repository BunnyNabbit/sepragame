function tool(player, mcPos) {
	if (player.builderPermission == false) return
	for (let x = -1; x < 2; x++) {
		for (let y = -1; y < 2; y++) {
			for (let z = -1; z < 2; z++) {
				voxelWorld.placeblock(new Vector3(Math.floor(player.selectorBrick.position.x / 4) + x, Math.floor(player.selectorBrick.position.y / 4) + y, Math.floor(player.selectorBrick.position.z / 4) + z), 0, player, "noInvaild", true)
			}
		}
	}
}

let placeDebug = require("./placeDebug").use

module.exports = { use: tool, attackDescription: { name: "Remove Box", description: "Remove a 3x3x3 box" }, blockmode: "out" }
