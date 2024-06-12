var fs = require('fs');
var maxrects = require('maxrects-packer');
var Jimp = require("jimp")
var deasync = require("deasync")
let MaxRectsPacker = maxrects.MaxRectsPacker;
var PNG = require('pngjs').PNG;

const asset_path = "sprites/"
const options = {
    smart: true,
    pot: true,
    square: true,
    allowRotation: false,
    tag: true,
    border: 0
}; // Set packing options
let packer = new MaxRectsPacker(1024, 1024, 0, options)

let animData = {
	anims: {}
}
let saved_pngs = {}
let ssWidth = 0
let ssHeight = 0

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function askName() {
	readline.question('Animation name: ', name => {
		animData.anims[name] = {
			name: name,
			loop: true,
			fps: 1,
			frames: []
		}
		saved_pngs[name] = []
		askFPS(name);
	});
}


function askFPS(name) {
	readline.question('FPS: ', _fps => {
		var fps = parseInt(_fps);
		if (isNaN(fps)) {
			console.log("Invalid number, try again!");
			askFPS(name);
			return;
		}
		animData.anims[name].fps = fps
		askLoop(name)
	});
}

function askLoop(name) {
	readline.question('Does your animation loop? (1 for Yes): ', _loop => {
		const loop = parseInt(_loop)
		if (loop == 1)
			animData.anims[name].loop = true
	
		listSprites(name)
	})
}

function listSprites(name) {
	readline.question('List your sprites, seperate each new directory with a semicolon: ', sprnames => {
		let files = sprnames.split(';').map(str => str.trim());
		let anim = animData.anims[name]
		for (const i in files) {
			var img = deasync(Jimp.read)(`${asset_path}${files[i]}.png`)
			packer.add({
				width: img.bitmap.width,
				height: img.bitmap.height,
				frame: i,
				name: name
			})
			saved_pngs[name][i] = img
		}
		reloadSpriteData();
		listMoreOrNo();
	})
}

function listMoreOrNo() {
	readline.question('Wanna list more sprites? (1 for Yes): ', option => {
		var num = parseInt(option)
		if (option == 1) {
			askName();
			return;
		}
		saveSpriteSheet();
		readline.close();
	})
}

function saveSpriteSheet() {
	var spritesheet = new Jimp(ssWidth, ssHeight, (err, sheet) => {
		if (err) console.log(err);
		Object.keys(animData.anims).forEach(name => {
			const anim = animData.anims[name]
			for (const i in anim.frames) {
				sheet.composite(saved_pngs[anim.name][i], anim.frames[i].x, anim.frames[i].y)
			}
		})
		spritesheet.write("test2.png")
	})
	var json = JSON.stringify(animData)
	fs.writeFile("test.json", json, err => {})
}

function reloadSpriteData() {
	ssWidth = 0
	ssHeight = 0
	
	packer.bins.forEach(bin => {
	    bin.rects.forEach(rect => {
	    	animData.anims[rect.name].frames[rect.frame] = {
	    		x: rect.x,
	    		y: rect.y,
	    		w: rect.width,
	    		h: rect.height
	    	}
	    	if (rect.x+rect.width > ssWidth)
	    		ssWidth = rect.x+rect.width;
	    	if (rect.y+rect.height > ssHeight)
	    		ssHeight = rect.y+rect.height;
	    })
	});
}
askName();