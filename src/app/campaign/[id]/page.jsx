"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL || "https://api.resvor.com"
).replace(/\/+$/, "");

export default function CampaignRedirect() {
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (id) {
      window.location.replace(`${API_BASE_URL}/campaigns/i/${id}`);
    }
  }, [id]);

  return null;
}
