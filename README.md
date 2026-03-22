# Lymarh Protocol (LH) 🚀

Welcome to **Lymarh Protocol**! This is a simple but powerful ERC20 token project built natively on the **Lisk Sepolia** testnet. 

I built this to show how a basic token economy works—you can claim free tokens from a faucet,  and even look up who else has been claiming tokens lately.

---
## 🛠 What's inside?

The project is split into two main parts:

1.  **/on-chain**: This is where the smart contract lives. It's written in Solidity and handled with Hardhat. 

    *   **Faucet Logic**: You can claim 1,000 LH tokens, but you have to wait 2 days between claims (no spamming!).
    *   **Admin Minting**: The owner of the contract can mint extra tokens if needed.

2.  **/token-frontend**: A clean, modern dashboard built with React and Vite.
    *   **Connect Wallet**: Works with MetaMask and also has a deep link for mobile users.
    *   **Action Cards**: Simple buttons to Claim and Transfer tokens.
    *   **History Explorer**: A cool feature that lets you search any wallet address to see how much they've claimed, plus a live feed of recent claims.

---


## 🚀 Getting Started

If you want to run this locally:

### 1. The Smart Contract
```bash
cd on-chain
npm install
npx hardhat compile
```

### 2. The Frontend
```bash
cd token-frontend
npm install
npm run dev
```

---

## 🌍 Deployment
The frontend is designed to be hosted on **Vercel**. If you're doing that, just remember to point the "Root Directory" to the `token-frontend` folder.

The contract is already deployed and verified on **Lisk Sepolia**.

---

## 🤝 Contributing
Feel free to fork this, play around with the code, or suggest features. It's all open for the community!

**Built with ❤️ on Lisk.**
