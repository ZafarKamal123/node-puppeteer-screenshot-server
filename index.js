const res = require('express/lib/response');

const express = require('express'),
    app = express(),
    puppeteer = require('puppeteer'),
    RequestQ = require('express-request-queue');

app.use(express.json());

const q = new RequestQ();

app.post("/", q.run(async (request, response) => {
    
    const browser = await puppeteer.launch({
        args: [
            '--disable-setuid-sandbox',
            '--autoplay-policy=user-gesture-required',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-domain-reliability',
            '--disable-extensions',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-notifications',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-popup-blocking',
            '--disable-print-preview',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-setuid-sandbox',
            '--disable-speech-api',
            '--disable-sync',
            '--hide-scrollbars',
            '--ignore-gpu-blacklist',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-first-run',
            '--no-pings',
            '--no-sandbox',
            '--no-zygote',
            '--password-store=basic',
            '--use-gl=swiftshader',
            '--use-mock-keychain',
        ],
        headless: true,
        userDataDir: './cache'
    });
    
    try {

        const page = await browser.newPage();

        await page.setViewport({
            width: 1920,
            height: 1080
        })

        await page.goto(request.body.url, { waitUntil: 'networkidle0', timeout: 300000 }); // Read url query parameter.

        const hasTarget = typeof request.body.target !== 'undefined';
        let image;

        if (!hasTarget) {
            image = await page.screenshot({ fullPage: true });
        } else {
            const targetElement = (await page.$(request.body.target)) || null;

            if (!targetElement) {
                return res.status(404).json({ message: 'element not found on page' });
            } else {
                image = await targetElement.screenshot();
            }
        }

        response.set('Content-Type', 'image/png');
        response.send(image);

    } catch (error) {
        console.log(error);
    } finally {
        browser.close();
    }
}));

const listener = app.listen(3000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});