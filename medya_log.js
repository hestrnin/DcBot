import {  EmbedBuilder } from "discord.js";
import { getSettings, saveSettings } from "./utils/firebase-settings.js";

console.log("Loaded event: medya_log_kontrol");
export default function (client) {
  client.on("messageCreate", async (message) => {
    const settings = await getSettings(message.guild.id);
    if (!settings) {
      await saveSettings(message.guild.id, { medyaChannel: [], mediaChannelLog: "" });
      console.log(`Yeni ayar oluşturuldu: ${message.guild.id}`);
    }

    if (message.author.bot) return;
    if(settings.medyaChannel.length === 0) return;
    console.log(settings.medyaChannel.length);
    if(!settings?.medyaChannel?.includes(message.channel.id)) return;

    const { mediaChannelLog } = settings;
    // YouTube/Spotify gibi önizlemeli linkler için özel kontrol
    const isPreviewLink =
      /(youtube\.com|youtu\.be|spotify\.com|discord\.gg)/i.test(
        message.content,
      );

    const sadeceMetin =
      !message.attachments.size &&
      !message.embeds.length &&
      !isPreviewLink &&
      !message.stickers.size &&
      !message.content.includes("<:");

    if (sadeceMetin) {
      try {
        await message.delete();
        if (!mediaChannelLog) {
          console.log("❌ mediaChannelLog tanımlı değil, işlem durduruldu.");
          return;
        }

        const logChannel = await client.channels.fetch(mediaChannelLog);

        if (!logChannel) return;
        const embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("❌ Yazı Mesajı Silindi")
          .setDescription(
            `<@${message.author.id}> (${message.author.id}), <#${message.channel.id}> (${message.channel.id}) kanalına metin mesajı gönderdi ve silindi.`,
          )
          .addFields({
            name: "Mesaj İçeriği:",
            value: message.content || "*Boş*",
            inline: false,
          })
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      } catch (err) {
        console.error("Mesaj silinirken hata:", err);
      }
      return;
    }

    // Çıkartmalar
    if (message.stickers.size) {
      try {
        await message.delete();

        const logChannel = await client.channels.fetch(mediaChannelLog);

        // Sticker için görsel linkinin doğru formatta olması
        const stickerAdlari = message.stickers
          .map((sticker) => {
            const stickerURL = `https://cdn.discordapp.com/stickers/${sticker.id}.png`; // Sticker'ın görsel linki
            return `${sticker.name} - [Sticker Görseli](${stickerURL})`; // Görselin linkini paylaşıyoruz
          })
          .join("\n");

        const embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("❌ Çıkartma Silindi")
          .setDescription(
            `${message.author.tag} adlı kullanıcı medya kanalına çıkartma gönderdi ve silindi.`,
          )
          .addFields({
            name: "Çıkartmalar:",
            value: stickerAdlari || "*Hiç çıkartma bulunamadı*",
            inline: false,
          })
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      } catch (err) {
        console.error("Çıkartma silinirken hata:", err);
      }
    }

    // Emojiler
    if (message.content.includes("<:")) {
      // Özel emojiler için kontrol
      try {
        await message.delete();

        const logChannel = await client.channels.fetch(mediaChannelLog);

        const emojiAdlari = message.content
          .match(/<:(\w+):\d+>/g)
          .map((emoji) => emoji.replace(/[<>:]/g, ""))
          .join(", "); // Özel emojilerin ismini al

        const embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("❌ Emoji Silindi")
          .setDescription(
            `${message.author.tag} adlı kullanıcı medya kanalına emoji gönderdi ve silindi.`,
          )
          .addFields({
            name: "Emojiler:",
            value: emojiAdlari || "*Hiç emoji bulunamadı*",
            inline: false,
          })
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      } catch (err) {
        console.error("Emoji silinirken hata:", err);
      }
    }
  });
};
