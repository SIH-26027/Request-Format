import os

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://nbtwgbmqjjhvlryvatdn.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

def get_supabase_config():
    return {
        "url": SUPABASE_URL,
        "key": SUPABASE_KEY,
        "is_configured": bool(SUPABASE_KEY and len(SUPABASE_KEY) > 20)
    }
