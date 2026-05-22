const mongoose = require("mongoose");

const uploadedFileSchema = new mongoose.Schema(
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

const invoiceSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);