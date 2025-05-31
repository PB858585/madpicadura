
import React, { useState } from 'react';
import { Key, Trash2, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Settings = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('17track_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    localStorage.setItem('17track_api_key', apiKey);
    toast({
      title: "Sucesso!",
      description: "Chave da API salva com sucesso",
    });
  };

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('generatedCodes');
      localStorage.removeItem('validatedCodes');
      localStorage.removeItem('17track_api_key');
      setApiKey('');
      
      toast({
        title: "Dados Limpos",
        description: "Todos os dados foram removidos",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Configure as opções do sistema</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API do 17TRACK</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chave da API
            </label>
            <div className="flex gap-3">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Insira sua chave da API do 17TRACK"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveApiKey}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Salvar Chave
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Key className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Como obter a chave da API:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Acesse <a href="https://www.17track.net" target="_blank" rel="noopener noreferrer" className="underline">17track.net</a></li>
                <li>Crie uma conta ou faça login</li>
                <li>Vá para a seção de API/Developer</li>
                <li>Gere uma nova chave de API</li>
                <li>Cole a chave no campo acima</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gerenciar Dados</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Zona de Perigo</h4>
                <p className="text-red-700 text-sm mb-3">
                  Esta ação irá remover permanentemente todos os códigos gerados, 
                  validados e configurações salvas.
                </p>
                <button
                  onClick={handleClearData}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Todos os Dados
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre o Sistema</h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Versão:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Última atualização:</span>
            <span className="font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between">
            <span>Códigos armazenados:</span>
            <span className="font-medium">
              {JSON.parse(localStorage.getItem('generatedCodes') || '[]').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Códigos validados:</span>
            <span className="font-medium">
              {JSON.parse(localStorage.getItem('validatedCodes') || '[]').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
