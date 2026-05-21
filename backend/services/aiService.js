const Groq = require('groq-sdk');

// ────────────────────────────────────────────────────────────────────────────
// Initialize Groq Client
// If the key is missing the app runs in MOCK mode so devs can test without keys
// ────────────────────────────────────────────────────────────────────────────
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn(
      'WARNING: GROQ_API_KEY environment variable is not set. AI functions will run in MOCK mode.'
    );
    return null;
  }
  return new Groq({ apiKey });
};

// Groq model to use — llama-3.3-70b-versatile is Groq's flagship free model
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ────────────────────────────────────────────────────────────────────────────
// Helper: call Groq chat completions and return the text content
// ────────────────────────────────────────────────────────────────────────────
const callGroq = async (client, systemPrompt, userPrompt, temperature = 0.7) => {
  const chatCompletion = await client.chat.completions.create({
    model: GROQ_MODEL,
    temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });
  return chatCompletion.choices[0]?.message?.content?.trim() || '';
};

// ────────────────────────────────────────────────────────────────────────────
// Helper: strip markdown fences and safely parse JSON from AI response
// ────────────────────────────────────────────────────────────────────────────
const parseJSONResponse = (text) => {
  try {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    else if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, clean.length - 3);
    return JSON.parse(clean.trim());
  } catch (err) {
    console.error('Error parsing JSON from AI response:', err);
    // Fallback: grab content between first { and last }
    try {
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first !== -1 && last !== -1) {
        return JSON.parse(text.substring(first, last + 1));
      }
    } catch (fallback) {
      console.error('Fallback JSON parse also failed:', fallback);
    }
    throw new Error('AI returned structurally invalid data. Please try again.');
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 1. Generate Interview Questions
// ────────────────────────────────────────────────────────────────────────────
const generateInterviewQuestions = async (role, skills, difficulty, experience, numQuestions = 5) => {
  const client = getGroqClient();

  if (!client) {
    return {
      questions: [
        { questionText: `Introduce yourself and explain your experience as a ${role}.`, category: 'HR' },
        { questionText: `How do you manage state in a project using ${skills.join(', ')}?`, category: 'Technical' },
        { questionText: 'Describe the hardest bug you ever fixed and your debugging process.', category: 'Scenario' },
        { questionText: 'How do you approach optimizing database queries at scale?', category: 'Technical' },
        { questionText: 'Why do you want to join our organization?', category: 'HR' }
      ].slice(0, numQuestions)
    };
  }

  const system = 'You are a professional technical recruiter. You generate structured mock interview questions. Always respond with valid JSON only — no markdown, no explanation outside the JSON block.';

  const user = `Generate exactly ${numQuestions} mock interview questions for:
- Role: ${role}
- Skills: ${skills.join(', ')}
- Difficulty: ${difficulty}
- Experience: ${experience} years

Mix the categories: Technical, Behavioral, HR, Scenario.

Return ONLY this JSON structure:
{
  "questions": [
    { "questionText": "...", "category": "Technical" }
  ]
}`;

  try {
    const text = await callGroq(client, system, user, 0.7);
    return parseJSONResponse(text);
  } catch (error) {
    console.error('Groq question generation failed:', error);
    throw error;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 2. Evaluate a Candidate Answer
// ────────────────────────────────────────────────────────────────────────────
const evaluateAnswer = async (questionText, userAnswer) => {
  const client = getGroqClient();

  if (!client || !userAnswer.trim()) {
    const score = userAnswer.length > 50 ? 82 : 65;
    return {
      score,
      grammarFeedback: 'Good overall grammar with minor hesitation markers.',
      correctnessFeedback: 'Covers the basics. Deeper technical examples would strengthen the response.',
      communicationFeedback: 'Clear communication style and logical thought layout.',
      fillerWordsCount: 2,
      overallFeedback: 'Solid effort. Adding real-world examples will increase credibility significantly.'
    };
  }

  const system = 'You are an expert technical interviewer. Evaluate candidate responses and return structured JSON feedback only. No markdown outside JSON.';

  const user = `Question: "${questionText}"
Candidate Answer: "${userAnswer}"

Score the answer out of 100 based on: technical correctness, completeness, grammar, communication. Count filler words (um, uh, like, basically, you know, actually).

Return ONLY this JSON:
{
  "score": 85,
  "grammarFeedback": "...",
  "correctnessFeedback": "...",
  "communicationFeedback": "...",
  "fillerWordsCount": 2,
  "overallFeedback": "..."
}`;

  try {
    const text = await callGroq(client, system, user, 0.4);
    return parseJSONResponse(text);
  } catch (error) {
    console.error('Groq answer evaluation failed:', error);
    throw error;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 3. Generate a GD Participant Response
// ────────────────────────────────────────────────────────────────────────────
const generateGDResponse = async (topic, conversationHistory, participantName, participantPersona) => {
  const client = getGroqClient();

  if (!client) {
    return `On the topic of "${topic}", I think we must balance technical feasibility with long-term social impact. Setting shared standards first will lead to better outcomes for everyone involved.`;
  }

  const transcript = conversationHistory
    .map((t) => `${t.speaker}: "${t.text}"`)
    .join('\n');

  const system = `You are simulating a Group Discussion participant named "${participantName}" with the persona: "${participantPersona}". Speak naturally, in first-person. Never break character. Be concise (3-4 sentences max).`;

  const user = `GD Topic: "${topic}"

Current transcript:
${transcript}

Add your next contribution to this debate. React directly to the last speaker's point.`;

  try {
    const text = await callGroq(client, system, user, 0.85);
    return text;
  } catch (error) {
    console.error('Groq GD response failed:', error);
    return 'I believe we need to weigh both practical constraints and ethical considerations carefully before reaching a conclusion.';
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 4. Evaluate a Full GD Session
// ────────────────────────────────────────────────────────────────────────────
const evaluateGDSession = async (topic, conversationHistory) => {
  const client = getGroqClient();

  if (!client) {
    return {
      leadership: 75,
      criticalThinking: 80,
      relevance: 85,
      communication: 78,
      confidence: 82,
      overallScore: 80,
      overallFeedback:
        'Good participation overall. Work on initiating stronger arguments and steering discussions toward consensus.'
    };
  }

  const transcript = conversationHistory
    .map((t) => `${t.speaker}: "${t.text}"`)
    .join('\n');

  const system = 'You are a professional GD assessor. Evaluate the "User" participant and return structured JSON only. No markdown outside JSON.';

  const user = `GD Topic: "${topic}"

Full transcript:
${transcript}

Grade the "User" participant (0-100) on:
1. Leadership
2. Critical Thinking
3. Topic Relevance
4. Communication
5. Confidence

Return ONLY this JSON:
{
  "leadership": 80,
  "criticalThinking": 85,
  "relevance": 90,
  "communication": 75,
  "confidence": 80,
  "overallScore": 82,
  "overallFeedback": "..."
}`;

  try {
    const text = await callGroq(client, system, user, 0.4);
    return parseJSONResponse(text);
  } catch (error) {
    console.error('Groq GD evaluation failed:', error);
    throw error;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 5. Analyze a Resume (ATS Audit)
// ────────────────────────────────────────────────────────────────────────────
const analyzeResume = async (resumeText, targetRole, targetSkills) => {
  const client = getGroqClient();

  if (!client) {
    return {
      atsScore: 72,
      skillGap: ['Docker', 'AWS', 'GraphQL'],
      formattingTips: ['Unify date formats (e.g. MM/YYYY)', 'Remove multi-column tables for ATS compatibility'],
      improvements: ['Add quantified metrics to experience bullets', 'Include a professional summary statement'],
      fullReport:
        'Your resume shows a strong technical background but lacks cloud deployment skills and quantified achievements. Adding measurable results will increase ATS success rates significantly.'
    };
  }

  const system = 'You are an expert ATS auditor and career coach. Analyze resumes thoroughly and return structured JSON only. No markdown outside JSON.';

  const user = `Audit this resume for the role: "${targetRole}"
Preferred skills: ${targetSkills.join(', ')}

Resume text:
${resumeText}

Identify missing keywords, skill gaps, ATS formatting problems, and improvement points.

Return ONLY this JSON:
{
  "atsScore": 68,
  "skillGap": ["Skill 1", "Skill 2"],
  "formattingTips": ["Tip 1", "Tip 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "fullReport": "..."
}`;

  try {
    const text = await callGroq(client, system, user, 0.4);
    return parseJSONResponse(text);
  } catch (error) {
    console.error('Groq resume analysis failed:', error);
    throw error;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 6. Generate Coding Feedback
// ────────────────────────────────────────────────────────────────────────────
const generateCodingFeedback = async (problemTitle, code, language) => {
  const client = getGroqClient();

  if (!client) {
    return {
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      bugs: 'No critical bugs found. Watch for edge cases with empty array inputs.',
      suggestions: 'Consider in-place pointer swapping to reduce space complexity.',
      overallScore: 88
    };
  }

  const system = 'You are a senior software engineer doing a code review. Return structured JSON only. No markdown outside JSON.';

  const user = `Problem: "${problemTitle}"
Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`

Determine Big-O Time and Space Complexity. Find any bugs or edge-case failures. Suggest clean, production-ready improvements.

Return ONLY this JSON:
{
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "bugs": "...",
  "suggestions": "...",
  "overallScore": 90
}`;

  try {
    const text = await callGroq(client, system, user, 0.3);
    return parseJSONResponse(text);
  } catch (error) {
    console.error('Groq coding feedback failed:', error);
    throw error;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 7. Chatbot / Coach Assistant Response
// ────────────────────────────────────────────────────────────────────────────
const chatAssistantResponse = async (message, context = '') => {
  const client = getGroqClient();

  if (!client) {
    return 'I am your AI Interview Coach! Please set your GROQ_API_KEY in the backend .env file to activate full AI assistance. I can help with interview prep, GD strategies, resume tips, and coding challenges!';
  }

  const system = `You are an expert AI Interview Coach and Group Discussion facilitator.
You help candidates prepare for technical interviews, behavioral questions, and group discussions.
Be encouraging, professional, and concise. Use bullet points for structured advice.
${context ? `\nUser context:\n${context}` : ''}`;

  try {
    const text = await callGroq(client, system, message, 0.7);
    return text;
  } catch (error) {
    console.error('Groq chat assistant failed:', error);
    return 'I encountered a small hiccup. Please try asking your question again!';
  }
};

// ────────────────────────────────────────────────────────────────────────────
module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  generateGDResponse,
  evaluateGDSession,
  analyzeResume,
  generateCodingFeedback,
  chatAssistantResponse
};
