class WorldObject {
	constructor(type, humanName) {
		this.id
		this.name = humanName || "a Object"
		this.objectName = type
		this.version = 1
		this.id = [...Array(9)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
		switch (type) {
			case "timetrial":
				this.enabled = false
				this.startPosition = templateVector3()
				this.endPosition = templateVector3()
				this.name = humanName || "a Time Trial"
				this.startMessage = "Good luck!"
				this.leaderboard = []
				this.checkpoints = []
				this.breadcrumbs = []
				this.loseRadius = 350
				break;
			case "landmark":
				this.name = humanName || "a Landmark"
				this.description = "A nice view!"
				this.position = templateVector3()
				this.isRespawnPoint = false
				this.activationRadius = 100
				break;
			case "portal":
				this.name = humanName || "a Portal"
				this.manual = false
				this.description = "To somewhere!"
				this.position = templateVector3()
				this.toPosition = templateVector3()
				this.activationRadius = 12
				break;
			default:
				break;
		}
	}
}

function templateVector3() {
	return { x: 0, y: 0, z: 0 }
}

module.exports = WorldObject