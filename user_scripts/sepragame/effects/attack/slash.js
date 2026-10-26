function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

const offsets = {
	// animation frames
	1: { x: 1, y: 1, z: 1 },
	2: { x: 0.5, y: 0.5, z: 0.5 },
	3: { x: 0, y: 0, z: 0 },
	4: { x: -0.5, y: -0.5, z: -0.5 },
	5: { x: -1, y: -1, z: -1 }, //
	6: { x: -1, y: 1, z: 1 },
	7: { x: -0.5, y: 0.5, z: 0.5 },
	8: { x: 0, y: 0, z: 0 },
	9: { x: 0.5, y: -0.5, z: -0.5 },
	10: { x: 1, y: -1, z: -1 },
}

function flame(emitPos) {
	let time = 0

	var loop = setInterval(() => {
		if (time === 10) return clearInterval(loop)
		time++

		let brick = reuseHandler.reuseBrick()
		if (brick === -1) return

		brick.setColor("#ffffff")
		brick.setScale(new Vector3(0.5, 0.5, 0.5))
		if (!offsets[time]) console.log(time)
		brick.setPosition(new Vector3(emitPos.x + offsets[time].x, emitPos.y + offsets[time].y, emitPos.z + offsets[time].z))
		setTimeout(() => {
			reuseHandler.deleteBrick(brick)
		}, 300)
	}, 30)
}

module.exports = flame
