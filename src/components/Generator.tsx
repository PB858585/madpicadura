
import React, { useState } from 'react';
import { Plus, Trash2, Play, Settings } from 'lucide-react';
import { generateCodesFromPattern } from '../utils/codeGenerator';
import { useToast } from '../hooks/use-toast';

interface Pattern {
  id: string;
  pattern: string;
  country: string;
  quantity: number;
}

const Generator = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [newPattern, setNewPattern] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [defaultQuantity, setDefaultQuantity] = useState(40);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const { toast } = useToast();

  const countries = [
    { code: 'DE', name: 'Alemanha' },
    { code: 'CN', name: 'China' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'BR', name: 'Brasil' },
    { code: 'RU', name: 'Rússia' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'FR', name: 'França' },
    { code: 'JP', name: 'Japão' },
    { code: 'KR', name: 'Coreia do Sul' },
    { code: 'IT', name: 'Itália' }
  ];

  const addPattern = () => {
    if (!newPattern.trim() || !selectedCountry) {
      toast({
        title: "Erro",
        description: "Preencha o padrão e selecione um país",
        variant: "destructive"
      });
      return;
    }

    const pattern: Pattern = {
      id: Date.now().toString(),
      pattern: newPattern.trim(),
      country: selectedCountry,
      quantity: defaultQuantity
    };

    setPatterns([...patterns, pattern]);
    setNewPattern('');
    setSelectedCountry('');
    
    toast({
      title: "Padrão Adicionado",
      description: `Padrão ${pattern.pattern} para ${countries.find(c => c.code === selectedCountry)?.name} adicionado`,
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
    
    // Salvar no localStorage
    localStorage.setItem('generatedCodes', JSON.stringify(allCodes));
    
    toast({
      title: "Códigos Gerados",
      description: `${allCodes.length} códigos gerados com sucesso`,
    });
  };

  const getCountryName = (code: string) => {
    return countries.find(c => c.code === code)?.name || code;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gerador de Códigos</h1>
        <p className="text-gray-400 mt-1">Crie códigos de rastreio baseados em padrões específicos por país</p>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Adicionar Padrão</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Padrão do Código
            </label>
            <input
              type="text"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="Ex: RR123456789DE"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              País de Origem
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o país</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
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
              max="1000"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
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
              <div key={pattern.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-white">{pattern.pattern}</span>
                    <span className="text-sm text-gray-400">
                      {getCountryName(pattern.country)}
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
                      max="1000"
                      className="w-20 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {generatedCodes.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Códigos Gerados ({generatedCodes.length})
          </h3>
          
          <div className="bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {generatedCodes.map((code, index) => (
                <div key={index} className="text-sm font-mono text-gray-300 bg-gray-600 px-2 py-1 rounded">
                  {code}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
