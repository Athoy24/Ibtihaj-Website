import fs from 'fs';

try {
    if (!fs.existsSync('.env')) {
        console.log('.env file NOT FOUND');
    } else {
        const env = fs.readFileSync('.env', 'utf8');
        console.log('VITE_GOOGLE_SHEET_URL exists:', env.includes('VITE_GOOGLE_SHEET_URL='));
        console.log('Is Placeholder URL:', env.includes('your_web_app_url_here'));

        const urlLine = env.split('\n').find(line => line.startsWith('VITE_GOOGLE_SHEET_URL='));
        if (urlLine) {
            const url = urlLine.split('=')[1].trim();
            console.log('URL starts with https://script.google.com:', url.startsWith('https://script.google.com'));
        }
    }
} catch (e) {
    console.error('Error:', e.message);
}
