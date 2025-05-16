import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

console.log("Loaded event: autoreaction");
export function isUnicodeEmoji(str) {
  return /\p{Emoji}/u.test(str);
}

export function isCustomEmoji(str) {
  return /^<a?:\w+:\d+>$/.test(str);
}

export function isValidEmoji(str) {
  return isUnicodeEmoji(str) || isCustomEmoji(str);
}

export function parseCustomEmoji(emoji) {
  const match = emoji.match(/^<a?:(\w+):(\d+)>$/);
  if (!match) return null;
  return {
    name: match[1],
    id: match[2],
    animated: emoji.startsWith("<a:"),
  };
}
export default {
  parseCustomEmoji,
  data: new SlashCommandBuilder()
    .setName("autoreaction")
    .setDescription("Mesajlara otomatik emoji ekler")
    .addChannelOption((option) =>
      option
        .setName("kanal")
        .setDescription("Emojilerin ekleneceği kanal")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("emojiler")
        .setDescription("Boşluk bırakarak emojiler (Örnek: 👍 🎉 😍)")
        .setRequired(true),
    ),

  async execute(interaction) {
    const settings = await getSettings(interaction.guild.id);
    if (!settings) {
      await saveSettings(interaction.guild.id, { autoReaction: {}, permissionRole: "" });
      console.log(`Yeni ayar oluşturuldu: ${interaction.guild.id}`);
    }

    await interaction.deferReply({ content: 'Komut çalıştı!', flags: MessageFlags.Ephemeral });
    
    const guildId = interaction.guild.id;
    
    const hasAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
    const hasRole = interaction.member.roles.cache?.has(settings?.permissionRole);
    
    if (!hasAdmin && !hasRole) {
      const response = {
        content: "❌ Bu komutu kullanmak için yetkin yok!",
        flags: MessageFlags.Ephemeral
      };

      if (!interaction.replied && !interaction.deferred) {
        await interaction.editReply(response);
      } else {
        await interaction.followUp(response);
      }

      return;
    }

    const channel = interaction.options.getChannel("kanal");
    const emojiInput = interaction.options.getString("emojiler");

    if (!emojiInput)
      return interaction.editReply({
        content: `❌ **En az 1 emoji seçmen gerekiyor.**`,
        ephemeral: true,
      });

    // Emojileri ayır (virgül yerine boşlukla)
    const emojis = emojiInput.split(" ").filter((e) => e.trim() !== "");

    // Geçersiz olanları ayıkla
    const invalid = emojis.filter((e) => !isValidEmoji(e));
    if (invalid.length > 0) {
      return interaction.editReply({
        content: `Geçersiz emoji(ler) bulundu: ${invalid.join(", ")}`,
        ephemeral: true,
      });
    }

    // Bu kısmı, emojis.forEach içinde veya map içinde yapabilirsin
    for (const emoji of emojis) {
      const custom = parseCustomEmoji(emoji);

      if (custom) {
        // Botun bulunduğu tüm sunucularda bu emoji var mı?
        const found = interaction.client.guilds.cache.some((guild) =>
          guild.emojis.cache.has(custom.id),
        );

        if (!found) {
          return interaction.editReply({
            content: `❌ Emoji "${emoji}" botun sunucularında bulunamadı. Kullanılamaz.`,
            ephemeral: true,
          });
        }
      }

      // Unicode emoji ise zaten çalışır
    }

    try {
      settings.autoReaction = settings.autoReaction || {};
      settings.autoReaction[channel.id] = emojis;
      console.log(channel.name, emojis);

      // Dosyaya yaz
      await saveSettings(guildId, settings);

      console.log(`✅ Firebase'e kaydedildi: ${channel.name}`, emojis);
      await interaction.editReply({
        content: `✅ ${channel} kanalına emojiler eklendi: ${emojis.join(" ")}`,
        ephemeral: true,
      });
      } catch (error) {
      console.error("Hata:", error);
      await interaction.editReply({
        content: "❌ Ayarlar kaydedilirken bir hata oluştu!",
        embeds: [],
      });
    }
  },
};
