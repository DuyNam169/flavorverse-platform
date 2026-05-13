export const MOCK_RECIPES = [
  {
    id: '1', title: 'Phở Bò Hà Nội', description: 'Phở bò truyền thống Hà Nội với nước dùng trong veo, thơm lừng', thumbnail_url: 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=400&q=80',
    country_code: 'VN', tags: ['Bắc', 'Sáng', 'Soup'], difficulty: 'medium', prep_time_minutes: 30, cook_time_minutes: 240, servings: 4,
    calories_per_serving: 450, protein_g: 32, carbs_g: 48, fat_g: 12, fork_count: 128, save_count: 342, avg_rating: 4.8, rating_count: 156,
    author: { id: 'u1', username: 'chef_hanoi', display_name: 'Chef Hà Nội', avatar_url: 'https://i.pravatar.cc/40?img=1' },
    season: ['all'], is_public: true
  },
  {
    id: '2', title: 'Bún Bò Huế', description: 'Bún bò Huế đặc trưng vị cay nồng của xứ Huế', thumbnail_url: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80',
    country_code: 'VN', tags: ['Trung', 'Cay', 'Soup'], difficulty: 'hard', prep_time_minutes: 45, cook_time_minutes: 180, servings: 6,
    calories_per_serving: 520, protein_g: 38, carbs_g: 52, fat_g: 16, fork_count: 87, save_count: 201, avg_rating: 4.7, rating_count: 98,
    author: { id: 'u2', username: 'hue_cuisine', display_name: 'Bếp Huế', avatar_url: 'https://i.pravatar.cc/40?img=2' },
    season: ['all'], is_public: true
  },
  {
    id: '3', title: 'Bánh Mì Sài Gòn', description: 'Bánh mì Sài Gòn giòn rụm với đủ loại nhân hấp dẫn', thumbnail_url: 'https://images.unsplash.com/photo-1600850056064-a8b380df8395?w=400&q=80',
    country_code: 'VN', tags: ['Nam', 'Ăn sáng', 'Bánh'], difficulty: 'easy', prep_time_minutes: 15, cook_time_minutes: 10, servings: 2,
    calories_per_serving: 380, protein_g: 22, carbs_g: 42, fat_g: 14, fork_count: 256, save_count: 512, avg_rating: 4.9, rating_count: 234,
    author: { id: 'u3', username: 'saigon_bites', display_name: 'Saigon Bites', avatar_url: 'https://i.pravatar.cc/40?img=3' },
    season: ['all'], is_public: true
  },
  {
    id: '4', title: 'Pad Thai', description: 'Pad Thai truyền thống Thái Lan với tôm và đậu phụ', thumbnail_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80',
    country_code: 'TH', tags: ['Thái', 'Xào', 'Mì'], difficulty: 'medium', prep_time_minutes: 20, cook_time_minutes: 15, servings: 2,
    calories_per_serving: 480, protein_g: 28, carbs_g: 58, fat_g: 16, fork_count: 192, save_count: 445, avg_rating: 4.6, rating_count: 187,
    author: { id: 'u4', username: 'thai_kitchen', display_name: 'Thai Kitchen', avatar_url: 'https://i.pravatar.cc/40?img=4' },
    season: ['all'], is_public: true
  },
  {
    id: '5', title: 'Sushi Salmon Roll', description: 'Sushi cuộn cá hồi tươi với cơm giấm Nhật', thumbnail_url: 'https://images.unsplash.com/photo-1617196034738-26c5f7c977ce?w=400&q=80',
    country_code: 'JP', tags: ['Nhật', 'Sushi', 'Hải sản'], difficulty: 'hard', prep_time_minutes: 60, cook_time_minutes: 20, servings: 4,
    calories_per_serving: 320, protein_g: 24, carbs_g: 38, fat_g: 10, fork_count: 145, save_count: 389, avg_rating: 4.8, rating_count: 142,
    author: { id: 'u5', username: 'tokyo_chef', display_name: 'Tokyo Chef', avatar_url: 'https://i.pravatar.cc/40?img=5' },
    season: ['all'], is_public: true
  },
  {
    id: '6', title: 'Gà Nướng Mật Ong', description: 'Gà nướng mật ong thơm lừng, vàng đẹp, da giòn', thumbnail_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400&q=80',
    country_code: 'VN', tags: ['Nướng', 'Gà', 'Tiệc'], difficulty: 'medium', prep_time_minutes: 30, cook_time_minutes: 50, servings: 4,
    calories_per_serving: 420, protein_g: 45, carbs_g: 18, fat_g: 20, fork_count: 98, save_count: 276, avg_rating: 4.7, rating_count: 112,
    author: { id: 'u6', username: 'grillmaster_vn', display_name: 'Grill Master', avatar_url: 'https://i.pravatar.cc/40?img=6' },
    season: ['all'], is_public: true
  },
  {
    id: '7', title: 'Pasta Carbonara', description: 'Pasta Carbonara Ý chính thống với trứng, pho mát Pecorino và guanciale', thumbnail_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80',
    country_code: 'IT', tags: ['Ý', 'Pasta', 'Châu Âu'], difficulty: 'medium', prep_time_minutes: 10, cook_time_minutes: 20, servings: 2,
    calories_per_serving: 580, protein_g: 30, carbs_g: 62, fat_g: 24, fork_count: 167, save_count: 423, avg_rating: 4.9, rating_count: 198,
    author: { id: 'u7', username: 'romano_chef', display_name: 'Romano Chef', avatar_url: 'https://i.pravatar.cc/40?img=7' },
    season: ['all'], is_public: true
  },
  {
    id: '8', title: 'Canh Chua Cá Lóc', description: 'Canh chua miền Nam thanh mát với cá lóc tươi', thumbnail_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
    country_code: 'VN', tags: ['Nam', 'Canh', 'Cá'], difficulty: 'easy', prep_time_minutes: 20, cook_time_minutes: 25, servings: 4,
    calories_per_serving: 280, protein_g: 28, carbs_g: 22, fat_g: 8, fork_count: 76, save_count: 198, avg_rating: 4.6, rating_count: 89,
    author: { id: 'u3', username: 'saigon_bites', display_name: 'Saigon Bites', avatar_url: 'https://i.pravatar.cc/40?img=3' },
    season: ['summer'], is_public: true
  },
  {
    id: '9', title: 'Kimchi Jjigae', description: 'Canh kim chi Hàn Quốc đậm đà, cay ấm bụng', thumbnail_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80',
    country_code: 'KR', tags: ['Hàn', 'Canh', 'Cay'], difficulty: 'easy', prep_time_minutes: 15, cook_time_minutes: 25, servings: 3,
    calories_per_serving: 340, protein_g: 26, carbs_g: 28, fat_g: 14, fork_count: 134, save_count: 312, avg_rating: 4.7, rating_count: 154,
    author: { id: 'u8', username: 'seoul_food', display_name: 'Seoul Food', avatar_url: 'https://i.pravatar.cc/40?img=8' },
    season: ['winter', 'fall'], is_public: true
  },
  {
    id: '10', title: 'Cơm Gà Hải Nam', description: 'Cơm gà Hải Nam mềm ngon, nước chấm gừng đặc trưng', thumbnail_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
    country_code: 'SG', tags: ['Hải Nam', 'Cơm', 'Gà'], difficulty: 'medium', prep_time_minutes: 20, cook_time_minutes: 40, servings: 4,
    calories_per_serving: 460, protein_g: 38, carbs_g: 48, fat_g: 14, fork_count: 112, save_count: 287, avg_rating: 4.8, rating_count: 134,
    author: { id: 'u9', username: 'asian_fusion', display_name: 'Asian Fusion', avatar_url: 'https://i.pravatar.cc/40?img=9' },
    season: ['all'], is_public: true
  },
  {
    id: '11', title: 'Bánh Xèo Miền Trung', description: 'Bánh xèo giòn rụm nhân tôm thịt, chấm mắm pha chua ngọt', thumbnail_url: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80',
    country_code: 'VN', tags: ['Trung', 'Chiên', 'Đặc sản'], difficulty: 'medium', prep_time_minutes: 30, cook_time_minutes: 20, servings: 4,
    calories_per_serving: 390, protein_g: 24, carbs_g: 42, fat_g: 16, fork_count: 89, save_count: 234, avg_rating: 4.6, rating_count: 102,
    author: { id: 'u2', username: 'hue_cuisine', display_name: 'Bếp Huế', avatar_url: 'https://i.pravatar.cc/40?img=2' },
    season: ['all'], is_public: true
  },
  {
    id: '12', title: 'Tacos al Pastor', description: 'Tacos Mexico kiểu truyền thống với thịt lợn ướp gia vị đặc biệt', thumbnail_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
    country_code: 'MX', tags: ['Mexico', 'Tacos', 'Châu Mỹ'], difficulty: 'hard', prep_time_minutes: 45, cook_time_minutes: 30, servings: 4,
    calories_per_serving: 490, protein_g: 34, carbs_g: 44, fat_g: 20, fork_count: 78, save_count: 201, avg_rating: 4.7, rating_count: 87,
    author: { id: 'u10', username: 'mexico_flavors', display_name: 'Mexico Flavors', avatar_url: 'https://i.pravatar.cc/40?img=10' },
    season: ['all'], is_public: true
  },
]

export const MOCK_USER = {
  id: 'me',
  username: 'foodlover_vn',
  display_name: 'Bạn Yêu Bếp',
  avatar_url: 'https://i.pravatar.cc/40?img=20',
  bio: 'Yêu nấu ăn và khám phá ẩm thực thế giới 🌍',
  location: 'Hanoi, VN',
  country_code: 'VN',
  calorie_goal: 2000,
  diet_type: 'normal',
  allergies: [],
  followers_count: 128,
  following_count: 87,
  recipe_count: 12,
}

export const MEAL_PLAN_MOCK = {
  week: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
  meals: {
    0: { breakfast: MOCK_RECIPES[0], lunch: MOCK_RECIPES[3], dinner: MOCK_RECIPES[5] },
    1: { breakfast: null, lunch: MOCK_RECIPES[1], dinner: MOCK_RECIPES[6] },
    2: { breakfast: MOCK_RECIPES[2], lunch: MOCK_RECIPES[7], dinner: MOCK_RECIPES[8] },
    3: { breakfast: null, lunch: MOCK_RECIPES[4], dinner: MOCK_RECIPES[9] },
    4: { breakfast: MOCK_RECIPES[2], lunch: MOCK_RECIPES[10], dinner: MOCK_RECIPES[0] },
    5: { breakfast: null, lunch: MOCK_RECIPES[11], dinner: MOCK_RECIPES[3] },
    6: { breakfast: null, lunch: MOCK_RECIPES[5], dinner: MOCK_RECIPES[6] },
  }
}

export const SHOPPING_LIST = [
  { category: '🥩 Thịt & Hải sản', items: [
    { name: 'Xương bò', amount: '1kg', checked: false },
    { name: 'Thịt bò tái', amount: '500g', checked: true },
    { name: 'Tôm tươi', amount: '300g', checked: false },
    { name: 'Cá lóc', amount: '600g', checked: false },
  ]},
  { category: '🥬 Rau củ', items: [
    { name: 'Giá đỗ', amount: '200g', checked: false },
    { name: 'Hành lá', amount: '1 bó', checked: true },
    { name: 'Rau thơm', amount: '1 bó', checked: false },
    { name: 'Cà chua', amount: '3 trái', checked: false },
  ]},
  { category: '🌾 Tinh bột', items: [
    { name: 'Bánh phở', amount: '600g', checked: false },
    { name: 'Bún tươi', amount: '400g', checked: false },
    { name: 'Gạo Jasmine', amount: '1kg', checked: true },
  ]},
  { category: '🧂 Gia vị', items: [
    { name: 'Nước mắm', amount: '1 chai', checked: false },
    { name: 'Quế', amount: '2 thanh', checked: false },
    { name: 'Hoa hồi', amount: '5 cái', checked: false },
  ]},
]
