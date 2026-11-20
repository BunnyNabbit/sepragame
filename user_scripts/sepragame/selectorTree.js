module.exports = [
	{
		creatureName: "Settings",
		saveId: "ico-settings",
		description: "Access the settings",
		characterModelOffsets: {
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: enterSettings,
	},
	{
		creatureName: "Creatures",
		saveId: "ico-creatures",
		description: "",
		characterModelOffsets: {
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: enterCreatures,
	},
	//{
	//	creatureName: "Stats",
	//	saveId: "ico-stats",
	//	description: "",
	//	characterModelOffsets: {
	//	},
	//	webModelRotationOffset: 1.565, // For the visual model
	//	webLogicRotationOffset: 0, // For converting BH rotation
	//	webNetworkRotationOffset: 1.565, // for other player's model
	//	class: "icon",
	//
	//	trigger: enterStats
	//},
	//{
	//	creatureName: "Map",
	//	saveId: "ico-map",
	//	description: "",
	//	characterModelOffsets: {
	//	},
	//	webModelRotationOffset: 1.565, // For the visual model
	//	webLogicRotationOffset: 0, // For converting BH rotation
	//	webNetworkRotationOffset: 1.565, // for other player's model
	//	class: "icon",
	//
	//	trigger: enterMap
	//}
]

const settingData = [
	{
		creatureName: "Back",
		saveId: "ico-back",
		description: "",
		characterModelOffsets: {
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: triggerBackToMain,
	},
	{
		creatureName: "Render quality",
		saveId: "ico-resolution",
		description: "",
		characterModelOffsets: {
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: triggerResolution,
	},
	{
		creatureName: "View terrain distance",
		saveId: "ico-terrain",
		description: "",
		characterModelOffsets: {
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: triggerTerrain,
	},
]
function triggerBackToMain(p) {
	p.selectorData = initialSelectionTree
	p.updateSelector()
}

function triggerTerrain(p) {
	switch (p.viewDistanceN) {
		case -8:
			p.viewDistanceN = -1
			p.viewDistanceP = 2
			p.message("\\c5View distanced toggled to 3x3x3")
			break
		case -1:
			p.viewDistanceN = -2
			p.viewDistanceP = 3
			p.message("\\c5View distanced toggled to 5x5x5")
			break
		case -2:
			p.viewDistanceN = -3
			p.viewDistanceP = 4
			p.message("\\c5View distanced toggled to 7x7x7")
			break
		case -3:
			p.viewDistanceN = -4
			p.viewDistanceP = 5
			p.message("\\c5View distanced toggled to 9x9x9")
			break
		case -4:
			p.viewDistanceN = -5
			p.viewDistanceP = 6
			p.message("\\c5View distanced toggled to 11x11x11")
			break
		case -5:
			p.viewDistanceN = -6
			p.viewDistanceP = 7
			p.message("\\c5View distanced toggled to 13x13x13")
			break
		case -6:
			p.viewDistanceN = -7
			p.viewDistanceP = 8
			p.message("\\c5View distanced toggled to 15x15x15")
			break
		case -7:
			p.viewDistanceN = -8
			p.viewDistanceP = 9
			p.message("\\c5View distanced toggled to 17x17x17")
			break
		default:
			p.viewDistanceN = -1
			p.viewDistanceP = 2
			p.message("\\c5View distanced toggled to 3x3x3")
			break
	}
}

function triggerResolution(p) {
	p.socketio.emit("resolution")
}

function enterSettings(p) {
	p.selectorData = settingData
	p.updateSelector()
}

function enterCreatures(p) {
	p.selectorData = selectorData
	p.updateSelector()
}

function enterStats(p) {
	p.message("This feature is not yet available!")
}

function enterMap(p) {
	p.message("This feature is not yet available!")
}
