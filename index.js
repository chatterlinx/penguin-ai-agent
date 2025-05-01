app.get('/voice', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Gather input="speech" action="https://penguin-ai-agent-1.onrender.com/brain" method="POST" timeout="15">
        <Say voice="Polly.Matthew">Hi, Penguin Air Conditioning. How can I help you today?</Say>
      </Gather>
      <Say voice="Polly.Matthew">Still here, take your time.</Say>
      <Redirect method="POST">https://penguin-ai-agent-1.onrender.com/brain</Redirect>
    </Response>`);
});
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
  const loopCount = parseInt(req.query.loop || '0');
  const nextLoop = loopCount + 1;

  let reply = '';
  if (!input) {
    reply = "Still here, take your time.";
  } else {
    reply = getResponse(input);
  }

  const twiml = [];
  twiml.push('<Say voice="Polly.Matthew">One moment please.</Say>');
  twiml.push(`<Gather input="speech" action="https://penguin-ai-agent-1.onrender.com/brain?loop=${nextLoop}" method="POST" timeout="15">`);
  twiml.push(`<Say voice="Polly.Matthew">${reply}</Say>`);
  twiml.push('</Gather>');

  if (loopCount >= 2) {
    twiml.push('<Say voice="Polly.Matthew">Thanks again for calling. We’ll be here when you’re ready. Goodbye!</Say>');
    twiml.push('<Hangup/>');
  } else {
    twiml.push('<Say voice="Polly.Matthew">Still here, take your time.</Say>');
    twiml.push(`<Redirect method="POST">https://penguin-ai-agent-1.onrender.com/brain?loop=${nextLoop}</Redirect>`);
  }

  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response>${twiml.join('')}</Response>`);
});

app.listen(port, () => {
  console.log(`Agent listening on port ${port}`);
});
