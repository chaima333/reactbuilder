export type PlatformAssistantDoc = {
  id: string;
  title: string;
  category: string;
  content: string;
};

export const PLATFORM_ASSISTANT_DOCS: PlatformAssistantDoc[] = [
  {
    id: "getting-started",
    title: "Getting started with ReactBuilder",
    category: "Getting Started",
    content: `
ReactBuilder is a SaaS website builder that allows users to create and manage websites without writing code.
A user can create a site, add pages, edit content with the visual builder, publish pages, manage plugins and customize the design.
The main workflow is: create a site, create pages, edit blocks, preview the result, then publish the page.
    `
  },
  {
    id: "pages-publishing",
    title: "Pages and publishing",
    category: "Pages",
    content: `
A page in ReactBuilder can be edited in the visual builder.
When the user clicks Save, the page content is stored as editable blocks.
When the user clicks Publish, the page becomes available in the public renderer.
Only published pages are visible to visitors.
If a page is still draft, it remains editable in the dashboard but it is not public.
    `
  },
  {
    id: "builder-blocks",
    title: "Visual builder and blocks",
    category: "Builder",
    content: `
The ReactBuilder editor is based on blocks.
A page is composed of sections, containers, text blocks, image blocks, buttons, cards, navbars, footers and semantic blocks.
Users can drag and drop blocks, edit their properties, change styles and preview the page in desktop, tablet and mobile modes.
The goal is to keep the website editable after import or generation.
    `
  },
  {
    id: "plugins-marketplace",
    title: "Plugins and marketplace",
    category: "Plugins",
    content: `
ReactBuilder includes a plugin marketplace.
Plugins add optional features to a site, such as chatbot, forms, SEO tools, analytics or dashboard widgets.
A plugin must be installed and enabled for a specific site before it becomes active.
If a plugin is disabled, its public feature should not be visible on the published website.
    `
  },
  {
    id: "ai-assistant",
    title: "AI Assistant and Design Copilot",
    category: "AI",
    content: `
ReactBuilder includes AI features to help users create and improve websites.
The AI Assistant can help generate page content and suggest improvements.
The Design Copilot can analyze a page and propose design actions such as improving spacing, cards, buttons, navbar or footer.
AI activity can be tracked in the AI history panel.
    `
  },
  {
    id: "site-chatbot-plugin",
    title: "AI Site Chatbot plugin",
    category: "Chatbot",
    content: `
The AI Site Chatbot is a public plugin for websites created with ReactBuilder.
It appears on the published site only when the plugin is installed and enabled for that site.
The chatbot answers visitor questions using the published content of the site.
It extracts page text, creates chunks, retrieves the most relevant sections and returns an answer with sources.
    `
  },
  {
    id: "users-roles",
    title: "Users, roles and permissions",
    category: "Security",
    content: `
ReactBuilder supports users, roles and permissions.
A platform admin can manage users.
Each site can have members with roles such as owner, admin, editor or viewer.
Permissions control what a user can do, such as reading a site, editing pages, uploading media or installing plugins.
This protects each tenant site from unauthorized access.
    `
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting common issues",
    category: "Troubleshooting",
    content: `
If a public feature does not appear, first check whether the related plugin is installed and enabled.
If a page is not visible publicly, check whether the page is published.
If the backend returns 404, verify that the latest commit is deployed on Render.
If the frontend does not show changes, rebuild the frontend and verify the latest deployment on Vercel.
    `
  }
];