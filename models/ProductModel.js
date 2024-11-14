import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Categories from "./CategoryModel.js";

const { DataTypes } = Sequelize;

const Product = db.define(
  "products",
  {
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name_product: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url1: DataTypes.STRING,
    url2: DataTypes.STRING,
    url3: DataTypes.STRING,
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 255],
      },
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Categories.hasMany(Product);
Product.belongsTo(Categories, { foreignKey: "categoryId" });

export default Product;

(async () => {
  await db.sync();
})();
