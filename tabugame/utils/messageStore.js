// tabugame/utils/messageStore.js
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.resolve('tabugame/data/panelMessage.json');

export function readMessageId() {
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const json = JSON.parse(raw);
    return json.messageId;
  } catch {
    return null;
  }
}

export function writeMessageId(messageId) {
  const data = { messageId };
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}