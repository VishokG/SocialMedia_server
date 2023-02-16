const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
    res.send("You are in the auth route");
})

//Registeration
router.post("/register", async (req, res) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userPresent = await User.find({$or: [{email: req.body.email}]});
    console.log(userPresent);

    if(userPresent.length > 0) {
        return res.status(500).send("User with email already exists");
    }

    const newUser = new User({
        ...req.body,
        password: hashedPassword
    });



    await newUser.save();
    return res.status(200).send("User registered successfully");
});

//Login
router.post("/login", async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(404).send("User not found");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send("Wrong Password");

    return res.status(200).json(user);
});

module.exports = router;