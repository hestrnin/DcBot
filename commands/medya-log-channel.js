import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

console.log("Loaded event: medya-log-channel");
export default {
  data: new SlashCommandBuilder()
    .setName("medya-log-kanali")
    .setDescription("Medya kanalını ve log kanalını belirler")
    .addChannelOption((option) =>
      option
        .setName("log-kanal")
        .setDescription("Silinen içeriklerin loglanacağı kanal")
        .setRequired(true),
    ),

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
        content: "❌ medya-log-channels Bu komutu kullanmak için yetkin yok!",
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
      const logChannel = interaction.options.getChannel("log-kanal");

      if (logChannel) {

        // Yeni değerleri ata (diğer ayarlara dokunma)
        settings.mediaChannelLog = logChannel.id;

        await saveSettings(guildId,settings);

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#00FF00")
              .setTitle("✅ Medya Log Ayarları Kaydedildi")
              .addFields(
                { name: "Medyalar Log Kanalı", value: `${logChannel}` },
              ),
          ],
          ephemeral: true,
        });
        return;
      }

      const currentLogChannel = interaction.options.getChannel("log-kanal").id;

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("#0099FF")
            .setTitle("🔍 Medya Log Ayarları")
            .addFields(
              { name: "Medya Log Kanalı", value: `${currentLogChannel}` },
            ),
        ],
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
