/** This bot's own content. Nothing outside the faq folder reads it. */

export type Topic = { id: string; label: string; answer: string };

export const TOPICS: Topic[] = [
  {
    id: "hours",
    label: "Opening hours",
    answer: "The office is open Monday to Friday, 09:00–17:00.",
  },
  {
    id: "location",
    label: "Location",
    answer: "123 Example Street, Springfield.",
  },
  {
    id: "contact",
    label: "Contact",
    answer: "Email support@example.com, or reply here and someone will follow up.",
  },
];

export function findTopic(id: string): Topic | undefined {
  return TOPICS.find(topic => topic.id === id);
}
