const { Web3 } = require('web3');

const web3 = new Web3(process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY');

/**
 * Verify wallet signature
 * @param {string} message - Original message that was signed
 * @param {string} signature - Signature from MetaMask
 * @param {string} expectedAddress - Expected wallet address
 * @returns {boolean} - True if signature is valid
 */
async function verifySignature(message, signature, expectedAddress) {
  try {
    // Use web3.eth.accounts.recover instead of personal.ecRecover
    const recoveredAddress = web3.eth.accounts.recover(message, signature);
    
    // Compare addresses (case-insensitive)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

module.exports = {
  web3,
  verifySignature
};
