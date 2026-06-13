export interface NavbarPayload {
  type: "NAVBAR";

  logo?: {
    text?: string;
    image?: string;
    href?: string;
  };

  links?: {
    label: string;
    href: string;
  }[];

  cta?: {
    label: string;
    href: string;
  } | null;

  claimedNode?: any;
}