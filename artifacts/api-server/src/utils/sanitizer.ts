import sanitizeHtml from "sanitize-html";

export const sanitizeText = (value: string) => {
  if (typeof value !== "string") return value;
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

export const sanitizeOptionalText = (value?: string) => value ? sanitizeText(value) : value;

export const sanitizeObjectTextFields = (obj: Record<string, any>, fields: string[]) => {
  for (const f of fields) {
    if (obj[f] && typeof obj[f] === "string") obj[f] = sanitizeText(obj[f]);
  }
  return obj;
};

export default sanitizeText;
