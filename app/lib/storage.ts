const PREFIX = "wla_";

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(PREFIX + key);
  },
};

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // demo only, plain text for localStorage MVP
  createdAt: string;
}

export function getUsers(): StoredUser[] {
  return storage.get<StoredUser[]>("users") || [];
}

export function saveUser(user: StoredUser) {
  const users = getUsers();
  users.push(user);
  storage.set("users", users);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return getUsers().find((u) => u.email === email);
}

export function getCurrentUser(): StoredUser | null {
  return storage.get<StoredUser>("current_user");
}

export function setCurrentUser(user: StoredUser | null) {
  if (user) storage.set("current_user", user);
  else storage.remove("current_user");
}
