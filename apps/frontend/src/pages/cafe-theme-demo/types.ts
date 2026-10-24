export interface CafeProduct {
  id: number;
  title: string;
  category: string;
  cursive: string;
  img: string;
  bg: string;
  prefix: string;
  suffix: string;
  price: number;
}

export interface CartItem {
  id: number;
  quantity: number;
  title: string;
  price: number;
  img: string;
  options?: string;
}

export const HERO_IMG =
  "https://images.unsplash.com/photo-1563514986877-e854157d6bb0?auto=format&fit=crop&q=80&w=600&fm=png&bg=transparent";
export const IMG_MOC_1 =
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400";
export const IMG_MOC_2 =
  "https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?auto=format&fit=crop&q=80&w=400";
export const IMG_MOC_3 =
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400";
export const IMG_MOC_4 =
  "https://images.unsplash.com/photo-1495474472201-43222d4f20b3?auto=format&fit=crop&q=80&w=400";
export const IMG_MOC_5 =
  "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400";

export const CATEGORIES = ["All", "Signature Cakes", "Hot Brews", "Pastries"];

export const STORE_PRODUCTS: CafeProduct[] = [
  {
    id: 1,
    title: "Aatis Cake",
    category: "Signature Cakes",
    cursive: "Cousr Nud",
    img: IMG_MOC_1,
    bg: "bg-[#FCD8DF]",
    prefix: "BERRY",
    suffix: "ANDRE",
    price: 14.5,
  },
  {
    id: 2,
    title: "Lermi Delight",
    category: "Signature Cakes",
    cursive: "Grags Jaluo",
    img: IMG_MOC_2,
    bg: "bg-[#EFE3DB]",
    prefix: "VANILLA",
    suffix: "ARE",
    price: 12.0,
  },
  {
    id: 3,
    title: "Flitre Choco",
    category: "Signature Cakes",
    cursive: "Hotns Tind",
    img: IMG_MOC_3,
    bg: "bg-[#DFCEE0]",
    prefix: "DARK",
    suffix: "LILL",
    price: 18.25,
  },
  {
    id: 4,
    title: "Classic Blend",
    category: "Hot Brews",
    cursive: "Espresso",
    img: IMG_MOC_4,
    bg: "bg-[#DFCEE0]",
    prefix: "STRONG",
    suffix: "ROAST",
    price: 5.5,
  },
  {
    id: 5,
    title: "Butter Croissant",
    category: "Pastries",
    cursive: "Freshly Baked",
    img: IMG_MOC_5,
    bg: "bg-[#FCD8DF]",
    prefix: "WARM",
    suffix: "FLAKY",
    price: 4.0,
  },
];
