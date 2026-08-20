type GuildConfig = {
  guildId: string;
  logChannelId: string;
  inviteLink: string;
  enabled: number;
};

type Exclusion = {
  id: string;
  guildId: string;
  type: "role" | "user" | "channel";
  createdBy: string;
};
