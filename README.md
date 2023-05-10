# Sample Hardhat Project




This project is about a RealEstate NFT where a seller lists some land property on the blockchain for buyers to purchase. Every property is made available in the Escrow contract for verification and approval  affter payment is made to the seller. The ownership of the property is then transferred to the buyer.

Step by step procedures followed to create this project are:
1. Create a Hardhat project using 
    i. npm init
    ii. npx hardhat
2. Install openZeppelin with "npm install @openzeppelin/contracts"
3. In the contract folder, create two solidity files called RealEstate.sol and Escrow.sol => the RealEstate.sol file will contain the codes from OpenZeppelin for minting the NFTs for the RealEstate properties, while the Escrow.sol will contain the main/major codes for selling, lending and approving the properties.
4. Import OpenZeppelin libraries neccessary for minting the NFTs. 
5.  Create a JS file in the testing folder and name it testing.js to be used to test the functionality of different sections of the code.
6. We can use the code below to obtain the signers givven to us by hardhat
        console.log(signers)
        console.log(signers.length)






This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
