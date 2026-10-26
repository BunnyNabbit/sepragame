function crystal(player, attack) {
	if (player.energy < attack.energyCost) return

	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	player.energy -= attack.energyCost
	player[`atk${player.selectedattack}Cooldown`] = attack.cooldown

	attack.attackCreate(player)

	brick.setColor(attack.colors[0])
	brick.setOutline(true)
	brick.setScale(new Vector3(5, 5, 5))
	brick.setPosition(new Vector3(player.position.x + 2.5, player.position.y + 2.5, player.position.z + 3))
	let time = 0
	let prot = player.rotation.z
	let animColor = 0
	var loop = setInterval(() => { // TODO: This could be optimized
		time++

		if (time > 500 || player.alive === false) {
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}
		if (time % 15 === 1) {
			animColor++
			brick.setColor(attack.colors[animColor % 3])
			bullets(player, brick.position, attack)
		}

	}, 25);
}

function bullets(player, turrentPosition, attack) {
	let target = Game.players.find(vit => player !== vit && vit.alive === true && vit.inSelector === false && Game.pointDistance3D(vit.position, turrentPosition) < 70)
	if (!target) target = botManager.ingameBots.find(vit => player !== vit && vit.alive === true && Game.pointDistance3D(vit.position, turrentPosition) < 70)
	if (!target) return
	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	soundbrick({
		url: `/sounds/creature/weaklings/2/attacks/water.mp3`,
		position: player.position,
		isGlobal: false,
		minDistance: 30,
		maxDistance: 3,
	})

	brick.setColor(attack.projectileColor)
	brick.setScale(new Vector3(1, 1, 1))
	brick.setPosition(new Vector3(turrentPosition.x + 2.5, turrentPosition.y + 2.5, turrentPosition.z + 2.5))
	let grav = 0
	let time = 0
	let sped = 1
	let prot = lookAtPoint(target.position, turrentPosition) + randomIntFromInterval(-10, 10)
	var loop = setInterval(() => {
		time++
		brick.position.x = brick.position.x += sped * Math.sin(prot / debug)
		brick.position.y = brick.position.y - + sped * Math.cos(prot / debug)
		brick.position.z = brick.position.z += grav
		brick.setPosition(brick.position)

		if (world.reflectors.some(reflector => Game.pointDistance3D(reflector.position, brick.position) < reflector.size && reflector.player !== player)) { // Reflectors
			player = world.reflectors.find(reflector => Game.pointDistance3D(reflector.position, brick.position) < reflector.size && reflector.player !== player).player // Change the attacker
			prot += 180 // Change direction
		}

		var testfor = testforHit(player, brick, 5)
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
		if (time > 30) {
			grav += -0.02
			sped += -0.01
			if (time > 50) {
				reuseHandler.deleteBrick(brick)
				clearInterval(loop)
			}
		}
	}, 25);
}

function lookAtPoint(position, position2) {
	let angle = Math.atan2(position.y - position2.y, position.x - position2.x);
	angle = -(angle * (180 / Math.PI)) + 270;
	return angle;
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = crystal