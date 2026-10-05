/**
 * Parses WhatsApp chat export (.txt) into structured resources JSON.
 * Usage: node scripts/process-chat.js [inputPath] [outputPath]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_INPUT = path.join(process.env.HOME || '', 'Downloads/mentoring.txt');
const DEFAULT_OUTPUT = path.join(__dirname, '../src/data/resources.json');
const DEFAULT_META_OUTPUT = path.join(__dirname, '../src/data/meta.json');

const MESSAGE_HEADER =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2})\s+-\s+(.+)$/;

const SYSTEM_PATTERNS = [
  /^Messages and calls are end-to-end encrypted/i,
  /^You created group/i,
  /^You changed/i,
  /^You added /i,
  /^You deleted this message/i,
  /^‎.*‎ left$/i,
  /^‎.*‎ joined/i,
  /^Your security code with/i,
  /^<Media omitted>/i,
  /^This message was deleted/i,
  /^Waiting for this message/i,
  /^You removed /i,
  /^You were added/i,
];

const CATEGORIES = {
  interviews: 'ראיונות עבודה',
  jobs: 'משרות',
  cv: 'קורות חיים ו-LinkedIn',
  dev: 'פיתוח תוכנה',
  ai: 'AI וכלי AI',
  github: 'GitHub ופרויקטים',
  career: 'קריירה',
  learning: 'למידה וקורסים',
  events: 'אירועים וכנסים',
  video: 'סרטונים ופודקאסטים',
  tools: 'כלים ואתרים',
  other: 'אחר',
};

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'ref_url',
  'si',
  'feature',
  'share_id',
  'mibextid',
  'rcm',
  'stkn',
  'is',
  'slug',
  'user_id',
  'sec_user_id',
  'u_code',
  'share_iid',
  'share_link_id',
  '_d',
  '_r',
  'preview_pb',
  'sharer_language',
  'timestamp',
  'item_author_type',
  'social_share_type',
  'share_app_id',
  'ugbiz_name',
  'ug_btm',
  'enable_checksum',
  'link_reflow_popup_iteration_sharer',
  'ouid',
  'dashcommenturn',
  'share_item_id',
  'source',
]);

const URL_REGEX =
  /https?:\/\/[^\s<>"')\]]+/gi;

type CategoryKey = keyof typeof CATEGORIES;

interface ChatMessage {
  date: Date;
  dateISO: string;
  sender: string;
  body: string;
}

interface ResourceShare {
  date: string;
  snippet: string;
}

interface Resource {
  id: string;
  url: string;
  title: string;
  description: string;
  originalMessage: string;
  firstShareDate: string;
  latestShareDate: string;
  domain: string;
  platform: string;
  contentType: string;
  category: string;
  categoryKey: CategoryKey;
  tags: string[];
  shareCount: number;
  shares: ResourceShare[];
}

function parseWhatsAppDate(dateStr: string, timeStr: string): Date {
  const [month, day, yearPart] = dateStr.split('/').map((p) => parseInt(p, 10));
  let year = yearPart;
  if (year < 100) year += 2000;
  const [hours, minutes] = timeStr.split(':').map((p) => parseInt(p, 10));
  return new Date(year, month - 1, day, hours, minutes);
}

const GROUP_MEMBER_LABEL = 'חבר/ה בקבוצה';

function anonymizeSender(sender: string): string {
  const s = sender.trim();
  if (s === 'You') return 'מנהל/ת הקבוצה';
  return GROUP_MEMBER_LABEL;
}

function stripPhoneNumbers(text: string): string {
  return text
    .replace(/\+972[\s-]?\d[\d\s-]{7,}/g, '[מספר הוסר]')
    .replace(/\b0\d{1,2}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[מספר הוסר]');
}

/** Redact WhatsApp @mentions, emails, phone numbers, and self-intro lines from message text. */
function scrubPiiFromText(text: string): string {
  return stripPhoneNumbers(text)
    .replace(/\s*<This message was edited>\s*/gi, '')
    .replace(/@\u2068[^\u2069]+\u2069/g, GROUP_MEMBER_LABEL)
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[אימייל הוסר]')
    .replace(/מכיר אישית את [\u0590-\u05FF]+/g, 'מכיר אישית את [שם הוסר]')
    .replace(/דברו איתי/g, 'המשיכו בקבוצה')
    .replace(/כמו ש[\u0590-\u05FF]{2,12}(?: ו[\u0590-\u05FF]{2,12}){0,2}/g, 'כמו שחברים בקבוצה')
    .replace(/תשלחו לי הודעה[^.\n]*/g, 'עדכנו בקבוצה')
    .replace(/מוזמנים לשלוח לי הודעה/g, 'מוזמנים לעדכן בקבוצה')
    .replace(/שלחו לי אם זה רלוונטי/g, 'עדכנו בקבוצה אם זה רלוונטי')
    .replace(/מוזמנים לשלוח לי אם זה רלוונטי/g, 'מוזמנים לעדכן בקבוצה אם זה רלוונטי')
    .replace(/בחברה הקודמת שלי/g, 'בחברה קודמת')
    .replace(/יש לי מישהו להעביר דרכו קוח/g, 'יש אפשרות להפניה')
    .replace(/זכיתי לתת הרצאה[\s\S]{0,400}/g, '[פרטים אישיים הוסרו]')
    .replace(/היום העליתי פוסט[^\n]*/g, '[פרטים אישיים הוסרו]')
    .replace(/^אני [\u0590-\u05FF][^\n]{8,200}$/gm, (line) =>
      /מפתח|עובד|בצבא|Insurance|DevEx|מתל|מאז|גר ב|חברה/i.test(line) ? '[פרטים אישיים הוסרו]' : line
    );
}

function isSystemMessage(sender: string, body: string): boolean {
  if (!body || body === '.' || body.trim() === '') return true;
  const combined = `${sender}: ${body}`;
  return SYSTEM_PATTERNS.some((re) => re.test(body) || re.test(sender) || re.test(combined));
}

function parseMessages(raw: string): ChatMessage[] {
  const lines = raw.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  let current: ChatMessage | null = null;

  for (const line of lines) {
    const match = line.match(MESSAGE_HEADER);
    if (match) {
      if (current) messages.push(current);
      const [, dateStr, timeStr, rest] = match;
      const colonIdx = rest.indexOf(': ');
      const sender = colonIdx >= 0 ? rest.slice(0, colonIdx) : rest;
      const body = colonIdx >= 0 ? rest.slice(colonIdx + 2) : '';
      current = {
        date: parseWhatsAppDate(dateStr, timeStr),
        dateISO: '',
        sender: anonymizeSender(sender),
        body: body.replace(/\s*<This message was edited>\s*$/i, '').trim(),
      };
    } else if (current && line.trim()) {
      current.body += '\n' + line;
    }
  }
  if (current) messages.push(current);

  for (const m of messages) {
    m.dateISO = m.date.toISOString();
    m.body = scrubPiiFromText(m.body);
  }

  return messages;
}

function normalizeUrl(rawUrl: string): string {
  let url = rawUrl.replace(/[)\].,;]+$/g, '');
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'linkedin.com') {
      const ugcId =
        parsed.pathname.match(/ugcPost-(\d+)/i)?.[1] ||
        parsed.href.match(/ugcPost-(\d+)/i)?.[1];
      if (ugcId) {
        return `https://www.linkedin.com/feed/update/urn:li:activity:${ugcId}`;
      }
      const activityMatch = parsed.pathname.match(/-(?:activity|share)-(\d+)/i);
      if (activityMatch && parsed.pathname.includes('/posts/')) {
        return `https://www.linkedin.com/feed/update/urn:li:activity:${activityMatch[1]}`;
      }
      if (parsed.pathname.includes('/feed/update/')) {
        parsed.search = '';
      }
      if (parsed.pathname.startsWith('/pulse/')) {
        parsed.pathname = parsed.pathname.replace(
          /-([a-z]{2,20}-[a-z]{2,20})-([a-z0-9]{5,6})$/i,
          '-$2'
        );
      }
    }
    if (host === 'x.com' || host === 'twitter.com') {
      const statusMatch = parsed.pathname.match(/^\/[^/]+\/status\/(\d+)/);
      if (statusMatch) {
        return `https://x.com/i/status/${statusMatch[1]}`;
      }
    }

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      if (id) return `https://youtube.com/watch?v=${id}`;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = parsed.searchParams.get('v');
      if (v) return `https://youtube.com/watch?v=${v}`;
      if (parsed.pathname.startsWith('/@')) {
        return `https://youtube.com${parsed.pathname}`;
      }
      if (parsed.pathname === '/playlist') {
        const list = parsed.searchParams.get('list');
        if (list) return `https://youtube.com/playlist?list=${list}`;
      }
    }
    if (host === 'linkedin.com' || host === 'lnkd.in') {
      const toDelete: string[] = [];
      parsed.searchParams.forEach((_, key) => {
        if (TRACKING_PARAMS.has(key.toLowerCase())) toDelete.push(key);
      });
      toDelete.forEach((k) => parsed.searchParams.delete(k));
    } else {
      const toDelete: string[] = [];
      parsed.searchParams.forEach((_, key) => {
        if (TRACKING_PARAMS.has(key.toLowerCase())) toDelete.push(key);
      });
      toDelete.forEach((k) => parsed.searchParams.delete(k));
    }

    parsed.hash = '';
    if (parsed.searchParams.toString() === '') parsed.search = '';
    parsed.hostname = host === 'linkedin.com' ? 'www.linkedin.com' : parsed.hostname.replace(/^www\./, '');
    if (!parsed.hostname.startsWith('www.') && ['linkedin.com', 'github.com'].includes(parsed.hostname)) {
      parsed.hostname = 'www.' + parsed.hostname;
    }

    return parsed.toString().replace(/\/$/, '') || parsed.toString();
  } catch {
    return url;
  }
}

function redactUrlsInText(text: string): string {
  return text.replace(URL_REGEX, (raw) => normalizeUrl(raw.trim()));
}

function polishMessageText(text: string): string {
  return redactUrlsInText(scrubPiiFromText(text));
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function detectPlatform(url: string, domain: string): string {
  const d = domain.toLowerCase();
  if (d.includes('youtube.com') || d === 'youtu.be') return 'YouTube';
  if (d.includes('linkedin.com') || d === 'lnkd.in') return 'LinkedIn';
  if (d.includes('github.com') || d === 'gist.github.com') return 'GitHub';
  if (d.includes('tiktok.com') || d === 'vt.tiktok.com') return 'TikTok';
  if (d.includes('spotify.com')) return 'Spotify';
  if (d.includes('meetup.com') || d.includes('meetu.ps')) return 'Meetup';
  if (d.includes('eventbrite')) return 'Eventbrite';
  if (d.includes('twitter.com') || d === 'x.com') return 'X';
  if (d.includes('instagram.com')) return 'Instagram';
  if (d.includes('forms.gle') || d.includes('docs.google.com/forms')) return 'Google Forms';
  if (d.includes('google.com/maps') || d.includes('maps.google')) return 'Google Maps';
  if (d.includes('medium.com')) return 'Medium';
  if (d.includes('dev.to')) return 'dev.to';
  if (d.includes('notion.')) return 'Notion';
  if (d.includes('vercel.app') || d.includes('netlify.app')) return 'Web App';
  if (d.includes('aws') || d.includes('amazon')) return 'AWS';
  return 'Website';
}

function detectContentType(platform: string, url: string, text: string): string {
  const lower = (text + ' ' + url).toLowerCase();
  if (platform === 'YouTube' || platform === 'TikTok' || platform === 'Instagram') return 'video';
  if (platform === 'Spotify') return 'podcast';
  if (platform === 'GitHub') return 'repository';
  if (platform === 'Google Forms') return 'form';
  if (platform === 'Meetup' || platform === 'Eventbrite') return 'event';
  if (lower.includes('course') || lower.includes('קורס') || lower.includes('udemy') || lower.includes('coursera'))
    return 'course';
  if (lower.includes('משרה') || lower.includes('job') || lower.includes('דרוש')) return 'job';
  if (lower.includes('docs.') || lower.includes('documentation')) return 'documentation';
  return 'article';
}

function scoreCategory(
  text: string,
  url: string,
  domain: string,
  platform: string
): { key: CategoryKey; label: string; scores: Record<CategoryKey, number> } {
  const t = `${text}\n${url}`.toLowerCase();
  const scores: Record<CategoryKey, number> = {
    interviews: 0,
    jobs: 0,
    cv: 0,
    dev: 0,
    ai: 0,
    github: 0,
    career: 0,
    learning: 0,
    events: 0,
    video: 0,
    tools: 0,
    other: 0,
  };

  const rules: Array<[RegExp, CategoryKey, number]> = [
    [/leetcode|coding interview|system design interview|ראיון|ראיונות|interview prep|technical interview|התנהגותי|pagefy|alex xu/i, 'interviews', 4],
    [/משרה|משרות|jobs?\.|job board|דרושים|hiring|careers\.|techmap|software\.csv|lnkd\.in\/p\//i, 'jobs', 4],
    [/קורות חיים|resume|rxresu|cv\b|linkedin\.com\/in\/|פרופיל לינקדין/i, 'cv', 4],
    [/chatgpt|claude|gemini|openai|llm\b|mcp\b|cursor\.com|copilot|qodo|agentic|tokens?|ai memory|second brain/i, 'ai', 4],
    [/github\.com|gitlab|open.?source|oss\b|pull request/i, 'github', 3],
    [/meetup|מיטאפ|conference|summit|eventbrite|הרשמה|כנס/i, 'events', 4],
    [/youtube|youtu\.be|spotify|podcast|tiktok|instagram\.com\/reel/i, 'video', 3],
    [/course|קורס|tutorial|למידה|playlist|udemy|coursera|freecodecamp/i, 'learning', 3],
    [/קריירה|career|מנטור|mentor|kravitech|ליווי/i, 'career', 2],
    [/react|angular|node|typescript|devops|frontend|backend|webpack|docker|kubernetes|aws|system design|steganography|engineering blog/i, 'dev', 2],
    [/tool|כלים|forms\.gle|vercel|notion/i, 'tools', 2],
  ];

  for (const [re, cat, weight] of rules) {
    if (re.test(t)) scores[cat] += weight;
  }

  if (platform === 'GitHub') scores.github += 3;
  if (platform === 'YouTube' || platform === 'TikTok' || platform === 'Spotify') scores.video += 2;
  if (platform === 'Meetup') scores.events += 4;
  if (platform === 'LinkedIn' && /\/in\//.test(url)) scores.cv += 3;
  if (platform === 'LinkedIn' && /\/posts\//.test(url)) scores.career += 2;

  if (domain.includes('linkedin.com') && scores.jobs < 2 && scores.cv < 2) scores.career += 1;

  let best: CategoryKey = 'other';
  let bestScore = 0;
  for (const [key, val] of Object.entries(scores) as Array<[CategoryKey, number]>) {
    if (val > bestScore) {
      bestScore = val;
      best = key;
    }
  }
  if (bestScore === 0) best = 'other';

  return { key: best, label: CATEGORIES[best], scores };
}

function deriveTags(text: string, categoryKey: CategoryKey, platform: string): string[] {
  const tags = new Set<string>();
  const t = text.toLowerCase();
  const tagRules: Array<[RegExp, string]> = [
    [/react/i, 'React'],
    [/next\.?js/i, 'Next.js'],
    [/angular/i, 'Angular'],
    [/typescript|ts\b/i, 'TypeScript'],
    [/devops/i, 'DevOps'],
    [/system design/i, 'System Design'],
    [/ראיון/i, 'ראיונות'],
    [/משרה/i, 'משרות'],
    [/linkedin/i, 'LinkedIn'],
    [/ai\b|בינה מלאכותית/i, 'AI'],
    [/frontend|פרונט/i, 'Frontend'],
    [/backend/i, 'Backend'],
    [/junior|מתחיל/i, 'Junior'],
    [/מיטאפ|meetup/i, 'מיטאפ'],
    [/youtube/i, 'וידאו'],
    [/open source|oss/i, 'Open Source'],
  ];
  for (const [re, tag] of tagRules) {
    if (re.test(t)) tags.add(tag);
  }
  if (platform && platform !== 'Website') tags.add(platform);
  return [...tags].slice(0, 8);
}

function cleanContextForTitle(text: string): string {
  return text
    .replace(URL_REGEX, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s:,-]+/, '')
    .trim();
}

function titleFromUrl(url: string, domain: string, platform: string): string {
  try {
    const u = new URL(url);
    const videoId = u.searchParams.get('v');
    if (platform === 'YouTube' && videoId) {
      return `סרטון YouTube (${videoId.slice(0, 11)})`;
    }
    if (platform === 'GitHub') {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
      return `GitHub — ${parts.join('/') || domain}`;
    }
    if (platform === 'LinkedIn' && u.pathname.includes('/in/')) {
      return 'פרופיל LinkedIn';
    }
    const path = u.pathname.split('/').filter(Boolean).pop();
    if (path && path.length > 2 && path.length < 80) {
      return decodeURIComponent(path).replace(/[-_]/g, ' ');
    }
  } catch {
    /* ignore */
  }
  return `${platform} — ${domain}`;
}

function deriveTitle(context: string, url: string, domain: string, platform: string): string {
  const cleaned = cleanContextForTitle(context);
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  const bad = /^(לינקדאין|linkedin|לדוגמה|מוזמנים|חברים|היי|אהלן|👍|🙏|checkout|check out)$/i;

  for (const line of lines) {
    if (line.length >= 12 && line.length <= 120 && !bad.test(line) && !/^https?:/i.test(line)) {
      return line.length > 90 ? line.slice(0, 87) + '…' : line;
    }
  }

  const firstGood = lines.find((l) => l.length >= 8 && !bad.test(l) && !/^https?:/i.test(l));
  if (firstGood) {
    return firstGood.length > 90 ? firstGood.slice(0, 87) + '…' : firstGood;
  }

  return titleFromUrl(url, domain, platform);
}

function deriveDescription(context: string, title: string): string {
  const cleaned = cleanContextForTitle(context);
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  const descLines = lines.filter((l) => l !== title && l.length > 15);
  const desc = descLines.slice(0, 2).join(' · ');
  if (desc && desc.length >= 20) {
    return desc.length > 200 ? desc.slice(0, 197) + '…' : desc;
  }
  if (cleaned.length >= 20 && cleaned !== title) {
    return cleaned.length > 200 ? cleaned.slice(0, 197) + '…' : cleaned;
  }
  return '';
}

function isLikelyPersonalLinkedIn(url: string, context: string): boolean {
  if (!/\/in\//.test(url)) return false;
  const t = context.toLowerCase();
  if (/לינקדאין שלי|הלינקדאין שלי|להתחבר|למי שרוצה/i.test(t)) return true;
  if (/מציג את עצמ|שלום לכולם|נעים להכיר|בוגר|סטודנט|שירתי/i.test(t) && t.length < 400) return true;
  return false;
}

function shouldSkipUrl(url: string, context: string): boolean {
  if (/wa\.me|whatsapp\.com/i.test(url)) return true;
  if (/linkedin\.com\/in\//i.test(url)) return true;
  if (isLikelyPersonalLinkedIn(url, context)) return true;
  return false;
}

function extractResources(messages: ChatMessage[]): { resources: Resource[]; urlOccurrences: number } {
  const byUrl = new Map<string, Resource>();
  let urlOccurrences = 0;

  for (const msg of messages) {
    if (isSystemMessage(msg.sender, msg.body)) continue;
    const urls = [...new Set((msg.body.match(URL_REGEX) || []).map((u) => u.trim()))];
    if (!urls.length) continue;

    const context = msg.body.trim();

    for (const rawUrl of urls) {
      if (shouldSkipUrl(rawUrl, context)) continue;
      urlOccurrences++;
      const url = normalizeUrl(rawUrl);
      const domain = getDomain(url);
      const platform = detectPlatform(url, domain);
      const { key: categoryKey, label: category } = scoreCategory(context, url, domain, platform);
      const contentType = detectContentType(platform, url, context);
      const tags = deriveTags(context, categoryKey, platform);

      const snippetRaw = context.length > 500 ? context.slice(0, 497) + '…' : context;
      const share = {
        date: msg.dateISO,
        snippet: polishMessageText(snippetRaw),
      };

      if (byUrl.has(url)) {
        const existing = byUrl.get(url)!;
        existing.shareCount += 1;
        existing.shares.push(share);
        if (new Date(share.date) > new Date(existing.latestShareDate)) {
          existing.latestShareDate = share.date;
          if (share.snippet.length > existing.originalMessage.length) {
            existing.originalMessage = share.snippet;
          }
        }
        existing.firstShareDate =
          new Date(share.date) < new Date(existing.firstShareDate)
            ? share.date
            : existing.firstShareDate;
        const mergedTags = new Set([...existing.tags, ...tags]);
        existing.tags = [...mergedTags].slice(0, 8);
      } else {
        const title = polishMessageText(deriveTitle(context, url, domain, platform));
        const description = polishMessageText(deriveDescription(context, title));
        byUrl.set(url, {
          id: Buffer.from(url).toString('base64url').slice(0, 16),
          url,
          title,
          description,
          originalMessage: share.snippet,
          firstShareDate: share.date,
          latestShareDate: share.date,
          domain,
          platform,
          contentType,
          category,
          categoryKey,
          tags,
          shareCount: 1,
          shares: [share],
        });
      }
    }
  }

  const resources = [...byUrl.values()].sort(
    (a, b) =>
      new Date(b.latestShareDate).getTime() - new Date(a.latestShareDate).getTime()
  );

  return { resources, urlOccurrences };
}

function main() {
  const inputPath = process.argv[2] || DEFAULT_INPUT;
  const outputPath = process.argv[3] || DEFAULT_OUTPUT;
  const metaPath = process.argv[4] || DEFAULT_META_OUTPUT;

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const messages = parseMessages(raw);
  const nonSystem = messages.filter((m) => !isSystemMessage(m.sender, m.body));
  const { resources, urlOccurrences } = extractResources(messages);

  const dateTimes = messages.map((m) => m.date.getTime()).filter((t) => !Number.isNaN(t));
  const minDate = new Date(Math.min(...dateTimes));
  const maxDate = new Date(Math.max(...dateTimes));

  const categories = [...new Set(resources.map((r) => r.category))].sort();
  const platforms = [...new Set(resources.map((r) => r.platform))].sort();
  const meta = {
    generatedAt: new Date().toISOString(),
    sourceFile: path.basename(inputPath),
    totalLines: raw.split(/\r?\n/).length,
    totalMessages: messages.length,
    nonSystemMessages: nonSystem.length,
    urlOccurrences,
    uniqueResources: resources.length,
    categoriesCount: categories.length,
    platformsCount: platforms.length,
    dateRange: {
      from: minDate.toISOString(),
      to: maxDate.toISOString(),
    },
    categories,
    platforms,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(resources, null, 2), 'utf8');
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');

  console.log('Processed WhatsApp export:');
  console.log(`  Messages: ${meta.totalMessages}`);
  console.log(`  URL occurrences: ${urlOccurrences}`);
  console.log(`  Unique resources: ${resources.length}`);
  console.log(`  Date range: ${minDate.toLocaleDateString('he-IL')} – ${maxDate.toLocaleDateString('he-IL')}`);
  console.log(`  Wrote ${outputPath}`);
}

main();
