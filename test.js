import * as fs from 'fs';


console.log("Starting up...");

let data = {
  name: "peter",
  age: 32
}


writeJSONToFile(data);




function writeJSONToFile(jsonObj) {

  // convert JSON object to string
  const data = JSON.stringify(jsonObj, null, 4);

  // write JSON string to a file
  fs.writeFile(`./test.json`, data, (err) => {

    if (err) {
      console.log("something went wrong")
    }
    console.log("all good");
  });
}