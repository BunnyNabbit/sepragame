function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function characterAnimate(p) {
	p.playerSize = 1
	p.idleTime = 0
	let moveState = 1
	let walking = false
	let lastPosition = new Vector3(0, 0, 0)
	let walkTimeout = 0
	let animationState = "none"


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

				switch (animationState) {
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
				if (moveState == 2 || moveState == 4) {
					p.idleTime = 0
					if (moveState == 2) {
						animationState = "run1"
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

					if (moveState == 4) {
						if (prevAnimStateSimple !== "run") webClient.socketio.emit("pstate", { netId: p.webNetId, state: "run" })
						prevAnimStateSimple = "run"
						if (p.onGround === true) {
							soundbrick({
								url: stepSoundSets.getStepURL(p.currentCreature.stepSound, await getBlockType(new Vector3(p.position.x, p.position.y, p.position.z - 2)), 3),
								isGlobal: false,
								position: p.position,
							})
						}

						animationState = "run2"
						moveState = 1
					} else {
						moveState++
					}
				} else {
					if (p.onGround === true) {
						soundbrick({
							url: stepSoundSets.getStepURL(p.currentCreature.stepSound, await getBlockType(new Vector3(p.position.x, p.position.y, p.position.z - 2)), 2),
							isGlobal: false,
							position: p.position,
						})
					}
					animationState = "none"
					moveState++
				}
			} else {
				if (prevAnimStateSimple !== "idle") webClient.socketio.emit("pstate", { netId: p.webNetId, state: "idle" })
				prevAnimStateSimple = "idle"

				animationState = "none"
				p.idleTime++
			}

			if (p.idleTime > 150) {
				animationState = "idle"
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
			animationState = "dead"
		}

		if (p.stunned == true) {
			animationState = "dead"
		}

		if (p.destroyed == true) clearInterval(Animations)
	}, 200)

	p.setInterval(() => {
		if (walkTimeout !== 0) {
			walking = true
			standingstill = 0
		} else {
			walking = false
			standingstill++
		}

		if (lastPosition.x !== p.position.x || lastPosition.y !== p.position.y) {
			if (walkTimeout !== 2) walkTimeout++
		} else {
			if (walkTimeout !== 0) walkTimeout--
		}

		lastPosition.x = p.position.x
		lastPosition.y = p.position.y
	}, 100)
}

module.exports = characterAnimate
