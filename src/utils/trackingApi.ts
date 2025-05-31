
// API do 17TRACK v2.2 - Implementação oficial
// Documentação: https://api.17track.net/en/doc?version=v2.2

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

interface Track17Response {
  code: number;
  data: {
    accepted: Array<{
      number: string;
      carrier: number;
    }>;
    rejected?: Array<{
      number: string;
      error: {
        code: number;
        message: string;
      };
    }>;
  };
}

interface GetTrackResponse {
  code: number;
  data: Array<{
    number: string;
    carrier: number;
    param: any;
    tag: string;
    track: {
      a: number; // Carrier ID
      b: number; // Sub carrier ID
      c: string; // Tracking number
      d: number; // Status
      e: number; // Status code
      f: number; // Sub status
      g: number; // Last update time
      h: number; // Original country
      i: number; // Destination country
      j: number; // Origin info
      k: number; // Destination info
      l: number; // Product type
      m: number; // Service type
      n: number; // Package type
      o: number; // Weight
      p: number; // Aged
      q: number; // Stay time
      r: number; // Time length
      s: number; // Days after shipped
      t: number; // Days of transit
      u: number; // Days of no update
      v: number; // Provider
      w1?: string; // Carrier name
      w6?: string; // Status description
      w12?: string; // Origin country name
      w13?: string; // Destination country name
      z0?: number; // Package status
      z1?: Array<{ // Events
        a: string; // Date
        b: string; // Time
        c: string; // Time zone
        d: string; // Description
        z: string; // Location
      }>;
    };
  }>;
}

export const validate17Track = async (trackingNumber: string): Promise<TrackingResponse> => {
  const apiKey = localStorage.getItem('17track_api_key');
  
  if (!apiKey) {
    return {
      success: false,
      error: 'Chave da API do 17TRACK não configurada. Vá para Configurações para adicionar sua chave.'
    };
  }

  try {
    // Primeiro, registrar o número para rastreamento
    const registerResponse = await fetch('https://api.17track.net/track/v2.2/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': apiKey
      },
      body: JSON.stringify([{
        number: trackingNumber,
        carrier: 0, // Auto detect carrier
        param: {},
        tag: 'validation'
      }])
    });

    if (!registerResponse.ok) {
      throw new Error(`HTTP error! status: ${registerResponse.status}`);
    }

    const registerResult: Track17Response = await registerResponse.json();
    
    if (registerResult.code !== 0) {
      return {
        success: false,
        error: `Erro da API: ${registerResult.code}`
      };
    }

    // Verificar se o número foi aceito
    const accepted = registerResult.data.accepted?.find(item => item.number === trackingNumber);
    if (!accepted) {
      const rejected = registerResult.data.rejected?.find(item => item.number === trackingNumber);
      return {
        success: false,
        error: rejected ? rejected.error.message : 'Número de rastreamento rejeitado'
      };
    }

    // Aguardar um pouco antes de buscar informações (recomendado pela API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Buscar informações detalhadas do rastreamento
    const getResponse = await fetch('https://api.17track.net/track/v2.2/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': apiKey
      },
      body: JSON.stringify([{
        number: trackingNumber,
        carrier: accepted.carrier,
        param: {},
        tag: 'validation'
      }])
    });

    if (!getResponse.ok) {
      throw new Error(`HTTP error! status: ${getResponse.status}`);
    }

    const getResult: GetTrackResponse = await getResponse.json();
    
    if (getResult.code !== 0) {
      return {
        success: false,
        error: `Erro ao buscar dados: ${getResult.code}`
      };
    }

    const trackData = getResult.data.find(item => item.number === trackingNumber);
    
    if (!trackData || !trackData.track) {
      return {
        success: false,
        error: 'Dados de rastreamento não encontrados'
      };
    }

    // Mapear eventos se existirem
    const events = trackData.track.z1?.map(event => ({
      date: `${event.a} ${event.b}`,
      description: event.d,
      location: event.z || 'Location not specified'
    })) || [];

    return {
      success: true,
      data: {
        tracking_number: trackingNumber,
        carrier: trackData.track.w1 || `Carrier ${trackData.carrier}`,
        origin_country: trackData.track.w12 || 'Unknown',
        destination_country: trackData.track.w13 || 'Unknown',
        status: trackData.track.w6 || getStatusDescription(trackData.track.d),
        events
      }
    };

  } catch (error) {
    console.error('17TRACK API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro na requisição da API'
    };
  }
};

// Função auxiliar para mapear códigos de status
const getStatusDescription = (statusCode: number): string => {
  const statusMap: { [key: number]: string } = {
    0: 'Not Found',
    10: 'In Transit',
    20: 'Expired',
    30: 'Pick up',
    35: 'Undelivered',
    40: 'Delivered',
    50: 'Alert',
    60: 'Exception'
  };
  
  return statusMap[statusCode] || `Status ${statusCode}`;
};

// Simulação para desenvolvimento/testes (quando não há API key)
export const simulateValidation = async (trackingNumber: string): Promise<TrackingResponse> => {
  console.log(`Simulando validação para: ${trackingNumber}`);
  
  // Simulação de delay da API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulação baseada no formato do código
  const isValid = simulateCodeValidation(trackingNumber);
  
  if (isValid) {
    return {
      success: true,
      data: {
        tracking_number: trackingNumber,
        carrier: getCarrierFromCode(trackingNumber),
        origin_country: getOriginCountry(trackingNumber),
        destination_country: 'BR',
        status: 'In Transit',
        events: [
          {
            date: new Date().toISOString().split('T')[0],
            description: 'Package received by carrier',
            location: 'Origin facility'
          },
          {
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            description: 'In transit to destination',
            location: 'Sorting facility'
          }
        ]
      }
    };
  } else {
    return {
      success: false,
      error: 'Tracking number not found or invalid format'
    };
  }
};

// Funções auxiliares para simulação
const simulateCodeValidation = (code: string): boolean => {
  const patterns = [
    /^[A-Z]{2}\d{9}[A-Z]{2}$/, // RR123456789DE
    /^[A-Z]{2}\d{8}[A-Z]{2}$/, // LX12345678DE
    /^[A-Z]{1}\d{10}[A-Z]{2}$/, // U1234567890BR
    /^[A-Z]{2}\d{10}[A-Z]{2}$/, // CP1234567890US
  ];
  
  const isValidFormat = patterns.some(pattern => pattern.test(code));
  return isValidFormat && Math.random() > 0.3; // 70% de chance de ser válido
};

const getCarrierFromCode = (code: string): string => {
  const prefix = code.substring(0, 2);
  const carriers: { [key: string]: string } = {
    'RR': 'Correios do Brasil',
    'LX': 'China Post',
    'UR': 'DHL Express',
    'CP': 'Canada Post',
    'RA': 'Russian Post',
    'EB': 'E-express',
    'UJ': 'J-NET',
    'LP': 'La Poste'
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
    'RU': 'Russia',
    'FR': 'France',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'JP': 'Japan',
    'KR': 'South Korea'
  };
  
  return countries[suffix] || 'Unknown';
};

// Função para verificar quota da API
export const checkApiQuota = async (): Promise<{ success: boolean; remaining?: number; error?: string }> => {
  const apiKey = localStorage.getItem('17track_api_key');
  
  if (!apiKey) {
    return {
      success: false,
      error: 'API key not configured'
    };
  }

  try {
    const response = await fetch('https://api.17track.net/track/v2.2/quota', {
      method: 'GET',
      headers: {
        '17token': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      remaining: result.data?.remaining || 0
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error checking quota'
    };
  }
};
