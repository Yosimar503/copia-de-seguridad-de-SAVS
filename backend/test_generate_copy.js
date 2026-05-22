const { generateBannerCopy } = require('./services/visionService');

async function test() {
    console.log('Testing generateBannerCopy with generic, numeric, and specific names...');
    
    const testCases = [
        'Toyota Corolla 2022 Rojo.jpg',
        '701737741_958855553574812_438.jpg',
        'whatsapp_image_2026.png',
        'Suzuki Jimny 2023 Verde.png',
        'Screenshot_2026-05-19.png'
    ];

    const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    for (const filename of testCases) {
        console.log(`\n--- Test Case: ${filename} ---`);
        try {
            const res = await generateBannerCopy(mockBase64, 'image/png', filename);
            console.log('Result:', res);
        } catch (e) {
            console.error('Error:', e.message);
        }
    }
}

test();
