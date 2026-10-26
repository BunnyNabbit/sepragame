function getBlockType(pos) { // Get the block type
	// The world is made out of 4x4x4 cubes
	var worldX = Math.floor(pos.x / 4)
	var worldY = Math.floor(pos.y / 4)
	var worldZ = Math.floor(pos.z / 4)

	var blockType = voxelWorld.world.getBlockType(new Vector3(worldX, worldY, worldZ))

	return blockType
}

module.exports = getBlockType