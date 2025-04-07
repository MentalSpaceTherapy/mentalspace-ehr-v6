import CryptoJS from 'crypto-js';

// Encryption key - in a real app, this would be stored in environment variables
// and potentially rotated periodically
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'mentalspace-secure-key';

// Service for handling data encryption and decryption
export const encryptionService = {
  // Encrypt sensitive data
  encrypt: (data: string): string => {
    try {
      return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  },

  // Decrypt sensitive data
  decrypt: (encryptedData: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  },

  // Encrypt an object (converts to JSON string first)
  encryptObject: (data: Record<string, any>): string => {
    try {
      const jsonString = JSON.stringify(data);
      return encryptionService.encrypt(jsonString);
    } catch (error) {
      console.error('Object encryption error:', error);
      throw new Error('Failed to encrypt object');
    }
  },

  // Decrypt to an object
  decryptToObject: <T>(encryptedData: string): T => {
    try {
      const jsonString = encryptionService.decrypt(encryptedData);
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Object decryption error:', error);
      throw new Error('Failed to decrypt to object');
    }
  },

  // Securely store in localStorage with encryption
  secureStore: (key: string, data: any): void => {
    try {
      let dataToStore: string;
      
      if (typeof data === 'object') {
        dataToStore = encryptionService.encryptObject(data);
      } else if (typeof data === 'string') {
        dataToStore = encryptionService.encrypt(data);
      } else {
        dataToStore = encryptionService.encrypt(String(data));
      }
      
      localStorage.setItem(key, dataToStore);
    } catch (error) {
      console.error('Secure storage error:', error);
      throw new Error('Failed to securely store data');
    }
  },

  // Retrieve and decrypt from localStorage
  secureRetrieve: <T>(key: string, isObject = true): T | string | null => {
    try {
      const encryptedData = localStorage.getItem(key);
      
      if (!encryptedData) {
        return null;
      }
      
      if (isObject) {
        return encryptionService.decryptToObject<T>(encryptedData);
      } else {
        return encryptionService.decrypt(encryptedData);
      }
    } catch (error) {
      console.error('Secure retrieval error:', error);
      // If decryption fails, remove the corrupted data
      localStorage.removeItem(key);
      return null;
    }
  },

  // Hash sensitive data (one-way encryption, cannot be decrypted)
  hash: (data: string): string => {
    try {
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error('Failed to hash data');
    }
  },

  // Generate a secure random token
  generateToken: (length = 32): string => {
    try {
      const randomBytes = CryptoJS.lib.WordArray.random(length);
      return randomBytes.toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Failed to generate secure token');
    }
  }
};

export default encryptionService;
