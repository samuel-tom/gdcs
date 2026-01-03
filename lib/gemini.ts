import OpenAI from 'openai';

// Initialize OpenAI client (server-side only)
export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured. Please add it to your environment variables.');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

// Get chat completion
export async function getChatCompletion(messages: { role: string; content: string }[]) {
  const client = getOpenAIClient();
  
  const completion = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 1024,
  });
  
  return completion.choices[0]?.message?.content || '';
}
