import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useRapor } from '../../store/RaporContext';
import { calculateSemesterAvg, safeRound } from '../../utils/math';
import SubjectRow from './SubjectRow';

const SemesterBlock = React.memo(({ sem, index, prevSem }) => {
  const { addSubject, autoFillSubjects, removeSemester, updateSubject, removeSubject } = useRapor();
  const [expanded, setExpanded] = useState(true);

  const avg = calculateSemesterAvg(sem.subjects);
  const prevAvg = prevSem ? calculateSemesterAvg(prevSem.subjects) : 0;
  const hasAvg = avg > 0;
  const showTrend = prevAvg > 0 && hasAvg;
  const isUp = avg >= prevAvg;
  const delta = showTrend ? safeRound(Math.abs(avg - prevAvg), 2) : null;

  const handleAddSubject = useCallback(() => addSubject(sem.id), [sem.id, addSubject]);
  const handleAutoFill = useCallback(() => autoFillSubjects(sem.id), [sem.id, autoFillSubjects]);
  const handleRemoveSem = useCallback(() => removeSemester(sem.id), [sem.id, removeSemester]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onClick={() => setExpanded((p) => !p)}
        role="button"
        aria-expanded={expanded}
        aria-label={`Toggle ${sem.name}`}
      >
        {/* Semester badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
          style={{
            background: 'rgba(34,211,238,0.1)',
            color: '#22d3ee',
            border: '1px solid rgba(34,211,238,0.2)',
          }}
        >
          S{index + 1}
        </div>

        {/* Name + trend */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {sem.name}
          </p>
          {showTrend && (
            <p
              className="text-xs font-medium flex items-center gap-1 mt-0.5"
              style={{ color: isUp ? '#10b981' : '#f43f5e' }}
            >
              {isUp ? '▲' : '▼'} {isUp ? '+' : '-'}{delta} dari S{index}
            </p>
          )}
        </div>

        {/* Avg + chevron */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Rata-rata
            </p>
            <p className="font-display font-bold text-lg leading-none" style={{ color: hasAvg ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {hasAvg ? avg.toFixed(2) : '—'}
            </p>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="p-4 space-y-2.5">
              {sem.subjects.length === 0 && (
                <p className="text-center text-sm py-4" style={{ color: 'var(--text-muted)' }}>
                  Belum ada mata pelajaran
                </p>
              )}

              <AnimatePresence>
                {sem.subjects.map((sub, i) => (
                  <SubjectRow
                    key={sub.id}
                    sub={sub}
                    index={i}
                    semId={sem.id}
                    onUpdate={updateSubject}
                    onRemove={removeSubject}
                  />
                ))}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button className="btn-dashed flex-1" onClick={handleAddSubject}>
                  <Plus size={15} /> Tambah Mapel
                </button>
                {sem.subjects.length === 0 && (
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      background: 'rgba(34,211,238,0.08)',
                      color: '#22d3ee',
                      border: '1px solid rgba(34,211,238,0.2)',
                    }}
                    onClick={handleAutoFill}
                  >
                    <Sparkles size={14} /> Auto-fill Mapel
                  </button>
                )}
              </div>

              {/* Remove semester */}
              <div className="text-right pt-1">
                <button
                  onClick={handleRemoveSem}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#f43f5e';
                    e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Trash2 size={12} className="inline mr-1" />
                  Hapus semester ini
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
});

SemesterBlock.displayName = 'SemesterBlock';
export default SemesterBlock;
