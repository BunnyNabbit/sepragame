function checkhit(victim, projectile, radius) {
	var newPosition = new Vector3(victim.position.x, victim.position.y, victim.position.z + 4)
	if (radius > pointDistance3D(newPosition, projectile.position)) {
		return true
	} else {
		return falses
	}
}

function testForHit(attacker, projectile, radius) {
	var closestDistance = 99999
	var collidedCreature = -1
	if (!attacker) return console.log("no attacker provided")

	if (collidedCreature == -1) {
		botManager.ingameBots.forEach((bot) => {
			if (bot !== attacker) {
				var distance = Game.pointDistance3D(new Vector3(bot.position.x, bot.position.y, bot.position.z + 5), projectile.position)
				if (distance < closestDistance) {
					closestDistance = distance
					collidedCreature = bot
				}
			}
		})
	}

	Game.players.forEach((player) => {
		if (player !== attacker) {
			var distance = Game.pointDistance3D(new Vector3(player.position.x, player.position.y, player.position.z + 5), projectile.position)
			if (distance < closestDistance) {
				closestDistance = distance
				collidedCreature = player
			}
		}
	})

	if (collidedCreature == -1) return -1
	if (radius > Game.pointDistance3D(new Vector3(collidedCreature.position.x, collidedCreature.position.y, collidedCreature.position.z + 5), projectile.position)) {
		return collidedCreature
	} else {
		return -1
	}
}

module.exports = testForHit
