type EmptyStateProps = {
  onClear: () => void;
};

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p>לא נמצאו משאבים שמתאימים לחיפוש הזה.</p>
      <button type="button" className="clear-filters-btn" onClick={onClear}>
        נקה חיפוש וסינון
      </button>
    </div>
  );
}
