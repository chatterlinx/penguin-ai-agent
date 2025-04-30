const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔧 HVAC FAQ Lookup Table
const hvacFAQ = [
  { question: "what is a capacitor", answer: "A capacitor helps your AC start and stay running. If it's faulty, the unit may not turn on at all." },
  { question: "what does a tune-up include", answer: "A tune-up covers a full 20-point inspection, drain line cleaning, and performance test to keep your system efficient." },
  { question: "how often should i change my filter", answer: "We recommend changing your filter every 1 to 3 months depending on use and pets." },
  { question: "what is a seer rating", answer: "SEER means Seasonal Energy Efficiency Ratio — higher SEER means better energy savings." },
  { question: "what temperature should my house be", answer: "Most customers keep it between 74 and 78°F — but it's all personal comfort." },
  { question: "what causes ac to freeze up", answer: "Common causes include low refrigerant, dirty filters, or airflow issues. We’ll check that during your visit." },
  { question: "do you service lehigh acres", answer: "Yes, we do service Lehigh Acres. Afternoon availability is usually best for that area." },
  { question: "do you work on weekends", answer: "We offer emergency service on weekends. Routine visits are weekdays 8 to 6." },
  { question: "do you install uv lights", answer: "Yes, we install UV lights to improve indoor air quality. I can note that for your advisor." },
  { question: "do you offer maintenance plans", answer: "Yes — our $179 annual plan includes two tune-ups, drain cleaning, and priority service." },
  { question: "how much does a service call cost", answer: "Our diagnostic fee is $49, waived if you're on a maintenance plan or do the repair." },
  { question: "can i get a quote on a new system", answer: "Absolutely — I’ll note that for our comfort advisor to follow up." },
  { question: "how long does installation take", answer: "Most full system installs are done same-day or next-day depending on the system." },
  { question: "what brands do you carry", answer: "We install top brands like Rheem, Goodman, and Carrier depending on your needs." },
  { question: "can you text me the appointment info", answer: "Yes, we send confirmations and arrival alerts by text to your cell number." },
  { question: "do you clean ducts", answer: "Yes — duct cleaning is handled by our comfort advisor team. I’ll have them contact you." },
  { question: "do you work on mobile homes", answer: "Yes, we service many mobile and manufactured home systems." },
  { question: "how long will the appointment take", answer: "Most visits take 45 to 90 minutes depending on what’s needed." },
  { question: "will i get a reminder", answer: "Yes — we’ll text you a confirmation and arrival update the day of your appointment." },
  { question: "do you offer financing", answer: "Yes — we offer system financing through partners. A comfort advisor will explain your options." }
];

// 🤖 Soft filler phrases for silence
const softResponses = [
  "Still here — take your time.",
  "No rush. I'm right here whenever you're ready.",
  "Whenever you're ready, just speak naturally.",
  "Take a moment if you need — I'm listening."
];

// 🔍 Keyword match
function matchFAQ(text) {
  const lower = text.toLowerCase();
  for (const item of hvacFAQ) {
    if (lower.includes(item.question)) return item.answer;
  }
  return null;
}

// 🚩 Escalation detection
function isEscalation(text) {
  const triggers = ['seer rating', 'blower motor', 'circuit board', 'price breakdown', 'warranty terms', 'installer details'];
  return triggers.some(keyword => text.toLowerCase().includes(keyword));
}

// 🧠 Response builder
function getResponse(input) {
  const match = matchFAQ(input);
  if (match) return match;

  if (isEscalation(input)) {
    return "That’s a great question — would you like me to connect you to a service advisor who can assist you further?";
  }

  // Fallback response
  return "I'm here to help! May I please have your full name and a brief description of what you need today?";
}

// Root check
app.get('/', (req, res) => {
  res.send('Penguin AI Agent is live!');
});

// Web-based chat response
app.get('/respond', (req, res) => {
  const message = req.query.message || '';
  const reply = getResponse(message);
  res.json({ reply });
});

// Twilio Voice Brain Route
app.post('/brain', (req, res) => {
  const input = req.body.SpeechResult || '';
  const reply = getResponse(input);

  const twiml = [];
  twiml.push('<Say voice="Polly.Matthew" language="en-US">One moment please.</Say>');

  if (reply.includes('connect you to a service advisor')) {
    twiml.push('<Say voice="Polly.Matthew">Transferring you now.</Say>');
    twiml.push('<Dial>2394619000</Dial>'); // Replace with your actual transfer number
  } else {
    twiml.push(`<Gather input="speech" action="/brain" method="POST" timeout="15">`);
    twiml.push(`<Say voice="Polly.Matthew" language="en-US">${reply}</Say>`);
    twiml.push('</Gather>');
    twiml.push(`<Say voice="Polly.Matthew" language="en-US">${softResponses[Math.floor(Math.random() * softResponses.length)]}</Say>`);
    twiml.push('<Redirect>/brain</Redirect>');
  }

  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response>${twiml.join('')}</Response>`);
});

app.listen(port, () => {
  console.log(`Agent listening on port ${port}`);
});
