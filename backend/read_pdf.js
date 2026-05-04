const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('../Campusnest.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('../pdf_text.txt', data.text);
    console.log('PDF text extracted to pdf_text.txt');
});
