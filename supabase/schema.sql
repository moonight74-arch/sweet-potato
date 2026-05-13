-- =============================================
-- 고구마마켓 DB 스키마
-- Supabase SQL Editor에서 전체 실행
-- =============================================

-- ① profiles (사용자 프로필)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text not null,
  avatar_url  text,
  location    text,
  created_at  timestamptz not null default now()
);

-- ② products (상품)
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  description  text not null,
  price        integer not null check (price >= 0),
  category     text not null,
  location     text not null,
  image_url    text,
  status       text not null default '판매중' check (status in ('판매중','예약중','판매완료')),
  view_count   integer not null default 0,
  like_count   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ③ likes (찜하기)
create table public.likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ④ chat_rooms (채팅방)
create table public.chat_rooms (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  buyer_id    uuid not null references public.profiles(id) on delete cascade,
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (product_id, buyer_id)
);

-- ⑤ messages (채팅 메시지)
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- =============================================
-- 인덱스
-- =============================================
create index on public.products(seller_id);
create index on public.products(category);
create index on public.products(created_at desc);
create index on public.likes(user_id);
create index on public.likes(product_id);
create index on public.messages(room_id, created_at);

-- =============================================
-- updated_at 자동 갱신 트리거
-- =============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- =============================================
-- like_count 자동 동기화 트리거
-- =============================================
create or replace function public.sync_like_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.products set like_count = like_count + 1 where id = new.product_id;
  elsif tg_op = 'DELETE' then
    update public.products set like_count = like_count - 1 where id = old.product_id;
  end if;
  return null;
end;
$$;

create trigger likes_sync_count
  after insert or delete on public.likes
  for each row execute function public.sync_like_count();

-- =============================================
-- 신규 유저 가입 시 profiles 자동 생성
-- =============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- Row Level Security (RLS)
-- =============================================
alter table public.profiles  enable row level security;
alter table public.products  enable row level security;
alter table public.likes     enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.messages  enable row level security;

-- profiles
create policy "프로필 전체 조회" on public.profiles for select using (true);
create policy "본인 프로필 수정" on public.profiles for update using (auth.uid() = id);

-- products
create policy "상품 전체 조회" on public.products for select using (true);
create policy "로그인 사용자 상품 등록" on public.products for insert with check (auth.uid() = seller_id);
create policy "판매자 상품 수정" on public.products for update using (auth.uid() = seller_id);
create policy "판매자 상품 삭제" on public.products for delete using (auth.uid() = seller_id);

-- likes
create policy "본인 찜 조회" on public.likes for select using (auth.uid() = user_id);
create policy "찜 추가" on public.likes for insert with check (auth.uid() = user_id);
create policy "찜 삭제" on public.likes for delete using (auth.uid() = user_id);

-- chat_rooms
create policy "채팅방 조회 (참여자)" on public.chat_rooms for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "채팅방 생성" on public.chat_rooms for insert
  with check (auth.uid() = buyer_id);

-- messages
create policy "메시지 조회 (참여자)" on public.messages for select
  using (
    exists (
      select 1 from public.chat_rooms r
      where r.id = room_id
        and (r.buyer_id = auth.uid() or r.seller_id = auth.uid())
    )
  );
create policy "메시지 전송" on public.messages for insert
  with check (auth.uid() = sender_id);

-- =============================================
-- Storage 버킷 (상품 이미지)
-- =============================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

create policy "이미지 전체 조회" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "로그인 사용자 이미지 업로드" on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "본인 이미지 삭제" on storage.objects for delete
  using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);
