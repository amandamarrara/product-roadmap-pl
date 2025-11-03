-- Create roadmap_shares table
create table public.roadmap_shares (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  shared_with_email text not null,
  shared_with_user_id uuid,
  permission text not null check (permission in ('viewer', 'editor')),
  shared_by_user_id uuid not null,
  invite_token text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(roadmap_id, shared_with_email)
);

-- Indexes for performance
create index idx_roadmap_shares_roadmap on roadmap_shares(roadmap_id);
create index idx_roadmap_shares_email on roadmap_shares(shared_with_email);
create index idx_roadmap_shares_user on roadmap_shares(shared_with_user_id);
create index idx_roadmap_shares_token on roadmap_shares(invite_token);

-- Enable RLS
alter table roadmap_shares enable row level security;

-- Owners can view shares of their roadmaps
create policy "Owners can view shares of their roadmaps"
on roadmap_shares for select
using (
  shared_by_user_id = auth.uid()
  or shared_with_user_id = auth.uid()
  or shared_with_email = (select email from auth.users where id = auth.uid())
);

-- Owners can create shares
create policy "Owners can create shares"
on roadmap_shares for insert
with check (
  exists (
    select 1 from roadmaps
    where id = roadmap_id
    and user_id = auth.uid()
  )
);

-- Owners can delete shares
create policy "Owners can delete shares"
on roadmap_shares for delete
using (
  exists (
    select 1 from roadmaps
    where id = roadmap_id
    and user_id = auth.uid()
  )
);

-- Owners can update shares
create policy "Owners can update shares"
on roadmap_shares for update
using (
  exists (
    select 1 from roadmaps
    where id = roadmap_id
    and user_id = auth.uid()
  )
);

-- Update roadmaps policies to allow viewing shared roadmaps
drop policy if exists "Users can view their own roadmaps" on roadmaps;

create policy "Users can view their own or shared roadmaps"
on roadmaps for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares
    where roadmap_id = roadmaps.id
    and (
      shared_with_user_id = auth.uid()
      or shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

-- Update deliveries policies
drop policy if exists "Users can view their own deliveries" on deliveries;

create policy "Users can view their own or shared deliveries"
on deliveries for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    where rs.roadmap_id = deliveries.roadmap_id
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

create policy "Editors can modify shared deliveries"
on deliveries for update
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    where rs.roadmap_id = deliveries.roadmap_id
    and rs.permission = 'editor'
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

create policy "Editors can create shared deliveries"
on deliveries for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    where rs.roadmap_id = deliveries.roadmap_id
    and rs.permission = 'editor'
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

create policy "Editors can delete shared deliveries"
on deliveries for delete
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    where rs.roadmap_id = deliveries.roadmap_id
    and rs.permission = 'editor'
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

-- Update sub_deliveries policies
drop policy if exists "Users can view their own sub_deliveries" on sub_deliveries;

create policy "Users can view their own or shared sub_deliveries"
on sub_deliveries for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    join deliveries d on d.roadmap_id = rs.roadmap_id
    where d.id = sub_deliveries.delivery_id
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

create policy "Editors can modify shared sub_deliveries"
on sub_deliveries for update
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    join deliveries d on d.roadmap_id = rs.roadmap_id
    where d.id = sub_deliveries.delivery_id
    and rs.permission = 'editor'
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

create policy "Editors can create shared sub_deliveries"
on sub_deliveries for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    join deliveries d on d.roadmap_id = rs.roadmap_id
    where d.id = sub_deliveries.delivery_id
    and rs.permission = 'editor'
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

create policy "Editors can delete shared sub_deliveries"
on sub_deliveries for delete
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    join deliveries d on d.roadmap_id = rs.roadmap_id
    where d.id = sub_deliveries.delivery_id
    and rs.permission = 'editor'
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

-- Update milestones policies
drop policy if exists "Users can view their own milestones" on milestones;

create policy "Users can view their own or shared milestones"
on milestones for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    where rs.roadmap_id = milestones.roadmap_id
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

create policy "Editors can modify shared milestones"
on milestones for update
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    where rs.roadmap_id = milestones.roadmap_id
    and rs.permission = 'editor'
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

create policy "Editors can create shared milestones"
on milestones for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    where rs.roadmap_id = milestones.roadmap_id
    and rs.permission = 'editor'
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

create policy "Editors can delete shared milestones"
on milestones for delete
using (
  user_id = auth.uid()
  or exists (
    select 1 from roadmap_shares rs
    where rs.roadmap_id = milestones.roadmap_id
    and rs.permission = 'editor'
    and (
      rs.shared_with_user_id = auth.uid()
      or rs.shared_with_email = (select email from auth.users where id = auth.uid())
    )
  )
);

-- Helper functions
create or replace function public.get_user_roadmap_role(
  _roadmap_id uuid,
  _user_id uuid
)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select case
    when exists (
      select 1 from roadmaps
      where id = _roadmap_id and user_id = _user_id
    ) then 'owner'
    when exists (
      select 1 from roadmap_shares rs
      join auth.users u on u.id = _user_id
      where rs.roadmap_id = _roadmap_id
      and rs.permission = 'editor'
      and (rs.shared_with_user_id = _user_id or rs.shared_with_email = u.email)
    ) then 'editor'
    when exists (
      select 1 from roadmap_shares rs
      join auth.users u on u.id = _user_id
      where rs.roadmap_id = _roadmap_id
      and (rs.shared_with_user_id = _user_id or rs.shared_with_email = u.email)
    ) then 'viewer'
    else 'none'
  end;
$$;

-- Function to link shares to users when they sign up
create or replace function public.link_share_to_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update roadmap_shares
  set shared_with_user_id = new.id
  where shared_with_email = new.email
  and shared_with_user_id is null;
  
  return new;
end;
$$;

-- Trigger to link shares when user is created
create trigger on_user_created_link_shares
  after insert on auth.users
  for each row execute function public.link_share_to_user();

-- Trigger for updated_at
create trigger update_roadmap_shares_updated_at
  before update on roadmap_shares
  for each row execute function public.update_updated_at_column();