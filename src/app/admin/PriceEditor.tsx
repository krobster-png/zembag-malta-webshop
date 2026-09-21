"use client";
import { useState } from "react";

export function PriceEditor({ productId, current }: { productId: string; current?: number }) {
  const [value, setValue] = useState(current ? String(current) : "");
  const [status, setStatus] = useState("");
  async function save() {
    setStatus("Saving…");
    const response = await fetch("/api/admin/prices", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId, amount: Number(value) }) });
    setStatus(response.ok ? "Saved" : "Error");
  }
  return <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><input aria-label="Malta EUR price" value={value} onChange={(event) => setValue(event.target.value)} placeholder="EUR" inputMode="decimal" style={{ width: 78, padding: "7px 8px", border: "1px solid #d9d4c9", borderRadius: 8 }} /><button onClick={save} style={{ padding: "7px 9px", border: 0, borderRadius: 8, background: "#173c3a", color: "white", cursor: "pointer" }}>Save</button><small>{status}</small></span>;
}
