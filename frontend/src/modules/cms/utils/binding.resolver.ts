
export const resolveBinding = (value: any, data: any): any => {
  if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
    const field = value.slice(2, -2).trim();
    // Support nested fields like {{user.name}}
    const parts = field.split('.');
    let result = data;
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return value; // Field not found, return original
      }
    }
    return result ?? value;
  }
  return value;
};

/**
 * Recursively resolve all bindings in an object
 */
export const resolveBindings = (obj: any, data: any): any => {
  if (typeof obj === 'string') {
    return resolveBinding(obj, data);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => resolveBindings(item, data));
  }
  
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveBindings(value, data);
    }
    return result;
  }
  
  return obj;
};

/**
 * Check if a value contains any binding
 */
export const hasBindings = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.includes('{{') && value.includes('}}');
  }
  if (Array.isArray(value)) {
    return value.some(hasBindings);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).some(hasBindings);
  }
  return false;
};

/**
 * Get all binding keys from an object
 */
export const getBindingKeys = (obj: any): string[] => {
  const keys: string[] = [];
  
  const extract = (value: any) => {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      keys.push(value.slice(2, -2).trim());
    }
    if (Array.isArray(value)) {
      value.forEach(extract);
    }
    if (value && typeof value === 'object') {
      Object.values(value).forEach(extract);
    }
  };
  
  extract(obj);
  return [...new Set(keys)];
};