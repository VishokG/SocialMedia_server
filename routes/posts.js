const Post = require("../models/Post");
const User = require("../models/User");
const router = require("express").Router();

//Create post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(200).send("Post created");
});

//Update post
router.put("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId) {
        await post.updateOne({$set: req.body});
        res.status(200).send("Post updated");
    } else {
        return res.status(403).send("You can update only your post(s)")
    }
});

//Delete post
router.delete("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId) {
        await post.deleteOne();
        res.status(200).send("Post deleted");
    } else {
        return res.status(403).send("You can delete only your post(s)")
    }
});

//Like/Dislike post
router.put("/:id/like", async (req, res) => {
    const post = await Post.findById(req.params.id);
    if(post.likes.includes(req.body.userId)) {
        await post.updateOne({$pull: {likes: req.body.userId}});
        res.status(200).send("Post has been unliked");
    } else {
        await post.updateOne({$push: {likes: req.body.userId}});
        res.status(200).send("Post has been liked");
    }
});

//Get post
router.get("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
});

//Get posts in timeline
router.get("/timeline/:userId", async (req, res) => {
    const currUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({userId: currUser._id});
    const friendPosts = await Promise.all(
        currUser.following.map((friendId) => {
            return Post.find({userId: friendId});
        })
    );
    console.log(friendPosts);
    res.json(userPosts.concat(...friendPosts));
});

//Get posts posted by a user
router.get("/profile/:userId", async (req, res) => {
    const currUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({userId: currUser._id});
    
    res.json(userPosts);
});

module.exports = router;