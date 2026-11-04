import "dotenv/config";
import { sql } from "drizzle-orm";
import { db as dbClient, pool } from "./index";
import {
  artists,
  cartItems,
  carts,
  collections,
  orderItems,
  orders,
  productImages,
  products,
  reviews,
} from "./schema";

const P = {
  texture1:
    "https://images.pexels.com/photos/24345753/pexels-photo-24345753.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  texture2:
    "https://images.pexels.com/photos/31052375/pexels-photo-31052375.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  colour1:
    "https://images.pexels.com/photos/7325760/pexels-photo-7325760.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  colour2:
    "https://images.pexels.com/photos/34902532/pexels-photo-34902532.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  colour3:
    "https://images.pexels.com/photos/7266374/pexels-photo-7266374.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  colour4:
    "https://images.pexels.com/photos/34902535/pexels-photo-34902535.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  colour5:
    "https://images.pexels.com/photos/34902536/pexels-photo-34902536.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  colour6:
    "https://images.pexels.com/photos/25185659/pexels-photo-25185659.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ink1:
    "https://images.pexels.com/photos/10526886/pexels-photo-10526886.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ink2:
    "https://images.pexels.com/photos/9176003/pexels-photo-9176003.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ink3:
    "https://images.pexels.com/photos/14911350/pexels-photo-14911350.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ink4:
    "https://images.pexels.com/photos/9175904/pexels-photo-9175904.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ink5:
    "https://images.pexels.com/photos/9175916/pexels-photo-9175916.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ink6:
    "https://images.pexels.com/photos/9176028/pexels-photo-9176028.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ink7:
    "https://images.pexels.com/photos/9176057/pexels-photo-9176057.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  ink8:
    "https://images.pexels.com/photos/9176002/pexels-photo-9176002.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  clay1:
    "https://images.pexels.com/photos/7663201/pexels-photo-7663201.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  clay2:
    "https://images.pexels.com/photos/11065504/pexels-photo-11065504.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  clay3:
    "https://images.pexels.com/photos/15535547/pexels-photo-15535547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  clay4:
    "https://images.pexels.com/photos/14341977/pexels-photo-14341977.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  clay5:
    "https://images.pexels.com/photos/31203631/pexels-photo-31203631.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  clay6:
    "https://images.pexels.com/photos/38001670/pexels-photo-38001670.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  weave1:
    "https://images.pexels.com/photos/8503255/pexels-photo-8503255.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  weave2:
    "https://images.pexels.com/photos/6275937/pexels-photo-6275937.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  weave3:
    "https://images.pexels.com/photos/7260282/pexels-photo-7260282.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  weave4:
    "https://images.pexels.com/photos/7260272/pexels-photo-7260272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  weave5:
    "https://images.pexels.com/photos/6634553/pexels-photo-6634553.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  weave6:
    "https://images.pexels.com/photos/37181466/pexels-photo-37181466.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

const LOCAL = {
  riverbed: "/art/terra-riverbed.jpg",
  dune: "/art/terra-dune.jpg",
  karoo: "/art/terra-karoo.jpg",
  meridian: "/art/ash-meridian.jpg",
  nile: "/art/ash-nile.jpg",
  vessel: "/art/clay-vessel.jpg",
  trio: "/art/clay-trio.jpg",
  weave: "/art/weave-gold.jpg",
  studio: "/art/studio.jpg",
  gallery: "/art/hero-gallery.jpg",
};

type SeedArtist = {
  slug: string;
  name: string;
  location: string;
  bio: string;
  image: string;
};

type SeedReview = {
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  daysAgo: number;
  verified?: boolean;
};

type SeedProduct = {
  slug: string;
  title: string;
  artist: string;
  collection: string;
  medium: string;
  materials: string;
  year: number;
  dimensions: string;
  editionLabel: string;
  priceCents: number;
  description: string;
  story: string;
  image: string;
  images: { url: string; alt: string; caption: string }[];
  stock: number;
  isFeatured?: boolean;
  reviews: SeedReview[];
};

const seedArtists: SeedArtist[] = [
  {
    slug: "thandiwe-mkhize",
    name: "Thandiwe Mkhize",
    location: "Cape Town, South Africa",
    bio: "Thandiwe grinds her own pigment from Karoo clay and rusted farm iron, painting the semi-desert she drove through every December of her childhood. Her canvases are built in translucent veils over two or three seasons.",
    image: LOCAL.studio,
  },
  {
    slug: "amara-odell",
    name: "Amara Odell",
    location: "Accra & London",
    bio: "Working between two continents, Amara layers ochre and copper leaf into fields of colour that read like heat shimmering off laterite soil. She joined the gallery in 2022 and has since sold out three solo rooms.",
    image: LOCAL.gallery,
  },
  {
    slug: "nadia-farrouk",
    name: "Nadia Farrouk",
    location: "Cairo, Egypt",
    bio: "Nadia draws with sumi ink and bone ash on cotton rag, keeping to a strict palette of black, chalk and one line of ochre. Her works on paper are made before dawn, in a single uninterrupted sitting.",
    image: LOCAL.nile,
  },
  {
    slug: "elin-sorensen",
    name: "Elin Sørensen",
    location: "Oslo, Norway",
    bio: "Elin paints limewash and graphite on raw canvas, sanding each layer back until only a breath of the last remains. Her practice is an argument for restraint — and for the warmth hiding inside grey.",
    image: LOCAL.meridian,
  },
  {
    slug: "tomas-reyes",
    name: "Tomás Reyes",
    location: "Valencia, Spain",
    bio: "A third-generation potter who abandoned the wheel for hand-building. Tomás fires in a wood kiln over forty hours, letting fly-ash land where it pleases — no two glazes repeat.",
    image: LOCAL.trio,
  },
  {
    slug: "lerato-dlamini",
    name: "Lerato Dlamini",
    location: "Johannesburg, South Africa",
    bio: "Lerato weaves mohair from the Eastern Cape with raw silk and undyed cotton, working on a loom her grandmother bought in 1974. Each hanging takes between ninety and two hundred hours.",
    image: LOCAL.weave,
  },
];

const seedCollections = [
  {
    slug: "terra",
    name: "Terra & Ochre",
    tagline: "Earth pigment, riverbeds, and the long light of the veld.",
    description:
      "Our founding room. Paintings built from hand-ground clay, rust and raw ochre — colour that comes out of the ground and behaves like it. Expect deep terracotta, dusty gold and the occasional violent streak of iron red.",
    image: LOCAL.riverbed,
    accent: "#b5713a",
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: "ash",
    name: "Ash & Ink",
    tagline: "Charcoal, bone ash, and the discipline of one mark.",
    description:
      "Monochrome, but never cold. These works hold graphite, sumi ink and sifted ash on paper and canvas — quiet pieces that reward standing in front of them for longer than feels reasonable.",
    image: LOCAL.meridian,
    accent: "#6b6a66",
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: "clay",
    name: "Fired Clay",
    tagline: "Hand-built stoneware, wood-fired over forty hours.",
    description:
      "Vessels, jars and bowls made without a wheel, fired in a wood kiln where fly-ash settles into the glaze. Functional objects with the presence of sculpture — every piece is one of one.",
    image: LOCAL.trio,
    accent: "#a85d3c",
    sortOrder: 3,
    isFeatured: true,
  },
  {
    slug: "weave",
    name: "Woven Light",
    tagline: "Mohair, raw silk, and the slow arithmetic of the loom.",
    description:
      "Wall hangings woven on a 1974 loom in Johannesburg, using mohair from the Eastern Cape. The weave is deliberately irregular: light moves across it through the day.",
    image: LOCAL.weave,
    accent: "#c79a3e",
    sortOrder: 4,
    isFeatured: true,
  },
  {
    slug: "editions",
    name: "Studio Editions",
    tagline: "Numbered prints and small works — a first piece, honestly priced.",
    description:
      "Archival pigment prints on cotton rag, editioned with the artist and hand-numbered in our Cape Town studio. Made for first-time collectors, gifts, and anyone who wants the work without the freight.",
    image: LOCAL.studio,
    accent: "#8c7a63",
    sortOrder: 5,
    isFeatured: false,
  },
];

const seedProducts: SeedProduct[] = [
  {
    slug: "riverbed-remembered",
    title: "Riverbed, Remembered",
    artist: "thandiwe-mkhize",
    collection: "terra",
    medium: "Painting",
    materials: "Oil and hand-ground Karoo ochre on raw linen",
    year: 2025,
    dimensions: "150 × 120 cm (unframed)",
    editionLabel: "Unique work",
    priceCents: 340000,
    description:
      "A river that only runs twice a year, painted from memory in eleven veils of ochre. A single channel of pale ash cuts down the centre — the ghost of water.",
    story:
      "Thandiwe made this over fourteen months, waiting for each layer of hand-ground pigment to oxidise before laying on the next. The linen was sized with rabbit-skin glue and left to sag slightly, so the surface holds shadow the way a dry riverbed holds heat. It is the anchor piece of Terra & Ochre and the last large canvas from her 2025 body of work.",
    image: LOCAL.riverbed,
    images: [
      { url: LOCAL.riverbed, alt: "Ochre and terracotta abstract painting on raw linen", caption: "Full work, unframed" },
      { url: P.texture1, alt: "Close-up of impasto pigment texture", caption: "Detail: palette-knife impasto" },
      { url: LOCAL.gallery, alt: "The work hung on a limewashed gallery wall", caption: "In situ, Bree Street gallery" },
    ],
    stock: 1,
    isFeatured: true,
    reviews: [
      {
        name: "Nomsa V.",
        location: "Cape Town, South Africa",
        rating: 5,
        title: "It changed the whole room",
        body: "I walked past it three times before I let myself buy it. It hangs in our dining room now and everyone who comes in stops talking mid-sentence. Thandiwe's texture is even better in person.",
        daysAgo: 21,
        verified: true,
      },
      {
        name: "James H.",
        location: "London, UK",
        rating: 5,
        title: "Shipped to London flawlessly",
        body: "The gallery built a crate for it and it arrived in five days with zero issues. Framing advice over email was patient and detailed. Would buy from them again without hesitating.",
        daysAgo: 64,
        verified: true,
      },
      {
        name: "Aisha R.",
        location: "Dubai, UAE",
        rating: 4,
        title: "Bigger than I expected",
        body: "Read the dimensions properly — it is a serious canvas. Beautiful, warm, and the ash channel is much subtler in daylight than in the photographs.",
        daysAgo: 118,
      },
    ],
  },
  {
    slug: "dune-choir",
    title: "Dune Choir",
    artist: "amara-odell",
    collection: "terra",
    medium: "Painting",
    materials: "Acrylic, ochre pigment and copper leaf on canvas",
    year: 2024,
    dimensions: "120 × 90 cm (unframed)",
    editionLabel: "Unique work",
    priceCents: 215000,
    description:
      "Sun-bleached dune forms with torn handmade paper and a seam of copper leaf that catches the afternoon light. Warm, generous, and impossible to photograph honestly.",
    story:
      "Amara began this in Accra during harmattan, when the sky goes the colour of dust, and finished it in a cold London studio — which is why the top third feels cooler than the rest. The copper leaf is hand-burnished and will slowly darken over decades, so the painting ages with you.",
    image: LOCAL.dune,
    images: [
      { url: LOCAL.dune, alt: "Ochre dune abstract with copper leaf on canvas", caption: "Full work" },
      { url: P.texture2, alt: "Close-up of layered pigment", caption: "Detail: pigment and collage" },
      { url: LOCAL.studio, alt: "Pigments and tools on a studio bench", caption: "Amara's pigment bench" },
    ],
    stock: 1,
    isFeatured: true,
    reviews: [
      {
        name: "Pieter d.",
        location: "Stellenbosch, South Africa",
        rating: 5,
        title: "The copper is the whole point",
        body: "It flares at about 4pm in our north-facing room and it is genuinely the best part of my day. Worth every cent.",
        daysAgo: 33,
        verified: true,
      },
      {
        name: "Marta K.",
        location: "Berlin, Germany",
        rating: 5,
        title: "Exactly as described",
        body: "Colour is very true to the listing images, which is rare. Rolled and shipped in a tube, arrived perfect.",
        daysAgo: 96,
      },
    ],
  },
  {
    slug: "karoo-at-dusk",
    title: "Karoo at Dusk",
    artist: "thandiwe-mkhize",
    collection: "terra",
    medium: "Painting",
    materials: "Oil on linen",
    year: 2024,
    dimensions: "140 × 100 cm (unframed)",
    editionLabel: "Unique work",
    priceCents: 178000,
    description:
      "A low horizon of rust hills resolving into a smoke-ash sky. The most quietly figurative of Thandiwe's landscapes — you can almost hear the wind.",
    story:
      "Painted from a photograph taken outside Beaufort West at 19:40 on a Tuesday. Thandiwe says she spent longer on the sky than on the land, because 'the Karoo is really a sky with something underneath it.'",
    image: LOCAL.karoo,
    images: [
      { url: LOCAL.karoo, alt: "Arid valley landscape painting in ochre and ash", caption: "Full work" },
      { url: P.colour6, alt: "Close-up of dry-brushed oil paint", caption: "Detail: dry-brush edge" },
      { url: LOCAL.gallery, alt: "The painting hung in the gallery", caption: "In situ" },
    ],
    stock: 1,
    isFeatured: true,
    reviews: [
      {
        name: "Dr. F. Radebe",
        location: "Pretoria, South Africa",
        rating: 5,
        title: "A very South African painting",
        body: "I grew up on the N1 and this is the first artwork that has ever made me homesick for it. Beautifully made, beautifully packed.",
        daysAgo: 41,
        verified: true,
      },
      {
        name: "Yuki T.",
        location: "Tokyo, Japan",
        rating: 4,
        title: "Serene",
        body: "Slightly more muted than on screen but that suits our space better. Delivery to Tokyo took nine days.",
        daysAgo: 150,
      },
    ],
  },
  {
    slug: "red-stone-sunlight",
    title: "Red Stone, Sunlight",
    artist: "amara-odell",
    collection: "terra",
    medium: "Painting",
    materials: "Pigment and handmade-paper collage on panel",
    year: 2025,
    dimensions: "80 × 60 cm (panel)",
    editionLabel: "Unique work",
    priceCents: 124000,
    description:
      "A smaller panel that behaves like a sunburnt wall: layered red stone pigment with paper fragments pressed into the surface. Sits happily on its own or in a pair.",
    story:
      "Made on a birch panel rather than canvas, so the surface is hard and the pigment sits on top rather than sinking in. Amara finished it in a week — unusually fast for her — and considers it a study for a much larger commission that never happened.",
    image: P.colour1,
    images: [
      { url: P.colour1, alt: "Layered red and ochre pigment on panel", caption: "Full work" },
      { url: P.colour2, alt: "Close-up of collage fragments", caption: "Detail: pressed paper" },
      { url: LOCAL.studio, alt: "Studio bench with pigment jars", caption: "In the studio" },
    ],
    stock: 1,
    reviews: [
      {
        name: "Hélène B.",
        location: "Brussels, Belgium",
        rating: 5,
        title: "Perfect entry piece",
        body: "My first original. The gallery answered a dozen questions before I bought and never once pressured me. It arrived with a signed certificate.",
        daysAgo: 27,
        verified: true,
      },
      {
        name: "Sipho M.",
        location: "Durban, South Africa",
        rating: 4,
        title: "Lovely, smaller than expected",
        body: "My own fault for not checking, but 80 × 60 is compact. Still a gorgeous object and the red is deep and warm.",
        daysAgo: 72,
      },
    ],
  },
  {
    slug: "meridian-of-ash",
    title: "Meridian of Ash",
    artist: "elin-sorensen",
    collection: "ash",
    medium: "Painting",
    materials: "Limewash and graphite on raw canvas",
    year: 2025,
    dimensions: "160 × 130 cm (unframed)",
    editionLabel: "Unique work",
    priceCents: 260000,
    description:
      "Sanded fields of ash and bone with one confident graphite stroke crossing the whole width, and a thin ochre underpainting glowing through.",
    story:
      "Elin limewashes, sands, limewashes again — sometimes thirty passes. What remains is a surface with the depth of stone and the softness of skin. The single stroke was made in under two seconds after a week of not painting.",
    image: LOCAL.meridian,
    images: [
      { url: LOCAL.meridian, alt: "Ash grey minimal painting with graphite stroke", caption: "Full work" },
      { url: P.ink2, alt: "Close-up of grey wash texture", caption: "Detail: limewash layers" },
      { url: LOCAL.gallery, alt: "Hung on a pale gallery wall", caption: "In situ" },
    ],
    stock: 1,
    isFeatured: true,
    reviews: [
      {
        name: "Ingrid S.",
        location: "Oslo, Norway",
        rating: 5,
        title: "Norwegian, somehow",
        body: "I know this painter's work well and this is one of her strongest. The ochre underneath keeps the grey from turning cold.",
        daysAgo: 15,
        verified: true,
      },
      {
        name: "Candice W.",
        location: "Cape Town, South Africa",
        rating: 5,
        title: "The stroke",
        body: "That one graphite line has more nerve than anything else in my house. It hangs opposite my desk and I have not tired of it once.",
        daysAgo: 58,
        verified: true,
      },
    ],
  },
  {
    slug: "nile-fragments-i",
    title: "Nile Fragments I",
    artist: "nadia-farrouk",
    collection: "ash",
    medium: "Works on Paper",
    materials: "Sumi ink and bone ash on cotton rag paper",
    year: 2024,
    dimensions: "76 × 56 cm (sheet size)",
    editionLabel: "Unique work",
    priceCents: 98000,
    description:
      "Calligraphic ink washes with sifted ash settled into the wet marks, and one thin ochre rule near the base. Deckled edges, unframed.",
    story:
      "Nadia makes these before dawn and never corrects a mark. If the sheet fails, it is destroyed. This one survived on the first attempt, which she says happens perhaps four times a year. We recommend float-mounting so the deckled edge stays visible.",
    image: LOCAL.nile,
    images: [
      { url: LOCAL.nile, alt: "Black ink and ash on cotton paper", caption: "Full sheet" },
      { url: P.ink8, alt: "Close-up of ink wash", caption: "Detail: ink bloom" },
      { url: LOCAL.studio, alt: "Works on paper in the studio", caption: "In the studio" },
    ],
    stock: 1,
    isFeatured: true,
    reviews: [
      {
        name: "Thomas L.",
        location: "New York, USA",
        rating: 5,
        title: "Better in person",
        body: "Photographs flatten the ash texture completely. Floated in a simple oak frame it looks like a museum acquisition. Very happy.",
        daysAgo: 36,
        verified: true,
      },
      {
        name: "Fatima A.",
        location: "Cairo, Egypt",
        rating: 5,
        title: "A quiet masterpiece",
        body: "I have followed Nadia's work for years. Shipping to Cairo was quick and the packing was immaculate.",
        daysAgo: 88,
      },
      {
        name: "Rob K.",
        location: "Melbourne, Australia",
        rating: 4,
        title: "Delicate — frame it well",
        body: "It is paper, so treat it accordingly. Gallery recommended a framer in Melbourne and they did a beautiful job.",
        daysAgo: 130,
      },
    ],
  },
  {
    slug: "quiet-interval",
    title: "Quiet Interval",
    artist: "elin-sorensen",
    collection: "ash",
    medium: "Painting",
    materials: "Limewash, chalk and graphite on canvas",
    year: 2024,
    dimensions: "100 × 100 cm (unframed)",
    editionLabel: "Unique work",
    priceCents: 145000,
    description:
      "A square format with no composition to speak of — just atmosphere. The piece people stand in front of for the longest.",
    story:
      "Elin calls these 'interval paintings': work made in the gaps between larger projects, with whatever is left on the bench. They are, consistently, the pieces collectors keep.",
    image: P.ink5,
    images: [
      { url: P.ink5, alt: "Monochrome ash textured painting", caption: "Full work" },
      { url: P.ink4, alt: "Close-up of dissolved wash", caption: "Detail: chalk bloom" },
      { url: LOCAL.gallery, alt: "Hung in the gallery", caption: "In situ" },
    ],
    stock: 1,
    reviews: [
      {
        name: "Anja V.",
        location: "Rotterdam, Netherlands",
        rating: 5,
        title: "Nothing and everything",
        body: "It is essentially grey and yet I notice something new every week. That is the whole review, really.",
        daysAgo: 44,
        verified: true,
      },
      {
        name: "Dean P.",
        location: "Port Elizabeth, South Africa",
        rating: 4,
        title: "Very subtle",
        body: "If you want drama, buy something else. If you want calm, this is it.",
        daysAgo: 104,
      },
    ],
  },
  {
    slug: "smoke-letters",
    title: "Smoke Letters",
    artist: "nadia-farrouk",
    collection: "ash",
    medium: "Works on Paper",
    materials: "Ink and charcoal on cotton rag paper",
    year: 2024,
    dimensions: "59 × 42 cm (sheet size)",
    editionLabel: "Unique work",
    priceCents: 76000,
    description:
      "Ink marks that read almost like handwriting, smudged with a thumb. Small enough for a hallway, sharp enough to hold it.",
    story:
      "Part of a series Nadia made while re-learning a family alphabet her grandmother used in letters. She refuses to translate the marks, and we have stopped asking.",
    image: P.ink1,
    images: [
      { url: P.ink1, alt: "Black ink marks on crumpled paper", caption: "Full sheet" },
      { url: P.ink3, alt: "Close-up of black and white marks", caption: "Detail: mark-making" },
      { url: LOCAL.studio, alt: "Paper and tools in the studio", caption: "In the studio" },
    ],
    stock: 1,
    reviews: [
      {
        name: "Leila N.",
        location: "Beirut, Lebanon",
        rating: 5,
        title: "Gift that landed",
        body: "Bought as a wedding gift and it was the only thing anyone talked about. Shipped framed-ready and beautifully protected.",
        daysAgo: 52,
        verified: true,
      },
      {
        name: "Mark D.",
        location: "Cape Town, South Africa",
        rating: 4,
        title: "Charming small work",
        body: "Good value for an original on paper. Slightly lighter in tone than I expected.",
        daysAgo: 77,
      },
    ],
  },
  {
    slug: "vessel-ochre-series-no-4",
    title: "Vessel, Ochre Series No. 4",
    artist: "tomas-reyes",
    collection: "clay",
    medium: "Ceramics",
    materials: "Hand-built stoneware, matte ochre glaze",
    year: 2025,
    dimensions: "38 h × 24 w cm",
    editionLabel: "One of one",
    priceCents: 68000,
    description:
      "A tall coil-built vessel with a narrow neck. The matte ochre glaze breaks to pale ash at the rim; thumb marks are left deliberately visible.",
    story:
      "Built from a 4 kg wedge of grogged stoneware over three days, then wood-fired for forty hours. The ash that landed on the shoulder of this particular piece produced a blush you can feel with a fingertip. Water-tight, but please do not put it in a dishwasher.",
    image: LOCAL.vessel,
    images: [
      { url: LOCAL.vessel, alt: "Tall hand-built ochre glazed stoneware vessel", caption: "Full piece" },
      { url: P.clay1, alt: "Ceramic pot against a neutral backdrop", caption: "Profile" },
      { url: LOCAL.studio, alt: "Kiln shelves in the studio", caption: "From the kiln" },
    ],
    stock: 1,
    isFeatured: true,
    reviews: [
      {
        name: "Olga S.",
        location: "Kyiv, Ukraine",
        rating: 5,
        title: "A sculpture you can hold",
        body: "The weight and the thumb marks make it feel alive. Arrived double-boxed with the glaze protected.",
        daysAgo: 18,
        verified: true,
      },
      {
        name: "Bongani T.",
        location: "Johannesburg, South Africa",
        rating: 5,
        title: "Exactly the piece I wanted",
        body: "Saw it in the gallery on Bree Street and thought about it for two months. Glad I did not wait longer.",
        daysAgo: 61,
        verified: true,
      },
      {
        name: "Sofia G.",
        location: "Lisbon, Portugal",
        rating: 4,
        title: "Slightly smaller in person",
        body: "Lovely object, generous presence, but do check the centimetres. Perfect on a plinth.",
        daysAgo: 92,
      },
    ],
  },
  {
    slug: "moon-jar-ash-glaze",
    title: "Moon Jar, Ash Glaze",
    artist: "tomas-reyes",
    collection: "clay",
    medium: "Ceramics",
    materials: "Hand-built stoneware, wood-ash glaze",
    year: 2024,
    dimensions: "34 h × 34 w cm",
    editionLabel: "One of one",
    priceCents: 115000,
    description:
      "Tomás's take on the Korean moon jar: two hand-built hemispheres joined at the belly, with a soft ash glaze that pools faintly green in the seams.",
    story:
      "Joining two halves without collapsing them is the hardest thing he does, and he loses roughly half of everything he attempts. This jar survived with a slight, deliberate asymmetry that he refused to correct.",
    image: P.clay2,
    images: [
      { url: P.clay2, alt: "Pale ceramic moon jar", caption: "Full piece" },
      { url: P.clay3, alt: "Ceramics on a timber shelf", caption: "In the gallery" },
      { url: LOCAL.studio, alt: "Studio shelf", caption: "From the studio" },
    ],
    stock: 1,
    reviews: [
      {
        name: "Hana K.",
        location: "Seoul, South Korea",
        rating: 5,
        title: "Respectful and personal",
        body: "A moon jar made by a Spanish potter, shipped to Seoul. The asymmetry is the best part — it leans like a person standing still.",
        daysAgo: 29,
        verified: true,
      },
      {
        name: "Ruth B.",
        location: "Cape Town, South Africa",
        rating: 5,
        title: "Worth the price",
        body: "It is the most expensive object I own and the one I would save in a fire.",
        daysAgo: 83,
      },
    ],
  },
  {
    slug: "three-sisters-vessels",
    title: "Three Sisters",
    artist: "tomas-reyes",
    collection: "clay",
    medium: "Ceramics",
    materials: "Set of three hand-built stoneware vessels",
    year: 2025,
    dimensions: "18–28 h cm (set of three)",
    editionLabel: "Set of three, one of one",
    priceCents: 148000,
    description:
      "A wide ash-glazed bowl, a narrow ochre bottle and a pale moon jar, made to sit together. Sold as a set and not separable.",
    story:
      "Named for the three peaks outside Tomás's grandmother's village. He built them in one session so the clay would have the same moisture content, which is why they belong together on a mantel rather than in different rooms.",
    image: LOCAL.trio,
    images: [
      { url: LOCAL.trio, alt: "Three handmade ceramic vessels grouped together", caption: "The set" },
      { url: P.clay3, alt: "Rustic pottery on a shelf", caption: "Arranged" },
      { url: LOCAL.studio, alt: "Kiln room", caption: "From the kiln" },
    ],
    stock: 1,
    reviews: [
      {
        name: "Elena M.",
        location: "Barcelona, Spain",
        rating: 5,
        title: "The trio is everything",
        body: "Separately they are nice. Together they are a sentence. Keep them within arm's length of each other.",
        daysAgo: 24,
        verified: true,
      },
      {
        name: "Johan v.d.",
        location: "Bloemfontein, South Africa",
        rating: 5,
        title: "Anniversary gift, nailed it",
        body: "The gallery gift-wrapped and wrote a card by hand. My wife cried. Five stars.",
        daysAgo: 70,
        verified: true,
      },
    ],
  },
  {
    slug: "salt-fire-bowl",
    title: "Salt-Fire Bowl",
    artist: "tomas-reyes",
    collection: "clay",
    medium: "Ceramics",
    materials: "Salt-fired stoneware",
    year: 2023,
    dimensions: "12 h × 30 w cm",
    editionLabel: "One of one",
    priceCents: 42000,
    description:
      "A wide, shallow bowl with an orange-peel surface from salt thrown into the kiln at peak temperature. Perfect on a hall table.",
    story:
      "The oldest piece in the room and the one Tomás almost kept. Salt-firing is violent and unpredictable; this bowl came out with a surface he has been trying to repeat, unsuccessfully, ever since.",
    image: P.clay4,
    images: [
      { url: P.clay4, alt: "Salt-fired stoneware bowls", caption: "Full piece" },
      { url: P.clay5, alt: "Rustic pottery cups", caption: "Surface detail" },
      { url: LOCAL.studio, alt: "Studio bench", caption: "From the studio" },
    ],
    stock: 2,
    reviews: [
      {
        name: "Zanele M.",
        location: "Soweto, South Africa",
        rating: 5,
        title: "My first ceramics purchase",
        body: "Affordable, beautiful, and it holds my keys. What else do you want?",
        daysAgo: 39,
        verified: true,
      },
      {
        name: "Peter N.",
        location: "Dublin, Ireland",
        rating: 4,
        title: "Rougher than expected",
        body: "The salt surface is genuinely textured, almost like an orange peel. I like it, but it is not a smooth finish.",
        daysAgo: 112,
      },
    ],
  },
  {
    slug: "loom-golden-hour",
    title: "Loom: Golden Hour",
    artist: "lerato-dlamini",
    collection: "weave",
    medium: "Textile",
    materials: "Mohair, raw silk and undyed cotton",
    year: 2025,
    dimensions: "110 h × 140 w cm (excluding fringe)",
    editionLabel: "Unique work",
    priceCents: 230000,
    description:
      "Wide bands of saffron and ochre mohair against charcoal ash, with long loose fringe at the base. The weave is deliberately irregular so light moves across it all day.",
    story:
      "Two hundred and eleven hours on a 1974 loom, using mohair from a co-operative of eleven women in the Eastern Cape. Lerato signs each hanging by weaving her initials into the back of the dowel pocket, where only the owner will find them.",
    image: LOCAL.weave,
    images: [
      { url: LOCAL.weave, alt: "Ochre and charcoal handwoven wall hanging", caption: "Full work" },
      { url: P.weave2, alt: "Close-up of woven fibre", caption: "Detail: mohair weft" },
      { url: P.weave5, alt: "Hands weaving on a loom", caption: "On the loom" },
    ],
    stock: 1,
    isFeatured: true,
    reviews: [
      {
        name: "Thabo N.",
        location: "Cape Town, South Africa",
        rating: 5,
        title: "The room sounds quieter",
        body: "Textiles do that, apparently. It warms up a bare wall like nothing else and the fringe moves in the draught.",
        daysAgo: 12,
        verified: true,
      },
      {
        name: "Clara D.",
        location: "Milan, Italy",
        rating: 5,
        title: "Exceptional craft",
        body: "You can see and feel every hour of work. Rolled, not folded, for shipping — arrived without a single crease.",
        daysAgo: 55,
        verified: true,
      },
      {
        name: "Nomvula K.",
        location: "Makhanda, South Africa",
        rating: 5,
        title: "Proud",
        body: "Eastern Cape mohair on a Milan wall. This is what it should look like.",
        daysAgo: 79,
      },
    ],
  },
  {
    slug: "ash-weave-long",
    title: "Ash Weave, Long",
    artist: "lerato-dlamini",
    collection: "weave",
    medium: "Textile",
    materials: "Undyed cotton, wool and raw silk",
    year: 2024,
    dimensions: "200 h × 90 cm (excluding fringe)",
    editionLabel: "Unique work",
    priceCents: 168000,
    description:
      "A narrow floor-length hanging in ash, chalk and one stripe of rust. Made for stairwells and tall, difficult walls.",
    story:
      "Lerato wove this on the loom's full warp, which meant she could not stop partway through — fourteen days, nine hours a day. The single rust stripe was the last thing she did, and she says it saved the piece.",
    image: P.weave1,
    images: [
      { url: P.weave1, alt: "Long woven wall hanging in a room", caption: "Full work" },
      { url: P.weave2, alt: "Woven textile close-up", caption: "Detail: weave structure" },
      { url: LOCAL.gallery, alt: "Hung in the gallery", caption: "In situ" },
    ],
    stock: 1,
    reviews: [
      {
        name: "Alex F.",
        location: "Toronto, Canada",
        rating: 5,
        title: "Solved a difficult wall",
        body: "Two metres of awkward stairwell, now the best wall in the house. Shipping to Canada was painless.",
        daysAgo: 47,
        verified: true,
      },
      {
        name: "Riana B.",
        location: "Potchefstroom, South Africa",
        rating: 4,
        title: "Beautiful, needs space",
        body: "Genuinely lovely but it needs height to work. Measure your wall twice.",
        daysAgo: 96,
      },
    ],
  },
  {
    slug: "kaross-fragment",
    title: "Kaross Fragment",
    artist: "lerato-dlamini",
    collection: "weave",
    medium: "Textile",
    materials: "Wool and cotton on a linen ground",
    year: 2023,
    dimensions: "70 h × 90 cm",
    editionLabel: "Unique work",
    priceCents: 98000,
    description:
      "A mid-size hanging that reads like a piece of cloth found rather than made: soft geometry, faded ochre, worn edges.",
    story:
      "Lerato made this as an homage to the kaross — a traditional sewn blanket — and then deliberately un-finished it, leaving raw edges and a loose corner so it looks like something that has already had a life.",
    image: P.weave3,
    images: [
      { url: P.weave3, alt: "Textile wall hanging near a white wall", caption: "Full work" },
      { url: P.weave4, alt: "Close-up of rope and fibre", caption: "Detail: raw edge" },
      { url: LOCAL.studio, alt: "Loom in the studio", caption: "In the studio" },
    ],
    stock: 1,
    reviews: [
      {
        name: "Gina R.",
        location: "Sydney, Australia",
        rating: 5,
        title: "Looks ancient in a good way",
        body: "The worn edges are intentional and gorgeous. It hangs in our hallway and gets more comments than anything else we own.",
        daysAgo: 66,
      },
      {
        name: "Kabelo S.",
        location: "Gaborone, Botswana",
        rating: 4,
        title: "Warm and honest",
        body: "Not as heavy as I expected, which made hanging it easy. Very happy with it.",
        daysAgo: 121,
      },
    ],
  },
  {
    slug: "thread-study-no-2",
    title: "Thread Study No. 2",
    artist: "lerato-dlamini",
    collection: "weave",
    medium: "Textile",
    materials: "Cotton, linen and raw silk",
    year: 2025,
    dimensions: "35 h × 45 cm",
    editionLabel: "One of one",
    priceCents: 54000,
    description:
      "A small woven study — the kind Lerato makes to test a colour before committing two hundred hours to it. Charming, and genuinely affordable.",
    story:
      "The studies are how every large hanging begins. Lerato sells a handful each year, and the gallery keeps a waiting list. This one tested the saffron that later became Loom: Golden Hour.",
    image: P.weave6,
    images: [
      { url: P.weave6, alt: "Small woven textile hanging", caption: "Full work" },
      { url: P.weave4, alt: "Fibre detail", caption: "Detail" },
      { url: LOCAL.studio, alt: "Studio bench with fibre", caption: "In the studio" },
    ],
    stock: 3,
    reviews: [
      {
        name: "Marike J.",
        location: "Franschhoek, South Africa",
        rating: 5,
        title: "Bought two",
        body: "One for me, one for my sister. They are small but they hold a wall surprisingly well.",
        daysAgo: 31,
        verified: true,
      },
      {
        name: "Tobias E.",
        location: "Vienna, Austria",
        rating: 5,
        title: "Great gift",
        body: "Arrived in four days with a hand-written note. Beautiful little object.",
        daysAgo: 87,
      },
    ],
  },
  {
    slug: "ochre-field-edition",
    title: "Ochre Field (Edition)",
    artist: "thandiwe-mkhize",
    collection: "editions",
    medium: "Print",
    materials: "Archival pigment print on 310gsm cotton rag",
    year: 2025,
    dimensions: "50 h × 40 cm (image area)",
    editionLabel: "Edition of 25, numbered and signed",
    priceCents: 24000,
    description:
      "A faithful pigment print of a sold 2023 canvas, made with Thandiwe in our Cape Town studio and hand-numbered by her at the bottom edge.",
    story:
      "We print on demand in small batches so the edition never floods. Each print is signed in pencil, numbered, and shipped flat in a rigid mailer with a certificate of authenticity. Editions exist so that a first piece of original art does not have to cost a month's rent.",
    image: P.colour5,
    images: [
      { url: P.colour5, alt: "Ochre abstract print on cotton rag", caption: "Full print" },
      { url: P.colour2, alt: "Print texture close-up", caption: "Detail: cotton rag" },
      { url: LOCAL.studio, alt: "Print bench in the studio", caption: "Hand-numbered" },
    ],
    stock: 14,
    reviews: [
      {
        name: "Lerato M.",
        location: "Kimberley, South Africa",
        rating: 5,
        title: "First artwork, no regrets",
        body: "R4,500 for a signed, numbered print from an artist I admire — that is a fair deal. It is framed and on my wall.",
        daysAgo: 9,
        verified: true,
      },
      {
        name: "Derek O.",
        location: "Manchester, UK",
        rating: 5,
        title: "Print quality is superb",
        body: "Deep, matte blacks and accurate ochre. Shipped flat to the UK in a rigid mailer, no bends.",
        daysAgo: 43,
        verified: true,
      },
      {
        name: "Anna P.",
        location: "Kraków, Poland",
        rating: 4,
        title: "Good value",
        body: "Colour is slightly warmer than on screen but well within reason. Would buy another edition.",
        daysAgo: 68,
      },
    ],
  },
  {
    slug: "ash-line-edition",
    title: "Ash Line (Edition)",
    artist: "elin-sorensen",
    collection: "editions",
    medium: "Print",
    materials: "Archival pigment print on 310gsm cotton rag",
    year: 2025,
    dimensions: "50 h × 40 cm (image area)",
    editionLabel: "Edition of 25, numbered and signed",
    priceCents: 22000,
    description:
      "A print of Elin's 2024 graphite study — soft grey with a single dark horizon. Pairs well with almost anything, which is exactly the point.",
    story:
      "Elin approved the proof herself and rejected the first two attempts as 'too clean'. The final print keeps the grain of the canvas and a faint ghost of graphite dust.",
    image: P.ink6,
    images: [
      { url: P.ink6, alt: "Monochrome print with a dark horizon line", caption: "Full print" },
      { url: P.ink7, alt: "Monochrome texture close-up", caption: "Detail: surface grain" },
      { url: LOCAL.gallery, alt: "Prints hung in the gallery", caption: "In situ" },
    ],
    stock: 19,
    reviews: [
      {
        name: "Sara L.",
        location: "Stockholm, Sweden",
        rating: 5,
        title: "Quiet and perfect",
        body: "Exactly the calm grey I wanted. Bought two to hang as a pair with the ochre edition.",
        daysAgo: 20,
        verified: true,
      },
      {
        name: "Vusi N.",
        location: "Pretoria, South Africa",
        rating: 5,
        title: "Great service",
        body: "Ordered on Monday, on my wall by Thursday. Recommended a framer nearby too.",
        daysAgo: 57,
      },
    ],
  },
  {
    slug: "pigment-study-edition",
    title: "Pigment Study (Edition)",
    artist: "amara-odell",
    collection: "editions",
    medium: "Print",
    materials: "Giclée print on 310gsm cotton rag",
    year: 2025,
    dimensions: "40 h × 30 cm (image area)",
    editionLabel: "Edition of 50, numbered and signed",
    priceCents: 18000,
    description:
      "A small, saturated study — Amara testing laterite red against chalk. The most joyful thing in the edition room.",
    story:
      "Amara paints dozens of these small studies a year and burns most of them. We persuaded her to release three as editions, of which this is the loudest.",
    image: P.colour3,
    images: [
      { url: P.colour3, alt: "Colourful pigment study print", caption: "Full print" },
      { url: P.texture2, alt: "Pigment texture close-up", caption: "Detail" },
      { url: LOCAL.studio, alt: "Studio studies pinned to a wall", caption: "The studies wall" },
    ],
    stock: 31,
    reviews: [
      {
        name: "Nadia H.",
        location: "Casablanca, Morocco",
        rating: 5,
        title: "Colour is a gift",
        body: "It is a small print that behaves like a big painting. Hung it in a dark passage and it lifts the whole thing.",
        daysAgo: 26,
      },
      {
        name: "Josh W.",
        location: "Austin, USA",
        rating: 4,
        title: "Solid little print",
        body: "Good value, quick delivery, well packed. Would have liked a slightly larger image area but that is on me.",
        daysAgo: 74,
      },
    ],
  },
  {
    slug: "riverbed-edition",
    title: "Riverbed, Remembered (Edition)",
    artist: "thandiwe-mkhize",
    collection: "editions",
    medium: "Print",
    materials: "Archival pigment print on 310gsm cotton rag",
    year: 2025,
    dimensions: "80 h × 60 cm (image area)",
    editionLabel: "Edition of 25, numbered and signed",
    priceCents: 42000,
    description:
      "The large-format edition of the painting that opened the gallery: 80 cm wide, hand-numbered, and printed in an edition of only twenty-five.",
    story:
      "Thandiwe released this edition so that the painting people ask about most could live in more than one house. Fifty-five percent of the edition has already been placed, and once it is gone it will not be reprinted.",
    image: P.colour4,
    images: [
      { url: P.colour4, alt: "Large abstract print in ochre tones", caption: "Full print" },
      { url: P.colour2, alt: "Print detail", caption: "Detail" },
      { url: LOCAL.gallery, alt: "Prints hung in the gallery", caption: "In situ" },
    ],
    stock: 11,
    reviews: [
      {
        name: "Megan v.Z.",
        location: "Cape Town, South Africa",
        rating: 5,
        title: "Could not afford the original",
        body: "So I bought this, and honestly it is one of the best decisions I have made. Large, confident, and mine.",
        daysAgo: 16,
        verified: true,
      },
      {
        name: "Lukas M.",
        location: "Zurich, Switzerland",
        rating: 5,
        title: "Exceptional print",
        body: "The scale makes it. Shipped in a tube to Switzerland, flattened perfectly within a day.",
        daysAgo: 63,
        verified: true,
      },
      {
        name: "Priya S.",
        location: "Bengaluru, India",
        rating: 4,
        title: "Very happy",
        body: "Slight delay in customs but the gallery tracked it the whole way. The print itself is beautiful.",
        daysAgo: 108,
      },
    ],
  },
];

type Db = Parameters<Parameters<typeof dbClient.transaction>[0]>[0];

// Runs inside a single transaction (see main), so a failure rolls everything back.
async function seed(db: Db) {
  console.log("Resetting tables…");
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(reviews);
  await db.delete(productImages);
  await db.delete(products);
  await db.delete(artists);
  await db.delete(collections);

  console.log("Inserting artists…");
  const artistRows = await db.insert(artists).values(seedArtists).returning();
  const artistBySlug = new Map(artistRows.map((a) => [a.slug, a]));

  console.log("Inserting collections…");
  const collectionRows = await db
    .insert(collections)
    .values(
      seedCollections.map((c) => ({
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        description: c.description,
        image: c.image,
        accent: c.accent,
        sortOrder: c.sortOrder,
        isFeatured: c.isFeatured,
      })),
    )
    .returning();
  const collectionBySlug = new Map(collectionRows.map((c) => [c.slug, c]));

  const day = 24 * 60 * 60 * 1000;

  for (const item of seedProducts) {
    const artist = artistBySlug.get(item.artist);
    const collection = collectionBySlug.get(item.collection);
    if (!artist || !collection) {
      throw new Error(`Missing artist or collection for ${item.slug}`);
    }

    const ratingTenths = item.reviews.length
      ? Math.round((item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length) * 10)
      : 0;

    const [product] = await db
      .insert(products)
      .values({
        slug: item.slug,
        title: item.title,
        artistId: artist.id,
        collectionId: collection.id,
        medium: item.medium,
        materials: item.materials,
        year: item.year,
        dimensions: item.dimensions,
        editionLabel: item.editionLabel,
        priceCents: item.priceCents,
        description: item.description,
        story: item.story,
        image: item.image,
        stock: item.stock,
        ratingTenths,
        reviewCount: item.reviews.length,
        isFeatured: item.isFeatured ?? false,
        createdAt: new Date(Date.now() - item.reviews.length * 3 * day),
      })
      .returning();

    await db.insert(productImages).values(
      item.images.map((img, index) => ({
        productId: product.id,
        url: img.url,
        alt: img.alt,
        caption: img.caption,
        position: index,
      })),
    );

    if (item.reviews.length) {
      await db.insert(reviews).values(
        item.reviews.map((r) => ({
          productId: product.id,
          authorName: r.name,
          authorLocation: r.location,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verifiedPurchase: r.verified ?? false,
          createdAt: new Date(Date.now() - r.daysAgo * day),
        })),
      );
    }
  }

  console.log(
    `Seed complete: ${artistRows.length} artists, ${collectionRows.length} collections, ${seedProducts.length} products.`,
  );
}

async function main() {
  const force = process.argv.includes("--force");

  if (process.env.NODE_ENV === "production" && !force) {
    throw new Error("Refusing to seed with NODE_ENV=production. Re-run with --force if you really mean it.");
  }

  const result = await dbClient.execute(sql`
    select
      (select count(*) from products)::int as products,
      (select count(*) from orders)::int as orders,
      (select count(*) from carts)::int as carts
  `);
  const counts = result.rows[0] as { products: number; orders: number; carts: number };

  if (counts.products + counts.orders + counts.carts > 0 && !force) {
    throw new Error(
      `Database is not empty (${counts.products} products, ${counts.orders} orders, ${counts.carts} carts). ` +
        "Seeding DELETES all of it. Re-run with --force to confirm.",
    );
  }

  await dbClient.transaction(async (tx) => {
    await seed(tx);
  });
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
