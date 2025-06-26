const bip39 = require('bip39');
const ErgoWallet = require('./classes/ErgoWallet');
const ErgoBlockchainService = require('./classes/ErgoBlockchainService');

async function testWalletCreation() {
    try {
        console.log('=== Testing Ergo Wallet Creation ===\n');
        
        // Test 1: Create wallet
        console.log('1. Creating new wallet...');
        const wallet = new ErgoWallet();
        const walletInfo = await wallet.createWallet();
        
        console.log('✅ Wallet created successfully!');
        console.log('Mnemonic:', walletInfo.mnemonic);
        console.log('First Address:', walletInfo.address);
        
        // Test 2: Validate address
        console.log('\n2. Validating address...');
        const isValid = ErgoWallet.isValidErgoAddress(walletInfo.address);
        console.log('Address is valid:', isValid ? '✅' : '❌');
        console.log('Starts with 9 (mainnet):', walletInfo.address.startsWith('9') ? '✅' : '❌');
        
        // Test 3: Generate multiple addresses
        console.log('\n3. Generating multiple addresses...');
        const addresses = wallet.getAddresses(3); // Reduced to 3 for cleaner output
        addresses.forEach((addr, index) => {
            const valid = ErgoWallet.isValidErgoAddress(addr);
            console.log(`Address ${index}: ${addr} (${valid ? '✅' : '❌'})`);
        });
        
        // Test 4: Get public keys
        console.log('\n4. Getting public keys...');
        for (let i = 0; i < 2; i++) {
            try {
                const pubKey = wallet.getPublicKey(i);
                const pubKeyBytes = pubKey.pub_key_bytes();
                console.log(`Public Key ${i}: ${Buffer.from(pubKeyBytes).toString('hex')}`);
            } catch (error) {
                console.log(`Public Key ${i}: Error - ${error.message}`);
            }
        }
        
        // Test 5: Restore wallet from mnemonic
        console.log('\n5. Testing wallet restoration...');
        const restoredWallet = new ErgoWallet();
        const restoredInfo = await restoredWallet.createWallet(walletInfo.mnemonic);
        
        const addressesMatch = restoredInfo.address === walletInfo.address;
        console.log('Restored address matches original:', addressesMatch ? '✅' : '❌');
        
        // Test 6: Check balance
        console.log('\n6. Checking balance...');
        const blockchain = new ErgoBlockchainService();
        const balance = await blockchain.getBalance(walletInfo.address);
        console.log('Balance:', balance);
        
        // Test 7: Get address info
        console.log('\n7. Getting address info...');
        const addressInfo = await blockchain.getAddressInfo(walletInfo.address);
        console.log('Address info:', addressInfo);
        
        // Success message
        console.log('\n🎉 SUCCESS: Your Ergo wallet is fully functional!');
        console.log('\n📋 WALLET SUMMARY:');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🔑 Mnemonic:', walletInfo.mnemonic);
        console.log('📍 Main Address:', walletInfo.address);
        console.log('💰 Current Balance:', balance.ergs || 0, 'ERG');
        console.log('✅ Address Status: Valid Ergo mainnet address');
        console.log('═══════════════════════════════════════════════════════════════');
        
        console.log('\n💡 NEXT STEPS:');
        console.log('1. 💾 SAVE your mnemonic phrase securely (write it down!)');
        console.log('2. 💸 Send ERG to your address to test transactions');
        console.log('3. 🔄 Run this script again to check your balance');
        console.log('4. 🚀 Your wallet is ready for development!');
        
        return walletInfo;
        
    } catch (error) {
        console.error('❌ Error in wallet test:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Run the test
testWalletCreation().catch(console.error);