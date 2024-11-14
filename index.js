import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import CategoryRoute from "./routes/CategoryRoute.js";
import ProductRoute from "./routes/ProductRoute.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));
app.use(CategoryRoute);
app.use(ProductRoute);

app.listen(5000, () => console.log("Server started on port 5000"));
