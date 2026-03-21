const cloudinary = require("../config/cloudinary");
const fs = require("fs"); // ✅ ADD THIS

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "bikerhub",
      resource_type: "auto"
    });

    // ✅ DELETE TEMP FILE (IMPORTANT)
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      url: result.secure_url
    });

  } catch (error) {
    console.error(error);

    // ⚠️ also delete file if error happens
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

   console.error(error); // 👈 KEEP THIS
res.status(500).json({ error: error.message });
  }
};

exports.uploadMultipleFiles = async (req, res) => {
    console.log("FILES:", req.files);
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: "No files uploaded" });
    }

    const results = await Promise.all(
      req.files.map(file =>
        cloudinary.uploader.upload(file.path, {
          folder: "bikerhub/posts",
          resource_type: "auto"
        })
      )
    );

    // delete temp files
    req.files.forEach(file => fs.unlinkSync(file.path));

    const media = results.map(item => ({
      url: item.secure_url,
      public_id: item.public_id,
      type: item.resource_type
    }));

    res.json({
      success: true,
      media
    });

  } catch (error) {
    console.error(error);

    if (req.files) {
      req.files.forEach(file => {
        if (file.path) fs.unlinkSync(file.path);
      });
    }

    console.error(error); // 👈 KEEP THIS
res.status(500).json({ error: error.message });
  }
};

exports.uploadProfilePic = async (req, res) => {
  try {
    const user = req.user; // assuming auth middleware

    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // delete old profile pic
    if (user.profilePic?.public_id) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "bikerhub/profile"
    });

    fs.unlinkSync(req.file.path);

    user.profilePic = {
      url: result.secure_url,
      public_id: result.public_id
    };

    await user.save();

    res.json({
      success: true,
      profilePic: user.profilePic
    });

  } catch (error) {
    console.error(error);

    if (req.file?.path) fs.unlinkSync(req.file.path);

    console.error(error); // 👈 KEEP THIS
res.status(500).json({ error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { public_id, type } = req.body;

    await cloudinary.uploader.destroy(public_id, {
      resource_type: type || "image"
    });

    res.json({ success: true, msg: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};