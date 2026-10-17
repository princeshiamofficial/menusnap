/**
 * Central content + sample data for the MenuSnap landing page.
 *
 * NOTE ON DATA ACCURACY: restaurant names, menu items and prices in this file
 * are illustrative reference samples used to demonstrate the product UI.
 * The live MenuSnap database contains verified menu references; displayed
 * prices are listed-price references only and may change.
 */

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const HERO_FILTERS = [
  "All",
  "Restaurant",
  "Café",
  "Fast Food",
  "Chinese",
  "Coffee",
  "Bakery",
] as const;

export type HeroFilter = (typeof HERO_FILTERS)[number];

export type HeroItem = {
  name: string;
  price: number;
  category: Exclude<HeroFilter, "All">;
  restaurant: string;
  emoji: string;
};

export const HERO_ITEMS: HeroItem[] = [
  { name: "Chicken Burger", price: 250, category: "Fast Food", restaurant: "Burger Bari", emoji: "🍔" },
  { name: "Chicken Pasta", price: 320, category: "Restaurant", restaurant: "Café Nodi", emoji: "🍝" },
  { name: "Thai Fried Chicken", price: 280, category: "Chinese", restaurant: "Golden Dragon", emoji: "🍗" },
  { name: "Cold Coffee", price: 180, category: "Coffee", restaurant: "Coffee Tree", emoji: "☕" },
  { name: "Chicken Sandwich", price: 220, category: "Café", restaurant: "Café Nodi", emoji: "🥪" },
  { name: "Beef Steak", price: 480, category: "Restaurant", restaurant: "Skyline Grill", emoji: "🥩" },
  { name: "Dim Sum (4 pcs)", price: 190, category: "Chinese", restaurant: "Golden Dragon", emoji: "🥟" },
  { name: "Chocolate Cake Slice", price: 150, category: "Bakery", restaurant: "Bengal Bakery", emoji: "🍰" },
];

export const HERO_MENU_DEFAULT = [
  { name: "Chicken Burger", price: 280 },
  { name: "Chicken Pasta", price: 320 },
  { name: "Cold Coffee", price: 180 },
];

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

export type Stat = {
  /** Numeric value to count up. Omit to render `text` as-is. */
  value?: number;
  suffix?: string;
  /** Static display text used when `value` is omitted. */
  text?: string;
  label: string;
};

export const STATS: Stat[] = [
  { value: 500, suffix: "+", label: "Restaurant & Parlor Menus" },
  { text: "Thousands", label: "Menu Items" },
  { value: 2000, suffix: "+", label: "Categories" },
  { text: "One Platform", label: "to Build Your Menu" },
];

/* ------------------------------------------------------------------ */
/* Problem section                                                     */
/* ------------------------------------------------------------------ */

export const OLD_WAY = [
  { label: "Facebook", emoji: "💬" },
  { label: "Google Search", emoji: "🔎" },
  { label: "PDF Menus", emoji: "📄" },
  { label: "Screenshots", emoji: "📸" },
  { label: "Delivery Apps", emoji: "🛵" },
  { label: "Excel", emoji: "📊" },
  { label: "Notes", emoji: "📝" },
];

export const PAIN_POINTS = [
  "কোন Item রাখবো?",
  "Competitors কী রাখছে?",
  "কোন Category দরকার?",
  "Price কত রাখা যায়?",
  "সব Information কোথায় পাবো?",
];

export const ORGANIZED_POINTS = [
  "500+ restaurant menu references",
  "Search thousands of food items",
  "Category-wise browsing",
  "Price references & comparisons",
  "One menu builder workspace",
];

/* ------------------------------------------------------------------ */
/* Demo video                                                          */
/* ------------------------------------------------------------------ */

/** YouTube / Vimeo embed URL or a direct .mp4 / .webm file. */
export const DEMO_VIDEO_URL =
  "https://v1.pinimg.com/videos/iht/expMp4/f5/95/a4/f595a4da623d1223b1717a624b53940c_720w.mp4";

export const DEMO_TOUR_VIDEO_URL =
  "https://v1.pinimg.com/videos/iht/expMp4/79/86/b7/7986b72a3da0ea79fcd1c5c482eefecf_720w.mp4";

export const DEMO_WORKFLOW = [
  "Login",
  "Explore",
  "Search",
  "Research Price",
  "Add Items",
  "Customize",
  "Build",
];

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

export type HowStep = {
  number: string;
  title: string;
  kicker: string;
  desc: string;
};

export const HOW_STEPS: HowStep[] = [
  {
    number: "01",
    title: "Explore",
    kicker: "Browse references",
    desc: "Browse menu references from 500+ restaurants and parlors — by category, location and food type.",
  },
  {
    number: "02",
    title: "Pick & Customize",
    kicker: "Make it yours",
    desc: "Select relevant items and customize the name, description, category and your own price.",
  },
  {
    number: "03",
    title: "Build",
    kicker: "Your menu, ready",
    desc: "Organize categories, reorder items and create the final menu list for your business.",
  },
];

export const HOW_WORKFLOW = ["Explore", "Select", "Customize", "Done"];

/* ------------------------------------------------------------------ */
/* Restaurant explorer                                                 */
/* ------------------------------------------------------------------ */

export const EXPLORER_FILTERS = [
  "All",
  "Café",
  "Fast Food",
  "Chinese",
  "Bangla",
  "Burger",
  "Pizza",
  "Coffee",
] as const;

export type ExplorerRestaurant = {
  name: string;
  category: string;
  location: string;
  items: number;
  initial: string;
  tone: string;
};

export const EXPLORER_RESTAURANTS: ExplorerRestaurant[] = [
  { name: "Café Nodi", category: "Café", location: "Dhanmondi, Dhaka", items: 86, initial: "N", tone: "bg-amber-100 text-amber-800" },
  { name: "Burger Bari", category: "Fast Food", location: "Gulshan, Dhaka", items: 42, initial: "B", tone: "bg-accent-soft text-accent-deep" },
  { name: "Golden Dragon", category: "Chinese", location: "Motijheel, Dhaka", items: 118, initial: "G", tone: "bg-red-100 text-red-700" },
  { name: "Rongdhonu Kitchen", category: "Bangla", location: "Agrabad, Chattogram", items: 64, initial: "R", tone: "bg-emerald-100 text-emerald-700" },
  { name: "Pizza Poth", category: "Pizza", location: "Banani, Dhaka", items: 38, initial: "P", tone: "bg-orange-100 text-orange-700" },
  { name: "Coffee Tree", category: "Coffee", location: "Uttara, Dhaka", items: 27, initial: "C", tone: "bg-stone-200 text-stone-700" },
  { name: "Smash Burgers", category: "Burger", location: "Bashundhara, Dhaka", items: 31, initial: "S", tone: "bg-violet-100 text-violet-700" },
  { name: "Bengal Bakery", category: "Bakery", location: "Shahbag, Dhaka", items: 73, initial: "B", tone: "bg-yellow-100 text-yellow-800" },
];

export const EXPLORER_BENEFITS = [
  "Restaurant-wise browsing",
  "Category filtering",
  "Food search",
  "Menu references",
  "Faster research",
];

/* ------------------------------------------------------------------ */
/* Smart search                                                        */
/* ------------------------------------------------------------------ */

export const SEARCH_DEMO_QUERY = "Chicken Burger";

export type SearchResult = {
  name: string;
  source: string;
  price: number;
};

export const SEARCH_RESULTS: SearchResult[] = [
  { name: "Classic Chicken Burger", source: "Burger Bari", price: 240 },
  { name: "Crispy Chicken Burger", source: "Smash Burgers", price: 260 },
  { name: "BBQ Chicken Burger", source: "Pizza Poth", price: 320 },
  { name: "Cheese Chicken Burger", source: "Café Nodi", price: 290 },
  { name: "Grilled Chicken Burger", source: "Skyline Grill", price: 280 },
  { name: "Double Chicken Burger", source: "Burger Bari", price: 350 },
];

/* ------------------------------------------------------------------ */
/* Price research                                                      */
/* ------------------------------------------------------------------ */

export type PriceRow = { name: string; price: number };

export type PriceComparison = {
  item: string;
  emoji: string;
  count: string;
  range: string;
  rows: PriceRow[];
};

export const PRICE_COMPARISONS: PriceComparison[] = [
  {
    item: "Chicken Burger",
    emoji: "🍔",
    count: "14 references",
    range: "৳220",
    rows: [
      { name: "Restaurant A", price: 220 },
      { name: "Restaurant B", price: 250 },
      { name: "Restaurant C", price: 280 },
      { name: "Restaurant D", price: 320 },
    ],
  },
  {
    item: "Cold Coffee",
    emoji: "☕",
    count: "9 references",
    range: "৳130",
    rows: [
      { name: "Restaurant A", price: 130 },
      { name: "Restaurant B", price: 150 },
      { name: "Restaurant C", price: 170 },
      { name: "Restaurant D", price: 190 },
    ],
  },
  {
    item: "Chicken Pasta",
    emoji: "🍝",
    count: "11 references",
    range: "৳280",
    rows: [
      { name: "Restaurant A", price: 280 },
      { name: "Restaurant B", price: 310 },
      { name: "Restaurant C", price: 340 },
      { name: "Restaurant D", price: 380 },
    ],
  },
];

export const PRICE_DISCLAIMER =
  "Displayed prices are references only and may change. MenuSnap does not guarantee or prescribe selling prices.";

/* ------------------------------------------------------------------ */
/* Menu builder                                                        */
/* ------------------------------------------------------------------ */

export type BuilderItem = { id: string; name: string; price: number };
export type BuilderCategory = { id: string; name: string; items: BuilderItem[] };

export const BUILDER_INITIAL: BuilderCategory[] = [
  {
    id: "burger",
    name: "Burger",
    items: [
      { id: "b1", name: "Classic Chicken Burger", price: 280 },
      { id: "b2", name: "BBQ Chicken Burger", price: 320 },
      { id: "b3", name: "Double Cheese Burger", price: 390 },
    ],
  },
  {
    id: "pizza",
    name: "Pizza",
    items: [
      { id: "p1", name: "Chicken BBQ Pizza", price: 450 },
      { id: "p2", name: "Veggie Supreme Pizza", price: 380 },
    ],
  },
  {
    id: "pasta",
    name: "Pasta",
    items: [
      { id: "pa1", name: "Chicken Alfredo Pasta", price: 340 },
      { id: "pa2", name: "Creamy Mushroom Pasta", price: 310 },
    ],
  },
  {
    id: "rice",
    name: "Rice",
    items: [
      { id: "r1", name: "Chicken Fried Rice", price: 240 },
      { id: "r2", name: "Egg Fried Rice", price: 180 },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    items: [
      { id: "d1", name: "Cold Coffee", price: 180 },
      { id: "d2", name: "Fresh Lime Soda", price: 120 },
    ],
  },
  {
    id: "dessert",
    name: "Dessert",
    items: [
      { id: "de1", name: "Chocolate Brownie", price: 160 },
      { id: "de2", name: "Cheesecake Slice", price: 220 },
    ],
  },
];

export const BUILDER_CHIPS = ["Add Items", "Edit Price", "Categories", "Reorder", "Save", "Export"];

/* ------------------------------------------------------------------ */
/* Bento grid                                                          */
/* ------------------------------------------------------------------ */

export type BentoCard = {
  id: "database" | "search" | "price" | "builder" | "categories" | "shortlist" | "export" | "multiple";
  size: "lg" | "md" | "sm";
  title: string;
  desc: string;
};

export const BENTO_CARDS: BentoCard[] = [
  {
    id: "database",
    size: "lg",
    title: "500+ Menu References",
    desc: "Restaurant-wise browsing across Bangladesh — categories, items and price references in one organized library.",
  },
  {
    id: "search",
    size: "md",
    title: "Smart Search",
    desc: "Find any food item across thousands of entries in seconds.",
  },
  {
    id: "price",
    size: "md",
    title: "Price Reference",
    desc: "See listed price ranges for similar items before you decide.",
  },
  {
    id: "builder",
    size: "lg",
    title: "Menu Builder",
    desc: "Build, organize and export your complete menu from one workspace.",
  },
  {
    id: "categories",
    size: "sm",
    title: "Custom Categories",
    desc: "Structure your menu the way your business needs.",
  },
  {
    id: "shortlist",
    size: "sm",
    title: "Item Shortlist",
    desc: "Save candidate items while you research.",
  },
  {
    id: "export",
    size: "sm",
    title: "PDF / Excel Export",
    desc: "Export your menu depending on your plan.",
  },
  {
    id: "multiple",
    size: "sm",
    title: "Multiple Menus",
    desc: "Keep separate projects for each restaurant.",
  },
];

/* ------------------------------------------------------------------ */
/* Benefits & audience                                                 */
/* ------------------------------------------------------------------ */

export const BENEFITS = [
  {
    icon: "⏱",
    title: "Save Research Time",
    desc: "Stop searching Facebook pages, PDFs and screenshots one by one. Start from an organized reference library.",
  },
  {
    icon: "🧭",
    title: "Make Better Decisions",
    desc: "Use organized menu references when planning categories, items and price ranges.",
  },
  {
    icon: "⚡",
    title: "Build Faster",
    desc: "Move from research to a ready menu in one workflow — no scattered tools.",
  },
  {
    icon: "🗂",
    title: "Stay Organized",
    desc: "Replace scattered notes and spreadsheets with one clean workspace.",
  },
];

export const AUDIENCE = [
  { icon: "🍽", title: "New Restaurant", desc: "Start with a researched menu plan instead of guessing." },
  { icon: "🍔", title: "Fast Food", desc: "Compare burger, fried chicken and snack references fast." },
  { icon: "☕", title: "Café", desc: "Build coffee, dessert and light-meal menus with confidence." },
  { icon: "🍱", title: "Cloud Kitchen", desc: "Plan delivery-friendly menus and price references." },
  { icon: "🥐", title: "Bakery", desc: "Organize cakes, pastries and snack categories cleanly." },
  { icon: "🎨", title: "Menu Designer", desc: "Research real market structure before designing." },
  { icon: "🏢", title: "Agency", desc: "Manage menu projects for multiple restaurant clients." },
] as const;

/* ------------------------------------------------------------------ */
/* Before / After                                                      */
/* ------------------------------------------------------------------ */

export const WITHOUT_MENUSNAP = [
  "Facebook searching",
  "Random screenshots",
  "PDF files",
  "Manual notes",
  "Excel sheets",
  "Repeated research",
  "Confusing references",
];

export const WITH_MENUSNAP = [
  "One Dashboard",
  "500+ References",
  "Smart Search",
  "Price Research",
  "Menu Builder",
  "Saved Projects",
];

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export type PlanId = "starter" | "pro" | "agency";
export type BillingPeriod = "1m" | "3m";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  quarterly: number | null;
  features: string[];
  cta: string;
  popular?: boolean;
  launch?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Start researching your first menu.",
    monthly: 499,
    quarterly: null,
    features: [
      "500+ Menu Database",
      "Restaurant Browse",
      "Food Search",
      "Category Search",
      "Price Reference",
      "Basic Menu Builder",
      "Menu Save",
    ],
    cta: "Start with Starter",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Full research + builder power.",
    monthly: 999,
    quarterly: 1999,
    popular: true,
    launch: true,
    features: [
      "Everything in Starter",
      "Advanced Research",
      "Price Comparison",
      "Unlimited Menu Building",
      "Item Shortlist",
      "Custom Categories",
      "Custom Pricing",
      "Description Editing",
      "PDF / Excel Export",
    ],
    cta: "Get MenuSnap Pro",
  },
  {
    id: "agency",
    name: "Agency",
    tagline: "For teams managing multiple clients.",
    monthly: 2499,
    quarterly: 4999,
    features: [
      "Everything in Pro",
      "Multiple Restaurant Projects",
      "Client-wise Menu Management",
      "Agency Workspace",
      "Higher Usage Limits",
      "Priority Support",
    ],
    cta: "Choose Agency",
  },
];

export const COUPON = {
  code: "MENUSNAP500",
  discount: 500,
  offerLabel: "LAUNCH OFFER",
} as const;

export const PRICING_TRUST = [
  { icon: "🔒", label: "Secure Payment" },
  { icon: "⚡", label: "Fast Account Activation" },
  { icon: "📧", label: "Access Instructions by Email" },
  { icon: "💬", label: "Customer Support" },
] as const;

/* ------------------------------------------------------------------ */
/* Purchase flow                                                       */
/* ------------------------------------------------------------------ */

export const PURCHASE_STEPS = [
  {
    n: "01",
    title: "Choose Plan",
    desc: "Pick Starter, Pro or Agency and your billing duration.",
  },
  {
    n: "02",
    title: "Complete Payment",
    desc: "Pay securely through our Bangladesh-friendly payment gateway.",
  },
  {
    n: "03",
    title: "Account Activated",
    desc: "Payment is verified server-side, then your subscription is activated automatically.",
  },
  {
    n: "04",
    title: "Check Your Email",
    desc: "You'll receive secure account setup / login instructions by email.",
  },
  {
    n: "05",
    title: "Login & Start Building",
    desc: "Set a secure password or use a magic link, then start building your menu.",
  },
];

export const PURCHASE_NOTE =
  "We never display or email plain-text passwords. Account setup uses a secure password-set link or a one-time activation link.";

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "MenuSnap কী?",
    a: "MenuSnap হলো Restaurant Menu Research ও Menu Builder-এর একটি SaaS platform। এখানে বাংলাদেশের 500+ Restaurant ও Parlor-এর Menu Reference, হাজারো Food Item এবং Price Reference এক জায়গায় পাবেন — এবং সেখান থেকে নিজের Restaurant-এর Menu তৈরি করতে পারবেন।",
  },
  {
    q: "MenuSnap-এ কতগুলো Menu Reference আছে?",
    a: "বর্তমানে 500+ Restaurant ও Parlor-এর Menu Reference আছে এবং প্রতিনিয়ত যোগ হচ্ছে। Restaurant-ভিত্তিক Browse, Category Filter এবং Food Search দিয়ে দ্রুত খুঁজে পাবেন।",
  },
  {
    q: "আমি কি অন্য Restaurant-এর Menu সরাসরি Copy করবো?",
    a: "না। MenuSnap শুধু Research Reference প্রদান করে — আপনি দেখবেন কী ধরনের Item, Category এবং Price Market-এ প্রচলিত। নিজের Business-এর Costing, Positioning আর Brand অনুযায়ী নিজের Menu তৈরি করবেন। এটি Copy-এর Tool নয়, Research ও Planning-এর Tool।",
  },
  {
    q: "Displayed Price কি recommended selling price?",
    a: "না। Displayed Price হলো Listed Price Reference মাত্র — তথ্যগত উদ্দেশ্যে দেখানো হয়। Restaurant-এর Price পরিবর্তন হতে পারে এবং MenuSnap কোনো নির্দিষ্ট Selling Price নিশ্চিত বা prescribe করে না। চূড়ান্ত Pricing আপনার নিজের খরচ ও Business Strategy অনুযায়ী নির্ধারণ করবেন।",
  },
  {
    q: "আমি কি নিজের Menu তৈরি করতে পারবো?",
    a: "অবশ্যই। Item যোগ করা, Name ও Description Edit করা, নিজের Price বসানো, Category তৈরি ও Reorder করা — সবই Menu Builder-এ করতে পারবেন এবং Menu Project Save করে রাখতে পারবেন।",
  },
  {
    q: "Menu Export করা যাবে?",
    a: "হ্যাঁ, Plan অনুযায়ী PDF ও Excel Export সুবিধা আছে। Pro এবং Agency Plan-এ Export অন্তর্ভুক্ত।",
  },
  {
    q: "Agency Plan কার জন্য?",
    a: "যারা একাধিক Restaurant Client-এর Menu Manage করেন — Menu Designers, Branding Agencies, Freelancers এবং Consultants। Multiple Project ও Client-wise Management সুবিধা পাবেন।",
  },
  {
    q: "Subscription কতদিনের?",
    a: "1 Month বা 3 Months — দুটো Duration-ই বেছে নিতে পারবেন। 3 Months-এ বেশি সাশ্রয় হয়।",
  },
];

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Explore", href: "#product" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Login", href: "/login" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
      { label: "Support", href: "mailto:support@menusnap.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Refund Policy", href: "/legal/refund" },
    ],
  },
] as const;

export const SITE_TAGLINE = "Research Less. Build Smarter.";