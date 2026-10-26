async function inBlockFromWorldPosition(pos) {
	// Check if a position (that isn't used for voxel world) is inside a block
	// The world is made out of 4x4x4 cubes
	const worldX = pos.x / 4
	const worldY = pos.y / 4
	const worldZ = pos.z / 4

	const blockType = await voxelWorld.world.getBlockType(new Vector3(worldX, worldY, worldZ))
	const blockData = await voxelWorld.world.getBlockData(new Vector3(worldX, worldY, worldZ))

	return !(blockType == 0 || blockData == 1) // If the block in the position is air or a nocol block
}

module.exports = inBlockFromWorldPosition
