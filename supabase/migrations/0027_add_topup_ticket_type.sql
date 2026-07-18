-- The floating Top Up button's icon is managed from the same admin panel as the
-- black/STK ticket icons (ticket_type_images), rather than being a hardcoded icon.
alter table public.ticket_type_images
  drop constraint ticket_type_images_ticket_type_check;

alter table public.ticket_type_images
  add constraint ticket_type_images_ticket_type_check check (ticket_type in ('black', 'stk', 'topup'));
