// Line icons for the pillars, in the style of the programme slide
// (white strokes inside a circle). CONFIG.PILLARS[].icon picks one by name.
const SVG_NS = 'http://www.w3.org/2000/svg';

export const ICONS = {
  // Quality as Enabler: clapperboard ("action!")
  clapper: [
    'M4 10h16v9.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5z',
    'M3.6 6.4l15.5-3 .8 3.7-15.5 3z',
    'M7.4 5.7l1.9 3.2 M11.3 4.9l1.9 3.3 M15.2 4.2l1.9 3.2',
    'M8 13.5h8v3H8z',
  ],
  // Building Trust: handshake
  handshake: [
    'M2 8.5l3-1.5 2.5 1 M22 8.5l-3-1.5-3.5 1',
    'M2 8.5v6l2 .5 M22 8.5v6l-2.2.6',
    'M15.5 8l-4.3 1.7a1.3 1.3 0 0 0 .9 2.4l2.4-.7 4.3 3.9a1.1 1.1 0 0 1-1.5 1.6',
    'M19.8 15.1l-.4.3 M17.3 16.9l-1.9-1.6 M15.6 18.1l-1.9-1.6 M13.6 19.1l-1.3-1.1',
    'M4 15l2.7 2.6a1 1 0 0 0 1.5-1.3 1 1 0 0 0 1.5 1.3 1 1 0 0 0 1.6 1.2 1 1 0 0 0 1.7.4l.9-.3',
    'M7.5 8l2.3-.9',
  ],
  // Efficiency & Speed: lightning bolt with speed lines
  bolt: [
    'M13.5 2.5L6.5 13h5l-1.5 8.5 7.5-11h-5z',
    'M2.5 9h3 M1.5 12.5h3 M2.5 16h3',
  ],
  // Quality Driving Innovation: light bulb with a gear
  bulb: [
    'M9 17.5h6 M9.6 20h4.8 M10.8 22h2.4',
    'M9 17.5c0-2-3-3.4-3-7a6 6 0 0 1 12 0c0 3.6-3 5-3 7',
    'M12 8.2v1 M12 12.8v1 M9.2 11h1 M13.8 11h1 M10 9l.7.7 M13.3 12.3l.7.7 M14 9l-.7.7 M10.7 12.3l-.7.7',
    'M12 12.3a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z',
    'M12 1v1 M4.2 3.5l.8.7 M19.8 3.5l-.8.7 M1.5 10.5h1.2 M21.3 10.5h1.2',
  ],
};

/** <svg> line icon, stroke = currentColor. */
export function iconSvg(name, cls = 'pillar-icon') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', cls);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  (ICONS[name] || []).forEach((d) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  });
  return svg;
}

/** Draws an icon on a canvas, centred at (cx, cy), `size` px wide. */
export function drawIcon(ctx, name, cx, cy, size, color, lineWidth = 1.2) {
  const s = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  (ICONS[name] || []).forEach((d) => ctx.stroke(new Path2D(d)));
  ctx.restore();
}

/** Fallback emblem (used when assets/logo.png is missing): a glowing Q whose tail
 *  becomes a rising arrow, echoing the programme visual. Returns SVG markup. */
export const Q_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
<defs>
<radialGradient id="g" cx="40%" cy="45%" r="60%"><stop offset="0" stop-color="#7fd0ff" stop-opacity=".55"/><stop offset="1" stop-color="#2797d3" stop-opacity="0"/></radialGradient>
<linearGradient id="q" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f6ff"/><stop offset=".45" stop-color="#6cc4f2"/><stop offset="1" stop-color="#1f5fd1"/></linearGradient>
<linearGradient id="a" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2797d3" stop-opacity="0"/><stop offset=".5" stop-color="#8fd6ff"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
</defs>
<circle cx="40" cy="44" r="38" fill="url(#g)"/>
<circle cx="40" cy="42" r="21" fill="none" stroke="url(#q)" stroke-width="10"/>
<path d="M44 50l14 16" stroke="url(#q)" stroke-width="10" stroke-linecap="round"/>
<path d="M8 86C34 82 60 62 80 24" fill="none" stroke="url(#a)" stroke-width="5" stroke-linecap="round"/>
<path d="M70 26l12-8 1 14" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
export const Q_MARK_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(Q_MARK_SVG);
