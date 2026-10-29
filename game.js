/* CATCH NOTHING: THE USELESSNESS ENGINE
   The most intentionally futile, unpredictable, and entertaining browser game.
   Vanilla JS, offline, no dependencies, Web Audio API, LocalStorage. */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEY = 'catchNothing.v1';
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- data & configurations ---------- */
const DIFFS = {
  easy:       { speed: .7,  r: 13, slack: 10, time: 40, need: 2, fakes: 3, tpRange: 90,  rech: 2.2, note: 'Big dot, slow dot, generous timer. Still completely pointless.' },
  medium:     { speed: 1,   r: 9,  slack: 7,  time: 30, need: 3, fakes: 5, tpRange: 115, rech: 1.8, note: 'The intended experience. Intended by whom, though?' },
  impossible: { speed: 1.45, r: 6, slack: 4,  time: 22, need: 4, fakes: 8, tpRange: 150, rech: 1.2, note: 'Tiny dot, hyper speed, extra wrong controls. Pure existential pain.' }
};

const LEVELS = [
  { name: 'NORMAL',               tag: 'The dot moves slowly. Your cursor behaves. Enjoy it while it lasts.', speed: 110 },
  { name: 'REVERSE',              tag: 'Left is right. Right is left. Sorry not sorry.',                       speed: 140, ix: true },
 { name: 'CHAOS',                tag: 'Up is down too. Nothing is sacred anymore.',                           speed: 170, ix: true, iy: true },
  { name: 'TELEPORT',             tag: 'The dot dodges you. Catch it while it recharges.',                     speed: 150, ix: true, tp: true },
  { name: 'CLONE ATTACK',         tag: 'Decoys everywhere. Only one dot is real.',                             speed: 160, ix: true, iy: true, clones: true },
  { name: 'BOSS 1: THE DOT',      tag: 'The original dot returns with a vengeance and an attitude.',           speed: 175, boss: true, bType: 'dot' },
  { name: 'BOSS 2: THE BIGGER DOT', tag: 'Colossal, obnoxious, and still impossible to catch.',               speed: 145, boss: true, bType: 'big', rMult: 3 },
  { name: 'BOSS 3: INVISIBLE DOT',tag: 'It fades away completely. Good luck with that.',                       speed: 130, boss: true, bType: 'invis' },
  { name: 'BOSS 4: DOT\'S LAWYER',tag: 'Cease & Desist! Unauthorized pursuit of a circular client.',          speed: 155, boss: true, bType: 'lawyer', ix: true },
  { name: 'BOSS 5: DOT\'S MANAGER',tag: 'Performance review: You have not met your Q3 nothingness goals.',    speed: 165, boss: true, bType: 'manager', iy: true },
  { name: 'BOSS 6: DOT\'S PARENTS',tag: 'Why can\'t you be like your cousin, the Rectangle?',                 speed: 170, boss: true, bType: 'parents', ix: true, iy: true },
  { name: 'BOSS 7: DEPT OF NOTHING', tag: 'Red tape forcefield active. Submit Form 404 in triplicate.',       speed: 160, boss: true, bType: 'dept', clones: true },
  { name: 'BOSS 8: THE FINAL NOTHING', tag: 'There was never a dot. There was never a victory. Click anyway.', speed: 120, boss: true, bType: 'nothing' }
];

const MSG = {
  hit: [
    'Wait... you actually caught it? Suspicious.',
    'A hit! The dot has filed a complaint.',
    'Fluke detected. It still counts.',
    'Your mouse is as surprised as you are.',
    'Plot twist: competence.',
    'Okay, that was clean. Do not get used to it.',
    'The dot was distracted thinking about taxes.',
    'A statistical anomaly just occurred in your favor.'
  ],
  miss1: [
    'First miss. Bold opening strategy.',
    'Strike one. The dot barely noticed.',
    'Welcome to the game. You have already lost something.'
  ],
  missN: [
    'Bro, are you unemployed?',
    'Your mouse needs therapy.',
    'The dot isn\'t running. It\'s escaping YOU.',
    'Skill issue detected. Treatment unavailable.',
    'Even the miss was a miss.',
    'Your mouse is innocent. Stop blaming it.',
    'The dot has resigned.',
    'Error 404: Your skills not found.',
    'That click went to a better place.',
    'Have you tried clicking where the dot is?',
    'My grandmother clicks with higher accuracy.',
    'The dot just yawned.',
    'NASA has confirmed your aim is off by 400 miles.'
  ],
  missMany: [
    'You were the useless project all along.',
    'At this point it is an unpaid internship.',
    'The dot is writing a memoir about you.',
    'Random clicking would have worked by now.',
    'Your accuracy has left the chat.',
    'Congratulations! You caught NOTHING!',
    'Is this performance art?'
  ],
  almost: [
    'So close it hurt. Mostly you.',
    'A hair away. A very large hair.',
    'The dot felt the breeze.',
    'Almost! Almost does not count. Ever.'
  ],
  fake: [
    'That one was a decoy. Rookie.',
    'You caught a fake. Very on brand.',
    'Clones: 1. You: 0.',
    'Imagine clicking the wrong dot. Oh wait.'
  ],
  level: [
    'Level cleared. Enjoy the 4 seconds of pride.',
    'Progress! The game will fix that immediately.',
    'Cleared. The next level took that personally.'
  ],
  tp: [
    'The dot blinked. Rude.',
    'Teleported. It is not you, it is physics.',
    'Poof. Gone. Like your free time.'
  ],
  tired: [
    'Teleport recharging... hurry!',
    'The dot is out of breath. Pounce!'
  ],
  boss: [
    'Is the dot... fading away?',
    'You cannot catch what is mathematically absent.',
    'Nothing is watching you back.'
  ],
  timeout: [
    'Time ran out. So did your dignity.'
  ]
};

const LONG = [
  [45,  'Forty-five seconds in. The dot has made friends.'],
  [90,  'Still here? Dedication, or avoidance?'],
  [150, 'Your chair is filing a formal concern.'],
  [240, 'Four minutes. You could have learned a language.'],
  [360, 'Six minutes. Touch grass. The dot will wait.'],
  [600, 'Ten minutes wasted. The Department of Nothingness is impressed.']
];

/* 32 Achievements (preserving all 6 original ones + 26 new ones) */
const ACH = {
  beginner:        { icon: '🍀', name: "Beginner's Luck",               desc: 'Catch the dot once.' },
  misclicker:      { icon: '🖱️', name: 'Professional Misclicker',       desc: 'Miss 10 times in one run.' },
  brain:           { icon: '🧠', name: 'Brain.exe Stopped Working',     desc: 'Miss 5 times within 3 seconds.' },
  unemployed:      { icon: '💼', name: 'Unemployment Simulator',         desc: 'Waste 5 minutes in total.' },
  certified:       { icon: '🏅', name: 'Certified Nothing Catcher',      desc: 'Reach any boss stage.' },
  idiot:           { icon: '🤡', name: 'Professional Idiot',             desc: 'Reach any game over.' },
  time_waster:     { icon: '⏳', name: 'Professional Time Waster',       desc: 'Survive for over 3 minutes in a single run.' },
  miss_again:      { icon: '📉', name: 'Missed It Again',                desc: 'Accumulate 30 total misses.' },
  button_presser:  { icon: '🔘', name: 'Certified Button Presser',      desc: 'Click 100 times in the game.' },
  dot_secrets:     { icon: '👁️', name: 'The Dot Knows Your Secrets',    desc: 'Hover within 25px of the dot for 3 seconds without catching it.' },
  almost_useful:   { icon: '🧪', name: 'Almost Useful',                  desc: 'Collect 5 useless power-ups.' },
  zero_prod:       { icon: '📭', name: 'Zero Productivity',              desc: 'Reach Level 3 with a score of 0.' },
  congrats_try:    { icon: '🎖️', name: 'Congratulations on Trying',      desc: 'Survive 3 random nonsense events.' },
  been_here_long:  { icon: '🕸️', name: 'You Have Been Here Too Long',   desc: 'Waste over 10 minutes total in the game.' },
  dot_disappointed:{ icon: '😒', name: 'The Dot Is Disappointed',        desc: 'Miss by fewer than 5 pixels.' },
  certified_npc:   { icon: '🤖', name: 'Certified NPC',                  desc: 'Consult the Useless AI Life Coach 5 times.' },
  master_nothing:  { icon: '💰', name: 'Master of Doing Nothing',        desc: 'Accumulate 500 NothingCoins.' },
  great_unach:     { icon: '🟡', name: 'The Great Unachievement',        desc: 'Purchase Golden Nothing from the shop.' },
  trust_issues:    { icon: '💔', name: 'Trust Issues Unlocked',          desc: 'Experience a fake victory.' },
  overqualified:   { icon: '🎓', name: 'Overqualified Failure',          desc: 'Reach level 5 on Impossible Nothing mode.' },
  dept_nothing:    { icon: '🏛️', name: 'The Department of Nothingness',  desc: 'Submit Form 404 to the Department.' },
  emotional_pixel: { icon: '📱', name: 'Emotionally Attached to a Pixel',desc: 'Read Dotothy\'s entire social feed.' },
  confident_click: { icon: '💪', name: 'You Clicked With Confidence',    desc: 'Click while Mouse Betrayal is active.' },
  ach_not_found:   { icon: '🔍', name: 'Achievement Not Found',          desc: 'Trigger the FIX EVERYTHING protocol.' },
  fake_win:        { icon: '🏆', name: 'A Victory That Never Happened',   desc: 'Experience 2 fake victories.' },
  concerned_game:  { icon: '📞', name: 'The Game Is Concerned About You',desc: 'File a complaint with Customer Support.' },
  cat_whisperer:   { icon: '🐱', name: 'Disturbed The Nap',              desc: 'Click Bartholomew the Cat companion.' },
  chicken_herder:  { icon: '🐔', name: 'Poultry Enthusiast',             desc: 'Survive a Chicken Invasion.' },
  tax_payer:       { icon: '🧾', name: 'Audit Survivor',                 desc: 'Pay a fee to the Department of Nothingness.' },
  lawyer_client:   { icon: '⚖️', name: 'Cease & Desist',                 desc: 'Meet the Dot\'s Lawyer in Boss Mode.' },
  billionaire_not: { icon: '👑', name: 'Nothing Millionaire',            desc: 'Accumulate 1,000 NothingCoins.' },
  ultimate_useless:{ icon: '🌌', name: 'The Uselessness Engine',         desc: 'Complete all bosses and generate your Certificate.' }
};

/* 45+ News Headlines */
const NEWS_HEADLINES = [
  "BREAKING: Local player still chasing one pixel. Economists report zero productivity.",
  "SCIENTISTS CONFIRM THAT NOTHING HAS BEEN ACHIEVED.",
  "THE DOT HAS REFUSED TO COMMENT ON ONGOING STALKING.",
  "LOCAL HUMAN LOSES 45-MINUTE ARGUMENT WITH FLOATING CIRCLE.",
  "GOVERNMENT CONSIDERS TAXING MISSED CLICKS AT 15% RATE.",
  "EXPERTS SAY THE PLAYER SHOULD HAVE STOPPED 20 MINUTES AGO.",
  "WORLD ECONOMY UNAFFECTED BY YOUR POINTLESS SCORE.",
  "THE DOT HAS OFFICIALLY HIRED A LAWYER.",
  "NOBODY IS CURRENTLY INVESTIGATING YOUR PERFORMANCE.",
  "GAME DEVELOPER REGRETS ADDING THIS ENTIRE SYSTEM.",
  "LOCAL MOUSE REVOLTS, DEMANDS UNION MEMBERSHIP AND CHEESE.",
  "CHAIR MANUFACTURERS REPORT RECORD POSTURE COLLAPSE.",
  "NEW STUDY: 100% OF CATCH NOTHING PLAYERS ARE DOING NOTHING.",
  "STOCK MARKET CRASHES AFTER WITNESSING YOUR CLICK ACCURACY.",
  "NASA CANCELS SPACE MISSION TO WATCH USER MISS CIRCLE 50 TIMES.",
  "PHILOSOPHER DECLARES THE DOT DOES NOT EXIST; USER CLICKS ANYWAY.",
  "FBI CONFIRMS THEY STOPPED MONITORING YOUR WEBCAM OUT OF BOREDOM.",
  "DEPARTMENT OF NOTHINGNESS ISSUES CITATION FOR EXCESSIVE ATTEMPTS.",
  "BREAKING: DOTOTHIA PIXELTON NAMED 'EVADER OF THE YEAR' FOR 2026.",
  "LOCAL DOG WONDERS WHY OWNER HAS BEEN STARING AT SCREEN FOR 2 HOURS.",
  "LOCAL COFFEE SHOP REFUSES TO ACCEPT NOTHINGCOINS AS PAYMENT.",
  "WEATHER REPORT: 100% CHANCE OF MISSING THE NEXT CLICK.",
  "DICTIONARY ADDS SCREENSHOT OF PLAYER'S ACCURACY UNDER 'FUTILE'.",
  "DOT APPLIES FOR RESTRAINING ORDER AGAINST USER'S CURSOR.",
  "UNPAID INTERN BLAMED FOR RANDOM MOUSE BETRAYAL EVENT.",
  "AI LIFE COACH REPORTS SEVERE EXISTENTIAL DREAD AFTER USER CONSULTATION.",
  "RECORD-BREAKING TIME WASTED TODAY: APPROXIMATELY ALL OF IT.",
  "BARTHOLOMEW THE CAT CONFIRMS HE COULD CATCH THE DOT IN ONE PAW.",
  "SCIENTISTS PROVE CHICKEN INVASIONS HAVE ZERO TACTICAL VALUE.",
  "INTERNET SPEED UNAFFECTED, DIGNITY PLUMMETING.",
  "USER ATTEMPTS TO BLAME WIRELESS MOUSE LATENCY; EXPERTS SKEPTICAL.",
  "THE DOT HAS POSTED A NEW STATUS: 'STILL VIBRATING IN PEACE'.",
  "SECRET SOCIETY OF CIRCLES CONGRATULATES DOT ON EVASION SKILLS.",
  "OFFICIAL AUDIT FINDS ZERO TRACE OF USEFUL WORK.",
  "LOCAL KEYBOARD SPACES BAR COMPLAINS OF UNNECESSARY ABUSE.",
  "WARNING: PROLONGED PLAYING MAY LEAD TO ENLIGHTENMENT OR ANNOYANCE.",
  "STUDY FINDS CAT COMPANION HAS HIGHER IQ THAN PLAYER'S AIM.",
  "BREAKING: FAKE VICTORY CONFETTI DECLARED ENVIRONMENTALLY HARMLESS.",
  "TIME MACHINE POWER-UP SUCCESSFULLY REWINDS 0.00 SECONDS.",
  "DOCTORS RECOMMEND TURNING OFF COMPUTER AND BECOMING A POTATO.",
  "THE DOT'S MANAGER DEMANDS FORMAL PERFORMANCE REVIEW.",
  "DOT'S PARENTS WONDER WHY IT COULDN'T GROW UP TO BE A SQUARE.",
  "EMERGENCY PROTOCOL ACTIVATED: NOTHING WAS IN DANGER.",
  "WORLD HAPPINESS INDEX DECLINES BY 0.0001% DUE TO REVERSE CONTROLS."
];

/* 35+ Useless AI Life Coach Responses */
const AI_RESPONSES = [
  "Have you tried being a completely different person?",
  "Your fundamental problem is that you expect things to happen.",
  "I analyzed your gameplay. The results were deeply inconclusive.",
  "You should chase your dreams. Start with that dot, then lower your expectations.",
  "Based on quantum calculations, you have a 0.000% chance of success.",
  "I recommend turning your computer off and becoming a potato.",
  "You are doing great. Unfortunately, doing great does not help.",
  "My neural network has determined that you need a sandwich and a nap.",
  "Your future looks bright. Unfortunately, it is the brightness of a loading screen.",
  "I cannot solve your problems, but I can make them animated in CSS.",
  "According to my training data, 10 out of 10 dots do not care about your feelings.",
  "Have you considered that the dot is chasing *you*, and winning?",
  "My advice is simple: click elsewhere. Specifically, anywhere else.",
  "I asked another AI about you. It pretended to disconnect.",
  "Your mouse trajectory resembles an avant-garde cry for help.",
  "The secret to winning is simple: close the tab and pretend you won.",
  "I ran 1,000,000 simulations. You lost in 1,000,001 of them.",
  "Your dedication is inspiring. Truly terrifying, but inspiring.",
  "Take a deep breath, stare into the middle distance, and reconsider your priorities.",
  "Success is a journey, not a destination. You are currently parked in a ditch.",
  "I would tell you to think outside the box, but you can't even stay inside the circle.",
  "My algorithm predicts your next click will be slightly to the left of useful.",
  "If at first you don't succeed, you are playing Catch Nothing.",
  "The universe does not judge you. But the dot does.",
  "Have you considered pursuing an alternative career in staring at walls?",
  "Your spirit animal is a dial-up modem.",
  "I have calculated your life satisfaction. Error: Division by zero.",
  "Try clicking with confidence. It won't work, but it looks cooler.",
  "Remember: every champion was once a contender who refused to click away.",
  "The dot has 99 problems, but catching it ain't one.",
  "I consulted the stars. They told me to mind my own business.",
  "Your persistence is admirable; your execution is an abstract painting.",
  "Do not let yesterday take up too much of today. That is the dot's job.",
  "I am an artificial intelligence. You are displaying natural uselessness.",
  "Have you tried turning yourself off and on again?"
];

/* 28+ Customer Support Responses */
const SUPPORT_RESPONSES = [
  "Have you tried not playing?",
  "Your complaint has been ignored successfully.",
  "We appreciate your feedback. We will do absolutely nothing with it.",
  "Your issue has been forwarded to the dot. The dot has blocked our email.",
  "Your ticket number is 404. Solution not found.",
  "We are experiencing unusually high levels of nothing right now.",
  "Have you tried blowing into your mouse USB port while humming?",
  "Our records indicate that you chose to be here voluntarily.",
  "A specialist will contact you in the year 2099.",
  "We reviewed your request and determined it violates our policy of doing things.",
  "Ticket escalated directly into the cosmic void.",
  "Please hold while we transfer you to an empty hallway.",
  "We sympathize with your frustration. We also enjoy it.",
  "According to our Terms of Emptiness, all time spent is non-refundable.",
  "Have you tried adjusting your chair's existential alignment?",
  "Our lead engineer looked at your report and laughed for 4 straight minutes.",
  "The dot operates under sovereign immunity. We cannot touch it.",
  "We have generated a coupon for 0% off your next nothing.",
  "Your feedback is very important to us. Please keep it to yourself.",
  "Agent Glitch #404 has entered a mental health sabbatical.",
  "Resolution: Skill deficiency confirmed. Closing ticket as 'Working as Intended'.",
  "We have dispatched 0 emergency units to assist you.",
  "Please restart your life and try again tomorrow.",
  "Our AI investigated your claim and awarded points to the circle.",
  "Ticket status: Folded into a paper crane and thrown out the window.",
  "Have you tried apologizing to your mouse?",
  "We recommend consulting Bartholomew the Cat for spiritual guidance."
];

/* Shop Catalog */
const SHOP_ITEMS = [
  { id: 'golden_nothing', name: 'Golden Nothing', price: 100, icon: '🟡', desc: 'A gold-plated void. Contains exactly 0 grams of real gold.' },
  { id: 'premium_nothing', name: 'Premium Nothing', price: 500, icon: '💎', desc: 'Nothing, but with a verified VIP badge and 20% more smugness.' },
  { id: 'invisible_trophy', name: 'Invisible Trophy', price: 1000, icon: '🏆', desc: 'An exquisite trophy that cannot be seen or felt by human senses.' },
  { id: 'nothing_plus', name: 'Nothing Plus Membership', price: 10000, icon: '🌟', desc: 'Unlocks zero additional features with 100% more pride.' },
  { id: 'lifetime_sub', name: 'Lifetime Nothing Sub', price: 1000000, icon: '👑', desc: 'Grants lifetime access to absolute, unadulterated emptiness.' }
];

/* Sarcastic Audience Roasts */
const ROASTS = [
  "BOOOOO!",
  "MY GRANDMOTHER CLICKS BETTER!",
  "THIS IS HARD TO WATCH...",
  "THE DOT IS WINNING EASILY!",
  "IS THIS PERFORMANCE ART?",
  "I WANT MY TIME BACK!",
  "SOMEONE CALL THE POLICE!",
  "THE MOUSE IS EMBARRASSED!",
  "DID YOU BLINK AGAIN?",
  "UNINSTALL THE BROWSER!",
  "0 STARS OUT OF 5!",
  "THE DOT IS LAUGHING AT YOU!"
];

/* Cat Speeches */
const CAT_MSGS = [
  "meow.",
  "I could catch that dot in 0.2 seconds.",
  "This is why I don't work.",
  "Have you considered sleeping instead?",
  "I am only here for the warm keyboard.",
  "Your gameplay has disturbed my 4th nap today.",
  "I have seen better reflexes from a potato.",
  "You missed again. Embarrassing.",
  "purrrrrr... (purring at your failure)"
];

/* ---------- storage & state ---------- */
function load() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { s = {}; }
  const out = Object.assign({
    diff: 'medium', sound: true, volume: 0.7, best: 0, wasted: 0, coins: 0,
    ach: {}, inventory: [],
    stats: { clicks: 0, catches: 0, misses: 0, dist: 0, fakeWins: 0, powerups: 0, aiQueries: 0, events: 0, likes: 0 },
    settings: { roast: true, cat: true, ticker: true, events: true, pointless: true },
    deptCase: 'DON-' + Math.floor(1000 + Math.random() * 9000) + '-VOID'
  }, s);
  if (!DIFFS[out.diff]) out.diff = 'medium';
  if (!out.stats) out.stats = { clicks: 0, catches: 0, misses: 0, dist: 0, fakeWins: 0, powerups: 0, aiQueries: 0, events: 0, likes: 0 };
  if (!out.settings) out.settings = { roast: true, cat: true, ticker: true, events: true, pointless: true };
  if (!out.inventory) out.inventory = [];
  return out;
}
const save = load();
function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } }

/* ---------- elements cache ---------- */
const el = {
  arena: $('#arena'), dot: $('#dot'), cursor: $('#cursor'), banner: $('#banner'), msg: $('#msg'),
  hLevel: $('#hLevel'), hTag: $('#hTag'), hHits: $('#hHits'), hTime: $('#hTime'), hScore: $('#hScore'), hMiss: $('#hMiss'), hCoins: $('#hCoins'),
  timerBox: $('#timerBox'), pauseOv: $('#pauseOv'), voidOv: $('#voidOv'), pauseBtn: $('#pauseBtn'),
  eventBanner: $('#eventBanner'), eventIcon: $('#eventIcon'), eventTitle: $('#eventTitle'), eventEffects: $('#eventEffects'),
  catCompanion: $('#catCompanion'), catBubble: $('#catBubble'),
  tickerText: $('#tickerText'), newsTickerBar: $('#newsTickerBar')
};

let g = null;                // current run state
let W = 0, H = 0;            // arena dimensions
let raf = 0, lastT = 0, lastMsg = '';
let paused = false, lockWasOn = false, timers = [];
const last = { x: 0, y: 0, ok: false };
const D = () => DIFFS[save.diff];

/* ---------- helpers ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const fmtLong = s => s < 60 ? `${Math.floor(s)}s` : s < 3600 ? `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s` : `${Math.floor(s / 3600)}h ${Math.floor(s % 3600 / 60)}m`;
function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
function clearTimers() { timers.forEach(clearTimeout); timers = []; }
function pick(pool) { let m; do { m = pool[Math.random() * pool.length | 0]; } while (m === lastMsg && pool.length > 1); lastMsg = m; return m; }
function restartAnim(node, cls, ms) { if (!node) return; node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); later(() => node.classList.remove(cls), ms); }
function say(text, kind) {
  if (!el.msg) return;
  el.msg.textContent = text;
  el.msg.classList.remove('good', 'bad', 'gold');
  if (kind) el.msg.classList.add(kind);
  restartAnim(el.msg, 'show', 2600);
}
function show(id) { $$('.screen').forEach(s => s.classList.toggle('active', s.id === id)); }

/* ---------- audio synthesis (Web Audio API, offline, zero files) ---------- */
let ac = null, masterGain = null;
function initAudio() {
  try {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ac.createGain();
      masterGain.gain.setValueAtTime(save.volume, ac.currentTime);
      masterGain.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { ac = null; }
}
function setVolume(v) {
  save.volume = clamp(v, 0, 1);
  persist();
  if (masterGain && ac) masterGain.gain.setValueAtTime(save.volume, ac.currentTime);
}
function tone(f, dur, type = 'sine', vol = .07, slide = 0, delay = 0) {
  if (!save.sound || !ac || !masterGain) return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), v = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(Math.max(20, f), t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + dur);
  v.gain.setValueAtTime(vol, t);
  v.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(v);
  v.connect(masterGain);
  o.start(t);
  o.stop(t + dur + .03);
}

const sfx = {
  click:       () => tone(500, .05, 'square', .04),
  hit:         () => { tone(660, .1, 'square', .08); tone(990, .16, 'square', .06, 0, .08); },
  miss:        () => tone(220, .22, 'sawtooth', .06, -140),
  tp:          () => tone(1200, .12, 'triangle', .05, -900),
  level:       () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .14, 'triangle', .07, 0, i * .09)),
  ach:         () => [880, 1100, 1320, 1760].forEach((f, i) => tone(f, .12, 'sine', .08, 0, i * .07)),
  over:        () => [392, 330, 262, 196].forEach((f, i) => tone(f, .28, 'sawtooth', .06, 0, i * .22)),
  boss:        () => tone(85, .9, 'sawtooth', .09, -35),
  fakeVictory: () => {
    [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, .25, 'triangle', .09, 0, i * .08));
    later(() => [784, 1046, 1568].forEach((f, i) => tone(f, .4, 'square', .07, 0, i * .1)), 500);
  },
  scratch:     () => tone(800, .25, 'sawtooth', .09, -700),
  sadTrombone: () => [247, 233, 220, 196].forEach((f, i) => tone(f, .35, 'sawtooth', .08, -10, i * .3)),
  meow:        () => { tone(900, .18, 'sine', .06, 300); tone(1200, .2, 'sine', .06, -600, .15); },
  boing:       () => tone(180, .22, 'triangle', .08, 550),
  stamp:       () => tone(120, .15, 'triangle', .1, -60),
  coin:        () => { tone(987, .1, 'square', .05); tone(1318, .18, 'square', .06, 0, .08); },
  alarm:       () => { [600, 900, 600, 900].forEach((f, i) => tone(f, .1, 'sawtooth', .06, 0, i * .1)); },
  cluck:       () => { tone(420, .08, 'triangle', .07, 100); tone(340, .1, 'triangle', .07, -50, .09); }
};

/* ---------- economy (NothingCoins) ---------- */
function addCoins(n, reason) {
  save.coins += n;
  if (save.coins >= 500) unlock('master_nothing');
  if (save.coins >= 1000) unlock('billionaire_not');
  persist();
  if (g) {
    el.hCoins.textContent = save.coins + ' NC';
    pop(el.hCoins);
  }
  $('#mCoins').textContent = save.coins + ' NC';
  $('#shopCoinsDisplay').textContent = save.coins + ' NC';
  sfx.coin();
  if (reason) toast('🪙', `+${n} NothingCoins`, reason);
}

/* ---------- toasts & achievements ---------- */
function toast(icon, title, sub, isGold = false) {
  const t = document.createElement('div');
  t.className = 'toast' + (isGold ? ' gold' : '');
  t.innerHTML = '<span class="ic"></span><div><b></b><small></small></div>';
  t.querySelector('.ic').textContent = icon;
  t.querySelector('b').textContent = title;
  t.querySelector('small').textContent = sub;
  const box = $('#toasts');
  if (box) {
    box.appendChild(t);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(() => t.remove(), 3700);
  }
}

function unlock(id) {
  if (save.ach[id] || !ACH[id]) return;
  save.ach[id] = true;
  persist();
  const a = ACH[id];
  toast(a.icon, 'Achievement Unlocked: ' + a.name, a.desc, true);
  sfx.ach();
  addCoins(50, 'Achievement: ' + a.name);
  if (g) g.newAch.push(id);
  refreshMenu();
}

/* ---------- news ticker engine ---------- */
let tickerIdx = 0;
function initTicker() {
  setInterval(() => {
    if (!save.settings.ticker) return;
    tickerIdx = (tickerIdx + 1) % NEWS_HEADLINES.length;
    if (el.tickerText) el.tickerText.textContent = NEWS_HEADLINES[tickerIdx];
  }, 6000);
}

/* ---------- Cat Companion (Bartholomew) ---------- */
let catTimer = null;
function initCat() {
  if (!el.catCompanion) return;
  el.catCompanion.addEventListener('click', () => {
    initAudio();
    sfx.meow();
    sayCat(pick(["purrrrrr...", "Human, you are useless.", "Petting me won't help you catch the dot."]));
    unlock('cat_whisperer');
    addCoins(5, 'Cat Petting Fee');
  });

  setInterval(() => {
    if (!save.settings.cat || !g || g.over || paused) return;
    if (Math.random() < 0.35) {
      sayCat(pick(CAT_MSGS));
    }
  }, 10000);
}

function sayCat(text) {
  if (!el.catBubble) return;
  el.catBubble.textContent = text;
  el.catBubble.classList.add('show');
  setTimeout(() => el.catBubble.classList.remove('show'), 3200);
}

/* ---------- Random Nonsense Event Engine ---------- */
const NONSENSE_EVENTS = [
  { id: 'chicken', name: 'CHICKEN INVASION', icon: '🐔', desc: 'Animated poultry wandering through your regrets.', dur: 7 },
  { id: 'disco',   name: 'DISCO MODE',      icon: '🪩', desc: 'The dot dances to an imaginary beat.',           dur: 6 },
  { id: 'rain',    name: 'RAINING DOTS',    icon: '🌧️', desc: 'A torrential drizzle of decorative decoys.',     dur: 6 },
  { id: 'snail',   name: 'SNAIL MODE',      icon: '🐌', desc: 'Temporal dilation in effect. Move like molasses.',dur: 5 },
  { id: 'ghost',   name: 'GHOST MODE',      icon: '👻', desc: 'The dot has phase-shifted into the ethereal void.',dur: 5 },
  { id: 'court',   name: 'COURTROOM DRAMA', icon: '⚖️', desc: 'THE COURT FINDS YOU GUILTY OF CHASING CIRCLES.',dur: 5 },
  { id: 'tax',     name: 'TAX AUDIT',       icon: '🧾', desc: 'Tax invoice: 15% levied on 0 accomplishments.',  dur: 5 },
  { id: 'meteor',  name: 'METEOR SHOWER',   icon: '☄️', desc: 'Harmless space debris passing through the arena.',dur: 6 },
  { id: 'time',    name: 'TIME CONFUSION',  icon: '⏳', desc: 'TIME IS A SOCIAL CONSTRUCT.',                     dur: 5 },
  { id: 'strike',  name: 'DOT STRIKE',      icon: '🪧', desc: 'The dot has stopped moving to protest working conditions.',dur: 5 },
  { id: 'update',  name: 'FAKE UPDATE',     icon: '💾', desc: 'INSTALLING UPDATE: IMPROVED NOTHINGNESS — 99%',   dur: 5 }
];

function triggerRandomEvent() {
  if (!g || g.over || paused || g.activeEvent || !save.settings.events) return;
  const ev = pick(NONSENSE_EVENTS);
  startEvent(ev);
}

function startEvent(ev) {
  g.activeEvent = ev;
  save.stats.events++;
  persist();
  el.eventIcon.textContent = ev.icon;
  el.eventTitle.textContent = `${ev.name}: ${ev.desc}`;
  el.eventBanner.classList.add('show');
  sfx.alarm();
  say(ev.desc, 'gold');

  if (ev.id === 'chicken') {
    unlock('chicken_herder');
    for (let i = 0; i < 4; i++) {
      later(() => {
        if (!g || g.over) return;
        const c = document.createElement('div');
        c.className = 'chicken';
        c.textContent = '🐔';
        c.style.top = rnd(20, H - 40) + 'px';
        c.style.animationDuration = rnd(4, 7) + 's';
        el.eventEffects.appendChild(c);
        sfx.cluck();
        setTimeout(() => c.remove(), 7500);
      }, i * 900);
    }
  } else if (ev.id === 'disco') {
    el.arena.classList.add('disco-mode');
  } else if (ev.id === 'rain') {
    for (let i = 0; i < 18; i++) {
      const d = document.createElement('div');
      d.className = 'dot fake';
      d.style.cssText = `position:absolute;left:${rnd(10, W - 10)}px;top:-20px;opacity:.7;transition:transform 2.5s linear;`;
      el.eventEffects.appendChild(d);
      setTimeout(() => { d.style.transform = `translate3d(0,${H + 40}px,0)`; }, 50);
      setTimeout(() => d.remove(), 2600);
    }
  } else if (ev.id === 'snail') {
    g.speedMod = 0.35;
    sfx.sadTrombone();
  } else if (ev.id === 'ghost') {
    el.dot.classList.add('ghost-mode');
  } else if (ev.id === 'court') {
    sfx.stamp();
    toast('⚖️', 'COURTROOM VERDICT', 'GUILTY OF CHASING CIRCLES! Fine: 10 NC.');
    addCoins(10, 'Court Contempt Refund');
  } else if (ev.id === 'tax') {
    sfx.stamp();
    toast('🧾', 'TAX NOTICE', '15% tax assessed on 0 accomplishments.');
    unlock('tax_payer');
  } else if (ev.id === 'meteor') {
    for (let i = 0; i < 12; i++) {
      later(() => {
        if (!g || g.over) return;
        const m = document.createElement('div');
        m.className = 'meteor';
        m.style.left = rnd(0, W * 0.7) + 'px';
        m.style.top = rnd(0, H * 0.3) + 'px';
        el.eventEffects.appendChild(m);
        setTimeout(() => m.remove(), 1300);
      }, i * 350);
    }
  } else if (ev.id === 'time') {
    g.fakeTimeText = 'TIME IS A SOCIAL CONSTRUCT';
  } else if (ev.id === 'strike') {
    g.dotStrike = true;
    const sign = document.createElement('div');
    sign.className = 'dot-strike-sign';
    sign.textContent = 'ON STRIKE! 🪧';
    el.dot.appendChild(sign);
    later(() => sign.remove(), ev.dur * 1000);
  } else if (ev.id === 'update') {
    toast('💾', 'SYSTEM UPDATE', 'INSTALLING IMPROVED NOTHINGNESS — 99% COMPLETE.');
  }

  later(() => endEvent(ev), ev.dur * 1000);
}

function endEvent(ev) {
  if (!g) return;
  g.activeEvent = null;
  g.speedMod = 1;
  g.fakeTimeText = null;
  g.dotStrike = false;
  el.eventBanner.classList.remove('show');
  el.arena.classList.remove('disco-mode');
  el.dot.classList.remove('ghost-mode');
  el.eventEffects.innerHTML = '';
  addCoins(25, `Survived ${ev.name}`);
  if (save.stats.events >= 3) unlock('congrats_try');
}

/* ---------- Mouse Betrayal Mode ---------- */
function triggerMouseBetrayal() {
  if (!g || g.over || paused || g.betrayed) return;
  g.betrayed = true;
  el.cursor.classList.add('betrayed');
  sfx.alarm();
  const notice = pick([
    'YOUR MOUSE HAS RESIGNED.',
    'YOUR HANDS ARE NOT QUALIFIED.',
    'THE MOUSE IS MAKING ITS OWN DECISIONS.',
    'CONTROL TRANSFERRED TO AN UNPAID INTERN.'
  ]);
  say(notice, 'bad');
  toast('⚠️', 'MOUSE BETRAYAL IN PROGRESS', notice);

  later(() => {
    if (!g) return;
    g.betrayed = false;
    el.cursor.classList.remove('betrayed');
    say('MOUSE UNION SETTLED. Controls normalized.', 'good');
  }, 6000);
}

/* ---------- Useless Power-Ups Engine ---------- */
const POWERUP_TYPES = [
  { id: 'future_vision', name: 'Future Vision',  icon: '🔮', desc: 'Shows where the dot was 3 seconds ago!' },
  { id: 'magnetic_mouse',name: 'Magnetic Mouse', icon: '🧲', desc: 'Attracts fake decoys straight to your cursor!' },
  { id: 'invis_shield',  name: 'Invisible Shield',icon:'🛡️', desc: 'SHIELD ACTIVE! Protected from 0 incoming attacks!' },
  { id: 'time_machine',  name: 'Time Machine',   icon: '⏰', desc: 'REWOUND 0.00 SECONDS INTO THE PRESENT!' },
  { id: 'double_points', name: 'Double Points',  icon: '✖️', desc: '+500 POINTS! (Points cannot be redeemed anywhere)' },
  { id: 'golden_cursor', name: 'Golden Cursor',  icon: '✨', desc: 'Aesthetic value +400%. Hit chance: unchanged.' },
  { id: 'anti_gravity',  name: 'Anti-Gravity',   icon: '🎈', desc: 'Ambient particles now float into the sky.' },
  { id: 'luck_potion',   name: 'Luck Potion',    icon: '🧪', desc: 'YOUR LUCK HAS IMPROVED BY 0.000%!' },
  { id: 'quantum_catch', name: 'Quantum Catcher',icon: '🌌', desc: 'Caught dot in Universe #4928! (Not this one)' },
  { id: 'emergency_btn', name: 'Emergency Button',icon:'🚨', desc: 'EMERGENCY PROTOCOL ENGAGED! Nothing in danger.' }
];

function spawnPowerup() {
  if (!g || g.over || paused || g.powerupEl) return;
  const p = pick(POWERUP_TYPES);
  const px = rnd(40, W - 40), py = rnd(40, H - 40);
  const node = document.createElement('div');
  node.className = 'powerup-item';
  node.textContent = p.icon;
  node.style.transform = `translate3d(${px - 16}px,${py - 16}px,0)`;
  node.title = `${p.name}: ${p.desc}`;
  el.arena.appendChild(node);
  g.powerup = { ...p, x: px, y: py, el: node };

  node.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    initAudio();
    collectPowerup();
  });

  later(() => {
    if (g && g.powerup && g.powerup.el === node) {
      node.remove();
      g.powerup = null;
    }
  }, 9000);
}

function collectPowerup() {
  if (!g || !g.powerup) return;
  const p = g.powerup;
  p.el.remove();
  g.powerup = null;
  save.stats.powerups++;
  persist();
  sfx.boing();
  toast(p.icon, p.name, p.desc);
  say(p.desc, 'gold');
  addCoins(15, p.name);

  if (p.id === 'golden_cursor') {
    el.cursor.classList.add('golden');
    later(() => el.cursor.classList.remove('golden'), 8000);
  } else if (p.id === 'double_points') {
    g.score += 500;
    pop(el.hScore);
  } else if (p.id === 'anti_gravity') {
    document.body.classList.add('anti-gravity');
    later(() => document.body.classList.remove('anti-gravity'), 8000);
  } else if (p.id === 'emergency_btn') {
    sfx.alarm();
  }
  if (save.stats.powerups >= 5) unlock('almost_useful');
}

/* ---------- Fake Victory System ---------- */
function triggerFakeVictory() {
  cancelAnimationFrame(raf);
  unlockPointer();
  save.stats.fakeWins++;
  persist();
  sfx.fakeVictory();
  show('fakeVictory');

  // Spawn confetti
  const box = $('#confettiBox');
  if (box) {
    box.innerHTML = '';
    const cols = ['#ffca28', '#ff2e9a', '#27f0ff', '#00e676', '#8b3dff'];
    for (let i = 0; i < 45; i++) {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.style.left = rnd(0, 100) + '%';
      c.style.background = cols[i % cols.length];
      c.style.animationDelay = rnd(0, 2) + 's';
      c.style.animationDuration = rnd(2.5, 4.5) + 's';
      box.appendChild(c);
    }
  }

  unlock('trust_issues');
  if (save.stats.fakeWins >= 2) unlock('fake_win');

  const stamp = $('#fakeRevokedStamp');
  const btn = $('#acceptFakeLossBtn');
  if (stamp) stamp.style.display = 'none';
  if (btn) btn.style.display = 'none';

  // 4.2 seconds later: The Twist!
  later(() => {
    sfx.scratch();
    sfx.sadTrombone();
    if (stamp) stamp.style.display = 'block';
    if (btn) btn.style.display = 'inline-flex';
    $('#vicSub').textContent = 'ACTUALLY, YOU LOST.';
    $('#vicDesc').textContent = '"Your victory certificate has been revoked by the Department of Nothingness."';
    addCoins(50, 'Emotional Damage Compensation');
  }, 4200);
}

/* ---------- menu & hub modals ---------- */
function refreshMenu() {
  $('#mBest').textContent = save.best;
  $('#mWasted').textContent = fmtLong(save.wasted);
  $('#mCoins').textContent = save.coins + ' NC';
  $('#shopCoinsDisplay').textContent = save.coins + ' NC';
  $$('.chip[data-diff]').forEach(c => c.setAttribute('aria-checked', String(c.dataset.diff === save.diff)));
  $('#diffNote').textContent = D().note;

  const n = Object.keys(ACH).filter(k => save.ach[k]).length;
  const total = Object.keys(ACH).length;
  $('#achBadge').textContent = `${n}/${total}`;
  $('#achModalCount').textContent = `(${n}/${total})`;

  // Render modal achievements
  renderAchievementsList('all');
  renderShop();
  updateSoundUi();
}

function updateSoundUi() {
  $('#soundBtn').textContent = 'Sound: ' + (save.sound ? 'on' : 'off');
  $('#soundBtn').setAttribute('aria-pressed', String(save.sound));
  $('#soundBtn2').textContent = save.sound ? 'Sound on' : 'Sound off';
  $('#soundBtn2').setAttribute('aria-pressed', String(save.sound));
  if ($('#volSlider')) $('#volSlider').value = Math.round(save.volume * 100);
}

function toggleSound() {
  save.sound = !save.sound;
  persist();
  initAudio();
  updateSoundUi();
  sfx.click();
}

/* ---------- Achievements Filter & Render ---------- */
function renderAchievementsList(filter = 'all') {
  const list = $('#achModalList');
  if (!list) return;
  list.innerHTML = '';
  Object.keys(ACH).forEach(k => {
    const isUnlocked = !!save.ach[k];
    if (filter === 'unlocked' && !isUnlocked) return;
    if (filter === 'locked' && isUnlocked) return;
    const a = ACH[k];
    const li = document.createElement('li');
    li.style.cssText = `display:flex;gap:12px;align-items:center;padding:10px 14px;background:rgba(255,255,255,${isUnlocked ? '.06' : '.02'});border-radius:8px;border-left:4px solid ${isUnlocked ? 'var(--gold)' : 'var(--line)'};opacity:${isUnlocked ? '1' : '.5'}`;
    li.innerHTML = `
      <span style="font-size:1.8rem">${isUnlocked ? a.icon : '🔒'}</span>
      <div style="flex:1">
        <b style="color:${isUnlocked ? 'var(--text)' : 'var(--mute)'};font-size:.95rem">${a.name}</b>
        <small style="display:block;color:var(--mute);font-size:.8rem">${a.desc}</small>
      </div>
      <span style="font-size:.78rem;font-weight:700;color:${isUnlocked ? 'var(--gold)' : 'var(--mute)'}">${isUnlocked ? 'UNLOCKED' : 'LOCKED'}</span>
    `;
    list.appendChild(li);
  });
}

/* ---------- Shop System ---------- */
function renderShop() {
  const grid = $('#shopGrid');
  if (!grid) return;
  grid.innerHTML = '';
  SHOP_ITEMS.forEach(it => {
    const owned = save.inventory.includes(it.id);
    const card = document.createElement('div');
    card.className = 'shop-item' + (owned ? ' purchased' : '');
    card.innerHTML = `
      <div class="shop-item-top">
        <span class="shop-item-icon">${it.icon}</span>
        <span class="shop-item-price">${it.price.toLocaleString()} NC</span>
      </div>
      <h4>${it.name}</h4>
      <p>${it.desc}</p>
      <button type="button" class="btn sm ${owned ? 'ghost' : 'gold'}" data-buy="${it.id}">
        ${owned ? '✓ Owned (Useless)' : 'Buy with NothingCoins'}
      </button>
    `;
    grid.appendChild(card);
  });
}

function buyShopItem(id) {
  const it = SHOP_ITEMS.find(x => x.id === id);
  if (!it) return;
  if (save.inventory.includes(id)) {
    toast('ℹ️', 'Already Owned', 'You already own this monument to nothingness.');
    return;
  }
  if (save.coins < it.price) {
    toast('🚫', 'Insufficient NothingCoins', `You need ${it.price} NC. Miss more clicks to earn coins!`);
    sfx.miss();
    return;
  }
  save.coins -= it.price;
  save.inventory.push(id);
  persist();
  sfx.coin();
  toast(it.icon, 'Purchase Successful!', `You bought ${it.name}. It does nothing.`);
  if (id === 'golden_nothing') unlock('great_unach');
  refreshMenu();
}

/* ---------- layout & arena sizing ---------- */
function layout() {
  const nw = el.arena.clientWidth, nh = el.arena.clientHeight;
  if (!nw || !nh) return;
  if (g && W && H) {
    const sx = nw / W, sy = nh / H;
    g.cx *= sx; g.cy *= sy; g.dot.x *= sx; g.dot.y *= sy;
    g.fakes.forEach(f => { f.x *= sx; f.y *= sy; });
  }
  W = nw; H = nh;
}

/* ---------- run / level setup ---------- */
function startGame() {
  clearTimers();
  cancelAnimationFrame(raf);
  paused = false;
  last.ok = false;
  el.pauseOv.hidden = true;
  el.voidOv.hidden = true;

  g = {
    li: 0, score: 0, misses: 0, hitsTotal: 0, completed: 0, elapsed: 0, banked: 0, over: false,
    missTimes: [], longIdx: 0, newAch: [], cx: 0, cy: 0, fakes: [],
    dot: { x: 0, y: 0, ang: 0 }, lastSec: 0,
    speedMod: 1, betrayed: false, activeEvent: null, eventCooldown: 15,
    powerupCooldown: 10, powerup: null, fakeTimeText: null, dotStrike: false,
    lastDotDist: 999, nearDotTime: 0
  };

  show('game');
  W = H = 0;
  layout();
  g.cx = W / 2;
  g.cy = H / 2;
  startLevel(0);
  lastT = performance.now();
  raf = requestAnimationFrame(loop);
  lockPointer();
}

function clearFakes() {
  if (g && g.fakes) g.fakes.forEach(f => f.el.remove());
  if (g) g.fakes = [];
}

function sizeDot(node, r) {
  node.style.width = node.style.height = (r * 2) + 'px';
}

function randSpot() {
  const need = Math.min(220, Math.min(W, H) / 2.5);
  for (let k = 0; k < 40; k++) {
    const x = rnd(24, W - 24), y = rnd(24, H - 24);
    if (dist(x, y, g.cx, g.cy) >= need) return { x, y };
  }
  return { x: W - g.cx, y: H - g.cy };
}

function startLevel(i) {
  if (i >= LEVELS.length) {
    return endCertificate();
  }
  const lv = LEVELS[i], d = D();
  g.li = i;
  g.lv = lv;
  g.hits = 0;
  g.need = lv.boss ? 1 : d.need;
  g.time = lv.boss ? 26 : d.time;
  g.intro = 1.8;
  g.bossT = 0;
  g.ix = !!lv.ix;
  g.iy = !!lv.iy || (save.diff === 'impossible' && i >= 3);
  g.tp = { charges: 3, cool: 0, rech: 0 };

  const s = randSpot();
  g.dot.x = s.x; g.dot.y = s.y; g.dot.ang = rnd(0, Math.PI * 2);

  const dotRadius = d.r * (lv.rMult || 1);
  sizeDot(el.dot, dotRadius);
  el.dot.style.opacity = 1;
  el.dot.className = 'dot' + (lv.boss ? ' boss-stage ' + (lv.bType ? lv.bType + '-dot' : '') : '');

  clearFakes();
  if (lv.clones) {
    for (let k = 0; k < d.fakes; k++) {
      const n = document.createElement('div');
      n.className = 'dot fake';
      sizeDot(n, d.r);
      el.arena.insertBefore(n, el.cursor);
      g.fakes.push({ el: n, x: rnd(20, W - 20), y: rnd(20, H - 20), ang: rnd(0, 6.28), sp: rnd(.7, 1.3) });
    }
  }

  el.arena.className = 'lv' + Math.min(i + 1, 6) + (lv.boss ? ' boss-stage' : '');
  el.hLevel.textContent = `Level ${i + 1} — ${lv.name}`;
  el.hTag.textContent = lv.tag;
  el.banner.innerHTML = `<b>${lv.boss ? 'FINAL BOSS STAGE' : 'LEVEL ' + (i + 1)}</b><strong>${lv.name}</strong><em>${lv.tag}</em>`;
  restartAnim(el.banner, 'show', 1800);

  if (lv.boss) {
    unlock('certified');
    sfx.boss();
    if (lv.bType === 'lawyer') unlock('lawyer_client');
  } else if (i > 0) {
    sfx.level();
  }

  // Reverse-Reverse Controls joke on level 3
  if (i === 2 && Math.random() < 0.5) {
    toast('🔄', 'REVERSE-REVERSE CONTROLS', 'WE FIXED THE CONTROLS! THEY ARE NOW MORE BROKEN.');
  }

  updateHud();
}

function updateHud() {
  if (!g) return;
  el.hHits.textContent = `${g.hits}/${g.need}`;
  el.hMiss.textContent = g.misses;
  el.hScore.textContent = g.score;
  el.hCoins.textContent = `${save.coins} NC`;

  if (g.fakeTimeText) {
    el.hTime.textContent = g.fakeTimeText;
  } else {
    el.hTime.textContent = Math.max(0, Math.ceil(g.time));
  }
  el.timerBox.classList.toggle('low', g.time <= 8);
}

function pop(node) {
  if (!node || REDUCED) return;
  node.classList.remove('pop');
  void node.offsetWidth;
  node.classList.add('pop');
}

/* ---------- main game loop ---------- */
function loop(t) {
  if (!g || g.over) return;
  raf = requestAnimationFrame(loop);
  const dt = Math.min(.05, (t - lastT) / 1000);
  lastT = t;
  if (paused) return;
  update(dt);
  render();
}

function wander(o, sp, dt) {
  o.ang += (Math.random() - .5) * 4 * dt;
  o.x += Math.cos(o.ang) * sp * dt;
  o.y += Math.sin(o.ang) * sp * dt;
  const m = 18;
  if (o.x < m)     { o.x = m;     o.ang = Math.PI - o.ang; }
  if (o.x > W - m) { o.x = W - m; o.ang = Math.PI - o.ang; }
  if (o.y < m)     { o.y = m;     o.ang = -o.ang; }
  if (o.y > H - m) { o.y = H - m; o.ang = -o.ang; }
}

function update(dt) {
  if (g.intro > 0) { g.intro -= dt; return; }
  const lv = g.lv, d = D();
  g.elapsed += dt;
  g.time -= dt;

  let sp = lv.speed * d.speed * g.speedMod;
  if (g.dotStrike) sp = 0; // Dot on strike

  // Teleport mechanics
  if (lv.tp) {
    const T = g.tp;
    T.cool = Math.max(0, T.cool - dt);
    if (T.charges === 0) {
      sp *= .5;
      T.rech -= dt;
      if (T.rech <= 0) { T.charges = 3; el.dot.classList.remove('tired'); }
    } else if (T.cool <= 0 && dist(g.cx, g.cy, g.dot.x, g.dot.y) < d.tpRange) {
      const s = randSpot();
      g.dot.x = s.x; g.dot.y = s.y;
      T.charges--; T.cool = .45;
      sfx.tp();
      restartAnim(el.dot, 'blink', 300);
      if (T.charges === 0) {
        T.rech = d.rech;
        el.dot.classList.add('tired');
        say(pick(MSG.tired), 'good');
      } else if (Math.random() < .3) say(pick(MSG.tp));
    }
  }

  wander(g.dot, sp, dt);
  g.fakes.forEach(f => wander(f, lv.speed * d.speed * f.sp * g.speedMod, dt));

  // Boss 3 (Invisible) fades away
  if (lv.bType === 'invis') {
    g.bossT += dt;
    el.dot.style.opacity = Math.max(0, 1 - g.bossT / 6).toFixed(3);
    if (g.bossT > 2 && !g.bossSaid) { g.bossSaid = true; say(pick(MSG.boss)); }
  }

  // Hover near dot without catching achievement
  const dd = dist(g.cx, g.cy, g.dot.x, g.dot.y);
  if (dd < 28) {
    g.nearDotTime += dt;
    if (g.nearDotTime >= 3) unlock('dot_secrets');
  } else {
    g.nearDotTime = 0;
  }

  // Cooldowns for random nonsense events & power-ups
  g.eventCooldown -= dt;
  if (g.eventCooldown <= 0) {
    g.eventCooldown = rnd(24, 38);
    if (Math.random() < 0.25) triggerMouseBetrayal();
    else triggerRandomEvent();
  }

  g.powerupCooldown -= dt;
  if (g.powerupCooldown <= 0) {
    g.powerupCooldown = rnd(18, 28);
    spawnPowerup();
  }

  const sec = Math.floor(g.elapsed);
  if (sec !== g.lastSec) {
    g.lastSec = sec;
    everySecond();
  }

  const L = LONG[g.longIdx];
  if (L && g.elapsed >= L[0]) {
    say(L[1]);
    g.longIdx++;
  }

  updateHud();

  if (g.time <= 0 && !g.over) {
    say(pick(MSG.timeout), 'bad');
    end('timeout');
  }
}

function everySecond() {
  const currentTotal = save.wasted + (g.elapsed - g.banked);
  if (currentTotal >= 300) unlock('unemployed');
  if (currentTotal >= 600) unlock('been_here_long');
  if (g.elapsed >= 180) unlock('time_waster');
  if (g.li >= 2 && g.score === 0) unlock('zero_prod');
  if (g.li >= 4 && save.diff === 'impossible') unlock('overqualified');
}

function render() {
  if (!g) return;
  const r = D().r * (g.lv.rMult || 1);
  el.dot.style.transform = `translate3d(${g.dot.x - r}px,${g.dot.y - r}px,0)`;
  g.fakes.forEach(f => {
    f.el.style.transform = `translate3d(${f.x - D().r}px,${f.y - D().r}px,0)`;
  });
  el.cursor.style.transform = `translate3d(${g.cx - 14}px,${g.cy - 14}px,0)`;
}

/* ---------- input & cursor coordinates ---------- */
function onMove(e) {
  if (!g || g.over || paused) return;
  const locked = document.pointerLockElement === el.arena && e.pointerType === 'mouse';
  if (!locked && !last.ok) { last.x = e.clientX; last.y = e.clientY; last.ok = true; return; }

  let dx = locked ? e.movementX : e.clientX - last.x;
  let dy = locked ? e.movementY : e.clientY - last.y;
  last.x = e.clientX; last.y = e.clientY;

  // Track cursor distance
  const pDist = Math.hypot(dx, dy);
  save.stats.dist += pDist;

  // Mouse Betrayal mod
  if (g.betrayed) {
    const tmp = dx;
    dx = -dy * 1.3;
    dy = tmp * 1.3;
  }

  g.cx = clamp(g.cx + (g.ix ? -dx : dx), 0, W);
  g.cy = clamp(g.cy + (g.iy ? -dy : dy), 0, H);
  render();
}

function onDown(e) {
  initAudio();
  last.x = e.clientX; last.y = e.clientY; last.ok = true;
  if (e.pointerType === 'touch') {
    try { el.arena.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    return;
  }
  if (e.button === 0) attempt();
}

function lockPointer() {
  if (!window.matchMedia('(pointer: fine)').matches || !el.arena.requestPointerLock) return;
  try {
    const p = el.arena.requestPointerLock();
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* fallback */ }
}
function unlockPointer() { if (document.pointerLockElement) document.exitPointerLock(); }

/* ---------- hit / miss logic ---------- */
function attempt() {
  if (!g || g.over || paused || g.intro > 0) return;
  save.stats.clicks++;
  if (save.stats.clicks >= 100) unlock('button_presser');
  if (g.betrayed) unlock('confident_click');
  persist();

  const d = D(), reach = (d.r * (g.lv.rMult || 1)) + d.slack;
  const dd = dist(g.cx, g.cy, g.dot.x, g.dot.y);

  if (dd <= reach) return onHit();

  const hitFake = g.fakes.some(f => dist(g.cx, g.cy, f.x, f.y) <= (d.r + d.slack));
  onMiss(dd, hitFake);
}

function burst(x, y) {
  if (REDUCED) return;
  for (let k = 0; k < 16; k++) {
    const s = document.createElement('span'), a = rnd(0, 6.28), len = rnd(30, 95);
    s.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:6px;height:6px;border-radius:50%;background:${k % 2 ? '#27f0ff' : '#ff2e9a'};pointer-events:none`;
    el.arena.appendChild(s);
    const an = s.animate([
      { transform: 'translate(0,0)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * len}px,${Math.sin(a) * len}px)`, opacity: 0 }
    ], { duration: 550, easing: 'ease-out' });
    an.onfinish = () => s.remove();
  }
}

function onHit() {
  g.hits++;
  g.hitsTotal++;
  save.stats.catches++;
  g.score += 100 + Math.floor(g.time * 3);
  pop(el.hScore);
  sfx.hit();
  burst(g.dot.x, g.dot.y);
  unlock('beginner');
  addCoins(10, 'Hit Dot Fluke');

  if (g.lv.bType === 'nothing') {
    say('You caught... absolute nothingness.', 'good');
    return endCertificate();
  }

  if (g.hits >= g.need) {
    return levelDone();
  }

  say(pick(MSG.hit), 'good');
  const s = randSpot();
  g.dot.x = s.x; g.dot.y = s.y;
  g.tp.charges = 3;
  el.dot.classList.remove('tired');
  updateHud();
}

function onMiss(dd, fake) {
  g.misses++;
  save.stats.misses++;
  g.score = Math.max(0, g.score - 10);
  g.missTimes.push(g.elapsed);
  sfx.miss();
  restartAnim(el.cursor, 'miss', 180);
  if (!REDUCED) restartAnim(el.arena, 'shake', 250);

  // Earn NothingCoins for missing!
  addCoins(2, 'Miss Bonus');

  const reach = (D().r * (g.lv.rMult || 1)) + D().slack;
  if (dd < reach + 5) unlock('dot_disappointed');

  let text;
  if (fake) text = pick(MSG.fake);
  else if (dd < reach + 45) text = pick(MSG.almost);
  else if (g.misses === 1) text = pick(MSG.miss1);
  else if (g.misses >= 8) text = pick(MSG.missMany);
  else text = pick(MSG.missN);
  say(text, 'bad');

  // Audience Roast heckle
  if (save.settings.roast && Math.random() < 0.4) {
    showRoastBubble(pick(ROASTS));
  }

  if (g.misses >= 10) unlock('misclicker');
  if (save.stats.misses >= 30) unlock('miss_again');
  if (g.missTimes.filter(t => g.elapsed - t <= 3).length >= 5) unlock('brain');

  pop(el.hMiss);
  updateHud();
}

function showRoastBubble(text) {
  const b = document.createElement('div');
  b.className = 'roast-bubble';
  b.textContent = text;
  b.style.left = rnd(20, W - 140) + 'px';
  b.style.top = rnd(20, H - 60) + 'px';
  el.arena.appendChild(b);
  setTimeout(() => b.remove(), 2200);
}

function levelDone() {
  g.completed++;
  g.score += 250;
  pop(el.hScore);
  say(pick(MSG.level), 'good');
  sfx.level();
  toast('✅', `Level ${g.li + 1} Cleared`, LEVELS[g.li].name);
  addCoins(20, 'Level Cleared');

  // Trigger Fake Victory after level 5
  if (g.li === 4) {
    triggerFakeVictory();
    return;
  }
  startLevel(g.li + 1);
}

/* ---------- pause / quit / end ---------- */
function bank() {
  if (g) {
    save.wasted += g.elapsed - g.banked;
    g.banked = g.elapsed;
    persist();
  }
}

function pause() {
  if (!g || g.over || paused) return;
  paused = true;
  el.pauseOv.hidden = false;
  unlockPointer();
  $('#resumeBtn').focus();
}

function resume() {
  if (!g || g.over || !paused) return;
  paused = false;
  last.ok = false;
  el.pauseOv.hidden = true;
  lastT = performance.now();
  lockPointer();
}

function quit() {
  bank();
  clearTimers();
  cancelAnimationFrame(raf);
  if (g) clearFakes();
  g = null;
  paused = false;
  el.pauseOv.hidden = true;
  el.voidOv.hidden = true;
  unlockPointer();
  show('menu');
  refreshMenu();
}

function end(reason) {
  if (!g || g.over) return;
  g.over = true;
  cancelAnimationFrame(raf);
  unlockPointer();
  unlock('idiot');
  bank();

  const newBest = g.score > save.best;
  if (newBest) { save.best = g.score; persist(); }

  const total = g.hitsTotal + g.misses;
  $('#oScore').textContent = g.score;
  $('#oMisses').textContent = g.misses;
  $('#oTime').textContent = fmt(g.elapsed);
  $('#oLevels').textContent = `${g.completed}/${LEVELS.length}`;
  $('#oAcc').textContent = total ? Math.round(g.hitsTotal / total * 100) + '%' : '0%';
  $('#oCoins').textContent = save.coins + ' NC';
  $('#oReason').textContent = reason === 'timeout' ? `The timer expired on level ${g.li + 1}.` : 'You reached the end. The end was nothing.';

  const extra = g.newAch.filter(a => a !== 'idiot').map(a => ACH[a].name);
  $('#oNew').textContent = (newBest ? 'New personal best! ' : '') + (extra.length ? 'Also unlocked: ' + extra.join(', ') + '.' : '');
  sfx.over();

  const go = () => {
    clearFakes();
    el.voidOv.hidden = true;
    show('over');
    $('#againBtn').focus();
  };
  if (reason === 'boss') {
    el.voidOv.hidden = false;
    later(go, 2600);
  } else {
    later(go, 900);
  }
}

/* ---------- Certificate of Absolute Uselessness ---------- */
function endCertificate() {
  unlock('ultimate_useless');
  bank();
  sfx.fakeVictory();
  $('#cScore').textContent = g ? g.score : save.best;
  $('#cTime').textContent = fmt(g ? g.elapsed : save.wasted);
  $('#cMiss').textContent = g ? g.misses : save.stats.misses;
  const n = Object.keys(ACH).filter(k => save.ach[k]).length;
  $('#cAch').textContent = `${n}/${Object.keys(ACH).length}`;
  $('#certSerial').textContent = 'CERTIFICATE ID: DON-VOID-' + Math.floor(100000 + Math.random() * 900000);
  show('certScreen');
}

/* ---------- Modals Management ---------- */
function openModal(id) {
  const m = $('#' + id);
  if (!m) return;
  m.classList.add('active');
  initAudio();
  sfx.click();

  if (id === 'aiModal') {
    $('#aiResponseBox').textContent = pick(AI_RESPONSES);
    $('#aiStatus').textContent = 'Existential model connected.';
    save.stats.aiQueries++;
    persist();
    addCoins(10, 'AI Consultation Bonus');
    if (save.stats.aiQueries >= 5) unlock('certified_npc');
  } else if (id === 'statsModal') {
    populateStatsModal();
  } else if (id === 'deptModal') {
    unlock('dept_nothing');
  } else if (id === 'supportModal') {
    unlock('concerned_game');
  } else if (id === 'socialModal') {
    populateSocialFeed();
    unlock('emotional_pixel');
  }
}

function closeModal(id) {
  const m = $('#' + id);
  if (m) m.classList.remove('active');
  sfx.click();
}

function populateStatsModal() {
  $('#stClicks').textContent = save.stats.clicks.toLocaleString();
  $('#stCatches').textContent = save.stats.catches.toLocaleString();
  $('#stMisses').textContent = save.stats.misses.toLocaleString();
  const km = (save.stats.dist / 3800).toFixed(2);
  $('#stDist').textContent = `${km} km`;
  $('#stFakeWins').textContent = save.stats.fakeWins;
  $('#stPowerups').textContent = save.stats.powerups;
  $('#stAiQueries').textContent = save.stats.aiQueries;
  $('#stEvents').textContent = save.stats.events;
  addCoins(5, 'Stats Inspection Fee');
}

function populateSocialFeed() {
  const feed = $('#socialFeed');
  if (!feed) return;
  feed.innerHTML = `
    <div style="background:rgba(255,255,255,.04);padding:10px 14px;border-radius:10px">
      <b style="color:var(--pink)">@DotothyPixel</b> <small style="color:var(--mute)">• 12m ago</small>
      <p style="margin-top:4px">"Humans are so easy to manipulate. I literally just move right and they click left lmao"</p>
    </div>
    <div style="background:rgba(255,255,255,.04);padding:10px 14px;border-radius:10px">
      <b style="color:var(--pink)">@DotothyPixel</b> <small style="color:var(--mute)">• 2h ago</small>
      <p style="margin-top:4px">"Taking a mental health day. Please do not click me."</p>
    </div>
    <div style="background:rgba(255,255,255,.04);padding:10px 14px;border-radius:10px">
      <b style="color:var(--pink)">@DotothyPixel</b> <small style="color:var(--mute)">• Yesterday</small>
      <p style="margin-top:4px">"Updated my résumé: '10,000+ dodges, 0 catches, Master of Escape'."</p>
    </div>
  `;
}

/* ---------- event bindings ---------- */
function bind() {
  el.arena.addEventListener('pointermove', onMove);
  el.arena.addEventListener('pointerdown', onDown);
  el.arena.addEventListener('pointerleave', () => { last.ok = false; });
  el.arena.addEventListener('contextmenu', e => e.preventDefault());

  $('#catchBtn').addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); attempt(); });
  $('#catchBtn').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); attempt(); } });

  // Play button
  const playBtn = $('#playBtn');
  playBtn.addEventListener('click', () => {
    initAudio();
    sfx.click();
    startGame();
  });
  // Sarcastic play button label rotation
  setInterval(() => {
    if (playBtn && Math.random() < 0.2) {
      playBtn.textContent = pick(['PLAY GAME', 'DON\'T START', 'PROCEED TO FAIL', 'WASTE MORE TIME', 'CLICK AT OWN RISK']);
    }
  }, 4000);

  $$('.chip[data-diff]').forEach(c => c.addEventListener('click', () => {
    save.diff = c.dataset.diff;
    persist();
    initAudio();
    sfx.click();
    refreshMenu();
  }));

  $('#soundBtn').addEventListener('click', toggleSound);
  $('#soundBtn2').addEventListener('click', toggleSound);
  el.pauseBtn.addEventListener('click', () => (paused ? resume() : pause()));
  $('#resumeBtn').addEventListener('click', resume);
  $('#restartBtn').addEventListener('click', () => { initAudio(); startGame(); });
  $('#pRestart').addEventListener('click', () => { initAudio(); startGame(); });
  $('#menuBtn').addEventListener('click', quit);
  $('#pMenu').addEventListener('click', quit);
  $('#againBtn').addEventListener('click', () => { initAudio(); startGame(); });
  $('#overMenuBtn').addEventListener('click', quit);

  // Fake Victory buttons
  $('#acceptFakeLossBtn').addEventListener('click', () => {
    initAudio();
    end('fake_loss');
  });

  // Certificate screen buttons
  $('#viewCertBtn').addEventListener('click', () => {
    initAudio();
    endCertificate();
  });
  $('#printCertBtn').addEventListener('click', () => {
    window.print();
  });
  $('#shareCertBtn').addEventListener('click', () => {
    const text = `I just wasted ${fmtLong(save.wasted)} playing CATCH NOTHING: THE USELESSNESS ENGINE and received a Certificate of Absolute Uselessness! Score: ${save.best}. Win rate: 0.00%.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast('📋', 'COPIED TO CLIPBOARD', 'Your useless brag is ready to paste anywhere.');
      }).catch(() => {
        alert(text);
      });
    } else {
      alert(text);
    }
  });
  $('#certAgainBtn').addEventListener('click', () => { initAudio(); startGame(); });
  $('#certMenuBtn').addEventListener('click', quit);

  // Hub Modal Triggers
  $('#openAiBtn').addEventListener('click', () => openModal('aiModal'));
  $('#gameAiBtn').addEventListener('click', () => openModal('aiModal'));
  $('#openShopBtn').addEventListener('click', () => openModal('shopModal'));
  $('#openDeptBtn').addEventListener('click', () => openModal('deptModal'));
  $('#openStatsBtn').addEventListener('click', () => openModal('statsModal'));
  $('#openAchBtn').addEventListener('click', () => openModal('achModal'));
  $('#openSupportBtn').addEventListener('click', () => openModal('supportModal'));
  $('#openSocialBtn').addEventListener('click', () => openModal('socialModal'));
  $('#openSettingsBtn').addEventListener('click', () => openModal('settingsModal'));

  // Close modals
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  $$('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => {
      if (e.target === ov) ov.classList.remove('active');
    });
  });

  // AI Life Coach interaction
  $('#askAiAgainBtn').addEventListener('click', () => {
    initAudio();
    sfx.click();
    const box = $('#aiResponseBox');
    box.textContent = 'Consulting the quantum void...';
    $('#aiStatus').textContent = 'Analyzing poor life decisions...';
    setTimeout(() => {
      box.textContent = pick(AI_RESPONSES);
      $('#aiStatus').textContent = 'Synthesis complete. You are still useless.';
      save.stats.aiQueries++;
      persist();
      addCoins(10, 'AI Wisdom');
      sfx.boing();
    }, 1200);
  });

  // Shop item purchase
  $('#shopGrid').addEventListener('click', e => {
    const btn = e.target.closest('[data-buy]');
    if (btn) {
      initAudio();
      buyShopItem(btn.dataset.buy);
    }
  });

  // Department of Nothingness interactions
  $('#deptSubmitBtn').addEventListener('click', () => {
    initAudio();
    sfx.stamp();
    const stampBox = $('#deptStampContainer');
    stampBox.innerHTML = '<div class="dept-stamp">REJECTED</div>';
    $('#deptStatus').textContent = 'REJECTED: Reason: Applicant displayed excessive ambition.';
    toast('🏛️', 'PERMIT DENIED', 'Your Form 404 was rejected for non-compliance with idleness.');
  });
  $('#deptPayFeeBtn').addEventListener('click', () => {
    initAudio();
    if (save.coins < 10) {
      toast('🚫', 'BUREAUCRACY ERROR', 'You do not even have 10 NC to pay the bribe.');
      return;
    }
    save.coins -= 10;
    persist();
    sfx.stamp();
    toast('🧾', 'FEE RECEIVED', 'Paid 10 NC to the Department. Nothing has changed.');
    unlock('tax_payer');
    refreshMenu();
  });

  // Customer Support interaction
  $('#submitTicketBtn').addEventListener('click', () => {
    initAudio();
    const chat = $('#supportChat');
    const topic = $('#supportTopic').value;
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.innerHTML = `<div class="chat-msg-bubble">${topic}</div>`;
    chat.appendChild(userMsg);

    sfx.click();
    setTimeout(() => {
      const resp = pick(SUPPORT_RESPONSES);
      const agentMsg = document.createElement('div');
      agentMsg.className = 'chat-msg agent';
      agentMsg.innerHTML = `<div class="chat-msg-bubble">${resp}</div>`;
      chat.appendChild(agentMsg);
      chat.scrollTop = chat.scrollHeight;
      sfx.boing();
    }, 700);
  });

  $('#escalateTicketBtn').addEventListener('click', () => {
    initAudio();
    sfx.stamp();
    toast('📞', 'ESCALATION RESULT', 'Transferred to Senior Executive of Emptiness. Line disconnected.');
  });

  // Social feed like button
  $('#likeDotPostBtn').addEventListener('click', () => {
    initAudio();
    sfx.coin();
    save.stats.likes += 3;
    persist();
    toast('❤️', 'LIKED POSTS', 'You liked 3 posts from Dotothy Pixelton. She still hates you.');
  });

  // FIX EVERYTHING button
  $('#fixEverythingBtn').addEventListener('click', () => {
    initAudio();
    sfx.alarm();
    unlock('ach_not_found');
    addCoins(25, 'Breakage Compensation');
    openModal('fakeErrorModal');
  });
  $('#dismissFakeErrorBtn').addEventListener('click', () => {
    closeModal('fakeErrorModal');
  });

  // Reset Progress logic
  function resetAllProgress() {
    save.best = 0;
    save.wasted = 0;
    save.coins = 0;
    save.ach = {};
    save.inventory = [];
    save.stats = { clicks: 0, catches: 0, misses: 0, dist: 0, fakeWins: 0, powerups: 0, aiQueries: 0, events: 0, likes: 0 };
    persist();
    refreshMenu();
    closeModal('resetModal');
    sfx.sadTrombone();
    toast('🗑️', 'ALL PROGRESS WIPED', 'All scores, achievements, and NothingCoins returned to zero.');
  }

  const resetProgressBtn = $('#resetProgressBtn');
  if (resetProgressBtn) resetProgressBtn.addEventListener('click', () => openModal('resetModal'));
  const settingsResetBtn = $('#settingsResetBtn');
  if (settingsResetBtn) settingsResetBtn.addEventListener('click', () => { closeModal('settingsModal'); openModal('resetModal'); });
  const confirmResetBtn = $('#confirmResetBtn');
  if (confirmResetBtn) confirmResetBtn.addEventListener('click', () => { initAudio(); resetAllProgress(); });

  // Settings volume & toggles
  if ($('#volSlider')) {
    $('#volSlider').addEventListener('input', e => setVolume(e.target.value / 100));
  }
  if ($('#setRoastToggle')) {
    $('#setRoastToggle').checked = save.settings.roast;
    $('#setRoastToggle').addEventListener('change', e => { save.settings.roast = e.target.checked; persist(); });
  }
  if ($('#setCatToggle')) {
    $('#setCatToggle').checked = save.settings.cat;
    $('#setCatToggle').addEventListener('change', e => {
      save.settings.cat = e.target.checked;
      persist();
      if (el.catCompanion) el.catCompanion.style.display = save.settings.cat ? 'flex' : 'none';
    });
  }
  if ($('#setTickerToggle')) {
    $('#setTickerToggle').checked = save.settings.ticker;
    $('#setTickerToggle').addEventListener('change', e => {
      save.settings.ticker = e.target.checked;
      persist();
      if (el.newsTickerBar) el.newsTickerBar.style.display = save.settings.ticker ? 'flex' : 'none';
    });
  }
  if ($('#setEventsToggle')) {
    $('#setEventsToggle').checked = save.settings.events;
    $('#setEventsToggle').addEventListener('change', e => { save.settings.events = e.target.checked; persist(); });
  }
  if ($('#setPointlessToggle')) {
    $('#setPointlessToggle').checked = save.settings.pointless;
    $('#setPointlessToggle').addEventListener('change', e => {
      save.settings.pointless = e.target.checked;
      persist();
      toast('🌟', 'POINTLESSNESS UPDATED', 'Game is now 150% more pointless.');
    });
  }

  // Achievements filter buttons
  $('#achFilterAll').addEventListener('click', () => {
    $('#achFilterAll').setAttribute('aria-checked', 'true');
    $('#achFilterUnlocked').setAttribute('aria-checked', 'false');
    $('#achFilterLocked').setAttribute('aria-checked', 'false');
    renderAchievementsList('all');
  });
  $('#achFilterUnlocked').addEventListener('click', () => {
    $('#achFilterAll').setAttribute('aria-checked', 'false');
    $('#achFilterUnlocked').setAttribute('aria-checked', 'true');
    $('#achFilterLocked').setAttribute('aria-checked', 'false');
    renderAchievementsList('unlocked');
  });
  $('#achFilterLocked').addEventListener('click', () => {
    $('#achFilterAll').setAttribute('aria-checked', 'false');
    $('#achFilterUnlocked').setAttribute('aria-checked', 'false');
    $('#achFilterLocked').setAttribute('aria-checked', 'true');
    renderAchievementsList('locked');
  });

  // Pointer lock change
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === el.arena) lockWasOn = true;
    else if (lockWasOn) {
      lockWasOn = false;
      if (g && !g.over && !paused) pause();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!g || g.over || !$('#game').classList.contains('active')) return;
    if (e.key === 'p' || e.key === 'P') {
      paused ? resume() : pause();
    } else if (e.key === ' ' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      attempt();
    }
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); bank(); } });
  window.addEventListener('pagehide', bank);
  window.addEventListener('resize', layout);
}

/* ---------- ambient background particles ---------- */
function particles() {
  if (REDUCED) return;
  const box = $('#particles');
  if (!box) return;
  const cols = ['#ff2e9a', '#8b3dff', '#27f0ff', '#ffca28'];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('span'), z = rnd(2, 6);
    s.style.cssText = `left:${rnd(0, 100)}%;width:${z}px;height:${z}px;background:${cols[i % cols.length]};box-shadow:0 0 8px ${cols[i % cols.length]};animation-duration:${rnd(9, 20)}s;animation-delay:${-rnd(0, 20)}s`;
    box.appendChild(s);
  }
}

/* ---------- initialization ---------- */
bind();
particles();
initTicker();
initCat();
refreshMenu();

})();
