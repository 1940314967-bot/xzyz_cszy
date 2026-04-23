// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Import EIP-712 domain, ECDSA signature cryptography library, ownership management, and emergency pause security modules
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Define the external NFT contract interface for cross-contract permission validation
interface IProjectNFT {
    function balanceOf(address owner) external view returns (uint256);
}

// Bancor-style continuous token math (RR fixed to 50%)
// price(q) = slope * q, where q is supply in whole tokens
library Bondingcurve{
    function currentprice(
        uint256 q,
        uint256 slope
    ) internal pure returns (uint256) {
        return slope * q;
    }

    function mintCost(
        uint256 q,
        uint256 x,
        uint256 slope
    ) internal pure returns (uint256) {
        require(x > 0, "x=0");
        // sum_{i=0}^{x-1} slope * (q + i)
        return slope * (x * q + (x * (x - 1)) / 2);
    }

    function burnrefund(
        uint256 q,
        uint256 x,
        uint256 slope
    ) internal pure returns (uint256) {
        require(x > 0, "x=0");
        require(x <= q, "x>q");
        // sum_{i=0}^{x-1} slope * (q - x + i)
        return slope * (x * (q - x) + (x * (x - 1)) / 2);
    }
}
/// ccu
// Inheritance breakdown:
// ERC20: Base token standard
// EIP712: Standard for offline structured data signing
// Ownable: Role-based access control
// Pausable: Emergency stop mechanism for security events
contract CCU is ERC20, EIP712, Ownable, Pausable {
    // Enable ECDSA methods for bytes32 to handle hashes
    using ECDSA for bytes32; 

    // Legacy curve parameters kept for frontend/backward compatibility
    struct LegacyCurve {
        uint256 B;
        uint256 q1;
        uint256 q2;
        uint256 s1;
        uint256 s2;
        uint256 s3;
    }
    LegacyCurve public curve;

    // Bancor-style parameters
    uint256 public slope;
    uint32 public reserveRatio;

    // Store the officially authorized oracle signer public address
    address public oracleSigner;     
    // Store NFT address
    address public projectNFT;
    event ProjectNFTUpdated(address indexed previousNFT, address indexed newNFT);
    // Anti-replay ledger: Record used nonces
    mapping(uint256 => bool) public usedNonces;
    // Strong replay ledger: each signed claim payload can only be consumed once.
    mapping(bytes32 => bool) public usedClaimHashes;

    // Bonding curve events: Mint and burn
    event Minted(address indexed buyer, uint256 amount, uint256 cost);
    event Burned(address indexed seller, uint256 amount, uint256 refund);
    // Exclusive event for claiming tokens via oracle signature
    event CCUClaimed(address indexed user, uint256 amount, uint256 nonce, uint256 deadline);
    event OracleSignerUpdated(address indexed previousSigner, address indexed newSigner);
    event LegacyCurveUpdated(
        uint256 B,
        uint256 q1,
        uint256 q2,
        uint256 s1,
        uint256 s2,
        uint256 s3
    );
    event BancorParamsUpdated(uint256 slope, uint32 reserveRatio);
    //Only the NFT owner can use the function
    modifier onlyProjectHolder() {
    require(projectNFT != address(0), "ProjectNFT not set");
    require(IProjectNFT(projectNFT).balanceOf(msg.sender) > 0, "Need ProjectNFT");
    _;}

    // Init token info, EIP-712 domain separator, and grant deployer admin rights
    constructor()
        ERC20("Carbon Credit Unit", "CCU")
        EIP712("Carbon Credit Unit", "1")
        Ownable(msg.sender)
    {
        // Keep legacy params for compatibility with existing frontend ABI
        curve = LegacyCurve({
            B: 0.001 ether,
            q1: 100,
            q2: 500,
            s1: 0.00001 ether,
            s2: 0.00002 ether,
            s3: 0.000005 ether
        });

        // Bancor-style linear-price continuous token (RR=50%)
        slope = 0.00002 ether;
        reserveRatio = 500_000;
    }

    // Set trusted oracle address (Admin only)
    function setOracleSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid signer");
        address previous = oracleSigner;
        oracleSigner = _signer;
        emit OracleSignerUpdated(previous, _signer);
    }

    // Set the NFT address(admin only)
    function setProjectNFT(address _projectNFT) external onlyOwner {
    require(_projectNFT != address(0), "Invalid NFT contract");
    address previous = projectNFT;
    projectNFT = _projectNFT;
    emit ProjectNFTUpdated(previous, _projectNFT);
    }

    // Update bonding curve params without redeploying (Admin only)
    function setCurveParams(
        uint256 B,
        uint256 q1,
        uint256 q2,
        uint256 s1,
        uint256 s2,
        uint256 s3
    ) external onlyOwner {
        require(q1 < q2, "invalid breakpoints");
        curve = LegacyCurve({
            B: B,
            q1: q1,
            q2: q2,
            s1: s1,
            s2: s2,
            s3: s3
        });
        emit LegacyCurveUpdated(B, q1, q2, s1, s2, s3);
    }

    // Owner can tune the Bancor-style parameters
    function setBancorParams(uint256 _slope, uint32 _reserveRatio) external onlyOwner {
        require(_slope > 0, "invalid slope");
        require(_reserveRatio > 0 && _reserveRatio <= 1_000_000, "invalid reserve ratio");
        slope = _slope;
        reserveRatio = _reserveRatio;
        emit BancorParamsUpdated(_slope, _reserveRatio);
    }

    // Trigger emergency pause to freeze core transactions (Admin only)
    function pause() external onlyOwner {
        _pause();
    }

    // Lift emergency pause to resume core transactions (Admin only)
    function unpause() external onlyOwner {
        _unpause();
    }

    // Core claim logic: Verify oracle signature and mint tokens securely (Protected by pause)
    function claimCCU(uint256 amount, uint256 nonce, uint256 deadline, bytes calldata signature) external whenNotPaused onlyProjectHolder{
        // Security layer 1: Block reused nonces to prevent replay attacks
        require(!usedNonces[nonce], "Nonce already used");
        require(block.timestamp <= deadline, "Signature expired");

        bytes32 claimHash = keccak256(abi.encode(msg.sender, amount, nonce, deadline));
        require(!usedClaimHashes[claimHash], "Claim hash already used");

        // Crypto step 1: Pack and hash business data strictly following EIP-712
        bytes32 structHash = keccak256(abi.encode(
            keccak256("ClaimData(address user,uint256 amount,uint256 nonce,uint256 deadline)"),
            msg.sender,
            amount,
            nonce,
            deadline
        ));
        // Crypto step 2: Generate the final structured digest verification hash
        bytes32 hash = _hashTypedDataV4(structHash);

        // Crypto step 3: Recover signer's public key from digest and signature using ECDSA
        address signer = ECDSA.recover(hash, signature);

        // Security layer 2: Match public keys to ensure signature is from official server
        require(signer == oracleSigner, "Invalid signature");

        // State update: Invalidate current nonce
        usedNonces[nonce] = true;
        usedClaimHashes[claimHash] = true;
        // Asset settlement: Mint tokens using standard 18-decimal precision
        _mint(msg.sender, amount * (10 ** decimals()));

        // Broadcast successful claim event
        emit CCUClaimed(msg.sender, amount, nonce, deadline);
    }
    // current supply
    function currentSupply() public view returns (uint256) {
        return totalSupply() / (10 ** decimals());}
    //get the next coin price
    function getCurrentPrice() public view returns (uint256) {
        return Bondingcurve.currentprice(currentSupply(), slope);
        }
    //calculate the eth cost to build ccu
    function getMintCost(uint256 amount) public view returns (uint256) {
        return Bondingcurve.mintCost(currentSupply(), amount, slope);
        }
    // how much eth refund can get for burning
    function getBurnRefund(uint256 amount) public view returns (uint256) {
        return Bondingcurve.burnrefund(currentSupply(), amount, slope);
        }
    //pay eth based on the bonding curve
    function mint(uint256 amount) external payable whenNotPaused {
        // the number must above0
        require(amount > 0, "amount=0");
        uint256 cost = getMintCost(amount);
        // the owner's eth need to cover cost
        require(msg.value >= cost, "insufficient ETH");
        _mint(msg.sender, amount * (10 ** decimals()));
        //refund if paying more
        uint256 extra = msg.value - cost;
        if (extra > 0) {
            (bool ok, ) = payable(msg.sender).call{value: extra}("");
            require(ok, "refund failed");
        }
        emit Minted(msg.sender, amount, cost);
    }
    //burn ccu function
    function burn(uint256 amount) external whenNotPaused {
        require(amount > 0, "amount=0");
        //change the interger
        uint256 tokenAmount = amount * (10 ** decimals());
        require(balanceOf(msg.sender) >= tokenAmount, "insufficient CCU");
        uint256 refund = getBurnRefund(amount);
        require(address(this).balance >= refund, "insufficient contract ETH");
        // cut in the total supply
        _burn(msg.sender, tokenAmount);
        (bool ok, ) = payable(msg.sender).call{value: refund}("");
        require(ok, "ETH transfer failed");
        emit Burned(msg.sender, amount, refund);
    }
    receive() external payable {}
}
