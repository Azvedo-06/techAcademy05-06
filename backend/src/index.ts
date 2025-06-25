import sequelize from "./config/database";
import app from "./app";

import "./models/AuthorModel";
import "./models/CategoryModel";
import "./models/BookModel";
import "./models/ReviewsModel";

const port = 3000;

async function initializeServer() {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully");

    app.listen(port, () => {
      console.log("Server is running on port:", port);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
}

initializeServer();
