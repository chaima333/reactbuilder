import { TextBlock } from "../components/blocks/TextBlock";
import { ImageBlock } from "../components/blocks/ImageBlock";
import { TitleBlock } from "../components/blocks/TitleBlock";
import { ButtonBlock } from "../components/blocks/ButtonBlock";

export const blockRegistry: Record<string, any> = {
  title: {
    component: TitleBlock,
    label: "Titre",
    defaultData: {
      props: { content: "Nouveau Titre" },
      style: { fontSize: "32px", fontWeight: "bold", color: "#222", padding: "10px 0" }
    }
  },
  text: {
    component: TextBlock,
    label: "Texte",
    defaultData: {
      props: { content: "Ceci est un paragraphe..." },
      style: { fontSize: "16px", color: "#555", padding: "10px 0" }
    }
  },
  image: {
    component: ImageBlock,
    label: "Image",
    defaultData: {
      props: { url: "", alt: "" },
      style: { borderRadius: "0px", align: "center" }
    }
  },
  button: {
    component: ButtonBlock,
    label: "Bouton",
    defaultData: {
      props: { label: "Cliquez ici", url: "#" },
      style: { borderRadius: "4px", padding: "12px 24px", color: "#fff", backgroundColor: "#1976d2" }
    }
  }
};
export const getBlockComponent = (type: string) => blockRegistry[type]?.component;