import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  store_name: string;
  store_slug: string;
  whatsapp: string;
  email: string;
  tier?: "basico" | "pro" | "elite" | null;
  accent_color?: string | null;
  logo_url?: string | null;
  role?: string | null;
  owner_id?: string | null;
};

export type Permission = "cars" | "fichas" | "fichas_all" | "content" | "metrics_store";

export const PERMISSIONS: { key: Permission; label: string; hint: string }[] = [
  { key: "cars", label: "Cadastrar/editar carros", hint: "Acesso ao estoque e cadastro de veículos" },
  { key: "fichas", label: "Ver fichas digitais", hint: "Acessa as fichas atribuídas a ele" },
  { key: "fichas_all", label: "Ver todas as fichas da loja", hint: "Inclusive fichas de outros vendedores" },
  { key: "content", label: "Artes, Carrossel e Reels IA", hint: "Ferramentas de criação de conteúdo" },
  { key: "metrics_store", label: "Ver métricas da loja inteira", hint: "Sem isso, vê só os números dele" },
];

type SellerRecord = { id: string; name: string; permissions: string[]; is_active: boolean } | null;

type Ctx = {
  user: User | null;
  session: Session | null;
  /** Perfil da LOJA (do dono) — usado em todo o painel. */
  profile: Profile | null;
  /** Perfil da conta logada (pode ser vendedor). */
  account: Profile | null;
  /** ID do dono da loja (para filtrar/gravar dados). */
  ownerId: string | null;
  isSeller: boolean;
  seller: SellerRecord;
  can: (perm: Permission) => boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null, session: null, profile: null, account: null, ownerId: null,
  isSeller: false, seller: null, can: () => false, loading: true, refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [seller, setSeller] = useState<SellerRecord>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data: own } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    const acc = (own ?? null) as Profile | null;
    setAccount(acc);

    if (acc?.role === "seller" && acc.owner_id) {
      const [{ data: storeProfile }, { data: sellerRow }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", acc.owner_id).maybeSingle(),
        supabase.from("sellers" as any).select("id,name,permissions,is_active").eq("auth_user_id", uid).maybeSingle(),
      ]);
      setProfile(((storeProfile ?? acc) as Profile) ?? null);
      setSeller((sellerRow ?? null) as SellerRecord);
    } else {
      setProfile(acc);
      setSeller(null);
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) setTimeout(() => loadProfile(s.user.id), 0);
      else { setProfile(null); setAccount(null); setSeller(null); }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isSeller = account?.role === "seller";
  const ownerId = isSeller ? account?.owner_id ?? null : user?.id ?? null;
  const can = (perm: Permission) => (!isSeller ? true : (seller?.permissions ?? []).includes(perm));

  return (
    <AuthCtx.Provider
      value={{
        user, session, profile, account, ownerId, isSeller, seller, can, loading,
        refreshProfile: async () => { if (user) await loadProfile(user.id); },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
