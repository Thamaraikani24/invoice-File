const Invoice = require("../models/invoicemodel");
const InvoiceItem = require("../models/invoiceItemModel");
const validateInvoice = require("../validation/invoiceValidation");
const parseExcelFile = require("../utils/excelParser");
const uploadToS3 = require("../utils/uploadToS3");

// Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const { error } = validateInvoice(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one Excel file is required",
      });
    }

    const {
      invoiceName,
      invoiceNumber,
      invoiceDate,
      invoiceTo,
    } = req.body;

    const existingInvoice = await Invoice.findOne({ invoiceNumber });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: "Invoice number already exists",
      });
    }

    const invoice = await Invoice.create({
      invoiceName,
      invoiceNumber,
      invoiceDate,
      invoiceTo,
    });

    let totalAmount = 0;

    console.log("Files Count:", req.files.length);
    console.log(req.files);

    for (const file of req.files) {
      const items = parseExcelFile(file.buffer);
      console.log("file.buffer:",file.buffer);
      console.log("Parsed Items:", items);

      const itemCount = items.length;

      const fileTotal = items.reduce((sum, item) => {
      console.log("Item Price Check:", item.itemPrice, item["item Price"]);

        return sum + Number(item.itemPrice || item["item Price"] || 0);
      }, 0);

      const uploadedFile = await uploadToS3(file, invoiceNumber);

      const invoiceItems = items.map((item) => ({
          invoiceId: invoice._id,
          serialNum: item.serialNum || item["serial Num"],
          itemName: item.itemName || item["item Name"],
          itemPrice: item.itemPrice || item["item Price"],
}));

      await InvoiceItem.insertMany(invoiceItems);

      invoice.uploadedFiles.push({
        fileName: uploadedFile.fileName,
        fileUrl: uploadedFile.fileUrl,
        fileTotal,
        itemCount,
      });

      totalAmount += fileTotal;
    }

    invoice.totalAmount = totalAmount;

    await invoice.save();

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Add More Files
exports.addInvoiceFiles = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one Excel file is required",
      });
    }

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    let newTotal = 0;

    for (const file of req.files) {
      const items = parseExcelFile(file.buffer);

      console.log("file.buffer:",file.buffer);

      console.log("Parsed Items:", items);

      const itemCount = items.length;

      const fileTotal = items.reduce((sum, item) => {
        console.log("Item price check:", item.itemPrice, item["item Price"]); 
        return sum + Number(item.itemPrice || item["item Price"] || 0);
      }, 0);

      const uploadedFile = await uploadToS3(
        file,
        invoice.invoiceNumber
      );

       const invoiceItems = items.map((item) => ({
          invoiceId: invoice._id,
          serialNum: item.serialNum || item["serial Num"],
          itemName: item.itemName || item["item Name"],
          itemPrice: item.itemPrice || item["item Price"],
}));


      await InvoiceItem.insertMany(invoiceItems);

      invoice.uploadedFiles.push({
        fileName: uploadedFile.fileName,
        fileUrl: uploadedFile.fileUrl,
        fileTotal,
        itemCount,
      });

      newTotal += fileTotal;
    }

    invoice.totalAmount += newTotal;

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Files added successfully",
      data: invoice,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Invoice
exports.getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Invoice Items
exports.getInvoiceItems = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const items = await InvoiceItem.find({ invoiceId });

    return res.status(200).json({
      success: true,
      data: items,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};