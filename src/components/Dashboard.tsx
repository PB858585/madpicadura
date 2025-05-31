
import React from 'react';
import { Package, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useTrackingData } from '../hooks/useTrackingData';

const Dashboard = () => {
  const { stats, recentCodes } = useTrackingData();

  const statCards = [
    {
      title: 'Códigos Gerados',
      value: stats.totalGenerated,
      icon: Package,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: 'Códigos Válidos',
      value: stats.validCodes,
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: '+8%'
    },
    {
      title: 'Em Validação',
      value: stats.pendingValidation,
      icon: Clock,
      color: 'bg-yellow-500',
      trend: '-3%'
    },
    {
      title: 'Taxa de Sucesso',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: '+5%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral dos códigos de rastreio</p>
        </div>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Códigos Recentes</h3>
          <div className="space-y-3">
            {recentCodes.map((code, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{code.tracking}</p>
                  <p className="text-sm text-gray-600">{code.country}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  code.status === 'valid' ? 'bg-green-100 text-green-800' :
                  code.status === 'invalid' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {code.status === 'valid' ? 'Válido' : 
                   code.status === 'invalid' ? 'Inválido' : 'Verificando'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
              Gerar Novos Códigos
            </button>
            <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors">
              Validar Pendentes
            </button>
            <button className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors">
              Exportar Válidos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
