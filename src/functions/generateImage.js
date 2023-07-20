const { generateDate, getRelativeTime, getMaxMembers } = require('../helperFunctions.js');
const { getStats, getHighestProfile } = require('../api/wynnCraftAPI.js');
const { registerFont, createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

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

registerFont('src/fonts/Inter-Regular.ttf', {
  family: 'Inter Regular',
});

async function generateStats(uuid) {
  try {
    const canvas = createCanvas(1200, 1200);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(await loadImage('src/assets/statsCommandBackground.png'), 0, 0, canvas.width, canvas.height);

    var stats = await getStats(uuid);
    var currentProfileStats = stats.data.characters[await getHighestProfile(stats.data.characters)];

    // ! Player Icon
    // ? Get img and place it
    const img = await loadImage(`https://visage.surgeplay.com/head/256/${uuid}.png`);
    ctx.drawImage(img, 912, 32, 256, 256);

    // ! Player Info box
    // ? Username
    ctx.textBaseline = 'top';
    ctx.font = '36px Inter';
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
        62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width + ctx.measureText(']').width,
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
        62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width + ctx.measureText(']').width,
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
        62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width + ctx.measureText(']').width,
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
        62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width + ctx.measureText(']').width,
        52
      );
    } else {
      ctx.fillStyle = 'white';
      ctx.fillText(stats.username, 62, 52);
    }

    // ? Gamemodes

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

    ctx.font = '24px Inter';
    ctx.fillStyle = 'white';

    if (stats.data.guild.name != null) {
      ctx.font = '24px Inter';
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
      ctx.font = '24px Inter';
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

    // ! General Stats
    ctx.font = `22px Inter`;
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

    // ! Skill Points
    ctx.font = `22px Inter`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';

    var skillsY = 464;

    var StrengthX = 430;
    var DexterityX = 581;
    var IntelligenceX = 721;
    var DefenseX = 891;
    var AgilityX = 1055;

    // ? Strength
    const textStrength = `Strength\n${currentProfileStats.skills.strength}`;
    const textLinesStrength = textStrength.split('\n');
    ctx.fillText(textLinesStrength[0], StrengthX, skillsY);
    ctx.fillText(
      textLinesStrength[1],
      StrengthX + (ctx.measureText(textLinesStrength[0]).width - ctx.measureText(textLinesStrength[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ? Dexterity
    const textDexterity = `Dexterity\n${currentProfileStats.skills.dexterity}`;
    const textLinesDexterity = textDexterity.split('\n');
    ctx.fillText(textLinesDexterity[0], DexterityX, skillsY);
    ctx.fillText(
      textLinesDexterity[1],
      DexterityX + (ctx.measureText(textLinesDexterity[0]).width - ctx.measureText(textLinesDexterity[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ? Intelligence
    const textIntelligence = `Intelligence\n${currentProfileStats.skills.intelligence}`;
    const textLinesIntelligence = textIntelligence.split('\n');
    ctx.fillText(textLinesIntelligence[0], IntelligenceX, skillsY);
    ctx.fillText(
      textLinesIntelligence[1],
      IntelligenceX +
        (ctx.measureText(textLinesIntelligence[0]).width - ctx.measureText(textLinesIntelligence[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ? Defense
    const textDefense = `Defense\n${currentProfileStats.skills.defense}`;
    const textLinesDefense = textDefense.split('\n');
    ctx.fillText(textLinesDefense[0], DefenseX, skillsY);
    ctx.fillText(
      textLinesDefense[1],
      DefenseX + (ctx.measureText(textLinesDefense[0]).width - ctx.measureText(textLinesDefense[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ? Agility
    const textAgility = `Agility\n${currentProfileStats.skills.agility}`;
    const textLinesAgility = textAgility.split('\n');
    ctx.fillText(textLinesAgility[0], AgilityX, skillsY);
    ctx.fillText(
      textLinesAgility[1],
      AgilityX + (ctx.measureText(textLinesAgility[0]).width - ctx.measureText(textLinesAgility[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ! Professions
    ctx.font = `22px Inter`;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    const professionsIconBackground = await loadImage('src/assets/professionsIconBackground.svg');

    // ? Combat
    await bar(ctx, 140, 689, Math.floor((currentProfileStats.professions.combat.xp / 100) * 946), 28);
    ctx.drawImage(professionsIconBackground, 104, 661);
    ctx.drawImage(await loadImage('src/assets/combatIcon.png'), 108, 665);
    ctx.fillText(`Combat ${currentProfileStats.professions.combat.level}`, 168, 662);
    ctx.fillText(currentProfileStats.professions.combat.level + 1, 1056, 662);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.combat.xp}%`, 18 + 1056, 662 + 27);
    ctx.textAlign = 'left';
    // ? Mining
    await bar(ctx, 140, 769, Math.floor((currentProfileStats.professions.mining.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 104, 741);
    ctx.drawImage(await loadImage('src/assets/miningIcon.png'), 104, 745);
    ctx.fillText(`Mining ${currentProfileStats.professions.mining.level}`, 168, 742);
    ctx.fillText(currentProfileStats.professions.mining.level + 1, 370, 742);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.mining.xp}%`, 18 + 370, 742 + 27);
    ctx.textAlign = 'left';
    // ? Farming
    await bar(ctx, 483, 769, Math.floor((currentProfileStats.professions.farming.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 447, 741);
    ctx.drawImage(await loadImage('src/assets/farmingIcon.png'), 447, 745);
    ctx.fillText(`Farming ${currentProfileStats.professions.farming.level}`, 511, 742);
    ctx.fillText(currentProfileStats.professions.farming.level + 1, 713, 742);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.farming.xp}%`, 18 + 713, 742 + 27);
    ctx.textAlign = 'left';
    // ? Woodcutting
    await bar(ctx, 824, 769, Math.floor((currentProfileStats.professions.woodcutting.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 791, 741);
    ctx.drawImage(await loadImage('src/assets/woodcuttingIcon.png'), 791, 745);
    ctx.fillText(`Woodcutting ${currentProfileStats.professions.woodcutting.level}`, 854, 742);
    ctx.fillText(currentProfileStats.professions.woodcutting.level + 1, 1056, 742);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.woodcutting.xp}%`, 18 + 1056, 742 + 27);
    ctx.textAlign = 'left';
    // ? Fishing
    await bar(ctx, 140, 841, Math.floor((currentProfileStats.professions.fishing.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 104, 813);
    ctx.drawImage(await loadImage('src/assets/fishingIcon.png'), 104, 817);
    ctx.fillText(`Fishing ${currentProfileStats.professions.fishing.level}`, 168, 814);
    ctx.fillText(currentProfileStats.professions.fishing.level + 1, 370, 814);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.fishing.xp}%`, 18 + 370, 814 + 27);
    ctx.textAlign = 'left';
    // ? Scribing
    await bar(ctx, 483, 841, Math.floor((currentProfileStats.professions.scribing.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 447, 813);
    ctx.drawImage(await loadImage('src/assets/scribingIcon.png'), 447, 817);
    ctx.fillText(`Scribing ${currentProfileStats.professions.scribing.level}`, 511, 814);
    ctx.fillText(currentProfileStats.professions.scribing.level + 1, 713, 814);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.scribing.xp}%`, 18 + 713, 814 + 27);
    ctx.textAlign = 'left';
    // ? Jeweling
    await bar(ctx, 824, 841, Math.floor((currentProfileStats.professions.jeweling.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 791, 813);
    ctx.drawImage(await loadImage('src/assets/jewelingIcon.png'), 791, 817);
    ctx.fillText(`Jeweling ${currentProfileStats.professions.jeweling.level}`, 854, 814);
    ctx.fillText(currentProfileStats.professions.jeweling.level + 1, 1056, 814);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.jeweling.xp}%`, 18 + 1056, 814 + 27);
    ctx.textAlign = 'left';
    // ? Alchemism
    await bar(ctx, 140, 913, Math.floor((currentProfileStats.professions.alchemism.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 104, 885);
    ctx.drawImage(await loadImage('src/assets/alchemismIcon.png'), 104, 889);
    ctx.fillText(`Alchemism ${currentProfileStats.professions.alchemism.level}`, 168, 886);
    ctx.fillText(currentProfileStats.professions.alchemism.level + 1, 370, 886);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.alchemism.xp}%`, 18 + 370, 886 + 27);
    ctx.textAlign = 'left';
    // ? Cooking
    await bar(ctx, 483, 913, Math.floor((currentProfileStats.professions.cooking.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 447, 885);
    ctx.drawImage(await loadImage('src/assets/cookingIcon.png'), 447, 889);
    ctx.fillText(`Cooking ${currentProfileStats.professions.cooking.level}`, 511, 886);
    ctx.fillText(currentProfileStats.professions.cooking.level + 1, 713, 886);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.cooking.xp}%`, 18 + 713, 886 + 27);
    ctx.textAlign = 'left';
    // ? Weaponsmithing
    await bar(ctx, 824, 913, Math.floor((currentProfileStats.professions.weaponsmithing.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 791, 885);
    ctx.drawImage(await loadImage('src/assets/weaponsmithingIcon.png'), 791, 889);
    ctx.fillText(`Weaponsmithing ${currentProfileStats.professions.weaponsmithing.level}`, 854, 886);
    ctx.fillText(currentProfileStats.professions.weaponsmithing.level + 1, 1056, 886);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.weaponsmithing.xp}%`, 18 + 1056, 886 + 27);
    ctx.textAlign = 'left';
    // ? Tailoring
    await bar(ctx, 140, 985, Math.floor((currentProfileStats.professions.tailoring.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 104, 957);
    ctx.drawImage(await loadImage('src/assets/tailoringIcon.png'), 104, 961);
    ctx.fillText(`Tailoring ${currentProfileStats.professions.tailoring.level}`, 168, 958);
    ctx.fillText(currentProfileStats.professions.tailoring.level + 1, 370, 958);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.tailoring.xp}%`, 18 + 370, 958 + 27);
    ctx.textAlign = 'left';
    // ? Woodworking
    await bar(ctx, 483, 985, Math.floor((currentProfileStats.professions.woodworking.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 447, 957);
    ctx.drawImage(await loadImage('src/assets/woodworkingIcon.png'), 447, 961);
    ctx.fillText(currentProfileStats.professions.woodworking.level + 1, 713, 958);
    ctx.fillText(`Woodworking ${currentProfileStats.professions.woodworking.level}`, 511, 958);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.woodworking.xp}%`, 18 + 713, 958 + 27);
    ctx.textAlign = 'left';
    // ? Armouring
    await bar(ctx, 824, 985, Math.floor((currentProfileStats.professions.armouring.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 791, 957);
    ctx.drawImage(await loadImage('src/assets/armouringIcon.png'), 791, 961);
    ctx.fillText(`Armouring ${currentProfileStats.professions.armouring.level}`, 854, 958);
    ctx.fillText(currentProfileStats.professions.armouring.level + 1, 1056, 958);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.armouring.xp}%`, 18 + 1056, 958 + 27);
    ctx.textAlign = 'left';

    // ! Footer
    var packageJson = require('../../package.json');
    ctx.font = `32px Inter`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
      600,
      1120,
      1136
    );

    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), {
      name: 'image.png',
    });

    return attachment;
  } catch (error) {
    console.log(error);
  }
}

async function generateProfileImage(uuid, profileId) {
  try {
    const canvas = createCanvas(1200, 1200);
    const ctx = canvas.getContext('2d');

    registerFont('src/fonts/Inter-Regular.ttf', {
      family: 'Inter Regular',
    });

    ctx.drawImage(await loadImage('src/assets/statsCommandBackground.png'), 0, 0, canvas.width, canvas.height);

    var stats = await getStats(uuid);
    var currentProfileStats = stats.data.characters[profileId];

    // ! Player Icon
    // ? Get img and place it
    const img = await loadImage(`https://visage.surgeplay.com/head/256/${uuid}.png`);
    ctx.drawImage(img, 912, 32, 256, 256);

    // ! Player Info box
    // ? Username
    ctx.textBaseline = 'top';
    ctx.font = '36px Inter';
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
        62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width + ctx.measureText(']').width,
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
        62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width + ctx.measureText(']').width,
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
        62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width + ctx.measureText(']').width,
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
        62 + ctx.measureText('[').width + ctx.measureText(stats.data.meta.tag.value).width + ctx.measureText(']').width,
        52
      );
    } else {
      ctx.fillStyle = 'white';
      ctx.fillText(stats.username, 62, 52);
    }

    // ? Gamemodes

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

    ctx.font = '24px Inter';
    ctx.fillStyle = 'white';

    if (stats.data.guild.name != null) {
      ctx.font = '24px Inter';
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
      ctx.font = '24px Inter';
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

    // ! General Stats
    ctx.font = `22px Inter`;
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

    // ! Skill Points
    ctx.font = `22px Inter`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';

    var skillsY = 464;

    var StrengthX = 430;
    var DexterityX = 581;
    var IntelligenceX = 721;
    var DefenseX = 891;
    var AgilityX = 1055;

    // ? Strength
    const textStrength = `Strength\n${currentProfileStats.skills.strength}`;
    const textLinesStrength = textStrength.split('\n');
    ctx.fillText(textLinesStrength[0], StrengthX, skillsY);
    ctx.fillText(
      textLinesStrength[1],
      StrengthX + (ctx.measureText(textLinesStrength[0]).width - ctx.measureText(textLinesStrength[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ? Dexterity
    const textDexterity = `Dexterity\n${currentProfileStats.skills.dexterity}`;
    const textLinesDexterity = textDexterity.split('\n');
    ctx.fillText(textLinesDexterity[0], DexterityX, skillsY);
    ctx.fillText(
      textLinesDexterity[1],
      DexterityX + (ctx.measureText(textLinesDexterity[0]).width - ctx.measureText(textLinesDexterity[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ? Intelligence
    const textIntelligence = `Intelligence\n${currentProfileStats.skills.intelligence}`;
    const textLinesIntelligence = textIntelligence.split('\n');
    ctx.fillText(textLinesIntelligence[0], IntelligenceX, skillsY);
    ctx.fillText(
      textLinesIntelligence[1],
      IntelligenceX +
        (ctx.measureText(textLinesIntelligence[0]).width - ctx.measureText(textLinesIntelligence[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ? Defense
    const textDefense = `Defense\n${currentProfileStats.skills.defense}`;
    const textLinesDefense = textDefense.split('\n');
    ctx.fillText(textLinesDefense[0], DefenseX, skillsY);
    ctx.fillText(
      textLinesDefense[1],
      DefenseX + (ctx.measureText(textLinesDefense[0]).width - ctx.measureText(textLinesDefense[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ? Agility
    const textAgility = `Agility\n${currentProfileStats.skills.agility}`;
    const textLinesAgility = textAgility.split('\n');
    ctx.fillText(textLinesAgility[0], AgilityX, skillsY);
    ctx.fillText(
      textLinesAgility[1],
      AgilityX + (ctx.measureText(textLinesAgility[0]).width - ctx.measureText(textLinesAgility[1]).width) / 2,
      470 + parseInt(ctx.font, 10)
    );

    // ! Professions
    ctx.font = `22px Inter`;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    const professionsIconBackground = await loadImage('src/assets/professionsIconBackground.svg');

    // ? Combat
    await bar(ctx, 140, 689, Math.floor((currentProfileStats.professions.combat.xp / 100) * 946), 28);
    ctx.drawImage(professionsIconBackground, 104, 661);
    ctx.drawImage(await loadImage('src/assets/combatIcon.png'), 108, 665);
    ctx.fillText(`Combat ${currentProfileStats.professions.combat.level}`, 168, 662);
    ctx.fillText(currentProfileStats.professions.combat.level + 1, 1056, 662);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.combat.xp}%`, 18 + 1056, 662 + 27);
    ctx.textAlign = 'left';
    // ? Mining
    await bar(ctx, 140, 769, Math.floor((currentProfileStats.professions.mining.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 104, 741);
    ctx.drawImage(await loadImage('src/assets/miningIcon.png'), 104, 745);
    ctx.fillText(`Mining ${currentProfileStats.professions.mining.level}`, 168, 742);
    ctx.fillText(currentProfileStats.professions.mining.level + 1, 370, 742);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.mining.xp}%`, 18 + 370, 742 + 27);
    ctx.textAlign = 'left';
    // ? Farming
    await bar(ctx, 483, 769, Math.floor((currentProfileStats.professions.farming.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 447, 741);
    ctx.drawImage(await loadImage('src/assets/farmingIcon.png'), 447, 745);
    ctx.fillText(`Farming ${currentProfileStats.professions.farming.level}`, 511, 742);
    ctx.fillText(currentProfileStats.professions.farming.level + 1, 713, 742);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.farming.xp}%`, 18 + 713, 742 + 27);
    ctx.textAlign = 'left';
    // ? Woodcutting
    await bar(ctx, 824, 769, Math.floor((currentProfileStats.professions.woodcutting.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 791, 741);
    ctx.drawImage(await loadImage('src/assets/woodcuttingIcon.png'), 791, 745);
    ctx.fillText(`Woodcutting ${currentProfileStats.professions.woodcutting.level}`, 854, 742);
    ctx.fillText(currentProfileStats.professions.woodcutting.level + 1, 1056, 742);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.woodcutting.xp}%`, 18 + 1056, 742 + 27);
    ctx.textAlign = 'left';
    // ? Fishing
    await bar(ctx, 140, 841, Math.floor((currentProfileStats.professions.fishing.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 104, 813);
    ctx.drawImage(await loadImage('src/assets/fishingIcon.png'), 104, 817);
    ctx.fillText(`Fishing ${currentProfileStats.professions.fishing.level}`, 168, 814);
    ctx.fillText(currentProfileStats.professions.fishing.level + 1, 370, 814);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.fishing.xp}%`, 18 + 370, 814 + 27);
    ctx.textAlign = 'left';
    // ? Scribing
    await bar(ctx, 483, 841, Math.floor((currentProfileStats.professions.scribing.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 447, 813);
    ctx.drawImage(await loadImage('src/assets/scribingIcon.png'), 447, 817);
    ctx.fillText(`Scribing ${currentProfileStats.professions.scribing.level}`, 511, 814);
    ctx.fillText(currentProfileStats.professions.scribing.level + 1, 713, 814);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.scribing.xp}%`, 18 + 713, 814 + 27);
    ctx.textAlign = 'left';
    // ? Jeweling
    await bar(ctx, 824, 841, Math.floor((currentProfileStats.professions.jeweling.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 791, 813);
    ctx.drawImage(await loadImage('src/assets/jewelingIcon.png'), 791, 817);
    ctx.fillText(`Jeweling ${currentProfileStats.professions.jeweling.level}`, 854, 814);
    ctx.fillText(currentProfileStats.professions.jeweling.level + 1, 1056, 814);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.jeweling.xp}%`, 18 + 1056, 814 + 27);
    ctx.textAlign = 'left';
    // ? Alchemism
    await bar(ctx, 140, 913, Math.floor((currentProfileStats.professions.alchemism.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 104, 885);
    ctx.drawImage(await loadImage('src/assets/alchemismIcon.png'), 104, 889);
    ctx.fillText(`Alchemism ${currentProfileStats.professions.alchemism.level}`, 168, 886);
    ctx.fillText(currentProfileStats.professions.alchemism.level + 1, 370, 886);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.alchemism.xp}%`, 18 + 370, 886 + 27);
    ctx.textAlign = 'left';
    // ? Cooking
    await bar(ctx, 483, 913, Math.floor((currentProfileStats.professions.cooking.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 447, 885);
    ctx.drawImage(await loadImage('src/assets/cookingIcon.png'), 447, 889);
    ctx.fillText(`Cooking ${currentProfileStats.professions.cooking.level}`, 511, 886);
    ctx.fillText(currentProfileStats.professions.cooking.level + 1, 713, 886);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.cooking.xp}%`, 18 + 713, 886 + 27);
    ctx.textAlign = 'left';
    // ? Weaponsmithing
    await bar(ctx, 824, 913, Math.floor((currentProfileStats.professions.weaponsmithing.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 791, 885);
    ctx.drawImage(await loadImage('src/assets/weaponsmithingIcon.png'), 791, 889);
    ctx.fillText(`Weaponsmithing ${currentProfileStats.professions.weaponsmithing.level}`, 854, 886);
    ctx.fillText(currentProfileStats.professions.weaponsmithing.level + 1, 1056, 886);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.weaponsmithing.xp}%`, 18 + 1056, 886 + 27);
    ctx.textAlign = 'left';
    // ? Tailoring
    await bar(ctx, 140, 985, Math.floor((currentProfileStats.professions.tailoring.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 104, 957);
    ctx.drawImage(await loadImage('src/assets/tailoringIcon.png'), 104, 961);
    ctx.fillText(`Tailoring ${currentProfileStats.professions.tailoring.level}`, 168, 958);
    ctx.fillText(currentProfileStats.professions.tailoring.level + 1, 370, 958);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.tailoring.xp}%`, 18 + 370, 958 + 27);
    ctx.textAlign = 'left';
    // ? Woodworking
    await bar(ctx, 483, 985, Math.floor((currentProfileStats.professions.woodworking.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 447, 957);
    ctx.drawImage(await loadImage('src/assets/woodworkingIcon.png'), 447, 961);
    ctx.fillText(currentProfileStats.professions.woodworking.level + 1, 713, 958);
    ctx.fillText(`Woodworking ${currentProfileStats.professions.woodworking.level}`, 511, 958);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.woodworking.xp}%`, 18 + 713, 958 + 27);
    ctx.textAlign = 'left';
    // ? Armouring
    await bar(ctx, 824, 985, Math.floor((currentProfileStats.professions.armouring.xp / 100) * 262), 28);
    ctx.drawImage(professionsIconBackground, 791, 957);
    ctx.drawImage(await loadImage('src/assets/armouringIcon.png'), 791, 961);
    ctx.fillText(`Armouring ${currentProfileStats.professions.armouring.level}`, 854, 958);
    ctx.fillText(currentProfileStats.professions.armouring.level + 1, 1056, 958);
    ctx.textAlign = 'right';
    ctx.fillText(`${currentProfileStats.professions.armouring.xp}%`, 18 + 1056, 958 + 27);
    ctx.textAlign = 'left';

    // ! Footer
    var packageJson = require('../../package.json');
    ctx.font = `32px Inter`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `WynnTools v${packageJson.version} - ${generateDate()} - Made by @${packageJson.author}`,
      600,
      1120,
      1136
    );
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.log(error);
  }
}

async function generateGuild(guildData) {
  const canvas = createCanvas(1200, 800);
  const ctx = canvas.getContext('2d');

  registerFont('src/fonts/Inter-Regular.ttf', {
    family: 'Inter Regular',
  });
  var uuid = Object.values(guildData.members.OWNER)[0].uuid;
  var stats = await getStats(uuid);

  let statsY = 0;
  let memberX = 0;
  let onlineMemberX = 0;
  let territoriesX = 0;

  var packageJson = require('../../package.json');

  if (guildData.banner == undefined) {
    ctx.drawImage(await loadImage('src/assets/guildCommandBackground.png'), 0, 0, canvas.width, canvas.height);

    // ! Stats
    // ? name/tag
    ctx.font = '64px Inter';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`[${guildData.prefix}] ${guildData.name}`, 64, 64);

    // ? Owner
    ctx.textBaseline = 'top';
    ctx.font = '32px Inter';
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

    ctx.font = `24px Inter`;
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
    ctx.font = `22px Inter`;
    ctx.fillText(`Level - ${guildData.level}`, 80, 234);
    ctx.fillText(`${guildData.xp}%`, 1058, 234);

    // ! Members
    statsY = 530;
    memberX = 162;
    onlineMemberX = 578.22;
    territoriesX = 916;
    ctx.font = `32px Inter`;
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

    ctx.font = `32px Inter`;
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
    console.log(guildData.fixedNamed);
    ctx.drawImage(
      await loadImage(`https://wynn-guild-banner.toki317.dev/banners/${guildData.fixedNamed}`),
      986,
      64,
      150,
      300
    );

    // ! Stats
    // ? name/tag
    ctx.font = '64px Inter';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`[${guildData.prefix}] ${guildData.name}`, 64, 64);

    // ? Owner
    ctx.textBaseline = 'top';
    ctx.font = '32px Inter';
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

    ctx.font = `24px Inter`;
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
    ctx.font = `22px Inter`;
    ctx.fillText(`Level - ${guildData.level}`, 80, 234);
    ctx.fillText(`${guildData.xp}%`, 868, 234);

    // ! Members
    statsY = 530;
    memberX = 162;
    onlineMemberX = 505.5;
    territoriesX = 816;
    ctx.font = `32px Inter`;
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

    ctx.font = `32px Inter`;
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
  }
}

module.exports = {
  bar,
  generateStats,
  generateProfileImage,
  generateGuild,
};
