const fs = require('fs');

const pageContent = fs.readFileSync('app/page.tsx', 'utf8');

// The decoding strategy: 
// 1. Convert the wrong utf-8 string back into bytes treating it as latin1/windows-1252/iso-8859-1
// 2. Decode those bytes using window-874 / TIS-620 if possible, or just buffer.toString('utf8')
// Wait, TIS-620 string was mistakenly interpreted as... what?
// Actually, 'เธ' etc. are typical when a UTF-8 string is interpreted as Windows-874 and saved back as UTF-8. 
// Let's print out what buffer.toString('utf8') does when we give it the latin1 byte representation of the mojibake.
const testStr = 'เธšเธฃเธดเธ เธฒเธฃเธ•เธดเธ”เธ•เธฑเน‰เธ‡เธŸเธดเธฅเนŒเธกเธญเธฒเธ„เธฒเธฃเธžเธฃเธตเน€เธกเธตเธขเธก';
console.log(Buffer.from(testStr, 'latin1').toString('utf8'));
