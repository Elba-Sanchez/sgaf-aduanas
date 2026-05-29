/*
Esto es solo una prueba, borra esto y pondremos el código que nos dio la otra vez :p
Es un 'hola mundo'.
*/
import React, { useState } from 'react';
import { Terminal, CheckCircle2 } from 'lucide-react';

function App() {
  const [contador, setContador] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full text-center space-y-6">
        
        {/* Ícono de Lucide */}
        <div className="flex justify-center">
          <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 animate-pulse">
            <Terminal size={40} />
          </div>
        </div>

        {/* Títulos con clases de Tailwind */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            ¡Hola Mundo!
          </h1>
          <p className="text-slate-400 text-sm">
            Si estás viendo esto con colores y diseño, todo tu entorno está perfectamente configurado.
          </p>
        </div>

        {/* Verificación de Estado de React */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Prueba de Estado (React useState)
          </span>
          <div className="text-2xl font-mono text-emerald-400 font-bold">
            Clicks: {contador}
          </div>
          <button 
            onClick={() => setContador(contador + 1)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 active:scale-[0.98]"
          >
            Presióname para probar
          </button>
        </div>

        {/* Footer de éxito */}
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400/80 bg-emerald-500/5 py-2 rounded-lg">
          <CheckCircle2 size={14} />
          <span>Vite + React + pnpm + Tailwind detectados</span>
        </div>

      </div>
    </div>
  );
}

export default App;