// Simulated crypto utilities for the PWA demo

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function simulateEncrypt(text: string): string {
  let result = '';
  for (let i = 0; i < text.length * 2; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return btoa(result).slice(0, text.length * 3);
}

export function generatePassword(length: number, options: {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}): string {
  let charset = '';
  if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (options.numbers) charset += '0123456789';
  if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => charset[v % charset.length]).join('');
}

export function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (password.length >= 20) score += 1;

  if (score <= 2) return { score: Math.min(score / 7 * 100, 30), label: '弱', color: '#ef4444' };
  if (score <= 4) return { score: score / 7 * 100, label: '中等', color: '#f59e0b' };
  if (score <= 5) return { score: score / 7 * 100, label: '强', color: '#10b981' };
  return { score: score / 7 * 100, label: '非常强', color: '#06b6d4' };
}

const BIP39_WORDS = [
  'abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse',
  'access','accident','account','accuse','achieve','acid','acoustic','acquire','across','act',
  'action','actor','actress','actual','adapt','add','addict','address','adjust','admit',
  'adult','advance','advice','aerobic','affair','afford','afraid','again','age','agent',
  'agree','ahead','aim','air','airport','aisle','alarm','album','alcohol','alert',
  'alien','all','alley','allow','almost','alone','alpha','already','also','alter',
  'always','amateur','amazing','among','amount','amused','analyst','anchor','ancient','anger',
  'angle','angry','animal','ankle','announce','annual','another','answer','antenna','antique',
  'anxiety','any','apart','apology','appear','apple','approve','april','arch','arctic',
  'area','arena','argue','arm','armed','armor','army','around','arrange','arrest',
  'arrive','arrow','art','artefact','artist','artwork','ask','aspect','assault','asset',
  'assist','assume','asthma','athlete','atom','attack','attend','attitude','attract','auction',
  'audit','august','aunt','author','auto','autumn','average','avocado','avoid','awake',
  'aware','awesome','awful','awkward','axis','baby','bachelor','bacon','badge','bag',
  'balance','balcony','ball','bamboo','banana','banner','bar','barely','bargain','barrel',
  'base','basic','basket','battle','beach','bean','beauty','because','become','beef',
  'before','begin','behave','behind','believe','below','belt','bench','benefit','best',
  'betray','better','between','beyond','bicycle','bid','bike','bind','biology','bird',
  'birth','bitter','black','blade','blame','blanket','blast','bleak','bless','blind',
  'blood','blossom','blow','blue','blur','blush','board','boat','body','boil',
  'bomb','bone','bonus','book','boost','border','boring','borrow','boss','bottom',
  'bounce','box','boy','bracket','brain','brand','brass','brave','bread','breeze',
  'brick','bridge','brief','bright','bring','brisk','broccoli','broken','bronze','broom',
  'brother','brown','brush','bubble','buddy','budget','buffalo','build','bulb','bulk',
];

export function generateMnemonic(): string[] {
  const words: string[] = [];
  const array = new Uint32Array(24);
  crypto.getRandomValues(array);
  for (let i = 0; i < 24; i++) {
    words.push(BIP39_WORDS[array[i] % BIP39_WORDS.length]);
  }
  return words;
}

export function generateId(): string {
  return crypto.getRandomValues(new Uint32Array(2)).reduce((s, v) => s + v.toString(36), '') + Date.now().toString(36);
}
