/* ============================================================================
   CONFIG — the only file to edit after delivery.
   - SCRIPT_URL: the Apps Script web app URL (ends with /exec).
     Empty = mock mode (answers stay in this browser). Only acceptable locally.
   - Placeholder texts ("TODO", "lorem ipsum") and an empty SCRIPT_URL are reported
     as a warning in the browser console (never shown to participants).
   ========================================================================== */
export const CONFIG = {
  SCRIPT_URL: '',
  EVENT: 'World Quality Week 2026',
  PROGRAM: 'Quality Powering Performance',   // the programme behind the 4 pillars
  LOGO: 'assets/logo.png',                   // programme visual; if the file is missing, a drawn Q emblem is used
  MIN_CHARS: 1,
  MAX_CHARS: 2000,
  PILLARS: [
    { id: 1, name: 'Quality as Enabler', icon: 'clapper', question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?' },
    { id: 2, name: 'Building Trust', icon: 'handshake', question: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?' },
    { id: 3, name: 'Efficiency & Speed', icon: 'bolt', question: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris?' },
    { id: 4, name: 'Quality Driving Innovation', icon: 'bulb', question: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum?' },
  ],
  // Ipsen palette (ipsen.com). The star gold is the only non-Ipsen colour.
  THEME: { primary: '#000e56', accent: '#2797d3', surface: '#edebe4', star: '#f5b400' },
  // Pillar icons available: clapper, handshake, bolt, bulb (see js/icons.js).
  TEXT: {
    // Welcome
    welcomeTitle: 'Four pillars. Four stars. One Quality Passport.',
    welcomeSubtitle: 'Stop at each pillar, share your thoughts, collect your star.',
    emailLabel: 'Your work email',
    emailInvalid: 'Please enter a valid email address.',
    emailNotice: 'Your answers are saved with your email and read by the Quality team.',
    continue: "Let's go",
    checking: 'Checking your stars…',
    // Question
    pillarLabel: 'Pillar {n} of 4',
    questionIntro: 'No right or wrong answer. Just yours.',
    answerHint: 'Take a moment. Your thoughts matter more than your spelling.',
    submit: 'Stamp my passport',
    myPassport: 'My passport',
    // Passport
    passportTitle: 'My Quality Passport',
    stampEarned: 'Star earned: {pillar}',     // {pillar} = pillar name
    alreadyStamped: 'You already have this star: {pillar}',
    nextHint: 'Next pillar, next star. Scan its QR code.',
    scanHint: 'Scan its QR code',
    notYet: 'Not yet',
    toDiscover: 'To discover',             // a pillar stays hidden until its QR code is scanned
    // Celebration
    celebrationTitle: 'Four pillars. Four stars. Passport complete.',
    celebrationSubtitle: 'Your name is on the Quality walk of fame. Show this screen to collect your goodies.',
    holderLabel: 'Name on your passport',
    share: 'Share',
    shareText: 'Four pillars, four stars: my Quality Passport is complete. #WorldQualityWeek',
    copied: 'Copied! Paste it anywhere.',
    download: 'Get my Quality Passport',
    saveOrShare: 'Save or share',
    preparing: 'Preparing…',
    pdfFallback: 'The PDF tool could not load. Your passport was saved as an image instead.',
    close: 'Done',
    // Passport document (PDF)
    docTitle: 'Quality Passport',
    docCertifies: 'This certifies that',
    docLine: 'has earned the four stars of {program}',
    docCompleted: 'Completed on {date}',
  },
};
