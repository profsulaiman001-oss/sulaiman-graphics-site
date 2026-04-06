import { useQuery, useMutation } from "@tanstack/react-query";

// Mock Data Types
export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  gradient: string;
  client: string;
  tools: string[];
  /** Primary thumbnail shown on the project card. */
  image?: string;
  /** All gallery images shown on the project detail page.
   *  images[0] is also used as the detail-page hero banner.
   *  Displayed dynamically — no upper limit. */
  images?: string[];
  /** Path relative to /public for a video file (e.g. "/videos/my-ad.mp4").
   *  When present the card shows a video player instead of an image. */
  video?: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  iconType: "pen" | "layers" | "share" | "play" | "box" | "screen";
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

// Category order
export const CATEGORIES = [
  "Branding",
  "Flyer Design",
  "Motion Graphics",
  "Social Media Design",
  "Product Design",
  "Webinar Design",
] as const;

// All projects organised by category
const projects: Project[] = [
  // ── BRANDING ──────────────────────────────────────────────
  {
    id: "branding-1",
    title: "Sarkin Mota Autos",
    category: "Branding",
    description:
      "A premium brand identity combining royal symbolism with automotive elements for a luxury car business.",
    fullDescription:
      "Sarkin Mota Autos needed a visual identity that conveyed authority and prestige in the automotive space. I developed a bold brand system rooted in royal Nigerian symbolism — blending regal typography, gold-toned palettes, and powerful iconography — to position the business as a trusted premium name in the local market.",
    gradient: "from-blue-600 to-cyan-500",
    client: "Sarkin Mota Autos",
    tools: ["Pixellab", "Photopea"],
    image: "/images/sarkin mota.webp",
    images: ["/images/sarkin mota.webp", "images/sarkin mota 1.webp", "images/sarkin mota 2.webp", "images/sarkin mota 3.webp", "images/sarkin mota 4.png", "images/sarkin mota 5.png"],
  },

  // ── FLYER DESIGN ──────────────────────────────────────────
  {
    id: "flyer-1",
    title: "Beach Party Flyer",
    category: "Flyer Design",
    description:
      "Vibrant, eye-catching flyer design crafted to draw crowds to a summer beach event.",
    fullDescription:
      "At Sulaiman Graphics, I create bold and engaging flyer designs that help your brand stand out. This beach party flyer features a high-energy layout, vivid tropical colours, and clear event details that make the invitation impossible to ignore. Whether printed or shared digitally, it was designed to build excitement and drive attendance.",
    gradient: "from-sky-500 to-blue-700",
    client: "Bright Future Intl College",
    tools: ["Pixellab", "Photopea"],
    image: "/images/beach blast flyer.webp",
  },
  {
    id: "flyer-2",
    title: "Bilam Real Estate Flyer",
    category: "Flyer Design",
    description:
      "Clean, professional flyer designed to market premium real estate listings with clarity.",
    fullDescription:
      "Bilam Real Estate required a flyer that clearly conveyed trust and professionalism. I developed a clean, well-structured layout with refined typography and impactful property imagery, enabling potential buyers to quickly understand the value proposition. The final design is a polished, brand-consistent marketing asset optimized for both print and digital use.",
    gradient: "from-blue-500 to-indigo-600",
    client: "Bilam Real Estate",
    tools: ["Pixellab", "Photopea"],
    image: "/images/bilam flyer.webp",
    images: ["/images/bilam flyer.webp"],
  },
  {
    id: "flyer-3",
    title: "Abdul Apple Links Flyer",
    category: "Flyer Design",
    description:
      "Clean, professional flyer designed to market premium phone gadgets.",
    fullDescription:
      "For Abdul Apple Links, the goal was to communicate reliability and product quality through design. I crafted a clean layout, applied structured typography, and incorporated sharp, high-impact phone visuals to present the products clearly and attractively. The result is a refined, brand-aligned flyer designed for effective promotion across print and digital channels.",
    gradient: "from-blue-500 to-indigo-600",
    client: "Abdurrahman Umar",
    tools: ["Pixellab", "Photopea"],
    image: "/images/abdul flyer.webp",
    images: ["/images/abdul flyer.webp"],
  },
  {
    id: "flyer-4",
    title: "Malanta Industry Ltd Flyer",
    category: "Flyer Design",
    description:
      "Clean, professional flyer designed to showcase the brand services.",
    fullDescription:
      "Malanta Industry Ltd required a flyer that conveyed trust, technical expertise, and industry credibility. I developed a clean, well-structured layout with precise typography and high-quality industrial imagery, enabling clients to quickly understand the value of their engineer-certified solutions and API-compliant equipment. The final design is a polished, brand-consistent marketing asset optimized for both print and digital distribution.",
    gradient: "from-blue-500 to-indigo-600",
    client: "Abdurrahman Tijjani Malanta",
    tools: ["Pixellab", "Photopea"],
    image: "/images/engineering flyer.webp",
    images: ["/images/engineering flyer.webp"],
  },
  {
    id: "flyer-5",
    title: "MGH Photo/Videography Flyer",
    category: "Flyer Design",
    description:
      "Clean, professional flyer designed to showcase the brand services.",
    fullDescription:
      "MGH Photo/Videography required a flyer that conveyed trust and creative professionalism. I developed a clean, well-structured layout with refined typography and high-quality visual imagery, enabling potential clients to quickly understand the value of their services. The final design is a polished, brand-consistent marketing asset optimized for both print and digital distribution.",
    gradient: "from-yellow-500 to-orange-600",
    client: "Hafeez Tijjani Ali",
    tools: ["Pixellab", "Photopea"],
    image: "/images/mgh flyer.webp",
    images: ["/images/mgh flyer.webp"],
  },

  // ── MOTION GRAPHICS ───────────────────────────────────────
  {
    id: "motion-1",
    title: "MSA Special Pepper – Product Ad",
    category: "Motion Graphics",
    description:
      "A personal favourite — bold motion ad I created to promote MSA Special Pepper with dynamic transitions and vivid energy.",
    fullDescription:
      "This motion design project is one I'm genuinely proud of. I was tasked with creating a promotional video for MSA Special Pepper, and I poured real creativity into it — blending punchy kinetic typography, fast-paced transitions, and rich colour grading that mirrors the boldness of the product itself. Every frame was designed to stop the scroll and make the viewer feel the heat and excitement of the brand.",
    gradient: "from-blue-700 to-cyan-600",
    client: "MSA Brand",
    tools: ["Capcut", "Alight Motion"],
    image: "/images/pepper.webp",
    video: "/https://lqdeybfkgcihcsticzes.supabase.co/storage/v1/object/public/portfolio-assets/msa.mp4",
  },
  

  // ── SOCIAL MEDIA DESIGN ───────────────────────────────────
  {
    id: "social-1",
    title: "Nexora Exchange",
    category: "Social Media Design",
    description:
      "Scroll-stopping social media content for a crypto brand that boosted visibility and audience engagement.",
    fullDescription:
      "For Nexora Exchange, I developed a cohesive series of promotional and brand awareness content designed to communicate trust, innovation, and reliability. Each piece was carefully crafted with a modern, tech-driven aesthetic to reflect the brand’s identity while enhancing engagement across digital platforms.",
    gradient: "from-green-500 to-green-400",
    client: "Nexora Exchange",
    tools: ["Pixellab", "Photopea"],
    image: "/images/nexora flyer.webp",
    images: ["/images/nexora flyer.webp", "/images/nexora flyer 1.webp", "/images/nexora flyer 2.webp", "images/nexora flyer 3.webp"],
  },
  {
    id: "social-2",
    title: "Zesty Zone",
    category: "Social Media Design",
    description:
      "Scroll-stopping social media content for a food brand that boosted visibility and audience engagement.",
    fullDescription:
      "For Zesty Zone, I created a cohesive range of promotional and brand awareness content that highlights the brand’s vibrant and appetizing identity. Each design was tailored to showcase the appeal of the meals while driving engagement and attracting customers across Instagram and Facebook.",
    gradient: "from-red-500 to-orange-400",
    client: "Zesty Zone",
    tools: ["Pixellab", "Photopea"],
    image: "/images/zesty flyer.webp",
    images: ["/images/zesty flyer.webp", "/images/zesty flyer 1.webp", "/images/zesty flyer 2.webp", "/images/zesty flyer 3.webp", "images/zesty flyer 4.webp"],
  },
  {
    id: "social-3",
    title: "Alkhairat Collections",
    category: "Social Media Design",
    description:
      "Scroll-stopping social media content for a fashion brand that boosted visibility and audience engagement.",
    fullDescription:
      "For Alkhairat Collections, I developed a cohesive series of promotional and brand awareness designs that reflect the brand’s elegance and cultural style. Each piece was thoughtfully crafted to showcase products such as Shadda, lace, and accessories while boosting engagement across social media platforms.",
    gradient: "from-blue-500 to-sky-400",
    client: "Alkhairat Collections",
    tools: ["Pixellab", "Photopea"],
    image: "/images/alkhairat flyer.webp",
    images: ["/images/alkhairat flyer.webp", "/images/alkhairat flyer 1.webp", "/images/alkhairat flyer 2.webp", "images/alkhairat flyer 3.webp", "images/alkhairat flyer 4.webp"],
  },

  // ── PRODUCT DESIGN ────────────────────────────────────────
  {
    id: "product-1",
    title: "MSA Special Pepper",
    category: "Product Design",
    description:
      "Eye-catching product design for MSA Special Pepper that highlights the brand's uniqueness and market appeal.",
    fullDescription:
      "Bold and vibrant product design for MSA Special Pepper that communicates heat, flavour, and quality at a glance. The design system — from label artwork to mockup compositions — was crafted to stand out on shelves and on screen, giving the product a confident, memorable identity that resonates with its target audience.",
    gradient: "from-blue-600 to-indigo-700",
    client: "MSA Brand",
    tools: ["Pixellab", "Photopea"],
    image: "/images/pepper.webp",
    images: ["/images/pepper.webp", "/images/pepper 1.webp", "/images/pepper 2.webp", "images/pepper 3.webp", "images/pepper 4.webp", "images/pepper 5.webp"],
  },

  // ── WEBINAR DESIGN ────────────────────────────────────────
  
  {
    id: "webinar-1",
    title: "Business Breakthrough Summit",
    category: "Webinar Design",
    description:
      "Complete visual identity for an online business summit — banners, speaker cards, and slide decks.",
    fullDescription:
      "For The Business Breakthrough Summit, I crafted a cohesive visual identity that amplified the event’s impact. From speaker profile cards to branded slide templates and replay graphics, every element followed a unified blue-and-white system, delivering a premium, professional look that matched the caliber of the event.",
    gradient: "from-blue-500 to-cyan-700",
    client: "Summit Organiser",
    tools: ["Canva", "Pixellab", "Photopea"],
    image: "/images/webinar flyer.webp",
    images: ["/images/webinar flyer.webp", "/images/webinar flyer 1.webp", "/images/webinar flyer 2.webp", "/images/webinar flyer 3.webp", "/images/webinar flyer 4.webp"],
  },
];

const services: Service[] = [
  {
    id: "s1",
    title: "Logo Design",
    description: "Memorable, versatile marks that capture your brand's essence.",
    iconType: "pen",
  },
  {
    id: "s2",
    title: "Brand Identity",
    description:
      "Comprehensive design systems including typography, colour, and guidelines.",
    iconType: "layers",
  },
  {
    id: "s3",
    title: "Social Media Design",
    description:
      "Engaging social media graphics that boost visibility and audience interaction.",
    iconType: "share",
  },
  {
    id: "s4",
    title: "Motion Graphics",
    description:
      "Dynamic animations and video ads that bring your brand to life.",
    iconType: "play",
  },
  {
    id: "s5",
    title: "Product Design",
    description:
      "Eye-catching product visuals and packaging that make your brand unforgettable.",
    iconType: "box",
  },
  {
    id: "s6",
    title: "UI/UX Design",
    description:
      "Intuitive, stunning interfaces for web and mobile applications.",
    iconType: "screen",
  },
];

const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Sulaiman completely transformed our visual identity. The attention to detail and modern approach made our brand instantly recognisable.",
    author: "Sarah Jenkins",
    role: "CEO, TechNova",
  },
  {
    id: "t2",
    quote:
      "Working with Sulaiman was a breeze. He understood our vision immediately and delivered motion graphics that blew our audience away.",
    author: "Marcus Thorne",
    role: "Marketing Dir., Velocity",
  },
  {
    id: "t3",
    quote:
      "The social media designs for our brand are stunning. We've seen a noticeable jump in engagement since working with Sulaiman Graphics.",
    author: "Elena Rostova",
    role: "Founder, Sharda Collections",
  },
];

// Hooks
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return projects;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const project = projects.find((p) => p.id === id);
      if (!project) throw new Error("Project not found");
      return project;
    },
    enabled: !!id,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => services,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => testimonials,
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send message.");
      return json as { success: boolean; message: string };
    },
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Subscription failed.");
      return json as { success: boolean; message: string };
    },
  });
}
