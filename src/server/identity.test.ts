import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ensurePseudonym, eraseIdentity, identityHash, isResearcher } from "@/server/identity";
import { emptyDatabase } from "@/server/store";

describe("identity", () => {
  it("hashes identity fields, case-insensitively for email, never storing them", () => {
    const a = identityHash("email", "Researcher@UP.edu.ph");
    assert.equal(a, identityHash("email", "researcher@up.edu.ph "));
    assert.notEqual(a, identityHash("subject", "researcher@up.edu.ph"));
    assert.ok(!a.includes("researcher"));
  });

  it("gives each pseudonym one unique random nickname", () => {
    const db = emptyDatabase();
    const first = ensurePseudonym(db, "p-1");
    assert.equal(ensurePseudonym(db, "p-1").nickname, first.nickname);
    for (let i = 2; i < 60; i++) ensurePseudonym(db, `p-${i}`);
    assert.equal(new Set(db.pseudonyms.map((p) => p.nickname)).size, db.pseudonyms.length);
  });

  it("erasing a pseudonym also deletes its linked account", () => {
    const db = emptyDatabase();
    db.users.push({ id: "u1", subject_hash: "s", email_hash: "e", created_at: new Date().toISOString() });
    ensurePseudonym(db, "p-g", "u1");
    ensurePseudonym(db, "p-dev");
    assert.deepEqual(eraseIdentity(db, "p-g"), { account_deleted: true });
    assert.equal(db.users.length, 0);
    assert.deepEqual(db.pseudonyms.map((p) => p.pseudonym), ["p-dev"]);
    assert.deepEqual(eraseIdentity(db, "p-dev"), { account_deleted: false });
  });

  it("checks researchers against the allowlist by hash", () => {
    process.env.KOMYUT_RESEARCHER_EMAILS = "lead@up.edu.ph, adviser@up.edu.ph";
    assert.ok(isResearcher(identityHash("email", "Adviser@up.edu.ph")));
    assert.ok(!isResearcher(identityHash("email", "someone@example.com")));
    assert.ok(!isResearcher(undefined));
    delete process.env.KOMYUT_RESEARCHER_EMAILS;
  });
});
