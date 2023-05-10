//SPDX-License-Identifier: Unlicense

pragma solidity >0.8.0;

// the interface below helps us to use the IERC721 imported from openzeppelin selecting only few property such as _from, _to and _id 
// An interface is like a skeleton for a smart contract that tells us the type of functions that are inside of it
interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    // We will ensure it is only buyer that can purchase property listed for sale, so we will create a modifier
    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only the seller can call this function");
        _;
    }


    // We will ensure it is only seller that can list property for sale, so we will create a modifier
    modifier onlySeller() {
        require(msg.sender == seller, "Only the seller can list property");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only Inspector can call this method");
        _;
    }

    // We also need to update the listing to show the NFTs status that are listed. We will do this using a mapping
    // the uint256 will be the NFT-ID like 1, 2, 3, 4 etc while bool is simply true or false
    mapping(uint256 => bool) public isListed;

    // We will also to store some values inside the smart contract. We are going to store the purchase price, the escrow amount 
    // and the buyer ID. We will store them inside some mappings
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;


    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    // We will take the NFT out of the user's wallet and move it into Escrow.
    // We will now list it as property and to do this, we will create a function called "list". 
    function list(uint256 _nftID, address _buyer, uint256 _purchasePrice, uint256 _escrowAmount) public  payable onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

    // The NFT(property) will have attributes such as ID, Price, escrowAmount, buyer and so on and there can be more than one property listed.
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    // We will create a function that will enable a buyer to purchase the property
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }

    // Update Inspection Status (only inspector)
    function updateInspectionStatus(uint256 _nftID, bool _passed) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    } 

    function approveSale(uint256  _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //Finalize Sale
    // -> require inspection status
    // -> require  sale to be authorized
    // -> require funds to be correct amount
    // -> Transfer NFFT to buyer
    // -> Transfer Funds to Seller
    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID]);
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);
        require(address(this).balance >= purchasePrice[_nftID]);
    
    
    // Since the NFT is sold, we can erase the listing as below
    isListed[_nftID] = false;


    // sending Ethers from Escrow Smart contract to the Seller
    (bool success, ) = payable(seller).call{value: address(this).balance}("");
    require(success);


    // tranfer the NFT from the Escrow smart contract to the buyer
    IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    // Cancel Sale (handle earnest deposit)
    // If inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }
}



