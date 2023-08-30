const { generateDate, getRelativeTime, getMaxMembers, cleanUpTimestampData, generateID } = require('./helper.js');
const { getServerHistory, getServerUptime } = require('../api/pixelicAPI.js');
const { getStats, getHighestProfile } = require('../api/wynnCraftAPI.js');
const { registerFont, createCanvas, loadImage } = require('canvas');
const { cacheMessage, errorMessage } = require('../functions/logger.js');
const { AttachmentBuilder } = require('discord.js');
var packageJson = require('../../package.json');
const QuickChart = require('quickchart-js');
const config = require('../../config.json');
const nodeCache = require('node-cache');

const generateStatsCache = new nodeCache({ stdTTL: 180 });
const generateProfileImageCache = new nodeCache({ stdTTL: 180 });
const generateGuildCache = new nodeCache({ stdTTL: 180 });
const generateServerCache = new nodeCache({ stdTTL: 180 });
const generateServerGraphCache = new nodeCache({ stdTTL: 300 });

registerFont('src/fonts/Karla-Regular.ttf', { family: 'Karla Regular' });

async function bar(ctx, rectX, rectY, rectWidth, rectHeight) {
  if (rectWidth == 0) return;
  ctx.fillStyle = 'rgb(237, 135, 150)';
  ctx.strokeStyle = 'rgb(237, 135, 150)';
  var cornerRadius = 28;
  ctx.lineJoin = 'round';
  ctx.lineWidth = cornerRadius;
  ctx.strokeRect(
    rectX + cornerRadius / 2,
    rectY + cornerRadius / 2,
    rectWidth - cornerRadius,
    rectHeight - cornerRadius
  );
  ctx.fillRect(rectX + cornerRadius / 2, rectY + cornerRadius / 2, rectWidth - cornerRadius, rectHeight - cornerRadius);
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
}

async function generateStats(uuid) {
  try {
    if (generateStatsCache.has(uuid)) {
      cacheMessage('Generate Stats', 'hit');
      return generateStatsCache.get(uuid);
    } else {
      const canvas = createCanvas(1200, 1200);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(await loadImage('src/assets/statsCommandBackground.png'), 0, 0, canvas.width, canvas.height);
      var stats = await getStats(uuid);
      var currentProfileStats = stats.data.characters[await getHighestProfile(stats.data.characters)];
      const img = await loadImage(`https://visage.surgeplay.com/head/256/${uuid}.png`);
      ctx.drawImage(img, 912, 32, 256, 256);
      ctx.textBaseline = 'top';
      ctx.font = '36px Karla';
      ctx.textAlign = 'left';
      if (stats.rank === 'Media') {
        ctx.fillStyle = '#FF55FF';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#AA00AA';
        ctx.fillText(stats.rank, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#FF55FF';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.rank).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 + ctx.measureText('[').width + ctx.measureText(stats.rank).width + ctx.measureText(']').width,
          52
        );
      } else if (stats.rank === 'Administrator') {
        ctx.fillStyle = '#AA0000';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#FF5555';
        ctx.fillText(stats.rank, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#AA0000';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.rank).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 + ctx.measureText('[').width + ctx.measureText(stats.rank).width + ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.veteran) {
        ctx.fillStyle = '#FAB387';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#F38BA8';
        ctx.fillText('Vet', 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#FAB387';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText('Vet').width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 + ctx.measureText('[').width + ctx.measureText('Vet').width + ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.tag.value === 'VIP') {
        ctx.fillStyle = '#00AA00';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#55FF55';
        ctx.fillText(stats.data.meta.tag.value, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#00AA00';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.tag.value === 'VIP+') {
        ctx.fillStyle = '#55FFFF';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#00AAAA';
        ctx.fillText(stats.data.meta.tag.value, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#55FFFF';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.tag.value === 'HERO') {
        ctx.fillStyle = '#AA00AA';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#FF55FF';
        ctx.fillText(stats.data.meta.tag.value, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#AA00AA';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.tag.value === 'CHAMPION') {
        ctx.fillStyle = '#FFAA00';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#FFFF55';
        ctx.fillText(stats.data.meta.tag.value, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#FFAA00';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          52
        );
      } else {
        ctx.fillStyle = 'white';
        ctx.fillText(stats.username, 62, 52);
      }
      if (currentProfileStats.gamemode.craftsman) {
        ctx.drawImage(await loadImage('src/assets/craftsmanGamemodeIcon.png'), 832, 52);
        if (currentProfileStats.gamemode.hardcore) {
          ctx.drawImage(await loadImage('src/assets/hardcoreGamemodeIcon.png'), 776, 52);
          if (currentProfileStats.gamemode.ironman) {
            ctx.drawImage(await loadImage('src/assets/ironmanGamemodeIcon.png'), 720, 52);
            if (currentProfileStats.gamemode.hunted) {
              ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 664, 52);
            }
          }
        } else if (currentProfileStats.gamemode.ironman) {
          ctx.drawImage(await loadImage('src/assets/ironmanGamemodeIcon.png'), 776, 52);
          if (currentProfileStats.gamemode.hunted) {
            ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 720, 52);
          }
        } else if (currentProfileStats.gamemode.hunted) {
          ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 776, 52);
        }
      } else if (currentProfileStats.gamemode.hardcore) {
        ctx.drawImage(await loadImage('src/assets/hardcoreGamemodeIcon.png'), 832, 52);
        if (currentProfileStats.gamemode.ironman) {
          ctx.drawImage(await loadImage('src/assets/ironmanGamemodeIcon.png'), 776, 52);
          if (currentProfileStats.gamemode.hunted) {
            ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 720, 52);
          }
        } else if (currentProfileStats.gamemode.hunted) {
          ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 776, 52);
        }
      } else if (currentProfileStats.gamemode.ironman) {
        ctx.drawImage(await loadImage('src/assets/ironmanGamemodeIcon.png'), 832, 52);
        if (currentProfileStats.gamemode.hunted) {
          ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 776, 52);
        }
      } else if (currentProfileStats.gamemode.hunted) {
        ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 832, 52);
      }
      ctx.font = '24px Karla';
      ctx.fillStyle = 'white';
      if (stats.data.guild.name != null) {
        ctx.font = '24px Karla';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(`${stats.data.guild.rank} of ${stats.data.guild.name}`, 62, 140);
        ctx.fillText(
          `Current Selected Class - ${
            currentProfileStats.type.charAt(0).toUpperCase() + currentProfileStats.type.slice(1).toLowerCase()
          }`,
          481,
          140
        );
        if (stats.data.meta.location.online == true) {
          ctx.fillText(`Online - ${stats.data.meta.location.server}`, 581, 208);
        } else {
          ctx.fillText(`Last Seen - ${getRelativeTime(new Date(stats.data.meta.lastJoin).getTime(), 'ms')}`, 581, 208);
        }
        ctx.textAlign = 'left';
        ctx.fillText(
          `First Login - ${new Date(stats.data.meta.firstJoin).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'America/New_York',
          })}`,
          62,
          208
        );
      } else {
        ctx.font = '24px Karla';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(
          `Current Selected Class - ${
            currentProfileStats.type.charAt(0).toUpperCase() + currentProfileStats.type.slice(1).toLowerCase()
          }`,
          64,
          140
        );
        if (stats.data.meta.location.online == true) {
          ctx.textAlign = 'right';
          ctx.fillText(`Online - ${stats.data.meta.location.server}`, 866, 140);
        } else {
          ctx.fillText(`Last Seen - ${getRelativeTime(new Date(stats.data.meta.lastJoin).getTime(), 'ms')}`, 581, 140);
        }
        ctx.textAlign = 'left';
        ctx.fillText(
          `First Login - ${new Date(stats.data.meta.firstJoin).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'America/New_York',
          })}`,
          62,
          208
        );
      }
      ctx.font = '22px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.fillText(
        `General\n\nTotal Level - ${currentProfileStats.level}\nPlaytime - ${Math.floor(
          (stats.data.meta.playtime * 4.7) / 60
        )}h\nDiscoveries - ${currentProfileStats.discoveries}\nMobs Killed - ${
          currentProfileStats.mobsKilled
        }\nFinished Dungeons - ${currentProfileStats.dungeons.completed}\nRaids Completed - ${
          currentProfileStats.raids.completed
        }`,
        62,
        322
      );
      ctx.font = '22px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      var skillsY = 464;
      var StrengthX = 430;
      var DexterityX = 581;
      var IntelligenceX = 721;
      var DefenseX = 891;
      var AgilityX = 1055;
      const textStrength = `Strength\n${currentProfileStats.skills.strength}`;
      const textLinesStrength = textStrength.split('\n');
      ctx.fillText(textLinesStrength[0], StrengthX, skillsY);
      ctx.fillText(
        textLinesStrength[1],
        StrengthX + (ctx.measureText(textLinesStrength[0]).width - ctx.measureText(textLinesStrength[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textDexterity = `Dexterity\n${currentProfileStats.skills.dexterity}`;
      const textLinesDexterity = textDexterity.split('\n');
      ctx.fillText(textLinesDexterity[0], DexterityX, skillsY);
      ctx.fillText(
        textLinesDexterity[1],
        DexterityX + (ctx.measureText(textLinesDexterity[0]).width - ctx.measureText(textLinesDexterity[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textIntelligence = `Intelligence\n${currentProfileStats.skills.intelligence}`;
      const textLinesIntelligence = textIntelligence.split('\n');
      ctx.fillText(textLinesIntelligence[0], IntelligenceX, skillsY);
      ctx.fillText(
        textLinesIntelligence[1],
        IntelligenceX +
          (ctx.measureText(textLinesIntelligence[0]).width - ctx.measureText(textLinesIntelligence[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textDefense = `Defense\n${currentProfileStats.skills.defense}`;
      const textLinesDefense = textDefense.split('\n');
      ctx.fillText(textLinesDefense[0], DefenseX, skillsY);
      ctx.fillText(
        textLinesDefense[1],
        DefenseX + (ctx.measureText(textLinesDefense[0]).width - ctx.measureText(textLinesDefense[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textAgility = `Agility\n${currentProfileStats.skills.agility}`;
      const textLinesAgility = textAgility.split('\n');
      ctx.fillText(textLinesAgility[0], AgilityX, skillsY);
      ctx.fillText(
        textLinesAgility[1],
        AgilityX + (ctx.measureText(textLinesAgility[0]).width - ctx.measureText(textLinesAgility[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      ctx.font = '22px Karla';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'white';
      const professionsIconBackground = await loadImage('src/assets/professionsIconBackground.svg');
      await bar(ctx, 140, 689, Math.floor((currentProfileStats.professions.combat.xp / 100) * 946), 28);
      ctx.drawImage(professionsIconBackground, 104, 661);
      ctx.drawImage(await loadImage('src/assets/combatIcon.png'), 108, 665);
      ctx.fillText(`Combat ${currentProfileStats.professions.combat.level}`, 168, 662);
      ctx.fillText(currentProfileStats.professions.combat.level + 1, 1056, 662);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.combat.xp}%`, 18 + 1056, 662 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 140, 769, Math.floor((currentProfileStats.professions.mining.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 104, 741);
      ctx.drawImage(await loadImage('src/assets/miningIcon.png'), 104, 745);
      ctx.fillText(`Mining ${currentProfileStats.professions.mining.level}`, 168, 742);
      ctx.fillText(currentProfileStats.professions.mining.level + 1, 370, 742);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.mining.xp}%`, 18 + 370, 742 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 483, 769, Math.floor((currentProfileStats.professions.farming.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 447, 741);
      ctx.drawImage(await loadImage('src/assets/farmingIcon.png'), 447, 745);
      ctx.fillText(`Farming ${currentProfileStats.professions.farming.level}`, 511, 742);
      ctx.fillText(currentProfileStats.professions.farming.level + 1, 713, 742);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.farming.xp}%`, 18 + 713, 742 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 824, 769, Math.floor((currentProfileStats.professions.woodcutting.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 791, 741);
      ctx.drawImage(await loadImage('src/assets/woodcuttingIcon.png'), 791, 745);
      ctx.fillText(`Woodcutting ${currentProfileStats.professions.woodcutting.level}`, 854, 742);
      ctx.fillText(currentProfileStats.professions.woodcutting.level + 1, 1056, 742);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.woodcutting.xp}%`, 18 + 1056, 742 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 140, 841, Math.floor((currentProfileStats.professions.fishing.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 104, 813);
      ctx.drawImage(await loadImage('src/assets/fishingIcon.png'), 104, 817);
      ctx.fillText(`Fishing ${currentProfileStats.professions.fishing.level}`, 168, 814);
      ctx.fillText(currentProfileStats.professions.fishing.level + 1, 370, 814);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.fishing.xp}%`, 18 + 370, 814 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 483, 841, Math.floor((currentProfileStats.professions.scribing.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 447, 813);
      ctx.drawImage(await loadImage('src/assets/scribingIcon.png'), 447, 817);
      ctx.fillText(`Scribing ${currentProfileStats.professions.scribing.level}`, 511, 814);
      ctx.fillText(currentProfileStats.professions.scribing.level + 1, 713, 814);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.scribing.xp}%`, 18 + 713, 814 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 824, 841, Math.floor((currentProfileStats.professions.jeweling.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 791, 813);
      ctx.drawImage(await loadImage('src/assets/jewelingIcon.png'), 791, 817);
      ctx.fillText(`Jeweling ${currentProfileStats.professions.jeweling.level}`, 854, 814);
      ctx.fillText(currentProfileStats.professions.jeweling.level + 1, 1056, 814);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.jeweling.xp}%`, 18 + 1056, 814 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 140, 913, Math.floor((currentProfileStats.professions.alchemism.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 104, 885);
      ctx.drawImage(await loadImage('src/assets/alchemismIcon.png'), 104, 889);
      ctx.fillText(`Alchemism ${currentProfileStats.professions.alchemism.level}`, 168, 886);
      ctx.fillText(currentProfileStats.professions.alchemism.level + 1, 370, 886);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.alchemism.xp}%`, 18 + 370, 886 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 483, 913, Math.floor((currentProfileStats.professions.cooking.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 447, 885);
      ctx.drawImage(await loadImage('src/assets/cookingIcon.png'), 447, 889);
      ctx.fillText(`Cooking ${currentProfileStats.professions.cooking.level}`, 511, 886);
      ctx.fillText(currentProfileStats.professions.cooking.level + 1, 713, 886);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.cooking.xp}%`, 18 + 713, 886 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 824, 913, Math.floor((currentProfileStats.professions.weaponsmithing.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 791, 885);
      ctx.drawImage(await loadImage('src/assets/weaponsmithingIcon.png'), 791, 889);
      ctx.fillText(`Weaponsmithing ${currentProfileStats.professions.weaponsmithing.level}`, 854, 886);
      ctx.fillText(currentProfileStats.professions.weaponsmithing.level + 1, 1056, 886);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.weaponsmithing.xp}%`, 18 + 1056, 886 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 140, 985, Math.floor((currentProfileStats.professions.tailoring.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 104, 957);
      ctx.drawImage(await loadImage('src/assets/tailoringIcon.png'), 104, 961);
      ctx.fillText(`Tailoring ${currentProfileStats.professions.tailoring.level}`, 168, 958);
      ctx.fillText(currentProfileStats.professions.tailoring.level + 1, 370, 958);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.tailoring.xp}%`, 18 + 370, 958 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 483, 985, Math.floor((currentProfileStats.professions.woodworking.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 447, 957);
      ctx.drawImage(await loadImage('src/assets/woodworkingIcon.png'), 447, 961);
      ctx.fillText(currentProfileStats.professions.woodworking.level + 1, 713, 958);
      ctx.fillText(`Woodworking ${currentProfileStats.professions.woodworking.level}`, 511, 958);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.woodworking.xp}%`, 18 + 713, 958 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 824, 985, Math.floor((currentProfileStats.professions.armouring.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 791, 957);
      ctx.drawImage(await loadImage('src/assets/armouringIcon.png'), 791, 961);
      ctx.fillText(`Armouring ${currentProfileStats.professions.armouring.level}`, 854, 958);
      ctx.fillText(currentProfileStats.professions.armouring.level + 1, 1056, 958);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.armouring.xp}%`, 18 + 1056, 958 + 27);
      ctx.textAlign = 'left';
      ctx.font = '32px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
        600,
        1120,
        1136
      );
      const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'image.png' });
      generateStatsCache.set(uuid, attachment);
      return attachment;
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
  }
}

async function generateProfileImage(uuid, profileId) {
  try {
    if (generateProfileImageCache.has(profileId)) {
      cacheMessage('Generate Profile Image', 'hit');
      return generateProfileImageCache.get(profileId);
    } else {
      const canvas = createCanvas(1200, 1200);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(await loadImage('src/assets/statsCommandBackground.png'), 0, 0, canvas.width, canvas.height);
      var stats = await getStats(uuid);
      var currentProfileStats = stats.data.characters[profileId];
      const img = await loadImage(`https://visage.surgeplay.com/head/256/${uuid}.png`);
      ctx.drawImage(img, 912, 32, 256, 256);
      ctx.textBaseline = 'top';
      ctx.font = '36px Karla';
      ctx.textAlign = 'left';
      if (stats.rank === 'Media') {
        ctx.fillStyle = '#FF55FF';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#AA00AA';
        ctx.fillText(stats.rank, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#FF55FF';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.rank).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 + ctx.measureText('[').width + ctx.measureText(stats.rank).width + ctx.measureText(']').width,
          52
        );
      } else if (stats.rank === 'Administrator') {
        ctx.fillStyle = '#AA0000';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#FF5555';
        ctx.fillText(stats.rank, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#AA0000';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.rank).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 + ctx.measureText('[').width + ctx.measureText(stats.rank).width + ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.veteran) {
        ctx.fillStyle = '#FAB387';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#F38BA8';
        ctx.fillText('Vet', 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#FAB387';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText('Vet').width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 + ctx.measureText('[').width + ctx.measureText('Vet').width + ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.tag.value === 'VIP') {
        ctx.fillStyle = '#00AA00';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#55FF55';
        ctx.fillText(stats.data.meta.tag.value, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#00AA00';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.tag.value === 'VIP+') {
        ctx.fillStyle = '#55FFFF';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#00AAAA';
        ctx.fillText(stats.data.meta.tag.value, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#55FFFF';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.tag.value === 'HERO') {
        ctx.fillStyle = '#AA00AA';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#FF55FF';
        ctx.fillText(stats.data.meta.tag.value, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#AA00AA';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          52
        );
      } else if (stats.data.meta.tag.value === 'CHAMPION') {
        ctx.fillStyle = '#FFAA00';
        ctx.fillText('[', 62, 52);
        ctx.fillStyle = '#FFFF55';
        ctx.fillText(stats.data.meta.tag.value, 62 + ctx.measureText('[').width, 52);
        ctx.fillStyle = '#FFAA00';
        ctx.fillText(']', 62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 52);
        ctx.fillText(
          ` ${stats.username}`,
          62 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          52
        );
      } else {
        ctx.fillStyle = 'white';
        ctx.fillText(stats.username, 62, 52);
      }
      if (currentProfileStats.gamemode.craftsman) {
        ctx.drawImage(await loadImage('src/assets/craftsmanGamemodeIcon.png'), 832, 52);
        if (currentProfileStats.gamemode.hardcore) {
          ctx.drawImage(await loadImage('src/assets/hardcoreGamemodeIcon.png'), 776, 52);
          if (currentProfileStats.gamemode.ironman) {
            ctx.drawImage(await loadImage('src/assets/ironmanGamemodeIcon.png'), 720, 52);
            if (currentProfileStats.gamemode.hunted) {
              ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 664, 52);
            }
          }
        } else if (currentProfileStats.gamemode.ironman) {
          ctx.drawImage(await loadImage('src/assets/ironmanGamemodeIcon.png'), 776, 52);
          if (currentProfileStats.gamemode.hunted) {
            ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 720, 52);
          }
        } else if (currentProfileStats.gamemode.hunted) {
          ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 776, 52);
        }
      } else if (currentProfileStats.gamemode.hardcore) {
        ctx.drawImage(await loadImage('src/assets/hardcoreGamemodeIcon.png'), 832, 52);
        if (currentProfileStats.gamemode.ironman) {
          ctx.drawImage(await loadImage('src/assets/ironmanGamemodeIcon.png'), 776, 52);
          if (currentProfileStats.gamemode.hunted) {
            ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 720, 52);
          }
        } else if (currentProfileStats.gamemode.hunted) {
          ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 776, 52);
        }
      } else if (currentProfileStats.gamemode.ironman) {
        ctx.drawImage(await loadImage('src/assets/ironmanGamemodeIcon.png'), 832, 52);
        if (currentProfileStats.gamemode.hunted) {
          ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 776, 52);
        }
      } else if (currentProfileStats.gamemode.hunted) {
        ctx.drawImage(await loadImage('src/assets/huntedGamemodeIcon.png'), 832, 52);
      }
      ctx.font = '24px Karla';
      ctx.fillStyle = 'white';
      if (stats.data.guild.name != null) {
        ctx.font = '24px Karla';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(`${stats.data.guild.rank} of ${stats.data.guild.name}`, 62, 140);
        ctx.fillText(
          `Current Selected Class - ${
            currentProfileStats.type.charAt(0).toUpperCase() + currentProfileStats.type.slice(1).toLowerCase()
          }`,
          481,
          140
        );
        if (stats.data.meta.location.online == true) {
          ctx.fillText(`Online - ${stats.data.meta.location.server}`, 581, 208);
        } else {
          ctx.fillText(`Last Seen - ${getRelativeTime(new Date(stats.data.meta.lastJoin).getTime(), 'ms')}`, 581, 208);
        }
        ctx.textAlign = 'left';
        ctx.fillText(
          `First Login - ${new Date(stats.data.meta.firstJoin).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'America/New_York',
          })}`,
          62,
          208
        );
      } else {
        ctx.font = '24px Karla';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(
          `Current Selected Class - ${
            currentProfileStats.type.charAt(0).toUpperCase() + currentProfileStats.type.slice(1).toLowerCase()
          }`,
          64,
          140
        );
        if (stats.data.meta.location.online == true) {
          ctx.textAlign = 'right';
          ctx.fillText(`Online - ${stats.data.meta.location.server}`, 866, 140);
        } else {
          ctx.fillText(`Last Seen - ${getRelativeTime(new Date(stats.data.meta.lastJoin).getTime(), 'ms')}`, 581, 140);
        }
        ctx.textAlign = 'left';
        ctx.fillText(
          `First Login - ${new Date(stats.data.meta.firstJoin).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'America/New_York',
          })}`,
          62,
          208
        );
      }
      ctx.font = '22px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.fillText(
        `General\n\nTotal Level - ${currentProfileStats.level}\nPlaytime - ${Math.floor(
          (stats.data.meta.playtime * 4.7) / 60
        )}h\nDiscoveries - ${currentProfileStats.discoveries}\nMobs Killed - ${
          currentProfileStats.mobsKilled
        }\nFinished Dungeons - ${currentProfileStats.dungeons.completed}\nRaids Completed - ${
          currentProfileStats.raids.completed
        }`,
        62,
        322
      );
      ctx.font = '22px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      var skillsY = 464;
      var StrengthX = 430;
      var DexterityX = 581;
      var IntelligenceX = 721;
      var DefenseX = 891;
      var AgilityX = 1055;
      const textStrength = `Strength\n${currentProfileStats.skills.strength}`;
      const textLinesStrength = textStrength.split('\n');
      ctx.fillText(textLinesStrength[0], StrengthX, skillsY);
      ctx.fillText(
        textLinesStrength[1],
        StrengthX + (ctx.measureText(textLinesStrength[0]).width - ctx.measureText(textLinesStrength[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textDexterity = `Dexterity\n${currentProfileStats.skills.dexterity}`;
      const textLinesDexterity = textDexterity.split('\n');
      ctx.fillText(textLinesDexterity[0], DexterityX, skillsY);
      ctx.fillText(
        textLinesDexterity[1],
        DexterityX + (ctx.measureText(textLinesDexterity[0]).width - ctx.measureText(textLinesDexterity[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textIntelligence = `Intelligence\n${currentProfileStats.skills.intelligence}`;
      const textLinesIntelligence = textIntelligence.split('\n');
      ctx.fillText(textLinesIntelligence[0], IntelligenceX, skillsY);
      ctx.fillText(
        textLinesIntelligence[1],
        IntelligenceX +
          (ctx.measureText(textLinesIntelligence[0]).width - ctx.measureText(textLinesIntelligence[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textDefense = `Defense\n${currentProfileStats.skills.defense}`;
      const textLinesDefense = textDefense.split('\n');
      ctx.fillText(textLinesDefense[0], DefenseX, skillsY);
      ctx.fillText(
        textLinesDefense[1],
        DefenseX + (ctx.measureText(textLinesDefense[0]).width - ctx.measureText(textLinesDefense[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textAgility = `Agility\n${currentProfileStats.skills.agility}`;
      const textLinesAgility = textAgility.split('\n');
      ctx.fillText(textLinesAgility[0], AgilityX, skillsY);
      ctx.fillText(
        textLinesAgility[1],
        AgilityX + (ctx.measureText(textLinesAgility[0]).width - ctx.measureText(textLinesAgility[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      ctx.font = '22px Karla';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'white';
      const professionsIconBackground = await loadImage('src/assets/professionsIconBackground.svg');
      await bar(ctx, 140, 689, Math.floor((currentProfileStats.professions.combat.xp / 100) * 946), 28);
      ctx.drawImage(professionsIconBackground, 104, 661);
      ctx.drawImage(await loadImage('src/assets/combatIcon.png'), 108, 665);
      ctx.fillText(`Combat ${currentProfileStats.professions.combat.level}`, 168, 662);
      ctx.fillText(currentProfileStats.professions.combat.level + 1, 1056, 662);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.combat.xp}%`, 18 + 1056, 662 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 140, 769, Math.floor((currentProfileStats.professions.mining.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 104, 741);
      ctx.drawImage(await loadImage('src/assets/miningIcon.png'), 104, 745);
      ctx.fillText(`Mining ${currentProfileStats.professions.mining.level}`, 168, 742);
      ctx.fillText(currentProfileStats.professions.mining.level + 1, 370, 742);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.mining.xp}%`, 18 + 370, 742 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 483, 769, Math.floor((currentProfileStats.professions.farming.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 447, 741);
      ctx.drawImage(await loadImage('src/assets/farmingIcon.png'), 447, 745);
      ctx.fillText(`Farming ${currentProfileStats.professions.farming.level}`, 511, 742);
      ctx.fillText(currentProfileStats.professions.farming.level + 1, 713, 742);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.farming.xp}%`, 18 + 713, 742 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 824, 769, Math.floor((currentProfileStats.professions.woodcutting.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 791, 741);
      ctx.drawImage(await loadImage('src/assets/woodcuttingIcon.png'), 791, 745);
      ctx.fillText(`Woodcutting ${currentProfileStats.professions.woodcutting.level}`, 854, 742);
      ctx.fillText(currentProfileStats.professions.woodcutting.level + 1, 1056, 742);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.woodcutting.xp}%`, 18 + 1056, 742 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 140, 841, Math.floor((currentProfileStats.professions.fishing.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 104, 813);
      ctx.drawImage(await loadImage('src/assets/fishingIcon.png'), 104, 817);
      ctx.fillText(`Fishing ${currentProfileStats.professions.fishing.level}`, 168, 814);
      ctx.fillText(currentProfileStats.professions.fishing.level + 1, 370, 814);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.fishing.xp}%`, 18 + 370, 814 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 483, 841, Math.floor((currentProfileStats.professions.scribing.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 447, 813);
      ctx.drawImage(await loadImage('src/assets/scribingIcon.png'), 447, 817);
      ctx.fillText(`Scribing ${currentProfileStats.professions.scribing.level}`, 511, 814);
      ctx.fillText(currentProfileStats.professions.scribing.level + 1, 713, 814);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.scribing.xp}%`, 18 + 713, 814 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 824, 841, Math.floor((currentProfileStats.professions.jeweling.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 791, 813);
      ctx.drawImage(await loadImage('src/assets/jewelingIcon.png'), 791, 817);
      ctx.fillText(`Jeweling ${currentProfileStats.professions.jeweling.level}`, 854, 814);
      ctx.fillText(currentProfileStats.professions.jeweling.level + 1, 1056, 814);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.jeweling.xp}%`, 18 + 1056, 814 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 140, 913, Math.floor((currentProfileStats.professions.alchemism.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 104, 885);
      ctx.drawImage(await loadImage('src/assets/alchemismIcon.png'), 104, 889);
      ctx.fillText(`Alchemism ${currentProfileStats.professions.alchemism.level}`, 168, 886);
      ctx.fillText(currentProfileStats.professions.alchemism.level + 1, 370, 886);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.alchemism.xp}%`, 18 + 370, 886 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 483, 913, Math.floor((currentProfileStats.professions.cooking.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 447, 885);
      ctx.drawImage(await loadImage('src/assets/cookingIcon.png'), 447, 889);
      ctx.fillText(`Cooking ${currentProfileStats.professions.cooking.level}`, 511, 886);
      ctx.fillText(currentProfileStats.professions.cooking.level + 1, 713, 886);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.cooking.xp}%`, 18 + 713, 886 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 824, 913, Math.floor((currentProfileStats.professions.weaponsmithing.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 791, 885);
      ctx.drawImage(await loadImage('src/assets/weaponsmithingIcon.png'), 791, 889);
      ctx.fillText(`Weaponsmithing ${currentProfileStats.professions.weaponsmithing.level}`, 854, 886);
      ctx.fillText(currentProfileStats.professions.weaponsmithing.level + 1, 1056, 886);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.weaponsmithing.xp}%`, 18 + 1056, 886 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 140, 985, Math.floor((currentProfileStats.professions.tailoring.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 104, 957);
      ctx.drawImage(await loadImage('src/assets/tailoringIcon.png'), 104, 961);
      ctx.fillText(`Tailoring ${currentProfileStats.professions.tailoring.level}`, 168, 958);
      ctx.fillText(currentProfileStats.professions.tailoring.level + 1, 370, 958);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.tailoring.xp}%`, 18 + 370, 958 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 483, 985, Math.floor((currentProfileStats.professions.woodworking.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 447, 957);
      ctx.drawImage(await loadImage('src/assets/woodworkingIcon.png'), 447, 961);
      ctx.fillText(currentProfileStats.professions.woodworking.level + 1, 713, 958);
      ctx.fillText(`Woodworking ${currentProfileStats.professions.woodworking.level}`, 511, 958);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.woodworking.xp}%`, 18 + 713, 958 + 27);
      ctx.textAlign = 'left';
      await bar(ctx, 824, 985, Math.floor((currentProfileStats.professions.armouring.xp / 100) * 262), 28);
      ctx.drawImage(professionsIconBackground, 791, 957);
      ctx.drawImage(await loadImage('src/assets/armouringIcon.png'), 791, 961);
      ctx.fillText(`Armouring ${currentProfileStats.professions.armouring.level}`, 854, 958);
      ctx.fillText(currentProfileStats.professions.armouring.level + 1, 1056, 958);
      ctx.textAlign = 'right';
      ctx.fillText(`${currentProfileStats.professions.armouring.xp}%`, 18 + 1056, 958 + 27);
      ctx.textAlign = 'left';
      ctx.font = '32px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
        600,
        1120,
        1136
      );
      var buffer = canvas.toBuffer('image/png');
      generateProfileImageCache.set(profileId, buffer);
      return buffer;
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
  }
}

async function generateGuild(guildData) {
  if (generateGuildCache.has(guildData.name)) {
    cacheMessage('Generate Guild', 'hit');
    return generateGuildCache.get(guildData.name);
  } else {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    var uuid = Object.values(guildData.members.OWNER)[0].uuid;
    var stats = await getStats(uuid);
    let statsY = 0;
    let memberX = 0;
    let onlineMemberX = 0;
    let territoriesX = 0;
    if (guildData.banner == undefined) {
      ctx.drawImage(await loadImage('src/assets/guildCommandBackground.png'), 0, 0, canvas.width, canvas.height);
      ctx.font = '64px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`[${guildData.prefix}] ${guildData.name}`, 64, 64);
      ctx.textBaseline = 'top';
      ctx.font = '32px Karla';
      ctx.textAlign = 'left';
      ctx.fillText(`Owner - `, 64, 150);
      if (stats.rank === 'Media') {
        ctx.fillStyle = '#FF55FF';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#AA00AA';
        ctx.fillText(stats.rank, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#FF55FF';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.rank).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 + ctx.measureText('[').width + ctx.measureText(stats.rank).width + ctx.measureText(']').width,
          150
        );
      } else if (stats.rank === 'Administrator') {
        ctx.fillStyle = '#AA0000';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#FF5555';
        ctx.fillText(stats.rank, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#AA0000';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.rank).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 + ctx.measureText('[').width + ctx.measureText(stats.rank).width + ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.veteran) {
        ctx.fillStyle = '#FAB387';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#F38BA8';
        ctx.fillText('Vet', 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#FAB387';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText('Vet').width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 + ctx.measureText('[').width + ctx.measureText('Vet').width + ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.tag.value === 'VIP') {
        ctx.fillStyle = '#00AA00';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#55FF55';
        ctx.fillText(stats.data.meta.tag.value, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#00AA00';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.tag.value === 'VIP+') {
        ctx.fillStyle = '#55FFFF';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#00AAAA';
        ctx.fillText(stats.data.meta.tag.value, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#55FFFF';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.tag.value === 'HERO') {
        ctx.fillStyle = '#AA00AA';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#FF55FF';
        ctx.fillText(stats.data.meta.tag.value, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#AA00AA';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.tag.value === 'CHAMPION') {
        ctx.fillStyle = '#FFAA00';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#FFFF55';
        ctx.fillText(stats.data.meta.tag.value, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#FFAA00';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          150
        );
      } else {
        ctx.fillStyle = 'white';
        ctx.fillText(stats.username, 207, 150);
      }
      ctx.font = '24px Karla';
      ctx.fillStyle = 'white';
      ctx.fillText(
        `Created - ${generateDate(guildData.created).split(' at ')[0]} (${getRelativeTime(
          new Date(guildData.created).getTime(),
          'ms'
        )})`,
        64,
        197
      );
      await bar(ctx, 64, 234, Math.floor((guildData.xp / 100) * 1072), 28);
      ctx.font = '22px Karla';
      ctx.fillText(`Level - ${guildData.level}`, 80, 234);
      ctx.fillText(`${guildData.xp}%`, 1058, 234);
      statsY = 530;
      memberX = 162;
      onlineMemberX = 578.22;
      territoriesX = 916;
      ctx.font = '32px Karla';
      const textMember = `Members\n${guildData.totalMembers}/${getMaxMembers(guildData.level)}`;
      const textLinesMember = textMember.split('\n');
      ctx.fillText(textLinesMember[0], memberX, statsY);
      ctx.fillText(
        textLinesMember[1],
        memberX + (ctx.measureText(textLinesMember[0]).width - ctx.measureText(textLinesMember[1]).width) / 2,
        statsY + parseInt(ctx.font, 10)
      );
      const textOnlineMembers = `Online\n${guildData.onlineMembers}/${guildData.totalMembers}`;
      const textLinesOnlineMembers = textOnlineMembers.split('\n');
      ctx.fillText(textLinesOnlineMembers[0], onlineMemberX, statsY);
      ctx.fillText(
        textLinesOnlineMembers[1],
        onlineMemberX +
          (ctx.measureText(textLinesOnlineMembers[0]).width - ctx.measureText(textLinesOnlineMembers[1]).width) / 2,
        statsY + parseInt(ctx.font, 10)
      );
      const textTerritories = `Territories\n${guildData.territories}`;
      const textLinesTerritories = textTerritories.split('\n');
      ctx.fillText(textLinesTerritories[0], territoriesX, statsY);
      ctx.fillText(
        textLinesTerritories[1],
        territoriesX +
          (ctx.measureText(textLinesTerritories[0]).width - ctx.measureText(textLinesTerritories[1]).width) / 2,
        statsY + parseInt(ctx.font, 10)
      );
      ctx.font = '32px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
        600,
        720,
        1136
      );
      return canvas.toBuffer('image/png');
    } else {
      ctx.drawImage(await loadImage('src/assets/guildBannerCommandBackground.png'), 0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        await loadImage(`https://wynn-guild-banner.toki317.dev/banners/${guildData.fixedNamed}`),
        986,
        64,
        150,
        300
      );
      ctx.font = '64px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`[${guildData.prefix}] ${guildData.name}`, 64, 64);
      ctx.textBaseline = 'top';
      ctx.font = '32px Karla';
      ctx.textAlign = 'left';
      ctx.fillText(`Owner - `, 64, 150);
      if (stats.rank === 'Media') {
        ctx.fillStyle = '#FF55FF';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#AA00AA';
        ctx.fillText(stats.rank, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#FF55FF';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.rank).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 + ctx.measureText('[').width + ctx.measureText(stats.rank).width + ctx.measureText(']').width,
          150
        );
      } else if (stats.rank === 'Administrator') {
        ctx.fillStyle = '#AA0000';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#FF5555';
        ctx.fillText(stats.rank, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#AA0000';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.rank).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 + ctx.measureText('[').width + ctx.measureText(stats.rank).width + ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.veteran) {
        ctx.fillStyle = '#FAB387';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#F38BA8';
        ctx.fillText('Vet', 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#FAB387';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText('Vet').width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 + ctx.measureText('[').width + ctx.measureText('Vet').width + ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.tag.value === 'VIP') {
        ctx.fillStyle = '#00AA00';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#55FF55';
        ctx.fillText(stats.data.meta.tag.value, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#00AA00';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.tag.value === 'VIP+') {
        ctx.fillStyle = '#55FFFF';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#00AAAA';
        ctx.fillText(stats.data.meta.tag.value, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#55FFFF';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.tag.value === 'HERO') {
        ctx.fillStyle = '#AA00AA';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#FF55FF';
        ctx.fillText(stats.data.meta.tag.value, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#AA00AA';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          150
        );
      } else if (stats.data.meta.tag.value === 'CHAMPION') {
        ctx.fillStyle = '#FFAA00';
        ctx.fillText('[', 207, 150);
        ctx.fillStyle = '#FFFF55';
        ctx.fillText(stats.data.meta.tag.value, 207 + ctx.measureText('[').width, 150);
        ctx.fillStyle = '#FFAA00';
        ctx.fillText(']', 207 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width, 150);
        ctx.fillText(
          ` ${stats.username}`,
          207 +
            ctx.measureText('[').width +
            ctx.measureText(stats.data.meta.tag.value).width +
            ctx.measureText(']').width,
          150
        );
      } else {
        ctx.fillStyle = 'white';
        ctx.fillText(stats.username, 207, 150);
      }
      ctx.font = '24px Karla';
      ctx.fillStyle = 'white';
      ctx.fillText(
        `Created - ${generateDate(guildData.created).split(' at ')[0]} (${getRelativeTime(
          new Date(guildData.created).getTime(),
          'ms'
        )})`,
        64,
        197
      );
      await bar(ctx, 64, 234, Math.floor((guildData.xp / 100) * 866), 28);
      ctx.font = '22px Karla';
      ctx.fillText(`Level - ${guildData.level}`, 80, 234);
      ctx.fillText(`${guildData.xp}%`, 868, 234);
      statsY = 530;
      memberX = 162;
      onlineMemberX = 505.5;
      territoriesX = 816;
      ctx.font = '32px Karla';
      const textMember = `Members\n${guildData.totalMembers}/${getMaxMembers(guildData.level)}`;
      const textLinesMember = textMember.split('\n');
      ctx.fillText(textLinesMember[0], memberX, statsY);
      ctx.fillText(
        textLinesMember[1],
        memberX + (ctx.measureText(textLinesMember[0]).width - ctx.measureText(textLinesMember[1]).width) / 2,
        statsY + parseInt(ctx.font, 10)
      );
      const textOnlineMembers = `Online\n${guildData.onlineMembers}/${guildData.totalMembers}`;
      const textLinesOnlineMembers = textOnlineMembers.split('\n');
      ctx.fillText(textLinesOnlineMembers[0], onlineMemberX, statsY);
      ctx.fillText(
        textLinesOnlineMembers[1],
        onlineMemberX +
          (ctx.measureText(textLinesOnlineMembers[0]).width - ctx.measureText(textLinesOnlineMembers[1]).width) / 2,
        statsY + parseInt(ctx.font, 10)
      );
      const textTerritories = `Territories\n${guildData.territories}`;
      const textLinesTerritories = textTerritories.split('\n');
      ctx.fillText(textLinesTerritories[0], territoriesX, statsY);
      ctx.fillText(
        textLinesTerritories[1],
        territoriesX +
          (ctx.measureText(textLinesTerritories[0]).width - ctx.measureText(textLinesTerritories[1]).width) / 2,
        statsY + parseInt(ctx.font, 10)
      );
      ctx.font = '32px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
        600,
        720,
        1136
      );
      var buffer = canvas.toBuffer('image/png');
      generateGuildCache.set(guildData.name, buffer);
      return buffer;
    }
  }
}

async function generateMemberJoin(data) {
  try {
    var member = data.user;
    console.log(member);
    const canvas = createCanvas(1200, 600);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(await loadImage('src/assets/memberJoinBackground.png'), 0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.beginPath();
    ctx.arc(256, 246, 128, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      await loadImage(`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=4096`),
      128,
      118,
      256,
      256
    );
    ctx.restore();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (member.globalName === null || member.globalName === member.username) {
      ctx.font = '96px Karla';
      ctx.fillText(`@${member.username}`, 448, 171);
      ctx.font = '48px Karla';
      ctx.fillText(`Member - ${data.guild.memberCount}`, 448, 287);
    } else {
      ctx.font = '96px Karla';
      ctx.fillText(member.globalName, 448, 130);
      ctx.font = '48px Karla';
      ctx.fillText(`@${member.username}`, 448, 229);
      ctx.fillText(`Member - ${data.guild.memberCount}`, 448, 287);
    }
    ctx.font = '32px Karla';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
      600,
      520,
      1136
    );
    return canvas.toBuffer('image/png');
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
  }
}

async function generateServer(server) {
  try {
    if (generateServerCache.has(server.server)) {
      cacheMessage('Generate Server', 'hit');
      return generateServerCache.get(server.server);
    } else {
      const canvas = createCanvas(1200, 600);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.drawImage(await loadImage('src/assets/memberJoinBackground.png'), 0, 0, canvas.width, canvas.height);
      ctx.font = '128px Karla';
      if (server.status === 'online') {
        ctx.drawImage(await loadImage('src/assets/serverOnlineIcon.png'), 96, 118, 256, 256);
      } else if (server.status === 'offline') {
        ctx.drawImage(await loadImage('src/assets/serverOfflineIcon.png'), 96, 118, 256, 256);
      }
      ctx.fillText(server.server, 514, 169);
      ctx.fillText(server.count, 946, 169);
      var uptime = await getServerUptime(server.server);
      ctx.font = '48px Karla';
      ctx.fillText(`Uptime - ${getRelativeTime(uptime.onlineSince, 's')}`, 347, 374);
      ctx.font = '32px Karla';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
        600,
        520,
        1136
      );
      var buffer = canvas.toBuffer('image/png');
      generateServerCache.set(server.server, buffer);
      return buffer;
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
  }
}

const serversXY = [
  { circle: { x: 99, y: 105 }, id: { x: 224, y: 121 }, count: { x: 355, y: 121 } },
  { circle: { x: 447, y: 105 }, id: { x: 571, y: 121 }, count: { x: 704, y: 121 } },
  { circle: { x: 796, y: 105 }, id: { x: 918, y: 121 }, count: { x: 1052, y: 121 } },
  { circle: { x: 99, y: 306 }, id: { x: 224, y: 321 }, count: { x: 355, y: 321 } },
  { circle: { x: 447, y: 306 }, id: { x: 571, y: 321 }, count: { x: 704, y: 321 } },
  { circle: { x: 796, y: 306 }, id: { x: 918, y: 321 }, count: { x: 1052, y: 321 } },
  { circle: { x: 99, y: 507 }, id: { x: 224, y: 522 }, count: { x: 355, y: 522 } },
  { circle: { x: 447, y: 507 }, id: { x: 522, y: 121 }, count: { x: 704, y: 522 } },
  { circle: { x: 796, y: 507 }, id: { x: 918, y: 522 }, count: { x: 1052, y: 522 } },
  { circle: { x: 99, y: 708 }, id: { x: 224, y: 723 }, count: { x: 355, y: 723 } },
  { circle: { x: 447, y: 708 }, id: { x: 571, y: 723 }, count: { x: 704, y: 723 } },
  { circle: { x: 796, y: 708 }, id: { x: 918, y: 723 }, count: { x: 1052, y: 723 } },
  { circle: { x: 99, y: 908 }, id: { x: 224, y: 923 }, count: { x: 355, y: 923 } },
  { circle: { x: 447, y: 908 }, id: { x: 571, y: 923 }, count: { x: 704, y: 923 } },
  { circle: { x: 796, y: 908 }, id: { x: 918, y: 923 }, count: { x: 1052, y: 923 } },
];

async function generateServers(servers) {
  try {
    const canvas = createCanvas(1200, 1200);
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 15; i++) {
      const server = servers[i];
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.drawImage(await loadImage('src/assets/memberJoinBackground.png'), 0, 0, canvas.width, canvas.height);
      ctx.font = '128px Karla';
      if (server.status === 'online') {
        ctx.drawImage(
          await loadImage('src/assets/serverOnlineIcon.png'),
          serversXY[i].circle.x,
          serversXY[i].circle.y,
          77.22,
          77.22
        );
      } else {
        ctx.drawImage(
          await loadImage('src/assets/serverOfflineIcon.png'),
          serversXY[i].circle.x,
          serversXY[i].circle.y,
          77.22,
          77.22
        );
      }
      ctx.fillText(server.id, serversXY[i].id.x, serversXY[i].id.y);
      ctx.fillText(server.count, serversXY[i].count.x, serversXY[i].count.y);
    }
    ctx.font = '32px Karla';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
      600,
      520,
      1136
    );
    var buffer = canvas.toBuffer('image/png');
    return buffer;
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
  }
}

async function generateServerChart(data) {
  try {
    const playerCounts = data.map((entry) => entry.value);
    const timestamps = data.map((entry) => entry.timestamp);
    const relativeTimes = timestamps.map((timestamp) => getRelativeTime(timestamp, 's'));
    const modifiedTimes = relativeTimes.map((time) => {
      const match = time.match(/(\d+) (minutes|hours) ago/);
      return match ? `-${match[1]}${match[2][0]}` : '';
    });
    const chart = new QuickChart();
    chart
      .setConfig({
        type: 'line',
        data: {
          labels: modifiedTimes,
          datasets: [
            {
              label: 'Player Count',
              data: playerCounts,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.2)',
              fill: true,
            },
          ],
        },
        options: {
          scales: {
            xAxes: [
              {
                display: true,
                gridLines: { display: false },
                ticks: { fontColor: '#ffffff', fontSize: 16 },
                scaleLabel: {
                  display: true,
                  labelString: '# Time ago (H = hours, M = minutes)',
                  fontSize: 16,
                  fontColor: '#ffffff',
                  fontStyle: 'bold',
                },
              },
            ],
            yAxes: [
              {
                display: true,
                gridLines: { display: false },
                ticks: {
                  fontColor: '#ffffff',
                  min: Math.min(...playerCounts) - 3,
                  max: Math.max(...playerCounts) + 3,
                  fontSize: 16,
                },
                scaleLabel: {
                  display: true,
                  labelString: '# of Players',
                  fontSize: 16,
                  fontColor: '#ffffff',
                  fontStyle: 'bold',
                },
              },
            ],
          },
          legend: { labels: { fontColor: '#FFFFFF' } },
        },
        plugins: { tooltip: { backgroundColor: '#303446', borderColor: '#303446' } },
      })
      .setWidth(1136)
      .setHeight(428);
    return await chart.getShortUrl();
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
  }
}

async function generateServerGraph(server) {
  if (generateServerGraphCache.has(server.server)) {
    cacheMessage('Generate Server Graph', 'hit');
    return generateServerGraphCache.get(server.server);
  } else {
    const canvas = createCanvas(1200, 600);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(await loadImage('src/assets/memberJoinBackground.png'), 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var badData = await getServerHistory(server.server, 'day');
    if (badData.success) {
      ctx.font = '16px Karla';
      if (server.status === 'online') {
        ctx.drawImage(await loadImage('src/assets/serverOnlineIcon.png'), 1078, 48, 32, 32);
      } else {
        ctx.drawImage(await loadImage('src/assets/serverOfflineIcon.png'), 1078, 48, 32, 32);
      }
      ctx.fillText(server.server, 1118, 55);
      var data = await cleanUpTimestampData(badData);
      var url = await generateServerChart(data);
      ctx.drawImage(await loadImage(url), 32, 32, 1136, 428);
    } else {
      ctx.font = '32px Karla';
      if (server.status === 'online') {
        ctx.drawImage(await loadImage('src/assets/serverOnlineIcon.png'), 525, 88, 64, 64);
      } else {
        ctx.drawImage(await loadImage('src/assets/serverOfflineIcon.png'), 525, 88, 64, 64);
      }
      ctx.fillText(server.server, 605, 102);
      if (badData.error === 'No data was found about the specified server') {
        const text = `No data was found about\nthe specified server`;
        const textLines = text.split('\n');
        ctx.font = '64px Karla';
        ctx.fillText(textLines[0], 218, 184);
        ctx.fillText(
          textLines[1],
          218 + (ctx.measureText(textLines[0]).width - ctx.measureText(textLines[1]).width) / 2,
          184 + parseInt(ctx.font, 10)
        );
      } else {
        ctx.fillText(badData.error, 218, 184);
      }
    }
    ctx.fillStyle = 'white';
    ctx.font = '32px Karla';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
      600,
      520,
      1136
    );
    var buffer = canvas.toBuffer('image/png');
    generateServerGraphCache.set(server.server, buffer);
    return buffer;
  }
}

async function clearGenerateStatsCache() {
  try {
    cacheMessage('Generate Stats', 'Cleared');
    generateStatsCache.flushAll();
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
    return error;
  }
}

async function clearGenerateProfileImageCache() {
  try {
    cacheMessage('Generate Profile Image', 'Cleared');
    generateProfileImageCache.flushAll();
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
    return error;
  }
}

async function clearGenerateGuildCache() {
  try {
    cacheMessage('Generate Guild', 'Cleared');
    generateGuildCache.flushAll();
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
    return error;
  }
}

async function clearGenerateServerCache() {
  try {
    cacheMessage('Generate Server', 'Cleared');
    generateServerCache.flushAll();
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
    return error;
  }
}

async function clearGenerateServerGraphCache() {
  try {
    cacheMessage('Generate Server Graph', 'Cleared');
    generateServerGraphCache.flushAll();
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    console.log(error);
    return error;
  }
}

module.exports = {
  bar,
  generateStats,
  generateProfileImage,
  generateGuild,
  generateMemberJoin,
  generateServer,
  generateServers,
  generateServerChart,
  generateServerGraph,
  clearGenerateStatsCache,
  clearGenerateProfileImageCache,
  clearGenerateGuildCache,
  clearGenerateServerCache,
  clearGenerateServerGraphCache,
};
