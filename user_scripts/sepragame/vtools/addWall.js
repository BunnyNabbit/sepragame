function tool(player) {
	if (player.builderPermission == false) return
	for (let z = -1; z < 2; z++) {
		voxelWorld.placeblock(new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4) + z), player.selectedColor, player, "noInvaild", true)
	}
}

let placeDebug = require("./placeDebug").use

module.exports = { use: tool, attackDescription: { name: "Add Wall", description: "Place a 3 block tall wall of the selected color" }, blockmode: "out" }
