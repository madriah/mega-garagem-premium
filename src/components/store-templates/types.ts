export type StoreProfile = {
  id: string;
  store_name: string;
  store_slug: string;
  whatsapp: string;
  logo_url?: string | null;
  accent_color?: string | null;
  tagline?: string | null;
  city?: string | null;
};

export type StoreVehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  color?: string | null;
  fuel?: string | null;
  sale_price: number | string;
  fipe_value?: number | string | null;
  _coverUrl?: string;
};

export type TemplateProps = {
  profile: StoreProfile;
  vehicles: StoreVehicle[];
};

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "MG";
