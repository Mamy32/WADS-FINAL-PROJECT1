const express = require("express");
const router = express.Router();

const {
    getAuth
} = require("../config/firebaseAdmin");
const prisma = require("../config/prisma");

router.post("/sync", async (req, res) => {
    try {

        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({
                error: "No token"
            });
        }

        const token = header.split(" ")[1];


        const decoded = await getAuth().verifyIdToken(token);


        const user = await prisma.user.upsert({
            where: {
                id: decoded.uid
            },
            update: {},
            create: {
                id: decoded.uid,
                email: decoded.email || `${decoded.uid}@example.com`,
                password: "firebase-auth",
            },
        });


        res.json(user);

    } catch (error) {
        console.error("❌ ERROR:", error);
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;