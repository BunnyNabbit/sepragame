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

function inBlockType(pos) {
	// Check if a position (that isn't used for voxel world) is inside a block
	// The world is made out of 4x4x4 cubes
	const worldX = pos.x / 4
	const worldY = pos.y / 4
	const worldZ = pos.z / 4

	const blockType = voxelWorld.world.getBlockType(new Vector3(worldX, worldY, worldZ))
	const blockData = voxelWorld.world.getBlockData(new Vector3(worldX, worldY, worldZ))

	return [!(blockType == 0 || blockData == 1), blockType] // If the block in the position is air or a nocol block
}

const sounds = {
	grass: "111117bp3UxbUyA21ZDMazVgDdVjpJKAeAKBTELWKHFzCs3kFJN3Y5SGvD6oXBjFdqy5ZL1p6QnizqemwySFJfVtgN1Wic687vLZLbvxchDf1kU6qCoq6AR5",
	stone: "111117bp3UxbUyA21ZDMazvokYc1rz6NwPoMTy8jGntJgs1f6HZoUCip6Mdd7TXiPivjeZjUiD5fCXCQAqvmgPqFX8PSSFhumUQFDg7zY4EQcMVmuPVrdwb5",
	metal: "111117bp3UxbUyA21ZDMawzC4WvChJYiLkhVw7jYQZwv9PpuoYSy4WSWR7eb9fBznbyr1KWPTa1LVgehpTUs7G5rd3ZVqwsQ6odAAFP2mHoNHgeNh2gZPWxc",
	snow: "7BMHBGGS7XB1xSYu2f21U3CFTuLxqsUfjRkZCD8bY82XkgFg3SMjAdqRw3xbS5MwTy61Xe38gCdAf3eHS15VKDuuS879u8CSaRtbKkZL1KwsndsNZCYYi4BgT",
}

const soundIds = {
	default: sounds.grass,
	2: sounds.grass,
	1: sounds.stone,
	8: sounds.stone,
	245: sounds.stone,
	238: sounds.stone,
	239: sounds.metal,
	15: sounds.stone,
	195: sounds.snow,
}

function getSoundFromId(blockId) {
	const sound = soundIds[blockId]
	if (sound) return sound
	return soundIds.default
}

function smallBlood(settings) {
	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	brick.setColor("#FFFF00")

	brick.setScale(new Vector3(0.25, 0.25, 0.25))
	brick.setPosition(new Vector3(settings.position.x + settings.offset.x * Math.sin(settings.direction / debug), settings.position.y - +settings.offset.x * Math.cos(settings.direction / debug), settings.position.z + settings.offset.y))
	brick.gracefulRemovalMode = 1
	let gracefulID = brick.gracefulID
	let grav = randomIntFromInterval(1, 100) / 1600
	let time = 0
	let spin = 0
	let splatter = false
	let randomrot = randomIntFromInterval(0, 9)
	let canStep = true
	var loop = setInterval(async () => {
		if (canStep === false) return
		if (brick.gracefulID !== gracefulID) return clearInterval(loop) // The brick got gracefully removed
		time++
		grav += -0.03
		if (splatter === false) {
			brick.position.x = brick.position.x += settings.directionalForce * Math.sin(settings.direction / debug)
			brick.position.y = brick.position.y - +settings.directionalForce * Math.cos(settings.direction / debug)
			brick.position.z = brick.position.z += grav

			if ((await inBlock(brick.position)) === true) {
				// Check if blood can splatter on the ground
				splatter = true
				if (settings.sfx) {
					soundbrick({
						url: getSoundFromId(inBlockType(brick.position)[1]),
						sfxr: true,
						isGlobal: false,
						position: brick.position,
					})
				} else {
					soundbrick({
						url: `111117bp3UxbUyA21ZDMazVgDdVjpJKAeAKBTELWKHFzCs3kFJN3Y5SGvD6oXBjFdqy5ZL1p6QnizqemwySFJfVtgN1Wic687vLZLbvxchDf1kU6qCoq6AR5`, // 11111G9ixXk9zdKAmst2ib92e8n5SzRRZUVgLPe7Sd8HarNXwxWzRDYSqG4CNjSZxmm7XVPRSfvX2PpSPW8i3y8rcMsdBvLGeYXyoDY4pk2W3CyLNxYFGWAB
						sfxr: true,
						isGlobal: false,
						position: brick.position,
					})
				}

				brick.gracefulRemovalMode = 0
				if (bloods.has(`${Math.floor(brick.position.x / 1) * 1 - 0.05} ${Math.floor(brick.position.y / 1) * 1 - 0.05} ${Math.floor(brick.position.z / 1) * 1 - 0.05}`)) {
					if (Math.random() > 0.085) {
						settings.direction = randomIntFromInterval(0, 1000)
						brick.position.z = brick.position.z -= grav
						settings.directionalForce = randomIntFromInterval(10, 30) / 200
						grav = randomIntFromInterval(50, 100) / 700
						time = 3
						brick.setScale(new Vector3(0.1, 0.1, 0.1))
						return
					}
					while (true) {
						brick.position.x += randomIntFromInterval(-1, 1) * 1
						brick.position.y += randomIntFromInterval(-1, 1) * 1
						if ((await inBlock(brick.position)) === false) {
							brick.position.z += -1
						} else {
							if (!bloods.has(`${Math.floor(brick.position.x / 1) * 1 - 0.05} ${Math.floor(brick.position.y / 1) * 1 - 0.05} ${Math.floor(brick.position.z / 1) * 1 - 0.05}`)) {
								brick.position.z = Math.floor(brick.position.z / 1) * 1 - 0.05
								brick.position.x = Math.floor(brick.position.x / 1) * 1 - 0.05
								brick.position.y = Math.floor(brick.position.y / 1) * 1 - 0.05
								bloods.add(`${brick.position.x} ${brick.position.y} ${brick.position.z}`)
								break
							}
						}
					}
				} else {
					brick.position.z = Math.floor(brick.position.z / 1) * 1 - 0.05
					brick.position.x = Math.floor(brick.position.x / 1) * 1 - 0.05
					brick.position.y = Math.floor(brick.position.y / 1) * 1 - 0.05
					bloods.add(`${brick.position.x} ${brick.position.y} ${brick.position.z}`)
				}

				brick.setScale(new Vector3(1.1, 1.1, 1.1))
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
		} else {
			brick.position.x = brick.position.x += settings.directionalForce * Math.sin(settings.direction / debug)
			brick.position.y = brick.position.y - +settings.directionalForce * Math.cos(settings.direction / debug)
			brick.position.z = brick.position.z += grav
			if (time > 20) {
				clearInterval(loop)
				reuseHandler.deleteBrick(brick)
			}
			brick.setPosition(brick.position)
		}
	}, 25)
}

module.exports = smallBlood
