import Web3 from 'web3';
import config from '../config';


class Web3Service {
  constructor() {
    this.web3 = null;
    this.contract = null;
  }


  async initialize() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      const networkId = config.currentNetwork;
      const contractAddress = config.contracts.IYKESOL[networkId];
      
      // Only load contract if address is valid
      if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000' && contractAddress.startsWith('0x') && contractAddress.length === 42) {
        try {
          const IYKESOLAbi = require('../contracts/IYKESOL.json');
          this.contract = new this.web3.eth.Contract(
            IYKESOLAbi.abi,
            contractAddress
          );
        } catch (error) {
          console.log('Contract ABI not found or invalid');
        }
      }
    }
  }


  async getBalance(address) {
    if (!this.contract) await this.initialize();
    if (!this.contract) return '0';
    
    try {
      const balance = await this.contract.methods.balanceOf(address).call();
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Balance fetch error:', error);
      return '0';
    }
  }


  async transfer(from, to, amount) {
    if (!this.contract) await this.initialize();
    if (!this.contract) throw new Error('Contract not loaded');
    
    const amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
    
    // Estimate gas
    const gasEstimate = await this.contract.methods
      .transfer(to, amountInWei)
      .estimateGas({ from });
    
    // Convert BigInt to Number before calculation
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
    
    const receipt = await this.contract.methods
      .transfer(to, amountInWei)
      .send({
        from,
        gas: gasLimit
      });
    
    return receipt;
  }


  async getTotalSupply() {
    if (!this.contract) await this.initialize();
    if (!this.contract) return '0';
    
    try {
      const supply = await this.contract.methods.totalSupply().call();
      return this.web3.utils.fromWei(supply, 'ether');
    } catch (error) {
      console.error('Total supply fetch error:', error);
      return '0';
    }
  }


  async getTotalBurned() {
    if (!this.contract) await this.initialize();
    if (!this.contract) return '0';
    
    try {
      const burned = await this.contract.methods.totalBurned().call();
      return this.web3.utils.fromWei(burned, 'ether');
    } catch (error) {
      console.error('Total burned fetch error:', error);
      return '0';
    }
  }


  async getBurnPercentage() {
    if (!this.contract) await this.initialize();
    if (!this.contract) return 0;
    
    try {
      const percentage = await this.contract.methods.burnPercentage().call();
      return Number(percentage) / 100;
    } catch (error) {
      console.error('Burn percentage fetch error:', error);
      return 0;
    }
  }
}


export default new Web3Service();
