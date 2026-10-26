function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function hexToDec(hex, bgr = false) {
	hex = hex.replace(/^#/, "")
	const rgb = hexToRGB(hex)
	if (!bgr) {
		return rgbToDec(rgb[0], rgb[1], rgb[2])
	} else {
		return rgbToDec(rgb[2], rgb[1], rgb[0])
	}
}

function hexToRGB(hex) {
	hex = hex.replace(/^#/, "")
	const bigint = parseInt(hex, 16)
	const r = (bigint >> 16) & 255
	const g = (bigint >> 8) & 255
	const b = bigint & 255
	return [r, g, b]
}

function rgbToDec(r, g, b) {
	const rgb = r | (g << 8) | (b << 16)
	return rgb.toString(10)
}

const bloods = new Set()

function smallBlood(emitposition) {
	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return console.warn(brick)

	socketio.emit("bc", { netId: brick.netId, c: "#FF0000" }) // Web clients always get red blood

	// loop through all players
	// brickPacket.send(player.socket)
	brick.setScale(new Vector3(0.5, 0.5, 0.5))
	brick.setPosition(new Vector3(emitposition.x, emitposition.y, emitposition.z + 3))
	brick.gracefulRemovalMode = 1
	let gracefulID = brick.gracefulID
	let grav = randomIntFromInterval(0, 100) / 100
	let time = 0
	let sped = randomIntFromInterval(0, 100) / 100
	let spin = 0
	let splatter = false
	let prot = randomIntFromInterval(0, 1000)
	let randomrot = randomIntFromInterval(0, 9)
	let canStep = true
	var loop = setInterval(async () => {
		if (canStep === false) return
		if (brick.gracefulID !== gracefulID) return clearInterval(loop) // The brick got gracefully removed
		time++
		grav += -0.06
		sped += -0.03
		if (sped < 0) sped = 0
		if (splatter === false) {
			brick.position.x = brick.position.x += sped * Math.sin(prot / debug)
			brick.position.y = brick.position.y - +sped * Math.cos(prot / debug)
			brick.position.z = brick.position.z += grav

			if ((await inBlock(brick.position)) === true) {
				// Check if blood can splatter on the ground
				splatter = true

				brick.gracefulRemovalMode = 0
				if (bloods.has(`${Math.floor(brick.position.x / 2) * 2 - 0.05} ${Math.floor(brick.position.y / 2) * 2 - 0.05} ${Math.floor(brick.position.z / 2) * 2 - 0.05}`)) {
					while (true) {
						brick.position.x += randomIntFromInterval(-1, 1) * 2
						brick.position.y += randomIntFromInterval(-1, 1) * 2
						if ((await inBlock(brick.position)) === false) {
							brick.position.z += -2
						} else {
							if (!bloods.has(`${Math.floor(brick.position.x / 2) * 2 - 0.05} ${Math.floor(brick.position.y / 2) * 2 - 0.05} ${Math.floor(brick.position.z / 2) * 2 - 0.05}`)) {
								brick.position.z = Math.floor(brick.position.z / 2) * 2 - 0.05
								brick.position.x = Math.floor(brick.position.x / 2) * 2 - 0.05
								brick.position.y = Math.floor(brick.position.y / 2) * 2 - 0.05
								bloods.add(`${brick.position.x} ${brick.position.y} ${brick.position.z}`)
								break
							}
						}
					}
				} else {
					brick.position.z = Math.floor(brick.position.z / 2) * 2 - 0.05
					brick.position.x = Math.floor(brick.position.x / 2) * 2 - 0.05
					brick.position.y = Math.floor(brick.position.y / 2) * 2 - 0.05
					bloods.add(`${brick.position.x} ${brick.position.y} ${brick.position.z}`)
				}

				brick.setScale(new Vector3(2.2, 2.2, 2.2))
				brick.setPosition(brick.position)
				brick.setRotation(0)
				brick.gracefulRemovalMode = 2
				clearInterval(loop)
				brick.onDelete = function () {
					bloods.delete(`${brick.position.x} ${brick.position.y} ${brick.position.z}`)
				}
				return
			}

			brick.setPosition(brick.position)

			if (time > 3) {
				spin += randomrot
				brick.setRotation(spin)
			}
		}

		if (time > 300) {
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}
	}, 25)
}

module.exports = smallBlood
