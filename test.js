const fs = require("fs")
const gm = require("gm")

// creating an image
gm(200, 400, "#ddff99f3")
.drawText(10, 50, "from scratch")
.write("mama.jpg", function (err) {
  // ...
});