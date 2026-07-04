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
  },
  {
  id: "create-site",
  title: "Creating a new site",
  category: "Sites",
  content: `
To create a new site in ReactBuilder, open the Sites page and click the Create site button.
The user enters the site name, domain or subdomain, and optional description.
After creation, the site appears in the dashboard and becomes the current workspace.
Each site has its own pages, plugins, members and settings.
  `
},
{
  id: "edit-page",
  title: "Editing a page",
  category: "Builder",
  content: `
To edit a page, open a site, choose one of its pages and click Edit.
ReactBuilder opens the visual builder where the user can modify blocks, text, images, buttons and layout.
The user can save changes without publishing them immediately.
The editor keeps the page editable using a block-based structure instead of generating fixed code.
  `
},
{
  id: "preview-page",
  title: "Previewing a page",
  category: "Builder",
  content: `
ReactBuilder allows users to preview a page before publishing it.
The preview helps verify the design, spacing, content and responsive behavior.
Users can check the page in desktop, tablet and mobile modes before making it public.
  `
},
{
  id: "plugin-enable-disable",
  title: "Installing and enabling plugins",
  category: "Plugins",
  content: `
To use a plugin, open the Marketplace of the current site.
The user can install a plugin and enable it for that site.
A plugin can also be disabled without deleting it.
When a plugin is disabled, its public feature should not appear on the published website.
For example, the AI Site Chatbot appears only when the chatbot plugin is enabled.
  `
},
{
  id: "chatbot-plugin-usage",
  title: "Using the AI Site Chatbot plugin",
  category: "Chatbot",
  content: `
The AI Site Chatbot plugin adds a chatbot to a published website.
It is useful for visitors who want to ask questions about the content of that site.
The chatbot uses published pages as its knowledge base.
It retrieves relevant sections from the site and returns an answer with sources.
The plugin must be installed and enabled from the Marketplace before the widget appears publicly.
  `
},
{
  id: "ai-design-copilot",
  title: "Using the Design Copilot",
  category: "AI",
  content: `
The Design Copilot helps improve the design of a page.
It can suggest actions such as improving spacing, cards, buttons, navbar, footer or layout consistency.
The user can review suggestions and apply selected improvements.
AI actions can be tracked in the AI history panel.
  `
},
{
  id: "versioning",
  title: "Page versioning",
  category: "Versioning",
  content: `
ReactBuilder can keep versions of a page.
Versioning helps users restore an older state if a design or content update causes problems.
A version can be created when saving or publishing page changes.
This improves safety when editing important pages.
  `
},
{
  id: "seo-settings",
  title: "SEO settings",
  category: "SEO",
  content: `
SEO settings help improve how a website appears in search engines.
A page can have metadata such as title, description and slug.
Good SEO settings make the page easier to understand for search engines and users.
SEO can also be extended using plugins in the marketplace.
  `
},
{
  id: "media-library",
  title: "Media library",
  category: "Media",
  content: `
The Media Library stores images and files used inside a site.
Users can upload media and reuse it in page blocks.
Media permissions should control who can upload, update or delete files.
A well-organized media library helps users manage website assets.
  `
},
{
  id: "common-errors",
  title: "Common errors and fixes",
  category: "Troubleshooting",
  content: `
If a page does not appear publicly, check if it is published.
If a plugin feature does not appear, check if the plugin is installed and enabled.
If the frontend does not show recent changes, rebuild and redeploy the frontend.
If the backend returns 404 for a new route, verify that the latest backend commit is deployed.
If authentication fails, check that the user is logged in and the JWT token is sent correctly.
  `
},
{
  id: "drag-and-drop-builder",
  title: "Drag and drop builder",
  category: "Builder",
  content: `
ReactBuilder includes a drag and drop visual builder.
Users can add blocks to a page and move them inside valid areas such as sections, containers, flex layouts or grid layouts.
The drag and drop system helps users build pages without writing code.
A block can be dropped only in a compatible place to keep the page structure clean and editable.
For example, text, image and button blocks can be placed inside sections or containers, while layout blocks can organize content into columns or grids.
If a block cannot be dropped, the selected area may not accept that block type.
  `
},
{
  id: "drag-and-drop-troubleshooting",
  title: "Drag and drop troubleshooting",
  category: "Troubleshooting",
  content: `
If drag and drop does not work, first check that the user is inside the page editor.
A block must be dropped inside a valid droppable area.
Some blocks cannot be placed directly inside other blocks because the builder protects the page structure.
If a block returns to its original position, it usually means the drop target is not valid.
The user can try dropping the block inside a section, container, grid item or flex item.
  `
},
];