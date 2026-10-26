//const voxelWorld = require("../voxel/voxelWorld")

async function walkTowardsAngleAndStepUpOrDownTerrain(bot, speed, angle) {

	bot.oldposition = new Vector3(bot.position.x, bot.position.y, bot.position.z)


	bot.setRotation(new Vector3(0, 0, angle))
	var x = bot.position.x + speed * Math.sin(angle / debug)
	var y = bot.position.y - + speed * Math.cos(angle / debug)

	var terrainStep = await collisionOutTerrain(new Vector3(x, y, bot.position.z))

	switch (terrainStep) {
		case 0: // Stay on ground
			bot.setPosition(new Vector3(x, y, bot.position.z))
			break;
		case 1: // Fall down 1 block
			bot.setPosition(new Vector3(x, y, bot.position.z - 4))
			break;
		case 2: // Step up
			bot.setPosition(new Vector3(x, y, bot.position.z + 4))
			break;
		case 3: // Can't enter position
			bot.setPosition(bot.oldposition)
			break;
	}
}
function damage(bot, damage) { // Add damage to a bot
	bot.health += damage
	bot.damaged = true
	bot.anger = 400
	if (bot.health < 0 && bot.alive == true) {
		kill(bot)
	}
}

async function kill(bot) {
	bot.alive = false

	const deathpos = bot.position
	particleManager.emitParticle("bloodsmall", deathpos)
	particleManager.emitParticle("bloodsmall", deathpos)
	particleManager.emitParticle("bloodsmall", deathpos)
	particleManager.emitParticle("bloodsmall", deathpos)
	particleManager.emitParticle("bloodsmall", deathpos)
	await sleep(1000)
	particleManager.emitParticle("bloodsmall", deathpos)
	particleManager.emitParticle("bloodsmall", deathpos)
	await sleep(500)
	particleManager.emitParticle("bloodsmall", deathpos)
	particleManager.emitParticle("bloodsmall", deathpos)

}

function destroy(bot) {
	bot.destroy()
	bot.destroyed = true // bot.destory() doesn't appear to set true for some reason and results in BH character models to remain
	//bot.charbot.destroy() // This is also another solution to the above problem
	webClient.socketio.emit("deleteplayer", bot.webNetId)
	botManager.ingameBots.splice(botManager.ingameBots.indexOf(bot), 1);
	//webClient.characters[bot.webNetId] = undefined
	delete webClient.characters[bot.webNetId]
}

function bite(bot, player) { // when player bites dead bot
	particleManager.emitParticle("bloodsmall", bot.position)
	particleManager.emitParticle("bloodsmall", bot.position)
	bot.totalBites++
	player.stamina += bot.currentCreature.biteRegenStam
	player.health += bot.currentCreature.biteRegenHP
	if (player.stamina > 300) player.stamina = 300
	if (player.clientType === "Web") player.socketio.emit("gui", [{ type: "stamina", value: player.stamina }])
	if (player.health > player.maxhealth) player.health = player.maxhealth
	player.setHealth(player.health)
	if (bot.totalBites == bot.currentCreature.totalBites) {
		soundbrick({
			url: `/sounds/eat/bodyexplode.flac`,
			isGlobal: false,
			position: bot.position
		})
		particleManager.emitParticle("bloodsmall", bot.position)
		particleManager.emitParticle("bloodsmall", bot.position)
		particleManager.emitParticle("bloodsmall", bot.position)
		particleManager.emitParticle("bloodsmall", bot.position)
		particleManager.emitParticle("bloodsmall", bot.position)
		destroy(bot)
	}

	soundbrick({
		url: `/sounds/eat/${randomIntFromInterval(1, 4)}.flac`,
		isGlobal: false,
		position: bot.position
	})
}

function init(position, meta) { // Use an animation controller on the bot and set helth and that stuff
	let bot = new Bot("AI Bot")


	bot.setPosition(position)

	let outfit = new Outfit(bot)
		.body("#0d9436")
		.torso("#694813")
		.rightLeg("#694813")
		.leftLeg("#694813")
	bot.setOutfit(outfit)
	Game.newBot(bot)

	setTimeout(() => {
		if (!bot.destroyed) bot.setScale(new Vector3(0, 0, 1))
	}, 100)
	bot.health = meta.hp
	bot.currentCreature = meta
	bot.alive = true

	webClient.nextNetId.id++

	bot.webNetId = `${webClient.nextNetId.id}`
	charAnimate(bot)
	bot.charbot.changeSize(1)
	let outfit2 = new Outfit(bot.charbot)
		.hat1(meta.charmodel.hat1)
		.hat2(meta.charmodel.hat2)
		.hat3(meta.charmodel.hat3)
	bot.charbot.setOutfit(outfit2)

	webClient.characters[bot.webNetId] = {
		netId: `${bot.webNetId}`,
		name: "",
		position: { x: position.x, y: position.y, z: position.z, r: 0 },
		morph: bot.currentCreature.saveID,
		modelRotationOffset: bot.currentCreature.webModelRotationOffset,
		logicRotationOffset: bot.currentCreature.webLogicRotationOffset,
		networkRotationOffset: bot.currentCreature.webNetworkRotationOffset
	}
	webClient.socketio.emit('createplayer', { // Create player
		netId: `${bot.webNetId}`,
		model: bot.currentCreature.saveID,
		name: "",
		modelRotationOffset: bot.currentCreature.webModelRotationOffset,
		logicRotationOffset: bot.currentCreature.webLogicRotationOffset,
		networkRotationOffset: bot.currentCreature.webNetworkRotationOffset
	});

	bot.oldSetPosition = bot.setPosition
	bot.sendPosLimit = null
	bot.setPosition = function (msg) {
		bot.oldSetPosition(msg)
		if (bot.sendPosLimit) return
		webClient.socketio.emit(`pm`, { p: { x: parseFloat(msg.x.toFixed(1)), y: parseFloat(msg.y.toFixed(1)), z: parseFloat(msg.z.toFixed(1)), r: bot.rotation.z }, netId: bot.webNetId })
		bot.sendPosLimit = true
		setTimeout(() => {
			bot.sendPosLimit = null
		}, 90);
	}

	bot.animateReady = true
	bot.isBot = true
	bot.onGround = true
	bot.totalBites = 0
	bot.username = "Bot"

	bot.debuffDamageLeft = 0
	bot.debuffDamageAmount = 0
	bot.debuffAttacker = "none"
	bot.debuffParticles = "none" // Any registered particle
	bot.debuffAttackRef = "none"

	bot.setInterval(() => {
		if (bot.debuffDamageLeft > 0) {
			bot.debuffDamageLeft -= bot.debuffDamageAmount
			damageHandler(bot, bot.debuffAttacker, bot.debuffAttackRef, -bot.debuffDamageAmount)
			if (bot.debuffParticles !== "none") {
				particleManager.emitParticle(bot.debuffParticles, bot.position)
			}
		}
	}, 1000);

	bot.setInterval(() => { // Check if players are around bot, if not then destroy the bot.
		if (Game.players.some(player => Game.pointDistance3D(player.position, bot.position) < 360) === false) {
			if (bot.persistent) {
				//voxelWorld.getChunkMeta()
				//destroy(bot)
			} else {
				destroy(bot)
			}
		}
	}, 10000);

	botManager.ingameBots.push(bot)

	return bot
}

module.exports = { walkTowardsAngleAndStepUpOrDownTerrain, damage, kill, destroy, init, bite }

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}