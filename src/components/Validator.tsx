
import React, { useState, useEffect } from 'react';
import { Check, X, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { validate17Track } from '../utils/trackingApi';
import { useToast } from '../hooks/use-toast';

interface ValidationResult {
  code: string;
  status: 'valid' | 'invalid' | 'pending' | 'error';
  country?: string;
  carrier?: string;
  trackingInfo?: any;
}

const Validator = () => {
  const [codesToValidate, setCodesToValidate] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validatedCount, setValidatedCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar códigos gerados do localStorage
    const generatedCodes = JSON.parse(localStorage.getItem('generatedCodes') || '[]');
    setCodesToValidate(generatedCodes);
  }, []);

  const validateCode = async (code: string): Promise<ValidationResult> => {
    try {
      const result = await validate17Track(code);
      
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
          status: 'invalid'
        };
      }
    } catch (error) {
      return {
        code,
        status: 'error'
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
      
      // Adicionar delay para respeitar rate limit da API
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo entre requests
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
    
    toast({
      title: "Validação Concluída",
      description: `${validCodes.length} códigos válidos encontrados de ${codesToValidate.length} testados`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'invalid':
        return <X className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'invalid':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Validador de Códigos</h1>
        <p className="text-gray-600 mt-1">Valide códigos usando a API do 17TRACK</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Códigos para Validar ({codesToValidate.length})
          </h3>
          
          <button
            onClick={handleValidateAll}
            disabled={isValidating || codesToValidate.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? `Validando... (${validatedCount}/${codesToValidate.length})` : 'Validar Todos'}
          </button>
        </div>

        {isValidating && (
          <div className="mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Validando códigos... {validatedCount}/{codesToValidate.length}</span>
              </div>
              <div className="mt-2 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(validatedCount / codesToValidate.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Importante sobre a API do 17TRACK:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Plano gratuito: ~100-200 consultas por dia</li>
                <li>Rate limit: recomendado 1 request por segundo</li>
                <li>Para uso intensivo, considere upgrade para plano pago</li>
              </ul>
            </div>
          </div>
        </div>

        {validationResults.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {validationResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium text-gray-900">{result.code}</p>
                    {result.country && (
                      <p className="text-sm text-gray-600">
                        {result.country} • {result.carrier}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                  {result.status === 'valid' ? 'Válido' :
                   result.status === 'invalid' ? 'Inválido' :
                   result.status === 'error' ? 'Erro' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Validator;
