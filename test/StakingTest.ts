import { ethers, network } from 'hardhat';
import { expect } from 'chai';
import { MasterShef, ERC20Mock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

describe("MasterShef", function() {
    const initialSupply: number = 100000000000;
    const claimFrozenTime: number = 600;
    const unstakeFrozenTime: number = 600;
    const rewardPersentage: number = 10;
    const boundarySupply: number = 1000;

    let masterShef: MasterShef;
    let stakingToken: ERC20Mock;
    let rewardToken: ERC20Mock;
    let owner: SignerWithAddress;
    let staker: SignerWithAddress;

    beforeEach(async function() {
        [owner, staker] = await ethers.getSigners();

        const StakingToken = await ethers.getContractFactory("ERC20Mock");
        stakingToken = await StakingToken.deploy("LPToken", "LP", initialSupply);
        await stakingToken.deployed();

        const RewardToken = await ethers.getContractFactory("ERC20Mock");
        rewardToken = await RewardToken.deploy("NarfexToken", "NRFX", initialSupply);
        await rewardToken.deployed();

        const MasterShef = await ethers.getContractFactory("MasterShef");
        masterShef = await MasterShef.deploy(
            stakingToken.address, 
            rewardToken.address,
            rewardPersentage, 
            claimFrozenTime, 
            unstakeFrozenTime,
            boundarySupply);
        await masterShef.deployed();

        await rewardToken.transfer(masterShef.address, initialSupply);
    })

    it("Should be deployed", async function() {
        expect(masterShef.address).to.be.properAddress;
    })

    describe("Stake", function() {
        
        it("Should stake 150 tokens and emit Staked event", async function() {
            await stakingToken.approve(masterShef.address, 600);

            await expect(() => masterShef.stake(150))
            .to.changeTokenBalance(stakingToken, masterShef, 150);

            await expect(masterShef.connect(owner).stake(150))
            .to.emit(masterShef, "Staked")
            .withArgs(owner.address, 150);
        })

        it("Should return error with message because account try to stake 0 or less tokens", async function() {
            await stakingToken.approve(masterShef.address, 600);

            await expect(masterShef.stake(0))
            .to.be.revertedWith("Amount of tokens to stake should be positive");
        })

    })

    describe("Unstake", function() {

        it("Should unstake 150 tokens and emit Unstaked event", async function() {
            await stakingToken.approve(masterShef.address, 600);
            await masterShef.connect(owner).stake(150);

            await network.provider.send("evm_increaseTime", [650]);
            await network.provider.send("evm_mine");

            await expect(() => masterShef.connect(owner).unstake())
            .to.changeTokenBalance(stakingToken, owner, 150);

            await masterShef.connect(owner).stake(150);

            await network.provider.send("evm_increaseTime", [650]);
            await network.provider.send("evm_mine");

            await expect(masterShef.connect(owner).unstake())
            .to.emit(masterShef, "Unstaked")
            .withArgs(owner.address, 150); 

        })

        it("Should return error with message because staker try to unstake tokens too early", async function() {
            await stakingToken.approve(masterShef.address, 600);
            await masterShef.connect(owner).stake(150);

            await expect(masterShef.connect(owner).unstake())
            .to.be.revertedWith("You can not unstake tokens now, please try later");
        })

        it("Should return error with message because account don't have tokens to unstake", async function() {
            await stakingToken.approve(masterShef.address, 600);

            await expect(masterShef.connect(owner).unstake())
            .to.be.revertedWith("You don't have tokens to unstake");
        })
    })

    describe("Claim", function() {

        it("Should claim all reward tokens and emit Claimed event", async function() {;
            await stakingToken.approve(masterShef.address, 6000);
            await masterShef.connect(owner).stake(500);

            await network.provider.send("evm_increaseTime", [600]);
            await network.provider.send("evm_mine");

            await expect(() => masterShef.connect(owner).claim())
            .to.changeTokenBalance(rewardToken, owner, 25); // 25 because of amountOfTokens on contract / boundarySupply = 0.5

            await masterShef.connect(owner).stake(500);

            await network.provider.send("evm_increaseTime", [600]);
            await network.provider.send("evm_mine");

            await expect(masterShef.claim())
            .to.emit(masterShef, "Claimed")
            .withArgs(owner.address, 100); // 100 because previous stake did not ustaked
        })

        it("Should return error with message because staker try to claim too early", async function() {
            await stakingToken.approve(masterShef.address, 600);
            await masterShef.connect(owner).stake(150);

            await expect(masterShef.connect(owner).claim())
            .to.be.revertedWith("You can not claim tokens now, please try later");
        })

        it("Should return error message because staker don't have rewards to claim", async function() {
            await stakingToken.approve(masterShef.address, 600);
            await masterShef.connect(owner).stake(150);

            await network.provider.send("evm_increaseTime", [700]);
            await network.provider.send("evm_mine");

            await masterShef.connect(owner).claim();

            await expect(masterShef.connect(owner).claim())
            .to.be.revertedWith("You don't have tokens to claim");
        })
    })

    describe("Change settings", function() {
        it("Should change admin settings for staking logic", async function() {
            await masterShef.changeStakingSettings(40, 5, 8, 2000);

            expect(await masterShef.rewardPercentage()).to.equal(40);
            expect(await masterShef.claimFrozenTime()).to.equal(5);
            expect(await masterShef.unstakeFrozenTime()).to.equal(8);
            expect(await masterShef.boundarySupply()).to.equal(2000);
        })

        it("Should return error because staker isn't a owner", async function() {
            await expect(masterShef.connect(staker).changeStakingSettings(40, 5, 8, 2000))
            .to.be.reverted;
        })
    })
})