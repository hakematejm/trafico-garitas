const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const garita = 'Otay Mesa';
const url = 'https://bwt.cbp.gov/details/250601/POV';

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // para que lo veas en acción
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Espera hasta que el texto "Loading..." desaparezca
    await page.waitForFunction(() => {
      const el = document.querySelector('.loading-message') || document.body;
      return !el.innerText.includes('Loading data');
    }, { timeout: 30000 });

    // Ahora extrae datos de la tabla
    const resultados = await page.evaluate(() => {
      const filas = Array.from(document.querySelectorAll('.table tbody tr'));
      return filas.map(fila => {
        const celdas = fila.querySelectorAll('td');
        return {
          tipo: celdas[0]?.innerText.trim(),
          tiempo: celdas[1]?.innerText.trim()
        };
      });
    });

    for (const resultado of resultados) {
      const tipo = resultado.tipo.toUpperCase();
      const minutos = parseInt(resultado.tiempo) || 0;

      await db.collection('cruces').add({
        garita,
        tipoLinea: tipo,
        tiempoMinutos: minutos,
        timestamp: new Date()
      });

      console.log(`✅ ${tipo}: ${minutos} min`);
    }
  } catch (err) {
    console.error('❌ Error al esperar datos:', err.message);
  } finally {
    await browser.close();
  }
})();
