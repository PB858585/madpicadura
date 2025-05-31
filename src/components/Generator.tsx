
import React, { useState } from 'react';
import { Plus, Trash2, Play, AlertCircle } from 'lucide-react';
import { generateTrackingCodes } from '../utils/codeGenerator';
import { useToast } from '../hooks/use-toast';

const Generator = () => {
  const [patterns, setPatterns] = useState(['']);
  const [quantity, setQuantity] = useState(40);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const addPattern = () => {
    setPatterns([...patterns, '']);
  };

  const removePattern = (index: number) => {
    setPatterns(patterns.filter((_, i) => i !== index));
  };

  const updatePattern = (index: number, value: string) => {
    const newPatterns = [...patterns];
    newPatterns[index] = value;
    setPatterns(newPatterns);
  };

  const handleGenerate = async () => {
    const validPatterns = patterns.filter(p => p.trim().length > 0);
    
    if (validPatterns.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um padrão válido",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const codes = generateTrackingCodes(validPatterns, quantity);
      setGeneratedCodes(codes);
      
      // Salvar no localStorage
      const existingCodes = JSON.parse(localStorage.getItem('generatedCodes') || '[]');
      localStorage.setItem('generatedCodes', JSON.stringify([...existingCodes, ...codes]));
      
      toast({
        title: "Sucesso!",
        description: `${codes.length} códigos gerados com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar códigos",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerador de Códigos</h1>
        <p className="text-gray-600 mt-1">Crie códigos de rastreio baseados em padrões</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Padrões de Códigos</h3>
        
        <div className="space-y-3 mb-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={pattern}
                onChange={(e) => updatePattern(index, e.target.value)}
                placeholder="Ex: RR123456789DE"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {patterns.length > 1 && (
                <button
                  onClick={() => removePattern(index)}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addPattern}
          className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Padrão
        </button>

        <div className="mt-6 flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade por padrão
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 40)}
              min="1"
              max="1000"
              className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            {isGenerating ? 'Gerando...' : 'Gerar Códigos'}
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Como usar os padrões:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use números como template: RR123456789DE</li>
                <li>Os números serão randomizados automaticamente</li>
                <li>Prefixos e sufixos (letras) são mantidos</li>
                <li>Exemplo: RR123456789DE → RR847392651DE</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {generatedCodes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Códigos Gerados ({generatedCodes.length})
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {generatedCodes.join('\n')}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
