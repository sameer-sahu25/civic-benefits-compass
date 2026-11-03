alter table public.schemes
  add column category text not null default 'AI & Technology',
  add column min_age int,
  add column max_age int,
  add column genders text[] not null default '{}',
  add column max_annual_income int,
  add column social_categories text[] not null default '{}',
  add column occupations text[] not null default '{}',
  add column states text[] not null default '{}',
  add column residence text not null default 'any',
  add column requires_bpl boolean not null default false,
  add column requires_disability boolean not null default false,
  add column tags text[] not null default '{}';
comment on column public.schemes.genders is 'Empty = any gender';
comment on column public.schemes.states is 'Empty = all states';