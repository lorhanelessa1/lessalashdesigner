import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "@/lib/store";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session?.isAdmin) {
      navigate("/admin");
    } else if (session) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return null;
}
