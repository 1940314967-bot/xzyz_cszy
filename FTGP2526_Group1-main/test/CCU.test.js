const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { generateSignature } = require("../scripts/signatureGenerator"); // Import signature utility

describe("CCU Bonding Curve Contract", function () {
    let CCU, ccu, owner, addr1, addr2, oracle; // Mock backend signer

    // Deploy fresh contract for clean state
    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        CCU = await ethers.getContractFactory("CCU");
        ccu = await CCU.deploy();
        await ccu.waitForDeployment();

        // Random wallet to mock backend service
        oracle = ethers.Wallet.createRandom();

        // Set wallet as authorized oracle
        await ccu.setOracleSigner(oracle.address);
    });

    describe("Edge Cases Testing", function () {
        it("Should fail if minting 0 amount", async function () {
            // Expect "x=0" revert
            await expect(ccu.getMintCost(0)).to.be.revertedWith("x=0");
        });

        it("Should fail if burning 0 amount", async function () {
            // Expect "amount=0" revert
            await expect(ccu.burn(0)).to.be.revertedWith("amount=0");
        });

        it("Should fail if user sends insufficient ETH", async function () {
            const amountToMint = 1; 
            const insufficientPayment = ethers.parseEther("0.0005"); 

            // Revert on insufficient ETH
            await expect(
                ccu.connect(addr1).mint(amountToMint, { value: insufficientPayment })
            ).to.be.revertedWith("insufficient ETH");
        });
    });

    describe("Core Business Logic", function () {
        it("Price should increase linearly as supply increases", async function () {
            const cost1 = await ccu.getMintCost(1);
            await ccu.connect(addr1).mint(1, { value: cost1 });

            const cost2 = await ccu.getMintCost(1);
            
            // Price must increase with supply
            expect(cost2).to.be.greaterThan(cost1);
        });
    });

    // EIP-712 Signature Tests
    describe("EIP-712 Claiming Security Tests", function () {
        
        // Valid signature claim
        it("Should allow claim with valid signature", async function () {
            const amount = 50; 
            const nonce = 102; 
            const deadline = (await time.latest()) + 3600;

            // Generate off-chain signature
            const sig = await generateSignature(
                await ccu.getAddress(),
                addr1.address,
                amount,
                nonce,
                deadline,
                oracle.privateKey,
                ethers.provider
            );

            // Check event emission
            await expect(ccu.connect(addr1).claimCCU(amount, nonce, deadline, sig))
                .to.emit(ccu, "CCUClaimed")
                .withArgs(addr1.address, amount, nonce, deadline);
            
            // Check balance (18 decimals)
            expect(await ccu.balanceOf(addr1.address)).to.equal(ethers.parseUnits(amount.toString(), 18));
        });

        // Block replay attacks
        it("Should prevent Replay Attack", async function () {
            const amount = 10;
            const nonce = 103;
            const deadline = (await time.latest()) + 3600;
            const sig = await generateSignature(
                await ccu.getAddress(),
                addr1.address,
                amount,
                nonce,
                deadline,
                oracle.privateKey,
                ethers.provider
            );

            // Claim once to use nonce
            await ccu.connect(addr1).claimCCU(amount, nonce, deadline, sig);

            // Reusing nonce must fail
            await expect(ccu.connect(addr1).claimCCU(amount, nonce, deadline, sig))
                .to.be.revertedWith("Nonce already used");
        });

        it("Should reject invalid signer signatures", async function () {
            const wrongOracle = ethers.Wallet.createRandom();
            const amount = 5;
            const nonce = 104;
            const deadline = (await time.latest()) + 3600;
            const badSig = await generateSignature(
                await ccu.getAddress(),
                addr1.address,
                amount,
                nonce,
                deadline,
                wrongOracle.privateKey,
                ethers.provider
            );

            await expect(ccu.connect(addr1).claimCCU(amount, nonce, deadline, badSig))
                .to.be.revertedWith("Invalid signature");
        });

        it("Should reject expired signatures", async function () {
            const amount = 7;
            const nonce = 105;
            const deadline = (await time.latest()) + 30;
            const sig = await generateSignature(
                await ccu.getAddress(),
                addr1.address,
                amount,
                nonce,
                deadline,
                oracle.privateKey,
                ethers.provider
            );

            await time.increase(31);

            await expect(ccu.connect(addr1).claimCCU(amount, nonce, deadline, sig))
                .to.be.revertedWith("Signature expired");
        });

        it("Should block claiming while paused", async function () {
            const amount = 8;
            const nonce = 106;
            const deadline = (await time.latest()) + 3600;
            const sig = await generateSignature(
                await ccu.getAddress(),
                addr1.address,
                amount,
                nonce,
                deadline,
                oracle.privateKey,
                ethers.provider
            );

            await ccu.pause();
            await expect(ccu.connect(addr1).claimCCU(amount, nonce, deadline, sig))
                .to.be.revertedWithCustomError(ccu, "EnforcedPause");
        });

        it("Should support oracle signer rotation", async function () {
            const amount = 12;
            const nonce = 107;
            const deadline = (await time.latest()) + 3600;
            const oldSig = await generateSignature(
                await ccu.getAddress(),
                addr1.address,
                amount,
                nonce,
                deadline,
                oracle.privateKey,
                ethers.provider
            );
            const newOracle = ethers.Wallet.createRandom();

            await expect(ccu.setOracleSigner(newOracle.address))
                .to.emit(ccu, "OracleSignerUpdated")
                .withArgs(oracle.address, newOracle.address);

            await expect(ccu.connect(addr1).claimCCU(amount, nonce, deadline, oldSig))
                .to.be.revertedWith("Invalid signature");

            const newSig = await generateSignature(
                await ccu.getAddress(),
                addr2.address,
                amount,
                108,
                deadline,
                newOracle.privateKey,
                ethers.provider
            );
            await expect(ccu.connect(addr2).claimCCU(amount, 108, deadline, newSig))
                .to.emit(ccu, "CCUClaimed")
                .withArgs(addr2.address, amount, 108, deadline);
        });
    });
});
