
import React, { useState, useEffect } from 'react';
import { Download, FileText, Table, Package } from 'lucide-react';
import { organizeCodesInGroups, exportToCSV, exportToTXT } from '../utils/codeGenerator';
import { useToast } from '../hooks/use-toast';

const Export = () => {
  const [validCodes, setValidCodes] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[][]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const codes = JSON.parse(localStorage.getItem('validatedCodes') || '[]');
    const validCodesOnly = codes.filter((c: any) => c.status === 'valid');
    setValidCodes(validCodesOnly);
    
    const codeGroups = organizeCodesInGroups(validCodesOnly, 40);
    setGroups(codeGroups);
  }, []);

  const toggleGroupSelection = (groupIndex: number) => {
    setSelectedGroups(prev => 
      prev.includes(groupIndex) 
        ? prev.filter(i => i !== groupIndex)
        : [...prev, groupIndex]
    );
  };

  const selectAllGroups = () => {
    setSelectedGroups(groups.map((_, index) => index));
  };

  const clearSelection = () => {
    setSelectedGroups([]);
  };

  const getSelectedCodes = () => {
    return selectedGroups.flatMap(groupIndex => groups[groupIndex]);
  };

  const handleExportCSV = () => {
    const codesToExport = getSelectedCodes();
    if (codesToExport.length === 0) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos um grupo para exportar",
        variant: "destructive"
      });
      return;
    }

    exportToCSV(codesToExport, `tracking_codes_${new Date().getTime()}`);
    toast({
      title: "Sucesso!",
      description: `${codesToExport.length} códigos exportados em CSV`,
    });
  };

  const handleExportTXT = () => {
    const codesToExport = getSelectedCodes();
    if (codesToExport.length === 0) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos um grupo para exportar",
        variant: "destructive"
      });
      return;
    }

    const codeStrings = codesToExport.map(code => code.code);
    exportToTXT(codeStrings, `tracking_codes_${new Date().getTime()}`);
    toast({
      title: "Sucesso!",
      description: `${codesToExport.length} códigos exportados em TXT`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exportar Códigos</h1>
        <p className="text-gray-600 mt-1">Exporte códigos válidos organizados em grupos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Grupos de Códigos ({groups.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllGroups}
                  className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm transition-colors"
                >
                  Selecionar Todos
                </button>
                <button
                  onClick={clearSelection}
                  className="text-gray-600 hover:bg-gray-50 px-3 py-1 rounded text-sm transition-colors"
                >
                  Limpar Seleção
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {groups.map((group, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedGroups.includes(index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleGroupSelection(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Grupo {index + 1}</h4>
                        <p className="text-sm text-gray-600">{group.length} códigos válidos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(index)}
                        onChange={() => toggleGroupSelection(index)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    {group.slice(0, 3).map((code: any) => code.code).join(', ')}
                    {group.length > 3 && ` e mais ${group.length - 3}...`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de códigos válidos:</span>
                <span className="font-medium">{validCodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grupos disponíveis:</span>
                <span className="font-medium">{groups.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grupos selecionados:</span>
                <span className="font-medium">{selectedGroups.length}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Códigos para exportar:</span>
                <span className="font-medium text-blue-600">{getSelectedCodes().length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportCSV}
                disabled={selectedGroups.length === 0}
                className="w-full flex items-center gap-3 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Table className="w-5 h-5" />
                Exportar CSV
              </button>
              
              <button
                onClick={handleExportTXT}
                disabled={selectedGroups.length === 0}
                className="w-full flex items-center gap-3 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                Exportar TXT
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p className="font-medium mb-1">Formatos de exportação:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>CSV: Inclui dados completos (país, status, etc.)</li>
                <li>TXT: Lista simples de códigos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
