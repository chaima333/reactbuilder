export const askAssistant = async (
  prompt: string
) => {

  return {
    reply:
      `Assistant received: ${prompt}`,

    suggestions: [
      "Improve Hero",
      "Add Pricing Section",
      "Improve FAQ"
    ]
  };
};