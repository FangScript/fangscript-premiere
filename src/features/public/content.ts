import catalog from "../../../contracts/catalog.json";
import dashboard from "@/assets/project-dashboard.jpg";
import assistant from "@/assets/project-assistant.jpg";
import jewellery from "@/assets/project-jewellery.jpg";
export const categories = catalog;
export type Category = (typeof catalog)[number];
export interface ContentRecord {
  id: string;
  kind: string;
  slug: string;
  title: string;
  status: string;
  data: Record<string, any>;
  version: number;
}
export const demonstrations = [
  {
    id: "connected-workspace",
    title: "A clearer view of your business.",
    type: "Software & systems",
    image: dashboard,
    description:
      "An illustrative workspace bringing operations, reporting, and customer activity together.",
    category: "technology",
  },
  {
    id: "support-assistant",
    title: "A little less busy. A lot more helpful.",
    type: "AI & automation",
    image: assistant,
    description:
      "An illustrative support experience that connects customers with relevant answers and a human when needed.",
    category: "ai",
  },
  {
    id: "commerce-experience",
    title: "Commerce with a point of view.",
    type: "Websites & creative",
    image: jewellery,
    description:
      "An illustrative storefront exploring product storytelling and a considered shopping experience.",
    category: "creative",
  },
];
export const faqs = [
  [
    "What can FangScript Lab help with?",
    "We bring together technology, AI automation, digital marketing, content, and business integrations. Start with one need or bring us a connected project.",
  ],
  [
    "How do we get started?",
    "Book a discovery call or send a project brief. We will discuss your goals, existing tools, priorities, and the next useful step.",
  ],
  [
    "How much will my project cost?",
    "Every project is scoped individually. Your proposal will set out the deliverables, schedule, and price. Our default invoicing currency is PKR, with other currencies agreed per project.",
  ],
  [
    "Can you work with our existing tools?",
    "Yes. We first assess your current systems and available integrations, then recommend what to keep, connect, or improve.",
  ],
  [
    "Do you provide support after launch?",
    "Maintenance and ongoing improvements can be included in your proposal. The scope and response arrangements are agreed before work starts.",
  ],
];
