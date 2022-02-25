-- https://github.com/raevenruiz/Spotify-Library-Database/blob/main/queries%20to%20initialize%20tables/spotify%20database%20create%20tables%20v1.sql

DROP TABLE IF EXISTS music;
CREATE TABLE music (
  id integer PRIMARY KEY AUTO_INCREMENT,
  title varchar(50) NOT NULL,
  file_name varchar(100) NOT NULL,
  duration float NOT NULL,
  plays bigint NOT NULL DEFAULT 0,
  uploaded datetime DEFAULT NOW(),
  image varchar(80) DEFAULT NULL
);

-- UPDATE:
-- Had to reinsert the title column to the table on Postbird,
-- therefore the order of the musics table is as follows:
-- * id 
-- * artist_id
-- * album_id
-- * title
-- * runtime
-- * plays
-- * release_date
-- * is_explicit

--Je sais pas si on veut des artistes
-- CREATE TABLE artist (
--   id integer PRIMARY KEY,
--   name varchar(50) NOT NULL,
--   --monthly_listeners bigint,
--   followers bigint,
--   --ranking integer,
--   wiki_page varchar(100)
-- );

DROP TABLE IF EXISTS album;
CREATE TABLE album (
  id integer PRIMARY KEY AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  genre varchar(50) NOT NULL,
  release_date date NOT NULL,
  cover varchar(100) DEFAULT NULL,
);

ALTER TABLE music
ADD COLUMN user_id integer REFERENCES user(id);
ALTER TABLE music
ADD COLUMN album_id integer REFERENCES album(id);
ALTER TABLE album
ADD COLUMN user_id integer REFERENCES user(id);

DROP TABLE IF EXISTS user;
CREATE TABLE user (
  id integer PRIMARY KEY AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  email varchar(50) NOT NULL,
  image varchar(120) DEFAULT NULL,
  password varchar(120) NOT NULL,
  followers integer DEFAULT 0,
  following integer DEFAULT 0,
  signed_up datetime DEFAULT NOW()
);

DROP TABLE IF EXISTS playlist;
CREATE TABLE playlist (
	id integer PRIMARY KEY AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  description varchar(200) NOT NULL,
  followers integer DEFAULT 0
);

DROP TABLE IF EXISTS users_playlists;
CREATE TABLE users_playlists (
  user_id integer REFERENCES user(id),
  playlist_id integer REFERENCES playlist(id),
	PRIMARY KEY (user_id, playlist_id)
);

DROP TABLE IF EXISTS playlists_music;
CREATE TABLE playlists_music (
  music_id integer REFERENCES music(id),
  playlist_id integer REFERENCES playlist(id),
  PRIMARY KEY (music_id, playlist_id)
);

-- On pourrait peut-être mettre l'option de podcast mais je suis pas tant down
-- CREATE TABLE podcast (
-- 	id INTEGER PRIMARY KEY,
--   name varchar(50) NOT NULL,
--   host varchar(50) NOT NULL,
--   about varchar(1000),
--   category varchar(50) NOT NULL
-- );

-- CREATE TABLE podcast_episode (
--   id integer PRIMARY KEY,
--   title varchar(100) NOT NULL,
--   podcast_id integer REFERENCES podcast(id),
--   description varchar(1000),
--   runtime_mins integer,
--   release_date date NOT NULL
-- );



