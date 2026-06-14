// Run: node seed.js
// This creates sample data so you can test the app immediately

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');

const categories = [
  { name: 'Burgers',  icon: '🍔', order: 1 },
  { name: 'Pizza',    icon: '🍕', order: 2 },
  { name: 'Pasta',    icon: '🍝', order: 3 },
  { name: 'Chicken',  icon: '🍗', order: 4 },
  { name: 'Drinks',   icon: '🥤', order: 5 },
  { name: 'Desserts', icon: '🍰', order: 6 },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected');

  // Clear existing
  await User.deleteMany({});
  await Category.deleteMany({});
  await MenuItem.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Admin', email: 'admin@food.com',
    password: 'admin123', role: 'admin',
  });
  console.log('👤 Admin created — email: admin@food.com | password: admin123');

  // Create categories
  const cats = await Category.insertMany(categories);
  const catMap = Object.fromEntries(cats.map(c => [c.name, c._id]));
  console.log('🏷️  Categories created');

  // Create menu items
  const items = [
    // Burgers
    { name: 'Classic Burger',      description: 'Juicy beef patty with lettuce, tomato, and our secret sauce',   price: 350, category: catMap['Burgers'],  isPopular: true,  isFeatured: true,  prepTime: 12, tags: ['bestseller'], calories: 520 },
    { name: 'Double Smash Burger', description: 'Two smash patties, double cheese, caramelized onions',          price: 550, category: catMap['Burgers'],  isPopular: true,  prepTime: 15, tags: ['spicy'],      calories: 780 },
    { name: 'Crispy Chicken Burger',description: 'Crispy fried chicken fillet, coleslaw, pickles',               price: 420, category: catMap['Burgers'],  isPopular: false, prepTime: 12, tags: ['crispy'],     calories: 610 },
    { name: 'Veggie Burger',       description: 'Black bean patty, avocado, roasted peppers',                    price: 320, category: catMap['Burgers'],  isPopular: false, prepTime: 10, tags: ['vegan'],      calories: 420 },
    // Pizza
    { name: 'Margherita Pizza',    description: 'Fresh tomato sauce, mozzarella, basil leaves',                  price: 650, category: catMap['Pizza'],    isPopular: true,  isFeatured: true,  prepTime: 20, tags: ['vegetarian'], calories: 750 },
    { name: 'BBQ Chicken Pizza',   description: 'BBQ sauce base, grilled chicken, red onions, cilantro',         price: 850, category: catMap['Pizza'],    isPopular: true,  prepTime: 22, tags: ['bestseller'], calories: 920 },
    { name: 'Pepperoni Pizza',     description: 'Classic pepperoni with extra cheese',                           price: 780, category: catMap['Pizza'],    isPopular: false, prepTime: 20, tags: [],            calories: 880 },
    // Pasta
    { name: 'Creamy Alfredo',      description: 'Fettuccine in rich parmesan cream sauce',                       price: 480, category: catMap['Pasta'],    isPopular: true,  prepTime: 18, tags: ['vegetarian'], calories: 690 },
    { name: 'Penne Arrabbiata',    description: 'Penne in spicy tomato sauce with garlic',                       price: 380, category: catMap['Pasta'],    isPopular: false, prepTime: 15, tags: ['spicy', 'vegan'], calories: 540 },
    // Chicken
    { name: 'Fried Chicken (4pc)', description: 'Crispy southern-style fried chicken pieces',                    price: 520, category: catMap['Chicken'], isPopular: true,  isFeatured: true,  prepTime: 18, tags: ['crispy', 'bestseller'], calories: 820 },
    { name: 'Grilled Chicken',     description: 'Herb-marinated grilled chicken breast with sauce',              price: 480, category: catMap['Chicken'], isPopular: false, prepTime: 20, tags: ['healthy'],    calories: 390 },
    { name: 'Chicken Strips',      description: 'Tender chicken strips with dipping sauce',                      price: 380, category: catMap['Chicken'], isPopular: false, prepTime: 12, tags: ['kids'],       calories: 450 },
    // Drinks
    { name: 'Fresh Lemonade',      description: 'Freshly squeezed lemon with mint and ice',                      price: 150, category: catMap['Drinks'],   isPopular: true,  prepTime: 3,  tags: ['fresh'],      calories: 95  },
    { name: 'Mango Smoothie',      description: 'Fresh mango blended with yogurt',                               price: 200, category: catMap['Drinks'],   isPopular: false, prepTime: 5,  tags: ['fresh'],      calories: 180 },
    { name: 'Soft Drink',          description: 'Pepsi, 7Up, or Mirinda — your choice',                         price: 80,  category: catMap['Drinks'],   isPopular: false, prepTime: 1,  tags: [],            calories: 140 },
    // Desserts
    { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center, served with ice cream', price: 280, category: catMap['Desserts'], isPopular: true,  isFeatured: true,  prepTime: 12, tags: ['bestseller'], calories: 480 },
    { name: 'Cheesecake',          description: 'New York style creamy cheesecake with berry compote',           price: 250, category: catMap['Desserts'], isPopular: false, prepTime: 5,  tags: [],            calories: 420 },
  ];

  await MenuItem.insertMany(items);
  console.log(`🍽️  ${items.length} menu items created`);

  console.log('\n✅ Seed complete! You can now test the API.');
  console.log('   Admin login: admin@food.com / admin123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
