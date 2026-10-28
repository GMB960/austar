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

/** Standing eligibility wording required wherever offers are mentioned. */
export const OFFERS_NOTICE =
  "Available offers and eligibility depend on your location, property, existing system and applicable program conditions.";

/** Label used for photography without confirmed Austar provenance. */
export const PHOTO_DISCLAIMER = "Illustrative photography";
