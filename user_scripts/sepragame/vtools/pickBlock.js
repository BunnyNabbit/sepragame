function tool(player) {
	if (player.builderPermission == false) return

	voxelWorld.pickcolor(new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4)), player)
}

module.exports = { use: tool, attackDescription: { name: "Pick Block", description: "Picks block color" }, blockmode: "in" }
