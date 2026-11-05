// Renders one image with, for each player, the agents they played stacked inline (one icon per game).
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const ICON = 64;
const GAP = 8;
const ROW_H = ICON + 24;
const LABEL_W = 210;
const PAD = 16;
const FETCH_TIMEOUT_MS = 6000;
const FONT = '"DejaVu Sans", "Liberation Sans", "Noto Sans", Arial, sans-serif';

const iconCache = new Map();

async function getIcon(url) {
  if (!url) return null;
  if (iconCache.has(url)) return iconCache.get(url);
  const pending = (async () => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!res.ok) return null;
      return await loadImage(Buffer.from(await res.arrayBuffer()));
    } catch {
      return null;
    }
  })();
  iconCache.set(url, pending);
  const img = await pending;
  if (!img) iconCache.delete(url); // retry next time
  return img;
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

/**
 * rows: [{ label: string, games: [{ iconUrl: string|null, agent: string, won: boolean|null }] }]
 * Returns a PNG buffer, or null when there is nothing to draw.
 */
async function renderAgentsImage(rows) {
  const drawable = rows.filter(r => r.games.length > 0);
  if (drawable.length === 0) return null;

  const maxGames = Math.max(...drawable.map(r => r.games.length));
  const width = PAD * 2 + LABEL_W + maxGames * (ICON + GAP) - GAP;
  const height = PAD * 2 + drawable.length * ROW_H;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f1923';
  ctx.fillRect(0, 0, width, height);

  for (let r = 0; r < drawable.length; r++) {
    const { label, games } = drawable[r];
    const y = PAD + r * ROW_H;

    ctx.fillStyle = r % 2 === 0 ? '#142230' : '#0f1923';
    ctx.fillRect(0, y - 4, width, ROW_H);

    ctx.fillStyle = '#ece8e1';
    ctx.font = `bold 18px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(fitText(ctx, label, LABEL_W - 12), PAD, y + ICON / 2);

    const icons = await Promise.all(games.map(g => getIcon(g.iconUrl)));
    games.forEach((g, i) => {
      const x = PAD + LABEL_W + i * (ICON + GAP);
      const accent = g.won === true ? '#00f59b' : (g.won === false ? '#ff4655' : '#8a8f98');

      ctx.fillStyle = '#1c2b3a';
      ctx.fillRect(x, y, ICON, ICON);
      if (icons[i]) {
        ctx.drawImage(icons[i], x, y, ICON, ICON);
      } else {
        ctx.fillStyle = '#ece8e1';
        ctx.font = `bold 12px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText(fitText(ctx, g.agent || '?', ICON - 6), x + ICON / 2, y + ICON / 2);
        ctx.textAlign = 'left';
      }
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 1.5, y + 1.5, ICON - 3, ICON - 3);
    });
  }

  return canvas.encode('png');
}

module.exports = { renderAgentsImage };
