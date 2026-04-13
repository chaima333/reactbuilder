import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiService = {
  async generatePage(topic: string, pageType: string) {
    const prompt = `Génère le contenu complet pour une page web de type "${pageType}" sur le thème "${topic}".
    
    Réponds UNIQUEMENT en JSON avec cette structure exacte (sans texte avant ou après) :
    {
      "title": "Titre de la page",
      "seoTitle": "Titre SEO",
      "seoDescription": "Description SEO",
      "blocks": [
        { "id": "${uuidv4()}", "type": "title", "content": "Bienvenue" },
        { "id": "${uuidv4()}", "type": "text", "content": "Paragraphe généré..." },
        { "id": "${uuidv4()}", "type": "image", "content": "https://picsum.photos/800/400" },
        { "id": "${uuidv4()}", "type": "button", "content": "Contactez-nous", "link": "/contact" }
      ]
    }
    
    Le contenu doit être en français et professionnel. Génère au moins 5 blocs variés.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('L\'IA n\'a pas renvoyé de contenu');
    
    // Nettoyage robuste du JSON
    let cleanResponse = response.trim();
    if (cleanResponse.includes('```')) {
      cleanResponse = cleanResponse.replace(/```json|```/g, '').trim();
    }
    
    try {
      return JSON.parse(cleanResponse);
    } catch (e) {
      console.error("Erreur de parsing JSON IA:", cleanResponse);
      throw new Error("Le format généré par l'IA est invalide. Veuillez réessayer.");
    }
  },
};