<?php
header("Content-Type: text/xml");
session_start();

if (!isset($_SESSION['step'])) {
    $_SESSION['step'] = 0;
    $_SESSION['memory'] = [];
}

$input = $_POST['SpeechResult'] ?? '';
$step = &$_SESSION['step'];
$memory = &$_SESSION['memory'];
$reply = '';

if (empty($input)) {
    $reply = "I'm still here. Take your time. When you're ready, just speak.";
} else {
    switch ($step) {
        case 0:
            $memory['issue'] = $input;
            $reply = "Thanks. May I have your full name, please?";
            $step++;
            break;
        case 1:
            $memory['name'] = $input;
            $reply = "Got it. What’s your full service address, including unit number if any?";
            $step++;
            break;
        case 2:
            $memory['address'] = $input;
            $reply = "Thank you. What's the best cell phone number to reach you with technician updates?";
            $step++;
            break;
        case 3:
            if (!preg_match('/\d{10}/', preg_replace('/\D/', '', $input))) {
                $reply = "Sorry, I didn’t catch a valid phone number. Please say it again using digits only.";
                break;
            }
            $memory['phone'] = $input;
            $reply = "Lastly, is this for a repair service or a maintenance tune-up?";
            $step++;
            break;
        case 4:
            $memory['service_type'] = $input;
            $reply = "Thanks. You're all set. A technician will follow up shortly.";
            file_put_contents("requests.log", json_encode($memory) . PHP_EOL, FILE_APPEND);
            $step++;
            break;
        default:
            echo '<?xml version="1.0" encoding="UTF-8"?>';
            echo '<Response><Say voice="Polly.Matthew">Thank you. Goodbye.</Say><Hangup/></Response>';
            exit;
    }
}

echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<Response>
  <Say voice="Polly.Matthew">One moment please.</Say>
  <Gather input="speech" action="https://penguin-ai-agent-1.onrender.com/brain" method="POST" timeout="10">
    <Say voice="Polly.Matthew"><?php echo htmlspecialchars($reply); ?></Say>
  </Gather>
  <Say voice="Polly.Matthew">Still here, take your time.</Say>
  <Redirect method="POST">https://penguin-ai-agent-1.onrender.com/brain</Redirect>
</Response>
