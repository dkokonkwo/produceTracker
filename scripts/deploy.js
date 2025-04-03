const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  const ProduceTracker = await hre.ethers.getContractFactory("ProduceTracker");
  const produceTracker = await ProduceTracker.deploy();

  await produceTracker.waitForDeployment();

  console.log("My NFT deployed to:", await produceTracker.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
