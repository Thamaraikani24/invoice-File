const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },

    serialNum: {
      type: Number,
      required: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    itemPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InvoiceItem", invoiceItemSchema);