export const getLevelName = (levelId: string | number): string => {
  const levelNames = [
    'Wind Realm',      
    'Water Realm',     
    'Fire Realm',      
    'Earth Realm',     
    'Lightning Realm',
    'Crystal Realm',
    'Shadow Realm',
    'Mythical Realm',
    'Celestial Realm',
    'Eternal Realm'
  ];
  
  const id = typeof levelId === 'string' ? parseInt(levelId, 10) : levelId;
  return levelNames[id - 1] || `Level ${levelId}`;
};

export const getTierName = (levelId: string | number): string => {
  const id = typeof levelId === 'string' ? parseInt(levelId, 10) : levelId;
  
  if (id >= 1 && id <= 4) {
    return 'Mortal Tier';
  } else if (id >= 5 && id <= 6) {
    return 'Realm of Heroes';
  } else if (id >= 7 && id <= 10) {
    return 'Immortal Realm';
  }
  
  return 'Unknown Tier';
};

export const getTierDescription = (levelId: string | number): string => {
  const id = typeof levelId === 'string' ? parseInt(levelId, 10) : levelId;
  
  if (id >= 1 && id <= 4) {
    return 'Master the elements of nature';
  } else if (id >= 5 && id <= 6) {
    return 'Ascend to heroic power';
  } else if (id >= 7 && id <= 10) {
    return 'Transcend mortal limitations';
  }
  
  return 'Unknown realm';
};
