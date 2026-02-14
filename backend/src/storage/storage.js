import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { STORAGE_PATH, USERS_FILE, ISSUES_FILE, SESSIONS_FILE, HARDCODED_USERS } from '../config/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../', STORAGE_PATH);

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readFile(filename, defaultValue = []) {
  try {
    const filePath = path.join(dataDir, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function writeFile(filename, data) {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getUsers() {
  const users = await readFile(USERS_FILE);
  if (users.length === 0) {
    const initialUsers = HARDCODED_USERS.map(({ password, ...u }) => ({
      ...u,
      passwordHash: password,
    }));
    await writeFile(USERS_FILE, initialUsers);
    return initialUsers;
  }
  return users;
}

export async function saveUsers(users) {
  await writeFile(USERS_FILE, users);
}

export async function getIssues() {
  return readFile(ISSUES_FILE);
}

export async function saveIssues(issues) {
  await writeFile(ISSUES_FILE, issues);
}

export async function getSessions() {
  return readFile(SESSIONS_FILE);
}

export async function saveSessions(sessions) {
  await writeFile(SESSIONS_FILE, sessions);
}
