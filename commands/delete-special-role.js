import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

console.log("Loaded event: special-role");

export default {
  data: new SlashCommandBuilder()
    .setName("delete-yetki-ayarla")
    .setDescription("Belirli bir role özel ayar yapar.")
    .addRoleOption(option =>
      option.setName("rol")
            .setDescription("Ayardan kaldırılacak rol")
            .setRequired(true)
    ),

  async execute(interaction) {
    const settings = await getSettings(interaction.guild.id);
    if (!settings) {
      await saveSettings(interaction.guild.id, { permissionRole: "" });
      console.log(`Yeni ayar oluşturuldu: ${interaction.guild.id}`);
    }

    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guild.id;
    const hasAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);

    if (!hasAdmin) {
      return await interaction.editReply({
        content: "❌ Bu komutu kullanmak için yetkin yok!",
        ephemeral: true
      });
    }

    try {
      const rol = interaction.options.getRole("rol");

      settings.permissionRole = "";
      await saveSettings(guildId, settings);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("#4BB543")
            .setTitle("❌ Rol başarıyla kaldırıldı.")
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
