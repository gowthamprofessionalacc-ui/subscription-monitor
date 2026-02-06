// OTT Themes Configuration for Frontend
export interface OttTheme {
  name: string;
  iconName: string | null;
  primaryColor: string;
  secondaryColor: string;
  gradient: string;
  textColor: string;
  cardBackground: string;
  accentColor: string;
}

export const ottThemes: Record<string, OttTheme> = {
  'Netflix': {
    name: 'Netflix',
    iconName: 'netflix',
    primaryColor: '#E50914',
    secondaryColor: '#141414',
    gradient: 'linear-gradient(135deg, #E50914 0%, #B20710 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A1A1A',
    accentColor: '#E50914'
  },
  'Amazon Prime Video': {
    name: 'Amazon Prime Video',
    iconName: 'amazonprime',
    primaryColor: '#00A8E1',
    secondaryColor: '#232F3E',
    gradient: 'linear-gradient(135deg, #00A8E1 0%, #232F3E 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A242F',
    accentColor: '#00A8E1'
  },
  'Disney+ Hotstar': {
    name: 'Disney+ Hotstar',
    iconName: 'hotstar',
    primaryColor: '#0063E5',
    secondaryColor: '#1A1D29',
    gradient: 'linear-gradient(135deg, #0063E5 0%, #0D1B2A 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A1D29',
    accentColor: '#0063E5'
  },
  'Spotify': {
    name: 'Spotify',
    iconName: 'spotify',
    primaryColor: '#1DB954',
    secondaryColor: '#191414',
    gradient: 'linear-gradient(135deg, #1DB954 0%, #191414 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#121212',
    accentColor: '#1DB954'
  },
  'YouTube Premium': {
    name: 'YouTube Premium',
    iconName: 'youtube',
    primaryColor: '#FF0000',
    secondaryColor: '#282828',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #282828 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1F1F1F',
    accentColor: '#FF0000'
  },
  'Apple TV+': {
    name: 'Apple TV+',
    iconName: 'appletv',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #2D2D2D 0%, #000000 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1C1C1E',
    accentColor: '#FFFFFF'
  },
  'HBO Max': {
    name: 'HBO Max',
    iconName: 'hbo',
    primaryColor: '#B000E5',
    secondaryColor: '#000000',
    gradient: 'linear-gradient(135deg, #B000E5 0%, #5A189A 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#0D0D0D',
    accentColor: '#B000E5'
  },
  'Hulu': {
    name: 'Hulu',
    iconName: 'hulu',
    primaryColor: '#1CE783',
    secondaryColor: '#040405',
    gradient: 'linear-gradient(135deg, #1CE783 0%, #040405 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#0B0C0F',
    accentColor: '#1CE783'
  },
  'Zee5': {
    name: 'Zee5',
    iconName: null,
    primaryColor: '#8230C6',
    secondaryColor: '#000000',
    gradient: 'linear-gradient(135deg, #8230C6 0%, #4A1D6A 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A0A2E',
    accentColor: '#8230C6'
  },
  'SonyLIV': {
    name: 'SonyLIV',
    iconName: null,
    primaryColor: '#111111',
    secondaryColor: '#E8E8E8',
    gradient: 'linear-gradient(135deg, #333333 0%, #111111 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A1A1A',
    accentColor: '#FFFFFF'
  },
  'JioCinema': {
    name: 'JioCinema',
    iconName: null,
    primaryColor: '#E50064',
    secondaryColor: '#1A1A2E',
    gradient: 'linear-gradient(135deg, #E50064 0%, #8B0037 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A1A2E',
    accentColor: '#E50064'
  },
  'Crunchyroll': {
    name: 'Crunchyroll',
    iconName: 'crunchyroll',
    primaryColor: '#F47521',
    secondaryColor: '#000000',
    gradient: 'linear-gradient(135deg, #F47521 0%, #C85A00 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#141414',
    accentColor: '#F47521'
  },
  'Voot': {
    name: 'Voot',
    iconName: null,
    primaryColor: '#FF5500',
    secondaryColor: '#1A1A1A',
    gradient: 'linear-gradient(135deg, #FF5500 0%, #CC4400 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A1A1A',
    accentColor: '#FF5500'
  },
  'MX Player': {
    name: 'MX Player',
    iconName: null,
    primaryColor: '#0D47A1',
    secondaryColor: '#000000',
    gradient: 'linear-gradient(135deg, #0D47A1 0%, #082E6A 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#0A1929',
    accentColor: '#0D47A1'
  },
  'ALTBalaji': {
    name: 'ALTBalaji',
    iconName: null,
    primaryColor: '#FF0000',
    secondaryColor: '#1A1A1A',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #990000 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A1A1A',
    accentColor: '#FF0000'
  },
  'Apple Music': {
    name: 'Apple Music',
    iconName: 'applemusic',
    primaryColor: '#FA233B',
    secondaryColor: '#000000',
    gradient: 'linear-gradient(135deg, #FA233B 0%, #FB5C74 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1C1C1E',
    accentColor: '#FA233B'
  },
  'Amazon Music': {
    name: 'Amazon Music',
    iconName: 'amazonmusic',
    primaryColor: '#00A8E1',
    secondaryColor: '#232F3E',
    gradient: 'linear-gradient(135deg, #00A8E1 0%, #232F3E 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A242F',
    accentColor: '#00A8E1'
  },
  'Gaana': {
    name: 'Gaana',
    iconName: null,
    primaryColor: '#E72C30',
    secondaryColor: '#1A1A1A',
    gradient: 'linear-gradient(135deg, #E72C30 0%, #B22225 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1A1A1A',
    accentColor: '#E72C30'
  },
  'JioSaavn': {
    name: 'JioSaavn',
    iconName: null,
    primaryColor: '#2BC5B4',
    secondaryColor: '#121212',
    gradient: 'linear-gradient(135deg, #2BC5B4 0%, #1E8A7E 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#121212',
    accentColor: '#2BC5B4'
  },
  'Xbox Game Pass': {
    name: 'Xbox Game Pass',
    iconName: 'xbox',
    primaryColor: '#107C10',
    secondaryColor: '#000000',
    gradient: 'linear-gradient(135deg, #107C10 0%, #0E5C0E 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#0E0E0E',
    accentColor: '#107C10'
  },
  'PlayStation Plus': {
    name: 'PlayStation Plus',
    iconName: 'playstation',
    primaryColor: '#003791',
    secondaryColor: '#000000',
    gradient: 'linear-gradient(135deg, #003791 0%, #002266 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#0A1628',
    accentColor: '#003791'
  },
  'Custom': {
    name: 'Custom',
    iconName: null,
    primaryColor: '#6366F1',
    secondaryColor: '#1F2937',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    textColor: '#FFFFFF',
    cardBackground: '#1F2937',
    accentColor: '#6366F1'
  }
};

export const getTheme = (ottName: string): OttTheme => {
  return ottThemes[ottName] || ottThemes['Custom'];
};

export const getAllThemes = (): Record<string, OttTheme> => {
  return ottThemes;
};
