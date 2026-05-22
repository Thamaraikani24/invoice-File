const express = require("express");
const router = express.Router();

const invoiceController = require("../controller/invoicecontroller");
const upload = require("../middleware/uploadmiddleware");


// Create invoice with multiple excel files
router.post(
  "/create",
  upload.array("invoiceFiles"),
  invoiceController.createInvoice
);


// Add more files to existing invoice
router.post(
  "/:invoiceId/add-files",
  upload.array("invoiceFiles"),
  invoiceController.addInvoiceFiles
);


// Get invoice details
router.get(
  "/:invoiceId",
  invoiceController.getInvoice
);


// Get all invoice items
router.get(
  "/:invoiceId/items",
  invoiceController.getInvoiceItems
);

module.exports = router;