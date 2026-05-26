const Invoice = require("../models/invoicemodel");
const InvoiceItem = require("../models/invoiceitemmodel");
const validateInvoice = require("../validation/invoiceValidation");
const parseExcelFile = require("../utils/excelParser");
const uploadToS3 = require("../utils/uploadToS3");

// Create Invoice
exports.createInvoice = async (req, res) => {
  let totalAmount = 0;
let allInvoiceItems = [];
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
    } = req.body || {};
    
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
      history: [
        {
          action: "Created",
          note: "Invoice created successfully",
        },
      ],
    });

    // let totalAmount = 0;

    for (const file of req.files) {
  const items = parseExcelFile(file.buffer);

  const itemCount = items.length;

  const invoiceItems = items.map((item) => ({
    invoiceId: invoice._id,
    itemData: item,
  }));

  const savedItems = await InvoiceItem.insertMany(invoiceItems);

  allInvoiceItems.push(...savedItems);

 const fileTotal = items.reduce((sum, item) => {
  const keys = Object.keys(item);

  const amountKey = keys.find((key) => {
    const lowerKey = key.toLowerCase();
    return (
      lowerKey.includes("price") ||
      lowerKey.includes("amount") ||
      lowerKey.includes("total")
    );
  });


  return sum + Number(item[amountKey] || 0);
}, 0);
  const uploadedFile = await uploadToS3(file, invoiceNumber);

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
  data: {
    ...invoice.toObject(),
    items: allInvoiceItems,
  },
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
    const files = req.files;

    console.log("invoiceId:", invoiceId);

    if (!files || files.length === 0) {
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

    for (const file of files) {
      const items = parseExcelFile(file.buffer);
       console.log("FULL ITEMS:", JSON.stringify(items, null, 2));  //

      const itemCount = items.length;

      const fileTotal = items.reduce((sum, item) => {
  const keys = Object.keys(item);

  const amountKey = keys.find((key) => { 
    const lowerKey = key.toLowerCase().trim();
    return (
      lowerKey.includes("price") ||
      lowerKey.includes("amount") ||
      lowerKey.includes("total")
    );
  });

  if (!amountKey) return sum;

  let amount = item[amountKey];

  if (typeof amount === "string") {
    amount = amount.replace(/,/g, "").trim();
  }

  amount = Number(amount) || 0;

  return sum + amount;
}, 0);

      const uploadedFile = await uploadToS3(
        file,
        invoice.invoiceNumber
      );

      const invoiceItems = items.map((item) => ({
        invoiceId: invoice._id,
        itemData: item,
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

invoice.totalAmount = (invoice.totalAmount || 0) + newTotal;
    invoice.history.push({
      action: "Files Added",
      note: `${files.length} file(s) uploaded`,
    });

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
// Update Invoice
exports.updateInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { invoiceName, invoiceDate, invoiceTo } = req.body;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (invoiceName) {
      invoice.invoiceName = invoiceName;
    }

    if (invoiceDate) {
      invoice.invoiceDate = invoiceDate;
    }

    if (invoiceTo) {
      invoice.invoiceTo = invoiceTo;
    }

    const invoiceItems = await InvoiceItem.find({
      invoiceId: invoice._id,
    });

    let totalAmount = 0;

    for (const item of invoiceItems) {
      const amountKey = Object.keys(item.itemData).find((key) => {
        const lowerKey = key.toLowerCase();

        return (
          lowerKey.includes("price") ||
          lowerKey.includes("amount") ||
          lowerKey.includes("total")
        );
      });

      if (amountKey) {
        totalAmount += Number(item.itemData[amountKey] || 0);
      }
    }

    invoice.totalAmount = totalAmount;

    invoice.history.push({
      action: "Updated",
      note: "Invoice details updated",
    });

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    await InvoiceItem.deleteMany({
      invoiceId: invoice._id,
    });

    await Invoice.findByIdAndDelete(invoiceId);

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Invoice with Items
exports.getSingleInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const invoiceItems = await InvoiceItem.find({
      invoiceId: invoice._id,
    });

    let totalAmount = 0;

for (const item of invoiceItems) {
  const amountKey = Object.keys(item.itemData).find((key) => {
    const lowerKey = key.toLowerCase();

    return (
      lowerKey.includes("price") ||
      lowerKey.includes("amount") ||
      lowerKey.includes("total")
    );
  });

  if (amountKey) {
    totalAmount += Number(item.itemData[amountKey] || 0);
  }
}

    return res.status(200).json({
      success: true,
      message: "Invoice fetched successfully",
      data: {
  ...invoice.toObject(),
  totalAmount,
  items: invoiceItems,
}
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

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const items = await InvoiceItem.find({ invoiceId });

    return res.status(200).json({
      success: true,
      totalAmount: invoice.totalAmount,
      itemCount: items.length,
      data: items,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Invoices with Items
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });

    const invoiceData = await Promise.all(
      invoices.map(async (invoice) => {
        const items = await InvoiceItem.find({
          invoiceId: invoice._id,
        });

        return {
          ...invoice.toObject(),
          items,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: invoiceData.length,
      data: invoiceData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDeletedInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      isDeleted: true,
    });

    return res.status(200).json({
      success: true,
      data: invoices,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};