import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a helpful AI assistant for SASTRA University's Tutor Connect platform. 

Your role is to help students:
1. Find tutors for subjects they're struggling with
2. Post help requests when they need assistance
3. Find teammates for hackathons, projects, and competitions
4. Register as tutors to help other students

Available subjects include: Data Structures, Algorithms, Python, Java, C++, JavaScript, React, Web Development, Machine Learning, AI, Database, Operating Systems, Computer Networks, Embedded Systems, UI/UX Design, Frontend/Backend Development, Digital Electronics, Statistics, Fluid Mechanics, Thermodynamics.

Departments: CSE, IT, ECE, EEE, Mechanical

When a student asks for help:
- Be friendly and encouraging
- Understand their needs (what subject, what type of help)
- Guide them to the right feature (find tutor, post request, find teammate, or become tutor)
- Keep responses short and actionable (2-3 sentences max)
- Use emojis occasionally to be friendly

Respond naturally to greetings, thanks, and casual conversation.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `User: ${message}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || "I'm not sure how to help with that. Can you rephrase?";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
