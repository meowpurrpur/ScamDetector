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
)
`);

export function getGuildConfig(guildId: string): GuildConfig | undefined {
  return db
    .prepare("SELECT * FROM guildConfig WHERE guildId = ?")
    .get(guildId) as GuildConfig;
}

export default db;
