import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './prompt';

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant' | 'system';
  text: string;
  timestamp?: number;
}

export function getGeminiModel(customApiKey?: string, modelName?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName || process.env.GEMINI_MODEL || 'gemini-flash-latest',
    systemInstruction: SYSTEM_PROMPT,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });
}

/**
 * Extracts action choices from the GM response.
 * Look for numbered options with curly braces: 1. {Action text} or {Action text}
 */
export function extractChoices(text: string): string[] {
  const choices: string[] = [];
  
  // Match patterns like "1. {choice}", "1. { choice }", or just "{choice}" near list numbers
  const regex = /(?:(?:\d+\.|\d+\))\s*)?\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const choice = match[1].trim();
    if (choice && !choices.includes(choice)) {
      choices.push(choice);
    }
  }

  // Fallback: If no {choices} found, check for standard numbered lists 1. ... 5. ... at the end of the text
  if (choices.length < 2) {
    const listRegex = /(?:^|\n)\s*(\d+)[\.\)]\s+([^\n]+)/g;
    let listMatch;
    const listItems: string[] = [];
    while ((listMatch = listRegex.exec(text)) !== null) {
      const item = listMatch[2].replace(/^\{|\}$/g, '').trim();
      if (item) {
        listItems.push(item);
      }
    }
    if (listItems.length >= 3) {
      return listItems.slice(0, 5);
    }
  }

  return choices.slice(0, 5);
}

/**
 * Checks if the text includes the terminal GAME OVER condition
 */
export function isGameOver(text: string): boolean {
  return text.toUpperCase().includes('GAME OVER');
}

export interface StateUpdates {
  itemsAcquired: string[];
  itemsRemoved: string[];
  cyberwareAdded: string[];
  cyberwareRemoved: string[];
  notesAdded: string[];
  eddiesChange: number;
  hpChange: number;
  hpSet?: number;
  maxHpSet?: number;
  humanityChange: number;
  humanitySet?: number;
  statChanges: Record<string, number>;
}

/**
 * Extracts item acquisitions, cyberware, notes, stats, eddies, and HP changes from referee narrative
 */
export function extractStateUpdates(text: string): StateUpdates {
  const itemsAcquired: string[] = [];
  const itemsRemoved: string[] = [];
  const cyberwareAdded: string[] = [];
  const cyberwareRemoved: string[] = [];
  const notesAdded: string[] = [];
  const statChanges: Record<string, number> = {};
  let eddiesChange = 0;
  let hpChange = 0;
  let hpSet: number | undefined;
  let maxHpSet: number | undefined;
  let humanityChange = 0;
  let humanitySet: number | undefined;

  // 1. Items: [ITEM_ACQUIRED: ...], [INVENTORY: +...], [ACQUIRED: ...], [FOUND: ...]
  const acqRegex = /\[(?:ITEM_ACQUIRED|INVENTORY:\s*\+|ACQUIRED|OBTAINED|GAINED|LOOTED|FOUND|ITEM\s*ADDED):\s*([^\]]+)\]/gi;
  let match;
  while ((match = acqRegex.exec(text)) !== null) {
    const item = match[1].trim();
    if (item && !itemsAcquired.includes(item)) {
      itemsAcquired.push(item);
    }
  }

  // 2. Item removals: [ITEM_REMOVED: ...], [INVENTORY: -...], [LOST: ...]
  const remRegex = /\[(?:ITEM_REMOVED|INVENTORY:\s*\-|LOST|USED|CONSUMED|DROPPED):\s*([^\]]+)\]/gi;
  while ((match = remRegex.exec(text)) !== null) {
    const item = match[1].trim();
    if (item && !itemsRemoved.includes(item)) {
      itemsRemoved.push(item);
    }
  }

  // 3. Cyberware / Chrome: [CHROME_ADDED: ...], [CYBERWARE_ADDED: ...], [CHROME: +...]
  const chromeAddRegex = /\[(?:CHROME_ADDED|CYBERWARE_ADDED|CHROME:\s*\+|CYBERWARE:\s*\+):\s*([^\]]+)\]/gi;
  while ((match = chromeAddRegex.exec(text)) !== null) {
    const chrome = match[1].trim();
    if (chrome && !cyberwareAdded.includes(chrome)) {
      cyberwareAdded.push(chrome);
    }
  }
  const chromeRemRegex = /\[(?:CHROME_REMOVED|CYBERWARE_REMOVED|CHROME:\s*\-|CYBERWARE:\s*\-):\s*([^\]]+)\]/gi;
  while ((match = chromeRemRegex.exec(text)) !== null) {
    const chrome = match[1].trim();
    if (chrome && !cyberwareRemoved.includes(chrome)) {
      cyberwareRemoved.push(chrome);
    }
  }

  // 4. Case Notes / Clues: [NOTE_ADDED: ...]
  const noteRegex = /\[(?:NOTE_ADDED|CLUE_ADDED|NOTE|CLUE):\s*([^\]]+)\]/gi;
  while ((match = noteRegex.exec(text)) !== null) {
    const note = match[1].trim();
    if (note && !notesAdded.includes(note)) {
      notesAdded.push(note);
    }
  }

  // 5. Eddies changes: [EDDIES: +100], [EDDIES: -50], [+50 EDDIES]
  const eddiesRegex = /\[(?:EDDIES|CURRENCY|MONEY):\s*([+-]?\d+)\]/gi;
  while ((match = eddiesRegex.exec(text)) !== null) {
    const amount = parseInt(match[1], 10);
    if (!isNaN(amount)) eddiesChange += amount;
  }
  const altEddiesRegex = /\[([+-]\d+)\s*(?:EDDIES|EB|EURODOLLARS|CREDITS)\]/gi;
  while ((match = altEddiesRegex.exec(text)) !== null) {
    const amount = parseInt(match[1], 10);
    if (!isNaN(amount)) eddiesChange += amount;
  }

  // 6. Hit Points: [HP: -5], [HP: +10], [HP_SET: 30/35], [DAMAGE: 8]
  const hpSetRegex = /\[HP_SET:\s*(\d+)(?:\/(\d+))?\]/gi;
  while ((match = hpSetRegex.exec(text)) !== null) {
    hpSet = parseInt(match[1], 10);
    if (match[2]) maxHpSet = parseInt(match[2], 10);
  }
  const hpRegex = /\[HP:\s*([+-]?\d+)\]/gi;
  while ((match = hpRegex.exec(text)) !== null) {
    const amount = parseInt(match[1], 10);
    if (!isNaN(amount)) hpChange += amount;
  }
  const dmgRegex = /\[(?:DAMAGE|DMG):\s*(\d+)\]/gi;
  while ((match = dmgRegex.exec(text)) !== null) {
    const dmg = parseInt(match[1], 10);
    if (!isNaN(dmg)) hpChange -= dmg;
  }

  // 7. Humanity: [HUMANITY: -2], [HUMANITY: +4], [HUMANITY_SET: 54/60]
  const humanitySetRegex = /\[HUMANITY_SET:\s*(\d+)\]/gi;
  while ((match = humanitySetRegex.exec(text)) !== null) {
    humanitySet = parseInt(match[1], 10);
  }
  const humanityRegex = /\[HUMANITY:\s*([+-]?\d+)\]/gi;
  while ((match = humanityRegex.exec(text)) !== null) {
    const amount = parseInt(match[1], 10);
    if (!isNaN(amount)) humanityChange += amount;
  }

  // 8. Stat changes: [STAT_CHANGE: REF +1], [STAT: COOL +1]
  const statRegex = /\[(?:STAT_CHANGE|STAT):\s*(REF|INT|TECH|COOL|WILL|EMP|BODY)\s*([+-]?\d+)\]/gi;
  while ((match = statRegex.exec(text)) !== null) {
    const statKey = match[1].toLowerCase();
    const val = parseInt(match[2], 10);
    if (!isNaN(val)) {
      statChanges[statKey] = (statChanges[statKey] || 0) + val;
    }
  }

  // 9. Fallback Natural Language detection for explicit item pickups
  if (itemsAcquired.length === 0) {
    const nlAcqRegex = /(?:you (?:pocket|pick up|take|loot|retrieve|receive|secure)|added to (?:your )?inventory:)\s+(?:a|an|the)?\s*([A-Z][a-zA-Z0-9\s'-]{2,30}?)(?=[.,!\n]|\s*(?:and|with|into|from))/g;
    let nlMatch;
    while ((nlMatch = nlAcqRegex.exec(text)) !== null) {
      const candidate = nlMatch[1].trim();
      const ignoreWords = ['breath', 'look', 'moment', 'step', 'second', 'chance', 'glance', 'breath of', 'hit', 'shot', 'beating', 'break', 'cover'];
      if (
        candidate &&
        candidate.length > 2 &&
        !ignoreWords.includes(candidate.toLowerCase()) &&
        !itemsAcquired.includes(candidate)
      ) {
        itemsAcquired.push(candidate);
      }
    }
  }

  return {
    itemsAcquired,
    itemsRemoved,
    cyberwareAdded,
    cyberwareRemoved,
    notesAdded,
    eddiesChange,
    hpChange,
    hpSet,
    maxHpSet,
    humanityChange,
    humanitySet,
    statChanges,
  };
}

/**
 * Strips the 5 choice options, call-to-action prompts, and raw technical state tags from narrative text for display in the story log
 */
export function cleanStoryNarration(text: string): string {
  let cleaned = text;

  // 1. Find where the choices block starts and strip it
  const choiceBlockStart = cleaned.search(/(?:\n\s*(?:what (?:do you do|is your (?:next )?move|will you do|do you want to do|is your plan|would you like to do)[^?\n]*\??|\*?\*?(?:potential actions|actions|choices|options):?\*?\*?)\s*)?\n\s*1[\.\)]\s*\{/i);
  if (choiceBlockStart !== -1) {
    cleaned = cleaned.slice(0, choiceBlockStart).trim();
  } else {
    const listIndex = cleaned.search(/\n\s*1[\.\)]\s*\{[^}]+\}/);
    if (listIndex !== -1) {
      cleaned = cleaned.slice(0, listIndex).trim();
    }
  }

  // 2. Strip trailing call-to-action prompt questions (e.g. "What do you do?", "How do you want to handle the situation, Detective?", etc.)
  cleaned = cleaned.replace(/\n+\s*(?:(?:what|how|which|where)\b[^.\n]*\??)\s*$/i, '').trim();

  // 3. Remove internal state tracking tags so they don't clutter the prose
  cleaned = cleaned.replace(/\[(?:ITEM_ACQUIRED|ITEM_REMOVED|INVENTORY|CHROME_ADDED|CHROME_REMOVED|CYBERWARE_ADDED|CYBERWARE_REMOVED|NOTE_ADDED|CLUE_ADDED|EDDIES|HP|HP_SET|HUMANITY|HUMANITY_SET|STAT_CHANGE|STAT|DAMAGE|DMG)[^\]]*\]/gi, '').trim();

  // Normalize excessive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

/**
 * Extracts dice roll results in parentheses, e.g. (Rolled d10: 8 + REF: 7 + Handgun: 6 = 21 vs DV 15 - SUCCESS)
 */
export function extractDiceRolls(text: string): string[] {
  const rolls: string[] = [];
  const regex = /\(([^)]*(?:roll|dice|d10|vs\s*dv|critical|success|fail)[^)]*)\)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    rolls.push(match[1].trim());
  }
  return rolls;
}
