-- SimRacer Hub — Game Seed Data
insert into public.srh_games (name, slug, description, platform) values
  ('iRacing', 'iracing', 'The premier subscription-based online racing simulator. Features laser-scanned tracks and a structured license system.', 'PC'),
  ('Assetto Corsa EVO', 'ac-evo', 'Kunos Simulazioni''s next-generation sim. Laser-scanned tracks, a living open-world map, and the celebrated AC physics evolved.', 'PC'),
  ('Assetto Corsa Competizione', 'acc', 'Official Blancpain GT Series simulator. Unmatched tyre model and GT3/GT4 physics, beautiful Unreal Engine 4 visuals.', 'PC / Console'),
  ('Le Mans Ultimate', 'lemans-ultimate', 'The official game of the FIA WEC and 24 Hours of Le Mans. Hypercars, endurance racing, and rFactor 2 DNA from Studio 397.', 'PC'),
  ('F1 26', 'f1-26', 'EA Sports'' official Formula 1 game. Full 2026 season with the new regulations era, My Team career, and accessible online multiplayer.', 'PC / Console'),
  ('Gran Turismo 7', 'gran-turismo-7', 'Sony''s flagship racing title with an enormous car list, stunning visuals, and the legendary GT Sport license system.', 'Console'),
  ('Forza Motorsport', 'forza-motorsport', 'Turn 10''s flagship circuit racer. Huge car list, dynamic time of day, and approachable-yet-deep handling on PC and Xbox.', 'PC / Console'),
  ('Automobilista 2', 'automobilista2', 'Brazilian motorsport powerhouse built on Madness Engine. Covers Formula series, GT, stock cars, and more.', 'PC'),
  ('rFactor 2', 'rfactor2', 'Deep physics and modding platform. Features dynamic rubber, live track, and a rich modding community.', 'PC'),
  ('EA Sports WRC', 'ea-wrc', 'The official World Rally Championship game built on DiRT Rally DNA. Full WRC calendar, stage degradation, and hardcore rally handling.', 'PC / Console'),
  ('RaceRoom Racing Experience', 'raceroom', 'Free-to-play PC sim featuring ADAC, DTM, and various official championships with outstanding sound design.', 'PC')
on conflict (slug) do nothing;
