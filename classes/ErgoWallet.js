const bip39 = require('bip39');
const ergoLib = require('ergo-lib-wasm-nodejs');

class ErgoWallet {
    constructor() {
        this.wallet = null;
        this.addresses = new Map();
    }

    async createWallet(mnemonic = null) {
        if (!mnemonic) {
            mnemonic = bip39.generateMnemonic(128);
        }

        if (!bip39.validateMnemonic(mnemonic)) {
            throw new Error('Invalid mnemonic phrase');
        }

        const seed = await bip39.mnemonicToSeed(mnemonic);
        
        this.wallet = {
            mnemonic,
            seed
        };

        // Generate the first real Ergo address
        const address = this.generateRealErgoAddress(0);

        return {
            mnemonic,
            address
        };
    }

    generateRealErgoAddress(index = 0) {
        try {
            // Create extended secret key from seed
            const rootSecret = ergoLib.ExtSecretKey.derive_master(this.wallet.seed);
            
            // Derive using Ergo's standard path: m/44'/429'/0'/0/index
            const path = ergoLib.DerivationPath.new(44, [429, 0, 0, index]);
            const childSecret = rootSecret.derive(path);
            
            // Get extended public key
            const extPubKey = childSecret.public_key();
            
            // Get the raw public key bytes
            const pubKeyBytes = extPubKey.pub_key_bytes();
            
            // Create address from public key bytes - try both methods
            let address;
            
            try {
                // Method 1: Using p2pk_from_pk_bytes
                address = ergoLib.Address.p2pk_from_pk_bytes(pubKeyBytes);
            } catch (error1) {
                try {
                    // Method 2: Using from_public_key with ExtPubKey
                    address = ergoLib.Address.from_public_key(extPubKey);
                } catch (error2) {
                    // Method 3: Using the to_address method on ExtPubKey
                    address = extPubKey.to_address(ergoLib.NetworkPrefix.Mainnet);
                }
            }
            
            // Convert to mainnet address string
            const addressString = address.to_base58(ergoLib.NetworkPrefix.Mainnet);
            
            return addressString;
        } catch (error) {
            console.error('Error generating real Ergo address:', error);
            throw error;
        }
    }

    getAddress(index = 0) {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }

        if (this.addresses.has(index)) {
            return this.addresses.get(index);
        }

        const address = this.generateRealErgoAddress(index);
        this.addresses.set(index, address);
        return address;
    }

    getAddresses(count = 1) {
        const addresses = [];
        for (let i = 0; i < count; i++) {
            addresses.push(this.getAddress(i));
        }
        return addresses;
    }

    // Validate if an address is a valid Ergo address
    static isValidErgoAddress(address) {
        try {
            const addr = ergoLib.Address.from_base58(address);
            return true;
        } catch (error) {
            return false;
        }
    }

    getMnemonic() {
        return this.wallet ? this.wallet.mnemonic : null;
    }

    // Get extended secret key for signing transactions
    getExtSecretKey(index = 0) {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }

        try {
            const rootSecret = ergoLib.ExtSecretKey.derive_master(this.wallet.seed);
            const path = ergoLib.DerivationPath.new(44, [429, 0, 0, index]);
            const childSecret = rootSecret.derive(path);
            return childSecret;
        } catch (error) {
            console.error('Error getting extended secret key:', error);
            throw error;
        }
    }

    // Get public key for address index
    getPublicKey(index = 0) {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }

        try {
            const extSecretKey = this.getExtSecretKey(index);
            return extSecretKey.public_key();
        } catch (error) {
            console.error('Error getting public key:', error);
            throw error;
        }
    }
}

module.exports = ErgoWallet;