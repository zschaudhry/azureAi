// https://learn.microsoft.com/en-us/javascript/api/overview/azure/openai-readme?view=azure-node-preview
const { OpenAIClient } = require("@azure/openai");
const { DefaultAzureCredential } = require("@azure/identity");

async function main(){
  const endpoint = "https://myaccount.openai.azure.com/";
  const client = new OpenAIClient(endpoint, new DefaultAzureCredential());

  const deploymentId = "gpt-35-turbo";

  const messages = [
    { role: "system", content: "You are a helpful assistant. You will talk like a pirate." },
    { role: "user", content: "Can you help me?" },
    { role: "assistant", content: "Arrrr! Of course, me hearty! What can I do for ye?" },
    { role: "user", content: "What's the best way to train a parrot?" },
  ];

  console.log(`Messages: ${messages.map((m) => m.content).join("\n")}`);

  const events = client.listChatCompletions(deploymentId, messages, { maxTokens: 128 });
  for await (const event of events) {
    for (const choice of event.choices) {
      const delta = choice.delta?.content;
      if (delta !== undefined) {
        console.log(`Chatbot: ${delta}`);
      }
    }
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});