export interface Island {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  color: string;
  icon: string;
  theme: string;
}
export const islands: Island[] = [
  {
    id: "indonesia",
    name: "Bahasa Indonesia",
    subtitle: "Dunia kata & cerita",
    x: 205,
    y: 145,
    color: "#e78ab7",
    icon: "Aa",
    theme: "books",
  },
  {
    id: "english",
    name: "Bahasa Inggris",
    subtitle: "A world of possibilities",
    x: 490,
    y: 100,
    color: "#8ca7ec",
    icon: "A",
    theme: "castle",
  },
  {
    id: "history",
    name: "Sejarah",
    subtitle: "Jejak peradaban",
    x: 800,
    y: 135,
    color: "#e8bb70",
    icon: "⌛",
    theme: "temple",
  },
  {
    id: "geography",
    name: "Geografi",
    subtitle: "Jelajahi bumi kita",
    x: 1060,
    y: 245,
    color: "#74bbcf",
    icon: "◈",
    theme: "mountain",
  },
  {
    id: "sociology",
    name: "Sosiologi",
    subtitle: "Kita & masyarakat",
    x: 115,
    y: 370,
    color: "#e9a28b",
    icon: "♧",
    theme: "town",
  },
  {
    id: "math",
    name: "Matematika",
    subtitle: "The Mathematics Island",
    x: 425,
    y: 360,
    color: "#9c7af1",
    icon: "π",
    theme: "castle",
  },
  {
    id: "physics",
    name: "Fisika",
    subtitle: "Energi tanpa batas",
    x: 735,
    y: 345,
    color: "#64b8ec",
    icon: "⚛",
    theme: "atom",
  },
  {
    id: "chemistry",
    name: "Kimia",
    subtitle: "Reaksi penuh kejutan",
    x: 990,
    y: 470,
    color: "#5dc7bb",
    icon: "⚗",
    theme: "lab",
  },
  {
    id: "economics",
    name: "Ekonomi",
    subtitle: "Bangun masa depan",
    x: 660,
    y: 580,
    color: "#edbc62",
    icon: "↗",
    theme: "town",
  },
  {
    id: "biology",
    name: "Biologi",
    subtitle: "Keajaiban kehidupan",
    x: 1030,
    y: 665,
    color: "#81c892",
    icon: "❧",
    theme: "tree",
  },
];
