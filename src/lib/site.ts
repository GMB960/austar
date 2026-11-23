/**
 * Austar Energy — business facts and shared site configuration.
 * Single source of truth for contact details, service info and content notices.
 * These facts come from the supplied brief; do not invent extras.
 */

export const SITE = {
  name: "Austar Energy",
  phoneDisplay: "0468 013 322",
  phoneHref: "tel:+61468013322",
  emailGeneral: "office@austarenergy.com.au",
  emailSales: "sales@austarenergy.com.au",
  addresses: {
    nsw: "Unit 30, 3 Kelso Crescent, Moorebank NSW 2170, Australia",
    vic: "175 A'Beckett St, Melbourne VIC 3000, Australia",
  },
  regions: "Victoria & New South Wales",
  services: ["Solar", "Heat pump hot water", "Air conditioning"] as const,
  existingSite: "https://www.austarenergy.com.au",
  existingPages: {
    privacy: "https://www.austarenergy.com.au/",
    terms: "https://www.austarenergy.com.au/",
  },
} as const;

/** Standing content notice required on the site. */
export const COLD_CALL_NOTICE =
  "Austar Energy does not conduct cold-call marketing. If someone calls you claiming to represent us and you're unsure, hang up and check with us directly using the contact details published on this site.";

/** Full official statement for the homepage notice. */
export const COLD_CALL_STATEMENT = [
  "Austar Energy wishes to clarify that we do not engage in or endorse cold calling practices. Recently, we have received reports of cold calls falsely made in our name.",
  "We want to assure our clients and the public that these actions are not authorized by Austar Energy and do not align with our operational standards or policies.",
  "We are committed to conducting our business with integrity and transparency, and any cold calling activity claiming association with Austar Energy is fraudulent and not representative of our company's practices.",
] as const;

/** Standing eligibility wording required wherever offers are mentioned. */
export const OFFERS_NOTICE =
  "Available offers and eligibility depend on your location, property, existing system and applicable program conditions.";

/** Label used for photography without confirmed Austar provenance. */
export const PHOTO_DISCLAIMER = "Illustrative photography";
