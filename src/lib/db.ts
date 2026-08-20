import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../../data.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS guildConfig (
  guildId TEXT PRIMARY KEY,
  logChannelId TEXT,
  inviteLink TEXT,
  enabled INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS exclusions (
  id TEXT PRIMARY KEY,
  guildId TEXT,
  type TEXT,
  createdBy TEXT
);
`);

export function getGuildConfig(guildId: string): GuildConfig | undefined {
  return db
    .prepare("SELECT * FROM guildConfig WHERE guildId = ?")
    .get(guildId) as GuildConfig;
}

export function getGuildExclusions(guildId: string): Exclusion[] {
  return db
    .prepare("SELECT * FROM exclusions WHERE guildId = ?")
    .all(guildId) as Exclusion[];
}

export function addGuildExclusion(exclusion: Exclusion) {
  db.prepare(
    `
    INSERT INTO exclusions (id, guildId, type, createdBy)
    VALUES (@id, @guildId, @type, @createdBy)
  `,
  ).run(exclusion);
}

export function removeGuildExclusion(guildId: string, id: string) {
  db.prepare(`DELETE FROM exclusions WHERE guildId = ? AND id = ?`).run(
    guildId,
    id,
  );
}

export default db;
