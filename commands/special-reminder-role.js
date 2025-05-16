import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { MessageFlags } from 'discord-api-types/v10';
import { getSettings, saveSettings } from "../utils/firebase-settings.js";

console.log("Loaded event: special-reminder-role");
export default {
  data: new SlashCommandBuilder()
    .setName("reminder-rol")
    .setDescription("Reminder komudunu kullanacak rol.")
    .addRoleOption((option) =>
      option.setName("rol").setDescription("Rolü seç").setRequired(true),
    ),

  async execute(interaction) {
      const settings = await getSettings(interaction.guild.id);
      if (!settings) {
        await saveSettings(interaction.guild.id, { reminderRole: "" });
        console.log(`Yeni ayar oluşturuldu: ${interaction.guild.id}`);
      }
      await interaction.deferReply({ content: 'Komut çalıştı!', flags: MessageFlags.Ephemeral });
      
      const guildId = interaction.guild.id;
  
      const hasAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
      
      if (!hasAdmin) {
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
      const rol = interaction.options.getRole("rol");

      // Sunucu ayarlarını güncelle
      settings.reminderRole = rol.id;
      await saveSettings(guildId, settings);
      // Başarılı yanıt
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("#4BB543")
            .setTitle("✅ Role başarıyla yetki verildi")
            .addFields({ name: "Rol", value: `${rol}`, inline: true })
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
