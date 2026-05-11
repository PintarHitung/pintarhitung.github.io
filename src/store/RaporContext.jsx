import { createContext, useCallback, useContext, useReducer } from 'react';
import { generateId } from '../utils/generators';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DEFAULT_SUBJECTS = [
  'Matematika',
  'B. Indonesia',
  'B. Inggris',
  'IPA / Peminatan 1',
  'IPS / Peminatan 2',
];

const RaporContext = createContext(null);

const INITIAL_STATE = [{ id: 'sem_1', name: 'Semester 1', subjects: [] }];

export const RaporProvider = ({ children }) => {
  const [semesters, setSemesters] = useLocalStorage(
    'pintarhitung_v3',
    INITIAL_STATE
  );

  const addSemester = useCallback(() => {
    setSemesters((prev) => [
      ...prev,
      {
        id: generateId(),
        name: `Semester ${prev.length + 1}`,
        subjects: [],
      },
    ]);
  }, [setSemesters]);

  const removeSemester = useCallback(
    (id) => setSemesters((prev) => prev.filter((s) => s.id !== id)),
    [setSemesters]
  );

  const addSubject = useCallback(
    (semId) =>
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === semId
            ? {
                ...s,
                subjects: [
                  ...s.subjects,
                  { id: generateId(), name: '', score: '' },
                ],
              }
            : s
        )
      ),
    [setSemesters]
  );

  const autoFillSubjects = useCallback(
    (semId) =>
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === semId
            ? {
                ...s,
                subjects: [
                  ...s.subjects,
                  ...DEFAULT_SUBJECTS.map((name) => ({
                    id: generateId(),
                    name,
                    score: '',
                  })),
                ],
              }
            : s
        )
      ),
    [setSemesters]
  );

  const updateSubject = useCallback(
    (semId, subId, field, value) =>
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === semId
            ? {
                ...s,
                subjects: s.subjects.map((sub) =>
                  sub.id === subId ? { ...sub, [field]: value } : sub
                ),
              }
            : s
        )
      ),
    [setSemesters]
  );

  const removeSubject = useCallback(
    (semId, subId) =>
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === semId
            ? { ...s, subjects: s.subjects.filter((sub) => sub.id !== subId) }
            : s
        )
      ),
    [setSemesters]
  );

  const resetAll = useCallback(() => {
    setSemesters(INITIAL_STATE);
  }, [setSemesters]);

  return (
    <RaporContext.Provider
      value={{
        semesters,
        addSemester,
        removeSemester,
        addSubject,
        autoFillSubjects,
        updateSubject,
        removeSubject,
        resetAll,
      }}
    >
      {children}
    </RaporContext.Provider>
  );
};

export const useRapor = () => {
  const ctx = useContext(RaporContext);
  if (!ctx) throw new Error('useRapor must be used inside RaporProvider');
  return ctx;
};
