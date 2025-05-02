
const express = require('express');
const bodyParser = require('body-parser');
const { Twilio } = require('twilio');
const { MessagingResponse, VoiceResponse } = require('twilio').twiml;
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// Trigger logic
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
    response: "Just to confirm — would you like me to transfer you to our emergency dispatch team?"
  }
];

// Helper to match keywords
function matchTrigger(text) {
  const lower = text.toLowerCase();
  for (const trig of triggers) {
    if (trig.keywords.some(k => lower.includes(k))) {
      return trig.response;
    }
  }
  return null;
}

// Voice Route
app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: 'speech',
    timeout: 5,
    action: '/brain',
    method: 'POST'
  });
  gather.say("Hi! Thanks for calling Penguin Air. How can I help you today?");

  twiml.redirect('/voice'); // Fallback if no input

  res.type('text/xml');
  res.send(twiml.toString());
});

// Brain Route - Handles AI logic
app.post('/brain', async (req, res) => {
  const speech = req.body.SpeechResult || '';
  const twiml = new VoiceResponse();

  const matched = matchTrigger(speech);
  if (matched) {
    twiml.say(matched);
  } else {
    try {
      const openaiResp = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a friendly HVAC assistant.' },
          { role: 'user', content: speech }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const aiReply = openaiResp.data.choices[0].message.content;
      twiml.say(aiReply);
    } catch (err) {
      twiml.say("Sorry, I'm having trouble responding right now. Let me transfer you to a live advisor.");
      twiml.dial('+1YOURBACKUPNUMBER'); // Replace with fallback number
    }
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// Ping route to keep alive
app.get('/ping', (req, res) => {
  res.send('Penguin AI Agent is running.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});