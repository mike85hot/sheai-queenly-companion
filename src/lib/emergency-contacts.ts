export type EmergencyContact = { name: string; tel: string; label: string; source: string };
export type CrisisContact = { name: string; label: string; tel?: string; sms?: string; smsBody?: string; source: string };
export type EmergencyCountry = { code: string; name: string; emergency: EmergencyContact[]; hotlines: CrisisContact[] };

// Source-reviewed 2026-10-22. Preserve service scope; never assume SMS or nationwide coverage.
export const emergencyCountries: EmergencyCountry[] = [
  { code: "CA", name: "Canada", emergency: [{ name: "Emergency services", tel: "911", label: "911", source: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/ukraine-measures/settlement.html" }], hotlines: [{ name: "Suicide Crisis Helpline", tel: "988", sms: "988", label: "988", source: "https://www.canada.ca/en/public-health/services/mental-health-services/mental-health-get-help.html" }] },
  { code: "IN", name: "India", emergency: [{ name: "Emergency services", tel: "112", label: "112", source: "https://112.gov.in/" }], hotlines: [{ name: "Tele-MANAS mental-health support", tel: "14416", label: "14416", source: "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2118790" }] },
  { code: "KE", name: "Kenya", emergency: [{ name: "Police emergency", tel: "999", label: "999", source: "https://nationalpolice.go.ke/contact" }, { name: "Police emergency alternative", tel: "112", label: "112", source: "https://nationalpolice.go.ke/contact" }], hotlines: [] },
  { code: "NG", name: "Nigeria", emergency: [{ name: "Emergency services", tel: "112", label: "112", source: "https://ncc.gov.ng/node/3132" }], hotlines: [] },
  { code: "PK", name: "Pakistan", emergency: [{ name: "Police (Islamabad)", tel: "15", label: "15", source: "https://islamabadpolice.gov.pk/helplines.php" }, { name: "Rescue (Punjab)", tel: "1122", label: "1122", source: "https://www.rescue.gov.pk/" }], hotlines: [] },
  { code: "PH", name: "Philippines", emergency: [{ name: "Emergency hotline", tel: "911", label: "911", source: "https://e911.gov.ph/emergency-hotline-numbers/" }], hotlines: [{ name: "National Center for Mental Health", tel: "1553", label: "1553", source: "https://caro.doh.gov.ph/abot-kamay-ang-tulong-para-sa-mental-health/" }] },
  { code: "ZA", name: "South Africa", emergency: [{ name: "Emergency (mobile phones)", tel: "112", label: "112", source: "https://www.westerncape.gov.za/know-who-you-can-call-emergency" }, { name: "Police", tel: "10111", label: "10111", source: "https://www.westerncape.gov.za/know-who-you-can-call-emergency" }, { name: "Ambulance", tel: "10177", label: "10177", source: "https://www.westerncape.gov.za/know-who-you-can-call-emergency" }], hotlines: [{ name: "Suicide Crisis Line", tel: "0800567567", label: "0800 567 567", source: "https://www.gov.za/sites/default/files/gcis_documents/contacts.pdf" }] },
  { code: "GB", name: "United Kingdom", emergency: [{ name: "Emergency services", tel: "999", label: "999", source: "https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers" }], hotlines: [{ name: "Samaritans", tel: "116123", label: "116 123", source: "https://www.samaritans.org/how-we-can-help/contact-samaritan/" }] },
  { code: "US", name: "United States", emergency: [{ name: "Emergency services", tel: "911", label: "911", source: "https://www.usa.gov/report-crime" }], hotlines: [
    { name: "National Domestic Violence Hotline", tel: "18007997233", label: "1-800-799-7233", sms: "88788", smsBody: "START", source: "https://www.thehotline.org/" },
    { name: "988 Suicide & Crisis Lifeline", tel: "988", sms: "988", label: "988", source: "https://988lifeline.org/" },
    { name: "Crisis Text Line", label: "Text HOME to 741741", sms: "741741", smsBody: "HOME", source: "https://www.crisistextline.org/" },
    { name: "RAINN Sexual Assault Hotline", tel: "18006564673", label: "1-800-656-4673", source: "https://rainn.org/" },
    { name: "Love is Respect (dating abuse)", tel: "18663319474", label: "1-866-331-9474", sms: "22522", smsBody: "LOVEIS", source: "https://www.loveisrespect.org/" },
  ] },
];

export function countryFromLocale(locale: string): string | undefined {
  try {
    const region = new Intl.Locale(locale).region;
    return emergencyCountries.find((c) => c.code === region)?.code;
  } catch { return undefined; }
}