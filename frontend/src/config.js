const config = {
  contracts: {
    IYKESOL: {
      sepolia: process.env.REACT_APP_CONTRACT_ADDRESS || '0x...',
      mainnet: '0x...'
    }
  },
  
  networks: {
    sepolia: {
      chainId: '0xaa36a7',
      chainIdDecimal: 11155111,
      chainName: 'Sepolia Testnet',
      rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/a3S4ZuzJlFPna9DOLQ4oO'],
      blockExplorerUrls: ['https://sepolia.etherscan.io']
    },
    mainnet: {
      chainId: '0x1',
      chainIdDecimal: 1,
      chainName: 'Ethereum Mainnet',
      rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY'],
      blockExplorerUrls: ['https://etherscan.io']
    }
  },
  
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  currentNetwork: process.env.REACT_APP_NETWORK || 'sepolia'
};

export default config;
