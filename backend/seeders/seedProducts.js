const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');

// Configuration maps for generating 10-15 products per subcategory
const categories = [
  {
    name: 'Vehicles',
    subCategories: [
      {
        name: 'Cars',
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Hyundai Creta', 'Kia Seltos', 'Tata Nexon', 'Mahindra XUV700', 'Toyota Innova Crysta',
          'Honda City VTEC', 'MG Hector Plus', 'Hyundai Verna Turbo', 'Tata Harrier Dark', 'Kia Sonet Turbo',
          'Toyota Fortuner Legender', 'Mahindra Thar 4x4'
        ],
        specs: ['Transmission: Automatic', 'Fuel: Diesel', 'Engine: 1497 cc', 'Seating Capacity: 5-7', 'Airbags: 6'],
        buyPriceRange: [1200000, 3200000],
        rentPriceRange: [2500, 7500],
        depositRange: [15000, 40000],
        desc: 'Comfortable and high performing urban vehicle suitable for long drives and daily commutes.'
      },
      {
        name: 'Bikes',
        images: [
          'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Royal Enfield Classic 350', 'Yamaha R15 V4', 'KTM Duke 390', 'Honda Hness CB350', 'Bajaj Pulsar NS200',
          'TVS Apache RTR 200', 'Suzuki Gixxer SF 250', 'Hero Xpulse 200T', 'Kawasaki Ninja 300', 'Jawa 42'
        ],
        specs: ['Engine: 199 cc - 349 cc', 'Mileage: 35-45 kmpl', 'ABS: Dual Channel', 'Weight: 160-195 kg'],
        buyPriceRange: [150000, 420000],
        rentPriceRange: [600, 1800],
        depositRange: [3000, 8000],
        desc: 'Powerful cruiser and sport performance bikes for street thrills and cruising comfort.'
      },
      {
        name: 'Scooters',
        images: [
          'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Honda Activa 6G', 'TVS Jupiter 125', 'Suzuki Access 125', 'Ola S1 Pro Gen 2', 'Ather 450X',
          'TVS Ntorq 125', 'Honda Dio 125', 'Yamaha Aerox 155', 'Vespa VXL 150', 'Hero Zoom 110'
        ],
        specs: ['Engine: 110 cc - 155 cc', 'Fuel Type: Petrol/Electric', 'Storage: Underseat 22L', 'Brakes: CBS'],
        buyPriceRange: [85000, 160000],
        rentPriceRange: [300, 900],
        depositRange: [1500, 3000],
        desc: 'Lightweight, easily maneuverable scooters perfect for quick grocery shopping and urban navigation.'
      },
      {
        name: 'Cycles',
        images: [
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1487800940032-1cf211187aea?w=600&auto=format&fit=crop&q=80',        ],
        names: [
          'Decathlon Rockrider ST100', 'Firefox Target 21 Speed', 'Hero Sprint Pro', 'Hercules Roadeo Hercules',
          'Trek Marlin 5 Mountain', 'Giant Escape 3 Hybrid', 'Montra Downtown Hybrid', 'Ninety One Wanderer',
          'Btwin Riverside 120', 'Schnell Holts Mountain'
        ],
        specs: ['Frame: Alloy/Steel', 'Gears: 7/21 Speed Shimanio', 'Suspension: Front/Rigid', 'Tire Size: 27.5 inch'],
        buyPriceRange: [12000, 45000],
        rentPriceRange: [150, 400],
        depositRange: [1000, 2000],
        desc: 'Ergonomic multi-gear bicycles optimized for fitness, dirt trails, and green commuting.'
      },
      {
        name: 'Vans',
        images: [
          'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Maruti Suzuki Eeco', 'Force Traveller 12-Seater', 'Tata Winger Tourist', 'Mahindra Supro Van',
          'Toyota HiAce Luxury', 'Kia Carnival Limousine', 'Chevrolet Express Cargo', 'Ford Transit Multi',
          'Mercedes Benz V-Class', 'Renault Triber Cargo'
        ],
        specs: ['Capacity: 7-14 Seater', 'Fuel: CNG/Diesel', 'Air Conditioning: Dual Zone', 'Engine: 1196 cc - 2596 cc'],
        buyPriceRange: [550000, 3500000],
        rentPriceRange: [2000, 8000],
        depositRange: [10000, 30000],
        desc: 'Spacious transport vans suitable for family road trips, cargo shifting, and group travels.'
      },
      {
        name: 'Trucks',
        images: [
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?w=600&auto=format&fit=crop&q=80',        ],
        names: [
          'Tata Ace Gold (Chota Hathi)', 'Mahindra Bolero Maxi Truck', 'Ashok Leyland Dost+', 'Maruti Suzuki Super Carry',
          'Tata Yodha 4x4 pickup', 'Isuzu D-Max S-Cab', 'Force Shaktiman Truck', 'Mahindra Imperio Pickup',
          'Tata Intra V30', 'BharatBenz Tipper Truck'
        ],
        specs: ['Payload Capacity: 1.5 - 5 Tons', 'Engine: 2.2L Turbodiesel', 'Steering: Power Assisted', 'Body: Deck/Cabin'],
        buyPriceRange: [600000, 2800000],
        rentPriceRange: [1500, 6000],
        depositRange: [8000, 25000],
        desc: 'Heavy duty commercial utility vehicles designed to relocate house loads and transport goods.'
      },
      {
        name: 'Buses',
        images: [
          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Tata Starbus 32 Seater', 'Ashok Leyland Viking Bus', 'Eicher Skyline Pro', 'Volvo 9600 Sleeper Coach',
          'Scania Metrolink Multi-Axle', 'Force Monobus AC', 'BharatBenz School Bus', 'Tata Winger 15 Seater',
          'SML Isuzu Executive Bus', 'Mahindra Cruzio Commuter'
        ],
        specs: ['Seats: 30-50 Seater', 'AC: Individual vents', 'Suspension: Air Suspension', 'Engine: 5.6 Litre Turbo'],
        buyPriceRange: [2500000, 9500000],
        rentPriceRange: [8000, 25000],
        depositRange: [20000, 60000],
        desc: 'Premium touring passenger coach suited for corporate outings, school trips, and marriage transport.'
      },
      {
        name: 'Lorries',
        images: [
          'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&auto=format&fit=crop&q=80',        ],
        names: [
          'Tata Signa 2823.K Tipper', 'BharatBenz 1923R Cargo Lorry', 'Ashok Leyland 3520 Lorry', 'Eicher Pro 6028',
          'Mahindra Blazo X 28', 'Tata Prima 2830.K', 'Ashok Leyland Partner 4 Tire', 'Force Kargo King',
          'Eicher Pro 2049 Lorry', 'BharatBenz 2823R heavy Lorry'
        ],
        specs: ['GVW: 19 - 35 Tons', 'Wheelbase: 4800 mm', 'Engine: Cummins ISBe 5.6', 'Gearbox: 9-Speed manual'],
        buyPriceRange: [1800000, 5200000],
        rentPriceRange: [4000, 15000],
        depositRange: [15000, 45000],
        desc: 'Multi-axle heavy-duty cargo trucks ideal for industrial transportation and logistics operations.'
      }
    ]
  },
  {
    name: 'Electronics',
    subCategories: [
      {
        name: 'Laptops',
        images: [          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'MacBook Pro M4', 'MacBook Air M4', 'Dell XPS 15 OLED', 'Dell Inspiron 15 Core i5', 'HP Spectre x360',
          'HP Pavilion 14 Slim', 'Lenovo ThinkPad X1 Carbon', 'Lenovo Legion 5 Pro Gaming', 'Asus ROG Strix G16',
          'Asus ZenBook Duo OLED', 'Acer Predator Helios 300', 'Acer Aspire 5 Slim'
        ],
        specs: ['Processor: Apple M4 / Intel Core i7 / Ryzen 7', 'RAM: 16GB LPDDR5', 'Storage: 512GB NVMe SSD', 'Graphics: Integrated/RTX 4060'],
        buyPriceRange: [65000, 195000],
        rentPriceRange: [800, 2500],
        depositRange: [5000, 15000],
        desc: 'Top tier computers with exceptional performance, bright displays, and sleek battery efficient form-factors.'
      },
      {
        name: 'Mobiles',
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'iPhone 16 Pro Max', 'iPhone 16 Standard', 'Samsung Galaxy S25 Ultra', 'Samsung Galaxy S25 Plus', 'OnePlus 13 5G',
          'Google Pixel 10 Pro', 'Xiaomi 15 Ultra', 'Vivo X300 Pro', 'Oppo Find X8 Pro', 'Nothing Phone (3)'
        ],
        specs: ['Display: 6.7 inch OLED 120Hz', 'Camera: 50MP Triple Array', 'Processor: Snapdragon 8 Gen 4 / A18 Pro', 'Battery: 5000 mAh'],
        buyPriceRange: [45000, 145000],
        rentPriceRange: [500, 1800],
        depositRange: [3000, 10000],
        desc: 'Flagship mobile devices offering modern hardware, ultra-clear zoom photography and crisp refresh rates.'
      },
      {
        name: 'Cameras',
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Sony Alpha 7 IV Mirrorless', 'Canon EOS R6 Mark II', 'Nikon Z6 II Mirrorless', 'Fujifilm X-T5 Creator Kit',
          'Panasonic Lumix GH6', 'Sony ZV-E10 Vlogging Camera', 'Canon EOS 1500D DSLR', 'GoPro Hero 13 Black',
          'DJI Osmo Action 5 Pro', 'Insta360 X4 8K 360'
        ],
        specs: ['Sensor: 33MP Full Frame Exmor R', 'Video: 4K 60p 10-Bit', 'Autofocus: Real-Time Eye AF', 'Mount: E-mount / RF-mount'],
        buyPriceRange: [40000, 230000],
        rentPriceRange: [600, 3500],
        depositRange: [4000, 20000],
        desc: 'Professional grade DSLRs and Mirrorless systems engineered for cinematic videography and crisp resolution photo capturing.'
      },
      {
        name: 'Tablets',
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1527698266440-12104e498b76?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'iPad Pro 11-inch M4', 'iPad Air 11-inch M2', 'Samsung Galaxy Tab S10 Ultra', 'Samsung Galaxy Tab S10+',
          'Xiaomi Pad 6 Pro', 'OnePlus Pad 2', 'Lenovo Tab P12 Pro', 'Microsoft Surface Pro 10',
          'Realme Pad 2 LTE', 'Redmi Pad SE'
        ],
        specs: ['Display: Liquid Retina XDR / AMOLED', 'Chipset: Apple M4 / Snapdragon 8 Gen 2', 'Stylus Support: Yes', 'OS: iPadOS / Android'],
        buyPriceRange: [25000, 110000],
        rentPriceRange: [400, 1500],
        depositRange: [2000, 8000],
        desc: 'Versatile touch tablets designed for digital illustration, corporate note taking, and media enjoyment.'
      },
      {
        name: 'Projectors',
        images: [
          'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Epson EH-TW7100 4K', 'BenQ TH585P Full HD', 'Optoma UHD55 Smart 4K', 'ViewSonic M2e Portable LED',
          'Nebula Anker Capsule 3', 'Samsung The Freestyle Gen 2', 'Sony VPL-XW5000ES Laser', 'XGIMI Horizon Pro 4K',
          'Wansa Smart LED Projector', 'LG CineBeam Portable'
        ],
        specs: ['Brightness: 3000 ANSI Lumens', 'Resolution: 4K UHD / 1080p', 'Contrast Ratio: 500,000:1', 'Connectivity: HDMI / WiFi'],
        buyPriceRange: [35000, 185000],
        rentPriceRange: [500, 2200],
        depositRange: [3000, 10000],
        desc: 'Ultra-bright home theater projectors suitable for business presentation displays and outdoor movie nights.'
      }
    ]
  },
  {
    name: 'Furniture',
    subCategories: [
      {
        name: 'Chairs',
        images: [
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Herman Miller Aeron Office Chair', 'Featherlite Astro High Back', 'Greensoul Monster Ultimate Gaming',
          'Sleepwell Premium Recliner', 'IKEA Poang Armchair', 'Wipro Furniture Ergonomic Mesh',
          'Urban Ladder Wingback Lounge Chair', 'Durian Leatherette Executive Chair', 'Godrej Interio Motion Chair',
          'Savya Home Apollo Mesh Chair'
        ],
        specs: ['Material: Breathable Mesh / Premium Leather', 'Base: Aluminum Star Base', 'Armrests: 3D/4D Adjustable', 'Support: Lumbar Height Tilt'],
        buyPriceRange: [8000, 85000],
        rentPriceRange: [100, 600],
        depositRange: [800, 4000],
        desc: 'Ergonomically engineered seating units tailored to mitigate back strain and maximize desk productivity.'
      },
      {
        name: 'Tables',
        images: [
          'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80',        ],
        names: [
          'IKEA Linnmon Study Desk', 'Spacewood Multipurpose Computer Table', 'Urban Ladder Solid Wood Dining Table',
          'Godrej Interio Metal Work Desk', 'Featherlite Height Adjustable Table', 'Green Soul Motorized Standing Desk',
          'Durian Solid Oak Coffee Table', 'Wakefit Sheesham Study Table', 'Home Centre Glass Dining Table',
          'DeckUp Siena Office Table'
        ],
        specs: ['Wood type: Sheesham / Engineered Wood / Glass', 'Frame: Powder Coated Steel', 'Weight limit: Up to 80kg', 'Controls: Dual Motor Electric'],
        buyPriceRange: [4000, 35000],
        rentPriceRange: [150, 800],
        depositRange: [1000, 3000],
        desc: 'Sturdy, clean surfaces ideal for home workstations, student studying rooms, and dining setups.'
      },
      {
        name: 'Beds',
        images: [
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Wakefit King Size Bed with Storage', 'Sleepyhead Solid Wood Queen Bed', 'Duroflex Sheesham Wood King Bed',
          'Godrej Interio Hydraulic Metal Bed', 'Urban Ladder Teak Finish Queen Bed', 'IKEA Malm Storage Bed',
          'Sleepwell Ortho Mattress Bed Combo', 'Durian Upholstered Bed Frame', 'Spacewood Engineered Wood Bed',
          'Home Centre Modern Platform Bed'
        ],
        specs: ['Size: King Size / Queen Size', 'Material: Sheesham Wood / Ply', 'Storage: Hydraulic Lift / Box Storage', 'Mattress Type: Orthopedic Foam'],
        buyPriceRange: [18000, 55000],
        rentPriceRange: [600, 2000],
        depositRange: [4000, 10000],
        desc: 'Extremely durable king and queen sized bed frames with integrated storage drawers for premium sleep comfort.'
      },
      {
        name: 'Sofas',
        images: [
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Sleepyhead Kiki 3-Seater Sofa', 'Urban Ladder Leatherette L-Shape Sofa', 'Durian Fabric Recliner 2-Seater',
          'IKEA Friheten Sofa Cum Bed', 'Godrej Interio 5-Seater Sofa Set', 'Wakefit Sheesham Wood Sofa Set',
          'Home Centre Sectional Sofa', 'Spacewood Fabric Sofa', 'Wipro Furniture Modular Sofa',
          'Greensoul Ergonomic Office Lounge Sofa'
        ],
        specs: ['Seating: 2 / 3 / L-Shape 5 Seater', 'Fabric: Velvet / Cotton / Faux Leather', 'Suspension: Pocket Spring S-Coil', 'Frame: Solid Salwood'],
        buyPriceRange: [15000, 75000],
        rentPriceRange: [500, 2500],
        depositRange: [3000, 8000],
        desc: 'Plush velvet and leather fabric sofa couches offering premium padding and relaxing support.'
      }
    ]
  },
  {
    name: 'Tools & Machinery',
    subCategories: [
      {
        name: 'Drills',
        images: [
          'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1608613304899-ea8098577e38?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Bosch GSB 13 RE Impact Drill', 'Dewalt DCD778 Cordless Hammer Drill', 'Black & Decker Orange Kit',
          'Stanley SDH600 Hammer Drill', 'Makita HP1630 Hammer Drill', 'Bosch Professional Cordless Screwdriver',
          'Dewalt SDS Max Rotary Hammer', 'iBELL 13mm Smart Drill', 'Foster Rotary Impact Drill',
          'Jon Bhandari Tools Pistol Drill'
        ],
        specs: ['Power Output: 600W - 1200W', 'Chuck Capacity: 13mm Keyed/Keyless', 'Speed: Variable 0-2800 RPM', 'Impact Rate: 48,000 bpm'],
        buyPriceRange: [2500, 14000],
        rentPriceRange: [100, 450],
        depositRange: [500, 2000],
        desc: 'Professional impact and hammer drills for concrete drilling, woodworking, and assembly installations.'
      },
      {
        name: 'Generators',
        images: [          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Honda EP1000 Portable Generator', 'Kirloskar 5 kVA Silent DG Set', 'Birla Yamaha Portable Gen',
          'Hyundai 3kVA Inverter Generator', 'Cummins 10kVA Commercial Generator', 'Greaves Power Silent 7.5kVA',
          'iBELL Petrol Generator 2kVA', 'XL Power Silent Generator', 'Honda EU30i Smart Inverter',
          'Koel Green Silent Power Generator'
        ],
        specs: ['Capacity: 1 kVA - 10 kVA', 'Fuel: Petrol / Diesel', 'Sound Level: < 65 dBA Silent', 'Starter: Key / Recoil Pull'],
        buyPriceRange: [28000, 185000],
        rentPriceRange: [600, 3500],
        depositRange: [4000, 15000],
        desc: 'Reliable, low-noise petrol/diesel emergency power generators designed for domestic back-up and job sites.'
      },
      {
        name: 'Cranes',
        images: [          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'ACE 15 Ton Hydraulic Mobile Crane', 'Sany 25 Ton Truck Mounted Crane', 'Escorts TRX 15 Ton Crane',
          'LIEBHERR LTM 1050 Mobile Crane', 'KATO 13 Ton Rough Terrain Crane', 'TATA Hitachi Hydra Crane',
          'Zoomlion 50T Crawler Crane', 'XCMG truck crane 25T', 'Kobelco CKL 1000T Crawler',
          'Action Construction Hydra 12'
        ],
        specs: ['Lifting Capacity: 12 - 50 Tons', 'Max Boom Length: 30 meters', 'Engine: 160 hp Diesel', 'Drive System: 4x4 Rough Terrain'],
        buyPriceRange: [2200000, 8500000],
        rentPriceRange: [6000, 18000],
        depositRange: [25000, 60000],
        desc: 'Hydraulic heavy cargo lifting boom cranes suitable for load adjustments on high structural buildings.'
      },
      {
        name: 'Excavators',
        images: [
          'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'JCB 3DX Eco Backhoe Loader', 'Tata Hitachi EX210LC Excavator', 'L&T Komatsu PC210 Excavator',
          'CAT 320 Next Gen Excavator', 'Sany SY215C Heavy Excavator', 'Hyundai Robex 140 Excavator',
          'JCB JS205 Crawler Excavator', 'Kobelco SK210 Super Excavator', 'Volvo EC210D Excavator',
          'Kubota U50 Mini Excavator'
        ],
        specs: ['Bucket Capacity: 0.9 - 1.2 cum', 'Engine Power: 76 - 150 HP', 'Operating Weight: 21,000 kg', 'Max Digging Depth: 6.5 meters'],
        buyPriceRange: [3500000, 7800000],
        rentPriceRange: [5000, 15000],
        depositRange: [20000, 50000],
        desc: 'Heavy duty tracked earth diggers ideal for foundation lay-outing, building demolitions and trench excavations.'
      },
      {
        name: 'Construction Equipment',
        images: [          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Safari Concrete Mixer Machine', 'Jaypee Steel Bar Bending Machine', 'CASE 1107EX Vibratory Roller',
          'Apollo Asphalt Paver Roller', 'Stihl TS410 Concrete Cut-Off Saw', 'Wacker Neuson Plate Compactor',
          'iBELL Concrete Vibrator Needle', 'Atlas Copco Jackhammer Compressor', 'L&T Pneumatic Tamping Rammer',
          'TATA Hitachi Mini Compactor'
        ],
        specs: ['Operations: Hydraulic / Pneumatic', 'Power: Diesel Engine / Electric Motor', 'Weight: 350kg - 11,000kg', 'Output: High Frequency Vibration'],
        buyPriceRange: [15000, 950000],
        rentPriceRange: [300, 5000],
        depositRange: [2000, 20000],
        desc: 'Specialized build equipment including cement mixers, heavy vibrators, road rollers, and high impact pneumatic jackhammers.'
      }
    ]
  },
  {
    name: 'Event Equipment',
    subCategories: [
      {
        name: 'Speakers',
        images: [
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1590608897129-79da98d15969?w=600&auto=format&fit=crop&q=80',          'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'JBL PartyBox 310 Bluetooth', 'Bose L1 Pro8 Column System', 'Sony MHC-V83D High Power Audio',
          'QSC K12.2 Active Powered Speaker', 'EV ZLX-12P DJ Monitor', 'Behringer Eurolive 15 inch',
          'Mackie Thump 15A Active Speaker', 'Marshall Woburn III Speaker', 'LD Systems Maui 11 G2',
          'Yamaha DBR10 Active Speaker'
        ],
        specs: ['Power Output: 240W - 2000W RMS', 'Connectivity: Bluetooth/XLR/TRS', 'Battery Life: Up to 18 hours', 'Frequency: 45Hz - 20kHz'],
        buyPriceRange: [22000, 145000],
        rentPriceRange: [500, 2500],
        depositRange: [3000, 10000],
        desc: 'High decibel professional audio monitors and bluetooth party towers for music events.'
      },
      {
        name: 'LED Screens',
        images: [
          'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Absen P3.9 Outdoor LED Wall', 'Unilumin P2.5 Indoor Stage Screen', 'Samsung 85 inch Crystal 4K TV',
          'Sony Bravia 75 inch Professional LED', 'Leyard P1.8 Ultra HD Display', 'LG 86 inch Digital Signage',
          'Optoma P2.0 Stage Backscreen LED', 'BenQ 65 inch Interactive Panel', 'TCL 85 inch Smart LED Screen',
          'Panasonic 65 inch OLED Broadcast Screen'
        ],
        specs: ['Pixel Pitch: 1.8mm - 3.9mm', 'Refresh Rate: 3840 Hz', 'Brightness: 5000 nits (Outdoor)', 'Module Size: 500x500mm Cabinet'],
        buyPriceRange: [45000, 350000],
        rentPriceRange: [1500, 10000],
        depositRange: [8000, 30000],
        desc: 'Seamless LED panels and high resolution screen walls designed for wedding halls, conventions, and DJ stages.'
      },
      {
        name: 'Sound Systems',
        images: [
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
        ],
        names: [
          'Pioneer DJ DDJ-FLX10 Mixer Set', 'Sennheiser G4 Wireless Mic Set', 'Shure SLXD24 Dual Mic System',
          'Yamaha MG16XU 16-Channel Mixer', 'Soundcraft Signature 22 console', 'JBL SRX800 Passive Dual Sub',
          'Behringer X32 Digital Mixer Set', 'Crown XTi 4002 Power Amplifier', 'DBX DriveRack PA2 Loudspeaker',
          'Audio-Technica M50x Monitor Set'
        ],
        specs: ['Mixer Channels: 4 - 32 Channels', 'Wireless Range: Up to 100 meters', 'Faders: Motorized Digital', 'DSP Processing: Built-in EQ/Delay'],
        buyPriceRange: [35000, 220000],
        rentPriceRange: [1000, 8000],
        depositRange: [5000, 20000],
        desc: 'Fully loaded sound engineering kits comprising multichannel mixers, microphones, sound splitters, and amplifiers.'
      }
    ]
  }
];

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentora');
    console.log('Seed: Connected to Database...');

    // Clear existing collections to refresh seed
    await User.deleteMany();
    await Product.deleteMany();
    await Review.deleteMany();
    await Order.deleteMany();
    await Rental.deleteMany();
    await Payment.deleteMany();

    console.log('Database cleared.');

    // 1. Create Test User
    const testUser = await User.create({
      name: 'Rentora Premium User',
      email: 'user@rentora.com',
      password: '123456', 
      phone: '9876543210',
      role: 'user',
    });
    
    // Create Admin User too
    await User.create({
      name: 'Rentora Admin',
      email: 'admin@rentora.com',
      password: 'adminpassword',
      phone: '9999999999',
      role: 'admin',
    });

    console.log('Test and Admin Users created.');

    // 2. Generate and Seed Products
    let totalProductsCount = 0;
    const productsToSeed = [];

    for (const cat of categories) {
      for (const subCat of cat.subCategories) {
        // Generate at least 10 products for each sub-category
        const totalItemsToGenerate = Math.max(subCat.names.length, 10);
        
        for (let i = 0; i < totalItemsToGenerate; i++) {
          // Determine name
          let name = '';
          if (i < subCat.names.length) {
            name = subCat.names[i];
          } else {
            // Generate extra names to reach at least 10
            const randomSuffix = ['Pro', 'Max', 'Ultra', 'GT', 'Elite', 'Prime', 'X', 'Plus', 'Classic', 'Sport'][i % 10];
            const baseName = subCat.names[i % subCat.names.length];
            name = `${baseName} ${randomSuffix}`;
          }

          // Randomize pricing ranges
          const buyPrice = Math.floor(
            subCat.buyPriceRange[0] + 
            Math.random() * (subCat.buyPriceRange[1] - subCat.buyPriceRange[0])
          );
          
          const rentPricePerDay = Math.floor(
            subCat.rentPriceRange[0] + 
            Math.random() * (subCat.rentPriceRange[1] - subCat.rentPriceRange[0])
          );

          const securityDeposit = Math.floor(
            subCat.depositRange[0] + 
            Math.random() * (subCat.depositRange[1] - subCat.depositRange[0])
          );

          // Get image cycle - cycles through the multiple unique images defined above
          const imageList = [];
          const numImages = Math.min(subCat.images.length, Math.floor(3 + Math.random() * 3)); // 3 to 5 images
          for (let j = 0; j < numImages; j++) {
            imageList.push(subCat.images[(i + j) % subCat.images.length]);
          }

          // Get specs mix
          const specs = [...subCat.specs];
          specs.push(`Model ID: RT-${cat.name.substring(0,2).toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`);
          specs.push(`Warranty: ${i % 2 === 0 ? '1 Year Manufacturer' : '2 Years Brand'}`);

          // Rating
          const rating = parseFloat((4.0 + Math.random() * 1.0).toFixed(1));

          productsToSeed.push({
            name,
            description: `${name} - ${subCat.desc} Built to professional standards, offering reliable operation and top-notch materials for maximum durability. Ideal for multi-purpose usages.`,
            category: cat.name,
            subCategory: subCat.name,
            buyPrice,
            rentPricePerDay,
            securityDeposit,
            images: imageList,
            stock: Math.floor(5 + Math.random() * 20),
            rating,
            specs,
          });
        }
      }
    }

    const seededProducts = await Product.insertMany(productsToSeed);
    console.log(`Seeded ${seededProducts.length} products successfully.`);

    // 3. Create a few mock reviews
    const reviewsToSeed = [];
    const sampleComments = [
      'Absolutely worth the price! Excellent build quality and design.',
      'Rented this for my event, it was a major lifesaver! Quick delivery and setup.',
      'Super helpful support. Product was in absolute mint condition.',
      'Product performs exactly as described. Fully satisfied.',
      'A bit expensive but renting is highly economical. Highly recommend!',
      'Fast delivery and well packed. Working perfectly.'
    ];

    // Seed 1-2 reviews for the first 30 products
    for (let i = 0; i < Math.min(seededProducts.length, 30); i++) {
      const prod = seededProducts[i];
      const numReviews = Math.floor(1 + Math.random() * 2);
      for (let r = 0; r < numReviews; r++) {
        reviewsToSeed.push({
          user: testUser._id,
          userName: testUser.name,
          product: prod._id,
          rating: Math.floor(4 + Math.random() * 2), // 4 or 5
          comment: sampleComments[(i + r) % sampleComments.length],
        });
      }
    }

    await Review.insertMany(reviewsToSeed);
    console.log(`Seeded ${reviewsToSeed.length} sample reviews.`);

    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeder Error: ${error.message}`);
    process.exit(1);
  }
};

// If executing directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
