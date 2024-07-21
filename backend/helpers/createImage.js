const fs = require("fs");
const path = require("path");

function createImage(req) {
  const uploadDir = path.join(__dirname, "..", "uploads");

  // id.ext ->111.png ->uploads
  const newPath = path.join(
    uploadDir,
    `${req.body.id}.${path.extname(req.uploadedImageName).slice(1)}`
  );

  try {
    fs.renameSync(req.uploadedImageFilePath, newPath);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = createImage;
