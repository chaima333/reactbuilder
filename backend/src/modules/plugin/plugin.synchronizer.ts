import { cmsRegistry } from "../../core/plugins/plugin.registry";
import { Plugin } from "../../models/Plugin";

const titleFromSlug = (slug: string) =>
  slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const categoryFromSlug = (slug: string) => {
  if (slug.includes("seo")) return "SEO";
  if (slug.includes("media")) return "Media";
  if (slug.includes("notification")) return "Notification";
  if (slug.includes("ai")) return "AI";
  if (slug.includes("version")) return "Versioning";
  return "General";
};

export const syncRegisteredPlugins = async () => {
  const registeredPlugins =
    cmsRegistry.getRegisteredPlugins();

  for (const registered of registeredPlugins) {
    const slug = registered.name;

    const [plugin, created] =
      await Plugin.findOrCreate({
        where: {
          slug
        },
        defaults: {
          name: titleFromSlug(slug),
          slug,
          description: `${titleFromSlug(slug)} plugin for ReactBuilder.`,
          version: "1.0.0",
          author: "ReactBuilder",
          category: categoryFromSlug(slug),
          status: "published",
          isActive: registered.enabled
        }
      });

    if (!created) {
      await plugin.update({
        isActive: registered.enabled,
        category:
          plugin.category ||
          categoryFromSlug(slug),
        version:
          plugin.version ||
          "1.0.0",
        status:
          plugin.status ||
          "published"
      });
    }
  }

  console.log(
    "✅ Plugin database synchronized:",
    registeredPlugins.map((plugin) => plugin.name)
  );
};