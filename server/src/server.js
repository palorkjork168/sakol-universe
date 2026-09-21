require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");
const seedRoles = require("./database/seedRoles");

require("./models");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully!");

    await sequelize.sync();

    console.log("Database models synchronized!");

    await seedRoles();

    app.listen(PORT, () => {
      console.log(`Sakol Universe API running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Unable to connect to the database:",
      error.message
    );
  }
};

startServer();