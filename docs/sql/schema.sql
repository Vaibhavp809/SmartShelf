create table if not exists users (
    id bigint primary key auto_increment,
    full_name varchar(80) not null,
    email varchar(120) not null unique,
    password varchar(255) not null,
    role varchar(20) not null,
    created_at timestamp not null default current_timestamp
);

create table if not exists books (
    id bigint primary key auto_increment,
    google_book_id varchar(120) not null unique,
    title varchar(255) not null,
    authors varchar(255),
    category varchar(120),
    description text,
    thumbnail_url varchar(500),
    preview_link varchar(300),
    published_date varchar(40),
    created_at timestamp not null default current_timestamp
);

create table if not exists user_books (
    id bigint primary key auto_increment,
    user_id bigint not null,
    book_id bigint not null,
    status varchar(20) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_user_books_user foreign key (user_id) references users(id) on delete cascade,
    constraint fk_user_books_book foreign key (book_id) references books(id) on delete cascade,
    constraint uk_user_book_status unique (user_id, book_id, status)
);

create table if not exists reviews (
    id bigint primary key auto_increment,
    user_id bigint not null,
    book_id bigint not null,
    rating int not null,
    comment varchar(2000) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_reviews_user foreign key (user_id) references users(id) on delete cascade,
    constraint fk_reviews_book foreign key (book_id) references books(id) on delete cascade,
    constraint uk_user_review_book unique (user_id, book_id)
);

