require("dotenv").config({ path: "./config/.env" });

var puppeteer = require("puppeteer");
var PDFmerge = require("pdf-merge");
var path = require("path");
var del = require("del");

const environment = process.env.NODE_ENV;
const buildPath = path.join(".", "build", environment);
const resumePDFfileName = "Resume_Matt-Kadlubowski";

async function main() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	let PDFoptions = {
		format: "A4",
		// margin: {},
	};

	await page.goto("http://localhost:8080/#first-page");
	// Wait until "Browser-sync" pop-up disappear
	await page.waitForTimeout(3000);

	await page.pdf({
		path: path.join(buildPath, `${resumePDFfileName}-page1.pdf`),
		...PDFoptions,
	});
	await page.goto("http://localhost:8080/#second-page");
	await page.pdf({
		path: path.join(buildPath, `${resumePDFfileName}-page2.pdf`),
		...PDFoptions,
	});

	await browser.close();

	await PDFmerge(
		[
			path.join(buildPath, `${resumePDFfileName}-page1.pdf`),
			path.join(buildPath, `${resumePDFfileName}-page2.pdf`),
		],
		{ output: path.join(buildPath, `${resumePDFfileName}.pdf`) }
	);

	await del(path.join(buildPath, `${resumePDFfileName}-page1.pdf`));
	await del(path.join(buildPath, `${resumePDFfileName}-page2.pdf`));
}

main();
