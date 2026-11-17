ALTER TABLE public.classes DROP CONSTRAINT classes_level_check;
ALTER TABLE public.classes ADD CONSTRAINT classes_level_check CHECK (level BETWEEN 1 AND 10);