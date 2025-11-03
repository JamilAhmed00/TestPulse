import { Student, Application, Transaction, Notification } from './supabase';
import { mockApplications, mockTransactions, mockNotifications } from './mockData';

// Storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'testpulse_current_user',
  STUDENT: 'testpulse_student',
  APPLICATIONS: 'testpulse_applications',
  TRANSACTIONS: 'testpulse_transactions',
  NOTIFICATIONS: 'testpulse_notifications',
  USERS: 'testpulse_users', // Store all users for auth
} as const;

// User type for authentication
export type User = {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  created_at: string;
};

// Helper functions
const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
  }
};

// User Authentication
export const authStorage = {
  signUp: (email: string, password: string): User => {
    const users = getItem<User[]>(STORAGE_KEYS.USERS) || [];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      password, // In production, hash this
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);
    setItem(STORAGE_KEYS.CURRENT_USER, newUser);
    
    return newUser;
  },

  signIn: (email: string, password: string): User | null => {
    const users = getItem<User[]>(STORAGE_KEYS.USERS) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setItem(STORAGE_KEYS.CURRENT_USER, user);
      return user;
    }
    
    return null;
  },

  signOut: (): void => {
    removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    return getItem<User>(STORAGE_KEYS.CURRENT_USER);
  },

  setCurrentUser: (user: User): void => {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
  },
};

// Student Data
export const studentStorage = {
  saveStudent: (student: Student): void => {
    setItem(STORAGE_KEYS.STUDENT, student);
  },

  getStudent: (): Student | null => {
    return getItem<Student>(STORAGE_KEYS.STUDENT);
  },

  updateStudent: (updates: Partial<Student>): Student | null => {
    const student = studentStorage.getStudent();
    if (!student) return null;

    const updated = { ...student, ...updates, updated_at: new Date().toISOString() };
    studentStorage.saveStudent(updated);
    return updated;
  },

  deleteStudent: (): void => {
    removeItem(STORAGE_KEYS.STUDENT);
  },
};

// Applications
export const applicationStorage = {
  getApplications: (): Application[] => {
    const student = studentStorage.getStudent();
    if (!student) return [];

    const stored = getItem<Application[]>(STORAGE_KEYS.APPLICATIONS);
    if (stored && stored.length > 0) {
      return stored;
    }

    // Initialize with mock data if none exists
    const mock = mockApplications(student.id);
    setItem(STORAGE_KEYS.APPLICATIONS, mock);
    return mock;
  },

  saveApplications: (applications: Application[]): void => {
    setItem(STORAGE_KEYS.APPLICATIONS, applications);
  },

  addApplication: (application: Application): void => {
    const applications = applicationStorage.getApplications();
    applications.push(application);
    applicationStorage.saveApplications(applications);
  },

  updateApplication: (applicationId: string, updates: Partial<Application>): void => {
    const applications = applicationStorage.getApplications();
    const index = applications.findIndex(a => a.id === applicationId);
    
    if (index !== -1) {
      applications[index] = {
        ...applications[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      applicationStorage.saveApplications(applications);
    }
  },

  removeApplication: (applicationId: string): void => {
    const applications = applicationStorage.getApplications();
    const filtered = applications.filter(a => a.id !== applicationId);
    applicationStorage.saveApplications(filtered);
  },

  getApplicationByUniversityId: (universityId: string): Application | null => {
    const applications = applicationStorage.getApplications();
    return applications.find(a => a.university_id === universityId) || null;
  },
};

// Transactions
export const transactionStorage = {
  getTransactions: (): Transaction[] => {
    const student = studentStorage.getStudent();
    if (!student) return [];

    const stored = getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
    if (stored && stored.length > 0) {
      return stored;
    }

    // Initialize with mock data if none exists
    const mock = mockTransactions(student.id);
    setItem(STORAGE_KEYS.TRANSACTIONS, mock);
    return mock;
  },

  saveTransactions: (transactions: Transaction[]): void => {
    setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  addTransaction: (transaction: Transaction): void => {
    const transactions = transactionStorage.getTransactions();
    transactions.unshift(transaction); // Add to beginning
    transactionStorage.saveTransactions(transactions);

    // Update student balance
    const student = studentStorage.getStudent();
    if (student) {
      studentStorage.updateStudent({
        current_balance: transaction.balance_after,
      });
    }
  },
};

// Notifications
export const notificationStorage = {
  getNotifications: (): Notification[] => {
    const student = studentStorage.getStudent();
    if (!student) return [];

    const stored = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS);
    if (stored && stored.length > 0) {
      return stored;
    }

    // Initialize with mock data if none exists
    const mock = mockNotifications(student.id);
    setItem(STORAGE_KEYS.NOTIFICATIONS, mock);
    return mock;
  },

  saveNotifications: (notifications: Notification[]): void => {
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  addNotification: (notification: Notification): void => {
    const notifications = notificationStorage.getNotifications();
    notifications.unshift(notification); // Add to beginning
    notificationStorage.saveNotifications(notifications);
  },

  markAsRead: (notificationId: string): void => {
    const notifications = notificationStorage.getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      notifications[index].read = true;
      notificationStorage.saveNotifications(notifications);
    }
  },

  markAllAsRead: (): void => {
    const notifications = notificationStorage.getNotifications();
    notifications.forEach(n => n.read = true);
    notificationStorage.saveNotifications(notifications);
  },

  getUnreadCount: (): number => {
    const notifications = notificationStorage.getNotifications();
    return notifications.filter(n => !n.read).length;
  },
};

// Clear all data (useful for logout)
export const clearAllData = (): void => {
  removeItem(STORAGE_KEYS.STUDENT);
  removeItem(STORAGE_KEYS.APPLICATIONS);
  removeItem(STORAGE_KEYS.TRANSACTIONS);
  removeItem(STORAGE_KEYS.NOTIFICATIONS);
  removeItem(STORAGE_KEYS.CURRENT_USER);
};

