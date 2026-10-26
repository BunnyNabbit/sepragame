function checkhit(vit, proj, rad) {
	var newpos = new Vector3(vit.position.x, vit.position.y, vit.position.z + 4)
	if (rad > pointDistance3D(newpos, proj.position)) {
		return true
	} else {
		return falses
	}
}

function testforHit(attacker, proj, rad) { // TODO: rename names and clean
	var closest = 99999
	var topbrick = -1 // Misleading, I can't remember what this is actually for... (hint: not a brick)
	if (!attacker) return console.log("no attacker provided")

	if (topbrick == -1) {
		botManager.ingameBots.forEach((bot) => {
			if (bot !== attacker) {
				var pos = Game.pointDistance3D(new Vector3(bot.position.x, bot.position.y, bot.position.z + 5), proj.position)
				if (pos < closest) {
					closest = pos
					topbrick = bot
				}
			}
		})
	}

	Game.players.forEach((player) => {
		if (player !== attacker) {
			var pos = Game.pointDistance3D(new Vector3(player.position.x, player.position.y, player.position.z + 5), proj.position)
			if (pos < closest) {
				closest = pos
				topbrick = player
			}
		}
	})

	if (topbrick == -1) return -1
	if (rad > Game.pointDistance3D(new Vector3(topbrick.position.x, topbrick.position.y, topbrick.position.z + 5), proj.position)) {
		return topbrick
	} else {
		return -1
	}
}

module.exports = testforHit