express = getModule("express")
soundbrick = require("./sound-brick/index.js")
sepragame = Game.modules[Game.serverSettings.modulePath]
sepragame.init({
	Game: Game,
	Vector3: Vector3,
	Bot: Bot,
	Brick: Brick,
	Outfit: Outfit,
	Team: Team,
	Tool: Tool,
	sleep: sleep,
	debounce: debounce,
	world: world,
	soundbrick: soundbrick,
	express: express,
	util: util,
	AssetDownloader: AssetDownloader,
})
