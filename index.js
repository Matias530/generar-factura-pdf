const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '10mb' })); 

app.post('/generar-pdf', async (req, res) => {
    const { html } = req.body;

    if (!html) {
        return res.status(400).send('Falta el código HTML');
    }

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        res.contentType("application/pdf");
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error generando PDF:", error);
        res.status(500).send('Error interno generando el documento');
    } finally {
        if (browser) await browser.close();
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Microservicio de PDFs corriendo en el puerto ${PORT}`);
});
