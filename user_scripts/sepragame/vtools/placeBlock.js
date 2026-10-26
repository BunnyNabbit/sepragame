function tool(player) {
	if (player.builderPermission == false) return

	voxelWorld.placeblock(new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4)), player.selectedColor, player, true)
}

module.exports = { use: tool, attackDescription: { name: "Place Block", description: "Places a block with currently selected color" }, blockmode: "out" }