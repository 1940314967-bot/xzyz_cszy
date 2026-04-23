const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CCUModule", (m) => {
  const ccu = m.contract("CCU", []);
  return { ccu };
});