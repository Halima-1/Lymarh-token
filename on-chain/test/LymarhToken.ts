import { expect } from "chai";
import { ethers } from "hardhat";
import { LymarhToken } from "../typechain-types";
import { Signer } from "ethers";

describe("LymarhToken", function () {
  let token: LymarhToken;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;

  let ownerAddress: string;
  let user1Address: string;
  let user2Address: string;

  const INITIAL_SUPPLY = ethers.parseEther("4000000");
  const TOTAL_SUPPLY = ethers.parseEther("10000000");
  const FAUCET_REWARD = ethers.parseEther("1000");

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    user1 = signers[1];
    user2 = signers[2];

    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();

    const TokenFactory = await ethers.getContractFactory("LymarhToken");
    token = (await TokenFactory.deploy()) as LymarhToken;
    await token.waitForDeployment();
  });

  // ---------------- DEPLOYMENT ----------------
  describe("Deployment", function () {
    it("should assign initial supply to owner", async function () {
      const balance = await token.balanceOf(ownerAddress);
      expect(balance).to.equal(INITIAL_SUPPLY);
    });

    it("should set remaining supply correctly", async function () {
      const remaining = await token.remainingSupply();
      expect(remaining).to.equal(TOTAL_SUPPLY - INITIAL_SUPPLY);
    });
  });

  // ---------------- CLAIM TOKENS ----------------
  describe("claimTokens", function () {
    it("should allow a user to claim tokens", async function () {
      await token.connect(user1).claimTokens();

      const balance = await token.balanceOf(user1Address);
      expect(balance).to.equal(FAUCET_REWARD);
    });

    it("should reduce remaining supply after claim", async function () {
      const before = await token.remainingSupply();

      await token.connect(user1).claimTokens();

      const after = await token.remainingSupply();
      expect(after).to.equal(before - FAUCET_REWARD);
    });

    it("should prevent claiming before cooldown expires", async function () {
      await token.connect(user1).claimTokens();

      await expect(
        token.connect(user1).claimTokens()
      ).to.be.revertedWithCustomError(token, "WaitTimeNotReached");
    });
  });

  // ---------------- MINT FUNCTION ----------------
  describe("mint", function () {
    it("should allow owner to mint tokens", async function () {
      await token.connect(owner).mint(user1Address, FAUCET_REWARD);

      const balance = await token.balanceOf(user1Address);
      expect(balance).to.equal(FAUCET_REWARD);
    });

    it("should decrease remaining supply after mint", async function () {
      const before = await token.remainingSupply();

      await token.connect(owner).mint(user1Address, FAUCET_REWARD);

      const after = await token.remainingSupply();
      expect(after).to.equal(before - FAUCET_REWARD);
    });

    it("should revert if non-owner tries to mint", async function () {
      await expect(
        token.connect(user1).mint(user1Address, FAUCET_REWARD)
      ).to.be.reverted;
    });

    it("should revert for zero address", async function () {
      await expect(
        token.connect(owner).mint(ethers.ZeroAddress, FAUCET_REWARD)
      ).to.be.revertedWithCustomError(token, "AddressNotValid");
    });

    it("should revert for zero amount", async function () {
      await expect(
        token.connect(owner).mint(user1Address, 0)
      ).to.be.revertedWithCustomError(token, "AmountCannotBeZero");
    });

    it("should revert if mint exceeds remaining supply", async function () {
      const remaining = await token.remainingSupply();

      await expect(
        token.connect(owner).mint(user1Address, remaining + 1n)
      ).to.be.revertedWithCustomError(token, "SupplyLimitExceeded");
    });
  });

});