import {
  describe,
  expect,
  it
} from "vitest";

import {
  AiGeneratedContentSchema
} from "../content.schema";

import {
  DesignCopilotAiResponseSchema
} from "../copilot/designCopilot.schema";

describe("AI generated content schema", () => {
  it("accepts valid page generation content", () => {
    const result =
      AiGeneratedContentSchema.safeParse({
        title: "CyberShield Academy",
        heroTitle: "Learn Cybersecurity With Practical Labs",
        heroText:
          "Build real cybersecurity skills through guided labs and expert training.",
        services: [
          "Threat Detection Labs",
          "Penetration Testing Training",
          "Compliance Certification",
          "Incident Response Training"
        ],
        features: [
          "Hands-On Labs",
          "Real-World Scenarios",
          "Expert Mentors",
          "Certification Paths"
        ],
        stats: [
          {
            value: "1200+",
            label: "Trained Learners"
          },
          {
            value: "95%",
            label: "Completion Rate"
          },
          {
            value: "40",
            label: "Practical Labs"
          },
          {
            value: "24/7",
            label: "Learning Access"
          }
        ],
        faqs: [
          {
            question: "Is this beginner friendly?",
            answer: "Yes, the program supports beginners and professionals."
          }
        ],
        ctaTitle: "Start Your Cybersecurity Journey",
        ctaText:
          "Join practical cybersecurity training and build job-ready skills."
      });

    expect(result.success).toBe(true);
  });

  it("rejects invalid page generation content", () => {
    const result =
      AiGeneratedContentSchema.safeParse({
        title: "",
        services: "not-array",
        stats: "not-array"
      });

    expect(result.success).toBe(false);
  });
});

describe("Design Copilot response schema", () => {
  it("accepts valid design copilot response", () => {
    const result =
      DesignCopilotAiResponseSchema.safeParse({
        reply: "I prepared a safe navbar improvement.",
        suggestions: [
          {
            id: "improve-navbar",
            title: "Improve navbar layout",
            description:
              "Align logo, links, and CTA button in one clean navbar.",
            actions: [
              {
                type: "IMPROVE_DESIGN",
                improvement: "IMPROVE_NAVBAR",
                target: "navbar",
                payload: {}
              }
            ]
          }
        ]
      });

    expect(result.success).toBe(true);
  });

  it("rejects invalid design copilot action", () => {
    const result =
      DesignCopilotAiResponseSchema.safeParse({
        reply: "Bad response",
        suggestions: [
          {
            id: "bad-action",
            title: "Bad action",
            description: "This action is not allowed.",
            actions: [
              {
                type: "APPLY_PROFILE",
                improvement: "UNKNOWN_ACTION"
              }
            ]
          }
        ]
      });

    expect(result.success).toBe(false);
  });
});