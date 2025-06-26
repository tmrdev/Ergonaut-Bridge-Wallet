const ergoLib = require('ergo-lib-wasm-nodejs');

console.log('=== Debugging ergo-lib-wasm-nodejs API ===');

console.log('\nAvailable ergoLib properties:');
console.log(Object.getOwnPropertyNames(ergoLib).sort());

console.log('\nAddress methods:');
if (ergoLib.Address) {
    console.log(Object.getOwnPropertyNames(ergoLib.Address).sort());
}

console.log('\nExtSecretKey methods:');
if (ergoLib.ExtSecretKey) {
    console.log(Object.getOwnPropertyNames(ergoLib.ExtSecretKey).sort());
}

console.log('\nPublicKey methods:');
// Let's try to create a test key to see available methods
try {
    const testSeed = Buffer.from('test'.repeat(16));
    const rootSecret = ergoLib.ExtSecretKey.derive_master(testSeed);
    const publicKey = rootSecret.public_key();
    console.log('PublicKey methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(publicKey)).sort());
} catch (error) {
    console.log('Could not create test public key:', error.message);
}