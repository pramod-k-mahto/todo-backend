const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));

const pool = mysql.createPool({
  connectionLimit: 10,
  multipleStatements: true,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
const createTable = () => {
  pool.query(
    "CREATE TABLE IF NOT EXISTS todolist (idtodolist INT AUTO_INCREMENT PRIMARY KEY, list VARCHAR(255), date DATE)",
    (createTableError, createTableResult) => {
      if (createTableError) {
        console.error(
          "Error creating todolist table:",
          createTableError.message
        );
        return;
      }

      console.log('Table "todolist" created or already exists');
    }
  );
};

createTable();

app.get("/todolist", (req, res) => {
  pool.query("SELECT * FROM todolist", (error, rows) => {
    if (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(rows);
    }
  });
});

app.post("/todolist", (req, res) => {
  const { list } = req.body;
  const currentDate = new Date().toISOString().slice(0, 10);

  const sql = "INSERT INTO todolist (list, date) VALUES (?, ?)";
  const values = [list, currentDate];

  pool.query(sql, values, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to add list" });
    } else {
      console.log("Insertion successful");
      res.json({ status: 200 });
    }
  });
});

app.delete("/todolist/:id", (req, res) => {
  const itemId = req.params.id;

  const sql = "DELETE FROM todolist WHERE idtodolist = ?";
  pool.query(sql, [itemId], (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("Deletion successful");
      res.send("Deleted successfully");
    }
  });
});

app.listen(PORT, () => {
  console.log(`App is listening at port number http://localhost:${PORT}`);
});
