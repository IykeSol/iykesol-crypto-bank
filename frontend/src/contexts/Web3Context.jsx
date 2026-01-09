import React, { createContext, useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import config from '../config';


export const Web3Context = createContext();


export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);


  const loadContract = useCallback(async (web3Instance) => {
    try {
      const contractABI = require('../contracts/IYKESOL.json');
      const networkId = config.currentNetwork;
      const contractAddress = config.contracts.IYKESOL[networkId];
      
      if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
        const contractInstance = new web3Instance.eth.Contract(
          contractABI.abi,
          contractAddress
        );
        setContract(contractInstance);
      }
    } catch (error) {
      console.error('Error loading contract:', error);
    }
  }, []);


  const disconnectWallet = useCallback(() => {
    setWeb3(null);
    setAccount(null);
    setContract(null);
    setIsConnected(false);
    setChainId(null);
  }, []);


  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  }, [disconnectWallet]);


  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);


  const setupListeners = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  }, [handleAccountsChanged, handleChainChanged]);


  const checkConnection = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        const currentChainId = await web3Instance.eth.getChainId();
        
        if (accounts.length > 0) {
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setChainId(Number(currentChainId));
          setIsConnected(true);
          loadContract(web3Instance);
        }
      } catch (error) {
        console.error('Connection check error:', error);
      }
    }
  }, [loadContract]);


  useEffect(() => {
    checkConnection();
    setupListeners();
  }, [checkConnection, setupListeners]);


  const switchNetwork = async () => {
    const network = config.networks[config.currentNetwork];
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [network],
        });
      }
    }
  };


  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        alert('Please install MetaMask to use this feature');
        return null;
      }


      const web3Instance = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const currentChainId = await web3Instance.eth.getChainId();
      const expectedChainId = config.networks[config.currentNetwork].chainIdDecimal;
      
      if (Number(currentChainId) !== expectedChainId) {
        await switchNetwork();
      }
      
      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setChainId(Number(currentChainId));
      setIsConnected(true);
      loadContract(web3Instance);
      
      return accounts[0];
    } catch (error) {
      console.error('Wallet connection error:', error);
      return null;
    }
  };


  return (
    <Web3Context.Provider
      value={{
        web3,
        account,
        contract,
        isConnected,
        chainId,
        connectWallet,
        disconnectWallet,
        switchNetwork
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
