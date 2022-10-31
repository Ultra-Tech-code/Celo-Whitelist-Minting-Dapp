// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Auction contract 
/// @author Adewale Iyanuoluwa Isaac
// Note this is for alfajores testnet 

//import {IERC20} from "./IERC20.sol";

/// @dev This is an ERC20 interface (this would help us interact with celo token)
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract whitelistedMinting{
    /// address of the deployer
    address public owner;

    /// set the total number of whitelist addressses allowed
    uint8 public maximumWhitelistedAddresses;

    address celoAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    /// gives the current number of addresse whitelisted
    uint8 public numAddressesWhitelisted;

    /// tracking addresses if whitelisted or not
    mapping(address => bool) public whitelistedAddresses;

    /// track if an address ahs already minted or not
    mapping(address => bool) public minted;

    /// all whitelistedAddres
    address[] whitelistedAddress;

    /// constructor
    ///@dev this sets the total number of address allowed to mint upon deployment
    ///@dev is sets the owner of the contract to msg.sender
    constructor(uint8 _maximumWhitelistedAddresses) {
        maximumWhitelistedAddresses =  _maximumWhitelistedAddresses;
        owner = msg.sender;
      }
    

    /// Modifier
    modifier alreadyMinted(){
        require(minted[msg.sender] == false, "already mineted");
        _;
    }
    modifier onlyOwner(){
        require(msg.sender == owner, "not allowed");
        _;
    }
    
    /// Event
    event addressWhitelisted(address indexed whitelistaddress, uint indexed numAddressesWhitelisted);
    event mintedSuccefully(address indexed minter, uint indexed amount, uint timeOfminting);
    event balance(uint indexed celoBalance, uint indexed cUSDBalance);
    event newMaxOfAddresses(uint indexed maximumWhitelistedAddresses);


    ///@dev A function to whitelist address
    function whitelistAddress() public {
    require(!whitelistedAddresses[msg.sender], "Address already whitelisted");
    require(numAddressesWhitelisted < maximumWhitelistedAddresses, "maximum address to be whitelisted reached");

    whitelistedAddresses[msg.sender] = true;
    numAddressesWhitelisted += 1;

    whitelistedAddress.push(msg.sender);

    emit addressWhitelisted(msg.sender, numAddressesWhitelisted);
    }


    ///@dev A function to mint both CELO and cUSD
    function mint() external alreadyMinted{
        require(whitelistedAddresses[msg.sender] == true, "not whitelisted");
        IERC20(celoAddress).transfer(msg.sender, 1e18);
        payable(msg.sender).transfer(1e18);
        minted[msg.sender] = true;

        emit mintedSuccefully(msg.sender, 1e18, block.timestamp);
    }
// Function for the admin to mint any amount and not be limited
    function specialMint(uint256 _amount) public onlyOwner{
        IERC20(celoAddress).transfer(msg.sender, _amount);
        payable(msg.sender).transfer(_amount);
    }


    ///@dev A function to return all whitelisted address
    function allWhitelistedAddress() public view returns(address[] memory){
        return whitelistedAddress;
    }

    ///@dev A function to return the balance of the contract
    function contractBal() public view returns(uint, uint){
        uint celoBalance = IERC20(celoAddress).balanceOf(address(this));
        uint cUSDBalance = address(this).balance;

        //emit balance(celoBalance, cUSDBalance);
        return (celoBalance, cUSDBalance);

    }

    ///@dev A function to increase the maximum number of address whitelisted
    function increaseMaxwhitelistedAddress(uint8 Num) external onlyOwner{
        maximumWhitelistedAddresses += Num;

        emit newMaxOfAddresses(maximumWhitelistedAddresses);
    }

}