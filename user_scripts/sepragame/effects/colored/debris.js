function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function particle(settings) {
	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return console.warn(brick)

	brick.setColor(settings.color)
	brick.setScale(new Vector3(0.5, 0.5, 0.5))
	brick.setPosition(new Vector3(settings.position.x, settings.position.y, settings.position.z + 3))
	brick.gracefulRemovalMode = 2
	let gracefulID = brick.gracefulID
	let grav = 0.78
	let time = 0
	let sped = 0.8
	let spin = 0
	let randomrot = randomIntFromInterval(0, 9)
	settings.direction = settings.direction || randomIntFromInterval(0, 360)
	let canStep = true
	var loop = setInterval(async () => {
		if (canStep === false) return
		if (brick.gracefulID !== gracefulID) return clearInterval(loop) // The brick got gracefully removed
		time++
		grav += -0.06
		sped += -0.03

		if (sped < 0) sped = 0

		brick.position.x = brick.position.x += sped * Math.sin(settings.direction / debug)
		brick.position.y = brick.position.y - +sped * Math.cos(settings.direction / debug)
		brick.position.z = brick.position.z += grav

		brick.setPosition(brick.position)

		if (time > 3) {
			spin += randomrot
			brick.setRotation(spin)
		}

		if (time > 50) {
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}
	}, 25)
}

module.exports = particle
