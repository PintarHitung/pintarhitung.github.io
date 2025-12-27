import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calculator, 
  GraduationCap, 
  School, 
  LayoutDashboard, 
  Menu, 
  X, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  BookOpen, 
  Percent, 
  Save, 
  Trash2,
  Plus,
  ChevronRight,
  Target,
  Instagram,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- GLOBAL UTILITIES & CONSTANTS (Performance & Stability) ---

// 1. Upgrade ID Generator (Crypto Standard with Fallback)
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Manual UUID v4 Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 2. Fix Akurasi Matematika (Floating Point Guard)
const safeRound = (num, decimals = 2) => {
  if (isNaN(num)) return 0;
  return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
};

// 3. External Pure Calculation Functions (Render Optimization)
const calculateSemesterAvg = (subjects) => {
  const validScores = subjects.map(s => parseFloat(s.score)).filter(v => !isNaN(v));
  if (validScores.length === 0) return 0;
  const sum = validScores.reduce((a, b) => a + b, 0);
  return safeRound(sum / validScores.length, 2);
};

const calculatePSAJScore = (tulis, praktik, ratio) => {
  const t = parseFloat(tulis) || 0;
  const p = parseFloat(praktik) || 0;
  const result = ((t * ratio / 100) + (p * (100 - ratio) / 100));
  return safeRound(result, 2);
};

// Static Data
const ASPD_MULTIPLIERS = { lit: 1.72, num: 1.14, sains: 1.14 };
const UTBK_PRESETS = { kedokteran: 750, teknik: 680, soshum: 650, custom: 0 };
const GPA_GRADE_VALUES = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'E': 0 };

const MENU_ITEMS = [
  { id: 'beranda', label: 'Beranda', icon: LayoutDashboard },
  { id: 'rapor', label: 'Hitung Rapor', icon: FileText },
  { id: 'aspd', label: 'ASPD Pro', icon: School },
  { id: 'utbk', label: 'UTBK SNBT', icon: GraduationCap },
  { id: 'psaj', label: 'PSAJ / Ujian', icon: BookOpen },
  { id: 'ipk', label: 'Hitung IPK', icon: Percent },
];

const getMobileLabel = (id, label) => {
  if (id === 'rapor') return 'Rapor';
  if (id === 'ipk') return 'IPK';
  return label.split(" ")[0];
};

// --- CUSTOM HOOK ---

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item);
        
        // 3. LocalStorage "Safe Merge" (Anti-Crash Strategy)
        if (typeof initialValue === 'object' && !Array.isArray(initialValue) && initialValue !== null) {
            return { ...initialValue, ...parsedItem };
        }
        return parsedItem;
      }
      return initialValue;
    } catch (error) {
      console.error("LocalStorage Error:", error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue((currValue) => {
        const valueToStore = value instanceof Function ? value(currValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error("LocalStorage Set Error:", error);
    }
  }, [key]);

  return [storedValue, setValue];
};

// --- SUB-COMPONENTS ---

/* 1. ASPD PRO CALCULATOR */
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || parseFloat(value) >= 0) {
      setScores(prev => ({ ...prev, [name]: value }));
    }
  };

  // Calculations wrapped in useMemo using safeRound
  const calcRapor = useMemo(() => {
    const keys = ['rapor_sem1', 'rapor_sem2', 'rapor_sem3', 'rapor_sem4', 'rapor_sem5'];
    const validValues = keys.map(k => parseFloat(scores[k])).filter(v => !isNaN(v));
    
    // Logic: Average 5 sem * 4 = Scale 400
    const average = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / 5 : 0;
    const safeAvg = safeRound(average, 2);
    const base400 = safeRound(safeAvg * 4, 2);
    const contribution = safeRound(base400 * (weights.rapor / 100), 2);
    
    return { average: safeAvg, base400, contribution };
  }, [scores, weights.rapor]);

  const calcASPD = useMemo(() => {
    const sLit = (parseFloat(scores.aspd_lit) || 0) * ASPD_MULTIPLIERS.lit;
    const sNum = (parseFloat(scores.aspd_num) || 0) * ASPD_MULTIPLIERS.num;
    const sSains = (parseFloat(scores.aspd_sains) || 0) * ASPD_MULTIPLIERS.sains;
    
    const totalScore = safeRound(sLit + sNum + sSains, 2);
    const contribution = safeRound(totalScore * (weights.aspd / 100), 2);
    
    return { totalScore, contribution };
  }, [scores, weights.aspd]);

  const calcAkreditasi = useMemo(() => {
    const val = parseFloat(scores.akreditasi) || 0;
    const base400 = safeRound(val * 4, 2);
    const contribution = safeRound(base400 * (weights.akreditasi / 100), 2);
    return { val, base400, contribution };
  }, [scores, weights.akreditasi]);

  const finalScore = safeRound(
    calcRapor.contribution + 
    calcASPD.contribution + 
    calcAkreditasi.contribution, 2
  ).toFixed(2);

  const inputClass = "w-full bg-slate-800/50 md:bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:bg-cyan-500/10 transition-colors focus:outline-none text-sm placeholder:text-white/20";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold font-space text-white">ASPD Pro (Resmi)</h2>
          <p className="text-white/60 text-sm">3 Mapel Utama (Lit, Num, Sains) dengan Nilai Tukar</p>
        </div>
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className={`p-2 rounded-xl transition-all border ${showConfig ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 md:bg-white/5 border-white/10 text-white/50'}`}
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
            className="bg-slate-900 md:bg-black/20 border border-white/10 rounded-2xl p-4 overflow-hidden mb-4"
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
                    inputMode="decimal"
                    min="0"
                    max="100"
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
          <div className="bg-slate-900/80 md:bg-white/5 md:backdrop-blur-md border border-white/10 p-5 rounded-3xl">
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
                    inputMode="decimal"
                    min="0"
                    max="100"
                    className={`${inputClass} text-center px-1`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/80 md:bg-white/5 md:backdrop-blur-md border border-white/10 p-5 rounded-3xl">
            <h3 className="text-sm font-bold text-violet-400 mb-3 flex items-center gap-2">
              <School size={16} /> NILAI ASPD MURNI
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Literasi Membaca', key: 'lit', multi: ASPD_MULTIPLIERS.lit },
                { label: 'Literasi Numerasi', key: 'num', multi: ASPD_MULTIPLIERS.num },
                { label: 'Literasi Sains', key: 'sains', multi: ASPD_MULTIPLIERS.sains }
              ].map((item) => (
                /* RESPONSIVE LAYOUT FIX: Label Top on Mobile, Left on Desktop */
                <div key={item.key} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-white/70 block mb-1">{item.label}</label>
                    <div className="relative">
                      <input
                        name={`aspd_${item.key}`}
                        value={scores[`aspd_${item.key}`]}
                        onChange={handleChange}
                        placeholder="0-100"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="100"
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
          </div>

          <div className="bg-slate-900/80 md:bg-white/5 md:backdrop-blur-md border border-white/10 p-5 rounded-3xl flex items-center justify-between gap-4">
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
              inputMode="decimal"
              min="0"
              max="100"
              className="w-24 bg-slate-800/50 md:bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-right focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="h-full bg-slate-900/95 md:bg-gradient-to-b md:from-slate-800/80 md:to-slate-900/80 md:backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col relative overflow-hidden transform translate-z-0">
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

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPreset(val);
    if (val !== 'custom') setTarget(UTBK_PRESETS[val]);
  };

  const avg = useMemo(() => {
    const vals = Object.values(inputs).map(v => parseFloat(v) || 0);
    const sum = vals.reduce((a, b) => a + b, 0);
    const count = vals.filter(v => v > 0).length;
    // Calculate Average with safeRound
    const average = count === 0 ? 0 : (sum / 7);
    return safeRound(average, 2).toFixed(2);
  }, [inputs]);

  const diff = safeRound(parseFloat(avg) - target, 2).toFixed(2);
  const diffVal = parseFloat(diff);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-space text-white">Simulasi UTBK SNBT</h2>
          <p className="text-white/60 text-sm">Targetkan skor impianmu untuk PTN</p>
        </div>
        <div className="flex gap-2 bg-slate-900 md:bg-white/5 p-1 rounded-xl border border-white/10">
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
            inputMode="decimal"
            min="0"
            max="1000"
            className="w-20 bg-transparent text-white font-bold text-center outline-none placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900/80 md:bg-white/5 md:backdrop-blur-md border border-white/10 p-6 rounded-3xl">
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
                    inputMode="decimal"
                    min="0"
                    max="1000"
                    className="w-full bg-slate-800/50 md:bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none transition-all"
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
                    inputMode="decimal"
                    min="0"
                    max="1000"
                    className="w-full bg-slate-800/50 md:bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4">
            <div className={`
              flex-1 rounded-3xl p-6 border flex flex-col items-center justify-center relative overflow-hidden transform translate-z-0
              ${avg >= target && target > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/95 md:bg-white/5 border-white/10'}
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
    { id: '1', name: 'Matematika', tulis: '', praktik: '' },
    { id: '2', name: 'B. Indonesia', tulis: '', praktik: '' }
  ]);

  const addSubject = () => setSubjects(prev => [...prev, { id: generateId(), name: 'Mapel Baru', tulis: '', praktik: '' }]);
  const removeSubject = (id) => setSubjects(prev => prev.filter(s => s.id !== id));
  const updateSubject = (id, field, value) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-space text-white">PSAJ / Ujian Sekolah</h2>
          <p className="text-white/60 text-sm">Penilaian Sumatif Akhir Jenjang</p>
        </div>
      </div>
      <div className="bg-slate-900/80 md:bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
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
            className="bg-slate-900/80 md:bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center transform translate-z-0"
          >
            {/* RESPONSIVE LAYOUT: STACK IN MOBILE */}
            <div className="flex-1 w-full">
              <input value={sub.name} onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                className="bg-transparent border-b border-white/10 text-white font-medium w-full focus:outline-none focus:border-cyan-500 px-1 py-1"
                placeholder="Nama Mapel"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <input type="number" inputMode="decimal" min="0" max="100" placeholder="Tulis" value={sub.tulis} onChange={(e) => updateSubject(sub.id, 'tulis', e.target.value)}
                className="flex-1 md:w-20 bg-black/20 rounded-lg px-2 py-2 text-center text-white border border-white/10"
              />
              <input type="number" inputMode="decimal" min="0" max="100" placeholder="Praktik" value={sub.praktik} onChange={(e) => updateSubject(sub.id, 'praktik', e.target.value)}
                className="flex-1 md:w-20 bg-black/20 rounded-lg px-2 py-2 text-center text-white border border-white/10"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-between mt-2 md:mt-0">
              <div className="text-xl font-bold font-space text-cyan-300 w-16 text-center">
                {calculatePSAJScore(sub.tulis, sub.praktik, ratio).toFixed(1)}
              </div>
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

/* 4. RAPOR CALCULATOR (MEMOIZED CHILD) */
const SemesterItem = React.memo(({ 
  sem, 
  prevSem, 
  onUpdateSubject, 
  onRemoveSubject, 
  onAddSubject, 
  onAutoFill, 
  onRemoveSemester 
}) => {
  // Use External Calc Function for Performance
  const avg = calculateSemesterAvg(sem.subjects).toFixed(2);
  const prevAvg = prevSem ? calculateSemesterAvg(prevSem.subjects) : 0;
  const isUp = parseFloat(avg) >= prevAvg;
  const showTrend = prevSem && parseFloat(avg) > 0 && prevAvg > 0;

  return (
    <div className="bg-slate-900/80 md:bg-gradient-to-br md:from-pink-500/10 md:to-rose-500/10 md:backdrop-blur-md border border-pink-500/20 p-6 rounded-3xl transform translate-z-0">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-pink-500/20">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-pink-200">{sem.name}</h3>
            {showTrend && (
              <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {isUp ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                  {safeRound(Math.abs(parseFloat(avg) - prevAvg), 2).toFixed(2)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-white">{avg}</span>
            <button onClick={() => onRemoveSemester(sem.id)} className="text-white/20 hover:text-rose-400"><Trash2 size={18}/></button>
          </div>
      </div>

      <div className="space-y-3 mb-4">
          {sem.subjects.map(sub => (
            /* RESPONSIVE LAYOUT: STACK IN MOBILE */
            <div key={sub.id} className="flex flex-col md:flex-row gap-2">
                <input 
                  placeholder="Nama Mapel" 
                  value={sub.name}
                  onChange={(e) => onUpdateSubject(sem.id, sub.id, 'name', e.target.value)}
                  className="w-full md:flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                />
                <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="0-100" 
                      inputMode="decimal"
                      min="0"
                      max="100"
                      value={sub.score}
                      onChange={(e) => onUpdateSubject(sem.id, sub.id, 'score', e.target.value)}
                      className="flex-1 md:w-20 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white text-sm text-center focus:border-pink-500 focus:outline-none"
                    />
                    <button onClick={() => onRemoveSubject(sem.id, sub.id)} className="px-3 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/20 hover:text-rose-400 transition-colors"><X size={16}/></button>
                </div>
            </div>
          ))}
      </div>

      <div className="flex gap-2">
          <button onClick={() => onAddSubject(sem.id)} className="flex-1 py-2 rounded-lg border border-dashed border-white/20 text-white/50 text-sm hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2">
            <Plus size={14} /> Mapel
          </button>
          {sem.subjects.length === 0 && (
            <button onClick={() => onAutoFill(sem.id)} className="flex-1 py-2 rounded-lg bg-pink-500/20 text-pink-300 text-sm hover:bg-pink-500/30 transition-all">
              Isi Mapel Utama
            </button>
          )}
      </div>
    </div>
  );
});

const RaporCalculator = () => {
  const [semesters, setSemesters] = useLocalStorage('rapor_data', [
    { id: 'sem_1', name: 'Semester 1', subjects: [] }
  ]);

  // Stable Handlers
  const addSemester = useCallback(() => {
    setSemesters(prev => [
      ...prev, 
      { id: generateId(), name: `Semester ${prev.length + 1}`, subjects: [] }
    ]);
  }, [setSemesters]);

  const removeSemester = useCallback((id) => {
    setSemesters(prev => prev.filter(s => s.id !== id));
  }, [setSemesters]);

  const addSubject = useCallback((semId) => {
    setSemesters(prev => prev.map(s => 
      s.id === semId ? { ...s, subjects: [...s.subjects, { id: generateId(), name: '', score: '' }] } : s
    ));
  }, [setSemesters]);

  const autoFillSubjects = useCallback((semId) => {
    const commonSubjects = ['Matematika', 'B. Indonesia', 'B. Inggris', 'IPA', 'IPS'];
    setSemesters(prev => prev.map(s => {
      if (s.id !== semId) return s;
      const newSubjects = commonSubjects.map(name => ({ id: generateId(), name, score: '' }));
      return { ...s, subjects: [...s.subjects, ...newSubjects] };
    }));
  }, [setSemesters]);

  const updateSubject = useCallback((semId, subId, field, value) => {
    setSemesters(prev => prev.map(s => {
      if (s.id !== semId) return s;
      return {
        ...s,
        subjects: s.subjects.map(sub => sub.id === subId ? { ...sub, [field]: value } : sub)
      };
    }));
  }, [setSemesters]);

  const removeSubject = useCallback((semId, subId) => {
    setSemesters(prev => prev.map(s => 
      s.id === semId ? { ...s, subjects: s.subjects.filter(sub => sub.id !== subId) } : s
    ));
  }, [setSemesters]);

  // Grand Average (Using SafeRound)
  const grandAverage = useMemo(() => {
    let validSemestersCount = 0;
    let totalSemesterAverages = 0;

    semesters.forEach(sem => {
      // Use the external function for consistency
      const semAvg = calculateSemesterAvg(sem.subjects);
      if (semAvg > 0) {
        totalSemesterAverages += semAvg;
        validSemestersCount++;
      }
    });

    return validSemestersCount === 0 ? 0 : safeRound(totalSemesterAverages / validSemestersCount, 2).toFixed(2);
  }, [semesters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold font-space text-white">Rata-Rata Rapor</h2>
           <p className="text-white/60 text-sm">Hitung rata-rata per semester & total</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-pink-400 uppercase tracking-widest">Grand Average</p>
           <p className="text-xl md:text-3xl font-bold text-white font-space">{grandAverage}</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {semesters.map((sem, index) => (
           <SemesterItem 
              key={sem.id}
              sem={sem}
              prevSem={index > 0 ? semesters[index - 1] : null}
              onUpdateSubject={updateSubject}
              onRemoveSubject={removeSubject}
              onAddSubject={addSubject}
              onAutoFill={autoFillSubjects}
              onRemoveSemester={removeSemester}
           />
        ))}
      </div>

      <button onClick={addSemester} className="w-full py-4 rounded-2xl bg-slate-900/95 md:bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
         <Plus size={20}/> Tambah Semester
      </button>
    </div>
  );
};

/* 5. GPA / IPK CALCULATOR */
const GPACalculator = () => {
    const [courses, setCourses] = useLocalStorage('ipk_courses', [{ id: 'c1', name: '', sks: '', grade: 'A' }]);
    const addCourse = () => setCourses(prev => [...prev, { id: generateId(), name: '', sks: '', grade: 'A' }]);
    const removeCourse = (id) => setCourses(prev => prev.filter(c => c.id !== id));
    const updateCourse = (id, field, value) => setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    
    // Apply SafeRound to totals
    const totalSKS = courses.reduce((acc, curr) => acc + (parseFloat(curr.sks) || 0), 0);
    const totalPoints = courses.reduce((acc, curr) => acc + ((parseFloat(curr.sks) || 0) * GPA_GRADE_VALUES[curr.grade]), 0);
    
    const ipk = totalSKS > 0 ? safeRound(totalPoints / totalSKS, 2).toFixed(2) : "0.00";
  
    return (
      <div className="space-y-6">
        <div>
           <h2 className="text-2xl font-bold font-space text-white">Kalkulator IPK</h2>
           <p className="text-white/60 text-sm">Hitung Indeks Prestasi per Semester</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
             <div className="md:col-span-2 space-y-3">
                {courses.map(c => (
                     /* RESPONSIVE LAYOUT: STACK IN MOBILE */
                     <div key={c.id} className="bg-slate-900/95 md:bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col md:flex-row gap-2 items-center">
                        <input placeholder="Mata Kuliah" value={c.name} onChange={(e) => updateCourse(c.id, 'name', e.target.value)}
                             className="w-full md:flex-1 bg-transparent px-2 py-1 outline-none text-white text-sm border-b md:border-none border-white/10" />
                        <div className="grid grid-cols-3 gap-2 w-full md:w-auto mt-2 md:mt-0">
                            <input placeholder="SKS" type="number" inputMode="decimal" min="0" value={c.sks} onChange={(e) => updateCourse(c.id, 'sks', e.target.value)}
                                className="bg-black/20 rounded-lg px-2 py-1 text-center text-white border border-white/10 text-sm w-full" />
                            <select value={c.grade} onChange={(e) => updateCourse(c.id, 'grade', e.target.value)}
                                className="bg-black/20 text-white rounded-lg px-2 py-1 text-sm border border-white/10 outline-none w-full">
                                {Object.keys(GPA_GRADE_VALUES).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <button onClick={() => removeCourse(c.id)} className="p-2 text-white/30 hover:text-rose-400 bg-white/5 rounded-lg flex items-center justify-center w-full"><Trash2 size={16}/></button>
                        </div>
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
                         <span>SKS: {safeRound(totalSKS, 2)}</span>
                         <span>Bobot: {safeRound(totalPoints, 2)}</span>
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

  // Fix: Auto-scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'beranda':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* RESPONSIVE PADDING: p-6 mobile, p-8 desktop */}
             <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-b border-white/10 md:bg-gradient-to-r md:from-cyan-500/20 md:to-blue-500/20 md:border md:border-cyan-500/30 p-6 md:p-8 rounded-3xl md:backdrop-blur-md relative overflow-hidden transform translate-z-0">
                {/* Fixed: Pointer events none to allow clicks below */}
                <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                    <Calculator size={300} />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold font-space text-white mb-4">
                    Halo, <span className="text-cyan-400">Sang Juara!</span>
                </h1>
                <p className="text-white/70 text-base md:text-lg max-w-xl">
                    Selamat datang di PintarHitung v2.6. Alat bantu hitung nilai akademik modern yang sudah disesuaikan dengan aturan resmi terbaru.
                </p>
                {/* RESPONSIVE BUTTON LAYOUT: Stack on mobile, Row on desktop */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button 
                        onClick={() => setActiveTab('rapor')}
                        className="flex-1 bg-white text-slate-900 px-4 py-3 md:px-6 rounded-full font-bold hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
                    >
                        Mulai Hitung Rapor <ChevronRight size={18}/>
                    </button>
                    <a 
                        href="https://www.instagram.com/fawwazdzaaky/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-3 md:px-6 rounded-full font-bold border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2 text-white md:backdrop-blur-sm text-sm md:text-base whitespace-nowrap"
                    >
                        <Instagram size={18} />
                        <span>Follow Developer</span>
                    </a>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                     { 
                       title: 'Hitung Rapor', 
                       desc: 'Rekap nilai & grafik trend', 
                       id: 'rapor', 
                       mobileStyle: 'bg-gradient-to-br from-pink-500/20 to-slate-900 border-pink-500/20',
                       desktopColor: 'from-pink-500/20 to-rose-500/20' 
                     },
                     { 
                       title: 'Simulasi ASPD', 
                       desc: 'Formula resmi 3 Mapel', 
                       id: 'aspd', 
                       mobileStyle: 'bg-gradient-to-br from-emerald-500/20 to-slate-900 border-emerald-500/20',
                       desktopColor: 'from-emerald-500/20 to-teal-500/20' 
                     },
                     { 
                       title: 'Target UTBK', 
                       desc: 'Set skor impian PTN', 
                       id: 'utbk', 
                       mobileStyle: 'bg-gradient-to-br from-orange-500/20 to-slate-900 border-orange-500/20',
                       desktopColor: 'from-orange-500/20 to-amber-500/20' 
                     },
                     { 
                       title: 'Kalkulator IPK', 
                       desc: 'Pantau performa kuliah', 
                       id: 'ipk', 
                       mobileStyle: 'bg-gradient-to-br from-violet-500/20 to-slate-900 border-violet-500/20',
                       desktopColor: 'from-violet-500/20 to-purple-500/20' 
                     }
                 ].map(card => (
                     <button 
                        key={card.id}
                        onClick={() => setActiveTab(card.id)}
                        className={`${card.mobileStyle} border md:bg-gradient-to-br ${card.desktopColor} md:border-white/10 p-6 rounded-2xl text-left hover:border-white/30 transition-all group hover:scale-[1.02] active:scale-95`}
                     >
                         <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{card.title}</h3>
                         <p className="text-white/50 text-sm">{card.desc}</p>
                     </button>
                 ))}
             </div>
          </div>
        );
      case 'rapor': return <RaporCalculator />;
      case 'aspd': return <ASPDCalculator />;
      case 'utbk': return <UTBKCalculator />;
      case 'psaj': return <PSAJCalculator />;
      case 'ipk': return <GPACalculator />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200 font-inter relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* PERFORMANCE OPTIMIZED BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="md:hidden absolute inset-0 bg-transparent"></div>
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
            {MENU_ITEMS.map(item => (
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
          <div className="p-6 text-center text-xs text-white/30">v2.6 Stable • React</div>
        </aside>

        {/* FIXED: GRID BOTTOM NAV (Aligned & Distributed + pb-6) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-white/10 z-50 px-0 pt-2 pb-6 grid grid-cols-6 gap-0 safe-area-bottom">
           {MENU_ITEMS.map(item => (
               <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)} 
                  className={`flex flex-col items-center justify-center gap-1 p-2 transition-colors ${activeTab === item.id ? 'text-cyan-400' : 'text-white/40'}`}
               >
                   <item.icon size={20} />
                   <span className="text-[10px] whitespace-nowrap">{getMobileLabel(item.id, item.label)}</span>
               </button>
           ))}
        </div>

        {/* GLOBAL SAFE PADDING: px-4 on mobile */}
        <main className="flex-1 md:ml-72 p-4 md:p-10 mb-20 md:mb-0">
          <div className="max-w-5xl mx-auto px-2 md:px-0">
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
        
        /* Hide Number Input Spinners */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        /* Safe Area Fix */
        .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
            padding-bottom: constant(safe-area-inset-bottom); 
        }
      `}</style>
    </div>
  );
};

export default App;
