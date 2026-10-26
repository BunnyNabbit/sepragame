// Handler for reusing existing bricks to reduce lag spikes + disc usage because Brick Hill Legacy TM
// the disk usage thing is no longer the case in this new version now but it still lag spikes which is :(
// Bricks should always be reused and NEVER deleted or added when you use this
//queue = []

const queueSize = 50

function initqueue() {
	let i = 0
	for (i = 0; i < queueSize; i++) { // Create the bricks and queue
		let brick = new Brick(new Vector3(-99999999, -99999999, -99999999), new Vector3(1, 1, 1), "#f54242")
		Game.newBrick(brick)
		brick.queueID = i
		brick.gracefulRemovalMode = 0
		brick.canReuse = true
		brick.gracefulID = gracefulID++
		brick.setCollision(false)
		patcher.patchBrick(brick)
		//brick.collision = false
		queue.push(brick)
	}
}

// Graceful removal modes
// 0 = Don't remove
// 1 Aged = Can be gracefully removed but less priority than mode 2
// 2 = Unimportant = Can be gracefully removed

let gracefulID = 0

function reuseBrick() {
	let id = queue.findIndex(object => object.canReuse === true)
	if (id === -1) { // Gracefully remove unimportant stuff like particles
		let x = queue.sort(function (a, b) { return a.gracefulID - b.gracefulID }).find(object => object.gracefulRemovalMode === 2)

		if (x !== undefined) {
			deleteBrick(x) // Remove mode 2
		} else {
			let x = queue.sort(function (a, b) { return a.gracefulID - b.gracefulID }).queue
			if (x !== undefined) x = x.find(object => object.gracefulRemovalMode === 1)

			if (x !== undefined) {
				deleteBrick(x) // Remove mode 1
			}
		}
		id = queue.findIndex(object => object.canReuse === true)
	}
	if (id !== -1) {
		let brick = queue[id]
		brick.canReuse = false
		brick.gracefulID = gracefulID++

		if (brick.outline === true) brick.setOutline(false)
		brick.setRotation(0)
		return brick
	} else {
		return -1 // i simply cannot
	}
}

function deleteBrick(brick) { // TODO check if object is used or not
	brick.onDelete()
	brick.forceSetPosition(new Vector3(-99999999, -99999999, -99999999))
	brick.canReuse = true
	brick.gracefulRemovalMode = 0
	brick.onDelete = noop
}

module.exports = { reuseBrick, deleteBrick, initqueue }
