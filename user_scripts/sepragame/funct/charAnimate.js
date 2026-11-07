function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function initCharModel(p) {
	p.playerSize = 1
	p.idleTime = 0
	let movestate = 1
	let walking = false
	let lastposition = new Vector3(0, 0, 0)
	let walktimeout = 0
	let AnimationState = "none"


	let webClientState = "idle"
	let standingstill = 0
	//console.log("why???", p.webNetId)
	if (!p.isBot) {
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
			if (p.animateReady) {

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
		if (p.destroyed == true) {
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
					p.idleTime = 0
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
				p.idleTime++
			}

			if (p.idleTime > 150) {
				AnimationState = "idle"
				if (p.idleTime == 151 && p.currentCreature.class === "creature")
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
