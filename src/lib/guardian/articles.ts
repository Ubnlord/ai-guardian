import type { Article } from "./types";

export const ARTICLES: Article[] = [
  {
    slug: "lost-phone",
    title: "“I lost my phone. Send money.”",
    category: "Impersonation",
    minutes: 3,
    body: `This is one of the oldest tricks, and it still works because it borrows someone you love.

The message sounds personal. They use a family name. They are stranded, in trouble, or at a hospital. They need airtime, a transfer, or a few hundred thousand naira right now. They tell you not to call the old number, because that number would reach the real person.

Slow down there. A real emergency can survive a two-minute check. A scam cannot.

Call or text the person on the number already saved in your phone. Not the number in the new message. If you have a family verification phrase, ask for it. Someone who is actually your child will know it. A stranger with a copied profile photo will stall, get angry, or invent a reason the phrase does not apply.

Do not send money to a new account to “unlock” them. Police in Nigeria do not settle cases by Opay transfer from a relative. If you already sent money, contact your bank at once and report the account.

The feeling of panic is the product they are selling. You do not have to buy it.`,
  },
  {
    slug: "otp-bvn",
    title: "Nobody real needs your OTP or BVN",
    category: "Money",
    minutes: 3,
    body: `Your bank, fintech app, or network will not ask you to read out a one-time password. They will not ask you to type your BVN, NIN, card PIN, or card number into a chat because your account is “about to be blocked.”

An OTP is a key. Whoever receives it can move money, reset a password, or approve a transfer while you are still staring at the message. The countdown — “expires in 5 minutes”, “account suspended today” — is there so you stop thinking.

Rules that hold up:

Never share an OTP, PIN, BVN, or NIN with a caller or a chat, even if they already know your name and the last four digits of your account. Scammers buy that kind of data.

Open the bank’s app yourself by tapping the icon you installed. Do not use the link in the SMS. If something is actually wrong, it will be waiting inside the real app.

Hang up on anyone who says they are from the fraud desk and then asks you to confirm a code. Call the number printed on the back of your card.

If you typed a code into a fake page, change your password from the real app and call the bank before you do anything else.`,
  },
  {
    slug: "cloned-sites",
    title: "The link is the costume",
    category: "Links",
    minutes: 4,
    body: `A cloned site does not need to hack you. It only needs you to type the password yourself.

Look at the address before the page design. Scammers copy logos perfectly. They are worse at copying the real domain. Watch for a letter swapped with a number, an extra word like “secure” or “login”, a strange ending such as .xyz or .top, or a long chain of subdomains.

bit.ly and other shorteners hide the real destination. There is almost never a good reason for your bank to use one.

Guardian can flag lookalike addresses and known tricks in the text of a link. It does not load the page, and it cannot promise that a clean-looking address is the company you think it is. That last step is yours: type the official address yourself, or use the app you already installed.

Before you enter a password, card, or OTP, ask one question. Did I choose this site, or did a message choose it for me?

If a page asks for payment to release a parcel, a job kit, or a “customs fee”, close it. Delivery companies do not collect clearance fees through a surprise link.`,
  },
  {
    slug: "fake-investments",
    title: "Guaranteed profit is the warning",
    category: "Investments",
    minutes: 4,
    body: `Fake investment platforms, crypto groups, and forex signals tend to share a shape.

The return is specific and fast. Double your money. Daily ROI. A celebrity or a pastor is supposedly behind it. You hear about it on WhatsApp, Telegram, or an ad, not from a licensed company you looked up yourself. The dashboard shows profits that you cannot withdraw. Then a new fee appears: tax, gas, verification, AML, a larger “VIP” deposit. Each payment is framed as the last one.

Real investments can lose money. Anyone who says they cannot is lying about the only part that matters.

Check the company outside the chat that recruited you. Search the exact name plus the words scam and withdrawal. Look for a regulator you can confirm on that regulator’s own site, not a certificate image inside the app. Cloned platforms copy the name of a real broker and change a letter.

Do not send “a little test” to see if withdrawal works. The small withdrawal is the bait. The large deposit is the business.

If a friend sent you the link, your friend may be a victim too, or their account may have been taken over. Talk to them on a saved number before you copy their trade.`,
  },
  {
    slug: "task-scams",
    title: "The job that pays you to tap",
    category: "Jobs",
    minutes: 3,
    body: `Task scams offer simple online work. Rate hotels. Like videos. “Optimize” products. The first tasks pay a tiny amount so you trust the group. Then a task fails unless you deposit your own money to “upgrade the order” or “release the balance.”

There is no employer. The group chat is the set. Screenshots of other people’s payouts are easy to fake.

A real job does not ask you to pay to start, to pay to withdraw your wages, or to recruit two friends before your salary is unlocked. It does not hire you in a WhatsApp group with no interview and no company you can visit or call.

If you already deposited, stop. More payments will not unlock the last one. Tell your bank the account you paid, and warn anyone else in the group who might still believe the balance is real.

Treat “work from your phone, earn in dollars today” the way you would treat a stranger offering you a sack of cash. Ask what they get out of it. If the answer is your deposit, you have the whole business model.`,
  },
  {
    slug: "voice-and-phrase",
    title: "A familiar voice is not proof",
    category: "Deepfakes",
    minutes: 3,
    body: `Copied voices and face videos are good enough now to panic a parent. A short clip from social media is enough for a scammer to imitate a son or a daughter asking for help. The call may sound close. The video may blink and nod. None of that is identification.

What still works is a secret you chose, not something the internet already has.

Pick a family verification phrase that is not a birthday, not a pet’s name from Facebook, and not a proverb everyone knows. A nonsense sentence is better. Store it in Guardian. Do not put it in a chat, and do not say it on a call until you asked for it.

When a scary call comes in, hang up and call back on the saved number. If you stay on the line, ask for the phrase before you discuss money. A cloned voice can cry. It cannot guess a sentence it has never heard.

Guardian’s image check looks for signs a picture may be generated or manipulated. It will tell you when it is unsure. That honesty matters: no tool can promise a photo is real. Use the phrase, the saved number, and a second family member. Three checks beat one convincing voice.`,
  },
];
