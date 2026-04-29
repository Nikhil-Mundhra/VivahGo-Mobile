const FORUMS_SITE_NAME = 'VivahGo forums';
const FORUMS_HOSTNAME = 'forums.vivahgo.com';
const FORUMS_SITE_URL = 'https://forums.vivahgo.com';
const LOCAL_FORUMS_ROUTE = '/forums';
const BADGE_COLORS = {
  amber: "badge-amber",
  coral: "badge-coral",
  teal: "badge-teal",
  purple: "badge-purple",
  pink: "badge-pink",
  blue: "badge-blue",
  green: "badge-green",
};

class Tag {
  constructor(label) {
    this.label = label;
  }
}

class Post {
  constructor({ id, title, authorHandle, authorInitials, avatarColor, timeAgo, replies, views, tags = [] }) {
    this.id = id;
    this.title = title;
    this.authorHandle = authorHandle;
    this.authorInitials = authorInitials;
    this.avatarColor = avatarColor;
    this.timeAgo = timeAgo;
    this.replies = replies;
    this.views = views;
    this.tags = tags.map(t => new Tag(t));
  }
}

class Subcategory {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }
}

class Category {
  constructor({ id, title, badgeColor, subcategories = [], posts = [] }) {
    this.id = id;
    this.title = title;
    this.badgeColor = BADGE_COLORS[badgeColor] || badgeColor;
    this.subcategories = subcategories.map(s => new Subcategory(s));
    this.posts = posts.map(p => new Post(p));
  }
}
class Forum {
  constructor({ name, categories = [] }) {
    this.name = name;
    this.categories = categories.map(c => new Category(c));
  }

  getCategoryById(id) {
    return this.categories.find(c => c.id === id) || null;
  }

  getPostById(postId) {
    for (const category of this.categories) {
      const post = category.posts.find(p => p.id === postId);
      if (post) return post;
    }
    return null;
  }

  getAllPosts() {
    return this.categories.flatMap(c => c.posts);
  }

  getTopPosts(n = 5) {
    return this.getAllPosts()
      .sort((a, b) => b.views - a.views)
      .slice(0, n);
  }
}

const vivahGoForum = new Forum({
  name: "VivahGo Forums",
  categories: [
    {
      id: "wedding-planning-essentials",
      title: "Wedding Planning Essentials",
      badgeColor: "amber",
      subcategories: [
        { id: "budgets-finance",       name: "Budgets & Finance" },
        { id: "timelines-checklists",  name: "Timelines & Checklists" },
        { id: "guest-management",      name: "Guest Management" },
        { id: "first-steps",           name: "First Steps" },
      ],
      posts: [
        {
          id: "post-001",
          title: "We just got engaged and have no idea where to begin. Is 12 months enough time?",
          authorHandle: "Priya_Agarwal",
          authorInitials: "PA",
          avatarColor: "amber",
          timeAgo: "2 days ago",
          replies: 14,
          views: 1200,
          tags: ["FIRST-STEPS", "TIMELINE", "HELP"],
        },
        {
          id: "post-002",
          title: "How do I split the budget between venue, catering, and decor without underspending on one?",
          authorHandle: "RishabhSeth",
          authorInitials: "RS",
          avatarColor: "teal",
          timeAgo: "5 days ago",
          replies: 9,
          views: 874,
          tags: ["BUDGET", "FINANCE"],
        },
        {
          id: "post-003",
          title: "Joint family vs nuclear: managing two very different guest lists from both sides",
          authorHandle: "MeghnaKapoor",
          authorInitials: "MK",
          avatarColor: "coral",
          timeAgo: "8 days ago",
          replies: 22,
          views: 2100,
          tags: ["GUEST-LIST", "FAMILY"],
        },
      ],
    },

    {
      id: "venues-decor",
      title: "Venues & Decor",
      badgeColor: "coral",
      subcategories: [
        { id: "banquet-halls-hotels",   name: "Banquet Halls & Hotels" },
        { id: "farmhouses-lawns",       name: "Farmhouses & Lawns" },
        { id: "destination-weddings",   name: "Destination Weddings" },
        { id: "mandap-floral-decor",    name: "Mandap & Floral Decor" },
      ],
      posts: [
        {
          id: "post-004",
          title: "Is a farmhouse venue actually cheaper than a 5-star hotel for 400 guests?",
          authorHandle: "AnkitVarma",
          authorInitials: "AV",
          avatarColor: "purple",
          timeAgo: "3 days ago",
          replies: 17,
          views: 1500,
          tags: ["VENUE", "BUDGET", "COMPARISON"],
        },
        {
          id: "post-005",
          title: "We want a pastel marigold and rose gold mandap theme. Any decorators in Delhi NCR?",
          authorHandle: "SimranGill",
          authorInitials: "SG",
          avatarColor: "pink",
          timeAgo: "6 days ago",
          replies: 11,
          views: 963,
          tags: ["DECOR", "MANDAP", "DELHI"],
        },
        {
          id: "post-006",
          title: "Udaipur destination wedding on a ₹25 lakh budget, is it realistic?",
          authorHandle: "NehhaKhanna",
          authorInitials: "NK",
          avatarColor: "blue",
          timeAgo: "10 days ago",
          replies: 31,
          views: 3400,
          tags: ["DESTINATION", "UDAIPUR", "BUDGET"],
        },
      ],
    },

    {
      id: "vendors-professionals",
      title: "Vendors & Professionals",
      badgeColor: "teal",
      subcategories: [
        { id: "photographers-videographers", name: "Photographers & Videographers" },
        { id: "caterers-menus",              name: "Caterers & Menus" },
        { id: "makeup-hair",                 name: "Makeup & Hair" },
        { id: "wedding-planners",            name: "Wedding Planners" },
      ],
      posts: [
        {
          id: "post-007",
          title: "What questions should I actually ask a photographer before signing a contract?",
          authorHandle: "DivyaMehta",
          authorInitials: "DM",
          avatarColor: "green",
          timeAgo: "4 days ago",
          replies: 19,
          views: 2700,
          tags: ["PHOTOGRAPHY", "CONTRACT", "TIPS"],
        },
        {
          id: "post-008",
          title: "North Indian vs South Indian caterer for a mixed wedding, any experience?",
          authorHandle: "VenkatRao",
          authorInitials: "VR",
          avatarColor: "amber",
          timeAgo: "7 days ago",
          replies: 25,
          views: 1800,
          tags: ["CATERING", "MENU", "INTERCULTURAL"],
        },
        {
          id: "post-009",
          title: "My makeup trial looked nothing like the reference photos. What should I do?",
          authorHandle: "RiyaDesai",
          authorInitials: "RD",
          avatarColor: "coral",
          timeAgo: "1 day ago",
          replies: 38,
          views: 4100,
          tags: ["MAKEUP", "BRIDAL", "VENDOR-ISSUE"],
        },
      ],
    },

    {
      id: "fashion-jewellery",
      title: "Fashion & Jewellery",
      badgeColor: "pink",
      subcategories: [
        { id: "bridal-lehengas-sarees",    name: "Bridal Lehengas & Sarees" },
        { id: "groom-sherwani-suits",      name: "Groom's Sherwani & Suits" },
        { id: "jewellery-accessories",     name: "Jewellery & Accessories" },
        { id: "outfit-coordination",       name: "Outfit Coordination" },
      ],
      posts: [
        {
          id: "post-010",
          title: "How far in advance should I order a custom bridal lehenga from a designer?",
          authorHandle: "ShrutiSharma",
          authorInitials: "SS",
          avatarColor: "pink",
          timeAgo: "9 days ago",
          replies: 12,
          views: 1100,
          tags: ["LEHENGA", "CUSTOM", "TIMELINE"],
        },
        {
          id: "post-011",
          title: "Renting vs buying jewellery for the wedding day. Which makes more financial sense?",
          authorHandle: "PoojaThakur",
          authorInitials: "PT",
          avatarColor: "amber",
          timeAgo: "11 days ago",
          replies: 44,
          views: 5200,
          tags: ["JEWELLERY", "BUDGET", "RENTAL"],
        },
      ],
    },

    {
      id: "rituals-ceremonies-culture",
      title: "Rituals, Ceremonies & Culture",
      badgeColor: "purple",
      subcategories: [
        { id: "mehendi-haldi",         name: "Mehendi & Haldi" },
        { id: "sangeet-cocktail",      name: "Sangeet & Cocktail" },
        { id: "pheras-main-ceremony",  name: "Pheras & Main Ceremony" },
        { id: "regional-customs",      name: "Regional Customs" },
        { id: "intercultural-weddings",name: "Intercultural Weddings" },
      ],
      posts: [
        {
          id: "post-012",
          title: "How do you combine a Punjabi and Tamilian wedding without it feeling like two separate events?",
          authorHandle: "KarthikNair",
          authorInitials: "KN",
          avatarColor: "purple",
          timeAgo: "14 days ago",
          replies: 56,
          views: 6300,
          tags: ["INTERCULTURAL", "CEREMONIES", "POPULAR"],
        },
        {
          id: "post-013",
          title: "Sangeet performance ideas when neither family can dance. Please help!",
          authorHandle: "IshaBansal",
          authorInitials: "IB",
          avatarColor: "teal",
          timeAgo: "2 days ago",
          replies: 29,
          views: 3800,
          tags: ["SANGEET", "PERFORMANCE", "HELP"],
        },
      ],
    },

    {
      id: "honeymoon-travel",
      title: "Honeymoon & Travel",
      badgeColor: "blue",
      subcategories: [
        { id: "india-honeymoons",         name: "India Honeymoons" },
        { id: "international-destinations",name: "International Destinations" },
        { id: "visa-travel-tips",         name: "Visa & Travel Tips" },
      ],
      posts: [
        {
          id: "post-014",
          title: "Bali vs Maldives for a December honeymoon: which one is actually worth the price difference?",
          authorHandle: "ArjunChandra",
          authorInitials: "AC",
          avatarColor: "blue",
          timeAgo: "6 days ago",
          replies: 33,
          views: 4500,
          tags: ["BALI", "MALDIVES", "INTERNATIONAL"],
        },
        {
          id: "post-015",
          title: "We want a quiet, scenic honeymoon inside India. Not Goa. Any underrated suggestions?",
          authorHandle: "LaherieRao",
          authorInitials: "LR",
          avatarColor: "green",
          timeAgo: "3 days ago",
          replies: 48,
          views: 5900,
          tags: ["INDIA", "OFFBEAT", "RECOMMENDATIONS"],
        },
      ],
    },

    {
      id: "real-weddings-inspiration",
      title: "Real Weddings & Inspiration",
      badgeColor: "green",
      subcategories: [
        { id: "share-your-story", name: "Share Your Story" },
        { id: "photo-diaries",    name: "Photo Diaries" },
        { id: "lessons-learned",  name: "Lessons Learned" },
      ],
      posts: [
        {
          id: "post-016",
          title: "We planned our entire wedding in 6 months on ₹18 lakhs. Here is exactly how we did it.",
          authorHandle: "TanviJoshi",
          authorInitials: "TJ",
          avatarColor: "green",
          timeAgo: "15 days ago",
          replies: 71,
          views: 9100,
          tags: ["REAL-WEDDING", "BUDGET", "GUIDE"],
        },
        {
          id: "post-017",
          title: "Three things that went wrong on my wedding day and what I wish I had done differently",
          authorHandle: "SonaliMukherjee",
          authorInitials: "SM",
          avatarColor: "amber",
          timeAgo: "12 days ago",
          replies: 62,
          views: 7400,
          tags: ["REAL-WEDDING", "LESSONS", "POPULAR"],
        },
      ],
    },
  ],
});

const CHILD_ICON_MAP = {
  windows: '⊞',
  apple: '',
  linux: '🐧',
  android: '🤖',
  phone: '📱',
  volume: '🔊',
  forward: '»',
  thumbsUp: '👍',
  comments: '💬',
  bell: '🔔',
  like: '👍',
  heart: '❤',
  hand: '✋',
  wrench: '🛠',
  globe: '🌐',
  flag: '⚑',
  bag: '👜',
  speed: '↯',
  opera: 'O',
  puzzle: '🧩',
  terminal: '⌘',
  layers: '▤',
  shapes: '◉',
  cloud: '☁',
  puzzlePiece: '🧩',
};

const ICON_SYMBOLS = {
  list: '☰',
  clock: '◷',
  tag: '🏷',
  user: '●',
  users: '👥',
  book: '▤',
  help: '?',
  search: '⌕',
  login: '→',
  windows: '⊞',
  apple: '',
  linux: '🐧',
  forward: '»',
  comments: '💬',
  bell: '🔔',
  thumbsUp: '👍',
  heart: '❤',
  hand: '✋',
  wrench: '🛠',
  globe: '🌐',
  flag: '⚑',
  bag: '👜',
  speed: '↯',
  opera: 'O',
  puzzle: '🧩',
  terminal: '⌘',
  layers: '▤',
  shapes: '◉',
  cloud: '☁',
  gallery: '▣',
};

const HEX_COLORS = {
  amber: '#ffb300',
  coral: '#ff7043',
  teal: '#26a69a',
  purple: '#ab47bc',
  pink: '#ec407a',
  blue: '#42a5f5',
  green: '#66bb6a',
};

let cidCounter = 1;

const FORUM_CATEGORIES = vivahGoForum.categories.map((cat) => {
  const cid = cidCounter++;
  const colorKey = String(cat.badgeColor || '').replace('badge-', '');
  const catColor = HEX_COLORS[colorKey] || '#333333';

  const totalPosts = cat.posts.reduce((sum, p) => sum + (p.replies || 0), 0);
  const totalTopics = cat.posts.length;

  const children = cat.subcategories.map((sub) => {
    const subCid = cidCounter++;
    return {
      href: `/category/${subCid}/${sub.id}`,
      label: sub.name,
      icon: 'comments',
      color: catColor,
    };
  });

  const latestPost = cat.posts[0];
  let teaser = null;

  if (latestPost) {
    const topicSlug = latestPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const avatarColorKey = String(latestPost.avatarColor || '').replace('badge-', '');
    
    teaser = {
      user: {
        name: latestPost.authorHandle,
        color: HEX_COLORS[avatarColorKey] || catColor,
        initial: latestPost.authorInitials,
        href: `/user/${latestPost.authorHandle.toLowerCase()}`,
      },
      time: latestPost.timeAgo,
      href: `/topic/${latestPost.id}/${topicSlug}`,
      html: `<p dir="auto">${escapeHtml(latestPost.title)}</p>`,
    };
  }

  const formatStat = (num) => (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString());

  return {
    cid: cid,
    slug: `${cid}/${cat.id}`,
    name: cat.title,
    description: `Discussions about ${cat.title}`,
    color: catColor,
    topicsLabel: formatStat(totalTopics),
    topicsTitle: totalTopics.toString(),
    postsLabel: formatStat(totalPosts),
    postsTitle: totalPosts.toString(),
    children: children,
    teaser: teaser,
  };
});

const FORUM_CATEGORY_BY_PATH = new Map();
const FORUM_CATEGORY_BY_CID = new Map();

function stripQueryAndHash(value = '') {
  return String(value || '').split(/[?#]/)[0];
}

function normalizeForumsPathname(pathname = '/') {
  let normalizedPath = stripQueryAndHash(pathname).trim();
  if (!normalizedPath) {
    return '/categories';
  }

  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  normalizedPath = normalizedPath.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/' || normalizedPath === '/categories') {
    return '/categories';
  }

  if (normalizedPath === LOCAL_FORUMS_ROUTE) {
    return '/categories';
  }

  if (normalizedPath === `${LOCAL_FORUMS_ROUTE}/categories`) {
    return '/categories';
  }

  if (normalizedPath.startsWith(`${LOCAL_FORUMS_ROUTE}/`)) {
    return normalizedPath.slice(LOCAL_FORUMS_ROUTE.length) || '/categories';
  }

  return normalizedPath;
}

function formatForumsLabel(value = '') {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function getForumCategoryPath(category = {}) {
  if (category?.href) {
    return String(category.href).replace(/^\/category\//, '');
  }

  return String(category?.slug || '').replace(/^\/category\//, '');
}

function registerForumCategory(category, parent = null) {
  const children = Array.isArray(category.children) ?
    category.children.map((child) => {
      const childPath = String(child?.href || '').replace(/^\/category\//, '');
      const childCidMatch = String(child?.href || '').match(/^\/category\/(\d+)\//);
      const childCid = childCidMatch ? Number(childCidMatch[1]) : 0;
      return {
        cid: childCid,
        slug: childPath,
        href: child.href,
        label: child.label,
        name: child.label,
        description: `Browse ${child.label} discussions inside ${category.name}.`,
        color: child.color,
        icon: child.icon,
        parentCid: category.cid,
        parent: {
          cid: category.cid,
          name: category.name,
          slug: category.slug,
        },
        children: [],
        teaser: null,
        topicsLabel: '',
        topicsTitle: '',
        postsLabel: '',
        postsTitle: '',
      };
    }) : [];

  const registeredCategory = {
    ...category,
    href: `/category/${category.slug}`,
    children,
    parentCid: parent?.cid || 0,
    parent: parent ? {
      cid: parent.cid,
      name: parent.name,
      slug: parent.slug,
    } : null,
  };

  const pathKey = getForumCategoryPath(registeredCategory);
  if (pathKey) {
    FORUM_CATEGORY_BY_PATH.set(pathKey, registeredCategory);
    FORUM_CATEGORY_BY_CID.set(String(registeredCategory.cid), registeredCategory);
  }

  children.forEach((child) => {
    const childPath = getForumCategoryPath(child);
    if (!childPath) {
      return;
    }

    FORUM_CATEGORY_BY_PATH.set(childPath, child);
    FORUM_CATEGORY_BY_CID.set(String(child.cid), child);
  });

  return registeredCategory;
}

FORUM_CATEGORIES.splice(0, FORUM_CATEGORIES.length, ...FORUM_CATEGORIES.map((category) => registerForumCategory(category)));

function getForumCategoryByPath(path = '') {
  return FORUM_CATEGORY_BY_PATH.get(String(path || '').trim()) || null;
}

export function getForumCategoryByCid(cid = '') {
  return FORUM_CATEGORY_BY_CID.get(String(cid || '').trim()) || null;
}

export function resolveForumsViewFromPath(pathname = '/categories') {
  const normalizedPath = normalizeForumsPathname(pathname);
  if (normalizedPath === '/categories') {
    return {
      kind: 'home',
      pathname: '/categories',
      canonicalPath: '/categories',
      category: null,
    };
  }

  const categoryMatch = normalizedPath.match(/^\/category\/(\d+)\/(.+)$/);
  if (categoryMatch) {
    const categoryPath = `${categoryMatch[1]}/${categoryMatch[2]}`;
    const category = getForumCategoryByPath(categoryPath) || getForumCategoryByCid(categoryMatch[1]);
    if (category) {
      return {
        kind: 'category',
        pathname: normalizedPath,
        canonicalPath: `/category/${getForumCategoryPath(category)}`,
        category,
      };
    }
  }

  return {
    kind: 'home',
    pathname: '/categories',
    canonicalPath: '/categories',
    category: null,
  };
}

function resolveForumsViewFromCategoryQuery(categoryCid = '', categorySlug = '') {
  const cid = String(categoryCid || '').trim();
  const slug = String(categorySlug || '').trim();
  if (!cid && !slug) {
    return resolveForumsViewFromPath('/categories');
  }

  const directPath = cid && slug ? `/category/${cid}/${slug}` : (slug ? `/category/${slug}` : `/category/${cid}`);
  return resolveForumsViewFromPath(directPath);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderIcon(name, className = '') {
  const symbol = ICON_SYMBOLS[name] || '•';
  const classes = ['forums-icon', className].filter(Boolean).join(' ');
  return `<span class="${classes}" aria-hidden="true">${escapeHtml(symbol)}</span>`;
}

function renderChildIcon(name, label, color) {
  const symbol = CHILD_ICON_MAP[name] || label.charAt(0);
  return `<span class="forums-child-icon" style="color:${escapeHtml(color || '#999')}" aria-hidden="true">${escapeHtml(symbol)}</span>`;
}

function renderCategoryChildren(children = []) {
  if (!children.length) {
    return '';
  }

  return `<span class="forums-category-children">${children.map((child) => `
    <a class="forums-category-child" href="${escapeHtml(child.href)}">
      ${renderChildIcon(child.icon, child.label, child.color)}
      <small>${escapeHtml(child.label)}</small>
    </a>`).join('')}
  </span>`;
}

function renderCategoryTeaser(teaser = {}) {
  if (!teaser?.html) {
    return '';
  }

  return `
    <div class="forums-category-teaser-card" style="border-color:${escapeHtml(teaser.cardColor || '#d9d9d9')}">
      <a class="forums-category-teaser-link" href="${escapeHtml(teaser.href || '#')}"></a>
      <p>
        <a class="forums-avatar-link" href="${escapeHtml(teaser.user?.href || '#')}">
          <span class="forums-avatar" style="background-color:${escapeHtml(teaser.user?.color || '#aaa')}">${escapeHtml(teaser.user?.initial || '?')}</span>
        </a>
        <a class="forums-category-time-link" href="${escapeHtml(teaser.href || '#')}">
          <small class="timeago">${escapeHtml(teaser.time || '')}</small>
        </a>
      </p>
      ${teaser.topicTitle ? `<h3 class="forums-category-topic-title">${escapeHtml(teaser.topicTitle)}</h3>` : ''}
      <div class="forums-category-post-content">${teaser.html}</div>
    </div>`;
}

function renderCategoryCard(category) {
  return `
    <li class="forums-category-row" data-cid="${escapeHtml(category.cid)}">
      <div class="forums-category-card" style="border-left-color:${escapeHtml(category.color)}">
        <div class="forums-category-details">
          <div class="forums-category-copy">
            <a class="forums-category-link" href="${escapeHtml(`/category/${category.slug}`)}">
              <h2>${escapeHtml(category.name)}</h2>
            </a>
            <p class="forums-category-description">${category.description}</p>
          </div>
          <div class="forums-category-stats">
            <div class="forums-stat">
              <strong>${escapeHtml(category.topicsLabel)}</strong>
              <small>Topics</small>
            </div>
            <div class="forums-stat">
              <strong>${escapeHtml(category.postsLabel)}</strong>
              <small>Posts</small>
            </div>
          </div>
        </div>
        <div class="forums-category-footer">
          ${renderCategoryChildren(category.children)}
        </div>
      </div>
      <aside class="forums-category-teaser">
        ${renderCategoryTeaser(category.teaser)}
      </aside>
    </li>`;
}

function renderForumsBreadcrumbs(category) {
  const crumbs = [
    { href: '/', label: 'Home' },
    { href: '/categories', label: 'Categories' },
  ];
  if (category?.parent) {
    crumbs.push({
      href: `/category/${category.parent.slug}`,
      label: category.parent.name,
    });
  }

  crumbs.push({
    href: category?.href || `/category/${category?.slug || ''}`,
    label: category?.name || 'Category',
  });
  return `<nav class="forums-breadcrumbs" aria-label="Breadcrumb">
    <ol>
      ${crumbs.map((crumb, index) => `
        <li${index === crumbs.length - 1 ? ' aria-current="page"' : ''}>
          ${index === crumbs.length - 1 ? `<span>${escapeHtml(crumb.label)}</span>` : `<a href="${escapeHtml(crumb.href)}">${escapeHtml(crumb.label)}</a>`}
        </li>`).join('')}
    </ol>
  </nav>`;
}

function renderForumsStat(value, label) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return `
    <div class="forums-stat">
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(label)}</small>
    </div>`;
}

function renderForumsCategoryHero(category) {
  const stats = [
    renderForumsStat(category.topicsLabel, 'Topics'),
    renderForumsStat(category.postsLabel, 'Posts'),
    category.children?.length ? renderForumsStat(category.children.length, 'Subcategories') : '',
  ].filter(Boolean).join('');

  return `
    <section class="forums-category-hero">
      <div class="forums-category-hero-copy">
        <p class="forums-section-title">Category</p>
        <h1>${escapeHtml(category.name)}</h1>
        <p class="forums-category-hero-description">${escapeHtml(category.description)}</p>
        ${category.parent ? `<p class="forums-category-parent">Part of <a href="${escapeHtml(`/category/${category.parent.slug}`)}">${escapeHtml(category.parent.name)}</a></p>` : ''}
      </div>
      ${stats ? `<div class="forums-category-hero-stats">${stats}</div>` : ''}
    </section>`;
}

function renderForumsSubcategorySection(category) {
  if (!Array.isArray(category.children) || !category.children.length) {
    return '';
  }

  return `
    <section class="forums-category-section" aria-labelledby="forums-subcategories-title">
      <div class="forums-category-section-heading">
        <p class="forums-section-title">Subcategories</p>
        <h2 id="forums-subcategories-title">Explore the subcategories in ${escapeHtml(category.name)}</h2>
      </div>
      <div class="forums-category-subcategory-grid">
        ${renderCategoryChildren(category.children)}
      </div>
    </section>`;
}

function deriveTopicTitle(teaser = {}, category = {}) {
  const href = String(teaser?.href || '').trim();
  const topicMatch = href.match(/^\/topic\/\d+\/([^/]+)/);
  if (topicMatch) {
    return formatForumsLabel(decodeURIComponent(topicMatch[1]));
  }

  return `${category?.name || 'Forum'} discussion`;
}

function renderForumsTopicSection(category) {
  if (!category?.teaser?.html) {
    return '';
  }

  const teaser = {
    ...category.teaser,
    topicTitle: deriveTopicTitle(category.teaser, category),
  };
  return `
    <section class="forums-category-section" aria-labelledby="forums-topics-title">
      <div class="forums-category-section-heading">
        <p class="forums-section-title">Latest activity</p>
        <h2 id="forums-topics-title">${escapeHtml(teaser.topicTitle)}</h2>
      </div>
      <div class="forums-category-topic-grid">
        ${renderCategoryTeaser(teaser)}
      </div>
    </section>`;
}

function buildForumsHomeSnapshot() {
  return `
    <div class="forums-shell" data-seo-snapshot="forums">
      <main class="forums-main">
        <section class="forums-content">
          <h1 class="forums-section-title">Categories</h1>
          <ul class="forums-category-list">
            ${FORUM_CATEGORIES.map(renderCategoryCard).join('')}
          </ul>
          <nav class="forums-pagination" aria-label="Pages">
            <ul>
              <li class="disabled"><a href="?page=1" aria-label="Previous page">‹</a></li>
              <li class="disabled"><a href="?page=1" aria-label="Next page">›</a></li>
            </ul>
          </nav>
        </section>
      </main>
    </div>`;
}

function buildForumsCategorySnapshot(category) {
  if (!category) {
    return buildForumsHomeSnapshot();
  }

  return `
    <div class="forums-shell forums-shell--category" data-seo-snapshot="forums-category" data-cid="${escapeHtml(category.cid)}">
      <main class="forums-main forums-main--category">
        ${renderForumsBreadcrumbs(category)}
        ${renderForumsCategoryHero(category)}
        ${renderForumsSubcategorySection(category)}
        ${renderForumsTopicSection(category)}
        <nav class="forums-category-back-link" aria-label="Back to categories">
          <a href="/categories">Back to categories</a>
        </nav>
      </main>
    </div>`;
}

function buildForumsSnapshot(options = {}) {
  const view = options.view || resolveForumsViewFromPath(options.pathname || options.path || '/categories');
  if (view.kind === 'category' && view.category) {
    return buildForumsCategorySnapshot(view.category);
  }

  return buildForumsHomeSnapshot();
}

export default {
  CHILD_ICON_MAP,
  FORUMS_HOSTNAME,
  FORUMS_SITE_NAME,
  FORUMS_SITE_URL,
  FORUM_CATEGORIES,
  ICON_SYMBOLS,
  LOCAL_FORUMS_ROUTE,
  buildForumsSnapshot,
  buildForumsCategorySnapshot,
  buildForumsHomeSnapshot,
  formatForumsLabel,
  getForumCategoryByCid,
  getForumCategoryByPath,
  getForumCategoryPath,
  normalizeForumsPathname,
  resolveForumsViewFromCategoryQuery,
  resolveForumsViewFromPath,
  Forum, Category, Subcategory, Post, Tag, vivahGoForum,
};
