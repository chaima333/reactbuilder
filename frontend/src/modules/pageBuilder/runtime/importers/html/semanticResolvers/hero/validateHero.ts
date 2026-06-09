export const validateHero = (
  payload: {
    title?: string;
  }
): boolean => {

  return !!payload.title;
};