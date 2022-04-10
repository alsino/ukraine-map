import chalk from 'chalk';
import { createRequire } from "module";
import dotenv from 'dotenv'
import * as fs from 'fs';
dotenv.config()

console.log(chalk.green('Getting translations from Google API...'));

// Import data
const require = createRequire(import.meta.url);
const sourceJSON = require("./static/languages/en.json");
const languages = require("./static/languages/languages.json");

// Imports the Google Cloud client library
const { Translate } = require('@google-cloud/translate').v2;

// Instantiates a client
const client = new Translate({ key: process.env.API_KEY });


// Translate all contents of en.json file
async function translateJSON(target) {  
  var desktopTranslated = {};

   for (var key in sourceJSON) {
    let [translations] = await client.translate(sourceJSON[key], target);
    translations = Array.isArray(translations) ? translations : [translations];

     translations.forEach((translation, i) => {
      desktopTranslated[key] = translation.replace(/"/g, "'");
    });
   }
  
  console.log(target, desktopTranslated);
  writeJSONToFile(desktopTranslated, target);
}

// Translate for all available languages
languages.languages.forEach((item) => {
  translateJSON(item.value)
})


// Write translation result to JSON file
function writeJSONToFile(jsonObj, target) {
  // convert JSON object to string
  const data = JSON.stringify(jsonObj, null, 4);

  // write JSON string to a file
  fs.writeFile(`./static/languages/${target}.json`, data, (err) => {
    if (err) {
      throw err;
    }
    console.log("JSON data is saved.");
  });
}





