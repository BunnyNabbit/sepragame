function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

const red = ["#8c0000", "#bd2000", "#fa1e0e", "#ffbe0f"]
const smoke = ["#4d4d4d", "#666666", "#808080", "#999999"]

function particle(position) {
	for (let i = 0; i < 5; i++) {
		heat(position)
	}
	for (let i = 0; i < 5; i++) {
		sm(position)
	}
}

function heat(position) {

	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return console.warn(brick)

	brick.setColor(red[randomIntFromInterval(0, 3)])
	let size = randomIntFromInterval(6, 13) / 5
	brick.setScale(new Vector3(size, size, size))
	brick.setPosition(new Vector3(position.x + randomIntFromInterval(-5, 5) / 2, position.y + randomIntFromInterval(-5, 5) / 2, position.z + randomIntFromInterval(-5, 5) / 2))
	brick.gracefulRemovalMode = 1
	let gracefulID = brick.gracefulID
	let sped = randomIntFromInterval(1, 5) / 8
	let grav = randomIntFromInterval(-1, 1) / 2 + 0.3
	let time = 0
	let lifespan = randomIntFromInterval(10, 24)
	let spin = randomIntFromInterval(0, 360)
	let prot = randomIntFromInterval(0, 999)
	let randomrot = randomIntFromInterval(0, 9)
	var loop = setInterval(async () => {
		if (brick.gracefulID !== gracefulID) return clearInterval(loop) // The brick got gracefully removed
		time++

		brick.position.x = brick.position.x += sped * Math.sin(prot / debug)
		brick.position.y = brick.position.y - + sped * Math.cos(prot / debug)
		brick.position.z = brick.position.z += grav

		brick.setPosition(brick.position)

		if (time > 3) {
			spin += randomrot
			brick.setRotation(spin)
		}

		if (time > lifespan) {
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}

	}, 25);
}

function sm(position) {

	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return console.warn(brick)

	brick.setColor(smoke[randomIntFromInterval(0, 3)])
	let size = randomIntFromInterval(6, 9) / 5
	brick.setScale(new Vector3(size, size, size))
	brick.setPosition(new Vector3(position.x + randomIntFromInterval(-5, 5) / 2, position.y + randomIntFromInterval(-5, 5) / 2, position.z + randomIntFromInterval(-5, 5) / 2))
	brick.gracefulRemovalMode = 1
	let gracefulID = brick.gracefulID
	let sped = randomIntFromInterval(1, 5) / 2
	let grav = randomIntFromInterval(1, 5) / 2 + 0.3
	let time = 0
	let lifespan = randomIntFromInterval(70, 180)
	let spin = randomIntFromInterval(0, 360)
	let randomrot = randomIntFromInterval(0, 9)
	let prot = randomIntFromInterval(0, 999)
	var loop = setInterval(async () => {
		if (brick.gracefulID !== gracefulID) return clearInterval(loop) // The brick got gracefully removed
		time++

		brick.position.x = brick.position.x += sped * Math.sin(prot / debug)
		brick.position.y = brick.position.y - + sped * Math.cos(prot / debug)
		brick.position.z = brick.position.z += grav

		brick.setPosition(brick.position)

		if (time > 3) {
			spin += randomrot
			brick.setRotation(spin)
		}

		if (time > lifespan) {
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}

	}, 25);
}

module.exports = particle