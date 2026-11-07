export type PlayOption = { id: string; label: string; points: number; why: string };
export type PlayQuestion = { id: string; prompt: string; options: PlayOption[] };
export type Playbook = {
  id: string;
  title: string;
  situation: string;
  questions: PlayQuestion[];
  actions: string[];
};

export const PLAYBOOKS: Playbook[] = [
  {
    id: "family",
    title: "They sound like family",
    situation: "A call, voice note, or new number says someone you love needs money now.",
    questions: [
      {
        id: "saved",
        prompt: "Did they tell you not to use the number already saved in your phone?",
        options: [
          { id: "yes", label: "Yes. Call the old number and they'll be in trouble.", points: 28, why: "A real relative does not ban the number you already trust." },
          { id: "no", label: "No. They were fine with the usual number.", points: 0, why: "" },
          { id: "unsure", label: "They changed the subject when I tried.", points: 18, why: "Dodging the saved number is the same move as banning it." },
        ],
      },
      {
        id: "money",
        prompt: "Are they asking for money, airtime, or a code before you can see them?",
        options: [
          { id: "yes", label: "Yes. They want it today.", points: 28, why: "Urgency plus a payment is the point of the message." },
          { id: "code", label: "They want an OTP, PIN, or BVN.", points: 28, why: "Family does not need your bank code." },
          { id: "no", label: "No payment and no code.", points: 0, why: "" },
        ],
      },
      {
        id: "phrase",
        prompt: "What happens when you ask for the family phrase?",
        options: [
          { id: "dodged", label: "They dodged it, guessed, or got angry.", points: 24, why: "The phrase exists so a familiar voice is not enough." },
          { id: "none", label: "We don't have a phrase, and they still want money.", points: 16, why: "Without a phrase, the saved phone number is the check." },
          { id: "said", label: "They said the real phrase, unprompted or correctly.", points: 0, why: "" },
        ],
      },
      {
        id: "rush",
        prompt: "Do they need the transfer before you talk to anyone else?",
        options: [
          { id: "yes", label: "Yes. Right now, don't tell anyone.", points: 20, why: "Secrecy keeps you from the person who would spot the lie." },
          { id: "no", label: "No. I can call around first.", points: 0, why: "" },
        ],
      },
    ],
    actions: [
      "Don't send the money.",
      "Call the number already saved for that person. Not the one in this chat.",
      "If you have a family phrase, ask for it. If they miss it, stop.",
    ],
  },
  {
    id: "bank",
    title: "Your account will be blocked",
    situation: "SMS, WhatsApp, or a caller says the bank will freeze you unless you act in minutes.",
    questions: [
      {
        id: "channel",
        prompt: "Where did the warning arrive?",
        options: [
          { id: "chat", label: "SMS, WhatsApp, email, or a phone call.", points: 22, why: "Banks don't settle account blocks in a chat you didn't open." },
          { id: "link", label: "I already tapped their link.", points: 28, why: "The link is the trap. Leave that page." },
          { id: "app", label: "Inside the bank app I opened myself.", points: 4, why: "" },
        ],
      },
      {
        id: "secret",
        prompt: "Did they ask for an OTP, PIN, BVN, NIN, or password?",
        options: [
          { id: "yes", label: "Yes.", points: 34, why: "A code from your bank is for you, not for a caller." },
          { id: "no", label: "No secret was asked.", points: 0, why: "" },
        ],
      },
      {
        id: "clock",
        prompt: "Is there a countdown — minutes, or the account dies today?",
        options: [
          { id: "yes", label: "Yes. They named a short deadline.", points: 22, why: "The clock is there so you don't call the number on your card." },
          { id: "no", label: "No deadline.", points: 0, why: "" },
        ],
      },
      {
        id: "verify",
        prompt: "Have you checked by opening the real app, not their link?",
        options: [
          { id: "used", label: "I used their link or read them the code.", points: 16, why: "Stop. If you shared a code, call the number on the back of your card." },
          { id: "self", label: "I opened the app myself and it looks normal.", points: 0, why: "" },
          { id: "notyet", label: "Not yet.", points: 8, why: "Open the app you installed. Don't use the message." },
        ],
      },
    ],
    actions: [
      "Don't share the OTP, PIN, BVN, or password.",
      "Close their page. Open the bank app yourself, or call the number on your card.",
      "If a code already left your hands, tell the bank now. Don't wait for the caller to hang up.",
    ],
  },
  {
    id: "hustle",
    title: "The job or the trading group",
    situation: "A stranger promises daily pay, forex profit, or a task you can do from your phone.",
    questions: [
      {
        id: "fee",
        prompt: "Do you have to pay to start, to withdraw, or to 'clear a tax' on profit?",
        options: [
          { id: "yes", label: "Yes. Money has to go in before money comes out.", points: 36, why: "A fee to unlock your own withdrawal is the scam." },
          { id: "soon", label: "Not yet, but the profit is sitting in their app.", points: 14, why: "A balance on their screen is not money in your bank." },
          { id: "no", label: "Nobody has asked me to pay.", points: 0, why: "" },
        ],
      },
      {
        id: "promise",
        prompt: "Is the return guaranteed, daily, or too steady to be a market?",
        options: [
          { id: "yes", label: "Yes. They say it can't lose.", points: 28, why: "Guaranteed profit is the sentence that ends the conversation." },
          { id: "no", label: "They talked about risk, not a promise.", points: 0, why: "" },
        ],
      },
      {
        id: "who",
        prompt: "Who introduced it?",
        options: [
          { id: "stranger", label: "A stranger on WhatsApp, Telegram, or Instagram.", points: 20, why: "An account manager you met in chat is not a licence." },
          { id: "friend", label: "A friend who is also excited about it.", points: 10, why: "Friends get shown fake dashboards too." },
          { id: "known", label: "A company I already used before this chat.", points: 0, why: "" },
        ],
      },
      {
        id: "proof",
        prompt: "Is the proof screenshots of other people's payouts?",
        options: [
          { id: "yes", label: "Yes. Alerts, testimonies, a celebrity.", points: 16, why: "A screenshot can be typed by anyone." },
          { id: "no", label: "No. I can check them outside the chat.", points: 0, why: "" },
        ],
      },
    ],
    actions: [
      "Don't deposit, and don't pay a fee to unlock a withdrawal.",
      "The number in their app is not yours until your own bank shows it.",
      "Search the name plus “withdrawal” outside the group that recruited you.",
    ],
  },
  {
    id: "invoice",
    title: "The account number changed",
    situation: "A supplier, landlord, or school says pay this new account, the old one is closed.",
    questions: [
      {
        id: "changed",
        prompt: "Is the account different from the last one you actually paid?",
        options: [
          { id: "yes", label: "Yes. New number.", points: 36, why: "A changed account is the whole attack. The invoice can look perfect." },
          { id: "first", label: "First time paying them.", points: 14, why: "A first account still needs a check on a number you didn't get from the invoice." },
          { id: "same", label: "Same account as last time.", points: 0, why: "" },
        ],
      },
      {
        id: "rush",
        prompt: "Did they say the old account is closed and the payment is late?",
        options: [
          { id: "yes", label: "Yes. Hurry, or there's a penalty.", points: 28, why: "Urgency is how they skip the phone call that would catch it." },
          { id: "no", label: "No pressure.", points: 0, why: "" },
        ],
      },
      {
        id: "confirm",
        prompt: "Did you confirm the new account on a number already on file — not the one in the email?",
        options: [
          { id: "no", label: "No. I only have what they sent today.", points: 24, why: "Call the number from the last real invoice or your contract." },
          { id: "yes", label: "Yes. I called a saved number and they confirmed it.", points: 0, why: "" },
        ],
      },
      {
        id: "domain",
        prompt: "Look at the sender's address. Is it exactly the company domain you usually see?",
        options: [
          { id: "off", label: "It's close, but not the same.", points: 12, why: "One extra word or a different ending is enough to fake a vendor." },
          { id: "skip", label: "I didn't look.", points: 8, why: "Read the full address before the @ and after it." },
          { id: "same", label: "It's the exact domain.", points: 0, why: "" },
        ],
      },
    ],
    actions: [
      "Don't pay the new account from the email alone.",
      "Call a number you already had, and read the account back to them.",
      "If you already paid, call your bank and the real vendor today.",
    ],
  },
];

export function scorePlay(book: Playbook, picks: Record<string, string>): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  for (const question of book.questions) {
    const option = question.options.find((item) => item.id === picks[question.id]);
    if (!option) continue;
    score += option.points;
    if (option.points >= 12 && option.why) reasons.push(option.why);
  }
  return { score: Math.max(0, Math.min(100, score)), reasons };
}
