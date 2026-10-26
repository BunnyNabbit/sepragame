const blood = require("./hurt/small.js")
const ghost = require("./hurt/ghostly.js")
const flames = require("./attack/flames.js")
const slash = require("./attack/slash.js")
const drippy = require("./colored/drippy.js")
const debris = require("./colored/debris.js")
const explosion = require("./attack/explosion.js")

function getpar() {
	let data = []
	data.push({ name: "bloodsmall", script: blood })
	data.push({ name: "ghost", script: ghost })
	data.push({ name: "flames", script: flames })
	data.push({ name: "slash", script: slash })
	data.push({ name: "drippy", script: drippy })
	data.push({ name: "debris", script: debris })
	data.push({ name: "explosion", script: explosion })
	return data
}

function emitParticle(particle, settings) {
	var result = particleData.find((x) => x.name == particle)
	if (result == undefined) return Game.messageAll(`\\c6Interal game error: \\c0Unable to find particle ${particle}`)
	result.script(settings)
}

module.exports = { getpar, emitParticle }
