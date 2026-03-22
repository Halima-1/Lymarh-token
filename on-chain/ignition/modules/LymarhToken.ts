// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://v2.hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const LymarhToken = buildModule("LymarhTokenModule", (m) => {

  const lymarhToken = m.contract("LymarhToken");

  return { lymarhToken };

});

export default LymarhToken;
