import { Sequelize } from "sequelize";

const db = new Sequelize("finalproject", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
