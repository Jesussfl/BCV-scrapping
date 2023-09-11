const { chromium } = require("playwright");
const cron = require("node-cron"); // importamos el módulo

const whatsappChatIdentifier = "LosSextech Historia Season";
const notionURL = "https://www.notion.so/23eb2ae6f225461485d061f389c78017?v=9a9851ad97e0410483230cfe2f84bce8";
const scheduleBot = false;

(async () => {
   if (scheduleBot) {
      cron.schedule("0 10,14,17 * * *", async () => {
         await startBot();
      });
   } else {
      await startBot();
   }
})();

async function startBot() {
   const browser = await chromium.launchPersistentContext("C:/Users/jess/AppData/Local/Google/Chrome/User Data/Default", {
      channel: "chrome",
      headless: true,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      slowMo: 400,
   });

   const page = await browser.newPage();
   const dolarPrices = await getDolarPrices(page);

   await writeDolarMessage(page, dolarPrices);

   await createNewNotionPage(page, dolarPrices);

   setTimeout(async () => {
      await browser.close();
   }, 1000);
}
async function getDolarPrices(page) {
   let dolarBCV, dolarBlue;
   try {
      await page.goto("https://www.bcv.org.ve/", { timeout: 0 });

      //Getting dolar BCV
      dolarBCV = await page.locator("#dolar .recuadrotsmc > div:last-child").textContent();
      dolarBCV = await dolarBCV.replace(",", ".");
      dolarBCV = String(parseFloat(dolarBCV).toFixed(2));
      await page.goto("https://monitordolarvenezuela.com/");

      let imgLogo = await page.$("img[src='/img/logos/enparalelo.webp']");
      let pElement = await imgLogo.$("css=~p");
      dolarBlue = await pElement.textContent();
      dolarBlue = dolarBlue.replace(/[^\d,]/g, "").replace(",", ".");

      console.log(`Dolar BCV: ${dolarBCV} - Dolar Paralelo: ${dolarBlue}`);

      return { dolarBCV, dolarBlue };
   } catch (error) {
      console.log(error);
      return { dolarBCV: "Hubo un error", dolarBlue: "Hubo un error", error: error.name };
   }
}
async function writeDolarMessage(page, dolarPrices) {
   await page.goto("https://web.whatsapp.com/", { timeout: 0 });
   await page.click(`span[title="${whatsappChatIdentifier}"]`, { timeout: 0 });

   await page.keyboard.type("🤑🥵😝 *Precio del Dolar Manos* 🍌🍑💦");
   await page.keyboard.press("Shift+Enter");
   await page.keyboard.type("┉┅━━━━━━━━━━┅┉");
   await page.keyboard.press("Shift+Enter");
   await page.keyboard.press("Shift+Enter");
   await page.keyboard.type("Dolar BCV: " + dolarPrices.dolarBCV);
   await page.keyboard.press("Shift+Enter");
   await page.keyboard.type("Dolar Paralelo: " + dolarPrices.dolarBlue);
   await page.keyboard.press("Shift+Enter");
   await page.keyboard.press("Shift+Enter");
   await page.keyboard.type("┉┅━━━━━━━━━━┅┉");

   await page.press('div[title="Type a message"]', "Enter");
}
async function createNewNotionPage(page, dolarPrices) {
   const date = new Date();
   const dateString = `${String(date.getMonth() + 1)}/${String(date.getDate())}/${String(date.getFullYear())}`;

   setTimeout(async () => {
      await page.goto(notionURL);
   }, 2000);

   await page.locator(".notion-collection-view-item-add").click();
   await page.keyboard.type(`Dolar BCV: ${dateString} - ${dolarPrices.dolarBCV}`);
   await page.keyboard.press("Tab");
   await page.keyboard.type(dolarPrices.dolarBCV);
   await page.keyboard.press("Escape");
   await page.keyboard.press("Escape");

   await page.getByRole("tab", { name: "Dolar Main" }).locator("span").click();
   await page.getByText("Dolar Price (Main)").click();
   await page.keyboard.press("Tab");
   await page.keyboard.press("Control+A");
   await page.keyboard.press("Backspace");
   await page.keyboard.type(dolarPrices.dolarBCV);
   await page.keyboard.press("Tab");
   await page.keyboard.press("Backspace");

   await page.keyboard.type(dateString);
   await page.keyboard.press("Escape");
   await page.keyboard.press("Escape");
}
