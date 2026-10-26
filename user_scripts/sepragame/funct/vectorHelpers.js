module.exports = { flipYZ, getGridPos, getBlockPos, equals }

function flipYZ(vec) {
	return new Vector3(vec.x, vec.z, vec.y)
}

function getBlockPos(vec) {
	return getGridPos(vec, 4)
}

function equals(vec1, vec2) {
	return (vec1.x == vec2.x && vec1.y == vec2.y && vec1.z == vec2.z)
}

function getGridPos(vec3, factor) {
	return new Vector3(Math.floor(vec3.x / factor), Math.floor(vec3.y / factor), Math.floor(vec3.z / factor))
}