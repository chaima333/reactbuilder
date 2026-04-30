import { TextBlock } from "../components/blocks/TextBlock";
import { ImageBlock } from "../components/blocks/ImageBlock";
import { TitleBlock } from "../components/blocks/TitleBlock";
import { ButtonBlock } from "../components/blocks/ButtonBlock";

export const blockRegistry: Record<string, any> = {
  title: {
    component: TitleBlock,
    label: "Titre",
    isContainer: true,
    fields: [
      { key: "content", label: "Texte", type: "text", target: "props" },
      { key: "fontSize", label: "Taille Police", type: "text", target: "style", responsive: true },
      { key: "color", label: "Couleur", type: "color", target: "style" },
      { key: "textAlign", label: "Alignement", type: "select", options: ["left", "center", "right"], target: "style", responsive: true }
    ],
    defaultData: {
      props: { content: "Nouveau Titre" },
      style: { desktop: { fontSize: "32px", color: "#222", textAlign: "left" } }
    }
  },
  text: {
    component: TextBlock,
    label: "Texte",
    isContainer: true,
    fields: [
      { key: "content", label: "Paragraphe", type: "text", target: "props" },
      { key: "fontSize", label: "Taille", type: "text", target: "style", responsive: true },
      { key: "color", label: "Couleur", type: "color", target: "style" }
    ],
    defaultData: {
      props: { content: "Ceci est un paragraphe..." },
      style: { desktop: { fontSize: "16px", color: "#555" } }
    }
  },
  image: {
    component: ImageBlock,
    label: "Image",
    isContainer: true,
    fields: [
      { key: "url", label: "Lien Image", type: "text", target: "props" },
      { key: "borderRadius", label: "Arrondi (px)", type: "text", target: "style" }
    ],
    defaultData: {
      props: { url: "https://via.placeholder.com/400x200", alt: "Image" },
      style: { desktop: { borderRadius: "0px" } }
    }
  },
  button: {
    component: ButtonBlock,
    label: "Bouton",
    isContainer: true,
    fields: [
      { key: "label", label: "Texte Bouton", type: "text", target: "props" },
      { key: "url", label: "Lien (URL)", type: "text", target: "props" },
      { key: "backgroundColor", label: "Fond", type: "color", target: "style" },
      { key: "color", label: "Texte Color", type: "color", target: "style" }
    ],
    defaultData: {
      props: { label: "Cliquez ici", url: "#" },
      style: { desktop: { backgroundColor: "#1976d2", color: "#fff", padding: "12px 24px" } }
    }
  }
};

export const getBlockComponent = (type: string) => blockRegistry[type]?.component;