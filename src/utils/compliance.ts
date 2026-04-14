export function getBanTheBoxJurisdiction(location: string): string | null {
  const loc = location.toLowerCase();
  if (loc.includes('los angeles')) return 'Los Angeles, CA';
  if (loc.includes('san francisco')) return 'San Francisco, CA';
  if (loc.includes('california') || loc.includes(', ca')) return 'California';
  if (loc.includes('new york') || loc.includes('nyc') || loc.includes(', ny')) return 'New York';
  if (loc.includes('massachusetts') || loc.includes(', ma')) return 'Massachusetts';
  if (loc.includes('chicago') || loc.includes('illinois') || loc.includes(', il')) return 'Chicago, IL';
  if (loc.includes('new jersey') || loc.includes(', nj')) return 'New Jersey';
  if (loc.includes('seattle') || loc.includes(', wa')) return 'Washington (Seattle)';
  if (loc.includes('denver') || loc.includes(', co')) return 'Colorado (Denver)';
  return null;
}
