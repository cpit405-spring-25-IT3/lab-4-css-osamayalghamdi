const fs = require('fs');
const cheerio = require('cheerio');

const htmlContent = fs.readFileSync('../index.html', 'utf-8');

const cssFiles = fs.readdirSync('../').filter(fn => fn.endsWith('.css'));
if (cssFiles && cssFiles.length !== 1) {
    console.error('Error: One .css file should exist in the root directory');
    process.exit(1);
}
const cssContent = fs.readFileSync('../' + cssFiles[0], 'utf-8');
const $ = cheerio.load(htmlContent);

let errors = [];

// Check if form exists
const form = $('form');
if (form.length === 0) {
    errors.push('No <form> element found');
} else {
    const expectedElements = [
        { type: 'text', count: 3 },
        { type: 'email', count: 1 },
        { type: 'tel', count: 1 },
        { type: 'number', count: 2 },
        { type: 'date', count: 1 },
        { type: 'select', count: 2 },
        { type: 'textarea', count: 1 }
    ];

    
    expectedElements.forEach(element => {
        let actualCount;
        if (element.type === 'select') {
            actualCount = $('select').length;
        } else if (element.type === 'textarea') {
            actualCount = $('textarea').length;
        } else {
            actualCount = $(`input[type="${element.type}"]`).length;
        }

        if (actualCount !== element.count) {
            errors.push(`Expected ${element.count} ${element.type} element(s), but found ${actualCount}`);
        }
    });


    const labelCount = $('label').length;
    const expectedLabelCount = 11;
    if (labelCount !== expectedLabelCount) {
        errors.push(`Expected ${expectedLabelCount} labels, but found ${labelCount}`);
    }

    $('input[type="number"]').each((i, el) => {
        const min = $(el).attr('min');
        const max = $(el).attr('max');
        if (!min || !max) {
            errors.push('Number input missing min or max attributes');
        }
    });

    $('textarea').each((i, el) => {
        const cols = $(el).attr('cols');
        const rows = $(el).attr('rows');
        if (!cols || !rows) {
            errors.push('Textarea missing cols or rows attributes');
        }
    });
}

if (errors.length > 0) {
    console.error('Error: Your submission did not meet the lab requirements. Errors: ');
    errors.forEach(error => console.error('- ' + error));
    process.exit(1);
} else {
    console.log('Success: Your submission meets the lab requirements');
}
