import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const MasterShef = await ethers.getContractFactory("MasterShef", signer);
  const masterShef = await MasterShef.deploy("0x098DaDA18eb6790e2cEe0575BB89485Be066c372", "0x3764Be118a1e09257851A3BD636D48DFeab5CAFE", 20, 600, 600, 1000);

  await masterShef.deployed();

  console.log("MasterShef contract deployed to:", masterShef.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
