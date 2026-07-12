-- Seeds the one fully-authored character (Atomic Samurai) so the site isn't empty
-- after connecting to a fresh Supabase project. Run after 0001_create_characters.sql.

insert into public.characters (
  id, name, slug, image, rarity, type, faction, rank, role, tags,
  skills, passive, awakenings, strengths, weaknesses, recommended_usage,
  release_version, release_status
) values (
  'atomic-samurai',
  'Atomic Samurai',
  'atomic-samurai',
  '/characters/atomic-samurai/portrait.png',
  'UR+',
  'Duelist',
  'Hero',
  'S-1',
  'DPS',
  array['Hero', 'Swordsman', 'S-Class'],
  jsonb_build_array(
    jsonb_build_object(
      'name', 'Double Slash',
      'description', 'Deals a 2-hit combo to a single target, each hit dealing 120% ATK DMG.',
      'skillType', 'Attack',
      'cost', 'None',
      'image', '/characters/atomic-samurai/skill-1.png'
    ),
    jsonb_build_object(
      'name', 'Sword Aura Unleashed',
      'description', 'Atomic Samurai unleashes 30 slashes. Each CRIT slash reduces all enemies'' [Total DMG Reduction] by 1%. Then delivers a powerful slash, dealing 5000% ATK as [Specialized Direct DMG] to all enemies [only affected by Advanced DMG modifiers]. Ignores 45% [Specialized Evasion] and [Non-Crit DMG Reduction], and pierces [Unyielding] and [Specialized Unyielding]. On the first Ultimate cast, additionally removes 100% of all enemies'' [Specialized HP].',
      'upgradedDescription', 'Atomic Samurai unleashes 50 slashes. Each CRIT slash reduces all enemies'' [Total DMG Reduction] by 1%. Then delivers a powerful slash, dealing 7000% ATK as [Specialized Direct DMG] to all enemies [only affected by Advanced DMG modifiers]. Ignores 80% [Specialized Evasion] and [Non-Crit DMG Reduction], and pierces [Unyielding] and [Specialized Unyielding]. On the first Ultimate cast, additionally removes 150% of all enemies'' [Specialized HP].',
      'skillType', 'Ultimate',
      'cost', '2 Energy',
      'image', '/characters/atomic-samurai/skill-2.png'
    )
  ),
  jsonb_build_object(
    'name', 'Supreme Sword',
    'description', 'At battle start, gains 60% [Non-Crit DMG Reduction]. Removes [Suppression Boost] and [Suppression Guard] from all enemies. When dealing [Specialized Direct DMG], ignores 40% of the enemy''s [Crit Resistance].',
    'goldDescription', 'At battle start, gains 70% [Non-Crit DMG Reduction]. Removes [Suppression Boost] and [Suppression Guard] from all enemies. When dealing [Specialized Direct DMG], ignores 70% of the enemy''s [Crit Resistance].',
    'purpleDescription', 'At battle start, gains 80% [Non-Crit DMG Reduction]. Removes [Suppression Boost] and [Suppression Guard] from all enemies. When dealing [Specialized Direct DMG], ignores 80% of the enemy''s [Crit Resistance].',
    'image', '/characters/atomic-samurai/passive.png'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'tier', 1,
      'name', 'First Strike',
      'description', 'On entry, gains 20% [Specialized Speed]. When receiving DMG, has a chance to reduce the DMG taken by 40% [The activation chance equals 2x current Crit Rate]. If this unit is one of the first two allies to act, gains 30% [Crit Rate] and 50% [Crit DMG].',
      'requirement', 'Requires Awakening materials',
      'image', '/characters/atomic-samurai/awaken-1.png'
    )
  ),
  array[
    'Consistently acts first, denying enemy setup',
    'Excellent burst against unprepared enemy teams',
    'Reliable critical damage output'
  ],
  array[
    'Value drops sharply against teams with speed-manipulation',
    'Relatively low base HP',
    'Less effective once the early-turn advantage is lost'
  ],
  'Use Atomic Samurai to punish enemy teams before they can set up shields or buffs — his speed lets him strike first almost every fight.',
  '1.0',
  'Released'
)
on conflict (id) do nothing;

-- Seeds the current month's CN/SEA release schedule (1 Debut + 1 Comeback per server),
-- matching the pattern shown on the homepage's "Upcoming on CN & SEA" showcase.
-- Run after 0004_create_release_schedule.sql.
insert into public.release_schedule (id, month, year, server, character_id, release_type, timing, status)
values
  ('cn-2026-07-debut', 7, 2026, 'CN', 'atomic-samurai', 'Debut', 'Start of Month', 'Released'),
  ('cn-2026-07-comeback', 7, 2026, 'CN', 'atomic-samurai', 'Comeback', 'Mid Month', 'Upcoming'),
  ('sea-2026-07-debut', 7, 2026, 'SEA', 'atomic-samurai', 'Debut', 'Start of Month', 'Upcoming'),
  ('sea-2026-07-comeback', 7, 2026, 'SEA', 'atomic-samurai', 'Comeback', 'Mid Month', 'Upcoming')
on conflict (id) do nothing;

-- Seeds the same placeholder Game Updates feed that previously lived in
-- src/data/gameUpdates.ts (now Supabase-backed) so /updates isn't empty on a fresh
-- project. Run after 0005_create_game_updates.sql.
insert into public.game_updates (id, slug, category, server, date, title, description, image, events)
values
  (
    'update-2026-07-10-maintenance',
    'bao-tri-may-chu-sea-15-07',
    'Maintenance',
    'SEA',
    '2026-07-10',
    'Bảo trì định kỳ máy chủ SEA — 15/07',
    'Máy chủ SEA sẽ tạm ngưng hoạt động để bảo trì định kỳ. Người chơi đăng nhập trong thời gian bảo trì sẽ nhận quà đền bù.',
    null,
    null
  ),
  (
    'update-2026-07-08-cn-news',
    'cn-cap-nhat-26-14-som-hon-du-kien',
    'CnNews',
    'CN',
    '2026-07-08',
    'CN Server nhận bản cập nhật 26.14 sớm hơn dự kiến',
    'Phiên bản 26.14 vừa lên lịch tại máy chủ Trung Quốc, sớm hơn 1 tuần so với dự kiến ban đầu. Cùng điểm qua những gì sắp đến với SEA & Global.',
    null,
    null
  ),
  (
    'update-2026-07-01-events',
    'lich-su-kien-dau-thang-7',
    'Event',
    null,
    '2026-07-01',
    'Lịch sự kiện đầu tháng 7 (1/7 – 21/7)',
    'Tổng hợp toàn bộ sự kiện, banner triệu hồi và ưu đãi diễn ra từ đầu đến giữa tháng 7 — bấm vào để xem chi tiết từng mốc thời gian.',
    null,
    jsonb_build_array(
      jsonb_build_object('dateRange', '1/7 – 4/7', 'title', 'Kế hoạch Nâng cấp (Upgrade Plan)'),
      jsonb_build_object('dateRange', '1/7 – 4/7', 'title', 'Boss rớt đồ x2 (Boss Double Drop)'),
      jsonb_build_object('dateRange', '1/7 – 12/7', 'title', 'Triệu hồi Giới hạn / Thử vai', 'note', 'UR+ Atomic Samurai'),
      jsonb_build_object('dateRange', '4/7 – 11/7', 'title', 'Cửa hàng Bí ẩn (Mystery Store)', 'note', 'UR Pig God[f], UR Atomic Samurai[f]'),
      jsonb_build_object('dateRange', '5/7 – 8/7', 'title', 'Tăng gấp đôi rớt Tinh Thông', 'note', 'Duelist, Hero'),
      jsonb_build_object('dateRange', '5/7 – 10/7', 'title', 'Star Wish Rush', 'note', 'Parts Supply — Eccentric, Drive Telekinetic, Brutal'),
      jsonb_build_object('dateRange', '6/7 – 9/7', 'title', 'Thử thách Core (Core Trial)'),
      jsonb_build_object('dateRange', '6/7 – 12/7', 'title', 'Thẻ 7 ngày', 'note', 'Summer Plan'),
      jsonb_build_object('dateRange', '6/7 – 12/7', 'title', 'Triệu hồi Tinh Nhuệ Đặc Biệt', 'note', 'Gale Wind'),
      jsonb_build_object('dateRange', '7/7 – 13/7', 'title', 'Triệu hồi Độc quyền', 'note', 'Vật kỷ niệm: UR+ Atomic Samurai'),
      jsonb_build_object('dateRange', '10/7 – 13/7', 'title', 'Ưu đãi Rương / Hộp Bất ngờ'),
      jsonb_build_object('dateRange', '10/7 – 16/7', 'title', 'Nhà Điều Ước (House of Wishes)'),
      jsonb_build_object('dateRange', '12/7 – 17/7', 'title', 'Lợi ích Nhân đôi', 'note', 'Nhiệm vụ ngày + Thử vai'),
      jsonb_build_object('dateRange', '12/7 – 14/7', 'title', 'Hộp quà Tuyển chọn (Selection Giftbox)'),
      jsonb_build_object('dateRange', '12/7 – 17/7', 'title', 'Star Wish Rush', 'note', 'Calm, Cruel, Defense, Assist'),
      jsonb_build_object('dateRange', '13/7 – 19/7', 'title', 'Triệu hồi Độc quyền', 'note', 'Vật kỷ niệm: Hellfire Flame'),
      jsonb_build_object('dateRange', '15/7 – 21/7', 'title', 'Triệu hồi Giới hạn / Thử vai', 'note', 'UR+ Tornado'),
      jsonb_build_object('dateRange', '15/7 – 21/7', 'title', 'Thưởng Tổng nạp (Total Top-up Rewards)')
    )
  ),
  (
    'update-2026-06-28-balance',
    'cap-nhat-26-13-can-bang-duelist',
    'Update',
    null,
    '2026-06-28',
    'Ghi chú cập nhật 26.13: cân bằng lại nhóm Duelist',
    'Điều chỉnh chỉ số sát thương và thời gian hồi chiêu cho nhóm Duelist, trong đó Atomic Samurai nhận buff đáng chú ý ở chiêu cuối.',
    '/characters/atomic-samurai/portrait.png',
    null
  ),
  (
    'update-2026-06-20-cn-leak',
    'ro-ri-cn-nhan-vat-moi-global',
    'CnNews',
    'CN',
    '2026-06-20',
    'Rò rỉ từ CN: nhân vật mới sắp ra mắt trên Global',
    'Dữ liệu client tại máy chủ CN hé lộ một vài gương mặt mới có thể xuất hiện ở SEA & Global trong các bản cập nhật tới.',
    null,
    null
  ),
  (
    'update-2026-06-15-anniversary',
    'chuoi-su-kien-sinh-nhat-1-nam',
    'Event',
    null,
    '2026-06-15',
    'Chuỗi sự kiện mừng sinh nhật 1 năm',
    'Đăng nhập mỗi ngày để nhận quà, cùng loạt banner triệu hồi tỉ lệ tăng mừng cột mốc 1 năm ra mắt.',
    null,
    null
  ),
  (
    'update-2026-06-10-core-lab',
    'can-bang-core-lab-phong-thu',
    'Update',
    null,
    '2026-06-10',
    'Cân bằng Core-Lab: điều chỉnh chỉ số phòng thủ',
    'Giảm nhẹ hiệu quả cộng dồn của các core phòng thủ bậc cao, đồng thời tăng tốc độ hồi tài nguyên nâng cấp hằng ngày.',
    null,
    null
  )
on conflict (id) do nothing;
