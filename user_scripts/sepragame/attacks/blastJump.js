function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function blastJump(player, attack) {

	if (player.blastJumpActive == true) return

	if (player.energy < attack.energyCost) return
	player.energy -= attack.energyCost
	player[`atk${player.selectedattack}Cooldown`] = attack.cooldown

	attack.attackCreate(player)

	if (player.clientType === "Web") { // Is the player using the web client? If they are then instantly blast them
		player.socketio.emit("launch", 50)
		blastBrick(player, attack)
		attack.onBlast(player)
		return
	} // else use Brick Hill functions to force the player to manually jump

	player.energyRegen = false

	player.blastJumpActive = true

	player.setJumpPower(player.currentCreature.blastJumpPower)
	player.centerPrint("\\c6Jump!", 3)




	var overheatTimer = 0
	var blastLoop = setInterval(() => {

		overheatTimer++

		if (player.destroyed == true) {
			clearInterval(blastLoop)
		}
		if (player.blastJumpActive == false) {
			player.energyRegen = true
			player.setJumpPower(player.currentCreature.jump)
			player.centerPrint("\\c6BOOM!", 1)
			blastBrick(player, attack)
			attack.onBlast(player)
			clearInterval(blastLoop)
		}
		if (player.alive == false) {
			player.energyRegen = true
			player.centerPrint("...", 5)
			clearInterval(blastLoop)
		}
		if (overheatTimer > 40) {
			overheat(player)
			clearInterval(blastLoop)
		}

	}, 50);
}

async function overheat(player) {
	soundbrick({
		url: `/sounds/creature/guna/attacks/blastjumpoverheat.mp3`,
		position: player.position,
		isGlobal: false,
		minDistance: 300,
		maxDistance: 15,
	})
	player.centerPrint("\\c1Stunned!", 5)
	player.stunned = true
	player.energy = 0
	player.setJumpPower(0)
	player.setSpeed(0)

	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)

	await sleep(1000)

	particleManager.emitParticle("ghost", player.position)

	await sleep(1000)

	particleManager.emitParticle("ghost", player.position)

	await sleep(1000)

	particleManager.emitParticle("ghost", player.position)

	await sleep(1000)

	particleManager.emitParticle("ghost", player.position)

	await sleep(1000)

	player.energyRegen = true
	player.stunned = false
	player.setJumpPower(player.currentCreature.jump)
	player.setSpeed(player.currentCreature.speed)
}



async function blastBrick(player, attack) {
	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return console.log("blastjump got no brick")

	brick.setColor(attack.color)
	brick.setScale(new Vector3(4, 4, 4))
	brick.position = new Vector3(player.position.x, player.position.y, player.position.z + 3) // false position for testforHit()

	var testfor = testforHit(player, brick, 8)
	if (testfor !== -1) {
		attack.attackHit(testfor, player)
		damageHandler(testfor, player, attack.attackDescription, attack.blastDamage)
	}

	brick.setPosition(new Vector3(player.position.x - 2, player.position.y - 2, player.position.z - 2))

	debris(player, attack)
	debris(player, attack)
	debris(player, attack)
	debris(player, attack)
	debris(player, attack)

	await sleep(1000)



	reuseHandler.deleteBrick(brick)
}

function debris(player, attack) {

	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	brick.setColor(attack.color)
	brick.setScale(new Vector3(0.7, 0.7, 0.7))

	brick.position = new Vector3(player.position.x, player.position.y, player.position.z + 5)


	let grav = 0.78
	let time = 0
	let sped = 0.8
	let spin = 0
	let prot = randomIntFromInterval(0, 1000)
	let randomrot = randomIntFromInterval(0, 9)
	var loop = setInterval(() => {
		time++
		grav += -0.06
		sped += -0.03
		if (sped < 0) sped = 0
		brick.position.x = brick.position.x += sped * Math.sin(prot / debug)
		brick.position.y = brick.position.y - + sped * Math.cos(prot / debug)
		brick.position.z = brick.position.z += grav
		brick.setPosition(brick.position)

		if (time > 5) {
			spin += randomrot
			brick.setRotation(spin)

			var testfor = testforHit(player, brick, 3)
			if (testfor !== -1) {
				damageHandler(testfor, player, attack.attackDescription, attack.debrisDamage)
				reuseHandler.deleteBrick(brick)
				clearInterval(loop)
			}

			if (time > 50) {
				reuseHandler.deleteBrick(brick)
				clearInterval(loop)
			}
		}
	}, 25);
}

module.exports = blastJump