const prisma = require("../config/prisma")

exports.createUser = async (req, res) => {
    try {
        const {
            id,
            email
        } = req.body

        const user = await prisma.user.create({
            data: {
                id,
                email,
                password: "firebase-auth"
            }
        })

        res.json(user)

    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: "User creation failed"
        })
    }
}