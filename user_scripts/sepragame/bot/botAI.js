const clickTypes = {
	//resourceful: require("./resourceful.js")
	once: require("./attackUse/once.js"),
	blastful: require("./attackUse/blastful.js"),
}

async function botAI(position, data) {
	const bot = botManager.botController.init(position, data)

	bot.walktoposition = position
	bot.oldposition = position

	let time = 20

	bot.speed = data.speed

	bot.anger = 0
	bot.attackFocus = ""

	bot.target = "ignore"
	bot.wonderTravelAngle = 0
	bot.wonderIdleTimeMin = data.wonderIdleTimeMin
	bot.wonderIdleTimeMax = data.wonderIdleTimeMax
	bot.wonderMoveTimeMin = data.wonderMoveTimeMin
	bot.wonderMoveTimeMax = data.wonderMoveTimeMax

	// Manage attack states
	bot.attacks = []
	bot.attackStates = []

	if (data.attacks.atk1) bot.attacks.push(data.attacks.atk1)
	if (data.attacks.atk2) bot.attacks.push(data.attacks.atk2)
	if (data.attacks.atk3) bot.attacks.push(data.attacks.atk3)
	if (data.attacks.atk4) bot.attacks.push(data.attacks.atk4)
	if (data.attacks.atk5) bot.attacks.push(data.attacks.atk5)

	bot.attacks.forEach((attack) => {
		bot.attackStates.push({
			cooldown: 0,
			usageA: 0,
			weight: attack.weight,
			attack: attack,
		})
	})

	if (data.behavior === "cowardly") {
		var angerTol = 300
	} else {
		var angerTol = 3
	}

	//bot.attack1cooldown = 0
	//bot.attack2cooldown = 0
	//bot.attack3cooldown = 0
	//bot.attack4cooldown = 0
	//bot.attack5cooldown = 0

	//bot.prediction = false

	let state = "move"
	let despawnTime = 0

	bot.setPosition(new Vector3(Math.floor(bot.position.x / 4) * 4 + 1.5, Math.floor(bot.position.y / 4) * 4 + 1.5, await findTopSurfaceOfWorld(bot.position)))

	bot.getAttack = () => {
		let atk1 = bot.attackStates.find((atk) => atk.cooldown <= 0)
		if (!atk1) return null
		for (let i = 0; i < bot.attackStates.length; i++) {
			const atk2 = bot.attackStates[i]
			if (atk2.cooldown <= 0 && atk2.weight > atk1.weight) {
				atk1 = atk2
			}
		}
		return atk1
	}

	bot.setInterval(async () => {
		if (bot.alive == true) {
			time--
			bot.attackStates.forEach((state) => {
				state.cooldown--
			})
			if (time < 0) {
				if (randomIntFromInterval(1, 2) == 1) {
					state = "idle"
					time = randomIntFromInterval(bot.wonderIdleTimeMin, bot.wonderIdleTimeMax)
				} else {
					bot.wonderTravelAngle = randomIntFromInterval(1, 360)
					state = "move"
					time = randomIntFromInterval(bot.wonderMoveTimeMin, bot.wonderMoveTimeMax)
				}
				if (bot.anger > angerTol) {
					state = "attack"
					time = 80
				}
			}
			if (state == "move") {
				botManager.botController.walkTowardsAngleAndStepUpOrDownTerrain(bot, bot.speed / 6, bot.wonderTravelAngle)

				let fleefrom = bot.findClosestPlayer(20)
				if (fleefrom) {
					if (Game.pointDistance3D(bot.position, fleefrom.position) < 20) {
						state = "flee"
						time = 30
					}
				}
			}
			if (state == "attack") {
				let target = bot.findClosestPlayer(90)
				if (target) {
					let attackState = bot.getAttack()

					if (attackState) {
						bot.attackFocus = attackState.attack.attackClass
						if (attackState.attack.attackClass === "melee") {
							if (Game.pointDistance3D(bot.position, target.position) > 5) {
								let angle = lookAtPoint(target.position, bot)
								botManager.botController.walkTowardsAngleAndStepUpOrDownTerrain(bot, bot.speed / 8, angle)
								bot.setRotation(new Vector3(0, 0, lookAtPoint(target.position, bot)))
							}

							if (Game.pointDistance3D(bot.position, target.position) < 6) {
								attackState.cooldown = attackState.attack.cooldown

								attackState.attack.use(bot)
							}
						} else {
							let x = true

							if (Game.pointDistance3D(bot.position, target.position) < 5) {
								let angle = lookAtPoint(target.position, bot) + 180
								botManager.botController.walkTowardsAngleAndStepUpOrDownTerrain(bot, bot.speed / 8, angle)
								x = false
							}

							if (Game.pointDistance3D(bot.position, target.position) > 15) {
								let angle = lookAtPoint(target.position, bot)
								botManager.botController.walkTowardsAngleAndStepUpOrDownTerrain(bot, bot.speed / 8, angle)
								bot.setRotation(new Vector3(0, 0, lookAtPoint(target.position, bot)))
								attackState.cooldown = attackState.attack.cooldown

								attackState.attack.use(bot)
							} else if (x) {
								bot.setRotation(new Vector3(0, 0, lookAtPoint(target.position, bot)))
								attackState.cooldown = attackState.attack.cooldown

								attackState.attack.use(bot)
							}
						}
					} else {
						if (bot.attackFocus === "melee" && !bot.attackStates.some((element) => element.cooldown < 20) && Game.pointDistance3D(bot.position, target.position) < 80) {
							let angle = lookAtPoint(target.position, bot) + 180
							botManager.botController.walkTowardsAngleAndStepUpOrDownTerrain(bot, bot.speed / 8, angle)
						} else {
							if (Game.pointDistance3D(bot.position, target.position) < 5) {
								let angle = lookAtPoint(target.position, bot) + 180
								botManager.botController.walkTowardsAngleAndStepUpOrDownTerrain(bot, bot.speed / 8, angle)
							}

							if (Game.pointDistance3D(bot.position, target.position) > 15) {
								let angle = lookAtPoint(target.position, bot)
								botManager.botController.walkTowardsAngleAndStepUpOrDownTerrain(bot, bot.speed / 8, angle)
								bot.setRotation(new Vector3(0, 0, lookAtPoint(target.position, bot)))
							}
						}
					}
				} else {
					// Lost the target, return to normal.
					bot.anger = 0
					state = "idle"
				}

				if (bot.hp < 20 && bot.saveID === "magmeer") {
					// Low on HP
					bot.anger = -50
					state = "flee"
				}
			}
			if (state == "idle") {
				let fleefrom = bot.findClosestPlayer(20)
				if (fleefrom) {
					if (Game.pointDistance3D(bot.position, fleefrom.position) < 20) {
						state = "flee"
						time = 30
					}
				}
			}
			if (state == "flee") {
				let fleefrom = bot.findClosestPlayer(65)
				if (fleefrom) {
					bot.anger++
					var angle = lookAtPoint(fleefrom.position, bot) + 180
					botManager.botController.walkTowardsAngleAndStepUpOrDownTerrain(bot, bot.speed / 6, angle)
				} else {
					let fleefrom = bot.findClosestPlayer(70)
					if (fleefrom) {
						var angle = lookAtPoint(fleefrom.position, bot)
						bot.setRotation(new Vector3(0, 0, angle))
					}
				}
			}
		} else {
			var player = bot.findClosestPlayer(5)
			if (player) {
				player.centerPrint('\\c4Press "E" to eat', 1)
			}
			if (bot.persistent) {
				despawnTime += 0.01
			} else {
				despawnTime += 1
			}
			if (despawnTime > 1200) {
				botManager.botController.destroy(bot)
			}
		}
	}, 50)
}

function lookAtPoint(position, bot) {
	let angle = Math.atan2(position.y - bot.position.y, position.x - bot.position.x)
	angle = -(angle * (180 / Math.PI)) + 270
	return angle
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = botAI
