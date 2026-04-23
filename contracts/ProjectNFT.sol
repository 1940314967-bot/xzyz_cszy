// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ProjectNFT is ERC721URIStorage {
    uint256 public nextTokenId;

    constructor() ERC721("ProjectNFT", "PNFT") {}

    function mintTo(address to, string memory metadataURI) external returns (uint256) {
        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        return tokenId;
    }}