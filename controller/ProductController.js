import Product from "../models/ProductModel.js";
import Categories from "../models/CategoryModel.js";
import path from "path";
import fs from "fs";

// get all products from the database
export const getProducts = async (req, res) => {
  try {
    const response = await Product.findAll({
      include: [
        {
          model: Categories,
          attributes: ["name"], // hanya ambil field 'name' dari tabel kategori
        },
      ],
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Failed to fetch products" });
  }
};

// get product by id
export const getProductsById = async (req, res) => {
  try {
    const response = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!response) return res.status(404).json({ msg: "Product not found" });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

// create a new product
export const saveProduct = async (req, res) => {
  const { name_product, categoryId, description, stockQuantity, price } = req.body;
  const files = req.files.files; // Pastikan ini adalah array file

  if (!files || files.length < 3) return res.status(400).json({ msg: "Please upload at least 3 images" });

  const allowedType = [".jpg", ".jpeg", ".png"];
  const urls = [];
  const fileNames = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileSize = file.data.length;
    const ext = path.extname(file.name);

    if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: `Invalid file type in image ${i + 1}` });
    if (fileSize > 5000000) return res.status(422).json({ msg: "Image must be less than 5mb" });

    const fileName = file.md5 + ext; // Generate unique file name
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`; // URL untuk gambar

    // Pindahkan file ke direktori yang diinginkan
    await new Promise((resolve, reject) => {
      file.mv(`./public/product_images/${fileName}`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    fileNames.push(fileName);
    urls.push(url);
  } // end for loop

  try {
    await Product.create({
      name_product,
      image1: fileNames[0],
      image2: fileNames[1],
      image3: fileNames[2],
      url1: urls[0],
      url2: urls[1],
      url3: urls[2],
      categoryId,
      description,
      stockQuantity,
      price,
    });
    res.status(201).json({ msg: "Product saved successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Failed to save product" });
  }
};

/// update product
export const updateProduct = async (req, res) => {
  // Cari produk berdasarkan ID
  const product = await Product.findOne({
    where: {
      id: req.params.id,
    },
  });

  // Jika produk tidak ditemukan, kirim respon 404
  if (!product) return res.status(404).json({ msg: "Product not found" });

  const { name_product, categoryId, description, stockQuantity, price } = req.body;

  // Definisikan variabel default dari database
  let fileNames = [product.image1, product.image2, product.image3];
  let urls = [product.url1, product.url2, product.url3];

  // Periksa apakah ada file yang diunggah
  if (req.files) {
    const allowedType = [".jpg", ".jpeg", ".png"];

    // Jika hanya satu file yang diupload
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];

    // Loop melalui file yang diunggah
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileSize = file.data.length;
      const ext = path.extname(file.name);

      // Validasi tipe dan ukuran file
      if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: `Invalid file type in image ${i + 1}` });
      if (fileSize > 5000000) return res.status(422).json({ msg: "Image must be less than 5 MB" });

      // Tentukan index file yang akan diupdate (sesuai nama input file)
      const fileIndex = parseInt(file.name.match(/\d+/)) - 1; // misalnya: "image1", "image2", "image3"

      // Hapus file gambar lama jika ada
      if (fileNames[fileIndex]) {
        const filePath = `./public/product_images/${fileNames[fileIndex]}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Simpan file baru
      const newFileName = file.md5 + ext;
      file.mv(`./public/product_images/${newFileName}`, (err) => {
        if (err) return res.status(500).json({ msg: err.message });
      });

      // Update array fileNames dan urls
      fileNames[fileIndex] = newFileName;
      urls[fileIndex] = `${req.protocol}://${req.get("host")}/product_images/${newFileName}`;
    }
  }

  try {
    // Update produk di database
    await Product.update(
      {
        name_product,
        image1: fileNames[0],
        image2: fileNames[1],
        image3: fileNames[2],
        url1: urls[0],
        url2: urls[1],
        url3: urls[2],
        categoryId,
        description,
        stockQuantity,
        price,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json({ msg: "Product updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Failed to update product" });
  }
};

// delete product
export const deleteProduct = async (req, res) => {
  const product = await Product.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!product) return res.status(404).json({ msg: "Product not found" });

  try {
    //delete images
    const filePaths = [`../public/product_images/${product.image1}`, `../public/product_images/${product.image2}`, `../public/product_images/${product.image3}`];

    filePaths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
  }
};
