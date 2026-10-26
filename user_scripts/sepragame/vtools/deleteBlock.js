function tool(player) {
	if (player.builderPermission == false) return

	voxelWorld.placeblock(new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4)), 0, player, true)
}

module.exports = { use: tool, attackDescription: { name: "Delete Block ", description: "Deletes a block" }, blockmode: "in" }