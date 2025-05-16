import {  EmbedBuilder } from "discord.js";
import { getSettings, saveSettings } from "./utils/firebase-settings.js";


console.log("Loaded event: delete_messages");

export default function deleteMessages(client) {
  client.on("messageDelete", async (message) => {
    
    const settings = await getSettings(message.guild.id);
    if (!settings) {
      await saveSettings(message.guild.id, { ignoredChannels: {}, deleteMessageLog: "", deleteMediaLog: "" });
      console.log(`Yeni ayar oluşturuldu: ${message.guild.id}`);
    }
    // Bot mesajlarını ve geçersiz kanalları ignore et
    if (
      !message.guild ||
      message.author?.bot ||
      // ↓ Loglanmayacak kanallar (settings.json'dan alınır)
      settings.ignoredChannels?.includes(message.channel.id)
      )
      return;

    const { deleteMessageLog, deleteMediaLog } = settings;

    // Medya kontrolü (YouTube linklerini hariç tut)
    const hasAttachment = message.attachments.size > 0;
    const isMediaLink = /\.(jpg|png|gif|mp4|mov|avi|pdf|webp)$/i.test(
      message.content,
    );
    const isPreviewLink =
      /(youtube\.com|youtu\.be|spotify\.com|discord\.gg)/i.test(
        message.content,
      );
    const isMedia = (hasAttachment || isMediaLink) && !isPreviewLink;

    // Log kanalını seç
    const logChannel = message.guild.channels.cache.get(
      isMedia ? deleteMediaLog : deleteMessageLog,
    );
    if (!logChannel) return;

    if(!isMedia)
      if(message.channel.id === settings.medyaChannel)
          return;

    // Embed oluştur
    const embed = new EmbedBuilder()
      .setColor(isMedia ? "#00ff00" : "#ff0000")
      .setTitle(isMedia ? "📸 Silinen Medya" : "🗑️ Silinen Mesaj")
      .addFields(
        {
          name: "Kullanıcı",
          value: `${"<@" + message.author?.id + ">" || "Bilinmeyen"} (${message.author?.id || "N/A"})`,
        },
        {
          name: "Kanal",
          value: `${"<#" + message.channel.id + ">"} (${message.channel.id})`,
        },
      )
      .setTimestamp();

    if (!isMedia && (message.content || isPreviewLink)) {
      embed.addFields({
        name: "İçerik",
        value: message.content?.slice(0, 1024) || "[*Önizlemeli link*]",
      });
    }

    if (hasAttachment) {
      embed.addFields({
        name: "Ekler",
        value: message.attachments.map((att) => att.url).join("\n"),
      });
      embed.setImage(message.attachments.first().url);
    }

    await logChannel.send({ embeds: [embed] }).catch(console.error);
  });
};
