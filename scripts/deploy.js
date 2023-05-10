const hre = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}

async function main() {

    [seller, buyer, inspector, lender] = await ethers.getSigners()
        // We will deploy the RealEstate contract
        const RealEstate = await ethers.getContractFactory("RealEstate")
        realEstate = await RealEstate.deploy()
        await realEstate.deployed()

        console.log(`Deployed Real Estate Contract at: ${realEstate.address}`)
        console.log(`Minting three NTFs...\n`)

        for (let i = 0; i < 3; i++) {
            const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`)
            await transaction.wait()
        }

        // We will deploy the Escrow contract
        const Escrow = await ethers.getContractFactory("Escrow")
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )
        await escrow.deployed()

        for (let i = 0; i < 3; i++) {
            let transaction = await realEstate.connect(seller).approve(escrow.address, i + 1)
            await transaction.wait()
        }

        // Listing properties by seller
        transaction = await escrow.connect(seller).list(1, buyer.adddress, tokens(20),  tokens(10))
        await transaction.wait()

        transaction = await escrow.connect(seller).list(2, buyer.adddress, tokens(15),  tokens(5))
        await transaction.wait()

        transaction = await escrow.connect(seller).list(1, buyer.adddress, tokens(10),  tokens(5))
        await transaction.wait()


        console.log("Finished.")
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})