-- https://github.com/raevenruiz/Spotify-Library-Database/blob/main/queries%20to%20initialize%20tables/spotify%20database%20create%20tables%20v1.sql

DROP TABLE IF EXISTS song;
CREATE TABLE song (
  id integer PRIMARY KEY AUTO_INCREMENT,
  title varchar(50) NOT NULL,
  runtime integer NOT NULL,
  plays bigint NOT NULL,
  uploaded date NOT NULL
);

-- UPDATE:
-- Had to reinsert the title column to the table on Postbird,
-- therefore the order of the songs table is as follows:
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
  --music_label varchar(100) NOT NULL,
  --release_date date NOT NULL
);

ALTER TABLE song
ADD COLUMN artist_id integer REFERENCES artist(id);
ALTER TABLE song
ADD COLUMN album_id integer REFERENCES album(id);
ALTER TABLE album
ADD COLUMN artist_id integer REFERENCES artist(id);

DROP TABLE IF EXISTS user;
CREATE TABLE user (
  id integer PRIMARY KEY AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  email varchar(50) NOT NULL,
  password varchar(120) NOT NULL,
  followers integer DEFAULT 0,
  following integer DEFAULT 0,
  signed_up date DEFAULT CURRENT_DATE()
);

DROP TABLE IF EXISTS playlist;
CREATE TABLE playlist (
	id integer PRIMARY KEY AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  description varchar(200) NOT NULL,
  followers integer
);

DROP TABLE IF EXISTS users_playlists;
CREATE TABLE users_playlists (
  user_id integer REFERENCES user(id),
  playlist_id integer REFERENCES playlist(id),
	PRIMARY KEY (user_id, playlist_id)
);

DROP TABLE IF EXISTS playlists_songs;
CREATE TABLE playlists_songs (
  song_id integer REFERENCES song(id),
  playlist_id integer REFERENCES playlist(id),
  PRIMARY KEY (song_id, playlist_id)
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



