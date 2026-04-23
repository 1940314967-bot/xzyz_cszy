const { ethers } = require("hardhat");

/**
 * EIP-712 Off-chain Signature Generator
 * Mocks backend signing behavior for 0-gas oracle minting.
 */
async function generateSignature(contractAddress, userAddress, amount, nonce, deadline, privateKey, provider) {
    // Init wallet to mock backend signer
    const wallet = new ethers.Wallet(privateKey, provider);
    const { chainId } = await wallet.provider.getNetwork();

    // Domain separator to prevent replay attacks
    const domain = {
        name: "Carbon Credit Unit", // Must match CCU.sol constructor
        version: "1",
        chainId: Number(chainId),
        verifyingContract: contractAddress
    };

    // Type definitions matching the contract's ClaimData struct
    const types = {
        ClaimData: [
            { name: "user", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" }
        ]
    };

    // Payload
    const value = {
        user: userAddress,
        amount: amount,
        nonce: nonce,
        deadline: deadline
    };

    // Generate ECDSA signature
    const signature = await wallet.signTypedData(domain, types, value);
    return signature;
}

module.exports = { generateSignature };
