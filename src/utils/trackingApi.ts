
// Simulação da API do 17TRACK para demonstração
// Em produção, você precisará da chave da API real

interface TrackingResponse {
  success: boolean;
  data?: {
    tracking_number: string;
    carrier: string;
    origin_country: string;
    destination_country: string;
    status: string;
    events: Array<{
      date: string;
      description: string;
      location: string;
    }>;
  };
  error?: string;
}

export const validate17Track = async (trackingNumber: string): Promise<TrackingResponse> => {
  // Simulação - Em produção, substitua pela URL real da API
  console.log(`Validating tracking number: ${trackingNumber}`);
  
  try {
    // Simulação de delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulação de validação baseada no padrão do código
    const isValid = simulateValidation(trackingNumber);
    
    if (isValid) {
      return {
        success: true,
        data: {
          tracking_number: trackingNumber,
          carrier: getCarrierFromCode(trackingNumber),
          origin_country: getOriginCountry(trackingNumber),
          destination_country: 'BR',
          status: 'in_transit',
          events: [
            {
              date: new Date().toISOString(),
              description: 'Package received by carrier',
              location: 'Origin facility'
            }
          ]
        }
      };
    } else {
      return {
        success: false,
        error: 'Tracking number not found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'API request failed'
    };
  }
};

// Implementação real da API do 17TRACK
export const validate17TrackReal = async (trackingNumber: string, apiKey: string): Promise<TrackingResponse> => {
  const url = 'https://api.17track.net/track/v2.2/get';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': apiKey
      },
      body: JSON.stringify({
        data: [{
          number: trackingNumber,
          carrier: 0 // Auto detect
        }]
      })
    });

    const result = await response.json();
    
    if (result.code === 0 && result.data?.accepted?.length > 0) {
      const trackData = result.data.accepted[0];
      return {
        success: true,
        data: {
          tracking_number: trackingNumber,
          carrier: trackData.track?.w1 || 'Unknown',
          origin_country: trackData.track?.w12 || 'Unknown',
          destination_country: trackData.track?.w13 || 'Unknown',
          status: trackData.track?.w6 || 'unknown',
          events: trackData.track?.z1 || []
        }
      };
    } else {
      return {
        success: false,
        error: 'Tracking number not found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'API request failed'
    };
  }
};

// Funções auxiliares para simulação
const simulateValidation = (code: string): boolean => {
  // Simulação baseada no formato do código
  const patterns = [
    /^[A-Z]{2}\d{9}[A-Z]{2}$/, // RR123456789DE
    /^[A-Z]{2}\d{8}[A-Z]{2}$/, // LX12345678DE
    /^[A-Z]{1}\d{10}[A-Z]{2}$/, // U1234567890BR
  ];
  
  const isValidFormat = patterns.some(pattern => pattern.test(code));
  
  // 80% de chance de ser válido se o formato estiver correto
  return isValidFormat && Math.random() > 0.2;
};

const getCarrierFromCode = (code: string): string => {
  const prefix = code.substring(0, 2);
  const carriers: { [key: string]: string } = {
    'RR': 'Correios',
    'LX': 'China Post',
    'UR': 'DHL',
    'CP': 'Canada Post',
    'RA': 'Russian Post'
  };
  
  return carriers[prefix] || 'Unknown Carrier';
};

const getOriginCountry = (code: string): string => {
  const suffix = code.slice(-2);
  const countries: { [key: string]: string } = {
    'DE': 'Germany',
    'CN': 'China',
    'US': 'United States',
    'BR': 'Brazil',
    'RU': 'Russia'
  };
  
  return countries[suffix] || 'Unknown';
};
