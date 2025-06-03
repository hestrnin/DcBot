import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addTabuWordToList } from '../utils/firebase-tabuwords.js';
import db from "../firebase.js";

function toTitleCase(str) {
   return str
    .toLocaleLowerCase('tr-TR')
    .split(' ')
    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
}

export default {
  data: new SlashCommandBuilder()
    .setName('tabu-kelime')
    .setDescription('Yeni tabu kelimesi ekler.')
    .addStringOption(option =>
      option.setName('liste').setDescription('Hangi listeye eklenecek?').setRequired(true))
    .addStringOption(option =>
      option.setName('kelime').setDescription('Anlatılacak kelime').setRequired(true))
    .addStringOption(option =>
      option.setName('yasak1').setDescription('Yasaklı kelime 1').setRequired(true))
    .addStringOption(option =>
      option.setName('yasak2').setDescription('Yasaklı kelime 2'))
    .addStringOption(option =>
      option.setName('yasak3').setDescription('Yasaklı kelime 3'))
    .addStringOption(option =>
      option.setName('yasak4').setDescription('Yasaklı kelime 4'))
    .addStringOption(option =>
      option.setName('yasak5').setDescription('Yasaklı kelime 5')),

  async execute(interaction) {
    console.log('🟡 /tabu-kelime komutu tetiklendi');

    await interaction.deferReply({ flags: 1 << 6 });
    const channelKelimeler = interaction.guild.channels.cache.find(c => c.name === 'tabu-kelimeler' && c.isTextBased());

    const liste = toTitleCase(interaction.options.getString('liste'));
    const kelime = toTitleCase(interaction.options.getString('kelime'));
    const yasakliKelimeler = [];

    for (let i = 1; i <= 5; i++) {
      const yasak = toTitleCase(interaction.options.getString(`yasak${i}`));
      if (yasak) yasakliKelimeler.push(yasak);
    }

    try {
      
      const listRef = db.collection("tabu_lists").doc(liste);
      const listDoc = await listRef.get();
      const listData = listDoc.exists ? listDoc.data() : {};
      const mevcutKelimeler = Object.keys(listData).map(k => k.toLowerCase());

      const yeniKelime = kelime.toLowerCase();

      if (mevcutKelimeler.includes(yeniKelime)) {
        
        await channelKelimeler.send({ content: `⚠️ '${kelime}' kelimesi '${liste}' listesinde zaten var.`});
        return;
      }

      await addTabuWordToList(liste, kelime, yasakliKelimeler);
      
      const embed = new EmbedBuilder()
        .setTitle('🟣 Yeni Tabu Kelimesi Eklendi')
        .addFields(
          { name: 'Liste', value: liste, inline: true },
          { name: 'Kelime', value: kelime, inline: true },
          {
            name: 'Yasaklı Kelimeler',
            value: yasakliKelimeler.map((k, i) => `- ${i + 1}. ${k}`).join('\n'),
          }
        )
        .setColor('Purple')
        .setTimestamp();

      await channelKelimeler.send({ embeds: [embed] });

    } catch (err) {
      console.error('🔥 Hata:', err);
      await interaction.editReply({
        content: `❌ Hata oluştu: ${err.message || err}`,
      });
    }
  }
};