
import React from 'react';
import { BarChart3, Code, CheckCircle, Download, TrendingUp } from 'lucide-react';
import { useTrackingData } from '../hooks/useTrackingData';

const Dashboard = () => {
  const { stats, recentCodes } = useTrackingData();

  const statsCards = [
    {
      title: 'Códigos Gerados',
      value: stats.totalGenerated,
      icon: Code,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Códigos Válidos',
      value: stats.validCodes,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pendentes',
      value: stats.pendingValidation,
      icon: Download,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Taxa de Sucesso',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral dos códigos de rastreio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Estatísticas</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total de Códigos</span>
              <span className="text-white font-medium">{stats.totalGenerated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Códigos Válidos</span>
              <span className="text-green-400 font-medium">{stats.validCodes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pendentes de Validação</span>
              <span className="text-yellow-400 font-medium">{stats.pendingValidation}</span>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Taxa de Sucesso</span>
                <span className="text-purple-400 font-medium">{stats.successRate}%</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.successRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Códigos Recentes</h3>
          
          {recentCodes.length > 0 ? (
            <div className="space-y-3">
              {recentCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{code.tracking}</p>
                    <p className="text-sm text-gray-400">{code.country}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    code.status === 'valid' 
                      ? 'bg-green-500/20 text-green-400' 
                      : code.status === 'invalid'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {code.status === 'valid' ? 'Válido' : 
                     code.status === 'invalid' ? 'Inválido' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum código validado ainda</p>
              <p className="text-gray-500 text-sm">Gere e valide códigos para ver o histórico</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
