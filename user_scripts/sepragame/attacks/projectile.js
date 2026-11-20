const { canCollide } = require("../functions/blockHelpers.js")
inBlock = require("../functions/inBlock.js")

async function bullet(player, rotation, attack) {
	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	let projectileRotation = rotation

	brick.setColor(attack.color)
	brick.setScale(new Vector3(attack.size, attack.size, attack.size))
	brick.position = new Vector3(player.position.x, player.position.y, player.position.z + player.currentCreature.characterModelOffsets.mouth.y + attack.mouthYOffset)

	if (attack.duoBlaster) {
		if (player.duoBlasterState == true) {
			player.duoBlasterState = false
			var blasterSelectRotation = 90
		} else {
			player.duoBlasterState = true
			var blasterSelectRotation = -90
		}
	}

	brick.position.x = brick.position.x += (player.currentCreature.characterModelOffsets.mouth.x + attack.mouthXOffset) * Math.sin(projectileRotation / debug)
	brick.position.y = brick.position.y - +(player.currentCreature.characterModelOffsets.mouth.x + attack.mouthXOffset) * Math.cos(projectileRotation / debug)

	if (attack.duoBlaster) {
		brick.position.x = brick.position.x += 3 * Math.sin(blasterSelectRotation + projectileRotation / debug)
		brick.position.y = brick.position.y - +3 * Math.cos(blasterSelectRotation + projectileRotation / debug)
	}

	brick.setPosition(brick.position)

	let gravity = 0
	let time = 0
	let speed = attack.speed
	let tickable = true
	var loop = setInterval(async () => {
		if (tickable == false) return
		tickable = false

		time++
		brick.position.x = brick.position.x += speed * Math.sin(projectileRotation / debug)
		brick.position.y = brick.position.y - +speed * Math.cos(projectileRotation / debug)
		brick.position.z = brick.position.z += gravity

		let col = await inBlock(brick.position)
		if (col) {
			soundbrick({
				url: `/sounds/projectile-hit.mp3`,
				position: brick.position,
				isGlobal: true,
				minDistance: 30,
				maxDistance: 3,
			})
			reuseHandler.deleteBrick(brick)
			return clearInterval(loop)
		}

		brick.setPosition(brick.position)

		if (attack.deflectable && world.reflectors.some((reflector) => Game.pointDistance3D(reflector.position, brick.position) < reflector.size && reflector.player !== player)) {
			// Reflectors
			player = world.reflectors.find((reflector) => Game.pointDistance3D(reflector.position, brick.position) < reflector.size && reflector.player !== player).player // Change the attacker
			projectileRotation += 180 // Change direction
		}

		var testedHit = testForHit(player, brick, attack.radius)
		if (testedHit !== -1) {
			soundbrick({
				url: `/sounds/projectile-hit.mp3`,
				position: testedHit.position,
				isGlobal: true,
				minDistance: 30,
				maxDistance: 3,
			})
			damageHandler(testedHit, player, attack.attackDescription, attack.damage)
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}
		if (time > attack.decay) {
			gravity += -0.02
			speed += -0.01
			if (time > attack.lifespan) {
				reuseHandler.deleteBrick(brick)
				return clearInterval(loop)
			}
		}
		tickable = true
	}, 25)
}

function projectile(player, attack) {
	if (player.energy < attack.energyCost) return
	player.energy -= attack.energyCost
	player[`atk${player.selectedAttack}Cooldown`] = attack.cooldown
	attack.attackCreate(player)

	if (attack.triShot) {
		if (randomIntFromInterval(1, 5) === 5) {
			bullet(player, player.rotation.z - 15, attack)
			bullet(player, player.rotation.z, attack)
			bullet(player, player.rotation.z + 15, attack)
		} else {
			bullet(player, player.rotation.z, attack)
		}
	} else {
		bullet(player, player.rotation.z, attack)
	}
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

//clearInterval(loop);
/*
killMessage: killed
discordEmoji: :crimsonbullet:
*/

module.exports = projectile
