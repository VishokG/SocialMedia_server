const express = require("express");
const app = express();
const port = process.env.PORT || 2727;
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");

//Route imports
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

dotenv.config();

//MongoDB Connection
mongoose.connect(process.env.MONGO_URL, () => {
    console.log("Connected to MongoDB Atlas");
})

//Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

//Routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});