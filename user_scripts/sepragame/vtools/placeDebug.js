function tool(player, blockPos) {
	if (player.builderPermission == false) return
	if (!blockPos) {
		var blockPos = new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4))
	}

	var falsebrick = new Brick(new Vector3(blockPos.x * 4 - 0.1, blockPos.y * 4 - 0.1, blockPos.z * 4 - 0.1), new Vector3(4.3, 4.3, 4.3), util.color.randomHexColor())
	player.loadBricks([falsebrick])
	setTimeout(() => {
		if (player.clientType === "Brick Hill") {
			falsebrick.destroy()
		} else {
			player.deleteBricksWeb([falsebrick])
		}
	}, 1000)
}

module.exports = { use: tool, attackDescription: { name: "Place Debug", description: 'Place a "false" brick for testing.' }, blockmode: "out" }
