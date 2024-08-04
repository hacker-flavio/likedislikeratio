const fs = require("fs");
const path = require("path");

// Path to the JSON file
const filePath = path.join(__dirname, "videos.json");

// Read the JSON file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the JSON file:", err);
    return;
  }

  try {
    // Parse the JSON data
    const jsonArray = JSON.parse(data);

    // Reverse the order of the array
    const reversedArray = jsonArray.reverse();

    // Save the reversed array back to the JSON file
    fs.writeFile(
      filePath,
      JSON.stringify(reversedArray, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing to the JSON file:", err);
          return;
        }
        console.log("JSON file has been reversed and saved successfully.");
      }
    );
  } catch (error) {
    console.error("Error parsing the JSON data:", error);
  }
});
