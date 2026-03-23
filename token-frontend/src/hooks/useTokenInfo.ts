import { useWeb3 } from '../context/Web3Context';

export const useTokenInfo = () => {
  const { tokenInfo, refreshInfo } = useWeb3();
  
  return { 
    ...tokenInfo, 
    refresh: refreshInfo 
  };
};
