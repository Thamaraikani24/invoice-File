const express = require("express");
const router = express.Router();

const invoiceController = require("../controller/invoicecontroller");
const upload = require("../middleware/uploadmiddleware");

router.post(
  "/create",
  upload.array("invoiceFiles"),
  invoiceController.createInvoice      // create invoice with multiple files
);

router.get(
  "/invoices",
  invoiceController.getAllInvoices   // get all invoices
);

router.post(
  "/:invoiceId/add-files",
  upload.array("invoiceFiles"),
  invoiceController.addInvoiceFiles   // add more files to existing invoice
);

router.get(
  "/:invoiceId/items",
  invoiceController.getInvoiceItems   // get items for a specific invoice
);

router.get(
  "/:invoiceId",
  invoiceController.getSingleInvoice    // get single invoice with items
);

router.put(
  "/:invoiceId",
  upload.array("invoiceFiles"),
  invoiceController.updateInvoice    // update invoice
);

router.delete(
  "/:invoiceId",
  invoiceController.deleteInvoice   // delete invoice
);

module.exports = router;