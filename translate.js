import chalk from 'chalk';
import { createRequire } from "module";
import dotenv from 'dotenv'
import * as fs from 'fs';
dotenv.config()

// All language codes: https://cloud.google.com/translate/docs/languages

console.log(chalk.green('Starting translation process...'));

// Import data
const require = createRequire(import.meta.url);
const sourceJSON = require("./static/languages/en.json");
const languages = require("./static/languages/languages.json");

// Imports the Google Cloud client library
const { Translate } = require('@google-cloud/translate').v2;

// Instantiates a client
const client = new Translate({ key: process.env.API_KEY });

console.log(chalk.yellow(`Getting translations from Google API for the following ${languages.languages.length} languages:`));
languages.languages.forEach((lang,i) => {
  console.log(chalk.yellow(i + 1, lang.label))
})


// Translate all contents of en.json file
async function translateJSON(target, label) {  
  var desktopTranslated = {};

   for (var key in sourceJSON) {
    let [translations] = await client.translate(sourceJSON[key], target);
    translations = Array.isArray(translations) ? translations : [translations];

     translations.forEach((translation, i) => {
      desktopTranslated[key] = translation.replace(/"/g, "'");
    });
   }
  
  // console.log(target, desktopTranslated);
  writeJSONToFile(desktopTranslated, target, label);
}

// Translate for all available languages
languages.languages.forEach((item) => {
  translateJSON(item.value, item.label)
})


// Write translation result to JSON file
function writeJSONToFile(jsonObj, target, label) {
  // convert JSON object to string
  const data = JSON.stringify(jsonObj, null, 4);

  // write JSON string to a file
  fs.writeFile(`./static/languages/${target}.json`, data, (err) => {
    if (err) {
      console.log(chalk.red("Something went wrong!", err))
    }
    console.log(chalk.green(`Success! Translation file saved for: ${label} -> ${target}.json `))
  });
}





