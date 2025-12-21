import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  GraduationCap, 
  School, 
  LayoutDashboard, 
  Menu, 
  X, 
  Settings, 
  TrendingUp, 
  BookOpen, 
  Percent, 
  Save, 
  Trash2,
  Plus,
  ChevronRight,
  Target,
  Instagram,
  FileText // Icon baru untuk Panduan
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- UTILITY HOOKS ---

// Hook to persist state to LocalStorage automatically
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// --- SUB-COMPONENTS ---

/* 1. ASPD PRO CALCULATOR (OFFICIAL 3 SUBJECTS) */
const ASPDCalculator = () => {
  const [scores, setScores] = useLocalStorage('aspd_scores_fixed', {
    rapor_sem1: '', rapor_sem2: '', rapor_sem3: '', rapor_sem4: '', rapor_sem5: '',
    aspd_lit: '', aspd_num: '', aspd_sains: '',
    akreditasi: ''
  });

  const [weights, setWeights] = useLocalStorage('aspd_weights', {
    rapor: 40, aspd: 55, akreditasi: 5
  });

  const [showConfig, setShowConfig] = useState(false);

  // Hardcoded Official Multipliers
  const multipliers = {
    lit: 1.72,   // Literasi Membaca
    num: 1.14,   // Numerasi
    sains: 1.14  // Sains
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || parseFloat(value) >= 0) {
      setScores(prev => ({ ...prev, [name]: value }));
    }
  };

  // Calculations
  const calcRapor = useMemo(() => {
    const keys = ['rapor_sem1', 'rapor_sem2', 'rapor_sem3', 'rapor_sem4', 'rapor_sem5'];
    const validValues = keys.map(k => parseFloat(scores[k])).filter(v => !isNaN(v));
    const average = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / 5 : 0;
    const base400 = average * 4;
    return { average, base400, contribution: base400 * (weights.rapor / 100) };
  }, [scores, weights.rapor]);

  const calcASPD = useMemo(() => {
    const sLit = (parseFloat(scores.aspd_lit) || 0) * multipliers.lit;
    const sNum = (parseFloat(scores.aspd_num) || 0) * multipliers.num;
    const sSains = (parseFloat(scores.aspd_sains) || 0) * multipliers.sains;
    const totalScore = sLit + sNum + sSains;
    return { totalScore, contribution: totalScore * (weights.aspd / 100) };
  }, [scores, weights.aspd]);

  const calcAkreditasi = useMemo(() => {
    const val = parseFloat(scores.akreditasi) || 0;
    const base400 = val * 4;
    return { val, base400, contribution: base400 * (weights.akreditasi / 100) };
  }, [scores, weights.akreditasi]);

  const finalScore = (
    calcRapor.contribution + 
    calcASPD.contribution + 
    calcAkreditasi.contribution
  ).toFixed(2);

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:bg-cyan-500/10 transition-colors focus:outline-none text-sm placeholder:text-white/20";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold font-space text-white">ASPD Pro (Resmi)</h2>
          <p className="text-white/60 text-sm">3 Mapel Utama (Lit, Num, Sains) dengan Nilai Tukar</p>
        </div>
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className={`p-2 rounded-xl transition-all border ${showConfig ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-white/50'}`}
        >
          <Settings size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showConfig && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/20 border border-white/10 rounded-2xl p-4 overflow-hidden mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Konfigurasi Bobot (%)</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['rapor', 'aspd', 'akreditasi'].map(key => (
                <div key={key}>
                  <label className="text-xs text-white/50 capitalize block mb-1">{key}</label>
                  <input 
                    type="number" 
                    value={weights[key]}
                    onChange={(e) => setWeights(prev => ({...prev, [key]: parseFloat(e.target.value)}))}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
            <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <BookOpen size={16} /> NILAI RAPOR (Sem 1-5)
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(sem => (
                <div key={sem}>
                  <label className="text-[9px] text-center block text-white/40 mb-1">SEM {sem}</label>
                  <input
                    name={`rapor_sem${sem}`}
                    value={scores[`rapor_sem${sem}`]}
                    onChange={handleChange}
                    placeholder="0-100"
                    type="number"
                    className={`${inputClass} text-center px-1`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
            <h3 className="text-sm font-bold text-violet-400 mb-3 flex items-center gap-2">
              <School size={16} /> NILAI ASPD MURNI
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Literasi Membaca', key: 'lit', multi: multipliers.lit },
                { label: 'Literasi Numerasi', key: 'num', multi: multipliers.num },
                { label: 'Literasi Sains', key: 'sains', multi: multipliers.sains }
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-white/70 block mb-1">{item.label}</label>
                    <div className="relative">
                      <input
                        name={`aspd_${item.key}`}
                        value={scores[`aspd_${item.key}`]}
                        onChange={handleChange}
                        placeholder="0-100"
                        type="number"
                        className={`${inputClass} pr-16`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-cyan-300 bg-cyan-900/30 px-2 py-0.5 rounded">
                        x{item.multi}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/30 mt-3 italic">*Nilai Tukar (x1.72 / x1.14) sudah otomatis diterapkan sesuai aturan resmi.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
               <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><School size={18}/></div>
               <div>
                 <h3 className="text-sm font-bold text-white">Akreditasi Sekolah</h3>
                 <p className="text-xs text-white/50">Nilai 0-100</p>
               </div>
            </div>
            <input
              name="akreditasi"
              value={scores.akreditasi}
              onChange={handleChange}
              placeholder="98"
              type="number"
              className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-right focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="h-full bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col relative overflow-hidden transform translate-z-0">
            <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none"></div>
            <h4 className="text-white/50 text-xs uppercase tracking-widest mb-1">Nilai Akhir PPDB</h4>
            <div className="text-6xl font-bold font-space text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300 mb-6">
              {finalScore}
            </div>

            <div className="flex-1 bg-black/20 rounded-xl p-4 space-y-4 border border-white/5">
              <h5 className="text-white/80 text-sm font-bold border-b border-white/10 pb-2 mb-2 flex justify-between">
                <span>Rincian Kalkulasi</span>
                <span className="text-[10px] font-normal text-white/40 pt-1">Basis 400</span>
              </h5>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Rapor ({calcRapor.average.toFixed(1)}) x 4</span>
                  <span className="font-mono">{calcRapor.base400.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{width: `${weights.rapor}%`}}></div>
                   </div>
                   <div className="text-sm text-emerald-300 font-mono font-bold">+ {calcRapor.contribution.toFixed(2)}</div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs text-white/60">
                  <span>ASPD (3 Mapel)</span>
                  <span className="font-mono">{calcASPD.totalScore.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500" style={{width: `${weights.aspd}%`}}></div>
                   </div>
                   <div className="text-sm text-violet-300 font-mono font-bold">+ {calcASPD.contribution.toFixed(2)}</div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Akreditasi x 4</span>
                  <span className="font-mono">{calcAkreditasi.base400.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{width: `${weights.akreditasi}%`}}></div>
                   </div>
                   <div className="text-sm text-orange-300 font-mono font-bold">+ {calcAkreditasi.contribution.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 2. UTBK SNBT CALCULATOR */
const UTBKCalculator = () => {
  const [inputs, setInputs] = useLocalStorage('utbk_scores', {
    pu: '', pbm: '', ppu: '', kuan: '', lit_indo: '', lit_ing: '', mat: ''
  });
  const [target, setTarget] = useLocalStorage('utbk_target', 0);
  const [preset, setPreset] = useState('custom');

  const presets = { kedokteran: 750, teknik: 680, soshum: 650, custom: 0 };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPreset(val);
    if (val !== 'custom') setTarget(presets[val]);
  };

  const avg = useMemo(() => {
    const vals = Object.values(inputs).map(v => parseFloat(v) || 0);
    const sum = vals.reduce((a, b) => a + b, 0);
    const count = vals.filter(v => v > 0).length;
    return count === 0 ? 0 : (sum / 7).toFixed(2);
  }, [inputs]);

  const diff = (avg - target).toFixed(2);
  const diffVal = parseFloat(diff);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-space text-white">Simulasi UTBK SNBT</h2>
          <p className="text-white/60 text-sm">Targetkan skor impianmu untuk PTN</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <select 
            value={preset} 
            onChange={handlePresetChange}
            className="bg-transparent text-white text-sm px-3 py-2 outline-none cursor-pointer"
          >
            <option className="bg-slate-900" value="custom">Custom Target</option>
            <option className="bg-slate-900" value="kedokteran">Kedokteran (High)</option>
            <option className="bg-slate-900" value="teknik">Teknik (Mid)</option>
            <option className="bg-slate-900" value="soshum">Soshum Favorit</option>
          </select>
          <div className="bg-white/10 w-px mx-1 my-1"></div>
          <input 
            type="number" 
            value={target > 0 ? target : ''} 
            onChange={(e) => {setTarget(e.target.value); setPreset('custom');}}
            placeholder="Target"
            className="w-20 bg-transparent text-white font-bold text-center outline-none placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h4 className="md:col-span-2 text-sm font-bold text-orange-400 uppercase tracking-wide mb-2">Potensi Kognitif</h4>
            {['PU (Penalaran Umum)', 'PBM (Bacaan & Menulis)', 'PPU (Pengetahuan Umum)', 'Kuan (Kuantitatif)'].map((label, idx) => {
              const key = ['pu', 'pbm', 'ppu', 'kuan'][idx];
              return (
                <div key={key}>
                  <label className="text-xs text-white/60 mb-1 block">{label}</label>
                  <input
                    type="number"
                    value={inputs[key]}
                    onChange={(e) => setInputs(prev => ({...prev, [key]: e.target.value}))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none transition-all"
                  />
                </div>
              );
            })}
            <div className="md:col-span-2 border-t border-white/10 my-2"></div>
            <h4 className="md:col-span-2 text-sm font-bold text-blue-400 uppercase tracking-wide mb-2">Literasi & Penalaran</h4>
            {['Lit. B. Indonesia', 'Lit. B. Inggris', 'Penalaran Matematika'].map((label, idx) => {
              const key = ['lit_indo', 'lit_ing', 'mat'][idx];
              return (
                <div key={key} className={idx === 2 ? "md:col-span-2" : ""}>
                  <label className="text-xs text-white/60 mb-1 block">{label}</label>
                  <input
                    type="number"
                    value={inputs[key]}
                    onChange={(e) => setInputs(prev => ({...prev, [key]: e.target.value}))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4">
            <div className={`
              flex-1 rounded-3xl p-6 border flex flex-col items-center justify-center relative overflow-hidden transform translate-z-0
              ${avg >= target && target > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}
            `}>
              <h4 className="text-white/50 text-sm uppercase tracking-widest mb-2">Skor Rata-Rata</h4>
              <div className="text-5xl font-bold font-space text-white">{avg}</div>
              {target > 0 && (
                <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2
                  ${diffVal >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}
                `}>
                  {diffVal >= 0 ? <TrendingUp size={14}/> : <Target size={14}/>}
                  {diffVal >= 0 ? `+${diff} diatas target` : `${Math.abs(diffVal).toFixed(2)} lagi`}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

/* 3. PSAJ CALCULATOR */
const PSAJCalculator = () => {
  const [ratio, setRatio] = useLocalStorage('psaj_ratio', 60); 
  const [subjects, setSubjects] = useLocalStorage('psaj_subjects', [
    { id: 1, name: 'Matematika', tulis: '', praktik: '' },
    { id: 2, name: 'B. Indonesia', tulis: '', praktik: '' }
  ]);

  const addSubject = () => setSubjects(prev => [...prev, { id: Date.now(), name: 'Mapel Baru', tulis: '', praktik: '' }]);
  const removeSubject = (id) => setSubjects(prev => prev.filter(s => s.id !== id));
  const updateSubject = (id, field, value) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  const calculateRow = (tulis, praktik) => {
    const t = parseFloat(tulis) || 0;
    const p = parseFloat(praktik) || 0;
    return ((t * ratio / 100) + (p * (100 - ratio) / 100)).toFixed(1);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-space text-white">PSAJ / Ujian Sekolah</h2>
          <p className="text-white/60 text-sm">Penilaian Sumatif Akhir Jenjang</p>
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="text-sm text-cyan-300 font-bold whitespace-nowrap">Bobot Nilai:</div>
        <div className="flex-1 w-full flex items-center gap-4">
          <span className="text-xs text-white/70">Tulis {ratio}%</span>
          <input 
            type="range" min="0" max="100" value={ratio} 
            onChange={(e) => setRatio(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span className="text-xs text-white/70">Praktik {100 - ratio}%</span>
        </div>
      </div>
      <div className="grid gap-4">
        {subjects.map((sub) => (
          <motion.div 
            layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={sub.id} 
            className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center transform translate-z-0"
          >
            <div className="flex-1 w-full">
              <input value={sub.name} onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                className="bg-transparent border-b border-white/10 text-white font-medium w-full focus:outline-none focus:border-cyan-500 px-1 py-1"
                placeholder="Nama Mapel"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input type="number" placeholder="Tulis" value={sub.tulis} onChange={(e) => updateSubject(sub.id, 'tulis', e.target.value)}
                className="w-20 bg-black/20 rounded-lg px-2 py-1 text-center text-white border border-white/10"
              />
              <input type="number" placeholder="Praktik" value={sub.praktik} onChange={(e) => updateSubject(sub.id, 'praktik', e.target.value)}
                className="w-20 bg-black/20 rounded-lg px-2 py-1 text-center text-white border border-white/10"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-between">
              <div className="text-xl font-bold font-space text-cyan-300 w-16 text-center">{calculateRow(sub.tulis, sub.praktik)}</div>
              <button onClick={() => removeSubject(sub.id)} className="text-white/20 hover:text-rose-400 transition-colors"><Trash2 size={18} /></button>
            </div>
          </motion.div>
        ))}
      </div>
      <button onClick={addSubject} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2">
        <Plus size={18} /> Tambah Mapel
      </button>
    </div>
  );
};

/* 4. GPA / IPK CALCULATOR */
const GPACalculator = () => {
    const [courses, setCourses] = useLocalStorage('ipk_courses', [{ id: 1, name: '', sks: '', grade: 'A' }]);
    const gradeValues = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'E': 0 };
    const addCourse = () => setCourses(prev => [...prev, { id: Date.now(), name: '', sks: '', grade: 'A' }]);
    const removeCourse = (id) => setCourses(prev => prev.filter(c => c.id !== id));
    const updateCourse = (id, field, value) => setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    const totalSKS = courses.reduce((acc, curr) => acc + (parseFloat(curr.sks) || 0), 0);
    const totalPoints = courses.reduce((acc, curr) => acc + ((parseFloat(curr.sks) || 0) * gradeValues[curr.grade]), 0);
    const ipk = totalSKS > 0 ? (totalPoints / totalSKS).toFixed(2) : "0.00";
  
    return (
      <div className="space-y-6">
        <div>
           <h2 className="text-2xl font-bold font-space text-white">Kalkulator IPK</h2>
           <p className="text-white/60 text-sm">Hitung Indeks Prestasi per Semester</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
             <div className="md:col-span-2 space-y-3">
                {courses.map(c => (
                     <div key={c.id} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/10">
                        <input placeholder="Mata Kuliah" value={c.name} onChange={(e) => updateCourse(c.id, 'name', e.target.value)}
                             className="flex-1 bg-transparent px-2 outline-none text-white text-sm" />
                        <input placeholder="SKS" type="number" value={c.sks} onChange={(e) => updateCourse(c.id, 'sks', e.target.value)}
                             className="w-16 bg-black/20 rounded-lg px-2 py-1 text-center text-white border border-white/10 text-sm" />
                         <select value={c.grade} onChange={(e) => updateCourse(c.id, 'grade', e.target.value)}
                            className="bg-black/20 text-white rounded-lg px-2 py-1 text-sm border border-white/10 outline-none">
                             {Object.keys(gradeValues).map(g => <option key={g} value={g}>{g}</option>)}
                         </select>
                         <button onClick={() => removeCourse(c.id)} className="p-2 text-white/30 hover:text-rose-400"><Trash2 size={16}/></button>
                     </div>
                ))}
                <button onClick={addCourse} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2">
                    <Plus size={16}/> Tambah Matkul
                </button>
             </div>
             <div>
                 <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-6 rounded-3xl text-center shadow-lg shadow-violet-900/50">
                     <h3 className="text-white/80 uppercase tracking-widest text-xs mb-2">Indeks Prestasi</h3>
                     <div className="text-6xl font-bold text-white font-space">{ipk}</div>
                     <div className="mt-4 text-white/60 text-sm flex justify-between px-4">
                         <span>SKS: {totalSKS}</span>
                         <span>Bobot: {totalPoints.toFixed(1)}</span>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    );
};

// --- MAIN LAYOUT COMPONENT ---

const App = () => {
  const [activeTab, setActiveTab] = useState('beranda');

  const menuItems = [
    { id: 'beranda', label: 'Beranda', icon: LayoutDashboard },
    { id: 'aspd', label: 'ASPD Pro', icon: School },
    { id: 'utbk', label: 'UTBK SNBT', icon: GraduationCap },
    { id: 'psaj', label: 'PSAJ / Ujian', icon: BookOpen },
    { id: 'ipk', label: 'Hitung IPK', icon: Percent },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'beranda':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden transform translate-z-0">
                <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Calculator size={300} />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-space text-white mb-4">
                    Halo, <span className="text-cyan-400">Sang Juara!</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl">
                    Selamat datang di PintarHitung v2.2. Alat bantu hitung nilai akademik modern yang sudah disesuaikan dengan aturan resmi terbaru.
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                    <button 
                        onClick={() => setActiveTab('aspd')}
                        className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-cyan-50 transition-colors flex items-center gap-2"
                    >
                        Mulai Hitung <ChevronRight size={18}/>
                    </button>
                    
                    {/* --- TOMBOL KE PANDUAN SEO --- */}
                    <a 
                        href="/panduan.html" 
                        className="px-6 py-3 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-2"
                    >
                        <FileText size={18} />
                        Baca Panduan Rumus
                    </a>

                    <a 
                        href="https://www.instagram.com/fawwazdzaaky/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full font-bold border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all flex items-center gap-2 text-white backdrop-blur-sm"
                    >
                        <Instagram size={18} />
                        <span>Follow Developer</span>
                    </a>
                </div>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {[
                     { title: 'Simulasi ASPD', desc: 'Formula resmi 3 Mapel', id: 'aspd', color: 'from-emerald-500/20 to-teal-500/20' },
                     { title: 'Target UTBK', desc: 'Set skor impian PTN', id: 'utbk', color: 'from-orange-500/20 to-amber-500/20' },
                     { title: 'Kalkulator IPK', desc: 'Pantau performa kuliah', id: 'ipk', color: 'from-violet-500/20 to-purple-500/20' }
                 ].map(card => (
                     <button 
                        key={card.id}
                        onClick={() => setActiveTab(card.id)}
                        className={`bg-gradient-to-br ${card.color} border border-white/10 p-6 rounded-2xl text-left hover:border-white/30 transition-all group`}
                     >
                         <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{card.title}</h3>
                         <p className="text-white/50 text-sm">{card.desc}</p>
                     </button>
                 ))}
             </div>
          </div>
        );
      case 'aspd': return <ASPDCalculator />;
      case 'utbk': return <UTBKCalculator />;
      case 'psaj': return <PSAJCalculator />;
      case 'ipk': return <GPACalculator />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-inter relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* PERFORMANCE OPTIMIZED BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="md:hidden absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-cyan-900/20"></div>
        <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px]"></div>
        <div className="hidden md:block absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-fuchsia-600/20 rounded-full blur-[100px] animate-bounce duration-[10s]"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden md:flex w-72 flex-col bg-slate-900/95 backdrop-blur-xl border-r border-white/10 fixed h-full z-20">
          <div className="p-8">
            <h1 className="text-2xl font-bold font-space bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-2">
                <Calculator className="text-cyan-400" /> PintarHitung
            </h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === item.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-900/20' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-cyan-400' : ''} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 text-center text-xs text-white/30">v2.2 Stable • React</div>
        </aside>

        <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 border-t border-white/10 z-50 px-4 py-2 flex justify-between items-center safe-area-bottom">
           {menuItems.slice(0, 5).map(item => (
               <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === item.id ? 'text-cyan-400' : 'text-white/40'}`}>
                   <item.icon size={20} />
                   <span className="text-[10px]">{item.label.split(" ")[0]}</span>
               </button>
           ))}
        </div>

        <main className="flex-1 md:ml-72 p-4 md:p-10 mb-20 md:mb-0">
          <div className="max-w-5xl mx-auto">
             <div className="md:hidden flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold font-space text-white flex items-center gap-2">
                    <Calculator className="text-cyan-400" size={24} /> PintarHitung
                </h1>
             </div>
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                    className="will-change-transform" 
                >
                    {renderContent()}
                </motion.div>
             </AnimatePresence>
          </div>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
        .font-space { font-family: 'Space Grotesk', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

export default App;
