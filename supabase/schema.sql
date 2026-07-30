-- ══════════════════════════════════════════════════
-- MansionAI Database Schema — Supabase Postgres
-- ══════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ── 1. Profiles table (extends Supabase auth.users) ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. Designs table ──
CREATE TABLE IF NOT EXISTS public.designs (
  id TEXT PRIMARY KEY DEFAULT 'design_' || substr(md5(random()::text), 1, 8),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  room_type TEXT NOT NULL,
  style_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  custom_prompt TEXT,
  color_palette TEXT,
  mood TEXT,
  lighting TEXT,
  budget TEXT,
  provider_job_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_designs_user_id ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_status ON public.designs(status);


-- ── 3. Design Variations table ──
CREATE TABLE IF NOT EXISTS public.design_variations (
  id TEXT PRIMARY KEY DEFAULT 'var_' || substr(md5(random()::text), 1, 8),
  design_id TEXT NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  generated_image_url TEXT NOT NULL,
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  inference_time_ms INTEGER DEFAULT 0,
  parameters JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variations_design_id ON public.design_variations(design_id);


-- ── 4. Collections table ──
CREATE TABLE IF NOT EXISTS public.collections (
  id TEXT PRIMARY KEY DEFAULT 'col_' || substr(md5(random()::text), 1, 8),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);


-- ── 5. Collection-Designs junction table ──
CREATE TABLE IF NOT EXISTS public.collection_designs (
  collection_id TEXT NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  design_id TEXT NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, design_id)
);


-- ── 6. Credit Transactions ledger ──
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id TEXT PRIMARY KEY DEFAULT 'tx_' || substr(md5(random()::text), 1, 8),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('usage', 'purchase', 'bonus', 'refund')),
  description TEXT NOT NULL,
  stripe_payment_id TEXT,
  design_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.credit_transactions(user_id);


-- ── 7. Subscriptions table ──
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY DEFAULT 'sub_' || substr(md5(random()::text), 1, 8),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'none' CHECK (status IN ('none', 'active', 'past_due', 'cancelled')),
  monthly_credits INTEGER DEFAULT 0,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);


-- ══════════════════════════════════════════════════
-- Row Level Security (RLS) Policies
-- ══════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own designs" ON public.designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own designs" ON public.designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own designs" ON public.designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own designs" ON public.designs FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.design_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own variations" ON public.design_variations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.designs WHERE designs.id = design_variations.design_id AND designs.user_id = auth.uid()));
CREATE POLICY "Users can create own variations" ON public.design_variations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.designs WHERE designs.id = design_variations.design_id AND designs.user_id = auth.uid()));

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.collection_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own collection designs" ON public.collection_designs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_designs.collection_id AND collections.user_id = auth.uid()));

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════
-- Auto-Grant Onboarding Credits on Signup
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.grant_onboarding_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 10, 'bonus', 'Welcome bonus — 10 free credits');

  INSERT INTO public.subscriptions (user_id, plan, status, monthly_credits)
  VALUES (NEW.id, 'free', 'none', 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_grant_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_onboarding_credits();
