require("dotenv").config();
const express = require("express");
//const dotenv = require("dotenv");
const connectDB = require("./config/db");
const invoiceRoutes = require("./routes/invoiceroute");

//equire("dotenv").config();
connectDB();

const app = express();

app.use(express.json());
app.use("/api/invoice", invoiceRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
