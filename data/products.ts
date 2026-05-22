export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  price: number;
  unitAmount: number;
  currency: "inr";
  battery: string;
  bluetooth: string;
  audio: string;
  color: string;
};

export const products: Product[] = [
  {
    id: "pulse-wireless",
    name: "Pulse Wireless",
    tagline: "Balanced sound for everyday listening",
    description:
      "Lightweight wireless headphones with clean mids, soft cushions, and dependable battery life.",
    image: "/3d-gaming-headphone.png",
    price: 4999,
    unitAmount: 499900,
    currency: "inr",
    battery: "30H",
    bluetooth: "5.3",
    audio: "HD Audio",
    color: "Graphite",
  },
  {
    id: "bassline-pro",
    name: "Bassline Pro",
    tagline: "Extra punch for bass-heavy tracks",
    description:
      "A tuned low-end profile, secure fit, and long sessions without ear fatigue.",
    image: "/blue-headphone-.png",
    price: 6499,
    unitAmount: 649900,
    currency: "inr",
    battery: "36H",
    bluetooth: "5.3",
    audio: "Deep Bass",
    color: "Midnight",
  },
  {
    id: "studio-clear",
    name: "Studio Clear",
    tagline: "Detailed vocals and sharp instrument separation",
    description:
      "Built for listeners who want clear detail, crisp calls, and a calm design.",
    image: "/brown-headphones.png",
    price: 7299,
    unitAmount: 729900,
    currency: "inr",
    battery: "32H",
    bluetooth: "5.2",
    audio: "Hi-Fi",
    color: "Silver",
  },
  {
    id: "commute-lite",
    name: "Commute Lite",
    tagline: "Compact comfort for daily travel",
    description:
      "Foldable headphones with quick pairing, light padding, and reliable call quality.",
    image: "/darkblue-Headphone-Free.png",
    price: 3499,
    unitAmount: 349900,
    currency: "inr",
    battery: "24H",
    bluetooth: "5.1",
    audio: "Clear Voice",
    color: "Stone",
  },
  {
    id: "focus-anc",
    name: "Focus ANC",
    tagline: "Quiet listening with active noise control",
    description:
      "Noise control, plush cups, and a focused soundstage for work, study, and flights.",
    image: "/stylish-red-and-black-over-ear-headphones.webp",
    price: 8999,
    unitAmount: 899900,
    currency: "inr",
    battery: "42H",
    bluetooth: "5.3",
    audio: "ANC",
    color: "Black",
  },
  {
    id: "airbeat-sport",
    name: "Airbeat Sport",
    tagline: "Stable fit for workouts and movement",
    description:
      "Sweat-friendly materials, punchy sound, and a secure headband for active use.",
    image: "/white-headphones.png",
    price: 5799,
    unitAmount: 579900,
    currency: "inr",
    battery: "28H",
    bluetooth: "5.3",
    audio: "Sport Bass",
    color: "Forest",
  },
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}
