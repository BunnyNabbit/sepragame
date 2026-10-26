const { getPWPos } = require("../funct/vectorHelpers.js")
const { canCollide } = require("../funct/blockHelpers.js")
inBlock = require("../funct/inBlock.js")

async function bullet(player, rotation, attack) {
	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	let prot = rotation

	brick.setColor(attack.color)
	brick.setScale(new Vector3(attack.size, attack.size, attack.size))
	brick.position = new Vector3(player.position.x, player.position.y, player.position.z + player.currentCreature.charmodel.mouth.y + attack.mouthYOffset)

	if (attack.duoBlaster) {
		if (player.attackcos == true) {
			player.attackcos = false
			var blasterSelectRot = 90
		} else {
			player.attackcos = true
			var blasterSelectRot = -90
		}
	}

	brick.position.x = brick.position.x += (player.currentCreature.charmodel.mouth.x + attack.mouthXOffset) * Math.sin(prot / debug)
	brick.position.y = brick.position.y - +(player.currentCreature.charmodel.mouth.x + attack.mouthXOffset) * Math.cos(prot / debug)

	if (attack.duoBlaster) {
		brick.position.x = brick.position.x += 3 * Math.sin(blasterSelectRot + prot / debug)
		brick.position.y = brick.position.y - +3 * Math.cos(blasterSelectRot + prot / debug)
	}

	brick.setPosition(brick.position)

	let grav = 0
	let time = 0
	let sped = attack.speed
	let tickable = true
	var loop = setInterval(async () => {
		if (tickable == false) return
		tickable = false

		time++
		brick.position.x = brick.position.x += sped * Math.sin(prot / debug)
		brick.position.y = brick.position.y - +sped * Math.cos(prot / debug)
		brick.position.z = brick.position.z += grav

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

		if (attack.reflectable && world.reflectors.some((reflector) => Game.pointDistance3D(reflector.position, brick.position) < reflector.size && reflector.player !== player)) {
			// Reflectors
			player = world.reflectors.find((reflector) => Game.pointDistance3D(reflector.position, brick.position) < reflector.size && reflector.player !== player).player // Change the attacker
			prot += 180 // Change direction
		}

		var testfor = testforHit(player, brick, attack.radius)
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
				return clearInterval(loop)
			}
		}
		tickable = true
	}, 25)
}

function projectile(player, attack) {
	if (player.energy < attack.energyCost) return
	player.energy -= attack.energyCost
	player[`atk${player.selectedattack}Cooldown`] = attack.cooldown
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
killmessage: killed
discordimage: :crimsonbullet:
*/

module.exports = projectile
