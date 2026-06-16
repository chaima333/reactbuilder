
const anthropic =
  new Anthropic({
    apiKey:
      process.env.ANTHROPIC_API_KEY
  });

export class ClaudeService {

  static async chat(
    prompt: string
  ) {

    const response =
      await anthropic.messages.create({
        model:
          "claude-sonnet-4",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

    return response;
  }
}