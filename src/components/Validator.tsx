
import React, { useState, useEffect } from 'react';
import { Check, X, Clock, RefreshCw, AlertTriangle, Info, Key } from 'lucide-react';
import { validate17Track, simulateValidation, checkApiQuota } from '../utils/trackingApi';
import { useToast } from '../hooks/use-toast';

interface ValidationResult {
  code: string;
  status: 'valid' | 'invalid' | 'pending' | 'error';
  country?: string;
  carrier?: string;
  trackingInfo?: any;
  errorMessage?: string;
}

const Validator = () => {
  const [codesToValidate, setCodesToValidate] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validatedCount, setValidatedCount] = useState(0);
  const [apiQuota, setApiQuota] = useState<number | null>(null);
  const [useSimulation, setUseSimulation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar códigos gerados do localStorage
    const generatedCodes = JSON.parse(localStorage.getItem('generatedCodes') || '[]');
    setCodesToValidate(generatedCodes);
    
    // Verificar se há chave da API
    const hasApiKey = !!localStorage.getItem('17track_api_key');
    setUseSimulation(!hasApiKey);
    
    // Verificar quota se há chave da API
    if (hasApiKey) {
      checkQuota();
    }
  }, []);

  const checkQuota = async () => {
    try {
      const result = await checkApiQuota();
      if (result.success && result.remaining !== undefined) {
        setApiQuota(result.remaining);
      }
    } catch (error) {
      console.error('Error checking quota:', error);
    }
  };

  const validateCode = async (code: string): Promise<ValidationResult> => {
    try {
      const result = useSimulation 
        ? await simulateValidation(code)
        : await validate17Track(code);
      
      if (result.success && result.data) {
        return {
          code,
          status: 'valid',
          country: result.data.origin_country,
          carrier: result.data.carrier,
          trackingInfo: result.data
        };
      } else {
        return {
          code,
          status: 'invalid',
          errorMessage: result.error
        };
      }
    } catch (error) {
      return {
        code,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const handleValidateAll = async () => {
    if (codesToValidate.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum código para validar",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setValidatedCount(0);
    setValidationResults([]);

    const results: ValidationResult[] = [];
    
    for (let i = 0; i < codesToValidate.length; i++) {
      const code = codesToValidate[i];
      
      // Delay para respeitar rate limit da API (recomendado: 1 segundo)
      if (i > 0 && !useSimulation) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const result = await validateCode(code);
      results.push(result);
      setValidationResults([...results]);
      setValidatedCount(i + 1);
    }

    // Salvar resultados válidos
    const validCodes = results.filter(r => r.status === 'valid');
    localStorage.setItem('validatedCodes', JSON.stringify(validCodes));

    setIsValidating(false);
    
    // Atualizar quota após validação
    if (!useSimulation) {
      checkQuota();
    }
    
    toast({
      title: "Validação Concluída",
      description: `${validCodes.length} códigos válidos encontrados de ${codesToValidate.length} testados`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'invalid':
        return <X className="w-5 h-5 text-red-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-900/50 text-green-300 border-green-600';
      case 'invalid':
        return 'bg-red-900/50 text-red-300 border-red-600';
      case 'error':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-600';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Validador de Códigos</h1>
        <p className="text-gray-400 mt-1">Valide códigos usando a API do 17TRACK</p>
      </div>

      {/* Status da API */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${useSimulation ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span className="text-white font-medium">
              {useSimulation ? 'Modo Simulação' : 'API 17TRACK Ativa'}
            </span>
            {!useSimulation && apiQuota !== null && (
              <span className="text-gray-400">
                • {apiQuota} consultas restantes
              </span>
            )}
          </div>
          {useSimulation && (
            <a
              href="/settings"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              <Key className="w-4 h-4" />
              Configurar API
            </a>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Códigos para Validar ({codesToValidate.length})
          </h3>
          
          <button
            onClick={handleValidateAll}
            disabled={isValidating || codesToValidate.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? `Validando... (${validatedCount}/${codesToValidate.length})` : 'Validar Todos'}
          </button>
        </div>

        {isValidating && (
          <div className="mb-4">
            <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-300">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Validando códigos... {validatedCount}/{codesToValidate.length}</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(validatedCount / codesToValidate.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {useSimulation && (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">Modo Simulação Ativo:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Os resultados são simulados para demonstração</li>
                  <li>Configure sua chave da API do 17TRACK nas Configurações</li>
                  <li>Para usar a API real e validação precisa</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!useSimulation && (
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Informações da API 17TRACK:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Rate limit: 1 request por segundo (respeitado automaticamente)</li>
                  <li>Plano gratuito: limitações de quota diária</li>
                  <li>Para uso intensivo, considere upgrade para plano pago</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {validationResults.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {validationResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium text-white">{result.code}</p>
                    {result.country && result.carrier && (
                      <p className="text-sm text-gray-400">
                        {result.country} • {result.carrier}
                      </p>
                    )}
                    {result.errorMessage && result.status !== 'valid' && (
                      <p className="text-sm text-red-400">
                        {result.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(result.status)}`}>
                  {result.status === 'valid' ? 'Válido' :
                   result.status === 'invalid' ? 'Inválido' :
                   result.status === 'error' ? 'Erro' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        )}

        {codesToValidate.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum código para validar</p>
            <p className="text-sm text-gray-500 mt-1">
              Gere alguns códigos na seção Gerador primeiro
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Validator;
