// Module: receiptService | Responsibility: Generate PDF transaction receipts for wallet transfers.
const PDFDocument = require('pdfkit');
const Transaction = require('../models/Transaction');
const { decrypt } = require('../utils/encryption');

const generateReceipt = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId)
    .populate('sender', 'name email name_encrypted email_encrypted')
    .populate('receiver', 'name email name_encrypted email_encrypted')
    .lean();

  if (!transaction) {
    throw new Error('Transaction not found.');
  }

  const senderName = transaction.sender?.name_encrypted
    ? decrypt(transaction.sender.name_encrypted)
    : transaction.sender?.name;
  const senderEmail = transaction.sender?.email_encrypted
    ? decrypt(transaction.sender.email_encrypted)
    : transaction.sender?.email;
  const receiverName = transaction.receiver?.name_encrypted
    ? decrypt(transaction.receiver.name_encrypted)
    : transaction.receiver?.name;
  const receiverEmail = transaction.receiver?.email_encrypted
    ? decrypt(transaction.receiver.email_encrypted)
    : transaction.receiver?.email;

  const payload = JSON.parse(decrypt(transaction.encrypted_payload));
  const when = new Date(transaction.timestamp || Date.now());

  const doc = new PDFDocument({ margin: 40 });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));

  doc.fontSize(18).text('Digital Wallet Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Transaction ID: ${transaction._id}`);
  doc.text(`Sender : ${senderName || 'N/A'} (${senderEmail || 'N/A'})`);
  doc.text(`Receiver : ${receiverName || 'N/A'} (${receiverEmail || 'N/A'})`);
  doc.text(`Amount : ${transaction.amount}`);
  doc.text(`Date : ${when.toLocaleDateString('en-IN')}`);
  doc.text(`Time : ${when.toLocaleTimeString('en-IN')}`);
  doc.text(`Status : ${transaction.status}`);
  doc.moveDown();
  doc.text(`Encrypted Payload Reference: ${payload.reference || 'N/A'}`);
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
};

module.exports = {
  generateReceipt
};
