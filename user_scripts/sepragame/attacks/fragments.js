function attack(player, attack) {
	if (player.energy < attack.energyCost) return

	player.energy -= attack.energyCost
	player[`atk${player.selectedattack}Cooldown`] = attack.cooldown

	attack.attackCreate(player)



	for (var spawnRot = 0; spawnRot < 5; spawnRot++) {
		frag(player, spawnRot * 25, attack)
	}


}
async function frag(player, y, attack) {
	if (player.alive === false) return // The player is dead
	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	brick.setColor("#ff0000")
	brick.setOutline(true)
	brick.setScale(new Vector3(0.9, 0.9, 0.7))
	brick.setPosition(new Vector3(player.position.x, player.position.y, player.position.z + 5))
	let grav = 0.78 + (randomIntFromInterval(-10, 10) / 35)
	let time = 0
	let sped = 0.8 + (randomIntFromInterval(-10, 10) / 37)
	let spin = 0
	let splatter = false
	let prot = player.rotation.z + randomIntFromInterval(-15, 15)
	let randomrot = randomIntFromInterval(0, 9)
	let animColor = 0
	let falseBrick = { position: brick.position }
	var loop = setInterval(async () => {
		time++
		grav += -0.06
		sped += -0.03
		if (sped < 0) sped = 0
		if (splatter == false) {
			brick.position.x = brick.position.x += sped * Math.sin(prot / debug)
			brick.position.y = brick.position.y - + sped * Math.cos(prot / debug)
			brick.position.z = brick.position.z += grav

			if (await inBlock(brick.position) === true) { // Check if spit can splatter on the ground
				splatter = true

				brick.position.z = (Math.floor(brick.position.z / 4) * 4) + 3.8

				brick.setScale(new Vector3(2.5, 2.5, 0.5))
			}

			brick.setPosition(brick.position)


			if (time > 3) {
				spin += randomrot
				brick.setRotation(spin)
			}
		}

		if (time > 280) {
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}
		if (time % 3 == 1) {
			animColor++
			brick.setColor(attack.colors[animColor % 5])
			falseBrick.position = new Vector3(brick.position.x, brick.position.y, brick.position.z + 3)
			var testfor = testforHit(player, falseBrick, 5)
			if (testfor !== -1) {
				testfor.debuffDamageLeft = attack.totalDamage
				testfor.debuffDamageAmount = attack.damagePerSecond
				testfor.debuffAttacker = player
				testfor.debuffAttackRef = attack.attackDescription
				testfor.debuffParticles = "flames" // Any regisitered particle
			}
		}
	}, 25);
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = attack