let grass = {
	// Grass/sand sounding.
	1: "/sounds/step/g-step1.mp3",
	2: "/sounds/step/g-step2.mp3",
	3: "/sounds/step/g-step3.mp3",
}
let stone = {
	// Clawed feet on stone.
	1: "/sounds/step/s-step-f1.mp3",
	2: "/sounds/step/s-step-f2.mp3",
	3: "/sounds/step/s-step-f3.mp3",
}
let metal = {
	// Clawed feet on metal.
	1: "/sounds/step/m-step-f1.mp3",
	2: "/sounds/step/m-step-f2.mp3",
	3: "/sounds/step/m-step-f3.mp3",
}
let bits = {
	// Clawed feet on void.
	1: "/sounds/step/v-step-f1.mp3",
	2: "/sounds/step/v-step-f2.mp3",
	3: "/sounds/step/v-step-f3.mp3",
}

let collection = {
	default: grass,
	1: stone, // Maroon
	2: grass, // Green
	8: stone, // Grey
	245: stone, // Also grey
	238: stone, // Also grey
	239: metal, // Grey but darker
	15: stone, // Bones
	16: bits,
}

module.exports = collection
