-- Ticket icons only need to vary by ticket type (black/STK), not by individual source —
-- all sources of the same ticket type grant the same item. Renaming while the table is
-- still empty (created in 0023, nothing uploaded yet) rather than keeping the more granular
-- per-source shape.

alter table public.ticket_source_images rename to ticket_type_images;
alter table public.ticket_type_images rename column source_id to ticket_type;

alter table public.ticket_type_images
  add constraint ticket_type_images_ticket_type_check check (ticket_type in ('black', 'stk'));
