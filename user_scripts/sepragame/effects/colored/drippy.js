function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function particle(settings) {

	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	brick.setColor(settings.color)
	brick.setScale(new Vector3(0.5, 0.5, 0.5))
	brick.setPosition(new Vector3(settings.position.x, settings.position.y, settings.position.z + 3))
	brick.gracefulRemovalMode = 2
	let gracefulID = brick.gracefulID
	let grav = 0
	let time = 0
	let spin = randomIntFromInterval(1, 360)
	let splatter = false
	let randomrot = randomIntFromInterval(0, 9)
	let canStep = true
	var loop = setInterval(async () => {
		if (canStep === false) return
		if (brick.gracefulID !== gracefulID) return clearInterval(loop) // The brick got gracefully removed
		time++
		grav += -0.06
		if (splatter === false) {
			brick.position.x = brick.position.x += settings.directionalForce * Math.sin(settings.direction / debug)
			brick.position.y = brick.position.y - + settings.directionalForce * Math.cos(settings.direction / debug)
			brick.position.z = brick.position.z += grav

			if (await inBlock(brick.position) === true) { // Check if blood can splatter on the ground
				splatter = true

				brick.position.z = (Math.floor(brick.position.z / 4)*4) + 3.8

				brick.setScale(new Vector3(0.75, 0.75, 0.5))

				soundbrick({
					url: `111113svC4bmtePoKctxw7WEZHwnWHPtUax1T762p74LNgJVZ4LeGRJhBJtiK1TjA143zYuWox3npDpnPDYZg9XUg7usSBwUswAtXkFWL88HKQnSnCAeVGL7`, // [Required]
					sfxr: true,
					isGlobal: false,
					position: brick.position
				})
			}

			brick.setPosition(brick.position)


			if (time > 3) {
				spin += randomrot
				brick.setRotation(spin)
			}
		}

		if (time > settings.expire) {
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}

	}, 25);
}

module.exports = particle