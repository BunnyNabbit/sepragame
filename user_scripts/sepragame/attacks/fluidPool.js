function attack(player, attack) {
	if (player.energy < attack.energyCost) return

	player.energy -= attack.energyCost
	player[`atk${player.selectedAttack}Cooldown`] = attack.cooldown

	attack.attackCreate(player)

	for (var y = 0; y < 9; y++) {
		spit(player, y, attack)
	}
}
async function spit(player, y, attack) {
	setTimeout(async () => {
		if (player.alive === false) return // The player is dead
		let brick = reuseHandler.reuseBrick()
		if (brick == -1) return

		brick.setColor("#ff0000")
		brick.setOutline(true)
		brick.setScale(new Vector3(0.9, 0.9, 0.7))
		brick.setPosition(new Vector3(player.position.x, player.position.y, player.position.z + 5))
		let gravity = 0.78 + randomIntFromInterval(-10, 10) / 35
		let time = 0
		let speed = 0.8 + randomIntFromInterval(-10, 10) / 37
		let spin = 0
		let splatter = false
		let projectileRotation = player.rotation.z + randomIntFromInterval(-15, 15)
		let randomRotation = randomIntFromInterval(0, 9)
		let animationColor = 0
		let falseBrick = { position: brick.position }
		var loop = setInterval(async () => {
			time++
			gravity += -0.06
			speed += -0.03
			if (speed < 0) speed = 0
			if (splatter == false) {
				brick.position.x = brick.position.x += speed * Math.sin(projectileRotation / debug)
				brick.position.y = brick.position.y - +speed * Math.cos(projectileRotation / debug)
				brick.position.z = brick.position.z += gravity

				if (inBlock(brick.position) === true) {
					// Check if spit can splatter on the ground
					splatter = true

					brick.position.z = Math.floor(brick.position.z / 4) * 4 + 3.8

					brick.setScale(new Vector3(2.5, 2.5, 0.5))
				}

				brick.setPosition(brick.position)

				if (time > 3) {
					spin += randomRotation
					brick.setRotation(spin)
				}
			}

			if (time > 280) {
				reuseHandler.deleteBrick(brick)
				clearInterval(loop)
			}
			if (time % 3 == 1) {
				animationColor++
				brick.setColor(attack.colors[animationColor % attack.colors.length])
				falseBrick.position = new Vector3(brick.position.x, brick.position.y, brick.position.z + 3)
				var testedHit = testForHit(player, falseBrick, 5)
				if (testedHit !== -1) {
					testedHit.debuffDamageLeft = attack.totalDamage
					testedHit.debuffDamageAmount = attack.damagePerSecond
					testedHit.debuffAttacker = player
					testedHit.debuffAttackRef = attack.attackDescription
					testedHit.debuffParticles = "flames" // Any regisitered particle
				}
			}
		}, 25)
	}, y * 200)
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = attack
