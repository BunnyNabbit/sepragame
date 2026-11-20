function canCollide(vec3) {
	let blockType = getBlockType(vec3)
	let blockData = getBlockData(vec3)
	return !(blockType == 0 || blockData == 1)
}

function getBlockType(vec3) {
	let blockData = voxelWorld.world.getBlockType(vec3)
	return blockData
}

function getBlockData(vec3) {
	let blockData = voxelWorld.world.getBlockData(vec3)
	return blockData
}

module.exports = { canCollide }
