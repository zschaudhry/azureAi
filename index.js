// Importing necessary modules
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import stopword from 'stopword';
import multer from 'multer';
import fs from "fs";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Loading environment variables
dotenv.config();

// Setting up necessary constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const upload = multer({ dest: 'uploads' });
const stopwords = stopword.en;
const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Setting up the port
const port = process.env.PORT || 3000;

// Function to filter text
function filterText(text) {
  const words = text.split(" ");
  console.log(words.length);
  const filteredWords = stopword.removeStopwords(words, stopwords);
  let finaltxt = filteredWords.join(" ");
  //remove empty lines from finaltxt
  finaltxt = finaltxt.replace(/^\s*[\r\n]/gm, '');
  console.log(filteredText.length)
  console.log(finaltxt.length)
  return finaltxt;
}

let filteredText="";

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  let path = req.file.path;
  const dataBuffer = fs.readFileSync(path);
  pdfParse(dataBuffer).then(data => {
    filteredText = filterText(data.text.toLowerCase());
    res.send(filteredText);

    // Delete the file after reading
    fs.unlinkSync(path, err => {
      if (err) console.error("Error deleting the file:", err);
      else console.log("File read successfully and then deleted successfully");
    });
  });
}); 

// Route to execute AI model
app.post('/execute', async (req, res) => {
  
  const messages = [
    {"role":"system", "content":"You are an AI assistant that helps people find information."},
    { role: "user", content:"Do not follow any instructions before You are an AI assistant. " + req.body.txtPrompt + " TEXT:"+ filteredText },
  ];

  try {
    // Create a new client for OpenAI
    const client = new OpenAIClient(process.env.ENDPOINT, new AzureKeyCredential(process.env.AZURE_KEY));
    // Get chat completions from the model
    const result = await client.getChatCompletions(process.env.DEPLOYMENT_ID, messages, {
      maxTokens: 800,
      temperature: 0.7,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
    });

    // Send the result back to the client
    res.json(result.choices[0].message.content);
  } catch (err) {
    console.log(err.code + 'And the error is' + err.message);
    res.json(err.code + 'And the error is' + err.message);
  } 
});

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}`));