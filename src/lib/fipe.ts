const BASE = "https://parallelum.com.br/fipe/api/v1/carros";

export type FipeItem = { codigo: string; nome: string };
export type FipeYear = { codigo: string; nome: string };
export type FipeValue = {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
};

export const fipe = {
  brands: () => fetch(`${BASE}/marcas`).then<FipeItem[]>((r) => r.json()),
  models: (brandCode: string) =>
    fetch(`${BASE}/marcas/${brandCode}/modelos`).then<{ modelos: FipeItem[]; anos: FipeItem[] }>((r) => r.json()),
  years: (brandCode: string, modelCode: string) =>
    fetch(`${BASE}/marcas/${brandCode}/modelos/${modelCode}/anos`).then<FipeYear[]>((r) => r.json()),
  value: (brandCode: string, modelCode: string, yearCode: string) =>
    fetch(`${BASE}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`).then<FipeValue>((r) => r.json()),
};

export const parseFipeValue = (v: string): number => {
  return Number(v.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
};

export const formatBRL = (n: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
