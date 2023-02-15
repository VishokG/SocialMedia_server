const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//Update user
router.put("/:id", async (req, res) => {
    if(req.body.userId === req.params.id) { //Changed one thing here compared to video (ifAdmin)
        if(req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        const user = await User.findByIdAndUpdate(req.body.userId, {
            $set: req.body
        })

        return res.status(200).json("Account has been updated");
    } else {
        return res.status(403).json("You can only update your account")
    }
});

//Delete user
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id) { //Changed one thing here compared to video (ifAdmin)
        await User.findOneAndDelete({_id: req.body.userId})

        return res.status(200).json("Account has been deleted");
    } else {
        return res.status(403).json("You can only delete your account")
    }
});

//Get user
router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id); 
    if(!user) return res.status(404).send("User not found");

    return res.status(200).json(user); //Contents of the user object are separated in th YT Video
});

//Follow a user (and Unfollow a user)
router.put("/:id/follow/", async (req, res) => {
    if(req.params.id !== req.body.userId) {
        const user = await User.findById(req.params.id);
        const currUser = await User.findById(req.body.userId);
        if(!user.followers.includes(req.body.userId)) {
            await user.updateOne({$push: {followers: req.body.userId}});
            await currUser.updateOne({$push: {following: req.params.id}});

            return res.status(200).send("You are now following this user");
        } else {
            return res.status(403).send("You already follow this user")
        }
    } else {
        return res.status(400).send("You cannot follow yourself");
    }
})

router.put("/:id/unfollow/", async (req, res) => {
    if(req.params.id !== req.body.userId) {
        const user = await User.findById(req.params.id);
        const currUser = await User.findById(req.body.userId);
        if(user.followers.includes(req.body.userId)) {
            await user.updateOne({$pull: {followers: req.body.userId}});
            await currUser.updateOne({$pull: {following: req.params.id}});

            return res.status(200).send("You have unfollowed this user");
        } else {
            return res.status(403).send("You are not following this user")
        }
    } else {
        return res.status(400).send("You cannot unfollow yourself");
    }
})

//Return friends of user
router.get("/friends/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const friends = await Promise.all(
            user.following.map(friendId => {
                return User.findById(friendId)
            })
        )

        let friendList = [];
        friends.map(friend => {
            const {_id, username, profilePicture} = friend;
            friendList.push({_id, username, profilePicture});
        })
        res.status(200).json(friendList);
    } catch(err) {
        res.status(404).json(err);
    }
})

module.exports = router;