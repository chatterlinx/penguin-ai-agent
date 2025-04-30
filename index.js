const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const triggers = [
  {
    type: 'repair',
    keywords: ['no cool', 'no heat', 'not working', 'ac not working', 'leak', 'drain', 'won’t turn on', 'system down'],
    response: "I'm sorry you're dealing with that! Let's get you scheduled right away. May I start with your full name, please?"
  },
  {
    type: 'maintenance',
    keywords: ['tune-up', 'maintenance', 'routine check', 'seasonal check', 'system check'],
    response: "Of course! Let's get your maintenance visit set up. May I please have your full name?"
  },
  {
    type: 'duct',
    keywords: ['duct cleaning', 'air quality', 'vents dirty', 'dust problem'],
    response: "Thanks for reaching out! Let’s get a comfort advisor to help with your duct cleaning. May I have your full name and address to start?"
  },
  {
    type: 'emergency',
    keywords: ['emergency', 'urgent', 'asap', 'immediate help'],
    response: "Just to confirm — would you like me to transfer you to our emergency dispatch team, or prefer the next available repair appointment?"
  },
  {
    type: 'install',
    keywords: ['new system', 'replacement', 'need estimate', 'install unit'],
    response: "Got it — you’re looking for a new system estimate. Let’s get your info to our comfort advisor! May I have your full name and address?"
  }
];

function getResponse(text) {
  text = text.toLowerCase();
  for (const trigger of triggers) {
    for (const keyword of trigger.keywords) {
      if (text.includes(keyword)) {
        return trigger.response;
      }
    }
  }
  return "I'm here to help! May I please have your full name and a brief description of what you need today?";
}

app.get('/', (req, res) => {
  res.send('Penguin AI Agent is live!');
});

app.get('/respond', (req, res) => {
  const message = req.query.message || '';
  const reply = getResponse(message);
  res.json({ reply });
});

app.post('/brain', (req, res) => {
  const input = req.body.SpeechResult || '';
  const twiml = [];

  if (!req.sessionMemory) req.sessionMemory = {}; // Basic session memory
  const memory = req.sessionMemory;

  let reply = "";

  if (!input) {
    twiml.push('<Say voice="Polly.Matthew">Still here, take your time.</Say>');
    twiml.push('<Redirect>/brain</Redirect>');
  } else {
    if (!memory.issue) {
      memory.issue = input;
      reply = "Thanks for explaining. May I have your full name?";
    } else if (!memory.name) {
      memory.name = input;
      reply = "Thanks. What's your full address?";
    } else if (!memory.address) {
      memory.address = input;
      reply = "Got it. What’s the best phone number to receive text alerts?";
    } else if (!memory.phone) {
      memory.phone = input;
      reply = "Last question — is this a repair or maintenance call?";
    } else {
      reply = "Thank you! A technician will contact you shortly.";
    }

    twiml.push('<Say voice="Polly.Matthew">One moment please.</Say>');
    twiml.push(`<Gather input="speech" action="/brain" method="POST" timeout="15"><Say voice="Polly.Matthew">${reply}</Say></Gather>`);
    twiml.push('<Say voice="Polly.Matthew">Still here, take your time.</Say>');
    twiml.push('<Redirect>/brain</Redirect>');
  }

  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response>${twiml.join('')}</Response>`);
});

app.listen(port, () => {
  console.log(`Agent listening on port ${port}`);
});
