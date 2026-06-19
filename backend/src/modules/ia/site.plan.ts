export const generateSitePlan = (category: string) => {
  // ===== NORMALIZATION MAP =====
  // الـ AI classifier يرجّع categories بصيغة معينة، نحولوها للصيغة اللي نستعملوها
  const normalizedCategoryMap: Record<string, string> = {
    Medical: "health",
    Finance: "business",
    Technology: "business",
    Agency: "agency",
    Restaurant: "restaurant",
    Education: "education",
    Portfolio: "portfolio",
    Ecommerce: "ecommerce",
    Corporate: "business",
    Consulting: "business",
    // Fallback: إذا دخلت أي كلمة أخرى
    Health: "health",
    Business: "business",
    ECommerce: "ecommerce",
  };

  // Normalisation
  const normalizedCategory =
    normalizedCategoryMap[category] || category.toLowerCase();

  // ===== BASE PAGES (toujours présentes) =====
  const basePages = [
    {
      title: "Home",
      slug: "home",
      type: "home",
      icon: "🏠",
      required: true,
    },
    {
      title: "About",
      slug: "about",
      type: "about",
      icon: "ℹ️",
      required: true,
    },
    {
      title: "Contact",
      slug: "contact",
      type: "contact",
      icon: "📧",
      required: true,
    },
  ];

  // ===== PAGES PAR CATEGORIE =====
  const categoryPages: Record<string, any[]> = {
    // === BUSINESS / CORPORATE ===
    business: [
      {
        title: "Services",
        slug: "services",
        type: "services",
        icon: "💼",
      },
      {
        title: "Portfolio",
        slug: "portfolio",
        type: "portfolio",
        icon: "📁",
      },
      {
        title: "Testimonials",
        slug: "testimonials",
        type: "testimonials",
        icon: "⭐",
      },
      {
        title: "FAQ",
        slug: "faq",
        type: "faq",
        icon: "❓",
      },
      {
        title: "Blog",
        slug: "blog",
        type: "blog",
        icon: "📝",
      },
      {
        title: "Careers",
        slug: "careers",
        type: "careers",
        icon: "💼",
      },
    ],

    // === E-COMMERCE ===
    ecommerce: [
      {
        title: "Shop",
        slug: "shop",
        type: "shop",
        icon: "🛍️",
      },
      {
        title: "Products",
        slug: "products",
        type: "products",
        icon: "📦",
      },
      {
        title: "Cart",
        slug: "cart",
        type: "cart",
        icon: "🛒",
      },
      {
        title: "Checkout",
        slug: "checkout",
        type: "checkout",
        icon: "💳",
      },
      {
        title: "Wishlist",
        slug: "wishlist",
        type: "wishlist",
        icon: "❤️",
      },
      {
        title: "Orders",
        slug: "orders",
        type: "orders",
        icon: "📋",
      },
      {
        title: "Categories",
        slug: "categories",
        type: "categories",
        icon: "📂",
      },
    ],

    // === PORTFOLIO / CREATIVE ===
    portfolio: [
      {
        title: "Projects",
        slug: "projects",
        type: "projects",
        icon: "🎨",
      },
      {
        title: "Gallery",
        slug: "gallery",
        type: "gallery",
        icon: "🖼️",
      },
      {
        title: "Testimonials",
        slug: "testimonials",
        type: "testimonials",
        icon: "⭐",
      },
      {
        title: "Blog",
        slug: "blog",
        type: "blog",
        icon: "📝",
      },
      {
        title: "Awards",
        slug: "awards",
        type: "awards",
        icon: "🏆",
      },
    ],

    // === BLOG / PUBLISHING ===
    blog: [
      {
        title: "Posts",
        slug: "posts",
        type: "posts",
        icon: "📰",
      },
      {
        title: "Categories",
        slug: "categories",
        type: "categories",
        icon: "📂",
      },
      {
        title: "Authors",
        slug: "authors",
        type: "authors",
        icon: "✍️",
      },
      {
        title: "Newsletter",
        slug: "newsletter",
        type: "newsletter",
        icon: "📧",
      },
      {
        title: "Archive",
        slug: "archive",
        type: "archive",
        icon: "📚",
      },
    ],

    // === RESTAURANT / FOOD ===
    restaurant: [
      {
        title: "Menu",
        slug: "menu",
        type: "menu",
        icon: "🍽️",
      },
      {
        title: "Reservations",
        slug: "reservations",
        type: "reservations",
        icon: "📅",
      },
      {
        title: "Events",
        slug: "events",
        type: "events",
        icon: "🎉",
      },
      {
        title: "Gallery",
        slug: "gallery",
        type: "gallery",
        icon: "🖼️",
      },
      {
        title: "Reviews",
        slug: "reviews",
        type: "reviews",
        icon: "⭐",
      },
      {
        title: "Location",
        slug: "location",
        type: "location",
        icon: "📍",
      },
    ],

    // === EDUCATION ===
    education: [
      {
        title: "Courses",
        slug: "courses",
        type: "courses",
        icon: "📚",
      },
      {
        title: "Curriculum",
        slug: "curriculum",
        type: "curriculum",
        icon: "📖",
      },
      {
        title: "Teachers",
        slug: "teachers",
        type: "teachers",
        icon: "👨‍🏫",
      },
      {
        title: "Events",
        slug: "events",
        type: "events",
        icon: "📅",
      },
      {
        title: "Admissions",
        slug: "admissions",
        type: "admissions",
        icon: "🎓",
      },
      {
        title: "Gallery",
        slug: "gallery",
        type: "gallery",
        icon: "🖼️",
      },
    ],

    // === HEALTH / MEDICAL ===
    health: [
      {
        title: "Services",
        slug: "services",
        type: "services",
        icon: "🏥",
      },
      {
        title: "Doctors",
        slug: "doctors",
        type: "doctors",
        icon: "👨‍⚕️",
      },
      {
        title: "Appointments",
        slug: "appointments",
        type: "appointments",
        icon: "📅",
      },
      {
        title: "Testimonials",
        slug: "testimonials",
        type: "testimonials",
        icon: "⭐",
      },
      {
        title: "Patient Info",
        slug: "patient-info",
        type: "patient-info",
        icon: "📋",
      },
      // ✅ Contact mnéhi (déjà dans basePages)
    ],

    // === REAL ESTATE ===
    realestate: [
      {
        title: "Properties",
        slug: "properties",
        type: "properties",
        icon: "🏘️",
      },
      {
        title: "Buy",
        slug: "buy",
        type: "buy",
        icon: "💰",
      },
      {
        title: "Rent",
        slug: "rent",
        type: "rent",
        icon: "🔑",
      },
      {
        title: "Agents",
        slug: "agents",
        type: "agents",
        icon: "🤝",
      },
      {
        title: "Testimonials",
        slug: "testimonials",
        type: "testimonials",
        icon: "⭐",
      },
      {
        title: "FAQs",
        slug: "faqs",
        type: "faqs",
        icon: "❓",
      },
    ],

    // === EVENT / CONFERENCE ===
    event: [
      {
        title: "Schedule",
        slug: "schedule",
        type: "schedule",
        icon: "📋",
      },
      {
        title: "Speakers",
        slug: "speakers",
        type: "speakers",
        icon: "🎤",
      },
      {
        title: "Tickets",
        slug: "tickets",
        type: "tickets",
        icon: "🎫",
      },
      {
        title: "Venue",
        slug: "venue",
        type: "venue",
        icon: "📍",
      },
      {
        title: "Sponsors",
        slug: "sponsors",
        type: "sponsors",
        icon: "🤝",
      },
      {
        title: "Gallery",
        slug: "gallery",
        type: "gallery",
        icon: "🖼️",
      },
    ],

    // === AGENCY ===
    agency: [
      {
        title: "Services",
        slug: "services",
        type: "services",
        icon: "💼",
      },
      {
        title: "Work",
        slug: "work",
        type: "work",
        icon: "📁",
      },
      {
        title: "Process",
        slug: "process",
        type: "process",
        icon: "⚙️",
      },
      {
        title: "Team",
        slug: "team",
        type: "team",
        icon: "👥",
      },
      {
        title: "Testimonials",
        slug: "testimonials",
        type: "testimonials",
        icon: "⭐",
      },
      {
        title: "Blog",
        slug: "blog",
        type: "blog",
        icon: "📝",
      },
    ],

    // === CONSTRUCTION ===
    construction: [
      {
        title: "Services",
        slug: "services",
        type: "services",
        icon: "🔨",
      },
      {
        title: "Projects",
        slug: "projects",
        type: "projects",
        icon: "🏗️",
      },
      {
        title: "Gallery",
        slug: "gallery",
        type: "gallery",
        icon: "🖼️",
      },
      {
        title: "Testimonials",
        slug: "testimonials",
        type: "testimonials",
        icon: "⭐",
      },
      // ✅ Contact mnéhi (déjà dans basePages)
    ],

    // === TRAVEL / TOURISM ===
    travel: [
      {
        title: "Destinations",
        slug: "destinations",
        type: "destinations",
        icon: "✈️",
      },
      {
        title: "Packages",
        slug: "packages",
        type: "packages",
        icon: "🧳",
      },
      {
        title: "Bookings",
        slug: "bookings",
        type: "bookings",
        icon: "📅",
      },
      {
        title: "Reviews",
        slug: "reviews",
        type: "reviews",
        icon: "⭐",
      },
      {
        title: "Gallery",
        slug: "gallery",
        type: "gallery",
        icon: "🖼️",
      },
    ],

    // === DEFAULT (fallback si category non reconnue) ===
    default: [
      {
        title: "Services",
        slug: "services",
        type: "services",
        icon: "💼",
      },
      {
        title: "Portfolio",
        slug: "portfolio",
        type: "portfolio",
        icon: "📁",
      },
      {
        title: "FAQ",
        slug: "faq",
        type: "faq",
        icon: "❓",
      },
    ],
  };

  // ===== SELECTION PAGES =====
  const pages = categoryPages[normalizedCategory] || categoryPages.default;

  // ===== COMBINER BASE + CATEGORY PAGES =====
  // نمنعو الـ duplicates: نحتفظوا بالـ basePages ونزيدو الـ category pages اللي موش موجودة
  const baseSlugs = new Set(basePages.map((p) => p.slug));
  const uniqueCategoryPages = pages.filter((p) => !baseSlugs.has(p.slug));

  return [...basePages, ...uniqueCategoryPages];
};

// ===== HELPERS =====

// === GET AVAILABLE CATEGORIES ===
export const getAvailableCategories = () => {
  return [
    { value: "business", label: "Business / Corporate", icon: "💼" },
    { value: "ecommerce", label: "E-Commerce", icon: "🛍️" },
    { value: "portfolio", label: "Portfolio / Creative", icon: "🎨" },
    { value: "blog", label: "Blog / Publishing", icon: "📝" },
    { value: "restaurant", label: "Restaurant / Food", icon: "🍽️" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "health", label: "Health / Medical", icon: "🏥" },
    { value: "realestate", label: "Real Estate", icon: "🏘️" },
    { value: "event", label: "Event / Conference", icon: "🎤" },
    { value: "agency", label: "Agency", icon: "🤝" },
    { value: "construction", label: "Construction", icon: "🔨" },
    { value: "travel", label: "Travel / Tourism", icon: "✈️" },
  ];
};

// === GET CATEGORY ICON ===
export const getCategoryIcon = (category: string) => {
  const categories = getAvailableCategories();
  const found = categories.find((c) => c.value === category);
  return found?.icon || "📄";
};

// === GET CATEGORY LABEL ===
export const getCategoryLabel = (category: string) => {
  const categories = getAvailableCategories();
  const found = categories.find((c) => c.value === category);
  return found?.label || category;
};

// === GET CATEGORY PAGE COUNT ===
export const getCategoryPageCount = (category: string) => {
  const pages = generateSitePlan(category);
  return pages.length;
};

// === GET PAGE TYPES ===
export const getPageTypes = () => {
  return [
    { value: "home", label: "Home Page", icon: "🏠" },
    { value: "about", label: "About Page", icon: "ℹ️" },
    { value: "contact", label: "Contact Page", icon: "📧" },
    { value: "services", label: "Services Page", icon: "💼" },
    { value: "portfolio", label: "Portfolio Page", icon: "📁" },
    { value: "blog", label: "Blog Page", icon: "📝" },
    { value: "shop", label: "Shop Page", icon: "🛍️" },
    { value: "faq", label: "FAQ Page", icon: "❓" },
    { value: "testimonials", label: "Testimonials", icon: "⭐" },
    { value: "gallery", label: "Gallery", icon: "🖼️" },
    { value: "team", label: "Team Page", icon: "👥" },
    { value: "events", label: "Events Page", icon: "📅" },
    { value: "careers", label: "Careers Page", icon: "💼" },
    { value: "pricing", label: "Pricing Page", icon: "💰" },
    { value: "privacy", label: "Privacy Policy", icon: "🔒" },
    { value: "terms", label: "Terms of Service", icon: "📜" },
  ];
};

// === NORMALIZE CATEGORY (pour utilisation externe) ===
export const normalizeCategory = (category: string): string => {
  const map: Record<string, string> = {
    Medical: "health",
    Finance: "business",
    Technology: "business",
    Agency: "agency",
    Restaurant: "restaurant",
    Education: "education",
    Portfolio: "portfolio",
    Ecommerce: "ecommerce",
    Corporate: "business",
    Consulting: "business",
    Health: "health",
    Business: "business",
    ECommerce: "ecommerce",
  };
  return map[category] || category.toLowerCase();
};