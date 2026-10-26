module.exports = [
	{
		creatureName: "Settings",
		saveID: "ico-settings",
		description: "Access the settings",
		charmodel: {
			hat1: 5192002,
			animNone: 50,
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: enterSettings
	},
	{
		creatureName: "Creatures",
		saveID: "ico-creatures",
		description: "",
		charmodel: {
			hat1: 117121,
			animNone: 10,
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: enterCreatures
	},
	//{
	//	creatureName: "Stats",
	//	saveID: "ico-stats",
	//	description: "",
	//	charmodel: {
	//		hat1: 181917,
	//		animNone: 50,
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
	//	saveID: "ico-map",
	//	description: "",
	//	charmodel: {
	//		hat1: 181917,
	//		animNone: 50,
	//	},
	//	webModelRotationOffset: 1.565, // For the visual model
	//	webLogicRotationOffset: 0, // For converting BH rotation
	//	webNetworkRotationOffset: 1.565, // for other player's model
	//	class: "icon",
	//
	//	trigger: enterMap
	//}
]

const settingDataBH = [
	{
		creatureName: "Back",
		saveID: "ico-back",
		description: "",
		charmodel: {
			hat1: 5192006,
			animNone: 50,
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: triggerBackToMain
	},
	{
		creatureName: "View terrain distance",
		saveID: "ico-terrain",
		description: "",
		charmodel: {
			hat1: 5192003,
			animNone: 50,
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: triggerTerrain,
	}
]

const settingDataWeb = [
	{
		creatureName: "Back",
		saveID: "ico-back",
		description: "",
		charmodel: {
			hat1: 5192006,
			animNone: 50,
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: triggerBackToMain
	},
	{
		creatureName: "Render quality",
		saveID: "ico-resolution",
		description: "",
		charmodel: {
			hat1: 181917,
			animNone: 50,
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: triggerResolution,
	},
	{
		creatureName: "View terrain distance",
		saveID: "ico-terrain",
		description: "",
		charmodel: {
			hat1: 5192003,
			animNone: 50,
		},
		webModelRotationOffset: 1.565, // For the visual model
		webLogicRotationOffset: 0, // For converting BH rotation
		webNetworkRotationOffset: 1.565, // for other player's model
		class: "icon",

		trigger: triggerTerrain,
	}
]
function triggerBackToMain(p) {
	p.selectorData = initalSelectionTree
	p.updateSelector()
}

function triggerTerrain(p) {
	if (p.clientType === "Brick Hill") {
		switch (p.viewDistanceN) {
			case -2:
				p.viewDistanceN = -1
				p.viewDistanceP = 2
				p.message("\\c5View distanced toggled to 3x3x3")
				break;
			case -1:
				p.viewDistanceN = -2
				p.viewDistanceP = 3
				p.message("\\c5View distanced toggled to 5x5x5")
				break;
			default:
				p.viewDistanceN = -1
				p.viewDistanceP = 2
				p.message("\\c5View distanced toggled to 3x3x3")
				break;
		}
	}

	if (p.clientType === "Web") {
		switch (p.viewDistanceN) {
			case -8:
				p.viewDistanceN = -1
				p.viewDistanceP = 2
				p.message("\\c5View distanced toggled to 3x3x3")
				break;
			case -1:
				p.viewDistanceN = -2
				p.viewDistanceP = 3
				p.message("\\c5View distanced toggled to 5x5x5")
				break;
			case -2:
				p.viewDistanceN = -3
				p.viewDistanceP = 4
				p.message("\\c5View distanced toggled to 7x7x7")
				break;
			case -3:
				p.viewDistanceN = -4
				p.viewDistanceP = 5
				p.message("\\c5View distanced toggled to 9x9x9")
				break;
			case -4:
				p.viewDistanceN = -5
				p.viewDistanceP = 6
				p.message("\\c5View distanced toggled to 11x11x11")
				break;
			case -5:
				p.viewDistanceN = -6
				p.viewDistanceP = 7
				p.message("\\c5View distanced toggled to 13x13x13")
				break;
			case -6:
				p.viewDistanceN = -7
				p.viewDistanceP = 8
				p.message("\\c5View distanced toggled to 15x15x15")
				break;
			case -7:
				p.viewDistanceN = -8
				p.viewDistanceP = 9
				p.message("\\c5View distanced toggled to 17x17x17")
				break;
			default:
				p.viewDistanceN = -1
				p.viewDistanceP = 2
				p.message("\\c5View distanced toggled to 3x3x3")
				break;
		}
	}
}

function triggerResolution(p) {
	p.socketio.emit("resolution")
}

function bloodInfo(p) {

}

function enterSettings(p) {
	switch (p.clientType) {
		case "Web":
			p.selectorData = settingDataWeb
			p.updateSelector()
			break;
	
		default:
			p.selectorData = settingDataBH
			p.updateSelector()
			break;
	}
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