
export const generateTrackingCodes = (patterns: string[], quantity: number): string[] => {
  const codes: string[] = [];
  
  patterns.forEach(pattern => {
    if (!pattern.trim()) return;
    
    for (let i = 0; i < quantity; i++) {
      const generatedCode = generateSingleCode(pattern);
      codes.push(generatedCode);
    }
  });
  
  return codes;
};

export const generateCodesFromPattern = (pattern: string, quantity: number): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < quantity; i++) {
    const generatedCode = generateSingleCode(pattern);
    codes.push(generatedCode);
  }
  
  return codes;
};

const generateSingleCode = (pattern: string): string => {
  return pattern.replace(/\d/g, () => {
    return Math.floor(Math.random() * 10).toString();
  });
};

export const organizeCodesInGroups = (codes: string[], groupSize: number = 40): string[][] => {
  const groups: string[][] = [];
  
  for (let i = 0; i < codes.length; i += groupSize) {
    groups.push(codes.slice(i, i + groupSize));
  }
  
  return groups;
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
