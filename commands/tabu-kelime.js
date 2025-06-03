import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addTabuWordToList } from '../utils/firebase-tabuwords.js';

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

    const liste = interaction.options.getString('liste');
    const kelime = interaction.options.getString('kelime');
    const yasakliKelimeler = [];

    for (let i = 1; i <= 5; i++) {
      const yasak = interaction.options.getString(`yasak${i}`);
      if (yasak) yasakliKelimeler.push(yasak);
    }

    try {
      
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

      await interaction.channel.send({ embeds: [embed] });

      await interaction.editReply({ content: '✅ Kelime başarıyla eklendi.' });

    } catch (err) {
      console.error('🔥 Hata:', err);
      await interaction.editReply({
        content: `❌ Hata oluştu: ${err.message || err}`,
      });
    }
  }
};