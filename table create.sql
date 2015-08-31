CREATE TABLE Image
(
  id  serial PRIMARY KEY,
  title TEXT 
);


CREATE TABLE Article(
  id  serial PRIMARY KEY,
  title character varying(1000) NOT NULL,
  image_id integer NOT NULL,
  description character varying(1000) NOT NULL,
  CONSTRAINT fk_imgId FOREIGN KEY (image_id)
  REFERENCES Image (id) MATCH SIMPLE
);


CREATE TABLE ArticleContent
(
id  serial PRIMARY KEY,
  article_id integer NOT NULL,
   content TEXT ,
  CONSTRAINT fk_article FOREIGN KEY (article_id)
      REFERENCES Article (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
);

