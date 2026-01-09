import { useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';

export const useWallet = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWallet must be used within Web3Provider');
  }
  return context;
};
