import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface ChatRequest {
  message: string;
  context?: {
    currentUser?: {
      name?: string;
      department?: string;
      year?: string;
    };
    mode?: 'general' | 'find_tutor' | 'find_teammate' | 'chat_help';
    candidates?: any[];
  };
}

interface ChatResponse {
  reply: string;
  action?: {
    type: 'navigate';
    url: string;
  };
}

// Smart pattern-based responses (no API needed - works offline!)
function getSmartResponse(message: string, context?: ChatRequest['context']): ChatResponse {
  const msg = message.toLowerCase();
  
  // Tutor-related queries
  if (msg.includes('tutor') || msg.includes('teach') || msg.includes('help with subject')) {
    return {
      reply: `I can help you find a tutor! Head over to the **Tutor Matching** section from the dashboard. You can:
- Browse available tutors by subject
- Filter by department and year
- Contact tutors directly via their email
- Or become a tutor yourself to help others!

Taking you to the Tutor Matching page now...`,
      action: {
        type: 'navigate',
        url: '/tutors'
      }
    };
  }
  
  // Teammate-related queries
  if (msg.includes('teammate') || msg.includes('hackathon') || msg.includes('project') || msg.includes('team')) {
    return {
      reply: `Looking for teammates? Great! Check out the **Find Teammates** section where you can:
- Find students interested in hackathons and projects
- Filter by skills and interests
- Connect with potential team members
- Post your own profile to attract teammates

Taking you to the Find Teammates page now...`,
      action: {
        type: 'navigate',
        url: '/teammates'
      }
    };
  }
  
  // Chat room queries
  if (msg.includes('chat') || msg.includes('room') || msg.includes('discuss')) {
    return {
      reply: `Our **Community Chat** has several public rooms where you can connect with other students:
- **General** - General discussions
- **Hackathons** - Discuss competitions and team formation
- **Academics** - Study tips and academic discussions
- **Placements** - Interview prep and job opportunities
- **Off-topic** - Random fun conversations

Taking you to the chat rooms now...`,
      action: {
        type: 'navigate',
        url: '/chats'
      }
    };
  }
  
  // Greetings
  if (msg.match(/^(hi|hello|hey|sup|yo|greetings)/)) {
    const userName = context?.currentUser?.name ? `, ${context.currentUser.name.split(' ')[0]}` : '';
    return {
      reply: `Hey${userName}! 👋 Welcome to SASTRA's student platform. I'm here to help you:

🎓 **Find Tutors** - Get help with your subjects
👥 **Find Teammates** - Connect for hackathons and projects  
💬 **Community Chat** - Join topic-based discussion rooms

What can I help you with today?`
    };
  }
  
  // Help queries
  if (msg.includes('help') || msg.includes('how') || msg.includes('what can you')) {
    return {
      reply: `I can help you navigate the platform! Here's what you can do:

**📚 Tutor Matching**
- Find tutors for any subject
- Become a tutor and help others
- Submit requests for specific topics

**👥 Find Teammates**
- Connect with students for hackathons
- Build teams for projects
- Share your skills and interests

**💬 Community Chat**
- Join public discussion rooms
- Chat about academics, placements, hackathons, and more

What would you like to explore first?`
    };
  }
  
  // Department/Year specific
  if (msg.includes('cse') || msg.includes('computer science')) {
    return {
      reply: `CSE students! We have many tutors and teammates from Computer Science. Check out:
- Tutor Matching for help with DSA, DBMS, OS, Networks, etc.
- Find Teammates for hackathons and coding competitions
- Join the **Academics** and **Hackathons** chat rooms!`
    };
  }
  
  // Thank you
  if (msg.includes('thank') || msg.includes('thanks')) {
    return {
      reply: `You're welcome! Feel free to ask if you need anything else. Good luck with your studies and projects! 🚀`
    };
  }
  
  // Default intelligent response
  return {
    reply: `I'm here to help you make the most of this platform! You can:

✅ Browse and connect with **tutors** for academic help
✅ Find **teammates** for hackathons and projects
✅ Join **chat rooms** to discuss with fellow students

Try asking me about tutors, teammates, or chat rooms, and I'll guide you! What are you interested in?`
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Get smart response
    const response = getSmartResponse(body.message, body.context);

    return NextResponse.json({
      reply: response.reply,
      action: response.action,
      success: true
    });

  } catch (error: any) {
    console.error('Chat Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        fallbackReply: "I'm having trouble right now. Try browsing the Tutor Matching or Find Teammates sections!",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Smart chat assistant is ready!',
    mode: 'pattern-based'
  });
}
