
export const generateTrackingCodes = (patterns: string[], quantity: number): string[] => {
  const codes: string[] = [];
  
  patterns.forEach(pattern => {
    if (!pattern.trim()) return;
    
    for (let i = 0; i < quantity; i++) {
      const generatedCode = generateSequentialCode(pattern, i);
      codes.push(generatedCode);
    }
  });
  
  return codes;
};

export const generateCodesFromPattern = (pattern: string, quantity: number): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < quantity; i++) {
    const generatedCode = generateSequentialCode(pattern, i);
    codes.push(generatedCode);
  }
  
  return codes;
};

// Gera códigos em ordem sequencial baseado no padrão
const generateSequentialCode = (pattern: string, index: number): string => {
  let result = pattern;
  let digitIndex = 0;
  
  // Converter o índice para string com padding necessário
  const indexStr = index.toString().padStart(9, '0');
  
  // Substituir cada dígito no padrão pela sequência
  result = result.replace(/\d/g, () => {
    if (digitIndex < indexStr.length) {
      return indexStr[digitIndex++];
    }
    return '0';
  });
  
  return result;
};

export const organizeCodesInGroups = (codes: string[], groupSize: number = 40): string[][] => {
  const groups: string[][] = [];
  
  for (let i = 0; i < codes.length; i += groupSize) {
    groups.push(codes.slice(i, i + groupSize));
  }
  
  return groups;
};

// Organizar códigos por país
export const organizeCodesByCountry = (codes: string[]): { [country: string]: string[] } => {
  const codesByCountry: { [country: string]: string[] } = {};
  
  codes.forEach(code => {
    const country = getCountryFromCode(code);
    if (!codesByCountry[country]) {
      codesByCountry[country] = [];
    }
    codesByCountry[country].push(code);
  });
  
  return codesByCountry;
};

// Detectar país baseado no sufixo do código
const getCountryFromCode = (code: string): string => {
  const suffix = code.slice(-2);
  const countries: { [key: string]: string } = {
    'DE': 'Alemanha',
    'US': 'Estados Unidos',
    'FR': 'França',
    'CN': 'China',
    'BR': 'Brasil',
    'RU': 'Rússia',
    'GB': 'Reino Unido',
    'JP': 'Japão',
    'KR': 'Coreia do Sul',
    'IT': 'Itália',
    'CA': 'Canadá',
    'AU': 'Austrália'
  };
  
  return countries[suffix] || 'Outros';
};

export const exportToCSV = (codes: any[], filename: string = 'tracking_codes'): void => {
  const headers = ['Código', 'País', 'Status', 'Transportadora', 'Data'];
  const csvContent = [
    headers.join(','),
    ...codes.map(code => [
      code.code || code,
      code.country || '',
      code.status || '',
      code.carrier || '',
      new Date().toLocaleDateString('pt-BR')
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToTXT = (codes: string[], filename: string = 'tracking_codes'): void => {
  const content = codes.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
