/**
 * Helper function to get the display name for a class
 * Customizes names for specific classes as requested by client
 * 
 * @param classId - The class ID number
 * @returns The display name for the class
 */
export const getClassDisplayName = (classId: number): string => {
  switch (classId) {
    case 11:
      return 'Realm Practice';
    case 12:
      return 'Realm Test';
    default:
      return `Class ${classId}`;
  }
};

/**
 * Helper function to get the short display name for a class (without "Class" prefix)
 * 
 * @param classId - The class ID number
 * @returns The short display name for the class
 */
export const getClassShortName = (classId: number): string => {
  switch (classId) {
    case 11:
      return 'Realm Practice';
    case 12:
      return 'Realm Test';
    default:
      return `${classId}`;
  }
};