const { getAuth } = require("../config/firebaseAdmin");

exports.verifyToken = async (req, res, next) => {
try {
    const header = req.headers.authorization;

    if (!header) {
    return res.status(401).json({ error: "No token" });
    }

    const token = header.split(" ")[1];

    const decoded = await getAuth().verifyIdToken(token);

    req.user = decoded; // 🔥 IMPORTANT

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};