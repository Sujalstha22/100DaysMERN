import dotenv from "dotenv";
import connectDB from "./Database/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running in ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed!!!! ", err);
    process.exit(1);
  });
app.get("/", (req, res) => {
  res.send("server is running");
});
