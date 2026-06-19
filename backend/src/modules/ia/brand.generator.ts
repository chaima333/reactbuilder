const prefixes = [
  "Nova",
  "Prime",
  "Elite",
  "Smart",
  "Vision",
  "Fin",
  "Medi",
  "Tech"
];

const suffixes = [
  "Capital",
  "Care",
  "Solutions",
  "Advisory",
  "Studio",
  "Hub",
  "Works",
  "Labs"
];

export const generateBrandName = (
  category: string
) => {

  const prefix =
    prefixes[
      Math.floor(
        Math.random() *
        prefixes.length
      )
    ];

  const suffix =
    suffixes[
      Math.floor(
        Math.random() *
        suffixes.length
      )
    ];

  return `${prefix} ${suffix}`;
};