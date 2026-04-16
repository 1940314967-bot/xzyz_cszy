const { ethers } = require("hardhat");

/**
 * EIP-712 Off-chain Signature Generator
 * Mocks backend signing behavior for 0-gas oracle minting.
 */
async function generateSignature(contractAddress, userAddress, amount, nonce, privateKey) {
    // Init wallet to mock backend signer
    const wallet = new ethers.Wallet(privateKey);

    // Domain separator to prevent replay attacks
    const domain = {
        name: "Carbon Credit Unit", // Must match CCU.sol constructor
        version: "1",
        chainId: 31337, // Hardhat local network
        verifyingContract: contractAddress
    };

    // Type definitions matching the contract's ClaimData struct
    const types = {
        ClaimData: [
            { name: "user", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "nonce", type: "uint256" }
        ]
    };

    // Payload
    const value = {
        user: userAddress,
        amount: amount,
        nonce: nonce
    };

    // Generate ECDSA signature
    const signature = await wallet.signTypedData(domain, types, value);
    return signature;
}

module.exports = { generateSignature };