const isBlockCol = require("./inBlock.js")

async function bounceOut(pos) {

	var collision = await isBlockCol(pos)

	if (collision) { // If the block in the position isn't air
		var collision = await isBlockCol(new Vector3(pos.x, pos.y, pos.z + 4))
		if (collision) { // If the block above the position isn't air
			return 3 // Stay at old position
		} else { // The block is air
			return 2 // Step up
		}
	} else { // The block is air
		var collision = await isBlockCol(new Vector3(pos.x, pos.y, pos.z - 4))
		if (collision) { // If the block below the position isn't air
			return 0 // Stay on ground
		} else { // The block is air
			return 1 // Fall down
		}
	}
}

module.exports = bounceOut