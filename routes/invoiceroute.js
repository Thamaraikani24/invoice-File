const express = require("express");
const router = express.Router();

const invoiceController = require("../controller/invoicecontroller");
const upload = require("../middleware/uploadmiddleware");

router.post(
  "/create",
  upload.array("invoiceFiles"),
  invoiceController.createInvoice
);

router.get(
  "/invoices",
  invoiceController.getAllInvoices
);

router.post(
  "/:invoiceId/add-files",
  upload.array("invoiceFiles"),
  invoiceController.addInvoiceFiles
);

router.get(
  "/:invoiceId/items",
  invoiceController.getInvoiceItems
);

router.get(
  "/:id",
  invoiceController.getSingleInvoice
);

router.put(
  "/:id",
  upload.array("invoiceFiles"),
  invoiceController.updateInvoice
);

router.delete(
  "/:id",
  invoiceController.deleteInvoice
);

module.exports = router;