import { parseCustomEmoji } from "../commands/autoreaction.js";
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

console.log("Loaded event: messageCreate");

export default function messageCreateHandler(client) {
  client.on("messageCreate", async (message) => {

    const settings = await getSettings(message.guild.id);
    if (!settings) {
      await saveSettings(message.guild.id, { autoReaction: {}, permissionRole: "" });
      console.log(`Yeni ayar oluşturuldu: ${message.guild.id}`);
    }
    if (message.author.bot) return;
    
    const channelId = message.channel.id;

    const emojis = settings.autoReaction?.[channelId] || {};
    if (!emojis || !Array.isArray(emojis)) return;

    // Bu kısmı, emojis.forEach içinde veya map içinde yapabilirsin
    for (const emoji of emojis) {
      const custom = parseCustomEmoji(emoji);

      if (custom) {
        // Botun bulunduğu tüm sunucularda bu emoji var mı?
        const found = client.guilds.cache.some((guild) =>
          guild.emojis.cache.has(custom.id),
        );

        if (!found) {
          return interaction.reply({
            content: `❌ Emoji "${emoji}" botun sunucularında bulunamadı. Kullanılamaz.`,
            ephemeral: true,
          });
        }
      }
    }

    for (const emoji of emojis) {
      try {
        console.log(`Emoji ekleniyor: ${emoji}`);
        await message.react(emoji);
      } catch (err) {
        console.error(`❌ Emoji eklenemedi: ${emoji}`, err.message);
      }
    }
  });
};
