function chargedProjectile(player, attack) {
	if (player.energy < attack.energyCost) return

	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	player.energy -= attack.energyCost
	player[`atk${player.selectedattack}Cooldown`] = attack.cooldown

	attack.attackCreate(player)

	player.atk1Cooldown = player.atk1Cooldown + 25
	player.atk2Cooldown = player.atk2Cooldown + 25
	player.atk3Cooldown = player.atk3Cooldown + 25
	player.atk4Cooldown = attack.cooldown // TODO: Aware of what slot is being used
	player.atk5Cooldown = player.atk5Cooldown + 25



	let prot = player.rotation.z

	brick.setColor(attack.color)
	brick.setOutline(true)
	brick.setScale(new Vector3(1, 1, 1))

	let ready = false


	let time = 0

	let chargingLoop = setInterval(() => {
		time++
		brick.position.x = player.position.x + 5 * Math.sin(player.rotation.z / debug)
		brick.position.y = player.position.y - + 5 * Math.cos(player.rotation.z / debug)
		brick.position.z = player.position.z + 5
	
		brick.setPosition(brick.position)
		if (time > 25) {
			soundbrick({
				url: `/sounds/creature/guna/attacks/crimsonchargeblast.mp3`,
				position: player.position,
				isGlobal: false,
				minDistance: 250,
				maxDistance: 30,
			})
			prot = player.rotation.z
			time = 0
			brick.setScale(new Vector3(2.5, 2.5, 2.5))
			ready = true
			clearInterval(chargingLoop)
		}
	}, 25)

	brick.position = new Vector3(player.position.x, player.position.y, player.position.z + 5)



	let grav = 0
	let sped = attack.speed

	var loop = setInterval(() => {
		if (!ready) return
		time++
		brick.position.x = brick.position.x += sped * Math.sin(prot / debug)
		brick.position.y = brick.position.y - + sped * Math.cos(prot / debug)
		brick.position.z = brick.position.z += grav
		brick.setPosition(brick.position)

		var testfor = testforHit(player, brick, 8)
		if (testfor !== -1) {
			soundbrick({
				url: `/sounds/projectile-hit.mp3`,
				position: testfor.position,
				isGlobal: true,
				minDistance: 30,
				maxDistance: 3,
			})
			damageHandler(testfor, player, attack.attackDescription, attack.damage)
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}
		if (time > attack.decay) {
			grav += -0.02
			sped += -0.01
			if (time > attack.lifespan) {
				reuseHandler.deleteBrick(brick)
				clearInterval(loop)
			}
		}
	}, 25);
}

module.exports = chargedProjectile