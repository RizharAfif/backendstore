import Category from "../models/CategoryModel.js";
import path from "path";
import fs from "fs";

export const getCategories = async (req, res) => {
  try {
    const response = await Category.findAll();
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const getCategoriesById = async (req, res) => {
  try {
    const response = await Category.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const saveCategory = (req, res) => {
  if (req.file === null) return res.status(400).json({ msg: "No file uploaded" });
  const name = req.body.title;
  const file = req.files.file; //req.files.file file dan title harus sama dengan client
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = [".jpg", ".jpeg", ".png"];

  if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "Invalid file type" });
  if (fileSize > 5000000) return res.status(422).json({ msg: "Image must be less than 5mb" });

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });
    try {
      await Category.create({
        name: name,
        image: fileName,
        url: url,
      });
      res.status(201).json({ msg: "Category saved successfully" });
    } catch (error) {
      console.log(error.message);
    }
  });
};

// update category
export const updateCategory = async (req, res) => {
  const category = await Category.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!category) return res.status(404).json({ msg: "Category not found" });

  let fileName = category.image; // Default to existing image
  if (req.files && req.files.file) {
    // Check if file is uploaded
    const file = req.files.file;
    const fileSize = file.data.length; // Ensure file is defined
    const ext = path.extname(file.name);
    fileName = file.md5 + ext; // Generate new file name
    const allowedType = [".png", ".jpg", ".jpeg"];

    if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "Invalid Images" });
    if (fileSize > 5000000) return res.status(422).json({ msg: "Image must be less than 5 MB" });

    // Delete old image
    const filePath = `./public/images/${category.image}`;
    fs.unlinkSync(filePath);

    // Move new file
    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });
  }

  const name = req.body.title; // Get the new name from the request body
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

  try {
    await Category.update(
      { name: name, image: fileName, url: url },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json({ msg: "Category Updated Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Failed to update category" });
  }
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!category) return res.status(404).json({ msg: "Category not found" });
  try {
    const filePath = `./public/images/${category.image}`; // image ada di database sesuai database
    fs.unlinkSync(filePath);
    await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Category deleted successfully" });
  } catch (error) {
    console.log(error.message);
  }
};
