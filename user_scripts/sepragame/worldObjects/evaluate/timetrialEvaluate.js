const constants = require("../../constants.js")

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function lerpColor(a, b, amount) {
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

module.exports = function evaluateObject(obj, p) {
	if (!obj.enabled) return
	if (Game.pointDistance3D(p.position, obj.startPosition) > 10) return
	if (p.timetrial) {
		// Player already has an active timetrial
		p.centerPrint('Press "E" or "SLASH" to exit time trial', 1)
		p.keyPrompt = function () {
			if (p.timetrial) {
				if (Game.pointDistance3D(p.position, obj.startPosition) > 10) return
				p.timetrial = null
				reuseHandler.deleteBrick(p.checkPointFruit)
				clearInterval(p.timetrialTimer)
				p.message("Aborted time trial")
			}
			p.keyPrompt = null
		}
	} else {
		p.centerPrint('Press "E" or "SLASH" to play time trial', 1)
		p.keyPrompt = function () {
			p.keyPrompt = null
			if (Game.pointDistance3D(p.position, obj.startPosition) > 10) return
			p.checkPointFruit = reuseHandler.reuseBrick()
			if (p.checkPointFruit == -1) return

			let startTime = new Date()
			let lastPosition = obj.startPosition
			p.checkpoint = 0
			p.timetrial = obj
			p.setPosition(obj.startPosition)
			p.message("Time trial started!")

			p.checkPointFruit.setScale(new Vector3(1, 1, 1))
			p.checkPointFruit.setOutline(true)
			p.checkPointFruit.setColor(`#e6e600`)
			if (obj.checkpoints[p.checkpoint]) {
				// Checkpoint fruit
				p.checkPointFruit.setPosition(obj.checkpoints[p.checkpoint])
			} else {
				p.checkPointFruit.setPosition(obj.endPosition)
			}
			soundbrick(
				{
					url: `/sounds/random/plink.flac`,
					isGlobal: true,
				},
				p
			)
			//p.message("Press SLASH to exit time trial")
			p.timetrialTimer = setInterval(() => {
				let timeColor = ""
				if (obj.checkpoints[p.checkpoint]) {
					timeColor = `[${lerpColor("#00FF00", "#FF0000", Game.pointDistance3D(p.position, p.checkPointFruit.position) / Game.pointDistance3D(lastPosition, p.checkPointFruit.position))}]`
					//p.message(`${Game.pointDistance3D(p.position, obj.checkpoints[p.checkpoint])}`)
				} else {
					timeColor = `[${lerpColor("#00FF00", "#FF0000", Game.pointDistance3D(p.position, p.checkPointFruit.position) / Game.pointDistance3D(lastPosition, p.checkPointFruit.position))}]`
					//p.message(`${Game.pointDistance3D(p.position, obj.endPosition)}`)
				}
				p.bottomPrint(timeColor + (-(startTime - new Date()) / 1000).toFixed(2))
				if (!p.alive || p.destroyed) {
					p.message("\\c6Time trial aborted because of death")
					p.timetrial = null
					p.keyPrompt = null
					reuseHandler.deleteBrick(p.checkPointFruit)
					clearInterval(p.timetrialTimer)
					return
				}
				if (Game.pointDistance3D(p.position, obj.startPosition) > obj.loseRadius) {
					p.message("\\c6Time trial aborted")
					p.timetrial = null
					p.keyPrompt = null
					reuseHandler.deleteBrick(p.checkPointFruit)
					clearInterval(p.timetrialTimer)
					return
				}
				if (obj.checkpoints[p.checkpoint]) {
					// Checkpoint fruit
					if (Game.pointDistance3D(p.position, obj.checkpoints[p.checkpoint]) < 10) {
						soundbrick({
							url: `/sounds/eat/${randomIntFromInterval(1, 4)}.flac`,
							isGlobal: false,
							position: p.position,
						})
						soundbrick(
							{
								url: `/sounds/random/minebeep.flac`,
								isGlobal: true,
							},
							p
						)
						const color = "#FFFF00"
						for (let index = 0; index < 5; index++) {
							setTimeout(() => {
								drippyPosition = new Vector3()
								drippyPosition.x = p.position.x + p.currentCreature.charmodel.mouth.x * Math.sin(p.rotation.z / debug)
								drippyPosition.y = p.position.y - +p.currentCreature.charmodel.mouth.x * Math.cos(p.rotation.z / debug)
								drippyPosition.z = p.position.z + p.currentCreature.charmodel.mouth.y - 0.8
								particleManager.emitParticle("drippy", {
									position: drippyPosition,
									color: color,
									directionalForce: 0,
									direction: 0,
									expire: 200,
								})
							}, 800 * index)
						}
						p.sprintTime += 2
						particleManager.emitParticle("slash", new Vector3(p.position.x + randomIntFromInterval(-3, 3), p.position.y + randomIntFromInterval(-3, 3), p.position.z + randomIntFromInterval(-3, 3)))
						p.checkpoint++
						lastPosition = p.checkPointFruit.position
						if (obj.checkpoints[p.checkpoint]) {
							p.checkPointFruit.forceSetPosition(obj.checkpoints[p.checkpoint])
						} else {
							p.checkPointFruit.forceSetPosition(obj.endPosition)
						}
						return
					}
				} else {
					// Goal
					if (Game.pointDistance3D(p.position, obj.endPosition) < 10) {
						let score = -(startTime - new Date()) / 1000
						soundbrick(
							{
								url: `/sounds/time-trial-goal.ogg`,
								isGlobal: true,
							},
							p
						)
						p.message("\\c6TIME TRIAL COMPLETE")
						p.message(`Seconds: ${score}`)
						Game.messageAll(`${p.username} completed \"${obj.name}\" in ${score} seconds`)
						if (constants.discordEnabled) bot.channels.get(channel).send(`${p.username} ${p.currentCreature.discordEmoji} completed \"${obj.name}\" in ${score} seconds`)
						p.timetrial = null
						reuseHandler.deleteBrick(p.checkPointFruit)
						p.keyPrompt = null
						clearInterval(p.timetrialTimer)
						return
					}
				}
			}, 60)
		}
	}
}
