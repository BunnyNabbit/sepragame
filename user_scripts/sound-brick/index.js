let curCall = init
function call(data, player) {
	curCall(data, player)
}
function init({ config, express, app, http, io }) {
	// FTODO: no longer listens HTTP
	console.log(config)

	if (typeof config.InterfacePort === "undefined") console.log("sound-brick interface port undefined.")
	var port = config.InterfacePort //The port the server runs on.

	io = io(http, {
		path: config.InterfaceIoPath,
	})

	var users = 0
	var sockets = []

	function playSound(data, player) {
		var clientData = {}

		if (data == undefined) return console.log("sound-brick didn't get sound object")

		if (data.url == undefined) return console.log("sound-brick didn't get sound url")

		if (data.isGlobal == undefined) return console.log("sound-brick didn't get isGlobal")

		if (data.position !== undefined) {
			clientData.position = data.position

			if (data.minDistance == undefined) {
				clientData.minDistance = 50
			} else {
				clientData.minDistance = data.minDistance
			}

			if (data.maxDistance == undefined) {
				clientData.maxDistance = 10
			} else {
				clientData.maxDistance = data.maxDistance
			}
		}

		clientData.url = data.url

		if (data.sfxr) clientData.sfxr = true

		if (data.isloop == undefined) {
			clientData.isloop = false
		} else {
			clientData.isloop = data.isloop
		}

		if (data.musiccredit !== undefined) {
			clientData.musiccredit = data.musiccredit
		}

		// Clean and play
		if (player) {
			if (player.isLinked == true || player.clientType === "Web") {
				// Altered
				if (clientData.position !== undefined) {
					const distance = Game.pointDistance3D(player.position, clientData.position)

					clientData = distanceVolume(clientData, distance)

					if (clientData) return player.soundSocket.emit(`playSound`, clientData) // Send sound to a player
				} else {
					clientData.volume = 1
					return player.soundSocket.emit(`playSound`, clientData) // Send sound to a player
				}
			}
		} else {
			if (clientData.position !== undefined) {
				sockets.forEach((socket) => {
					try {
						if (!socket.playerobject) return
						var distance = Game.pointDistance3D(socket.playerobject.position, clientData.position)

						clientData = distanceVolume(clientData, distance)

						if (!clientData) return

						let restoerHeck = {
							position: clientData.isGlobal,
							position: clientData.position,
							minDistance: clientData.minDistance,
							maxDistance: clientData.maxDistance,
						}
						clearVars(clientData)

						socket.emit(`playSound`, clientData) // Send sound to players nearby
						clientData.isGlobal = restoerHeck.isGlobal
						clientData.position = restoerHeck.position
						clientData.minDistance = restoerHeck.minDistance
						clientData.maxDistance = restoerHeck.maxDistance
					} catch (error) {
						console.log(error)
					}
				})

				Game.players.forEach((p) => {
					// copy of above but for web client players
					try {
						if (p.clientType === "Web") {
							var distance = Game.pointDistance3D(p.position, clientData.position)
							var canPlay = false
							if (distance < clientData.maxDistance) {
								canPlay = true
								clientData.volume = 1
							} else {
								if (distance > clientData.minDistance) {
									// ntohign! LMAO funny
								} else {
									var newvolume = 1 - distance / clientData.minDistance

									canPlay = true
									clientData.volume = newvolume
								}
							}

							if (canPlay == false) return

							p.socketio.emit(`playSound`, clientData)
						}
					} catch (error) {}
				})
			} else {
				clearVars(clientData)
				clientData.volume = 1
				socketio.emit(`playSound`, clientData) // else just emit the global sound
				Game.players.forEach((p) => {
					if (p.clientType === "Web") {
						p.socketio.emit(`playSound`, clientData)
					}
				})
			}
		}
	}

	function clearVars(sound) {
		delete sound.isGlobal
		delete sound.position
		delete sound.minDistance
		delete sound.maxDistance
	}

	function distanceVolume(sound, distance) {
		var canPlay = false
		if (distance < sound.maxDistance) {
			canPlay = true
			sound.volume = 1
		} else {
			if (distance < sound.minDistance) {
				var newvolume = 1 - distance / sound.minDistance

				canPlay = true
				sound.volume = newvolume
			}
		}

		if (canPlay == false) return
		return sound
	}

	function getPlayer(name) {
		for (let player of Game.players) {
			if (player.username.toLowerCase().indexOf(String(name).toLowerCase()) == 0) {
				const victim = Array.from(Game.players).find((p) => p.username === player.username)
				return victim
			}
		}
	}

	curCall = playSound
}

module.exports = call
