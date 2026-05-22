const Joi = require("joi");

const validateInvoice = (data) => {
  const schema = Joi.object({
    invoiceName: Joi.string().trim().required().messages({
      "string.empty": "Invoice name is required",
      "any.required": "Invoice name is required",
    }),

    invoiceNumber: Joi.string().trim().required().messages({
      "string.empty": "Invoice number is required",
      "any.required": "Invoice number is required",
    }),

    invoiceDate: Joi.date().required().messages({
      "date.base": "Invoice date must be valid",
      "any.required": "Invoice date is required",
    }),

    invoiceTo: Joi.string().trim().required().messages({
      "string.empty": "Invoice to is required",
      "any.required": "Invoice to is required",
    }),
  });

  return schema.validate(data);
};

module.exports = validateInvoice;