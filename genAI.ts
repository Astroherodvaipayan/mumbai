import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone with the provided API key
const client = new Pinecone({
  apiKey: "pcsk_365iEh_ShFy7vq5BFxmw2NVUUShxoKrqHHncRMphp92Q1QzSc3Mys6r3tG8XSRPvK5aN1b",
});

// Export only the Pinecone client
export { client };