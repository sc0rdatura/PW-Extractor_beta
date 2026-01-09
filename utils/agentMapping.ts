export const AGENT_NAME_MAP: Record<string, string> = {
  'AV': 'Alex Vangelos',
  'DN': 'Dan North',
  'HF': 'Hailey Flame',
  'HD': 'Hamish Duff',
  'ZH': 'Zoe Hart',
  'ZC': 'Zein Checri',
  'WV': 'Will Vangelos'
};

export const getAgentFullName = (initials: string): string => {
  return AGENT_NAME_MAP[initials.toUpperCase()] || initials;
};