
import { useState, useEffect } from 'react';

interface TrackingStats {
  totalGenerated: number;
  validCodes: number;
  pendingValidation: number;
  successRate: number;
}

interface RecentCode {
  tracking: string;
  country: string;
  status: 'valid' | 'invalid' | 'pending';
}

export const useTrackingData = () => {
  const [stats, setStats] = useState<TrackingStats>({
    totalGenerated: 0,
    validCodes: 0,
    pendingValidation: 0,
    successRate: 0
  });

  const [recentCodes, setRecentCodes] = useState<RecentCode[]>([]);

  useEffect(() => {
    const loadData = () => {
      const generatedCodes = JSON.parse(localStorage.getItem('generatedCodes') || '[]');
      const validatedCodes = JSON.parse(localStorage.getItem('validatedCodes') || '[]');
      
      const totalGenerated = generatedCodes.length;
      const validCodes = validatedCodes.filter((c: any) => c.status === 'valid').length;
      const pendingValidation = totalGenerated - validatedCodes.length;
      const successRate = totalGenerated > 0 ? Math.round((validCodes / totalGenerated) * 100) : 0;

      setStats({
        totalGenerated,
        validCodes,
        pendingValidation,
        successRate
      });

      // Carregar códigos recentes
      const recent = validatedCodes.slice(-5).map((code: any) => ({
        tracking: code.code,
        country: code.country || 'Unknown',
        status: code.status
      }));
      
      setRecentCodes(recent);
    };

    loadData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, recentCodes };
};
