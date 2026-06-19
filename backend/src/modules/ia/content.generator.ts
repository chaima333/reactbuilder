export const generateAiContent = (
  category: string,
  prompt: string
) => {
  const cleanPrompt =
    prompt.trim().replace(/\s+/g, " ");

  const brandByCategory: Record<string, string> = {
    Medical: "MediCare Pro",
    Finance: "FinVision",
    Technology: "TechNova",
    Education: "EduSphere",
    Restaurant: "TasteHub",
    Agency: "BrandCraft",
    Ecommerce: "Shoply",
    Portfolio: "Creative Studio",
    Consulting: "StratEdge",
    Corporate: "NovaCorp"
  };

  const brandName =
    brandByCategory[category] || `${category} Platform`;

  return {
    title: brandName,
    heroTitle: cleanPrompt.length > 60
      ? cleanPrompt.slice(0, 60)
      : cleanPrompt,
    heroText: `A modern ${category.toLowerCase()} solution designed for professional digital experiences.`
  };
};