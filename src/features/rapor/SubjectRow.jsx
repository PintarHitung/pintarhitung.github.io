import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const SubjectRow = React.memo(({ sub, index, semId, onUpdate, onRemove }) => {
  const handleNameChange = useCallback(
    (e) => onUpdate(semId, sub.id, 'name', e.target.value),
    [semId, sub.id, onUpdate]
  );
  const handleScoreChange = useCallback(
    (e) => {
      const v = e.target.value;
      if (v === '' || (parseFloat(v) >= 0 && parseFloat(v) <= 100)) {
        onUpdate(semId, sub.id, 'score', v);
      }
    },
    [semId, sub.id, onUpdate]
  );
  const handleRemove = useCallback(
    (e) => {
      e.stopPropagation();
      onRemove(semId, sub.id);
    },
    [semId, sub.id, onRemove]
  );

  const score = parseFloat(sub.score);
  const scoreColor =
    score >= 88
      ? '#10b981'
      : score >= 75
      ? '#22d3ee'
      : score >= 65
      ? '#f59e0b'
      : score > 0
      ? '#f43f5e'
      : 'var(--text-muted)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-2"
    >
      {/* Number */}
      <span
        className="w-5 text-center text-xs font-medium flex-shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        {index + 1}
      </span>

      {/* Subject name */}
      <input
        type="text"
        placeholder="Nama mata pelajaran"
        value={sub.name}
        onChange={handleNameChange}
        className="input-base flex-1"
        style={{ borderRadius: '12px', padding: '0.625rem 0.875rem' }}
        aria-label={`Nama mapel ${index + 1}`}
      />

      {/* Score */}
      <input
        type="number"
        inputMode="decimal"
        placeholder="Nilai"
        min="0"
        max="100"
        value={sub.score}
        onChange={handleScoreChange}
        className="input-base input-score"
        style={{
          borderRadius: '12px',
          padding: '0.625rem 0.25rem',
          color: scoreColor,
          borderColor: sub.score ? 'rgba(255,255,255,0.12)' : undefined,
        }}
        aria-label={`Nilai ${sub.name || 'mapel ' + (index + 1)}`}
      />

      {/* Remove */}
      <button
        onClick={handleRemove}
        className="p-2.5 rounded-xl flex-shrink-0 transition-colors"
        style={{ color: 'var(--text-muted)', background: 'transparent' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#f43f5e';
          e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Hapus mapel"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
});

SubjectRow.displayName = 'SubjectRow';
export default SubjectRow;
