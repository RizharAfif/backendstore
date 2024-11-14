import express from "express";
import { getCategories, getCategoriesById, saveCategory, updateCategory, deleteCategory } from "../controller/CategoryController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/categories/:id", getCategoriesById);
router.post("/categories", saveCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
