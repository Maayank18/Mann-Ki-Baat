export const translations = {
  hi: {
    newChat: "Nayi Baat Shuru Karein",
    pastChats: "Puraani Baatein",
    noPastChats: "Koi puraani baat nahi mili.",
    typeToTalk: "Likh kar baat karein...",
    greetingTitle: "Namaste {name} ji!",
    greetingSub: "Mai aapka digital dost hoon.\nNeeche diye mic daba kar mujhse baat karein.",
    tapAndSpeak: "Dabayein & Bolein",
    speaking: "Boliye...",
    listening: "Sun raha hoon...",
    errorGeneric: "Kuch galat ho gaya, kripya dobara koshish karein.",
    languageMismatchTitle: "Bhasha badlein?",
    languageMismatchMsg: "Aisa lag raha hai aap alag bhasha mein baat kar rahe hain. Kya aap settings mein jakar bhasha badalna chahenge?"
  },
  en: {
    newChat: "Start New Chat",
    pastChats: "Past Conversations",
    noPastChats: "No previous conversations found.",
    typeToTalk: "Type your message...",
    greetingTitle: "Hello {name}!",
    greetingSub: "I am your digital friend.\nTap the mic below to speak with me.",
    tapAndSpeak: "Tap & Speak",
    speaking: "Speak now...",
    listening: "Listening...",
    errorGeneric: "Something went wrong, please try again.",
    languageMismatchTitle: "Change Language?",
    languageMismatchMsg: "It seems you are speaking a different language. Please update your language setting to continue smoothly."
  },
  hinglish: {
    newChat: "New Chat Start Karein",
    pastChats: "Past Conversations",
    noPastChats: "Koi past conversations nahi mili.",
    typeToTalk: "Type karke baat karein...",
    greetingTitle: "Hello {name} ji!",
    greetingSub: "Main aapka digital friend hoon.\nNeeche mic tap karke mujhse baat karein.",
    tapAndSpeak: "Tap & Speak",
    speaking: "Boliye...",
    listening: "Sun raha hoon...",
    errorGeneric: "Kuch galat ho gaya, please try again.",
    languageMismatchTitle: "Language Change Karein?",
    languageMismatchMsg: "Lagta hai aap different language mein baat kar rahe hain. Please settings mein apni language update karein."
  }
};

export const getT = (lang) => {
  return translations[lang] || translations['hi'];
};
