worldObjectTypes = {
	timetrial: require("./evaluate/timetrialEvaluate.js"),
	landmark: require("./evaluate/landmarkEvaluate.js"),
	portal: require("./evaluate/portalEvaluate.js"),
}

module.exports = async function evaluateWorldObjectsOnPlayer(player) {
	let chunks = []
	for (var x = -1; x < 2; x++) {
		for (var y = -1; y < 2; y++) {
			chunks.push(await voxelWorld.getChunkMeta(Math.floor(player.position.x / 64) + x, Math.floor(player.position.y / 64) + y))
		}
	}
	chunks.forEach((chunk) => {
		chunk.objects.forEach((obj) => {
			// Evaluate
			const worldObjectEvaluateFunction = worldObjectTypes[obj.objectName]
			if (typeof worldObjectEvaluateFunction === "function") worldObjectEvaluateFunction(obj, player)
		})
	})
}
