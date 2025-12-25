// lib/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

// Fungsi untuk menyensor data sensitif
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['email', 'uid', 'password', 'token', 'secret', 'key'];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // Untuk nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });
  
  return sanitized;
};

// Fungsi untuk mask email - Export ini
export const maskEmail = (email: string | null): string => {
  if (!email) return '[NO EMAIL]';
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  const maskedUsername = username.length > 2 
    ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
    : username;
  
  return `${maskedUsername}@${domain}`;
};

// Fungsi untuk mask UID - Export ini
export const maskUid = (uid: string): string => {
  if (!uid || uid.length < 8) return '[INVALID UID]';
  return `${uid.substring(0, 4)}...${uid.substring(uid.length - 4)}`;
};

export const logger = {
  log: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      const sanitizedArgs = args.map(arg => sanitizeData(arg));
      console.log('[LOG]:', message, ...sanitizedArgs);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      const sanitizedArgs = args.map(arg => sanitizeData(arg));
      console.warn('[WARN]:', message, ...sanitizedArgs);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // Error selalu tampil, tapi data disensor
    const sanitizedArgs = args.map(arg => sanitizeData(arg));
    console.error('[ERROR]:', message, ...sanitizedArgs);
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      const sanitizedArgs = args.map(arg => sanitizeData(arg));
      console.info('[INFO]:', message, ...sanitizedArgs);
    }
  },
  
  // TAMBAHKAN method debug
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment && process.env.NEXT_PUBLIC_DEBUG === 'true') {
      const sanitizedArgs = args.map(arg => sanitizeData(arg));
      console.debug('[DEBUG]:', message, ...sanitizedArgs);
    }
  },
  
  // Logger khusus untuk auth (dengan masking)
  auth: {
    login: (email: string, role: string) => {
      if (isDevelopment) {
        const maskedEmail = maskEmail(email);
        console.log('[AUTH LOGIN]:', `User ${maskedEmail} logged in as ${role}`);
      }
    },
    
    logout: (email: string | null) => {
      if (isDevelopment) {
        const maskedEmail = maskEmail(email);
        console.log('[AUTH LOGOUT]:', `User ${maskedEmail} logged out`);
      }
    },
    
    register: (email: string, role: string) => {
      if (isDevelopment) {
        const maskedEmail = maskEmail(email);
        console.log('[AUTH REGISTER]:', `User ${maskedEmail} registered as ${role}`);
      }
    },
    
    // Untuk debugging internal saja (tidak untuk production)
    // Ini sudah ada, tidak perlu dipanggil langsung dari luar
    debug: (data: any) => {
      if (isDevelopment && process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
        const sanitized = sanitizeData(data);
        console.debug('[AUTH DEBUG]:', sanitized);
      }
    }
  }
};

// Alias untuk backward compatibility
export const devLog = logger.log;
export const devWarn = logger.warn;
export const devError = logger.error;