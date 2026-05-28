const mongoose = require("mongoose");

const uploadedFileSchema = new mongoose.Schema(    //uploaded file schema
  {
    fileName: {
      type: String,
      required: true,
      trim: true,                
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileTotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    itemCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const historySchema = new mongoose.Schema(    // history schema to track invoice actions
  {
    action: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    actionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(    // main invoice schema
  {
    invoiceName: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
    },
    invoiceTo: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedFiles: {
      type: [uploadedFileSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    history: {
  type: [historySchema],   // array of history entries to track changes and actions on the invoice
  default: [],
},
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);