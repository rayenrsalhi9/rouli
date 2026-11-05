import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "iconoir-react"

const groups = [
  {
    title: "Véhicules",
    links: [
      { to: "/vehicules?type=bike", label: "Vélos électriques" },
      { to: "/vehicules?type=scooter", label: "Trottinettes électriques" },
      { to: "/vehicules", label: "Tout le catalogue" },
    ],
  },
  {
    title: "Rouli",
    links: [
      { to: "/agences", label: "Nos agences" },
      { to: "/", label: "Accueil" },
    ],
  },
]

export const Footer: React.FC = () => (
  <footer className="w-full border-t border-neutral-200/70 bg-surface px-4 py-10 text-neutral-600 sm:px-6 sm:py-14">
    <div className="mx-auto max-w-page">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="max-w-sm">
          <Link to="/" aria-label="Rouli — Accueil" className="inline-flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
            <img src="/apple-touch-icon.png" alt="" width={40} height={40} className="size-10 rounded-[22.5%]" />
            <img src="/rouli-wordmark-brand.svg" alt="" width={64} height={22} className="h-[22px] w-auto" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-neutral-500">
            Vélos et trottinettes électriques proposés par les agences de Monastir.
          </p>
        </div>
        <div className="flex flex-wrap gap-10 sm:gap-16">
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold text-neutral-900">{group.title}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.to}><Link to={link.to} className="rounded hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">{link.label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="max-w-xs">
          <p className="text-sm font-semibold text-neutral-900">Explorez Rouli</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">Consultez les caractéristiques des véhicules et les informations fournies par chaque agence.</p>
          <Link to="/agences" className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
            Trouver une agence <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
      <div className="mt-10 border-t border-neutral-200/70 pt-6 text-sm text-neutral-500">
        © {new Date().getFullYear()} Rouli
      </div>
    </div>
  </footer>
)
