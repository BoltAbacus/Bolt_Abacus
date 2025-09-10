export type ActivityType = 'classwork' | 'homework' | 'test' | 'practice' | 'pvp' | 'streak' | 'level' | 'achievement' | 'other';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  xp?: number;
  timestamp: number; // epoch ms
  meta?: Record<string, unknown>;
}

const STORAGE_KEY = 'bolt_activity_log';
const MAX_ITEMS = 200;

export const getActivities = (): ActivityItem[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ActivityItem[];
    return [];
  } catch {
    return [];
  }
};

export const logActivity = (item: Omit<ActivityItem, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => {
  const id = item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const full: ActivityItem = {
    id,
    type: item.type,
    title: item.title,
    xp: item.xp,
    timestamp: item.timestamp ?? Date.now(),
    meta: item.meta,
  };
  const list = [full, ...getActivities()].slice(0, MAX_ITEMS);
  try {
    const serialized = JSON.stringify(list);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // ignore
  }
  return full;
};

export const clearActivities = () => {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
};

export const removeActivity = (id: string) => {
  const list = getActivities().filter((a) => a.id !== id);
  const serialized = JSON.stringify(list);
  sessionStorage.setItem(STORAGE_KEY, serialized);
  localStorage.setItem(STORAGE_KEY, serialized);
  return list;
};


