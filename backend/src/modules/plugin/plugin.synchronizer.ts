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
    const marketplace = registered.marketplace;

    const [plugin, created] =
      await Plugin.findOrCreate({
        where: {
          slug
        },
        defaults: {
          name:
            marketplace?.displayName ||
            titleFromSlug(slug),
          slug,
          description:
            marketplace?.description ||
            `${titleFromSlug(slug)} plugin for ReactBuilder.`,
          version:
            marketplace?.version || "1.0.0",
          author:
            marketplace?.author || "ReactBuilder",
          category:
            marketplace?.category ||
            categoryFromSlug(slug),
          icon: marketplace?.icon,
          status: "published",
          isActive: registered.enabled
        }
      });

    if (!created) {
      await plugin.update({
        name:
          marketplace?.displayName ||
          plugin.name,
        description:
          marketplace?.description ||
          plugin.description,
        author:
          marketplace?.author ||
          plugin.author,
        icon:
          marketplace?.icon ||
          plugin.icon,
        isActive: registered.enabled,
        category:
          marketplace?.category ||
          plugin.category ||
          categoryFromSlug(slug),
        version:
          marketplace?.version ||
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
