const { resolve } = require("path")

const nh = require("node-hill")

nh.startServer({
	webPort: 1337,

	mapDirectory: "./bricks/",

	sepraType: "regular", // regular, chaotic

	builderPermissionKey: "builder",
	// Discord bot
	botChannel: "",
	botToken: null,

	scripts: "./user_scripts",
	map: "lobby.brk",
	// VM escaping nonsense.
	sandbox: {
		// Older version
		sepragame: require("./user_scripts/sepragame/main.js"),
		express: require("express"),
		io: require("socket.io"),
	},
	modulePath: resolve(process.cwd(), "./user_scripts/sepragame/main.js"),
	modules: [resolve(process.cwd(), "./user_scripts/sepragame/main.js"), "express", "socket.io", "http"], // Latest
	// Irrelevant. Brick Hill was shut down.
	postServer: false,
	gameId: 16063,
	local: true,
	port: 4040,
	hostKey: "",
	cheatsAdmin: {
		admins: [1],
		audit: true,
		safeCommands: false,
	},
})
