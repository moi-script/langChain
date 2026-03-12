import { OllamaEmbeddings } from "@langchain/ollama";
import fs from 'fs'
// import { MemoryVectorStore } from "@langchain/community/vectorstores/memory";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
// import { MemoryVectorStore } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";
// Initialize the embedding engine (converts text to numbers)
const embeddings = new OllamaEmbeddings({
    baseUrl: "http://localhost:11434",
    model: "nomic-embed-text", // A fast, local embedding model you can pull via Ollama
});

// Initialize an empty vector database
const vectorStore = new MemoryVectorStore(embeddings);


// To save:
// using this json file for local data starage


// Execution Example 
async function runSemanticMemory() {
    //  Create some "memories" or files
    const doc1 = new Document({
        pageContent: "The user prefers to use Tailwind CSS for UI components.",
        metadata: { source: "user_preferences.txt" }
    });
    const doc2 = new Document({
        pageContent: "The database password for the local server is 'admin123'.",
        metadata: { source: "config.env" }
    });

    //  Save them to the vector store
    await vectorStore.addDocuments([doc1, doc2]);
    console.log("Documents embedded and saved.");

    const data = JSON.stringify(vectorStore.memoryVectors); 
    fs.writeFileSync("my_ai_brain.json", data);

    //  Search for a memory based on semantic meaning
    const query = "What styling framework should I use?";

    // It doesn't look for the word "framework", it looks for the *meaning*
    const results = await vectorStore.similaritySearch(query, 1);

    console.log(`Found relevant memory: ${results[0].pageContent}`);
    // "The user prefers to use Tailwind CSS for UI components."
}   

(async () => {
    try {
        await runSemanticMemory();
    } catch(err) {
        console.log('Error executing run semantic memory :: ', err)
    }
})()