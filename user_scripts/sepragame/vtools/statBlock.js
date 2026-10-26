async function tool(player, blockPos) {
	if (player.builderPermission == false) return
	if (!blockPos) {
		var blockPos = new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4))
	}

	var chunkx = Math.floor(blockPos.x / 16)
	var chunky = Math.floor(blockPos.y / 16)

	var meta = await voxelWorld.getChunkMeta(chunkx, chunky)

	console.log(JSON.stringify(meta))
	player.message(`Objects: ${meta.objects.length}`)
	meta.objects.forEach((worldObject) => {
		const name = `${worldObject.name} (${worldObject.objectName}): ${worldObject.id}`
		player.message(name)
		switch (worldObject.objectName) {
			case "timetrial":
				player.debugPos(worldObject.startPosition, 5)
				player.debugPos(worldObject.endPosition, 5)
				const positions = []
				positions.push(worldObject.startPosition)
				worldObject.checkpoints.forEach((checkpoint) => {
					positions.push(checkpoint)
				})
				positions.push(worldObject.endPosition)
				player.debugLine(positions, 5)
				player.debugText(`${worldObject.name}`, worldObject.startPosition)
				break
			case "landmark":
				player.debugPos(worldObject.position, 5)
				player.debugText(`${worldObject.name}`, worldObject.position)
				break
			case "portal":
				player.debugPos(worldObject.position, 5)
				player.debugPos(worldObject.toPosition, 5)
				player.debugLine([worldObject.position, worldObject.toPosition], 5)
				player.debugText(`${worldObject.name}`, worldObject.position)
				break
			default:
				break
		}
	})
}

module.exports = { use: tool, attackDescription: { name: "Debug Chunk", description: "Meta data of chunk" }, blockmode: "in" }
