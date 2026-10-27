const initVars = require("./initPlayer.js")
const filter = require("../chat/index.js")
const constants = require("../constants.js")

Game.on("playerJoin", async (p) => {
	initVars(p)

	if (constants.discordEnabled) bot.channels.get(channel).send(`${p.username} joined ${gameName}`)

	p.socketio.emit("changecamera", "selector")

	p.updateSelector()

	p.atk1OldCooldownState = false
	p.atk2OldCooldownState = false
	p.atk3OldCooldownState = false
	p.atk4OldCooldownState = false
	p.atk5OldCooldownState = false

	p.on("initialSpawn", () => {
		p.setScale(new Vector3(0, 0, p.currentCreature.charmodel.cameraHeight))
	})

	p.on("mouseclick", () => {
		if (!p.alive) return
		if (p.godMode === true) {
			p.atk1Cooldown = -5
			p.atk2Cooldown = -5
			p.atk3Cooldown = -5
			p.atk4Cooldown = -5
			p.atk5Cooldown = -5
			p.energy = 100
		}

		if (p.currentCreature.class === "builder") p.updateBlockCursors()

		if (p.selectedattack == 1 && p.atk1Cooldown < 0 && typeof p.currentCreature.attacks.atk1 !== "undefined") {
			p.currentCreature.attacks.atk1.use(p)
		}

		if (p.selectedattack == 2 && p.atk2Cooldown < 0 && typeof p.currentCreature.attacks.atk2 !== "undefined") {
			p.currentCreature.attacks.atk2.use(p)
		}

		if (p.selectedattack == 3 && p.atk3Cooldown < 0 && typeof p.currentCreature.attacks.atk3 !== "undefined") {
			p.currentCreature.attacks.atk3.use(p)
		}

		if (p.selectedattack == 4 && p.atk4Cooldown < 0 && typeof p.currentCreature.attacks.atk4 !== "undefined") {
			p.currentCreature.attacks.atk4.use(p)
		}

		if (p.selectedattack == 5 && p.atk5Cooldown < 0 && typeof p.currentCreature.attacks.atk5 !== "undefined") {
			p.currentCreature.attacks.atk5.use(p)
		}
	})

	p.on("respawn", () => {
		p.debuffDamageLeft = 0
		p.debuffDamageAmount = 0
		p.debuffAttacker = "none"
		p.debuffParticles = "none" // Any regisitered particle
		p.debuffAttackRef = "none"
		p.setEnvironment({ ambient: "#000000" })

		p.socketio.emit("changecamera", "selector")
		p.updateSelector()
		p.socketio.emit("hover", false)
		p.switchCreature(defaultCreature)
		p.inSelector = true
	})

	p.on("moved", () => {
		if (p.holdingObject) {
			p.holdingObject.position.x = p.position.x + p.currentCreature.charmodel.mouth.x * Math.sin(p.rotation.z / debug)
			p.holdingObject.position.y = p.position.y - +p.currentCreature.charmodel.mouth.x * Math.cos(p.rotation.z / debug)
			p.holdingObject.position.z = p.position.z + p.currentCreature.charmodel.mouth.y

			p.holdingObject.position.x += -0.5
			p.holdingObject.position.y += -0.5
			p.holdingObject.setPosition(p.holdingObject.position)
		}
	})

	p.on("died", async () => {
		if (p.holdingObject) p.holdingObject.drop(p) // Drop any item
		p.setEnvironment({ ambient: "#0000ff" })
		var deathpos = new Vector3(p.position.x, p.position.y, p.position.z)
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
		await sleep(3500)
		particleManager.emitParticle("ghost", deathpos)
		particleManager.emitParticle("ghost", deathpos)
		particleManager.emitParticle("ghost", deathpos)
		particleManager.emitParticle("ghost", deathpos)
		particleManager.emitParticle("ghost", deathpos)
		soundbrick({
			url: `/sounds/eat/bodyexplode.flac`,
			isGlobal: false,
			position: deathpos,
		})
	})

	p.keypress((key) => {
		// TODO: Switch case
		if (key == "x") {
			// Marking
			if (p.alive === false) return
			if (p.canMark) {
				let obj = world.fruit.find((fruit) => Game.pointDistance3D(fruit.position, p.position) < 10 && !fruit.heldBy && !fruit.persistent)
				if (obj) return markPersistent(obj)
				obj = botManager.ingameBots.find((bot) => Game.pointDistance3D(bot.position, p.position) < 10 && !bot.persistent)
				if (obj) return markPersistent(obj)
			}
			function markPersistent(obj) {
				obj.persistent = true
				for (let index = 0; index < 11; index++) {
					setTimeout(
						() => {
							particleManager.emitParticle("drippy", {
								position: p.position,
								color: "#a64dff",
								directionalForce: randomIntFromInterval(1, 7) / 5,
								direction: randomIntFromInterval(-35, 35) + p.rotation.z,
								expire: 500,
							})
						},
						randomIntFromInterval(1, 300)
					)
				}
				p.canMark = false
				setTimeout(() => {
					p.canMark = true
				}, 100)
			}
		}

		if (key == "a") {
			// Selector left
			if (p.inSelector == true) {
				p.currentindex--
				p.updateSelector()
			}
		}

		if (key == "d") {
			// Selector right
			if (p.inSelector == true) {
				p.currentindex++
				p.updateSelector()
			}
		}

		if (key == "space") {
			if (p.inSelector == true) {
				if (p.selectorData[p.currentindex].trigger) {
					soundbrick(
						{
							url: `7cFaAjBrC8sW3L3ijcpkgZqEsqYFY2JQzjZepXLe41QSjfJw8UoWjvuqT6WBPUhVubSkFYRK8iFpQBMzTRxjJfTnwpp2cpcyxV47VtzbWdE23MW2cQTZN9yGj`,
							sfxr: true,
							isGlobal: true,
						},
						p
					)
					p.selectorData[p.currentindex].trigger(p)
				} else {
					// It's a creature
					p.inSelector = false
					p.switchCreature(p.selectorData[p.currentindex].saveID)
					p.setPosition(new Vector3(randomIntFromInterval(-500, 500), randomIntFromInterval(-500, 500), 500))
					p.bottomPrint("", 1)
					p.socketio.emit("changecamera", "player")
				}
			} else {
				switch (p.currentCreature.saveID) {
					case "builder":
						p.switchCreature("builderm2")
						p.centerPrint("Mode 2 / 3", 3)
						break
					case "builderm2":
						p.switchCreature("builderm3")
						p.centerPrint("Mode 3 / 3", 3)
						break
					case "builderm3":
						p.switchCreature("builder")
						p.centerPrint("Mode 1 / 3", 3)
						break

					default:
						break
				}
			}
		}

		if (key === "space") {
			if (p.blastJumpActive == true) {
				p.blastJumpActive = false
			}
		}
		if (key === "shift") {
			// Sprinting
			if (p.currentCreature.class === "none") return
			if (p.stamina < 45) return
			if (p.currentCreature.class === "builder") {
				p.sprintTime = 2
			} else {
				p.stamina -= 45
				p.sprintTime += 2
				p.sprintCoolDown += 3
				p.socketio.emit("gui", [{ type: "stamina", value: p.stamina }])
			}
		}
		if (key == "1") {
			if (typeof p.currentCreature.attacks.atk1 === "undefined") return
			p.selectedattack = 1
			p.centerPrint(p.currentCreature.attacks.atk1.attackDescription.description, 3)
			p.currentAttackName = p.currentCreature.attacks.atk1.attackDescription.name
			p.guiSelectSlot(1)
			if (p.currentCreature.class === "builder") {
				p.socketio.emit("blockmode", p.currentCreature.attacks.atk1.blockmode) // Block placement type ["in","out"]
			}
		}
		if (key == "2") {
			if (typeof p.currentCreature.attacks.atk2 === "undefined") return
			p.selectedattack = 2
			p.centerPrint(p.currentCreature.attacks.atk2.attackDescription.description, 3)
			p.currentAttackName = p.currentCreature.attacks.atk2.attackDescription.name
			p.guiSelectSlot(2)
			if (p.currentCreature.class === "builder") {
				p.socketio.emit("blockmode", p.currentCreature.attacks.atk2.blockmode) // Block placement type ["in","out"]
			}
		}
		if (key == "3") {
			if (typeof p.currentCreature.attacks.atk3 === "undefined") return
			p.selectedattack = 3
			p.centerPrint(p.currentCreature.attacks.atk3.attackDescription.description, 3)
			p.currentAttackName = p.currentCreature.attacks.atk3.attackDescription.name
			p.guiSelectSlot(3)
			if (p.currentCreature.class === "builder") {
				p.socketio.emit("blockmode", p.currentCreature.attacks.atk3.blockmode) // Block placement type ["in","out"]
			}
		}
		if (key == "4") {
			if (typeof p.currentCreature.attacks.atk4 === "undefined") return
			p.selectedattack = 4
			p.centerPrint(p.currentCreature.attacks.atk4.attackDescription.description, 3)
			p.currentAttackName = p.currentCreature.attacks.atk4.attackDescription.name
			p.guiSelectSlot(4)
			if (p.currentCreature.class === "builder") {
				p.socketio.emit("blockmode", p.currentCreature.attacks.atk4.blockmode) // Block placement type ["in","out"]
			}
		}
		if (key == "5") {
			if (typeof p.currentCreature.attacks.atk5 === "undefined") return
			p.selectedattack = 5
			p.centerPrint(p.currentCreature.attacks.atk5.attackDescription.description, 3)
			p.currentAttackName = p.currentCreature.attacks.atk5.attackDescription.name
			p.guiSelectSlot(5)
			if (p.currentCreature.class === "builder") {
				p.socketio.emit("blockmode", p.currentCreature.attacks.atk5.blockmode) // Block placement type ["in","out"]
			}
		}
		if (key === "e") {
			// (SLASH) Eat food or enable hovering and "bump" position
			if (p.inSelector === true) return
			if (p.currentCreature.class === "builder") {
				p.setHover(true)
				p.setPosition(new Vector3(p.position.x, p.position.y, p.position.z + 4))
			}
			if (p.bitecooldown > 0 || p.alive === false || p.currentCreature.class === "builder") return
			if (p.keyPrompt) return p.keyPrompt()
			p.bitecooldown = 7
			let biteobject = testforHit(p, p, 10)

			if (biteobject !== -1) {
				particleManager.emitParticle("slash", new Vector3(biteobject.position.x + randomIntFromInterval(-3, 3), biteobject.position.y + randomIntFromInterval(-3, 3), biteobject.position.z + 4 + randomIntFromInterval(-3, 1)))
				if (biteobject.isBot == true) {
					if (biteobject.alive == true) {
						soundbrick({
							url: `/sounds/projectile-hit.mp3`,
							position: biteobject.position,
							isGlobal: true,
							minDistance: 30,
							maxDistance: 3,
						})
						damageHandler(biteobject, p, p.currentCreature.attacks.bite, -3)
					} else {
						if (biteobject.currentCreature.canBeEatten) {
							botManager.botController.bite(biteobject, p)
						}
					}
				} else {
					if (biteobject.alive == true) {
						soundbrick({
							url: `/sounds/projectile-hit.mp3`,
							position: biteobject.position,
							isGlobal: true,
							minDistance: 30,
							maxDistance: 3,
						})
						damageHandler(biteobject, p, p.currentCreature.attacks.bite, -3)
					}
				}
			} else {
				if (p.holdingObject) {
					return p.holdingObject.eat(p) // If the creature has a item on it's mouth then eat it
				} else {
					// Grab fruit
					let obj = world.fruit.find((fruit) => Game.pointDistance3D(fruit.position, p.position) < 10 && !fruit.heldBy)
					if (obj) obj.hold(p)
				}
				particleManager.emitParticle("slash", p.position)
			}
		}

		if (key === "q") {
			// Drop food or disable hovering
			if (p.currentCreature.class === "builder") {
				p.setHover(false)
			}
			if (p.holdingObject) p.holdingObject.drop(p) // Drop any item
		}

		if (key === "c") {
			// Toggle sitting / force idle
			if (p.charbot.idletime > 150) {
				p.charbot.idletime = 0
			} else {
				p.charbot.idletime = 150
			}
		}
	})

	p.setInterval(async () => {
		// Main logic interval (100ms)

		p.atk1Cooldown--
		p.atk2Cooldown--
		p.atk3Cooldown--
		p.atk4Cooldown--
		p.atk5Cooldown--

		switch (p.musicBiome) {
			case 195: // Snow
				p.skyColor = lerpColor(p.skyColor, "#00e6e6", 0.025)
				break
			case 16: // Void
				p.skyColor = lerpColor(p.skyColor, "#000000", 0.025)
				break
			case 2: // Grass Lands
				p.skyColor = lerpColor(p.skyColor, "#66ccff", 0.025)
				break
			case 3: // Desert
				p.skyColor = lerpColor(p.skyColor, "#FFDB8E", 0.025)
				break
			case 55: // Weak Lands
				p.skyColor = lerpColor(p.skyColor, "#cc66ff", 0.025)
				break
			case 1: // Crimson
				p.skyColor = lerpColor(p.skyColor, "#b30000", 0.025)
				break
			case 238: // Stones
				p.skyColor = lerpColor(p.skyColor, "#800000", 0.025)
				break
			case 44: // Mushrooms
				p.skyColor = lerpColor(p.skyColor, "#66ffe0", 0.025)
				break
			case -3: // Caves
				p.skyColor = lerpColor(p.skyColor, "#000000", 0.025)
				break
		}
		if (p.lastSkyColor !== p.skyColor) p.setEnvironment({ skyColor: p.skyColor })
		p.lastSkyColor = p.skyColor

		if (world.portals.some((portal) => Game.pointDistance3D(portal.position, p.position) < portal.size)) {
			// Portals
			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)

			p.setPosition(world.portals.find((portal) => Game.pointDistance3D(portal.position, p.position) < portal.size).teleportPosition)

			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)
			particleManager.emitParticle("ghost", p.position)

			p.lastVaildPosition = new Vector3(p.position.x, p.position.y, p.position.z)
			soundbrick(
				{
					url: `/sounds/port.ogg`,
					isGlobal: true,
				},
				p
			)
		}

		p.ui1 = 1
		p.ui2 = 2
		p.ui3 = 3
		p.ui4 = 4
		p.ui5 = 5

		p[`ui${p.selectedattack}`] = `\\c5${p.selectedattack}\\c0` // Hilight selected attack

		if (p.atk1Cooldown > 0) p.ui1 = "\\c61\\c0"
		if (p.atk2Cooldown > 0) p.ui2 = "\\c62\\c0"
		if (p.atk3Cooldown > 0) p.ui3 = "\\c63\\c0"
		if (p.atk4Cooldown > 0) p.ui4 = "\\c64\\c0"
		if (p.atk5Cooldown > 0) p.ui5 = "\\c65\\c0"

		var guiChanges = [] // Optimize sending gui changes like energy and stamina

		if (p.energy < 100 && p.energyRegen == true) {
			p.energy++
			guiChanges.push({ type: "energy", value: p.energy })
		}

		if (p.stamina < 300 && p.sprintCoolDown == 0) {
			p.stamina++
			guiChanges.push({ type: "stamina", value: p.stamina })
		}

		if (p.atk1OldCooldownState !== p.atk1Cooldown > 0) {
			if (p.atk1OldCooldownState === true) {
				// New state is false
				if (p.selectedattack === 1) {
					guiChanges.push({ type: "slot", number: 1, inner: "selection", value: "selected" })
				} else {
					guiChanges.push({ type: "slot", number: 1, inner: "selection", value: "unselected" })
				}
			} else {
				// New state is true
				guiChanges.push({ number: 1, type: "slot", inner: "selection", value: "cooldown" })
			}
			p.atk1OldCooldownState = p.atk1Cooldown > 0
		}
		if (p.atk2OldCooldownState !== p.atk2Cooldown > 0) {
			if (p.atk2OldCooldownState === true) {
				// New state is false
				if (p.selectedattack === 2) {
					guiChanges.push({ type: "slot", number: 2, inner: "selection", value: "selected" })
				} else {
					guiChanges.push({ type: "slot", number: 2, inner: "selection", value: "unselected" })
				}
			} else {
				// New state is true
				guiChanges.push({ number: 2, type: "slot", inner: "selection", value: "cooldown" })
			}
			p.atk2OldCooldownState = p.atk2Cooldown > 0
		}
		if (p.atk3OldCooldownState !== p.atk3Cooldown > 0) {
			if (p.atk3OldCooldownState === true) {
				// New state is false
				if (p.selectedattack === 3) {
					guiChanges.push({ type: "slot", number: 3, inner: "selection", value: "selected" })
				} else {
					guiChanges.push({ type: "slot", number: 3, inner: "selection", value: "unselected" })
				}
			} else {
				// New state is true
				guiChanges.push({ number: 3, type: "slot", inner: "selection", value: "cooldown" })
			}
			p.atk3OldCooldownState = p.atk3Cooldown > 0
		}
		if (p.atk4OldCooldownState !== p.atk4Cooldown > 0) {
			if (p.atk4OldCooldownState === true) {
				// New state is false
				if (p.selectedattack === 4) {
					guiChanges.push({ type: "slot", number: 4, inner: "selection", value: "selected" })
				} else {
					guiChanges.push({ type: "slot", number: 4, inner: "selection", value: "unselected" })
				}
			} else {
				// New state is true
				guiChanges.push({ number: 4, type: "slot", inner: "selection", value: "cooldown" })
			}
			p.atk4OldCooldownState = p.atk4Cooldown > 0
		}
		if (p.atk5OldCooldownState !== p.atk5Cooldown > 0) {
			if (p.atk5OldCooldownState === true) {
				// New state is false
				if (p.selectedattack === 5) {
					guiChanges.push({ type: "slot", number: 5, inner: "selection", value: "selected" })
				} else {
					guiChanges.push({ type: "slot", number: 5, inner: "selection", value: "unselected" })
				}
			} else {
				// New state is true
				guiChanges.push({ number: 5, type: "slot", inner: "selection", value: "cooldown" })
			}
			p.atk5OldCooldownState = p.atk5Cooldown > 0
		}

		if (guiChanges.length > 0) p.socketio.emit("gui", guiChanges) // Send all the GUI changes to the client

		if (p.stunned == false) {
			if (p.sprintTime > 0) {
				if (p.sprinting == false) {
					p.sprinting = true
					p.setSpeed(p.currentCreature.sprintSpeed)
				}
				p.setCameraFOV(60 + p.sprintTime)
			} else {
				if (p.sprinting == true) {
					p.sprinting = false
					p.setCameraFOV(60)
					p.setSpeed(p.currentCreature.speed)
				}
			}
		}

		p.bitecooldown--
		if (p.inSelector === false) {
			// Ground check for footsteps
			p.onGround = await inBlock(new Vector3(p.position.x, p.position.y, p.position.z - 2))
		}
	}, 100)

	let evaluatingWorldObjects = false
	p.setInterval(async () => {
		// World/chunk meta evaluate objects interval (350ms)
		if (!evaluatingWorldObjects) {
			evaluatingWorldObjects = true

			await require("../worldObjects/evaluateWorldObjectsOnPlayer.js")(p)

			evaluatingWorldObjects = false
		}
	}, 350)

	p.setInterval(async () => {
		// Long interval (1000ms)
		if (p.sprintCoolDown > 0) {
			p.sprintCoolDown--
		}
		if (p.sprintTime > 0) {
			p.sprintTime--
		}

		if (p.debuffDamageLeft > 0) {
			p.debuffDamageLeft -= p.debuffDamageAmount
			damageHandler(p, p.debuffAttacker, p.debuffAttackRef, -p.debuffDamageAmount)
			if (p.debuffParticles !== "none") {
				particleManager.emitParticle(p.debuffParticles, p.position)
			}
		}
		if (!p.inSelector) {
			if (p.timetrial) {
				p.musicBiome = -2
				soundbrick(
					{
						url: `/audio/voxelborn.mp3`,
						isGlobal: true,
						isloop: true,
					},
					p
				)
			} else {
				if (p.position.z < 200) {
					// Caves
					if (p.position.z < -200) {
						// Deep caves
						let blockType = await voxelWorld.world.getBlockType(new Vector3(Math.floor(p.position.x / 4), Math.floor(p.position.y / 4)), 2)
						p.musicBiome = -4
						switch (blockType) {
							case 195: // Snow
								// OPEN SOURCE TODO: sepraThermic replace/add license
								break
							default:
								// OPEN SOURCE TODO: awful replace
								break
						}
					} else {
						let blockType = await voxelWorld.world.getBlockType(new Vector3(Math.floor(p.position.x / 4), Math.floor(p.position.y / 4)), 2)
						p.musicBiome = -3
						switch (blockType) {
							case 195: // Snow
								// OPEN SOURCE TODO: sepraThermic replace/add license
								break
							default:
								soundbrick(
									{
										url: `/sounds/20201106.mp3`,
										isGlobal: true,
										isloop: true,
									},
									p
								)
								break
						}
					}
				} else {
					let blockType = await voxelWorld.world.getBlockType(new Vector3(Math.floor(p.position.x / 4), Math.floor(p.position.y / 4), 2))
					if (p.musicBiome == blockType) {
						p.musicBiomeTimer = 10
					} else {
						p.musicBiomeTimer--
						if (p.musicBiomeTimer < 0) {
							switch (blockType) {
								case 195: // Snow
									p.musicBiome = blockType
									p.musicBiomeTimer = 10
									soundbrick(
										{
											url: `/music/Alpine_Ascents.mp3`,
											isGlobal: true,
											isloop: true,
										},
										p
									)
									break
								case 214: // Orange
									p.musicBiome = blockType
									p.musicBiomeTimer = 10
									break
								case 16: // Void
									p.musicBiome = blockType
									p.musicBiomeTimer = 10
									soundbrick(
										{
											url: `/music/20210314.mp3`,
											isGlobal: true,
											isloop: true,
										},
										p
									)
									break
								case 2: // Grass Lands
									p.musicBiome = blockType
									p.musicBiomeTimer = 10
									soundbrick(
										{
											url: `/music/20180121.mp3`,
											isGlobal: true,
											isloop: true,
										},
										p
									)
									break
								case 3: // Desert
									p.musicBiome = blockType
									p.musicBiomeTimer = 10
									soundbrick(
										{
											url: `/music/20180121.mp3`,
											isGlobal: true,
											isloop: true,
										},
										p
									)
									break
								case 55: // Weak Lands
									p.musicBiome = blockType
									p.musicBiomeTimer = 10
									soundbrick(
										{
											url: `/music/20200310.ogg`,
											isGlobal: true,
											isloop: true,
										},
										p
									)
									break
								case 1: // Crimson
									p.musicBiome = blockType
									p.musicBiomeTimer = 10
									soundbrick(
										{
											url: `/music/20180126.mp3`,
											isGlobal: true,
											isloop: true,
										},
										p
									)
									break
								case 238: // Stones
									p.musicBiome = blockType
									p.musicBiomeTimer = 10
									soundbrick(
										{
											url: `/music/20190112.mp3`,
											isGlobal: true,
											isloop: true,
										},
										p
									)
									break
								case 44: // Mushrooms
									p.musicBiome = blockType
									p.musicBiomeTimer = 10
									soundbrick(
										{
											url: `/music/20190819.mp3`,
											isGlobal: true,
											isloop: true,
										},
										p
									)
									break
							}
						}
					}
				}
			}
		} else {
			p.musicBiome = -1
			// soundbrick({
			// 	url: `/audio/20180619cut.mp3`,
			// 	isGlobal: true,
			// 	isloop: true
			// }, p)
		}
	}, 1000)
})

const fs = require("fs")
const SmartBuffer = require("smart-buffer").SmartBuffer
Game.on("playerLeave", (p) => {
	if (p.holdingObject) p.holdingObject.drop(p) // Drop any item
	p.destroyed = true // p.destory() doesn't appear to set destroyed true for some reason and results in BH character models to remain
	//p.charbot.destroy() // This is also another solution to the above problem

	//webClient.characters[p.webNetId] = undefined
	delete webClient.characters[p.webNetId]
	try {
		if (p?.undoBuffer?.undo.length) {
			let buff = new SmartBuffer()
			buff.writeUInt32LE(p.undoBuffer.undo.length)
			p.undoBuffer.undo.forEach((element) => {
				buff.writeUInt8(element[0])
				buff.writeUInt8(element[1])
				buff.writeInt32LE(element[2].x)
				buff.writeInt32LE(element[2].y)
				buff.writeInt32LE(element[2].z)
			})
			fs.writeFileSync(`./undoHistory/${[...Array(30)].map((i) => (~~(Math.random() * 36)).toString(36)).join("")}.bin`, buff.toBuffer())
		}
	} catch (error) {
		console.log(error)
	}

	if (constants.discordEnabled) bot.channels.get(channel).send(`${p.username} left ${gameName}`)
})

function messageAllExcept(message, player) {
	Game.players.forEach((other) => {
		if (player !== other) other.message(message)
	})
}

const colorcodeRegex = /\\c[0-9]/g
const hexcodeRegex = /(\[#[0-9a-fA-F]{6}\])/g
const internalcodeRegex = /<color:[0-9A-F]{6}>/g
const rateLimit = new Set()

swearReplacements = ["*utterance*", "*screeches*", "*murrs*", "*caws*", "I am very silly."]

function removeTextFormatting(str) {
	str = str.replace(colorcodeRegex, "")
	str = str.replace(hexcodeRegex, "")
	str = str.replace(internalcodeRegex, "")
	return str
}

Game.on("chatted", (caller, msg) => {
	if (constants.discordEnabled) bot.channels.get(channel).send(`${gameName} | ${caller.currentCreature.discordEmoji} ${caller.username}: ${msg}`)
})

bot.on("message", async (message) => {
	//Sends messages from discord to all connected clients
	if (message.channel.id === channel) {
		if (message.author.bot) return
		if (filter.isSwear(message.content)) {
			if (Game.serverSettings.sepraType !== "regular") return
			if (constants.discordEnabled) {
				bot.channels.get(channel).send("**Don't swear! Your message has not been sent.**")
				return
			}
		} else {
			console.log(`(discord) ${message.author.username}: ` + message.content)
			Game.messageAll(`\\c4(discord) ${message.author.username}: \\c0` + message.content.substring(0, 85))
		}
	}
})

/**A linear interpolator for hexadecimal colors
 *
 * @example // returns #7F7F7F lerpColor('#000000', '#ffffff', 0.5)
 *
 * @param {String} a
 * @param {String} b
 * @param {Number} amount
 * @returns {String}
 */
function lerpColor(a, b, amount) {
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
