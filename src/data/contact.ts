import type { LinkItem } from "../types/portfolio";
import { profile } from "./profile";

export type Contact = {
  name: string;
  email: string;
  phone: string;
  location: string;
  /* The verified professional profiles, in the order the status bar shows them. */
  github: string;
  linkedIn: string;
  codeforces: string;
};

export type SocialLink = LinkItem & {
  /* The compact form the status bar shows instead of the full label. */
  badge: string;
};

/*
  Verified contact details. Identity itself is owned by the profile, so the
  name and location are never written twice.
*/
export const contact: Contact = {
  name: profile.name,
  email: "ahmedsalah18991992@gmail.com",
  phone: "+20-1203440190",
  location: profile.location,
  github: "https://github.com/MrSalah1",
  linkedIn: "https://www.linkedin.com/in/ahmed-salah-8bbb0a1b5",
  codeforces: "https://codeforces.com/profile/ahmedsalah16",
};

/*
  One place turns the verified profiles into link rows, so the status bar,
  the contact window and the terminal never describe the same links twice.
*/
export const socialLinks: SocialLink[] = [
  { label: "LINKEDIN", badge: "in", url: contact.linkedIn },
  { label: "GITHUB", badge: "GH", url: contact.github },
  { label: "CODEFORCES", badge: "CF", url: contact.codeforces },
];

/* Everything the contact window and the terminal offer as a way to reach out. */
export const contactLinks: LinkItem[] = [...socialLinks];