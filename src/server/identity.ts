import { createHash, randomInt } from "node:crypto";
import { newId, pseudonymize } from "@/server/http";
import { store, type Database, type PseudonymRecord } from "@/server/store";

const ADJECTIVES = [
  "Swift", "Calm", "Bright", "Steady", "Quiet", "Brave", "Clever", "Gentle", "Lucky", "Sunny",
  "Bold", "Keen", "Merry", "Nimble", "Patient", "Ready", "Sharp", "Tidy", "Warm", "Wise",
];
const NOUNS = [
  "Heron", "Mango", "Tarsier", "Gecko", "Kingfisher", "Turtle", "Dolphin", "Coconut", "Banca", "Egret",
  "Jeepney", "Ferry", "Lighthouse", "Reef", "Harbor", "Island", "Rivermouth", "Ridge", "Lantern", "Compass",
];

/** Salted hash for identity fields; never reversible to the Google subject or email. */
export function identityHash(kind: "subject" | "email", value: string): string {
  const salt = process.env.KOMYUT_PSEUDONYM_SALT ?? "komyut-dev-salt";
  return createHash("sha256").update(`${salt}:${kind}:${value.trim().toLowerCase()}`).digest("hex");
}

function freshNickname(db: Readonly<Database>): string {
  const taken = new Set(db.pseudonyms.map((p) => p.nickname));
  for (let attempt = 0; attempt < 50; attempt++) {
    const name = `${ADJECTIVES[randomInt(ADJECTIVES.length)]} ${NOUNS[randomInt(NOUNS.length)]} ${randomInt(10, 100)}`;
    if (!taken.has(name)) return name;
  }
  return `Commuter ${randomInt(100_000, 1_000_000)}`;
}

/** Gives a pseudonym its random nickname the first time it is seen. Call inside a store write. */
export function ensurePseudonym(db: Database, pseudonym: string, userId: string | null = null): PseudonymRecord {
  let record = db.pseudonyms.find((p) => p.pseudonym === pseudonym);
  if (!record) {
    record = { pseudonym, nickname: freshNickname(db), user_id: userId, created_at: new Date().toISOString() };
    db.pseudonyms.push(record);
  } else if (userId && record.user_id !== userId) {
    record.user_id = userId;
  }
  return record;
}

export interface LinkedIdentity {
  pseudonym: string;
  nickname: string;
  email_hash: string;
}

/**
 * Links a Google account to its salted pseudonym and nickname. Only hashes
 * of the subject and email are stored; reports carry the pseudonym alone.
 */
export async function linkGoogleAccount(subject: string, email: string): Promise<LinkedIdentity> {
  const subjectHash = identityHash("subject", subject);
  const emailHash = identityHash("email", email);
  const pseudonym = pseudonymize(`google:${subject}`);
  return store.write((db) => {
    let user = db.users.find((u) => u.subject_hash === subjectHash);
    if (!user) {
      user = { id: newId("u"), subject_hash: subjectHash, email_hash: emailHash, created_at: new Date().toISOString() };
      db.users.push(user);
    } else {
      user.email_hash = emailHash;
    }
    const record = ensurePseudonym(db, pseudonym, user.id);
    return { pseudonym, nickname: record.nickname, email_hash: emailHash };
  });
}

export async function nicknameOf(pseudonym: string): Promise<string | null> {
  return store.read((db) => db.pseudonyms.find((p) => p.pseudonym === pseudonym)?.nickname ?? null);
}

/** Removes the pseudonym record and any linked account. Call inside a store write. */
export function eraseIdentity(db: Database, pseudonym: string): { account_deleted: boolean } {
  const record = db.pseudonyms.find((p) => p.pseudonym === pseudonym);
  db.pseudonyms = db.pseudonyms.filter((p) => p.pseudonym !== pseudonym);
  if (!record?.user_id) return { account_deleted: false };
  const before = db.users.length;
  db.users = db.users.filter((u) => u.id !== record.user_id);
  return { account_deleted: db.users.length < before };
}

/** Researcher allowlist: comma-separated emails in KOMYUT_RESEARCHER_EMAILS, compared as hashes. */
export function isResearcher(emailHash: string | undefined): boolean {
  if (!emailHash) return false;
  const allowed = (process.env.KOMYUT_RESEARCHER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => identityHash("email", email));
  return allowed.includes(emailHash);
}
