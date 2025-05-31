
import React, { useState } from 'react';
import { Plus, Trash2, Play, Globe, FolderOpen } from 'lucide-react';
import { generateCodesFromPattern, organizeCodesByCountry } from '../utils/codeGenerator';
import { useToast } from '../hooks/use-toast';

interface Pattern {
  id: string;
  pattern: string;
  quantity: number;
}

const Generator = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [newPattern, setNewPattern] = useState('');
  const [defaultQuantity, setDefaultQuantity] = useState(40);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [codesByCountry, setCodesByCountry] = useState<{ [country: string]: string[] }>({});
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const { toast } = useToast();

  const addPattern = () => {
    if (!newPattern.trim()) {
      toast({
        title: "Erro",
        description: "Preencha o padrão do código",
        variant: "destructive"
      });
      return;
    }

    const pattern: Pattern = {
      id: Date.now().toString(),
      pattern: newPattern.trim(),
      quantity: defaultQuantity
    };

    setPatterns([...patterns, pattern]);
    setNewPattern('');
    
    toast({
      title: "Padrão Adicionado",
      description: `Padrão ${pattern.pattern} adicionado com sucesso`,
    });
  };

  const removePattern = (id: string) => {
    setPatterns(patterns.filter(p => p.id !== id));
  };

  const updatePatternQuantity = (id: string, quantity: number) => {
    setPatterns(patterns.map(p => 
      p.id === id ? { ...p, quantity } : p
    ));
  };

  const generateAllCodes = () => {
    if (patterns.length === 0) {
      toast({
        title: "Aviso",
        description: "Adicione pelo menos um padrão antes de gerar códigos",
        variant: "destructive"
      });
      return;
    }

    const allCodes: string[] = [];
    
    patterns.forEach(pattern => {
      const codes = generateCodesFromPattern(pattern.pattern, pattern.quantity);
      allCodes.push(...codes);
    });

    setGeneratedCodes(allCodes);
    
    // Organizar por país
    const organized = organizeCodesByCountry(allCodes);
    setCodesByCountry(organized);
    
    // Salvar no localStorage
    localStorage.setItem('generatedCodes', JSON.stringify(allCodes));
    localStorage.setItem('codesByCountry', JSON.stringify(organized));
    
    toast({
      title: "Códigos Gerados",
      description: `${allCodes.length} códigos gerados e organizados por país`,
    });
  };

  const getCountryList = () => {
    return Object.keys(codesByCountry).sort();
  };

  const getCodesForDisplay = () => {
    if (selectedCountry) {
      return codesByCountry[selectedCountry] || [];
    }
    return generatedCodes;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerador de Códigos</h1>
          <p className="text-gray-400 mt-1">Crie códigos de rastreio sequenciais baseados em padrões</p>
        </div>

        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Adicionar Padrão</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Padrão do Código (será gerado sequencialmente)
              </label>
              <input
                type="text"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder="Ex: RR123456789DE"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Os números serão substituídos por sequência crescente (000000001, 000000002, etc.)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                value={defaultQuantity}
                onChange={(e) => setDefaultQuantity(Number(e.target.value))}
                min="1"
                max="10000"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={addPattern}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Padrão
          </button>
        </div>

        {patterns.length > 0 && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Padrões Configurados ({patterns.length})
              </h3>
              
              <button
                onClick={generateAllCodes}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                Gerar Todos os Códigos
              </button>
            </div>

            <div className="space-y-3">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-white">{pattern.pattern}</span>
                      <span className="text-sm text-gray-400">
                        (Sequencial)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-300">Qtd:</label>
                      <input
                        type="number"
                        value={pattern.quantity}
                        onChange={(e) => updatePatternQuantity(pattern.id, Number(e.target.value))}
                        min="1"
                        max="10000"
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <button
                      onClick={() => removePattern(pattern.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(codesByCountry).length > 0 && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Códigos Organizados por País
              </h3>
              
              <div className="flex items-center gap-4">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os países</option>
                  {getCountryList().map(country => (
                    <option key={country} value={country}>
                      {country} ({codesByCountry[country].length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {getCountryList().map(country => (
                <div 
                  key={country} 
                  className={`p-4 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer transition-colors hover:bg-gray-750 ${
                    selectedCountry === country ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCountry(selectedCountry === country ? '' : country)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-white">{country}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {codesByCountry[country].length} códigos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {getCodesForDisplay().length > 0 && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedCountry ? `Códigos - ${selectedCountry}` : 'Todos os Códigos'} ({getCodesForDisplay().length})
            </h3>
            
            <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {getCodesForDisplay().map((code, index) => (
                  <div key={index} className="text-sm font-mono text-gray-300 bg-gray-700 px-2 py-1 rounded border border-gray-600">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generator;
