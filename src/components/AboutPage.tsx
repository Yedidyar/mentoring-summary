import { formatDate } from '../utils/format';
import type { ExportMeta } from '../types/resource';

type AboutPageProps = {
  meta: ExportMeta;
};

export function AboutPage({ meta }: AboutPageProps) {
  return (
    <section className="about-page">
      <h1>על המאגר</h1>
      <p>
        מרכז הידע הוא מאגר משאבים שמופק אוטומטית מייצוא השיחה בקבוצת המנטורינג ב-WhatsApp.
        הקישורים מסווגים, מסוננים ומאוחדים — בלי להציג את הצ&apos;אט כמו שהוא.
      </p>
      <ul className="about-stats">
        <li>{meta.totalMessages} הודעות עובדו מהייצוא</li>
        <li>
          {meta.urlOccurrences} קישורים נמצאו · {meta.uniqueResources} משאבים ייחודיים אחרי איחוד
        </li>
        <li>עודכן לאחרונה: {formatDate(meta.generatedAt)}</li>
      </ul>
      <h2>איך לעדכן את המאגר?</h2>
      <p>
        ייצאו מחדש את הצ&apos;אט מ-WhatsApp, שימו את הקובץ בנתיב שמוגדר בסקריפט, והריצו{' '}
        <code dir="ltr">pnpm run process-chat</code> ואז <code dir="ltr">pnpm run build</code>.
        פרטים מלאים ב-README של הפרויקט.
      </p>
    </section>
  );
}
