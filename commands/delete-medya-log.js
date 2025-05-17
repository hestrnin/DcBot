import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

console.log("Loaded event: medya-log");
export default {
  data: new SlashCommandBuilder()
    .setName("delete-medya-log")
    .setDescription("Medya log kanalını sıfırlar"),

  async execute(interaction) {

    const settings = await getSettings(interaction.guild.id);
    if (!settings) {
      await saveSettings(interaction.guild.id, { mediaChannelLog: "", permissionRole: "" });
      console.log(`Yeni ayar oluşturuldu: ${interaction.guild.id}`);
    }

    await interaction.deferReply({ content: 'Komut çalıştı!', flags: MessageFlags.Ephemeral });
    
    const guildId = interaction.guild.id;

    const hasAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
    const hasRole = interaction.member.roles.cache?.has(settings.permissionRole);
    if (!hasAdmin && !hasRole) {
      const response = {
        content: "❌ delete-medya-log Bu komutu kullanmak için yetkin yok!",
        flags: MessageFlags.Ephemeral
      };

      if (!interaction.replied && !interaction.deferred) {
        await interaction.editReply(response);
      } else {
        await interaction.followUp(response);
      }

      return;
    }

    try{
        // Yeni değerleri ata (diğer ayarlara dokunma)
        settings.mediaChannelLog = "";

        await saveSettings(guildId,settings);

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#00FF00")
              .setTitle("❌ Medya Ayarları Silindi.")
          ],
          ephemeral: true,
        });
        return;

    } catch (error) {
      console.error("Hata:", error);
      await interaction.editReply({
        content: "❌ Ayarlar kaydedilirken bir hata oluştu!",
        embeds: [],
      });
    }
  },
};
