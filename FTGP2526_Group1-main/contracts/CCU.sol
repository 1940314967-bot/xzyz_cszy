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

// use bonding curve to replace a sigmoid pricing function
// gentle slope first then steeper slope ending with flatter slope
library Bondingcurve{
    struct Param {
        uint256 B; //base price 
        uint256 q1;//two breakpoint
        // three segment 
        uint256 q2;
        uint256 s1;
        uint256 s2;
        uint256 s3;
    }
    // spot price at supply q 
    function currentprice(
        uint256 q,
        Param memory p

    )internal pure returns (uint256 price){
        //check whether q1 < q2
        require(p.q1 < p.q2, "invalid breakpoints");
        if (q <= p.q1) {
            // Segment 1
            return p.B + p.s1 * q;
        }
        uint256 P1 = p.B + p.s1 * p.q1;
        if (q <= p.q2) {
            // Segment 2
            return P1 + p.s2 * (q - p.q1);
        }
        uint256 P2 = P1 + p.s2 * (p.q2 - p.q1);
        // Segment 3
        return P2 + p.s3 * (q - p.q2);
    }
    //calculate the total cost of the coin
    function mintCost(
        uint256 q,
        uint256 x,
        Param memory p
    ) internal pure returns (uint256 cost){
        //at least buy 1 coin
        require (x >0, "x=0");
        require(p.q1 < p.q2, "invalid breakpoints");
        uint256 currentQ = q;
        uint256 remaining = x;
        //loop until buy enough coin 
        while (remaining > 0) {
            if (currentQ < p.q1) {
                //calculate how much i can buy in the first segment 
                uint256 end = _min(q + x, p.q1);
                uint256 n = _min(remaining, end - currentQ);
                //add cost
                cost += _sumLinear(
                    p.B,
                    p.s1,
                    currentQ,
                    n
                );
                currentQ += n;
                remaining -= n;
                //second segment
            }else if (currentQ < p.q2) {
                uint256 P1 = p.B + p.s1 * p.q1;
                uint256 end = _min(q + x, p.q2);
                uint256 n = _min(remaining, end - currentQ);
                //add cost
                cost += _sumShiftedLinear(
                    P1,
                    p.s2,
                    p.q1,
                    currentQ,
                    n
                );
                currentQ += n;
                remaining -= n;
            // third segment
            } else{
                uint256 P1 = p.B + p.s1 * p.q1;
                uint256 P2 = P1 + p.s2 * (p.q2 - p.q1);
                uint256 n = remaining;
                //add cost
                cost += _sumShiftedLinear(
                    P2,
                    p.s3,
                    p.q2,
                    currentQ,
                    n
                );
                currentQ += n;
                remaining = 0;
            }
        }
    }
// burn the coin
    function burnrefund(
        uint256 q,
        uint256 x,
        Param memory p
    )internal pure returns (uint256 refund) {
        require(x > 0, "x=0");
        require(x <= q, "x>q");
        require(p.q1 < p.q2, "invalid breakpoints");
        // burn limit 
        uint256 remaining = x;
        uint256 currentTop = q; 
        //burn start from the third segment
        while (remaining > 0) {
            if (currentTop > p.q2) {
                uint256 lower = _max(q - x, p.q2);
                uint256 n = _min(remaining, currentTop - lower);
                uint256 P1 = p.B + p.s1 * p.q1;
                uint256 P2 = P1 + p.s2 * (p.q2 - p.q1);
                refund += _reverseSumShiftedLinear(
                    P2,
                    p.s3,
                    p.q2,
                    currentTop,
                    n
                );
                currentTop -= n;
                remaining -= n;
        //second segment 
            } else if (currentTop > p.q1) {
                uint256 lower = _max(q - x, p.q1);
                uint256 n = _min(remaining, currentTop - lower);
                uint256 P1 = p.B + p.s1 * p.q1;
                refund += _reverseSumShiftedLinear(
                    P1,
                    p.s2,
                    p.q1,
                    currentTop,
                    n
                );
                currentTop -= n;
                remaining -= n;
            } else{
                uint256 n = remaining;
                refund += _reverseSumLinear(
                    p.B,
                    p.s1,
                    currentTop,
                    n
                );
                currentTop -= n;
                remaining = 0;
            }
        }
    }
    // internal math part
    // y = a + slope*x
    function _sumLinear(
        uint256 base,
        uint256 slope,
        uint256 start,
        uint256 n
    ) private pure returns (uint256) {
        return n * base + slope * (n * start + (n * (n - 1)) / 2);
    }
    // for second and third segment 
    function _sumShiftedLinear(
        uint256 anchorPrice,
        uint256 slope,
        uint256 anchorQ,
        uint256 start,
        uint256 n
    ) private pure returns (uint256) {
        uint256 offset = start - anchorQ;
        return n * anchorPrice + slope * (n * offset + (n * (n - 1)) / 2);
    }
    // first segment for burning
    function _reverseSumLinear(
        uint256 base,
        uint256 slope,
        uint256 top,
        uint256 n
    ) private pure returns (uint256) {
        uint256 first = top - n;
        return n * base + slope * (n * first + (n * (n - 1)) / 2);
    }
    //second and third segment for burning
    function _reverseSumShiftedLinear(
        uint256 anchorPrice,
        uint256 slope,
        uint256 anchorQ,
        uint256 top,
        uint256 n
    ) private pure returns (uint256) {
        uint256 first = top - n;
        uint256 offset = first - anchorQ;
        return n * anchorPrice + slope * (n * offset + (n * (n - 1)) / 2);
    }
    // choose the smaller one 
    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
    // choose the bigger one
    function _max(uint256 a, uint256 b) private pure returns (uint256) {
        return a > b ? a : b;
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

    // Retain bonding curve pricing parameters from week 1
    Bondingcurve.Param public curve; 

    // Store the officially authorized oracle signer public address
    address public oracleSigner;     
    // Anti-replay ledger: Record used nonces
    mapping(uint256 => bool) public usedNonces; 

    // Bonding curve events: Mint and burn
    event Minted(address indexed buyer, uint256 amount, uint256 cost);
    event Burned(address indexed seller, uint256 amount, uint256 refund);
    // Exclusive event for claiming tokens via oracle signature
    event CCUClaimed(address indexed user, uint256 amount, uint256 nonce);

    // Init token info, EIP-712 domain separator, and grant deployer admin rights
    constructor() 
        ERC20("Carbon Credit Unit", "CCU") 
        EIP712("Carbon Credit Unit", "1") 
        Ownable(msg.sender) 
    {
        // Restore base economic model parameters
        curve = Bondingcurve.Param({
            B: 0.001 ether,
            q1: 100,
            q2: 500,
            s1: 0.00001 ether,
            s2: 0.00002 ether,
            s3: 0.000005 ether
         });
    }

    // Set trusted oracle address (Admin only)
    function setOracleSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid signer");
        oracleSigner = _signer;
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
    function claimCCU(uint256 amount, uint256 nonce, bytes calldata signature) external whenNotPaused {
        // Security layer 1: Block reused nonces to prevent replay attacks
        require(!usedNonces[nonce], "Nonce already used");

        // Crypto step 1: Pack and hash business data strictly following EIP-712
        bytes32 structHash = keccak256(abi.encode(
            keccak256("ClaimData(address user,uint256 amount,uint256 nonce)"),
            msg.sender,
            amount,
            nonce
        ));
        // Crypto step 2: Generate the final structured digest verification hash
        bytes32 hash = _hashTypedDataV4(structHash);
        
        // Crypto step 3: Recover signer's public key from digest and signature using ECDSA
        address signer = ECDSA.recover(hash, signature);
        
        // Security layer 2: Match public keys to ensure signature is from official server
        require(signer == oracleSigner, "Invalid signature");

        // State update: Invalidate current nonce
        usedNonces[nonce] = true;
        // Asset settlement: Mint tokens using standard 18-decimal precision
        _mint(msg.sender, amount * (10 ** decimals()));
        
        // Broadcast successful claim event
        emit CCUClaimed(msg.sender, amount, nonce);
    }
    // current supply
    function currentSupply() public view returns (uint256) {
        return totalSupply() / (10 ** decimals());}
    //get the next coin price
    function getCurrentPrice() public view returns (uint256) {
        Bondingcurve.Param memory p = curve;
        return Bondingcurve.currentprice(currentSupply(), p);
        }
    //calculate the eth cost to build ccu
    function getMintCost(uint256 amount) public view returns (uint256) {
        Bondingcurve.Param memory p = curve;
        return Bondingcurve.mintCost(currentSupply(), amount, p);
        }
    // how much eth refund can get for burning
    function getBurnRefund(uint256 amount) public view returns (uint256) {
        Bondingcurve.Param memory p = curve;
        return Bondingcurve.burnrefund(currentSupply(), amount, p);
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
            
