import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAdmin = localStorage.getItem("lash_admin");
      if (isAdmin) {
        navigate("/admin");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  return null;
}
