const res = require('express/lib/response');

const express = require('express'),
    app = express(),
    puppeteer = require('puppeteer');

app.get("/", async (request, response) => {
    try {

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();

        await page.setViewport({
            width: 1920,
            height: 1080
        })

        await page.goto(request.query.url); // Read url query parameter.

        const hasTarget = typeof request.query.target !== 'undefined';
        let image;

        if (!hasTarget) {
            image = await page.screenshot({ fullPage: true });
        } else {
            const targetElement = (await page.$(request.query.target)) || null;

            if (!targetElement) {
                return res.status(404).json({ message: 'element not found on page' });
            } else {
                image = await targetElement.screenshot();
            }
        }

        await browser.close();

        response.set('Content-Type', 'image/png');
        response.send(image);

    } catch (error) {
        console.log(error);
    }
});

const listener = app.listen(3000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});