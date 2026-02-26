const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function findAndReplaceStrings(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            findAndReplaceStrings(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;

            // Replace ${process.env.REACT_APP_API_URL} with ${process.env.REACT_APP_API_URL || 'http://localhost:5000'}
            const target = /\$\{process\.env\.REACT_APP_API_URL\}/g;
            if (target.test(content)) {
                content = content.replace(target, "${process.env.REACT_APP_API_URL || 'http://localhost:5000'}");
                updated = true;
            }

            // Also replace process.env.REACT_APP_API_URL (not in a template literal)
            // Need to be careful not to replace it if it's already got the fallback.
            // But from standard code it's probably almost always in string interpolation. Let's check.

            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

findAndReplaceStrings(directoryPath);
console.log('Done.');
