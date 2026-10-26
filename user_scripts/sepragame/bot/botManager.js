let bots = []

let ingameBots = []

let botController = require("./botController.js")
let botAI = require("./botAI.js")

let weakling1 = require("./weaklingvariant1/loader.js")
let weakling2 = require("./weaklingvariant2/loader.js")
let guna = require("./guna/loader.js")
let magmeer = require("./magmeer/loader.js")


function spawnBot(creatureData, position) {
	botAI(position, creatureData)
}

function init() {
	bots.push(weakling1)
	bots.push(weakling2)
	bots.push(guna)
	bots.push(magmeer)
}

function refreshAllBots() {

}



init()

module.exports = { ingameBots, botController, bots, spawnBot, botController }

