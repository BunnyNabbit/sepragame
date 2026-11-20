const constants = require("../../constants.js")

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function interpolateColor(a, b, amount) {
	amount = clamp(amount, 0, 1)
	var ah = parseInt(a.replace(/#/g, ""), 16),
		ar = ah >> 16,
		ag = (ah >> 8) & 0xff,
		ab = ah & 0xff,
		bh = parseInt(b.replace(/#/g, ""), 16),
		br = bh >> 16,
		bg = (bh >> 8) & 0xff,
		bb = bh & 0xff,
		rr = ar + amount * (br - ar),
		rg = ag + amount * (bg - ag),
		rb = ab + amount * (bb - ab)

	return "#" + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1)
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

module.exports = function evaluateObject(timeTrialObject, player) {
	if (!timeTrialObject.enabled) return
	if (Game.pointDistance3D(player.position, timeTrialObject.startPosition) > 10) return
	if (player.timetrial) {
		// Player already has an active timetrial
		player.centerPrint('Press "E" or "SLASH" to exit time trial', 1)
		player.keyPrompt = function () {
			if (player.timetrial) {
				if (Game.pointDistance3D(player.position, timeTrialObject.startPosition) > 10) return
				player.timetrial = null
				reuseHandler.deleteBrick(player.checkPointFruit)
				clearInterval(player.timetrialTimer)
				player.message("Aborted time trial")
			}
			player.keyPrompt = null
		}
	} else {
		player.centerPrint('Press "E" or "SLASH" to play time trial', 1)
		player.keyPrompt = function () {
			player.keyPrompt = null
			if (Game.pointDistance3D(player.position, timeTrialObject.startPosition) > 10) return
			player.checkPointFruit = reuseHandler.reuseBrick()
			if (player.checkPointFruit == -1) return

			let startTime = new Date()
			let lastPosition = timeTrialObject.startPosition
			player.checkpoint = 0
			player.timetrial = timeTrialObject
			player.setPosition(timeTrialObject.startPosition)
			player.message("Time trial started!")

			player.checkPointFruit.setScale(new Vector3(1, 1, 1))
			player.checkPointFruit.setOutline(true)
			player.checkPointFruit.setColor(`#e6e600`)
			if (timeTrialObject.checkpoints[player.checkpoint]) {
				// Checkpoint fruit
				player.checkPointFruit.setPosition(timeTrialObject.checkpoints[player.checkpoint])
			} else {
				player.checkPointFruit.setPosition(timeTrialObject.endPosition)
			}
			soundbrick(
				{
					url: `/sounds/random/plink.flac`,
					isGlobal: true,
				},
				player
			)
			//p.message("Press SLASH to exit time trial")
			player.timetrialTimer = setInterval(() => {
				let timeColor = ""
				if (timeTrialObject.checkpoints[player.checkpoint]) {
					timeColor = `[${interpolateColor("#00FF00", "#FF0000", Game.pointDistance3D(player.position, player.checkPointFruit.position) / Game.pointDistance3D(lastPosition, player.checkPointFruit.position))}]`
					//p.message(`${Game.pointDistance3D(p.position, obj.checkpoints[p.checkpoint])}`)
				} else {
					timeColor = `[${interpolateColor("#00FF00", "#FF0000", Game.pointDistance3D(player.position, player.checkPointFruit.position) / Game.pointDistance3D(lastPosition, player.checkPointFruit.position))}]`
					//p.message(`${Game.pointDistance3D(p.position, obj.endPosition)}`)
				}
				player.bottomPrint(timeColor + (-(startTime - new Date()) / 1000).toFixed(2))
				if (!player.alive || player.destroyed) {
					player.message("\\c6Time trial aborted because of death")
					player.timetrial = null
					player.keyPrompt = null
					reuseHandler.deleteBrick(player.checkPointFruit)
					clearInterval(player.timetrialTimer)
					return
				}
				if (Game.pointDistance3D(player.position, timeTrialObject.startPosition) > timeTrialObject.loseRadius) {
					player.message("\\c6Time trial aborted")
					player.timetrial = null
					player.keyPrompt = null
					reuseHandler.deleteBrick(player.checkPointFruit)
					clearInterval(player.timetrialTimer)
					return
				}
				if (timeTrialObject.checkpoints[player.checkpoint]) {
					// Checkpoint fruit
					if (Game.pointDistance3D(player.position, timeTrialObject.checkpoints[player.checkpoint]) < 10) {
						soundbrick({
							url: `/sounds/eat/${randomIntFromInterval(1, 4)}.flac`,
							isGlobal: false,
							position: player.position,
						})
						soundbrick(
							{
								url: `/sounds/random/minebeep.flac`,
								isGlobal: true,
							},
							player
						)
						const color = "#FFFF00"
						for (let index = 0; index < 5; index++) {
							setTimeout(() => {
								drippyPosition = new Vector3()
								drippyPosition.x = player.position.x + player.currentCreature.characterModelOffsets.mouth.x * Math.sin(player.rotation.z / debug)
								drippyPosition.y = player.position.y - +player.currentCreature.characterModelOffsets.mouth.x * Math.cos(player.rotation.z / debug)
								drippyPosition.z = player.position.z + player.currentCreature.characterModelOffsets.mouth.y - 0.8
								particleManager.emitParticle("drippy", {
									position: drippyPosition,
									color: color,
									directionalForce: 0,
									direction: 0,
									expire: 200,
								})
							}, 800 * index)
						}
						player.sprintTime += 2
						particleManager.emitParticle("slash", new Vector3(player.position.x + randomIntFromInterval(-3, 3), player.position.y + randomIntFromInterval(-3, 3), player.position.z + randomIntFromInterval(-3, 3)))
						player.checkpoint++
						lastPosition = player.checkPointFruit.position
						if (timeTrialObject.checkpoints[player.checkpoint]) {
							player.checkPointFruit.forceSetPosition(timeTrialObject.checkpoints[player.checkpoint])
						} else {
							player.checkPointFruit.forceSetPosition(timeTrialObject.endPosition)
						}
						return
					}
				} else {
					// Goal
					if (Game.pointDistance3D(player.position, timeTrialObject.endPosition) < 10) {
						let score = -(startTime - new Date()) / 1000
						soundbrick(
							{
								url: `/sounds/time-trial-goal.ogg`,
								isGlobal: true,
							},
							player
						)
						player.message("\\c6TIME TRIAL COMPLETE")
						player.message(`Seconds: ${score}`)
						Game.messageAll(`${player.username} completed \"${timeTrialObject.name}\" in ${score} seconds`)
						if (constants.discordEnabled) bot.channels.get(channel).send(`${player.username} ${player.currentCreature.discordEmoji} completed \"${timeTrialObject.name}\" in ${score} seconds`)
						player.timetrial = null
						reuseHandler.deleteBrick(player.checkPointFruit)
						player.keyPrompt = null
						clearInterval(player.timetrialTimer)
						return
					}
				}
			}, 60)
		}
	}
}
