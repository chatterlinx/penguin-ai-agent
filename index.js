const http = require('http');
const port = 3000;

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

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => {
      try {
        const incoming = JSON.parse(body);
        const userMessage = incoming.message || '';
        const reply = getResponse(userMessage);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      } catch (error) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  } else {
    res.writeHead(200);
    res.end('Agent is running.');
  }
});

server.listen(port, () => {
  console.log(`Agent listening at http://localhost:${port}`);
});

