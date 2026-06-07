"use client"

import { usePathname } from "next/navigation"

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/produtos": "Produtos",
  "/estoque": "Estoque",
  "/carrinho": "Carrinho de Compras",
  "/clientes": "Clientes",
}

export function Header() {
  const pathname = usePathname()
  const pageName = pageNames[pathname] || "Página"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-card px-6">
      <h1 className="text-xl font-semibold text-foreground">{pageName}</h1>
    </header>
  )
}
