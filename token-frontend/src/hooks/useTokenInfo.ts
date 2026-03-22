import { useState, useCallback, useEffect, useMemo } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { formatUnits } from 'ethers';

export const useTokenInfo = () => {
  const { account, contract } = useWeb3();
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    totalSupply: '0',
    remainingSupply: '0',
    balance: '0',
    owner: '',
    lastClaimTime: '0',
    waitDuration: '0'
  });

  const fetchTokenData = useCallback(async () => {
    if (!contract || !account) return;

    try {
      const [name, symbol, totalSupply, remainingSupply, balance, owner, lastClaimTime, waitDuration] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.remainingSupply(),
        contract.balanceOf(account),
        contract.owner(),
        contract.lastRequestTime(account),
        contract.WAIT_DURATION()
      ]);

      setTokenData({
        name,
        symbol,
        totalSupply: formatUnits(totalSupply, 18),
        remainingSupply: formatUnits(remainingSupply, 18),
        balance: formatUnits(balance, 18),
        owner,
        lastClaimTime: lastClaimTime.toString(),
        waitDuration: waitDuration.toString()
      });
    } catch (err) {
      console.error("Token info fetch error:", err);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchTokenData();
    const id = setInterval(fetchTokenData, 10000);
    return () => clearInterval(id);
  }, [fetchTokenData]);

  const isOwner = useMemo(() => 
    account && tokenData.owner.toLowerCase() === account.toLowerCase(), 
    [account, tokenData.owner]
  );

  const canClaim = useMemo(() => {
    const nextTime = (Number(tokenData.lastClaimTime) + Number(tokenData.waitDuration)) * 1000;
    return Number(tokenData.lastClaimTime) === 0 || Date.now() > nextTime;
  }, [tokenData.lastClaimTime, tokenData.waitDuration]);

  return { ...tokenData, isOwner, canClaim, refresh: fetchTokenData };
};
