// clusterWorker3.js: Now with more fast! (it was pretty simple lol)
// Web worker for the sepragame web client to generate meshes of the brick-block terrain sent by the server.
// Important note: Data isn't sent as voxels but instead bricks, which are data containg a position (local to cluster) and a scale. These bricks may overlap with each other and that's FINE.

const queue = []

const normals = []
for (let i = 0; i < 6; i++) {
	normals.push(0)
	normals.push(0)
	normals.push(-1)
}
for (let i = 0; i < 6; i++) {
	normals.push(0)
	normals.push(1)
	normals.push(0)
}
for (let i = 0; i < 6; i++) {
	normals.push(0)
	normals.push(0)
	normals.push(1)
}
for (let i = 0; i < 6; i++) {
	normals.push(-1)
	normals.push(0)
	normals.push(0)
}
for (let i = 0; i < 6; i++) {
	normals.push(1)
	normals.push(0)
	normals.push(0)
}
for (let i = 0; i < 6; i++) {
	normals.push(0)
	normals.push(-1)
	normals.push(0)
}
const brickCache = new Map()
const colorCache = new Map()


function brickVertexData(position, scale, color) { // Get VertexData of a brick
	if (!position) {
		const cacheKey = `${color.r} ${color.g} ${color.b} ${scale.x} ${scale.y} ${scale.z}`
		if (brickCache.has(cacheKey)) {
			return brickCache.get(cacheKey)
		} else {
			const positions = [
				// A side
				0, 0, 0,
				0 + scale.x, 0, 0,
				0, scale.z, 0,

				0 + scale.x, 0, 0,
				0 + scale.x, 0 + scale.z, 0,
				0, 0 + scale.z, 0,

				// Top
				0, 0 + scale.z, 0,
				0 + scale.x, 0 + scale.z, 0,
				0, 0 + scale.z, 0 + scale.y,

				0 + scale.x, 0 + scale.z, 0 + scale.y,
				0, 0 + scale.z, 0 + scale.y,
				0 + scale.x, 0 + scale.z, 0,

				// A side
				0, 0, 0 + scale.y,
				0, 0 + scale.z, 0 + scale.y,
				0 + scale.x, 0, 0 + scale.y,

				0 + scale.x, 0, 0 + scale.y,
				0, 0 + scale.z, 0 + scale.y,
				0 + scale.x, 0 + scale.z, 0 + scale.y,

				// A side
				0, 0, 0,
				0, 0 + scale.z, 0,
				0, 0, 0 + scale.y,

				0, 0, 0 + scale.y,
				0, 0 + scale.z, 0,
				0, 0 + scale.z, 0 + scale.y,

				// A side
				0 + scale.x, 0, 0,
				0 + scale.x, 0, 0 + scale.y,
				0 + scale.x, 0 + scale.z, 0,

				0 + scale.x, 0, 0 + scale.y,
				0 + scale.x, 0 + scale.z, 0 + scale.y,
				0 + scale.x, 0 + scale.z, 0,

				// Bottom
				0, 0, 0 + scale.y,
				0 + scale.x, 0, 0 + scale.y,
				0 + scale.x, 0, 0,

				0 + scale.x, 0, 0,
				0, 0, 0,
				0, 0, 0 + scale.y,
			]

			const uvs = [0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0, 0, scale.x, 0, 0, scale.y, scale.x, scale.y, 0, scale.y, scale.x, 0, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0, scale.y, scale.x, scale.y, scale.x, 0, scale.x, 0, 0, 0, 0, scale.y]

			const colorCacheKey = `${color.r} ${color.g} ${color.b} `
			if (colorCache.has(colorCacheKey)) {
				var colors = colorCache.get(colorCacheKey)
			} else {
				var colors = []
				for (let i = 0; i < 36; i++) {
					colors.push(color.r)
					colors.push(color.g)
					colors.push(color.b)
					colors.push(1)
				}
				colorCache.set(colorCacheKey, colors)
			}

			var vertexData = {}
			vertexData.positions = positions
			vertexData.normals = normals
			vertexData.uvs = uvs
			vertexData.colors = colors
			brickCache.set(cacheKey, vertexData)
			return vertexData
		}
	} else {
		const positions = [
			// A side
			position.x, position.z, position.y,
			position.x + scale.x, position.z, position.y,
			position.x, position.z + scale.z, position.y,

			position.x + scale.x, position.z, position.y,
			position.x + scale.x, position.z + scale.z, position.y,
			position.x, position.z + scale.z, position.y,

			// Top
			position.x, position.z + scale.z, position.y,
			position.x + scale.x, position.z + scale.z, position.y,
			position.x, position.z + scale.z, position.y + scale.y,

			position.x + scale.x, position.z + scale.z, position.y + scale.y,
			position.x, position.z + scale.z, position.y + scale.y,
			position.x + scale.x, position.z + scale.z, position.y,

			// A side
			position.x, position.z, position.y + scale.y,
			position.x, position.z + scale.z, position.y + scale.y,
			position.x + scale.x, position.z, position.y + scale.y,

			position.x + scale.x, position.z, position.y + scale.y,
			position.x, position.z + scale.z, position.y + scale.y,
			position.x + scale.x, position.z + scale.z, position.y + scale.y,

			// A side
			position.x, position.z, position.y,
			position.x, position.z + scale.z, position.y,
			position.x, position.z, position.y + scale.y,

			position.x, position.z, position.y + scale.y,
			position.x, position.z + scale.z, position.y,
			position.x, position.z + scale.z, position.y + scale.y,

			// A side
			position.x + scale.x, position.z, position.y,
			position.x + scale.x, position.z, position.y + scale.y,
			position.x + scale.x, position.z + scale.z, position.y,

			position.x + scale.x, position.z, position.y + scale.y,
			position.x + scale.x, position.z + scale.z, position.y + scale.y,
			position.x + scale.x, position.z + scale.z, position.y,

			// Bottom
			position.x, position.z, position.y + scale.y,
			position.x + scale.x, position.z, position.y + scale.y,
			position.x + scale.x, position.z, position.y,

			position.x + scale.x, position.z, position.y,
			position.x, position.z, position.y,
			position.x, position.z, position.y + scale.y,
		]

		const uvs = [0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0, 0, scale.x, 0, 0, scale.y, scale.x, scale.y, 0, scale.y, scale.x, 0, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0.001, 0.002, 0.003, 0, scale.y, scale.x, scale.y, scale.x, 0, scale.x, 0, 0, 0, 0, scale.y]
		const colorCacheKey = `${color.r} ${color.g} ${color.b}`

		if (colorCache.has(colorCacheKey)) {
			var colors = colorCache.get(colorCacheKey)
		} else {
			var colors = []
			for (let i = 0; i < 36; i++) {
				colors.push(color.r)
				colors.push(color.g)
				colors.push(color.b)
				colors.push(1)
			}
			colorCache.set(colorCacheKey, colors)
		}

		var vertexData = {}
		vertexData.positions = positions
		vertexData.normals = normals
		vertexData.uvs = uvs
		vertexData.colors = colors
		return vertexData
	}
}

// Convert hex to RGB
function hexToRGB(hex) {
	hex = hex.replace(/^#/, "")
	const bigint = parseInt(hex, 16)
	const r = ((bigint >> 16) & 255) / 255
	const g = ((bigint >> 8) & 255) / 255
	const b = (bigint & 255) / 255
	return { r, g, b }
}

function decode(str) {
	return parseInt(str, 36)
}

function readBol(bolStr) {
	if (bolStr === "0") return false
	return true
}

this.onmessage = function (data) {
	data = data.data
	if (data[0] === true) { // add
		let cluster = data[1]
		if (cluster === "") return

		cluster = cluster.split(",")

		let bricks = []
		const clustLength = cluster[3].length / 12
		for (let i = 0; i < clustLength; i++) {
			const read = i * 13
			const xClustOffset = cluster[0] * 32
			const yClustOffset = cluster[1] * 32
			const zClustOffset = cluster[2] * 32
			const clustString = cluster[3]
			bricks.push({
				position: {
					x: (decode(clustString[read + 0]) + (xClustOffset)) * 4,
					y: (decode(clustString[read + 1]) + (yClustOffset)) * 4,
					z: (decode(clustString[read + 2]) + (zClustOffset)) * 4
				},
				scale: {
					x: (decode(clustString[read + 3])) * 4,
					y: (decode(clustString[read + 4])) * 4,
					z: (decode(clustString[read + 5])) * 4
				},
				collision: readBol(clustString[read + 6]),
				color: cluster[3].substring(read + 7, read + 13),
				dataTMP: { // Appears to be the local to cluster position, used in meshing
					x: (decode(clustString[read + 0])) * 4,
					y: (decode(clustString[read + 1])) * 4,
					z: (decode(clustString[read + 2])) * 4
				}
			})
		}
		cluster = {
			p: `${cluster[0]} ${cluster[1]} ${cluster[2]}`,
			bricks: bricks,
			unindexed: false
		}

		// Begin meshing
		const allVertexData = []
		cluster.bricks.forEach(brick => {
			allVertexData.push(brickVertexData(brick.dataTMP, brick.scale, hexToRGB(brick.color), true, false))
			delete brick.dataTMP
		})


		const vertexData = {}
		vertexData.positions = []
		vertexData.indices = []
		vertexData.normals = []
		vertexData.uvs = []
		vertexData.colors = []
		// Turns out, using arr.flat() was pretty dumb in terms of performance
		allVertexData.forEach(element => {
			for (let i = 0; i < element.positions.length; i++) {
				const datum = element.positions[i];
				vertexData.positions.push(datum)
			}
			for (let i = 0; i < element.normals.length; i++) {
				const datum = element.normals[i];
				vertexData.normals.push(datum)
			}
			for (let i = 0; i < element.uvs.length; i++) {
				const datum = element.uvs[i];
				vertexData.uvs.push(datum)
			}
			for (let i = 0; i < element.colors.length; i++) {
				const datum = element.colors[i];
				vertexData.colors.push(datum)
			}
		})
		for (let i = 0; i < cluster.bricks.length * 36; i++) {
			vertexData.indices.push(i)
		}

		this.postMessage([true, {
			vertexData: {
				positions: new Uint32Array(vertexData.positions).buffer,
				indices: new Uint32Array(vertexData.indices).buffer,
				normals: new Int8Array(vertexData.normals).buffer,
				uvs: new Float32Array(vertexData.uvs).buffer,
				colors: new Float32Array(vertexData.colors).buffer
			},
			cluster
		}])
	} else { // delete: Because messages go through a queue, this make sense to post messages to the web worker where existing data is relevant.
		const key = data[1]
		this.postMessage([false, key])
	}
}