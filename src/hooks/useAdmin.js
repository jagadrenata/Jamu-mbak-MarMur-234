'use client'

import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation";

export function useAdmin({ roles = [], redirectTo } = {}) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/me")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (roles.length && !roles.includes(data.admin.role)) {
          throw new Error("Forbidden");
        }

        setAdmin(data.admin);
      })
      .catch(() => {
        setAdmin(null);
        if (redirectTo) router.push(redirectTo);
      })
      .finally(() => setLoading(false));
  }, []);

  return { admin, loading };
}