/** Lê um File como base64 puro (sem o prefixo data:). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}
