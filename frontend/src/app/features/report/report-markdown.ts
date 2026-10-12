function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(value: string): string {
  const linked = escapeHtml(value).replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return linked
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
}

function isDividerRow(line: string): boolean {
  return /^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => inline(cell.trim()));
}

function renderTable(rows: string[]): string {
  const body = rows.filter((row) => !isDividerRow(row));
  if (!body.length) {
    return '';
  }
  const head = tableCells(body[0]);
  const rest = body.slice(1).map((row) => tableCells(row));
  const headHtml = head.map((cell) => `<th>${cell}</th>`).join('');
  const bodyHtml = rest
    .map((cells) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .join('');
  return `<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

export function renderReportMarkdown(source: string): string {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (isTableRow(trimmed)) {
      const rows: string[] = [];
      while (index < lines.length && isTableRow(lines[index].trim())) {
        rows.push(lines[index].trim());
        index += 1;
      }
      blocks.push(renderTable(rows));
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(inline(lines[index].trim().replace(/^[-*]\s+/, '')));
        index += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(inline(lines[index].trim().replace(/^\d+\.\s+/, '')));
        index += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`);
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`);
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push('<hr>');
      index += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('#') &&
      !lines[index].trim().startsWith('```') &&
      !isTableRow(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith('>')
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }

  return blocks.join('');
}
