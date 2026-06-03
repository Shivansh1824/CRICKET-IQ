// Supabase Client Initialization
const SUPABASE_URL = "https://wphgbapkqjgtjpyfmpha.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaGdiYXBrcWpndGpweWZtcGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzI2NTgsImV4cCI6MjA5NTkwODY1OH0.hM1xNXbl4wkyXUtHOYTcPob4QT5xEP_0JgvqYJPIZhE";

if (typeof supabase === 'undefined') {
  console.error("Supabase CDN script must be loaded before this file.");
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global Auth Helpers
window.cricIqAuth = {
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
      window.location.href = 'index.html';
    }
    return { error };
  },

  getUser: async () => {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) return null;
    return user;
  },

  checkEmailExists: async (email) => {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    return { exists: !!data, error };
  },

  verifyOtp: async (email, token) => {
    const { data, error } = await supabaseClient.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });
    return { data, error };
  },

  signInWithGoogle: async () => {
    const redirectToUrl = window.location.origin + window.location.pathname.replace(/index\.html$/, '') + 'dashboard.html';
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectToUrl
      }
    });
    return { data, error };
  }

};
