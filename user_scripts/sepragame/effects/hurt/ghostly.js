function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function ghost(emitposition) {

	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return console.warn(brick)
	brick.setColor("#ffffff")
	brick.setScale(new Vector3(0.5, 0.5, 0.5))
	brick.setPosition(new Vector3(emitposition.x + randomIntFromInterval(-4, 4), emitposition.y + randomIntFromInterval(-4, 4), emitposition.z + randomIntFromInterval(2, 5)))
	brick.gracefulRemovalMode = 2
	let gracefulID = brick.gracefulID
	let grav = 0.1
	let time = 0
	let spin = 0
	var loop = setInterval(() => {
		if (brick.gracefulID !== gracefulID) return clearInterval(loop) // The brick got gracefully removed
		time++
		brick.position.z = brick.position.z += grav
		brick.setPosition(brick.position)
		if (time > 1) {
			spin += 5
			brick.setRotation(spin)
			if (time > 80) {
				if (time > 89) {
					reuseHandler.deleteBrick(brick)
					clearInterval(loop)
				}
			}
		}
	}, 25);
}

module.exports = ghost