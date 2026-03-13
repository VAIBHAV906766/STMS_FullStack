const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const payInvoice = asyncHandler(async (req, res) => {
  const { invoiceId, paymentMode } = req.body;
  const parsedInvoiceId = Number(invoiceId);

  if (Number.isNaN(parsedInvoiceId)) {
    res.status(400);
    throw new Error('Invoice ID is required and must be valid.');
  }

  if (!paymentMode) {
    res.status(400);
    throw new Error('Payment mode is required.');
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: parsedInvoiceId }
  });

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found.');
  }

  if (invoice.customerId !== req.user.id) {
    res.status(403);
    throw new Error('You can only pay your own invoices.');
  }

  if (invoice.status === 'PAID') {
    res.status(409);
    throw new Error('Invoice is already paid.');
  }

  const amount = invoice.totalAmount;

  const [payment, updatedInvoice] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount,
        paymentMode
      }
    }),
    prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'PAID' }
    })
  ]);

  res.status(201).json({
    message: 'Payment recorded successfully.',
    payment,
    invoice: updatedInvoice
  });
});

module.exports = {
  payInvoice
};
