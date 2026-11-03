create type public.app_role as enum ('admin','gov_officer','citizen');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.is_gov(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','gov_officer')) $$;

-- Demo: every signup gets citizen + gov_officer so the prototype can be explored; first user is admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  insert into public.user_roles(user_id, role) values (new.id, 'citizen'), (new.id, 'gov_officer') on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null check (level in ('central','state')),
  state_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.departments to authenticated;
grant all on public.departments to service_role;
alter table public.departments enable row level security;
create policy "gov read departments" on public.departments for select to authenticated using (public.is_gov(auth.uid()));
create policy "admin manage departments" on public.departments for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.ai_systems (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  purpose text not null default '',
  domain text not null default 'other',
  automation_level text not null default 'assistive',
  uses_personal_data boolean not null default false,
  affected_population text not null default '',
  status text not null default 'draft' check (status in ('draft','under_review','approved','suspended','retired')),
  risk_tier text check (risk_tier in ('low','medium','high','critical')),
  risk_score int,
  owner_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.ai_systems to authenticated;
grant all on public.ai_systems to service_role;
alter table public.ai_systems enable row level security;
create policy "gov all ai_systems" on public.ai_systems for all to authenticated using (public.is_gov(auth.uid())) with check (public.is_gov(auth.uid()));

create table public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  ai_system_id uuid not null references public.ai_systems(id) on delete cascade,
  answers jsonb not null default '{}',
  dimension_scores jsonb not null default '{}',
  total_score int not null,
  tier text not null,
  rationale text not null default '',
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert on public.risk_assessments to authenticated;
grant all on public.risk_assessments to service_role;
alter table public.risk_assessments enable row level security;
create policy "gov read ra" on public.risk_assessments for select to authenticated using (public.is_gov(auth.uid()));
create policy "gov insert ra" on public.risk_assessments for insert to authenticated with check (public.is_gov(auth.uid()));

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  ai_system_id uuid not null references public.ai_systems(id) on delete cascade,
  title text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  due_date date,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.findings to authenticated;
grant all on public.findings to service_role;
alter table public.findings enable row level security;
create policy "gov all findings" on public.findings for all to authenticated using (public.is_gov(auth.uid())) with check (public.is_gov(auth.uid()));

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  ai_system_id uuid references public.ai_systems(id) on delete set null,
  title text not null,
  description text not null default '',
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','investigating','resolved')),
  reported_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.incidents to authenticated;
grant all on public.incidents to service_role;
alter table public.incidents enable row level security;
create policy "gov all incidents" on public.incidents for all to authenticated using (public.is_gov(auth.uid())) with check (public.is_gov(auth.uid()));

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_events to authenticated;
grant all on public.audit_events to service_role;
alter table public.audit_events enable row level security;
create policy "gov read audit" on public.audit_events for select to authenticated using (public.is_gov(auth.uid()));
create policy "gov insert audit" on public.audit_events for insert to authenticated with check (public.is_gov(auth.uid()) and actor_id = auth.uid());

create table public.schemes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  ministry text not null,
  level text not null check (level in ('central','state')),
  state_name text,
  sector text not null,
  beneficiary_types text[] not null default '{}',
  summary text not null,
  eligibility text not null default '',
  benefits text not null default '',
  official_url text,
  last_verified date,
  is_demo boolean not null default false,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now()
);
grant select on public.schemes to anon;
grant select, insert, update on public.schemes to authenticated;
grant all on public.schemes to service_role;
alter table public.schemes enable row level security;
create policy "public read published" on public.schemes for select to anon, authenticated using (status = 'published' or public.is_gov(auth.uid()));
create policy "gov write schemes" on public.schemes for insert to authenticated with check (public.is_gov(auth.uid()));
create policy "gov update schemes" on public.schemes for update to authenticated using (public.is_gov(auth.uid()));

create table public.scheme_bookmarks (
  user_id uuid not null,
  scheme_id uuid not null references public.schemes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, scheme_id)
);
grant select, insert, delete on public.scheme_bookmarks to authenticated;
grant all on public.scheme_bookmarks to service_role;
alter table public.scheme_bookmarks enable row level security;
create policy "own bookmarks" on public.scheme_bookmarks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into public.departments (id,name,level,state_name) values
('11111111-0000-0000-0000-000000000001','Dept. of Digital Services (Demo)','central',null),
('11111111-0000-0000-0000-000000000002','State Health Mission (Demo)','state','Karnataka'),
('11111111-0000-0000-0000-000000000003','Dept. of Agriculture (Demo)','state','Maharashtra');

insert into public.ai_systems (name,department_id,purpose,domain,automation_level,uses_personal_data,affected_population,status,risk_tier,risk_score) values
('Grievance Triage Assistant','11111111-0000-0000-0000-000000000001','Classifies citizen grievances and routes them to departments','public_services','assistive',true,'Citizens filing grievances','approved','medium',42),
('TB Screening X-ray Model','11111111-0000-0000-0000-000000000002','Flags chest X-rays for possible tuberculosis','healthcare','decision_support',true,'Patients at district hospitals','under_review','high',71),
('Crop Advisory Chatbot','11111111-0000-0000-0000-000000000003','Answers farmer questions on crop care in Marathi','agriculture','assistive',false,'Farmers','approved','low',18),
('Subsidy Eligibility Scorer','11111111-0000-0000-0000-000000000001','Ranks applicants for welfare subsidy verification','welfare','automated',true,'Low-income households','draft','critical',86);

insert into public.incidents (title,description,severity,status) values
('Misrouted grievances in Hindi','Hindi grievances routed to wrong department at higher rate','medium','investigating'),
('Higher false negatives for women','Screening sensitivity lower for female patients in pilot','high','open');

insert into public.schemes (slug,title,ministry,level,state_name,sector,beneficiary_types,summary,eligibility,benefits,official_url,last_verified,is_demo) values
('indiaai-mission','IndiaAI Mission','Ministry of Electronics and IT','central',null,'Cross-sector',array['startups','researchers','institutions'],'National programme to build India''s AI ecosystem: compute, datasets, foundation models, skilling and startup financing.','Indian startups, academic and research institutions, and government bodies under specific programme pillars.','Access to subsidised GPU compute, datasets platform (AIKosh), funding calls and fellowships.','https://indiaai.gov.in/',date '2026-10-01',false),
('indiaai-fellowship','IndiaAI FutureSkills Fellowships','Ministry of Electronics and IT','central',null,'Education',array['students','researchers'],'Fellowships supporting AI study and research at undergraduate, postgraduate and PhD levels.','Students enrolled in eligible Indian institutions in AI-related programmes.','Fellowship stipends and research support.','https://indiaai.gov.in/',date '2026-10-01',false),
('aikosh','AIKosh Datasets Platform','Ministry of Electronics and IT','central',null,'Cross-sector',array['startups','researchers','students'],'Platform providing access to non-personal datasets and AI models for innovation.','Registered users including researchers, students and startups.','Free access to curated datasets, models and tools.','https://aikosh.indiaai.gov.in/',date '2026-10-01',false),
('demo-msme-ai-adoption','DEMO — MSME AI Adoption Grant','DEMO — NOT A REAL GOVERNMENT SCHEME','central',null,'Manufacturing',array['msmes'],'Fictional example: co-funding for small manufacturers adopting AI quality inspection.','Fictional: registered MSMEs with under 250 employees.','Fictional: up to 50% cost share for pilot projects.',null,null,true),
('demo-ka-health-ai','DEMO — Karnataka Health AI Pilot Fund','DEMO — NOT A REAL GOVERNMENT SCHEME','state','Karnataka','Healthcare',array['startups','institutions'],'Fictional example: grants for AI pilots in state public hospitals.','Fictional: startups partnered with a state hospital.','Fictional: pilot funding and data access under supervision.',null,null,true),
('demo-mh-agri-ai','DEMO — Maharashtra Agri-AI Challenge','DEMO — NOT A REAL GOVERNMENT SCHEME','state','Maharashtra','Agriculture',array['startups','students'],'Fictional example: innovation challenge for AI tools helping farmers.','Fictional: teams based in Maharashtra.','Fictional: prize money and incubation.',null,null,true);