<?php
header("Content-Type: text/xml");
session_start();

// Absolute URL for Render fallback
$brainUrl = "https://penguin-ai-agent-1.onrender.com/brain";

// Initialize session memory
if (!isset($_SESSION['memory'])) {
    $_SESSION['memory'] = [
        'issue' => '',
        'name' => '',
        'address' => '',
        'phone' => '',
        'service_type' => ''
    ];
}

$customer_input = $_POST['SpeechResult'] ?? '';

if (empty($customer_input)) {
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    ?>
    <Response>
        <Say voice="Polly.Matthew">Still here, take your time.</Say>
        <Redirect method="POST"><?= $brainUrl ?></Redirect>
    </Response>
    <?php
    exit;
}

// Assign memory
$memory = &$_SESSION['memory'];
$reply = '';

if (empty($memory['issue'])) {
    $memory['issue'] = $customer_input;
    $reply = "Thanks for explaining. May I have your full name?";
} elseif (empty($memory['name'])) {
    $memory['name'] = $customer_input;
    $reply = "Thanks. What's your full address?";
} elseif (empty($memory['address'])) {
    $memory['address'] = $customer_input;
    $reply = "Got it. What’s the best phone number to receive text alerts?";
} elseif (empty($memory['phone'])) {
    if (!preg_match('/^\d{10,}$/', preg_replace('/\D/', '', $customer_input))) {
        $reply = "Please provide a valid phone number with at least 10 digits.";
    } else {
        $memory['phone'] = $customer_input;
        $reply = "Last question — is this a repair or a maintenance call?";
    }
} elseif (empty($memory['service_type'])) {
    $memory['service_type'] = $customer_input;
    $reply = "Thank you! You're all set. A technician will reach out to confirm.";
} else {
    $reply = "You're all set! Have a great day.";
    $should_hangup = true;
}

echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<Response>
    <?php if (!empty($should_hangup)): ?>
        <Say voice="Polly.Matthew"><?= htmlspecialchars($reply) ?></Say>
        <Hangup/>
    <?php else: ?>
        <Say voice="Polly.Matthew">One moment please.</Say>
        <Gather input="speech" action="<?= $brainUrl ?>" method="POST" timeout="15">
            <Say voice="Polly.Matthew"><?= htmlspecialchars($reply) ?></Say>
        </Gather>
        <Say voice="Polly.Matthew">Still here, take your time.</Say>
        <Redirect method="POST"><?= $brainUrl ?></Redirect>
    <?php endif; ?>
</Response>
