const { Web3 } = require('web3');

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);

// ERC20 ABI (minimal - just what we need)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  }
];

/**
 * Get IYKESOL token balance for a wallet
 */
async function getTokenBalance(walletAddress) {
  try {
    console.log('Fetching balance for:', walletAddress);
    console.log('Contract address:', process.env.IYKESOL_CONTRACT_ADDRESS);
    
    const contract = new web3.eth.Contract(
      ERC20_ABI,
      process.env.IYKESOL_CONTRACT_ADDRESS
    );

    const balance = await contract.methods.balanceOf(walletAddress).call();
    const decimals = await contract.methods.decimals().call();
    
    console.log('Raw balance:', balance);
    console.log('Decimals:', decimals);
    
    // Convert from wei to human-readable format
    const balanceInTokens = Number(balance) / Math.pow(10, Number(decimals));
    
    console.log('Balance in tokens:', balanceInTokens);
    
    return balanceInTokens;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

module.exports = {
  getTokenBalance
};
