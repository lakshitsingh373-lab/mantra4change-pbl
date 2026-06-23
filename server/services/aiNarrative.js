async function generateNarrative(facts) {
  const prompt = `You are a grant report writer for an education NGO. Write a concise 150-word grant report paragraph using ONLY these facts. Do not invent any numbers.
Facts:
- Grant: ${facts.grantName}
- Donor: ${facts.donor}
- Month: ${facts.month}
- PBL Completion Rate: ${(facts.pblCompletionRate * 100).toFixed(1)}%
- Evidence Submission Rate: ${(facts.evidenceRate * 100).toFixed(1)}%
- Attendance Rate: ${(facts.attendanceRate * 100).toFixed(1)}%
- Schools Sampled: ${facts.sampledSchools}
- Risk Status: ${facts.riskStatus}
- Milestones: ${facts.milestones}
Write in professional report style.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
     model: 'llama-3.1-8b-instant',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  console.log('Groq response:', JSON.stringify(data));
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

module.exports = { generateNarrative };