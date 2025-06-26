const bip39 = require('bip39');
// Generate a 12-word mnemonic
const mnemonic = bip39.generateMnemonic(128); // 128 bits = 12 words
console.log('Mnemonic:', mnemonic);

// Generate a 24-word mnemonic
const mnemonic24 = bip39.generateMnemonic(256); // 256 bits = 24 words
console.log('mnemonic 24 --> ', mnemonic24)
// Validate mnemonic
const isValid = bip39.validateMnemonic(mnemonic);
console.log('Valid:', isValid);

const ErgoWallet = require('./classes/ErgoWallet');
const ErgoBlockchainService = require('./classes/ErgoBlockchainService');

/*
 * Ergo Wallet creation works and passes validation
 * Balance works and is showing 0, need to test sending ERGO to address
 * TO DO:
 * - Generate a mneumonic phrase by first capturing name and email through Sign Up process
 * - Find a secure way to store the mneumonic for now on the local drive but add support for USB thumbdrive
 * - In addition once a Thumbdrive solution works, see if you can obfuscate everywhere the phrase may be in the clear when using internal app memory
 * - How else can the mnemonic be secure?
 * - With the mneumonic secured, create a Wallet section for sending / receiving Ergo
 * - The entire app should center around the Wallet view, keep it simple
 * - Have a About, Settings and Wallet section7 
 * - git remote add origin https://github.com/tmrdev/Ergonaut-Bridge-.git
 */
async function main() {
    try {
        console.log('\n=== Creating Valid Ergo Wallet ===');
        
        const wallet = new ErgoWallet();
        const blockchain = new ErgoBlockchainService();

        // Create wallet with real Ergo addresses
        console.log('Generating wallet...');
        const walletInfo = await wallet.createWallet();
        
        console.log('\n✓ Generated Valid Ergo Wallet:');
        console.log('Mnemonic:', walletInfo.mnemonic);
        console.log('First Address:', walletInfo.address);
        
        // Validate the generated address
        const isValidAddress = ErgoWallet.isValidErgoAddress(walletInfo.address);
        console.log('Address is valid Ergo address:', isValidAddress);
        console.log('Address starts with "9" (mainnet):', walletInfo.address.startsWith('9'));

        // Generate multiple addresses
        console.log('\n=== Generating Multiple Addresses ===');
        const addresses = wallet.getAddresses(5);
        addresses.forEach((addr, index) => {
            const valid = ErgoWallet.isValidErgoAddress(addr);
            console.log(`Address ${index}: ${addr} (Valid: ${valid})`);
        });

        // Check balance of first address
        console.log('\n=== Checking Balance ===');
        const balance = await blockchain.getBalance(walletInfo.address);
        console.log('Balance:', balance);

        if (balance.ergs === 0) {
            console.log('\n=== How to Add Funds to Your Wallet ===');
            console.log('Your address is ready to receive ERG! Here\'s how:');
            console.log('1. Copy your address:', walletInfo.address);
            console.log('2. Send ERG from an exchange (KuCoin, Gate.io, etc.)');
            console.log('3. Or ask someone to send you ERG');
            console.log('4. Minimum amount: 0.001 ERG');
            console.log('5. After sending, wait 2-3 minutes and check balance again');
            console.log('\nYour wallet is now ready! 🎉');
        } else {
            console.log('🎉 Your wallet has funds!');
        }

        // Save wallet info (you might want to save this securely)
        console.log('\n=== Important: Save Your Wallet Info ===');
        console.log('⚠️  Save your mnemonic phrase securely!');
        console.log('⚠️  This is the ONLY way to recover your wallet!');
        console.log('Mnemonic:', walletInfo.mnemonic);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

main()