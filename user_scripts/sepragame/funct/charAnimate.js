function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function initCharModel(p) {
	p.playerSize = 1
	p.charbot = new Bot("Zombie")
	p.charbot.changeSize = function (size) {
		p.charbot.setScale(new Vector3(size, size, size))
		p.playerSize = size
	}
	p.charbot.idletime = 0
	let movestate = 1
	let walking = false
	let lastposition = new Vector3(0, 0, 0)
	let walktimeout = 0
	let AnimationState = "none"

	let outfit = new Outfit().body("#0d9436").torso("#694813").rightLeg("#694813").leftLeg("#694813")
	p.charbot.setOutfit(outfit)

	Game.newBot(p.charbot)

	let webClientState = "idle"
	let standingstill = 0
	//console.log("why???", p.webNetId)
	if (!p.isBot || p.clientType === "Web") {
		var AnimationInterval = setInterval(async () => {
			AnimationHandler(false)
		}, 25)
	} else {
		var AnimationInterval = setInterval(async () => {
			AnimationHandler(false)
		}, 300)
	}

	let AnimationHandler = function (forced) {
		if (forced || standingstill < 10) {
			p.charbot.setRotation(new Vector3(0, 0, p.rotation.z + 450))
			if (p.animateReady) {
				if (AnimationState == "none") p.charbot.setPosition(new Vector3(p.position.x, p.position.y, p.position.z - p.currentCreature.charmodel.animNone * p.playerSize))
				if (AnimationState == "run1") p.charbot.setPosition(new Vector3(p.position.x, p.position.y, p.position.z - p.currentCreature.charmodel.animWalk1 * p.playerSize))
				if (AnimationState == "run2") p.charbot.setPosition(new Vector3(p.position.x, p.position.y, p.position.z - p.currentCreature.charmodel.animWalk2 * p.playerSize))
				if (AnimationState == "dead") p.charbot.setPosition(new Vector3(p.position.x, p.position.y, p.position.z - p.currentCreature.charmodel.animDead * p.playerSize))
				if (AnimationState == "idle") p.charbot.setPosition(new Vector3(p.position.x, p.position.y, p.position.z - p.currentCreature.charmodel.animIdle * p.playerSize))

				switch (AnimationState) {
					case "none":
						if (webClientState !== "idle") {
							webClientState = "idle"
						}
						break
					case "run1":
						if (webClientState !== "run") {
							webClientState = "run"
						}
						break
					case "run2":
						if (webClientState !== "run") {
							webClientState = "run"
						}
						break
					case "idle":
						if (webClientState !== "sit") {
							webClientState = "sit"
							webClient.socketio.emit("pstate", { netId: p.webNetId, state: "sit" })
						}
						break
					case "dead":
						if (webClientState !== "dead") {
							webClientState = "dead"
							webClient.socketio.emit("pstate", { netId: p.webNetId, state: "dead" })
						}
						break

					default:
						break
				}
			}
		} else if (standingstill > 15) {
			standingstill = 9
		}
		// This is broken for some reason that I am unable to figure out
		// Destroy the charbot after player has been destroyed instead of this code below not working
		// insert confusion here

		// comments above preserved and dont mean anything
		if (p.destroyed == true) {
			p.charbot.destroy()
			if (world.bots.indexOf(p.charbot) != -1) {
				console.log("Precaution: Spliced")
				world.bots.splice(world.bots.indexOf(p.charbot, 1))
			} else {
				//console.log("Precaution: Not spliced")
			}
			clearInterval(AnimationInterval)
		}
	}

	p.on("moved", () => {
		AnimationHandler(true)
	})

	var prevAnimStateSimple = "none"
	var Animations = setInterval(async () => {
		if (p.alive == true) {
			if (walking == true) {
				if (movestate == 2 || movestate == 4) {
					p.charbot.idletime = 0
					if (movestate == 2) {
						AnimationState = "run1"
						if (prevAnimStateSimple !== "run") webClient.socketio.emit("pstate", { netId: p.webNetId, state: "run" })
						prevAnimStateSimple = "run"
						if (p.onGround === true) {
							soundbrick({
								url: stepSoundSets.getStepURL(p.currentCreature.stepSound, await getBlockType(new Vector3(p.position.x, p.position.y, p.position.z - 2)), 1),
								isGlobal: false,
								position: p.position,
							})
						}
					}

					if (movestate == 4) {
						if (prevAnimStateSimple !== "run") webClient.socketio.emit("pstate", { netId: p.webNetId, state: "run" })
						prevAnimStateSimple = "run"
						if (p.onGround === true) {
							soundbrick({
								url: stepSoundSets.getStepURL(p.currentCreature.stepSound, await getBlockType(new Vector3(p.position.x, p.position.y, p.position.z - 2)), 3),
								isGlobal: false,
								position: p.position,
							})
						}

						AnimationState = "run2"
						movestate = 1
					} else {
						movestate++
					}
				} else {
					if (p.onGround === true) {
						soundbrick({
							url: stepSoundSets.getStepURL(p.currentCreature.stepSound, await getBlockType(new Vector3(p.position.x, p.position.y, p.position.z - 2)), 2),
							isGlobal: false,
							position: p.position,
						})
					}
					AnimationState = "none"
					movestate++
				}
			} else {
				if (prevAnimStateSimple !== "idle") webClient.socketio.emit("pstate", { netId: p.webNetId, state: "idle" })
				prevAnimStateSimple = "idle"

				AnimationState = "none"
				p.charbot.idletime++
			}

			if (p.charbot.idletime > 150) {
				AnimationState = "idle"
				if (p.charbot.idletime == 151 && p.currentCreature.class === "creature")
					soundbrick({
						url: `/sounds/pain/alienlike/murr${randomIntFromInterval(1, 4)}.flac`,
						minDistance: 70,
						maxDistance: 10,
						position: p.position,
						isGlobal: false,
					})
			}
		} else {
			AnimationState = "dead"
		}

		if (p.stunned == true) {
			AnimationState = "dead"
		}

		if (p.destroyed == true) clearInterval(Animations)
	}, 200)

	p.setInterval(() => {
		if (walktimeout !== 0) {
			walking = true
			standingstill = 0
		} else {
			walking = false
			standingstill++
		}

		if (lastposition.x !== p.position.x || lastposition.y !== p.position.y) {
			if (walktimeout !== 2) walktimeout++
		} else {
			if (walktimeout !== 0) walktimeout--
		}

		lastposition.x = p.position.x
		lastposition.y = p.position.y
	}, 100)
}

module.exports = initCharModel
