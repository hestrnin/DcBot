import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

console.log("Loaded event: log-ayarla");
export default {
  data: new SlashCommandBuilder()
    .setName("delete-log-kanali")
    .setDescription("Log kanallarını sıfırlar"),

  async execute(interaction) {
    const settings = await getSettings(interaction.guild.id);
    if (!settings) {
      await saveSettings(interaction.guild.id, { deleteMessageLog: "", deleteMediaLog: "", permissionRole: "" });
      console.log(`Yeni ayar oluşturuldu: ${interaction.guild.id}`);
    }
    // Hemen yanıt veriyoruz (timeout önlemi)
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

    try {

      // Sunucu ayarlarını güncelle
      settings.deleteMessageLog = "";
      settings.deleteMediaLog = "";

      await saveSettings(guildId,settings);

      // Başarılı yanıt
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("#4BB543")
            .setTitle("❌ Log Kanalları Sıfırlandı")
            .setFooter({ text: `Sunucu ID: ${guildId}` }),
        ],
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
