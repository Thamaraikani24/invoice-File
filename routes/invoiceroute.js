const express = require("express");
const router = express.Router();

const invoiceController = require("../controller/invoicecontroller");
const upload = require("../middleware/uploadmiddleware");


// Create invoice
router.post(
  "/create",
  upload.array("invoiceFiles"),
  invoiceController.createInvoice
);

// Get all invoices
router.get(
  "/invoices",
  invoiceController.getAllInvoices
);

// Add files
router.post(
  "/:invoiceId/add-files",
  upload.array("invoiceFiles"),
  invoiceController.addInvoiceFiles
);

// Get invoice items
router.get(
  "/:invoiceId/items",
  invoiceController.getInvoiceItems
);

// Get single invoice
router.get(
  "/:invoiceId",
  invoiceController.getInvoice
);
module.exports = router;