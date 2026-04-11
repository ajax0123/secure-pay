const { decrypt } = require('./utils/encryption');

const senderEncrypted = 'b0447f721d6b5eb4161a8598:1cd0834c0837449968a73d350e69eb3d:13884282';
const receiverEncrypted = '03b2f01412dfcf870c391434:94d45a5f9183399160aa89557f249051:b1931d1ee3';

console.log('sender:', decrypt(senderEncrypted));
console.log('receiver:', decrypt(receiverEncrypted));
