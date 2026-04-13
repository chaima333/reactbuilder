import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiService = {
  // Générer une page complète
  async generatePage(topic: string, pageType: string) {
    const prompt = `Génère le contenu complet pour une page web de type "${pageType}" sur le thème "${topic}".
    
    Le contenu doit être professionnel, optimisé SEO, en français.
    
    Réponds UNIQUEMENT en JSON avec cette structure exacte:
    {
      "title": "Titre accrocheur de la page",
      "seoTitle": "Titre SEO (max 60 caractères)",
      "seoDescription": "Meta description (max 160 caractères)",
      "sections": [
        { "type": "title", "content": "Titre de la première section" },
        { "type": "text", "content": "Un paragraphe de texte descriptif et engageant..." },
        { "type": "image", "content": "https://picsum.photos/id/1/800/400" },
        { "type": "title", "content": "Deuxième section" },
        { "type": "text", "content": "Autre paragraphe de contenu..." },
        { "type": "button", "content": "En savoir plus", "link": "#" }
      ]
    }
    
    Génère 3 à 5 sections pertinentes.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('Pas de réponse de l\'IA');
    
    // Nettoyer la réponse (enlever les backticks éventuels)
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    return JSON.parse(cleanResponse);
  },
};