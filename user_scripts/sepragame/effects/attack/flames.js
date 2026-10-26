function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

const colors = { // animation
	"0": "#FF0000",
	"1": "#FF5900",
	"2": "#FF8800",
	"3": "#FF9D00",
	"4": "#FF6600",
}

function flame(emitposition) {

	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return console.warn(brick)
	brick.setOutline(true)
	brick.setColor("#ff0000")
	brick.setScale(new Vector3(0.5, 0.5, 0.5))
	let offset = new Vector3(randomIntFromInterval(-4, 4), randomIntFromInterval(-4, 4), randomIntFromInterval(2, 5))
	brick.setPosition(new Vector3(emitposition.x + offset.x, emitposition.y + offset.y, emitposition.z + offset.z))
	brick.gracefulRemovalMode = 2
	let gracefulID = brick.gracefulID
	let grav = 0.1
	let time = 0
	let spin = 0
	let animColor = 0
	var loop = setInterval(() => {
		if (brick.gracefulID !== gracefulID) return clearInterval(loop) // The brick got gracefully removed
		time++
		offset.z += grav

		brick.setPosition(new Vector3(emitposition.x + offset.x, emitposition.y + offset.y, emitposition.z + offset.z))

		if (time % 3 == 1) {
			animColor++
			brick.setColor(colors[animColor % 5])
		}

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

module.exports = flame