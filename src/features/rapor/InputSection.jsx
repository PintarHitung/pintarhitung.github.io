import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp } from 'lucide-react';
import { useRapor } from '../../store/RaporContext';
import SemesterBlock from './SemesterBlock';

const InputSection = ({ onAnalyze, analytics }) => {
  const { semesters, addSemester } = useRapor();

  return (
    <section className="pb-32 sm:pb-10" aria-label="Input Data Raport">
      {/* Hero area */}
      <div className="mb-8">
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(59,130,246,0.06) 100%)',
            border: '1px solid rgba(34,211,238,0.15)',
          }}
        >
          <h2 className="font-display font-bold text-xl sm:text-2xl mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Analisis Nilai Raport
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Masukkan nilai per semester untuk mendapatkan analisis mendalam: trend, konsistensi, kekuatan mapel, dan insight akademik cerdas.
          </p>

          {/* Stats strip */}
          <div className="flex gap-4 mt-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Semester</p>
              <p className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{semesters.length}</p>
            </div>
            <div className="w-px" style={{ background: 'var(--border-subtle)' }} />
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Mata Pelajaran</p>
              <p className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {semesters.reduce((acc, s) => acc + s.subjects.length, 0)}
              </p>
            </div>
            {analytics.hasData && (
              <>
                <div className="w-px" style={{ background: 'var(--border-subtle)' }} />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Grand Avg</p>
                  <p className="font-display font-bold text-lg" style={{ color: '#22d3ee' }}>{analytics.grandAvg}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Semester list */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
            Data Per Semester
          </h3>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {semesters.length} semester diinput
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {semesters.map((sem, idx) => (
              <SemesterBlock
                key={sem.id}
                sem={sem}
                index={idx}
                prevSem={idx > 0 ? semesters[idx - 1] : null}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Semester */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={addSemester}
        className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 mb-6 transition-colors"
        style={{
          background: 'var(--bg-surface)',
          border: '1.5px dashed var(--border-strong)',
          color: 'var(--text-muted)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.borderColor = 'var(--border-strong)';
        }}
      >
        <Plus size={18} /> Tambah Semester Baru
      </motion.button>

      {/* Desktop CTA */}
      {analytics.hasData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden sm:block"
        >
          <button
            onClick={onAnalyze}
            className="btn-primary w-full py-4 text-base"
          >
            <TrendingUp size={20} />
            Analisis Nilai Sekarang
          </button>
        </motion.div>
      )}
    </section>
  );
};

export default InputSection;
