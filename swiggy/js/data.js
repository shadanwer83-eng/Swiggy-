/**
 * Swiggy Food Delivery & Tracking Platform - Data Store
 */

const APP_DATA = {
  categories: [
    { id: 'biryani', name: 'Biryani', icon: '🍲' },
    { id: 'burgers', name: 'Burgers', icon: '🍔' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'rolls', name: 'Rolls & Wraps', icon: '🌯' },
    { id: 'desserts', name: 'Desserts & Ice Cream', icon: '🍨' },
    { id: 'north-indian', name: 'North Indian', icon: '🥘' },
    { id: 'chinese', name: 'Chinese & Asian', icon: '🍜' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' }
  ],

  restaurants: [
    {
      id: 'rest_1',
      name: 'Meghana Foods',
      cuisine: 'Biryani, Andhra, South Indian, Tandoori',
      rating: 4.5,
      totalRatings: '10K+',
      deliveryTime: '25-30 mins',
      avgDeliveryMins: 28,
      costForTwo: '₹500 for two',
      costNumeric: 500,
      isVeg: false,
      offerText: '50% OFF UPTO ₹100',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      address: '100 Feet Rd, 4th Block, Koramangala, Bengaluru',
      fssai: '11218334000421',
      gstin: '29AABCM8291B1Z4',
      coordinates: [12.9352, 77.6245],
      categories: ['Biryani', 'Starters', 'Breads & Rice', 'Beverages'],
      menu: [
        {
          id: 'm1_1',
          name: 'Meghana Special Chicken Biryani',
          price: 330,
          isVeg: false,
          isBestseller: true,
          rating: 4.6,
          votes: 2480,
          description: 'Authentic spicy and aromatic Andhra biryani layered with succulent tender chicken chunks and flavorful basmati rice.',
          image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80',
          category: 'Biryani'
        },
        {
          id: 'm1_2',
          name: 'Hyderabadi Paneer Biryani',
          price: 290,
          isVeg: true,
          isBestseller: true,
          rating: 4.4,
          votes: 1120,
          description: 'Marinated paneer cubes slow-cooked with basmati rice, mint, caramelized onions, and authentic royal spices.',
          image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&auto=format&fit=crop&q=80',
          category: 'Biryani'
        },
        {
          id: 'm1_3',
          name: 'Andhra Chicken 65',
          price: 310,
          isVeg: false,
          isBestseller: false,
          rating: 4.5,
          votes: 940,
          description: 'Deep-fried spicy chicken bites tossed with curry leaves, green chillies, and secret Andhra spices.',
          image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80',
          category: 'Starters'
        },
        {
          id: 'm1_4',
          name: 'Butter Garlic Naan',
          price: 65,
          isVeg: true,
          isBestseller: false,
          rating: 4.3,
          votes: 430,
          description: 'Fresh tandoor-baked Indian flatbread topped with minced garlic and generous salted butter.',
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
          category: 'Breads & Rice'
        }
      ]
    },
    {
      id: 'rest_2',
      name: 'Truffles American Diner',
      cuisine: 'Burgers, American, Continental, Pastas',
      rating: 4.6,
      totalRatings: '25K+',
      deliveryTime: '20-25 mins',
      avgDeliveryMins: 22,
      costForTwo: '₹450 for two',
      costNumeric: 450,
      isVeg: false,
      offerText: 'FLAT ₹120 OFF ABOVE ₹299',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      address: 'St. Marks Road, Ashok Nagar, Bengaluru',
      fssai: '11216333000889',
      gstin: '29AABCT9981K1Z2',
      coordinates: [12.9385, 77.6212],
      categories: ['Burgers', 'Pasta & Mains', 'Desserts', 'Beverages'],
      menu: [
        {
          id: 'm2_1',
          name: 'All American Cheese Burger (Lamb/Chicken)',
          price: 290,
          isVeg: false,
          isBestseller: true,
          rating: 4.8,
          votes: 4100,
          description: 'Grilled patty with melted English cheddar, crisp lettuce, gherkins, caramelized onions, and house secret sauce in a brioche bun.',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
          category: 'Burgers'
        },
        {
          id: 'm2_2',
          name: 'Crispy Veg Crunchy Burger',
          price: 210,
          isVeg: true,
          isBestseller: false,
          rating: 4.3,
          votes: 890,
          description: 'Crispy herb potato patty topped with fresh coleslaw, tomato, melted cheese, and smoky chipotle mayo.',
          image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&auto=format&fit=crop&q=80',
          category: 'Burgers'
        },
        {
          id: 'm2_3',
          name: 'Peri Peri Seasoned French Fries',
          price: 150,
          isVeg: true,
          isBestseller: true,
          rating: 4.5,
          votes: 1820,
          description: 'Golden crispy potato fries tossed in zesty African peri-peri spices, served with garlic dip.',
          image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80',
          category: 'Burgers'
        },
        {
          id: 'm2_4',
          name: 'Creamy Alfredo Penne Pasta',
          price: 320,
          isVeg: true,
          isBestseller: false,
          rating: 4.4,
          votes: 610,
          description: 'Penne pasta tossed in rich parmesan cream sauce with sautéed mushrooms, broccoli, and garlic herbs.',
          image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=400&auto=format&fit=crop&q=80',
          category: 'Pasta & Mains'
        }
      ]
    },
    {
      id: 'rest_3',
      name: 'Corner House Ice Cream',
      cuisine: 'Ice Cream, Desserts, Shakes',
      rating: 4.8,
      totalRatings: '40K+',
      deliveryTime: '15-20 mins',
      avgDeliveryMins: 18,
      costForTwo: '₹300 for two',
      costNumeric: 300,
      isVeg: true,
      offerText: 'FREE DELIVERY OVER ₹199',
      image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80',
      address: '1st Block, Jayanagar, Bengaluru',
      fssai: '11219332001140',
      gstin: '29AABCJ4410R1ZP',
      coordinates: [12.9310, 77.6290],
      categories: ['Signature Sundaes', 'Ice Cream Scoops', 'Thickshakes'],
      menu: [
        {
          id: 'm3_1',
          name: 'Death By Chocolate (DBC)',
          price: 260,
          isVeg: true,
          isBestseller: true,
          rating: 4.9,
          votes: 9200,
          description: 'The legendary dessert: gooey Dutch chocolate cake, vanilla ice cream, hot chocolate fudge, cherries, and toasted peanuts.',
          image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&auto=format&fit=crop&q=80',
          category: 'Signature Sundaes'
        },
        {
          id: 'm3_2',
          name: 'Hot Chocolate Fudge Sundae',
          price: 195,
          isVeg: true,
          isBestseller: true,
          rating: 4.7,
          votes: 2140,
          description: 'Two generous scoops of vanilla ice cream drenched in warm homemade chocolate fudge and roasted peanuts.',
          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop&q=80',
          category: 'Signature Sundaes'
        },
        {
          id: 'm3_3',
          name: 'Alphonso Mango Scoop Tub (500ml)',
          price: 220,
          isVeg: true,
          isBestseller: false,
          rating: 4.6,
          votes: 750,
          description: 'Rich, natural mango ice cream crafted with real Ratnagiri Alphonso mango pulp.',
          image: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400&auto=format&fit=crop&q=80',
          category: 'Ice Cream Scoops'
        }
      ]
    },
    {
      id: 'rest_4',
      name: 'Empire Restaurant',
      cuisine: 'North Indian, Kebabs, Biryani, Mughlai',
      rating: 4.2,
      totalRatings: '18K+',
      deliveryTime: '30-35 mins',
      avgDeliveryMins: 32,
      costForTwo: '₹600 for two',
      costNumeric: 600,
      isVeg: false,
      offerText: '20% OFF UPTO ₹80',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
      address: 'Church Street, Bengaluru',
      fssai: '11217334000301',
      gstin: '29AABCE1120M1ZX',
      coordinates: [12.9360, 77.6180],
      categories: ['Kebabs & Starters', 'Biryani', 'Curries & Gravies'],
      menu: [
        {
          id: 'm4_1',
          name: 'Empire Special Grilled Chicken',
          price: 340,
          isVeg: false,
          isBestseller: true,
          rating: 4.5,
          votes: 3100,
          description: 'Succulent half chicken grilled with Arabian spices, served with fresh garlic toum and pita.',
          image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&auto=format&fit=crop&q=80',
          category: 'Kebabs & Starters'
        },
        {
          id: 'm4_2',
          name: 'Butter Chicken Masala Gravy',
          price: 310,
          isVeg: false,
          isBestseller: true,
          rating: 4.4,
          votes: 1980,
          description: 'Tender tandoori chicken cooked in velvety, mildly sweet tomato butter gravy scented with fenugreek.',
          image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80',
          category: 'Curries & Gravies'
        },
        {
          id: 'm4_3',
          name: 'Paneer Tikka Masala',
          price: 280,
          isVeg: true,
          isBestseller: false,
          rating: 4.3,
          votes: 820,
          description: 'Char-grilled cottage cheese cubes cooked in a rich, spiced onion-tomato gravy with bell peppers.',
          image: 'https://images.unsplash.com/photo-1567184109411-b28f270383ab?w=400&auto=format&fit=crop&q=80',
          category: 'Curries & Gravies'
        }
      ]
    }
  ],

  riders: [
    {
      id: 'rider_1',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      vehicle: 'Hero Splendor (KA 01 EK 8832)',
      rating: 4.9,
      deliveriesCompleted: 1420,
      vaccinated: true
    },
    {
      id: 'rider_2',
      name: 'Amit Kumar',
      phone: '+91 98111 22334',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      vehicle: 'Honda Activa 6G (KA 05 MN 4912)',
      rating: 4.8,
      deliveriesCompleted: 980,
      vaccinated: true
    }
  ],

  coupons: [
    {
      code: 'SWIGGY50',
      title: '50% OFF up to ₹100',
      discountPct: 50,
      maxDiscount: 100,
      minOrder: 199,
      description: 'Valid on all orders above ₹199'
    },
    {
      code: 'WELCOME120',
      title: 'Flat ₹120 OFF',
      flatDiscount: 120,
      minOrder: 299,
      description: 'Special welcome offer on orders above ₹299'
    },
    {
      code: 'FREEDEL',
      title: 'Free Delivery',
      freeDelivery: true,
      minOrder: 150,
      description: 'Free doorstep delivery'
    }
  ],

  customerProfile: {
    name: 'Kavya S.',
    phone: '+91 98450 12345',
    email: 'kavya.s@example.com',
    addresses: [
      {
        id: 'addr_1',
        tag: 'Home',
        line1: 'Flat 402, Green Glen Heights, 14th Main Rd',
        line2: 'Sector 4, HSR Layout, Bengaluru, Karnataka 560102',
        coordinates: [12.9116, 77.6389] // Customer Home coordinates
      },
      {
        id: 'addr_2',
        tag: 'Work',
        line1: 'Tech Park Block B, Embassy Golf Links',
        line2: 'Domlur, Bengaluru, Karnataka 560071',
        coordinates: [12.9510, 77.6520]
      }
    ]
  },

  // Simulated GPS waypoints between Restaurant (Koramangala 12.9352, 77.6245)
  // and Customer Home (HSR Layout 12.9116, 77.6389)
  simulatedRoute: [
    [12.9352, 77.6245], // Meghana Foods Restaurant
    [12.9338, 77.6258],
    [12.9315, 77.6272],
    [12.9285, 77.6291], // Sarjapur Main Rd Junction
    [12.9254, 77.6315],
    [12.9220, 77.6338], // Agara Lake Flyover
    [12.9185, 77.6355],
    [12.9152, 77.6370], // Sector 4 HSR entrance
    [12.9130, 77.6382],
    [12.9116, 77.6389]  // Customer Home
  ]
};

