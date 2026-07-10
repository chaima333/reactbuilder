// backend/src/core/binding.resolver.ts


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
        return value; 
      }
    }
    return result ?? value;
  }
  return value;
};


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