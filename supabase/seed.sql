-- SimRacer Hub — Game Seed Data
insert into public.srh_games (name, slug, description, platform) values
  ('iRacing', 'iracing', 'The premier subscription-based online racing simulator. Features laser-scanned tracks and a structured license system.', 'PC'),
  ('Assetto Corsa Competizione', 'acc', 'Official Blancpain GT Series simulator. Unmatched tyre model and GT3/GT4 physics, beautiful Unreal Engine 4 visuals.', 'PC / Console'),
  ('rFactor 2', 'rfactor2', 'Deep physics and modding platform. Features dynamic rubber, live track, and a rich modding community.', 'PC'),
  ('Automobilista 2', 'automobilista2', 'Brazilian motorsport powerhouse built on Madness Engine. Covers Formula series, GT, stock cars, and more.', 'PC'),
  ('F1 24', 'f1-24', 'EA Sports official Formula 1 game. My Team career, full 2024 season, and accessible online multiplayer.', 'PC / Console'),
  ('Gran Turismo 7', 'gran-turismo-7', 'Sony''s flagship racing title with an enormous car list, stunning visuals, and the legendary GT Sport license system.', 'Console'),
  ('RaceRoom Racing Experience', 'raceroom', 'Free-to-play PC sim featuring ADAC, DTM, and various official championships with outstanding sound design.', 'PC')
on conflict (slug) do nothing;
