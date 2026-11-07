export const MESSAGE_SAMPLES = [
  {
    label: "Lost phone",
    channel: "WhatsApp",
    text: "Mom it's me. I lost my phone and this is a new number. I'm stranded and the police said I need to pay ₦200,000 today or they won't let me go. Don't call my old number, send the money to Opay 803 445 2211 now. I'll explain later. Please hurry.",
  },
  {
    label: "Bank OTP",
    channel: "SMS",
    text: "GTBank ALERT: Your account will be suspended in 30 minutes. Confirm your BVN and the OTP we just sent by replying to this message or open http://gtb-secure-login.xyz/verify. Do not ignore this.",
  },
  {
    label: "Ordinary plan",
    channel: "SMS",
    text: "Dinner is at 7 at the usual place. I'll grab the pepper soup if I get there first. No need to bring anything.",
  },
];

export const URL_SAMPLES = [
  { label: "Lookalike", url: "http://paypa1-secure-login.xyz/account/verify?user=you" },
  { label: "Short link", url: "https://bit.ly/3claim-now" },
  { label: "Known domain", url: "https://www.paypal.com" },
];

export const INVESTMENT_SAMPLES = [
  {
    label: "Double your money",
    platform: "Aurex Prime",
    contact: "WhatsApp, number I don't know",
    url: "https://aurex-prime.top/deposit",
    promise:
      "Celebrity trader says deposit ₦50,000 and withdraw ₦100,000 in 24 hours. Guaranteed. My account manager says the withdrawal is locked until I pay a small tax.",
  },
];

export const NUMBER_SAMPLES = [
  {
    label: "New Opay",
    kind: "account" as const,
    value: "8034452211",
    context:
      "Mom it's me. I lost my phone and this is a new number. Send ₦200,000 to this Opay account now. Don't call my old number. I'll explain later.",
  },
  {
    label: "Bank caller",
    kind: "phone" as const,
    value: "08061239874",
    context:
      "This is GTBank fraud desk. Your account will be blocked in 20 minutes. Read me the OTP that just arrived and confirm your BVN.",
  },
];
