// Build di produzione (Vercel): il nome del servizio Render è fissato nel
// render.yaml del repository, quindi l'indirizzo è prevedibile.
export const environment = {
  production: true,
  apiUrl: 'https://goldenstay-backend.onrender.com/api',
}
