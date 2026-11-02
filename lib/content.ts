export type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
  frontImage?: string;
  backImage?: string;
  color: string;
  preorder: boolean;
  rightsRequired: boolean;
  sizes: string[];
  price: number | null;
  stock: number | null;
  published: boolean;
};
export type Project = {
  id: string;
  title: string;
  location: string;
  year: string;
  status: string;
  topic: string;
  type: string;
  description: string;
  goals: string[];
  outcomes: string;
  featured: boolean;
  published: boolean;
  image?: string;
  video?: string;
  metrics?: string;
  fundraising?: boolean;
  dates?: string;
  activities?: string[];
  gallery?: string[];
  milestones?: string[];
};
export type Campaign = {
  id: string;
  title: string;
  type: "in-kind";
  status: string;
  year: string;
  description: string;
  items: string[];
  instructions: string;
  contact: string;
  image: string;
  published: boolean;
};
export type Content = {
  pages: {
    intro: string;
    mission: string;
    history: string;
    partners: string;
    contact: string;
    heroImage: string;
  };
  products: Product[];
  projects: Project[];
  campaigns: Campaign[];
  teams: {
    id: string;
    title: string;
    description: string;
    name?: string;
    image?: string;
    published: boolean;
  }[];
  impact: { id: string; label: string; value: string; verified: boolean }[];
  settings: {
    shipping: number | null;
    pickup: boolean;
    pickupDetails: string;
    currency: string;
    pickupFee: number | null;
    fulfillmentWindow: string;
    refundPolicy: string;
    shippingPolicy: string;
    privacyPolicy: string;
    officialContact: string;
  };
  translations: Record<string, Record<string, string>>;
};
export const seed: Content = {
  pages: {
    heroImage: "branding-introduction.png",
    intro:
      "A shared commitment to community health. Project Sa’Bai brings Cambodian and Singaporean students and healthcare professionals together through care, learning, and service.",
    mission:
      "To strengthen community healthcare while inspiring future healthcare professionals to contribute to the well-being of Cambodian communities.",
    history:
      "The supplied project materials describe an initiative established in 2006. This history and all organizational details are awaiting official verification.",
    partners:
      "Partner names and approved logos will be added after confirmation.",
    contact:
      "We would love to hear from you. Send a note about volunteering, partnerships, or our merchandise.",
  },
  products: [
    {
      id: "pharmacy-care",
      title: "Conquering Pharmacy Care",
      description:
        "Three small green characters on the front; pharmacist at an Rx laptop on the back. The original combined mockup is supplied.",
      image: "merch-pharmacy-care.webp",
      color: "White",
      preorder: true,
      rightsRequired: false,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
    {
      id: "night-shift",
      title: "The Night Shift Club",
      description:
        "“Powered by C8H10N4O2” on the chest, with the medical-themed Night Shift Club character on the back. One unique listing; no duplicate resubmission.",
      image: "merch-night-shift.webp",
      color: "White",
      preorder: true,
      rightsRequired: false,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
    {
      id: "tiramisu",
      title: "Tiramisu",
      description:
        "Tiramisu illustration described in the revised brief. Original artwork has not been supplied.",
      image: "",
      color: "Cream / white",
      preorder: true,
      rightsRequired: false,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
    {
      id: "lazy-duck-club",
      title: "Lazy Duck Club",
      description:
        "Humorous duck graphics described in the revised brief. Original artwork has not been supplied.",
      image: "",
      color: "Cream / white",
      preorder: true,
      rightsRequired: false,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
    {
      id: "oil-lamp-chest",
      title: "Oil Lamp Chest",
      description:
        "Nursing and lamp-themed design described in the revised brief. Original artwork has not been supplied.",
      image: "",
      color: "Cream / white",
      preorder: true,
      rightsRequired: false,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
    {
      id: "flora-mentalis",
      title: "Flora Mentalis",
      description:
        "Human-head and floral illustration described in the revised brief. Original artwork has not been supplied.",
      image: "",
      color: "Navy",
      preorder: true,
      rightsRequired: false,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
    {
      id: "molar-radix",
      title: "Molar Radix",
      description:
        "Cartoon molar and skateboard design described in the revised brief. Original artwork has not been supplied.",
      image: "",
      color: "White",
      preorder: true,
      rightsRequired: false,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
    {
      id: "snoopy-medical",
      title: "Snoopy Medical Illustration",
      description:
        "Medical character artwork described in the revised brief. DRAFT ONLY: character and artwork merchandising rights require confirmation.",
      image: "",
      color: "White",
      preorder: true,
      rightsRequired: true,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
    {
      id: "brace-yourself",
      title: "Brace Yourself",
      description:
        "Medical/dental x-ray-themed design described in the revised brief. Original artwork has not been supplied.",
      image: "",
      color: "Royal blue",
      preorder: true,
      rightsRequired: false,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
    {
      id: "dose-makes-poison",
      title: "The Dose Makes the Poison",
      description:
        "Dark green pharmacy/toxicology symbol described in the revised brief. Original artwork has not been supplied.",
      image: "",
      color: "Cream / white",
      preorder: true,
      rightsRequired: false,
      sizes: [],
      price: 10,
      stock: null,
      published: false,
    },
  ],
  campaigns: [
    {
      id: "takeo-books",
      title: "Books, and a little possibility.",
      type: "in-kind",
      status: "Historical / unverified",
      year: "Year unverified · poster reportedly says May 4–9",
      description:
        "The revised brief describes a book-donation campaign for a library refurbishment in Takéo. The poster itself has not been supplied, and the campaign is not active or verified.",
      items: [
        "Notebooks",
        "Story books",
        "Coloring books",
        "Picture books",
        "Children’s reading materials",
      ],
      instructions:
        "Do not deliver items until the organization confirms current needs, dates and collection arrangements.",
      contact: "Awaiting approved campaign contact",
      image: "",
      published: false,
    },
  ],
  projects: [
    {
      id: "takeo-field-visit",
      dates: "Dates awaiting confirmation",
      activities: [],
      gallery: [],
      milestones: [],
      title: "Listening first, in Takéo",
      location: "Takéo Province",
      year: "Unconfirmed",
      status: "Past",
      topic: "Community connection",
      type: "Reconnaissance",
      description:
        "The supplied reference documents a reconnaissance trip and permit-related activity in Takéo. It offers a glimpse into the preparation behind community work, not evidence of completed clinical treatment.",
      goals: [
        "Understand the local context",
        "Explore community collaboration",
        "Plan responsible next steps",
      ],
      outcomes:
        "Dates, permissions and outcomes await organizational verification. No treatment or impact figures are claimed.",
      featured: true,
      published: true,
      image: "takeo-field-visit.png",
      fundraising: true,
    },
    {
      id: "health-education",
      dates: "Dates awaiting confirmation",
      activities: [],
      gallery: [],
      milestones: [],
      title: "Knowledge that travels further",
      location: "Cambodia · location to confirm",
      year: "To be announced",
      status: "Upcoming",
      topic: "Health education",
      type: "Planning example",
      description:
        "An illustrative space for future health education activities. Programme, dates and location have not been confirmed.",
      goals: [
        "Co-design accessible learning materials",
        "Support practical health conversations",
      ],
      outcomes:
        "Planning example only. No delivered activities or measured outcomes.",
      featured: true,
      published: true,
    },
    {
      id: "community-care",
      dates: "Dates awaiting confirmation",
      activities: [],
      gallery: [],
      milestones: [],
      title: "Care starts with connection",
      location: "Cambodia · location to confirm",
      year: "To be announced",
      status: "Current",
      topic: "Community health",
      type: "Planning example",
      description:
        "A development sample showing how future community projects will be shared. This is not an announcement of an active clinical programme.",
      goals: [
        "Listen to community priorities",
        "Build thoughtful partnerships",
      ],
      outcomes:
        "Development sample. Official project information will replace this card.",
      featured: true,
      published: true,
    },
  ],
  teams: [
    "Clinic Heads",
    "Health Education",
    "Public Relations",
    "Pharm Logs",
  ].map((title, i) => ({
    id: "team-" + i,
    title,
    description: [
      "Connecting with communities and coordinating thoughtful care.",
      "Making health knowledge approachable and practical.",
      "Sharing stories and building meaningful connections.",
      "Supporting the careful planning behind community service.",
    ][i],
    published: true,
  })),
  impact: [
    {
      id: "communities",
      label: "Communities reached",
      value: "—",
      verified: false,
    },
    {
      id: "volunteers",
      label: "People working together",
      value: "—",
      verified: false,
    },
    {
      id: "education",
      label: "Health education sessions",
      value: "—",
      verified: false,
    },
  ],
  settings: {
    shipping: null,
    pickup: true,
    pickupDetails: "Pickup arrangements must be confirmed by the team.",
    currency: "USD",
    pickupFee: null,
    fulfillmentWindow: "Awaiting approved preorder fulfillment window.",
    refundPolicy:
      "Awaiting approved cancellation and refund policy. No real transactions are accepted.",
    shippingPolicy:
      "Awaiting approved delivery regions, fees and pickup arrangements.",
    privacyPolicy:
      "Prototype details are stored for authorized team review. Use fictitious data. Retention and data rights contact must be confirmed before launch.",
    officialContact: "Awaiting verified organization contact",
  },
  translations: {
    en: {
      home: "Home",
      about: "About Us",
      projects: "Projects & Impact",
      shop: "Shop",
      donate: "Donate",
      contact: "Contact",
      headline: "Together, we make a difference.",
      explore: "Explore our projects",
      give: "Donate now",
      slogan: "One Goal, One Heart, One SA’BAI!",
    },
    km: {
      home: "ទំព័រដើម",
      about: "អំពីយើង",
      projects: "គម្រោង និងផលជះ",
      shop: "ហាង",
      donate: "បរិច្ចាគ",
      contact: "ទំនាក់ទំនង",
      headline: "រួមគ្នា យើងបង្កើតការផ្លាស់ប្តូរ",
      explore: "ស្វែងយល់ពីគម្រោង",
      give: "បរិច្ចាគឥឡូវនេះ",
      slogan: "គោលដៅតែមួយ បេះដូងតែមួយ សាបៃតែមួយ!",
    },
  },
};
