const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },

     itemData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);
  

module.exports = mongoose.model("InvoiceItem", invoiceItemSchema);