const fs = require('fs');
const iconv = require('iconv-lite');

// Let's get the mapping for windows-874
// Wait, we can encode to windows-874 using iconv-lite.
// Since the file has UTF-8 characters that are the result of treating UTF-8 bytes as windows-874 and then encoded to UTF-8
// To reverse: take the string, encode to windows-874 (which gives the original UTF-8 bytes), then decode as UTF-8.

const fileContent = fs.readFileSync('app/page.tsx', 'utf8');

try {
    // Reverse the double-encoding
    const buf = iconv.encode(fileContent, 'windows-874');
    const restored = buf.toString('utf8');
    
    // Check if restored looks like good Thai
    console.log(restored.substring(0, 1000));
    
    // Save to a test file
    fs.writeFileSync('app/page_restored.tsx', restored, 'utf8');
    console.log('Successfully wrote to app/page_restored.tsx');
} catch (e) {
    console.error(e);
}
