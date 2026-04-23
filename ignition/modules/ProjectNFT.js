const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ProjectNFTModule", (m) => {
  const projectNFT = m.contract("ProjectNFT", []);
  return { projectNFT };
});