module.exports = function (p) {
	if (p.clientType == undefined) {
		// If isn't undefined then that means the player connected from a source that isn't Brick Hill
		p.clientType = "Brick Hill"
		webClient.nextNetId.id++
		p.webNetId = `${webClient.nextNetId.id}`
		Game.players.forEach((player) => {
			if (player.clientType === "Web") {
				player.message(`\\c6[SERVER]: \\c0${p.username} has joined the server!`)
			}
		})
		p.setSpeedN = p.setSpeed
		p.setSpeed = function (params) {
			return p.setSpeedN(params * 1.5)
		}
		if (p.userId == 782) p.builderPermission = true
	} else if (p.clientType === "Web") {
		p.readInstructions = true
		Game.messageAll(`\\c6[SERVER]: \\c0${p.username} has joined the server!`)

		setTimeout(() => {
			// Tutorial
			if (p.clientType === "Web") {
				// Web client instructions
				if (p.mobile === false) {
					// Desktop
					p.message("For settings press M")
					p.message("== Selector Controls ==")
					p.message("Press A and D to switch creature selector")
					p.message("Press spacebar to confirm selection")
					p.message("==============")
				} else {
					// Mobile
					p.message("For settings use the /settings command on chat")
					p.message("== Selector Controls ==")
					p.message("Flick the joystick left or right to switch creature selector")
					p.message('Press the "A" button to confirm selection')
					p.message("==============")
				}
			} else {
				p.message("\\c1Welcome to sepragame WIP!")
				p.message("\\c1Join our Discord server! https://discord.gg/zUjpDMw")
				p.message("\\c1For settings use the /settings command on chat")
				p.message("\\c1== Selector Controls ==")
				p.message("\\c1Press A and D to switch creature selector")
				p.message("\\c1Press spacebar to confirm selection")
			}
		}, 100)
	}

	p.selectorData = selectorData
	playerFunctions(p)
	webClient.characters[p.webNetId] = {
		netId: `${p.webNetId}`,
		name: p.username,
		position: { x: p.position.x, y: p.position.y, z: p.position.z, r: 0 },
		morph: `none`,
		modelRotationOffset: 0,
		logicRotationOffset: 0,
		networkRotationOffset: 0,
	}
	webClient.socketio.emit("createplayer", {
		// Create player
		netId: `${p.webNetId}`,
		model: defaultCreature,
		name: p.username,
		modelRotationOffset: 0,
		networkRotationOffset: 0,
		logicRotationOffset: 0,
	})

	let rpcCooldown

	p.setRPC = (str) => {
		clearInterval(rpcCooldown)
		rpcCooldown = setTimeout(() => {
			new PacketBuilder("Authentication").write("uint32", p.netId).write("uint32", 0).write("uint32", p.userId).write("string", p.username).write("bool", p.admin).write("uint8", p.membershipType).write("uint32", 12).write("string", str).send(p.socket)
		}, 15000)
	}

	if (p.builderPermission == undefined) p.builderPermission = false

	// Brick Hill
	p.loadAvatar = false
	p.loadTool = false

	// Sprinting
	p.sprintTime = 0
	p.sprinting = false
	p.sprintCoolDown = 0
	p.stamina = 300

	// Attack cooldowns
	p.atk1Cooldown = 0
	p.atk2Cooldown = 0
	p.atk3Cooldown = 0
	p.atk4Cooldown = 0
	p.atk5Cooldown = 0
	p.bitecooldown = 0
	p.selectedattack = 1

	p.ui1 = 1
	p.ui2 = 2
	p.ui3 = 3
	p.ui4 = 4
	p.ui5 = 5

	p.settings = {
		// TODO
	}

	// Prompt objects
	p.keyPrompt = null

	// vars for attacks
	p.attackcos = false // OFF ON for attack scripts ie crimsonblaster
	p.blastJumpActive = false
	//energy related
	p.energy = 100
	p.stunned = false
	p.energyRegen = true
	p.canMark = true
	p.juice = 0
	// Damage debuffs (1000ms per "tick")
	p.debuffDamageLeft = 0
	p.debuffDamageAmount = 0
	p.debuffAttacker = "none"
	p.debuffParticles = "none" // Any regisitered particle
	p.debuffAttackRef = "none"
	p.lastSkyColor = "#000000"
	p.skyColor = "#000000"

	// Music
	p.musicBiome = -1
	p.musicBiomeTimer = -1

	// Holding items in mouth i.e fruit
	p.holdingObject = null

	//Ground check
	p.onGround = false

	// Web tutorial
	p.readInstructions = false
	p.tutorialStep = 0

	p.isBot = false

	p.inSelector = true
	p.currentindex = 0

	charAnimate(p)
	p.charbot.changeSize(1)

	p.switchCreature(defaultCreature)

	p.animateReady = true

	p.currentAttackName = p.currentCreature.attacks.atk1.attackDescription.name
}

function playerFunctions(p) {
	p.changeEnergy = function (amt) {
		p.energy += amt
		if (p.energy > 100) p.energy = 100
		if (p.energy < 0) p.energy = 0
		if (p.clientType === "Web") p.socketio.emit("gui", [{ type: "energy", value: p.energy }])
	}
	p.changeStamina = function (amt) {
		p.stamina += amt
		if (p.stamina > 300) p.stamina = 300
		if (p.stamina < 0) p.stamina = 0
		if (p.clientType === "Web") p.socketio.emit("gui", [{ type: "stamina", value: p.stamina }])
	}
	p.switchCreature = (creatureId) => {
		var verify = creatureData.find((x) => x.saveID == creatureId)
		if (verify == undefined || verify == -1) return
		if (verify.class === "builder") {
			if (p.builderPermission == false) {
				p.message("\\c6You don't have permission to play as Builder!")
				creatureId = "weakling1"
			}
		}
		verify = creatureData.find((x) => x.saveID == creatureId)
		if (verify == undefined || verify == -1) return
		p.selectedattack = 1
		if (p.clientType === "Web") p.guiSelectSlot(1)
		p.currentCreature = verify
		p.setJumpPower(p.currentCreature.jump)
		p.setSpeed(p.currentCreature.speed)
		p.setScale(new Vector3(0, 0, p.currentCreature.charmodel.cameraHeight))
		p.maxHealth = p.currentCreature.hp
		p.setHealth(p.currentCreature.hp)
		p.atk1Cooldown = 0
		p.atk2Cooldown = 0
		p.atk3Cooldown = 0
		p.atk4Cooldown = 0
		p.atk5Cooldown = 0
		p.sprintTime = 0
		let outfit = new Outfit().hat1(p.currentCreature.charmodel.hat1).hat2(p.currentCreature.charmodel.hat2).hat3(p.currentCreature.charmodel.hat3)
		p.charbot.setOutfit(outfit)
		webClient.socketio.emit("pmodel", {
			netId: p.webNetId,
			model: creatureId,
			modelRotationOffset: p.currentCreature.webModelRotationOffset,
			logicRotationOffset: p.currentCreature.webLogicRotationOffset,
			networkRotationOffset: p.currentCreature.webNetworkRotationOffset,
		})
		webClient.characters[p.webNetId].morph = creatureId
		webClient.characters[p.webNetId].modelRotationOffset = p.currentCreature.webModelRotationOffset
		webClient.characters[p.webNetId].logicRotationOffset = p.currentCreature.webLogicRotationOffset
		webClient.characters[p.webNetId].networkRotationOffset = p.currentCreature.webNetworkRotationOffset

		if (p.tutorialStep === 0 && creatureId !== "none") {
			// Is player at first stage of the tutorial?
			if (p.clientType === "Web") {
				if (p.mobile === false) {
					p.message("== Player controls ==")
					p.message("WASD to move!")
					p.message("Spacebar to jump!")
					p.message("Press the number keys to switch attacks")
					p.message("Press E to bite (Weak melee attack + eat dead bots for HP)")
					p.message("Press Shift to sprint (Each press uses up stamina)")
					p.message("Press C to sit down")
					p.message("Press T to talk")
					p.message("==============")
				} else {
					p.message("== Player controls ==")
					p.message("Joystick to move!")
					p.message('"A" to jump!')
					p.message('"B" to use selected attacks')
					p.message("Switch attacks by clicking on the slots")
					p.message("==============")
				}
			} else {
				p.message("\\c1== Player controls ==")
				p.message("\\c1Press the number keys to switch attacks")
				p.message("\\c1Press E to bite (Weak melee attack + eat dead bots for HP)")
				p.message("\\c1Press Shift to sprint (Each press uses up stamina)")
			}
			p.tutorialStep = 1
		}
		if (p.clientType === "Web" && creatureId !== "none") {
			let guiSlot = []

			if (p.currentCreature.attacks.atk1 !== undefined) {
				guiSlot.push({ number: 1, type: "slot", inner: "name", value: p.currentCreature.attacks.atk1.attackDescription.name })
			} else guiSlot.push({ number: 1, type: "slot", inner: "name", value: "" })
			if (p.currentCreature.attacks.atk2 !== undefined) {
				guiSlot.push({ number: 2, type: "slot", inner: "name", value: p.currentCreature.attacks.atk2.attackDescription.name })
			} else guiSlot.push({ number: 2, type: "slot", inner: "name", value: "" })
			if (p.currentCreature.attacks.atk3 !== undefined) {
				guiSlot.push({ number: 3, type: "slot", inner: "name", value: p.currentCreature.attacks.atk3.attackDescription.name })
			} else guiSlot.push({ number: 3, type: "slot", inner: "name", value: "" })
			if (p.currentCreature.attacks.atk4 !== undefined) {
				guiSlot.push({ number: 4, type: "slot", inner: "name", value: p.currentCreature.attacks.atk4.attackDescription.name })
			} else guiSlot.push({ number: 4, type: "slot", inner: "name", value: "" })
			if (p.currentCreature.attacks.atk5 !== undefined) {
				guiSlot.push({ number: 5, type: "slot", inner: "name", value: p.currentCreature.attacks.atk5.attackDescription.name })
			} else guiSlot.push({ number: 5, type: "slot", inner: "name", value: "" })

			p.socketio.emit("gui", guiSlot)
		}

		if (creatureId !== "none") {
			if (p.currentCreature.class === "builder") {
				soundbrick(
					{
						url: `/sounds/creatorTEMP.mp3`,
						isGlobal: true,
					},
					p
				)
			} else {
				soundbrick(
					{
						url: `/sounds/random/play.mp3`,
						isGlobal: true,
					},
					p
				)
			}
		}

		if (p.clientType === "Brick Hill") {
			if (creatureId !== "none") {
				p.setRPC(`sepragame: ${p.currentCreature.creatureName}`)
			} else {
				p.setRPC(`sepragame`)
			}
		}
	}
	p.updateSelector = function () {
		// really needs cleaning and use of %
		var a = ""
		var b = ""
		var c = ""

		if (p.currentindex > p.selectorData.length - 1) {
			p.currentindex = 0
		}

		if (p.currentindex == -1) {
			p.currentindex = p.selectorData.length - 1
		}

		b = p.selectorData[p.currentindex]
		if (p.clientType == "Brick Hill") {
			p.SELbrick2.setModel(p.selectorData[p.currentindex].charmodel.hat1)
			p.SELbrick2.setPosition(new Vector3(p.SELbrick2.position.x, p.SELbrick2.position.y, -p.selectorData[p.currentindex].charmodel.animNone - 16))
		}
		if (p.clientType == "Web") p.socketio.emit("charmodel", { slot: 2, meta: { model: p.selectorData[p.currentindex].saveID, modelRotationOffset: p.selectorData[p.currentindex].webModelRotationOffset } })

		if (p.currentindex + 1 > p.selectorData.length - 1) {
			if (p.clientType == "Brick Hill") {
				p.SELbrick3.setModel(p.selectorData[0].charmodel.hat1)
				p.SELbrick3.setPosition(new Vector3(p.SELbrick3.position.x, p.SELbrick3.position.y, -p.selectorData[0].charmodel.animNone - 16))
			}
			if (p.clientType == "Web") p.socketio.emit("charmodel", { slot: 3, meta: { model: p.selectorData[0].saveID, modelRotationOffset: p.selectorData[0].webModelRotationOffset } })

			c = p.selectorData[0].creatureName
		} else {
			if (p.clientType == "Brick Hill") {
				p.SELbrick3.setModel(p.selectorData[p.currentindex + 1].charmodel.hat1)
				p.SELbrick3.setPosition(new Vector3(p.SELbrick3.position.x, p.SELbrick3.position.y, -p.selectorData[p.currentindex + 1].charmodel.animNone - 16))
			}
			if (p.clientType == "Web") p.socketio.emit("charmodel", { slot: 3, meta: { model: p.selectorData[p.currentindex + 1].saveID, modelRotationOffset: p.selectorData[p.currentindex + 1].webModelRotationOffset } })

			c = p.selectorData[p.currentindex + 1].creatureName
		}

		if (p.currentindex - 1 == -1) {
			if (p.clientType == "Brick Hill") {
				p.SELbrick1.setModel(p.selectorData[p.selectorData.length - 1].charmodel.hat1)
				p.SELbrick1.setPosition(new Vector3(p.SELbrick1.position.x, p.SELbrick1.position.y, -p.selectorData[p.selectorData.length - 1].charmodel.animNone - 16))
			}
			if (p.clientType == "Web") p.socketio.emit("charmodel", { slot: 1, meta: { model: p.selectorData[p.selectorData.length - 1].saveID, modelRotationOffset: p.selectorData[p.selectorData.length - 1].webModelRotationOffset } })
			a = p.selectorData[p.selectorData.length - 1].creatureName
		} else {
			if (p.clientType == "Brick Hill") {
				p.SELbrick1.setModel(p.selectorData[p.currentindex - 1].charmodel.hat1)
				p.SELbrick1.setPosition(new Vector3(p.SELbrick1.position.x, p.SELbrick1.position.y, -p.selectorData[p.currentindex - 1].charmodel.animNone - 16))
			}
			if (p.clientType == "Web") p.socketio.emit("charmodel", { slot: 1, meta: { model: p.selectorData[p.currentindex - 1].saveID, modelRotationOffset: p.selectorData[p.currentindex - 1].webModelRotationOffset } })
			a = p.selectorData[p.currentindex - 1].creatureName
		}
		if (b.trigger) {
			p.bottomPrint(`. . ${a} . \\c5> ${b.creatureName} < \\c0. ${c} . .`, 60)
		} else {
			p.bottomPrint(`. . ${a} . \\c5> ${b.creatureName} HP: ${b.hp} < \\c0. ${c} . .`, 60)
		}

		soundbrick(
			{
				url: `/sounds/random/selecttick.mp3`,
				isGlobal: true,
			},
			p
		)
	}
}
