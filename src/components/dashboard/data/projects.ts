export const projectsData = [
  {
    id: "1",
    name: "ЖК «SKYLINE RESIDENCE»",
    address: "г. Астана, пр. Мангилик ел × ул. Хусейн бен Талал",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=400&fit=crop",
    progress: 85,
    status: "ontrack" as const,
    statusText: "Завершается",
    class: "Комфорт класс",
    completion_date: "I квартал 2025",
    profit: {
      value: "12.8 млрд ₸",
      plan: "12.2 млрд ₸",
      percentage: "104.9%",
      change: "+4.9%"
    },
    profitability: "28.4%",
    budget: {
      plan: "45.2 млрд ₸",
      fact: "46.1 млрд ₸",
      deviation: "+0.9 млрд ₸"
    },
    financing: {
      remaining: "8.3 млрд ₸",
      percentage: 82
    },
    sales: {
      apartments: { sold: 342, total: 420 },
      commercial: { sold: 15, total: 18 },
      parking: { sold: 285, total: 350 },
      revenue: "38.7 млрд ₸"
    },
    completion: {
      planned: "Дек 2024",
      forecast: "Янв 2025",
      deviation: "+1 мес"
    },
    expenses: {
      total: "18.5 млрд ₸",
      planned: "17.2 млрд ₸",
      materials: "8.2 млрд ₸",
      contracts: "6.8 млрд ₸",
      deviation: "+7.6%"
    },
    advances: "3.4 млрд ₸",
    completedWorks: "КС-15",
    salesTrend: [
      { value: 45, month: "Мар" },
      { value: 52, month: "Апр" },
      { value: 58, month: "Май" },
      { value: 65, month: "Июн" },
      { value: 72, month: "Июл" },
      { value: 81, month: "Авг" }
    ],
    progressTrend: [
      { value: 68, month: "Мар" },
      { value: 73, month: "Апр" },
      { value: 77, month: "Май" },
      { value: 80, month: "Июн" },
      { value: 82, month: "Июл" },
      { value: 85, month: "Авг" }
    ]
  },
  {
    id: "2",
    name: "ЖК «CRYSTAL TOWERS»",
    address: "г. Алматы, пр. Тауелсиздик × ул. А. Токпанова",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=400&fit=crop",
    progress: 65,
    status: "ontrack" as const,
    statusText: "Строится",
    class: "Бизнес класс",
    completion_date: "II квартал 2026",
    profit: {
      value: "18.5 млрд ₸",
      plan: "17.8 млрд ₸",
      percentage: "103.9%",
      change: "+3.9%"
    },
    profitability: "32.1%",
    budget: {
      plan: "58.2 млрд ₸",
      fact: "59.8 млрд ₸",
      deviation: "+1.6 млрд ₸"
    },
    financing: {
      remaining: "21.4 млрд ₸",
      percentage: 64
    },
    sales: {
      apartments: { sold: 298, total: 485 },
      commercial: { sold: 12, total: 25 },
      parking: { sold: 220, total: 380 },
      revenue: "45.2 млрд ₸"
    },
    completion: {
      planned: "Июн 2026",
      forecast: "Июн 2026",
      deviation: "В срок"
    },
    expenses: {
      total: "22.1 млрд ₸",
      planned: "21.8 млрд ₸",
      materials: "9.8 млрд ₸",
      contracts: "8.2 млрд ₸",
      deviation: "+1.4%"
    },
    advances: "4.8 млрд ₸",
    completedWorks: "КС-12",
    salesTrend: [
      { value: 25, month: "Мар" },
      { value: 32, month: "Апр" },
      { value: 41, month: "Май" },
      { value: 48, month: "Июн" },
      { value: 55, month: "Июл" },
      { value: 61, month: "Авг" }
    ],
    progressTrend: [
      { value: 45, month: "Мар" },
      { value: 52, month: "Апр" },
      { value: 57, month: "Май" },
      { value: 60, month: "Июн" },
      { value: 62, month: "Июл" },
      { value: 65, month: "Авг" }
    ]
  },
  {
    id: "3",
    name: "ЖК «URBAN PARK»",
    address: "г. Алматы, пр. Улы Дала × ул. Ч. Айтматова",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=400&fit=crop",
    progress: 35,
    status: "risk" as const,
    statusText: "Под риском",
    class: "Комфорт +",
    completion_date: "III квартал 2026",
    price_from: "от 21 094 000 ₸",
    profit: {
      value: "8.2 млрд ₸",
      plan: "11.5 млрд ₸",
      percentage: "71.3%",
      change: "-28.7%"
    },
    profitability: "19.8%",
    budget: {
      plan: "42.0 млрд ₸",
      fact: "47.2 млрд ₸",
      deviation: "+5.2 млрд ₸"
    },
    financing: {
      remaining: "28.9 млрд ₸",
      percentage: 39
    },
    sales: {
      apartments: { sold: 145, total: 380 },
      commercial: { sold: 3, total: 22 },
      parking: { sold: 89, total: 290 },
      revenue: "22.8 млрд ₸"
    },
    completion: {
      planned: "Апр 2026",
      forecast: "Авг 2026",
      deviation: "+4 мес"
    },
    expenses: {
      total: "28.4 млрд ₸",
      planned: "24.2 млрд ₸",
      materials: "12.8 млрд ₸",
      contracts: "9.4 млрд ₸",
      deviation: "+17.4%"
    },
    advances: "2.1 млрд ₸",
    completedWorks: "КС-8",
    salesTrend: [
      { value: 15, month: "Мар" },
      { value: 22, month: "Апр" },
      { value: 28, month: "Май" },
      { value: 32, month: "Июн" },
      { value: 35, month: "Июл" },
      { value: 38, month: "Авг" }
    ],
    progressTrend: [
      { value: 18, month: "Мар" },
      { value: 24, month: "Апр" },
      { value: 28, month: "Май" },
      { value: 30, month: "Июн" },
      { value: 32, month: "Июл" },
      { value: 35, month: "Авг" }
    ]
  },
  {
    id: "4",
    name: "ЖК «PLATINUM HEIGHTS»",
    address: "г. Алматы, ул. Акмешит × ул. Амадолы",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=400&fit=crop",
    progress: 92,
    status: "ontrack" as const,
    statusText: "Завершение",
    class: "Премиум класс",
    completion_date: "IV квартал 2024",
    profit: {
      value: "24.7 млрд ₸",
      plan: "23.8 млрд ₸",
      percentage: "103.8%",
      change: "+3.8%"
    },
    profitability: "35.2%",
    budget: {
      plan: "68.5 млрд ₸",
      fact: "67.1 млрд ₸",
      deviation: "-1.4 млрд ₸"
    },
    financing: {
      remaining: "5.8 млрд ₸",
      percentage: 91
    },
    sales: {
      apartments: { sold: 156, total: 165 },
      commercial: { sold: 8, total: 10 },
      parking: { sold: 142, total: 150 },
      revenue: "52.3 млрд ₸"
    },
    completion: {
      planned: "Окт 2024",
      forecast: "Ноя 2024",
      deviation: "+1 мес"
    },
    expenses: {
      total: "31.2 млрд ₸",
      planned: "32.1 млрд ₸",
      materials: "14.1 млрд ₸",
      contracts: "11.8 млрд ₸",
      deviation: "-2.8%"
    },
    advances: "1.2 млрд ₸",
    completedWorks: "КС-18",
    salesTrend: [
      { value: 85, month: "Мар" },
      { value: 88, month: "Апр" },
      { value: 90, month: "Май" },
      { value: 92, month: "Июн" },
      { value: 94, month: "Июл" },
      { value: 95, month: "Авг" }
    ],
    progressTrend: [
      { value: 85, month: "Мар" },
      { value: 87, month: "Апр" },
      { value: 89, month: "Май" },
      { value: 90, month: "Июн" },
      { value: 91, month: "Июл" },
      { value: 92, month: "Авг" }
    ]
  }
];