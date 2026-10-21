CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  blood_type text,
  allergies text,
  home_address text,
  plan text NOT NULL DEFAULT 'free',
  trial_ends_at timestamptz,
  safe_code text,
  duress_code text,
  ai_credits_used integer NOT NULL DEFAULT 0,
  ai_credits_day date NOT NULL DEFAULT (now() at time zone 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- users cannot change plan or credits themselves
CREATE OR REPLACE FUNCTION public.protect_profile_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('app.bypass', true) = 'on' THEN RETURN NEW; END IF;
  IF auth.role() = 'authenticated' THEN
    NEW.plan := OLD.plan; NEW.trial_ends_at := OLD.trial_ends_at;
    NEW.ai_credits_used := OLD.ai_credits_used; NEW.ai_credits_day := OLD.ai_credits_day;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_protect BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- plan helper
CREATE OR REPLACE FUNCTION public.effective_plan(_uid uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN p.plan IN ('premium','founding') THEN 'premium'
    WHEN p.plan = 'trial' AND p.trial_ends_at > now() THEN 'trial'
    ELSE 'free' END
  FROM public.profiles p WHERE p.id = _uid
$$;

CREATE OR REPLACE FUNCTION public.start_free_trial() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.bypass','on',true);
  UPDATE public.profiles SET plan = 'trial', trial_ends_at = now() + interval '7 days'
  WHERE id = auth.uid() AND plan = 'free' AND trial_ends_at IS NULL;
END $$;
REVOKE EXECUTE ON FUNCTION public.start_free_trial() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.start_free_trial() TO authenticated;

-- AI credits: free = 8 one-time, trial/premium = 40 per UTC day
CREATE OR REPLACE FUNCTION public.ai_credit_status() RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles; ep text; lim int; used int;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = auth.uid();
  IF p.id IS NULL THEN RAISE EXCEPTION 'no profile'; END IF;
  ep := public.effective_plan(p.id);
  IF ep = 'free' THEN lim := 8; used := p.ai_credits_used;
  ELSE lim := 40; used := CASE WHEN p.ai_credits_day = (now() at time zone 'utc')::date THEN p.ai_credits_used ELSE 0 END;
  END IF;
  RETURN json_build_object('plan', ep, 'limit', lim, 'used', used, 'remaining', greatest(lim - used, 0));
END $$;

CREATE OR REPLACE FUNCTION public.consume_ai_credit() RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s json; ep text; today date := (now() at time zone 'utc')::date;
BEGIN
  s := public.ai_credit_status();
  IF (s->>'remaining')::int <= 0 THEN RETURN json_build_object('ok', false, 'status', s); END IF;
  ep := s->>'plan';
  PERFORM set_config('app.bypass','on',true);
  IF ep = 'free' THEN
    UPDATE public.profiles SET ai_credits_used = ai_credits_used + 1 WHERE id = auth.uid();
  ELSE
    UPDATE public.profiles SET
      ai_credits_used = CASE WHEN ai_credits_day = today THEN ai_credits_used + 1 ELSE 1 END,
      ai_credits_day = today
    WHERE id = auth.uid();
  END IF;
  RETURN json_build_object('ok', true, 'status', public.ai_credit_status());
END $$;
REVOKE EXECUTE ON FUNCTION public.ai_credit_status(), public.consume_ai_credit(), public.effective_plan(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.ai_credit_status(), public.consume_ai_credit(), public.effective_plan(uuid) TO authenticated;

-- trusted contacts with plan limits (free 2, trial 4, premium unlimited)
CREATE TABLE public.trusted_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  phone text NOT NULL,
  relationship text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trusted_contacts TO authenticated;
GRANT ALL ON public.trusted_contacts TO service_role;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contacts" ON public.trusted_contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_contact_limit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ep text; n int; lim int;
BEGIN
  ep := COALESCE(public.effective_plan(NEW.user_id), 'free');
  lim := CASE ep WHEN 'free' THEN 2 WHEN 'trial' THEN 4 ELSE NULL END;
  IF lim IS NOT NULL THEN
    SELECT count(*) INTO n FROM public.trusted_contacts WHERE user_id = NEW.user_id;
    IF n >= lim THEN RAISE EXCEPTION 'Your plan allows % trusted contacts. Upgrade for more.', lim; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER contacts_limit BEFORE INSERT ON public.trusted_contacts FOR EACH ROW EXECUTE FUNCTION public.enforce_contact_limit();

-- trips (Walk Me Home / Safe Arrival)
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  share_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  expected_arrival timestamptz NOT NULL,
  last_lat double precision,
  last_lng double precision,
  last_ping_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trips" ON public.trips FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public read by share link only (no listing)
CREATE OR REPLACE FUNCTION public.get_shared_trip(_token uuid) RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object('destination', t.destination, 'status', t.status, 'expected_arrival', t.expected_arrival,
    'last_lat', t.last_lat, 'last_lng', t.last_lng, 'last_ping_at', t.last_ping_at, 'traveler', p.display_name)
  FROM public.trips t LEFT JOIN public.profiles p ON p.id = t.user_id WHERE t.share_token = _token
$$;
GRANT EXECUTE ON FUNCTION public.get_shared_trip(uuid) TO anon, authenticated;

-- alerts log
CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  kind text NOT NULL,
  message text,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts read" ON public.alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own alerts insert" ON public.alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);