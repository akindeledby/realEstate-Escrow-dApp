const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}

describe("Escrow", () => {
//We will declare the variables. They are also the signers in this transaction:- seller, buyer, lender, inspector
let seller, buyer, lender, inspector
let realEstate, escrow

    beforeEach(async () => {
        // set up the account
        [seller, buyer, inspector, lender] = await ethers.getSigners()
            
            // We will deploy the RealEstate contract
            const RealEstate = await ethers.getContractFactory("RealEstate")
            realEstate = await RealEstate.deploy()

            // console.log(realEstate.address)

            // minting the token. Usually from the seller perspective
            let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/1.json")
            await transaction.wait()

            // We will also deploy the Escrow contract, then pass in all the signers
            const Escrow = await ethers.getContractFactory("Escrow")
            escrow = await Escrow.deploy(
                realEstate.address,
                seller.address,
                inspector.address,
                lender.address
            )

            // Approve transfer of property from seller to escrow
            transaction = await realEstate.connect(seller).approve(escrow.address, 1)
            await transaction.wait()

            // List property
            transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
            await transaction.wait()
    }) 

    describe("Deployment", () => {
        it("returns the nft Address", async () => {
             // let's test if it check the nftAdrress.
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })

        // let's test if it check the Seller Adrress. 
        it("returns the seller", async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })

        // let's test if it check the lender Adrress. 
        it("returns the lender", async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })

        // let's test if it check the inspector Adrress. 
        it("returns the inspector", async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })
    })

    describe("Listing", () => {
        // let's test if the NFT updates as listed
        it("Updates as listed", async() => {
            const result = await escrow.isListed(1)
            expect(result).to.be.equal(true)
        })
        
        // let's test if the ownership of the NFT is transferred to the Escrow smart contract. 
        it("Updates the ownership", async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })
        
        it("Returns buyer address", async () => {
            const result =await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })

        it("Returns Amount", async () => {
            const result =await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })
        
        it("Returns Purchase price", async () => {
            const result =await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })  
    })

    describe("Deposits", () => {
        it("Updates contract balance", async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5) })
            await transaction.wait()
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe("Inspections", () => {
        it("Updates inspection status", async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()
            const result = await escrow.inspectionPassed(1)
            expect(result).to.be.equal(true)
        })
    })

    describe("Approval", () => {
        it("Updates approval status", async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()
            
            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)
        })
    })

    describe("Sale", async () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5)})
            await transaction.wait()

            transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            await lender.sendTransaction({to: escrow.address, value: tokens(5) })

            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait()
        })

        it("Updates ownership", async ()  => {
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
        })

        it("Updates balance", async () => {
            expect(await escrow.getBalance()).to.be.equal(0)
        })
    })
})
