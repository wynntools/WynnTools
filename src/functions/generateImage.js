const { getRelativeTime, generateDate, getMaxMembers, generateID, hexToRgb } = require('./helper.js');
const { cacheMessage, errorMessage } = require('../functions/logger.js');
const { registerFont, createCanvas, loadImage } = require('canvas');
const { getStats } = require('../api/wynnCraftAPI.js');
const { AttachmentBuilder } = require('discord.js');
var packageJson = require('../../package.json');
const QuickChart = require('quickchart-js');
const config = require('../../config.json');
const nodeCache = require('node-cache');
const fs = require('fs');

const generateProfileImageCache = new nodeCache({ stdTTL: config.other.cacheTimeout });
const generateGuildCache = new nodeCache({ stdTTL: config.other.cacheTimeout });

registerFont('src/fonts/Karla-Regular.ttf', { family: 'Karla Regular' });

async function bar(ctx, rectX, rectY, rectWidth, rectHeight, color) {
  if (rectWidth == 0) return;
  if (color == null) color = hexToRgb(config.other.colors.salmonPink);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
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

async function generateProfileImage(uuid, profileId) {
  try {
    if (generateProfileImageCache.has(profileId)) {
      cacheMessage('Generate Profile Image', 'hit');
      return generateProfileImageCache.get(profileId);
    } else {
      const professionsIconBackground = await loadImage('src/assets/statsCommand/professionsIconBackground.svg');
      const professionsIconBackgroundMaxLevel = await loadImage(
        'src/assets/statsCommand/professionsIconBackgroundMaxLevel.svg'
      );
      const canvas = createCanvas(1200, 1200);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(await loadImage('src/assets/statsCommand/background.png'), 0, 0, canvas.width, canvas.height);
      var stats = await getStats(uuid);
      var currentProfileStats = stats.characters[profileId];
      const img = await loadImage(`https://www.mc-heads.net/head/${uuid}/256/left.png`);
      ctx.drawImage(img, 928, 48, 224, 240);
      ctx.textBaseline = 'top';
      ctx.font = '36px Karla';
      ctx.textAlign = 'left';
      if (stats.rank.badge) {
        const file = await fs.promises
          .access(`src/assets/wynnCraft/${stats.rank.badge}`)
          .then(() => true)
          .catch((e) => {
            false;
          });
        const rankBadge = await loadImage(
          file ? `src/assets/wynnCraft/${stats.rank.badge}` : `https://cdn.wynncraft.com/${stats.rank.badge}`
        );
        const rankBadgeWidth = rankBadge.width * 3;
        const rankBadgeHeight = rankBadge.height * 3;
        ctx.drawImage(rankBadge, 65, 60, rankBadgeWidth, rankBadgeHeight);
        ctx.fillStyle = stats.rank.colors.main;
        ctx.fillText(stats.username, rankBadgeWidth + 75, 52);

        if (currentProfileStats.nickname !== null) {
          ctx.fillStyle = 'white';
          ctx.fillText(
            ` - (${currentProfileStats.nickname})`,
            rankBadgeWidth + 75 + ctx.measureText(` ${currentProfileStats.username} `).width + 8,
            52
          );
        }
      } else {
        ctx.fillStyle = 'white';
        if (currentProfileStats.nickname !== null) {
          ctx.fillText(`${stats.username} (${currentProfileStats.nickname})`, 62, 52);
        } else {
          ctx.fillText(stats.username, 62, 52);
        }
      }

      if (currentProfileStats.gamemode.length > 0) {
        let gamemodeX = 832;
        if (currentProfileStats.gamemode.includes('craftsman')) {
          ctx.drawImage(await loadImage('src/assets/statsCommand/craftsmanGamemodeIcon.png'), gamemodeX, 52);
          gamemodeX = gamemodeX - 56;
        }
        if (currentProfileStats.gamemode.includes('hardcore')) {
          ctx.drawImage(await loadImage('src/assets/statsCommand/hardcoreGamemodeIcon.png'), gamemodeX, 52);
          gamemodeX = gamemodeX - 56;
        }
        if (currentProfileStats.gamemode.includes('ironman')) {
          ctx.drawImage(await loadImage('src/assets/statsCommand/ironmanGamemodeIcon.png'), gamemodeX, 52);
          gamemodeX = gamemodeX - 56;
        }
        if (currentProfileStats.gamemode.includes('hunted')) {
          ctx.drawImage(await loadImage('src/assets/statsCommand/huntedGamemodeIcon.png'), gamemodeX, 52);
          gamemodeX = gamemodeX - 56;
        }
      }

      ctx.font = '24px Karla';
      ctx.fillStyle = 'white';
      if (stats.guild !== null) {
        ctx.font = '24px Karla';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(`${stats.guild.rank} of ${stats.guild.name}`, 62, 140);
        ctx.fillText(
          `Current Selected Class - ${
            currentProfileStats.type.charAt(0).toUpperCase() + currentProfileStats.type.slice(1).toLowerCase()
          }`,
          481,
          140
        );
        if (stats.online) {
          ctx.fillText(`Online - ${stats.server}`, 581, 208);
        } else {
          ctx.fillText(`Last Seen - ${getRelativeTime(stats.lastJoin, 'ms')}`, 581, 208);
        }
        ctx.textAlign = 'left';
        ctx.fillText(
          `First Login - ${new Date(stats.firstJoin).toLocaleString('en-US', {
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
        if (stats.online == true) {
          ctx.textAlign = 'right';
          ctx.fillText(`Online - ${stats.server}`, 866, 140);
        } else {
          ctx.fillText(`Last Seen - ${getRelativeTime(new Date(stats.lastJoin).getTime(), 'ms')}`, 581, 140);
        }
        ctx.textAlign = 'left';
        ctx.fillText(
          `First Login - ${new Date(stats.firstJoin).toLocaleString('en-US', {
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
        `General\n\nTotal Level - ${currentProfileStats.totalLevel}\nPlaytime - ${stats.playtime}\nDiscoveries - ${
          currentProfileStats.discoveries
        }\nMobs Killed - ${currentProfileStats.mobsKilled}\nFinished Dungeons - ${
          currentProfileStats.dungeons ? currentProfileStats.dungeons.total : 0
        }\nRaids Completed - ${currentProfileStats.raids ? currentProfileStats.raids.total : 0}`,
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
      const textStrength = `Strength\n${
        currentProfileStats.skillPoints.strength ? currentProfileStats.skillPoints.strength : 0
      }`;
      const textLinesStrength = textStrength.split('\n');
      ctx.fillText(textLinesStrength[0], StrengthX, skillsY);
      ctx.fillText(
        textLinesStrength[1],
        StrengthX + (ctx.measureText(textLinesStrength[0]).width - ctx.measureText(textLinesStrength[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textDexterity = `Dexterity\n${
        currentProfileStats.skillPoints.dexterity ? currentProfileStats.skillPoints.dexterity : 0
      }`;
      const textLinesDexterity = textDexterity.split('\n');
      ctx.fillText(textLinesDexterity[0], DexterityX, skillsY);
      ctx.fillText(
        textLinesDexterity[1],
        DexterityX + (ctx.measureText(textLinesDexterity[0]).width - ctx.measureText(textLinesDexterity[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textIntelligence = `Intelligence\n${
        currentProfileStats.skillPoints.intelligence ? currentProfileStats.skillPoints.intelligence : 0
      }`;
      const textLinesIntelligence = textIntelligence.split('\n');
      ctx.fillText(textLinesIntelligence[0], IntelligenceX, skillsY);
      ctx.fillText(
        textLinesIntelligence[1],
        IntelligenceX +
          (ctx.measureText(textLinesIntelligence[0]).width - ctx.measureText(textLinesIntelligence[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textDefense = `Defense\n${
        currentProfileStats.skillPoints.defense ? currentProfileStats.skillPoints.defense : 0
      }`;
      const textLinesDefense = textDefense.split('\n');
      ctx.fillText(textLinesDefense[0], DefenseX, skillsY);
      ctx.fillText(
        textLinesDefense[1],
        DefenseX + (ctx.measureText(textLinesDefense[0]).width - ctx.measureText(textLinesDefense[1]).width) / 2,
        470 + parseInt(ctx.font, 10)
      );
      const textAgility = `Agility\n${
        currentProfileStats.skillPoints.agility ? currentProfileStats.skillPoints.agility : 0
      }`;
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

      // ? Combat
      ctx.fillText(`Combat ${currentProfileStats.level}`, 168, 662);
      if (currentProfileStats.level == 106) {
        await bar(ctx, 140, 689, 946, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 104, 661);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'black';
        ctx.fillText('Max Level', 18 + 1056, 662 + 27);
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 140, 689, Math.floor((currentProfileStats.xpPercent / 100) * 946), 28);
        ctx.drawImage(professionsIconBackground, 104, 661);
        ctx.fillText(currentProfileStats.level + 1, 1056, 662);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.xpPercent}%`, 18 + 1056, 662 + 27);
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/combatIcon.png'), 108, 665);
      ctx.textAlign = 'left';

      // ? Mining
      if (currentProfileStats.professions.mining.level == 132) {
        await bar(ctx, 140, 769, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 104, 741);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 370, 742 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 140, 769, Math.floor((currentProfileStats.professions.mining.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 104, 741);
        ctx.fillText(currentProfileStats.professions.mining.level + 1, 370, 742);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.mining.xpPercent}%`, 18 + 370, 742 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/miningIcon.png'), 104, 745);
      ctx.fillText(`Mining ${currentProfileStats.professions.mining.level}`, 168, 742);

      // ? Farming
      if (currentProfileStats.professions.farming.level == 132) {
        await bar(ctx, 483, 769, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 447, 741);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 713, 742 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 483, 769, Math.floor((currentProfileStats.professions.farming.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 447, 741);
        ctx.fillText(currentProfileStats.professions.farming.level + 1, 713, 742);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.farming.xpPercent}%`, 18 + 713, 742 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/farmingIcon.png'), 447, 745);
      ctx.fillText(`Farming ${currentProfileStats.professions.farming.level}`, 511, 742);

      // ? Woodcutting
      if (currentProfileStats.professions.woodcutting.level == 132) {
        await bar(ctx, 824, 769, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 791, 741);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 1056, 742 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 824, 769, Math.floor((currentProfileStats.professions.woodcutting.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 791, 741);
        ctx.fillText(currentProfileStats.professions.woodcutting.level + 1, 1056, 742);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.woodcutting.xpPercent}%`, 18 + 1056, 742 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/woodcuttingIcon.png'), 791, 745);
      ctx.fillText(`Woodcutting ${currentProfileStats.professions.woodcutting.level}`, 854, 742);

      // ? Fishing
      if (currentProfileStats.professions.fishing.level == 132) {
        await bar(ctx, 140, 841, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 104, 813);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 370, 814 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 140, 841, Math.floor((currentProfileStats.professions.fishing.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 104, 813);
        ctx.fillText(currentProfileStats.professions.fishing.level + 1, 370, 814);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.fishing.xpPercent}%`, 18 + 370, 814 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/fishingIcon.png'), 104, 817);
      ctx.fillText(`Fishing ${currentProfileStats.professions.fishing.level}`, 168, 814);

      // ? Scribing
      if (currentProfileStats.professions.scribing.level == 132) {
        await bar(ctx, 483, 841, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 447, 813);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 713, 814 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 483, 841, Math.floor((currentProfileStats.professions.scribing.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 447, 813);
        ctx.fillText(currentProfileStats.professions.scribing.level + 1, 713, 814);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.scribing.xpPercent}%`, 18 + 713, 814 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/scribingIcon.png'), 447, 817);
      ctx.fillText(`Scribing ${currentProfileStats.professions.scribing.level}`, 511, 814);

      // ? Jeweling
      if (currentProfileStats.professions.jeweling.level == 132) {
        await bar(ctx, 824, 841, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 791, 813);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 1056, 814 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 824, 841, Math.floor((currentProfileStats.professions.jeweling.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 791, 813);
        ctx.fillText(currentProfileStats.professions.jeweling.level + 1, 1056, 814);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.jeweling.xpPercent}%`, 18 + 1056, 814 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/jewelingIcon.png'), 791, 817);
      ctx.fillText(`Jeweling ${currentProfileStats.professions.jeweling.level}`, 854, 814);

      // ? Alchemism
      if (currentProfileStats.professions.alchemism.level == 132) {
        await bar(ctx, 140, 913, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 104, 885);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 370, 886 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 140, 913, Math.floor((currentProfileStats.professions.alchemism.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 104, 885);
        ctx.fillText(currentProfileStats.professions.alchemism.level + 1, 370, 886);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.alchemism.xpPercent}%`, 18 + 370, 886 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/alchemismIcon.png'), 104, 889);
      ctx.fillText(`Alchemism ${currentProfileStats.professions.alchemism.level}`, 168, 886);

      // ? Cooking
      if (currentProfileStats.professions.cooking.level == 132) {
        await bar(ctx, 483, 913, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 447, 885);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 713, 886 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 483, 913, Math.floor((currentProfileStats.professions.cooking.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 447, 885);
        ctx.fillText(currentProfileStats.professions.cooking.level + 1, 713, 886);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.cooking.xpPercent}%`, 18 + 713, 886 + 27);
        ctx.textAlign = 'left';
      }
      ctx.fillText(`Cooking ${currentProfileStats.professions.cooking.level}`, 511, 886);
      ctx.drawImage(await loadImage('src/assets/statsCommand/cookingIcon.png'), 447, 889);

      // ? Weaponsmithing
      if (currentProfileStats.professions.weaponsmithing.level == 132) {
        await bar(ctx, 824, 913, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 791, 885);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 1056, 886 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(
          ctx,
          824,
          913,
          Math.floor((currentProfileStats.professions.weaponsmithing.xpPercent / 100) * 262),
          28
        );
        ctx.drawImage(professionsIconBackground, 791, 885);
        ctx.fillText(currentProfileStats.professions.weaponsmithing.level + 1, 1056, 886);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.weaponsmithing.xpPercent}%`, 18 + 1056, 886 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/weaponsmithingIcon.png'), 791, 889);
      ctx.fillText(`Weaponsmithing ${currentProfileStats.professions.weaponsmithing.level}`, 854, 886);

      // ? Tailoring
      if (currentProfileStats.professions.tailoring.level == 132) {
        await bar(ctx, 140, 985, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 104, 957);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 370, 958 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 140, 985, Math.floor((currentProfileStats.professions.tailoring.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 104, 957);
        ctx.fillText(currentProfileStats.professions.tailoring.level + 1, 370, 958);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.tailoring.xpPercent}%`, 18 + 370, 958 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/tailoringIcon.png'), 104, 961);
      ctx.fillText(`Tailoring ${currentProfileStats.professions.tailoring.level}`, 168, 958);

      // ? Woodworking
      if (currentProfileStats.professions.woodworking.level == 132) {
        await bar(ctx, 483, 985, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 447, 957);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 713, 958 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 483, 985, Math.floor((currentProfileStats.professions.woodworking.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 447, 957);
        ctx.fillText(currentProfileStats.professions.woodworking.level + 1, 713, 958);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.woodworking.xpPercent}%`, 18 + 713, 958 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/woodworkingIcon.png'), 447, 961);
      ctx.fillText(`Woodworking ${currentProfileStats.professions.woodworking.level}`, 511, 958);

      // ? Armouring
      if (currentProfileStats.professions.armouring.level == 132) {
        await bar(ctx, 824, 985, 262, 28, hexToRgb(config.other.colors.blue));
        ctx.drawImage(professionsIconBackgroundMaxLevel, 791, 957);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Max Level', 18 + 1056, 958 + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
      } else {
        await bar(ctx, 824, 985, Math.floor((currentProfileStats.professions.armouring.xpPercent / 100) * 262), 28);
        ctx.drawImage(professionsIconBackground, 791, 957);
        ctx.fillText(currentProfileStats.professions.armouring.level + 1, 1056, 958);
        ctx.textAlign = 'right';
        ctx.fillText(`${currentProfileStats.professions.armouring.xpPercent}%`, 18 + 1056, 958 + 27);
        ctx.textAlign = 'left';
      }
      ctx.drawImage(await loadImage('src/assets/statsCommand/armouringIcon.png'), 791, 961);
      ctx.fillText(`Armouring ${currentProfileStats.professions.armouring.level}`, 854, 958);

      ctx.font = '32px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`WynnTools v${packageJson.version} - ${generateDate()} - Made by @kathund.`, 600, 1120, 1136);
      const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'image.png' });
      generateProfileImageCache.set(profileId, attachment);
      return attachment;
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
  }
}

async function generateGuild(guildData) {
  if (generateGuildCache.has(guildData.name)) {
    cacheMessage('Generate Guild', 'hit');
    return generateGuildCache.get(guildData.name);
  } else {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    var uuid = guildData.members.list.owner[0].uuid;
    var stats = await getStats(uuid);
    let statsY = 0;
    let memberX = 0;
    let onlineMemberX = 0;
    let territoriesX = 0;
    if (guildData.banner == undefined) {
      ctx.drawImage(
        await loadImage('src/assets/guildCommand/guildCommandBackground.png'),
        0,
        0,
        canvas.width,
        canvas.height
      );
      ctx.font = '64px Karla';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`[${guildData.prefix}] ${guildData.name}`, 64, 64);
      ctx.textBaseline = 'top';
      ctx.font = '32px Karla';
      ctx.textAlign = 'left';
      ctx.fillText('Owner - ', 64, 150);
      if (stats.rank.badge === 'TBA') {
        ctx.fillStyle = 'white';
        ctx.fillText(stats.username, 64 + ctx.measureText('Owner - ').width, 150);
      } else {
        const rankBadge = await loadImage(`https://cdn.wynncraft.com/${stats.rank.badge}`);
        const rankBadgeWidth = rankBadge.width * 3;
        const rankBadgeHeight = rankBadge.height * 3;
        ctx.drawImage(rankBadge, 64 + ctx.measureText('Owner - ').width, 150, rankBadgeWidth, rankBadgeHeight);
        ctx.fillStyle = stats.rank.colors.main;
        ctx.fillText(stats.username, 64 + ctx.measureText('Owner - ').width + rankBadgeWidth, 150);
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
      const textMember = `Members\n${guildData.members.total}/${getMaxMembers(guildData.level)}`;
      const textLinesMember = textMember.split('\n');
      ctx.fillText(textLinesMember[0], memberX, statsY);
      ctx.fillText(
        textLinesMember[1],
        memberX + (ctx.measureText(textLinesMember[0]).width - ctx.measureText(textLinesMember[1]).width) / 2,
        statsY + parseInt(ctx.font, 10)
      );
      const textOnlineMembers = `Online\n${guildData.members.online}/${guildData.members.total}`;
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
      ctx.fillText(`WynnTools v${packageJson.version} - ${generateDate()} - Made by @kathund.`, 600, 720, 1136);
      return canvas.toBuffer('image/png');
    } else {
      ctx.drawImage(
        await loadImage('src/assets/guildCommand/guildBannerCommandBackground.png'),
        0,
        0,
        canvas.width,
        canvas.height
      );
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
      ctx.fillText('Owner - ', 64, 150);
      if (stats.rank.badge === 'TBA') {
        ctx.fillStyle = 'white';
        ctx.fillText(stats.username, 64 + ctx.measureText('Owner - ').width, 150);
      } else {
        const rankBadge = await loadImage(`https://cdn.wynncraft.com/${stats.rank.badge}`);
        const rankBadgeWidth = rankBadge.width * 3;
        const rankBadgeHeight = rankBadge.height * 3;
        ctx.drawImage(rankBadge, 64 + ctx.measureText('Owner - ').width, 150 + 8, rankBadgeWidth, rankBadgeHeight);
        ctx.fillStyle = stats.rank.colors.main;
        ctx.fillText(stats.username, 64 + 8 + ctx.measureText('Owner - ').width + rankBadgeWidth, 150);
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
      const textMember = `Members\n${guildData.members.total}/${getMaxMembers(guildData.level)}`;
      const textLinesMember = textMember.split('\n');
      ctx.fillText(textLinesMember[0], memberX, statsY);
      ctx.fillText(
        textLinesMember[1],
        memberX + (ctx.measureText(textLinesMember[0]).width - ctx.measureText(textLinesMember[1]).width) / 2,
        statsY + parseInt(ctx.font, 10)
      );
      const textOnlineMembers = `Online\n${guildData.members.online}/${guildData.members.total}`;
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
      ctx.fillText(`WynnTools v${packageJson.version} - ${generateDate()} - Made by @kathund.`, 600, 720, 1136);
      var buffer = canvas.toBuffer('image/png');
      generateGuildCache.set(guildData.name, buffer);
      return buffer;
    }
  }
}

async function generateMemberJoin(data) {
  try {
    var member = data.user;
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
    ctx.fillText(`WynnTools v${packageJson.version} - ${generateDate()} - Made by @kathund.`, 600, 520, 1136);
    return canvas.toBuffer('image/png');
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
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
          await loadImage('src/assets/serverCommand/onlineIcon.png'),
          serversXY[i].circle.x,
          serversXY[i].circle.y,
          77.22,
          77.22
        );
      } else {
        ctx.drawImage(
          await loadImage('src/assets/serverCommand/offlineIcon.png'),
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
    ctx.fillText(`WynnTools v${packageJson.version} - ${generateDate()} - Made by @kathund.`, 600, 520, 1136);
    var buffer = canvas.toBuffer('image/png');
    return buffer;
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
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
                ticks: { fontColor: config.other.colors.white, fontSize: 16 },
                scaleLabel: {
                  display: true,
                  labelString: '# Time ago (H = hours, M = minutes)',
                  fontSize: 16,
                  fontColor: config.other.colors.white,
                  fontStyle: 'bold',
                },
              },
            ],
            yAxes: [
              {
                display: true,
                gridLines: { display: false },
                ticks: {
                  fontColor: config.other.colors.white,
                  min: Math.min(...playerCounts) - 3,
                  max: Math.max(...playerCounts) + 3,
                  fontSize: 16,
                },
                scaleLabel: {
                  display: true,
                  labelString: '# of Players',
                  fontSize: 16,
                  fontColor: config.other.colors.white,
                  fontStyle: 'bold',
                },
              },
            ],
          },
          legend: { labels: { fontColor: config.other.colors.white } },
        },
        plugins: {
          tooltip: { backgroundColor: config.other.colors.white, borderColor: config.other.colors.white },
        },
      })
      .setWidth(1136)
      .setHeight(428);
    return await chart.getShortUrl();
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
  }
}

function clearGenerateProfileImageCache() {
  try {
    cacheMessage('Generate Profile Image', 'Cleared');
    generateProfileImageCache.flushAll();
    return 'Cleared';
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function clearGenerateGuildCache() {
  try {
    cacheMessage('Generate Guild', 'Cleared');
    generateGuildCache.flushAll();
    return 'Cleared';
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

module.exports = {
  bar,
  generateProfileImage,
  generateGuild,
  generateMemberJoin,
  generateServers,
  generateServerChart,
  clearGenerateProfileImageCache,
  clearGenerateGuildCache,
};
