const { ethers } = require("hardhat");

async function main() {
  //set the parameter
  const metadataURI = "ipfs://bafkreihumwaid5pynhxaryubxfbplavpuajerp7na4fotswrdh4hi3dh34";
  const oraclePrivateKey = "0x59c6995e998f97a5a0044976f09453893dc9e86dae88c7a8412f4603b6b78690";

  const amount = 1;
  const nonce = 1;
  const deadline = 2000000000;

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const [owner, signer1, user] = await ethers.getSigners();


  console.log("Owner address:", owner.address);
  console.log("User address :", user.address);

  //get oracle address through private key
  const oracleWallet = new ethers.Wallet(oraclePrivateKey.trim(), provider);
  console.log("Oracle address:", oracleWallet.address);

  //deploy project nft
  const ProjectNFT = await ethers.getContractFactory("ProjectNFT", owner);
  const nft = await ProjectNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("ProjectNFT deployed:", nftAddress);

  //deploy ccu
  const CCU = await ethers.getContractFactory("CCU", owner);
  const ccu = await CCU.deploy();
  await ccu.waitForDeployment();
  const ccuAddress = await ccu.getAddress();
  console.log("CCU deployed:", ccuAddress);

  //mint nft to user
  const mintTx = await nft.mintTo(user.address, metadataURI);
  await mintTx.wait();
  console.log("NFT minted to user");

  //set the ccu
  await (await ccu.setProjectNFT(nftAddress)).wait();
  console.log("CCU setProjectNFT done");
  await (await ccu.setOracleSigner(oracleWallet.address)).wait();
  console.log("CCU setOracleSigner done");

  //check whether the user has nft
  const nftBalance = await nft.balanceOf(user.address);
  console.log("User NFT balance:", nftBalance.toString());

  //produce the signature
  const domain = {
    name: "Carbon Credit Unit",
    version: "1",
    chainId: 31337,
    verifyingContract: ccuAddress,
  };

  const types = {
    ClaimData: [
      { name: "user", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const value = {
    user: user.address,
    amount,
    nonce,
    deadline,
  };

  const signature = await oracleWallet.signTypedData(domain, types, value);
  console.log("Signature:", signature);
  // use the claimccu
  const ccuAsUser = ccu.connect(user);
  const claimTx = await ccuAsUser.claimCCU(amount, nonce, deadline, signature);
  await claimTx.wait();
  console.log("claimCCU success");

  //check the result
  const ccuBalance = await ccu.balanceOf(user.address);
  const nonceUsed = await ccu.usedNonces(nonce);
  const oracleSigner = await ccu.oracleSigner();
  const projectNFT = await ccu.projectNFT();

  console.log("User CCU balance raw :", ccuBalance.toString());
  console.log("User CCU balance fmt :", ethers.formatUnits(ccuBalance, 18));
  console.log("Nonce used          :", nonceUsed);
  console.log("Oracle signer set   :", oracleSigner);
  console.log("ProjectNFT set      :", projectNFT);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});