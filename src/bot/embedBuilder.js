const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require('discord.js');
const { renderSessionBanner } = require('./stampRenderer');
const { embed: T, channel: C } = require('./phrases');

// Embed field values are capped at 1024 chars: show as many mentions as fit, then "+N"
function joinMentions(ids, prefix = '') {
  const LIMIT = 1000;
  const parts = [];
  let length = 0;
  for (let i = 0; i < ids.length; i++) {
    const item = `${prefix}<@${ids[i]}>`;
    const remaining = ids.length - i - 1;
    const reserve = remaining > 0 ? 12 : 0;
    if (length + item.length + 2 + reserve > LIMIT) {
      parts.push(`… +${ids.length - i}`);
      break;
    }
    parts.push(item);
    length += item.length + 2;
  }
  return parts.join(', ') || T.none;
}

function buildSessionMessagePayload(session, roster, webBaseUrl = 'https://valobot.example.com') {
  const partySize = session.partySize || 5;
  const isCancelled = session.status === 'cancelled';
  const isLocked = session.status === 'locked';
  // Votes stay open after the deadline until the real match time
  const votingClosed = isCancelled || Boolean(session.partyStartSent) ||
    (isLocked && Date.now() >= session.partyTimestamp);

  const partyUnix = Math.floor(session.partyTimestamp / 1000);
  const deadlineUnix = Math.floor(session.voteDeadlineTimestamp / 1000);

  // Generate dynamic canvas banner with timestamped filename to bust Discord client cache
  const bannerBuffer = renderSessionBanner(session, roster, isCancelled);
  const bannerFileName = `valo_banner_${Date.now()}.png`;
  const bannerAttachment = new AttachmentBuilder(bannerBuffer, { name: bannerFileName });

  // Embed Color
  let embedColor = 0xff4655; // Valorant Red
  if (isCancelled) embedColor = 0x2b141a; // Dark cancelled red
  else if (isLocked) embedColor = 0xf5a623; // Amber
  else if (roster.team1.length >= partySize) embedColor = 0x00f59b; // Mint green (ready!)

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setImage(`attachment://${bannerFileName}`);

  // Title
  if (isCancelled) {
    embed.setTitle(T.titleCancelled(partySize));
  } else if (votingClosed) {
    embed.setTitle(T.titleStarted(partySize));
  } else if (isLocked) {
    embed.setTitle(T.titleLocked(partySize));
  } else {
    embed.setTitle(T.titleOpen(partySize));
  }

  // Description
  const roleMention = session.targetRole?.id && session.targetRole.id !== 'everyone' ?
    `<@&${session.targetRole.id}>` :
    '@everyone';

  let desc = T.header(roleMention, session.creator.id, session.note || C.defaultNote);

  if (isCancelled) {
    if (session.cancelReason === 'not_enough_players') {
      desc += T.cancelledAuto;
    } else {
      const byUser = session.cancelledBy && /^\d+$/.test(session.cancelledBy.id) ? `<@${session.cancelledBy.id}>` : C.theHost;
      desc += T.cancelledBy(byUser);
    }
  } else if (votingClosed) {
    desc += T.started;
  } else if (isLocked) {
    desc += T.locked;
  }

  embed.setDescription(desc);

  // Time & Status fields
  embed.addFields(
    {
      name: T.fieldStart,
      value: `<t:${partyUnix}:t> (<t:${partyUnix}:R>)\n${T.hostSaid(session.partyTime)}`,
      inline: true
    },
    {
      name: T.fieldDeadline,
      value: `<t:${deadlineUnix}:t> (<t:${deadlineUnix}:R>)\n${T.hostSaid(session.voteDeadline)}`,
      inline: true
    },
    {
      name: T.fieldSquad,
      value: T.squadValue(roster.team1.length, partySize),
      inline: true
    }
  );

  // Team 1 Lineup
  const team1Lines = [];
  for (let i = 0; i < partySize; i++) {
    const member = roster.team1[i];
    if (member) {
      const isCreator = member.userId === session.creator.id;
      const isFiller = member.status === 'if_last';
      const isBackup = member.status === 'backup';
      const badge = isCreator ? T.badgeHost : (isFiller ? T.badgeFiller : (isBackup ? T.badgeBackup : ''));
      team1Lines.push(`**${i + 1}.** 🟢 <@${member.userId}>${badge}`);
    } else {
      team1Lines.push(`**${i + 1}.** ⚪ ${T.freeSpotTeam1(i + 1)}`);
    }
  }
  embed.addFields({
    name: T.team1Name(roster.team1.length, partySize),
    value: team1Lines.join('\n') || T.team1Empty,
    inline: false
  });

  // Team 2 Lineup (if exists!)
  if (roster.team2 && roster.team2.length > 0) {
    const team2Lines = [];
    for (let i = 0; i < partySize; i++) {
      const member = roster.team2[i];
      if (member) {
        team2Lines.push(`**${i + 1}.** 🟢 <@${member.userId}>`);
      } else {
        team2Lines.push(`**${i + 1}.** ⚪ ${T.freeSpot}`);
      }
    }
    embed.addFields({
      name: T.team2Name(roster.team2.length, partySize),
      value: team2Lines.join('\n'),
      inline: false
    });
  }

  // Backup Queue
  if (roster.backups && roster.backups.length > 0) {
    const backupValue = joinMentions(roster.backups.map(m => m.userId), '🟠 ');
    embed.addFields({
      name: T.backups(roster.backups.length),
      value: backupValue,
      inline: true
    });
  }

  // Maybe list
  if (roster.maybes && roster.maybes.length > 0) {
    const maybeValue = joinMentions(roster.maybes.map(m => m.userId), '🟡 ');
    embed.addFields({
      name: T.maybes(roster.maybes.length),
      value: maybeValue,
      inline: true
    });
  }

  // If a Last list (unassigned)
  if (roster.ifLastUnassigned && roster.ifLastUnassigned.length > 0) {
    const ifLastValue = joinMentions(roster.ifLastUnassigned.map(m => m.userId), '🟣 ');
    embed.addFields({
      name: T.ifLast(roster.ifLastUnassigned.length),
      value: ifLastValue,
      inline: true
    });
  }

  // Declined list
  if (roster.declined && roster.declined.length > 0) {
    const noValue = joinMentions(roster.declined.map(m => m.userId), '🔴 ');
    embed.addFields({
      name: T.declined(roster.declined.length),
      value: noValue,
      inline: true
    });
  }

  // Unresponsive / Didn't respond list
  if (roster.unresponsive && roster.unresponsive.length > 0) {
    const shown = joinMentions(roster.unresponsive);
    embed.addFields({
      name: T.unresponsive(roster.unresponsive.length),
      value: shown,
      inline: false
    });
  }

  embed.setFooter({
    text: T.footer(session.id)
  });
  embed.setTimestamp(new Date(session.createdAt));

  // Interactive Buttons
  const components = [];

  // Voting Row
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`vote_sure_${session.id}`)
      .setLabel(T.btnSure)
      .setStyle(ButtonStyle.Success)
      .setEmoji('🔥')
      .setDisabled(votingClosed),
    new ButtonBuilder()
      .setCustomId(`vote_maybe_${session.id}`)
      .setLabel(T.btnMaybe)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🤞')
      .setDisabled(votingClosed),
    new ButtonBuilder()
      .setCustomId(`vote_if_last_${session.id}`)
      .setLabel(T.btnIfLast)
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🦸')
      .setDisabled(votingClosed),
    new ButtonBuilder()
      .setCustomId(`vote_backup_${session.id}`)
      .setLabel(T.btnBackup)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🎒')
      .setDisabled(votingClosed),
    new ButtonBuilder()
      .setCustomId(`vote_no_${session.id}`)
      .setLabel(T.btnNo)
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🏃')
      .setDisabled(votingClosed)
  );

  // Management & Dashboard Row
  const statsEnabled = Boolean(process.env.HENRIK_API_KEY) && votingClosed && !isCancelled;
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`vote_remove_${session.id}`)
      .setLabel(T.btnRemove)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🗑️')
      .setDisabled(votingClosed),
    new ButtonBuilder()
      .setCustomId(`cancel_session_${session.id}`)
      .setLabel(isCancelled ? T.btnCancelled : T.btnCancel)
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🙅')
      .setDisabled(isCancelled),
    ...(statsEnabled ? [
      new ButtonBuilder()
        .setCustomId(`result_${session.id}`)
        .setLabel(T.btnResults)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊')
    ] : []),
    new ButtonBuilder()
      .setLabel(T.btnDashboard)
      .setStyle(ButtonStyle.Link)
      .setURL(`${webBaseUrl.replace(/\/$/, '')}/#session-${session.id}`)
      .setEmoji('🌐')
  );

  components.push(row1, row2);

  return {
    embeds: [embed],
    components,
    files: [bannerAttachment],
    attachments: [] // Important: clears previous attachments on message.edit
  };
}

module.exports = {
  buildSessionMessagePayload
};
