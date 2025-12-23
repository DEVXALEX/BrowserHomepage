
(function () {
    // Paste the helpers from crypto.js
    const hexToBuf = function (hex) {
        if (!hex) return new Uint8Array([]); // Handle empty/null
        const matches = hex.match(/.{1,2}/g);
        return new Uint8Array(matches ? matches.map(byte => parseInt(byte, 16)) : []);
    };

    const bufToHex = function (buf) {
        return Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    // Test Case 1: Simple
    const original = new Uint8Array([0, 255, 10, 16]);
    const hex = bufToHex(original);
    console.log("Hex:", hex); // expected: 00ff0a10

    const restored = hexToBuf(hex);
    console.log("Restored:", restored);

    const match = original.every((val, i) => val === restored[i]);
    console.log("Match:", match);

    // Test Case 2: Round Trip with real Salt
    const saltHex = "18260a950a7c4a16";
    const saltBuf = hexToBuf(saltHex);
    const saltHexBack = bufToHex(saltBuf);
    console.log("Salt Check:", saltHex === saltHexBack);

})();
