function attack(player, attack) {
	if (player.energy < attack.energyCost) return
	player.energy -= attack.energyCost
	player[`atk${player.selectedAttack}Cooldown`] = attack.cooldown

	attack.attackCreate(player)

	let time = 0
	let projectileRotation = player.rotation.z
	let dasherPosition = new Vector3(player.position.x, player.position.y, player.position.z)

	var loop = setInterval(async () => {
		if (!player.alive) return clearInterval(loop)
		time++
		dasherPosition.x = dasherPosition.x += 2 * Math.sin(projectileRotation / debug)
		dasherPosition.y = dasherPosition.y - +2 * Math.cos(projectileRotation / debug)
		dasherPosition.z = dasherPosition.z
		if (inBlock(dasherPosition) === false) {
			player.setPosition(dasherPosition)
			particleManager.emitParticle("ghost", player.position)
		} else {
			return clearInterval(loop)
		}

		var testedHit = testForHit(player, player, attack.radius)
		if (testedHit !== -1) {
			soundbrick({
				url: `/sounds/claws-hit.flac`,
				position: testedHit.position,
				isGlobal: true,
				minDistance: 30,
				maxDistance: 3,
			})
			damageHandler(testedHit, player, attack.attackDescription, attack.damage)
			clearInterval(loop)
		}
		if (time > 30) {
			clearInterval(loop)
		}
	}, 25)
}

//clearInterval(loop);
/*
killMessage: killed
discordEmoji: :crimsonbullet:
*/

module.exports = attack
