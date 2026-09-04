import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Palette, 
  Type, 
  Layers, 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Sliders, 
  Eye, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LayoutGrid
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import tokensData from "../assets/tokens.json"

export const DesignSystem: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"colors" | "typography" | "components" | "tokens" | "spec">("colors")
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [tokenSearch, setTokenSearch] = useState<string>("")

  const copyToClipboard = (text: string, tokenKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(tokenKey)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const colors = [
    {
      name: "Canvas",
      token: "--color-canvas",
      hex: "#f5f5f5",
      rgb: "245, 245, 245",
      role: "Page background, subtle surface fills, secondary action backgrounds",
      border: "border-hairline"
    },
    {
      name: "Paper",
      token: "--color-paper",
      hex: "#ffffff",
      rgb: "255, 255, 255",
      role: "Card surfaces, popovers, primary button text, modal surface",
      border: "border-hairline"
    },
    {
      name: "Surface Alt",
      token: "--color-surface-alt",
      hex: "#fafafa",
      rgb: "250, 250, 250",
      role: "Sidebar background, table headers, resting input backgrounds",
      border: "border-hairline"
    },
    {
      name: "Ink",
      token: "--color-ink",
      hex: "#0a0a0a",
      rgb: "10, 10, 10",
      role: "Primary text, headers, primary button fills, vector strokes",
      textDark: true
    },
    {
      name: "Ink Soft",
      token: "--color-ink-soft",
      hex: "#171717",
      rgb: "23, 23, 23",
      role: "Filled hover backgrounds, secondary text on light cards",
      textDark: true
    },
    {
      name: "Mid Gray",
      token: "--color-mid-gray",
      hex: "#737373",
      rgb: "115, 115, 115",
      role: "Muted body text, helper labels, placeholder text, icon fills at rest",
      textDark: true
    },
    {
      name: "Hairline",
      token: "--color-hairline",
      hex: "#e5e5e5",
      rgb: "229, 229, 229",
      role: "Structural borders, card outlines, subtle dividers, pill outlines",
      border: "border-hairline"
    },
    {
      name: "Ember (Alert Accent)",
      token: "--color-ember",
      hex: "#e7000b",
      rgb: "231, 0, 11",
      role: "Red decorative accent for alerts, attention markers, and warnings",
      textDark: true
    }
  ]

  const typographySteps = [
    { name: "Caption", size: "12px", weight: "500", leading: "1.33", tracking: "+0.6px", token: "--text-caption", sample: "LEDGER AUDIT REFERENCE #TRX-94810-APEX" },
    { name: "Body", size: "14px", weight: "400", leading: "1.43", tracking: "0px", token: "--text-body", sample: "Reconciled ledger item against Chase operating batch with zero variance." },
    { name: "Body Large", size: "16px", weight: "500", leading: "1.50", tracking: "0px", token: "--text-body-lg", sample: "Net cash position confirmed across 5 corporate accounts." },
    { name: "Subheading", size: "18px", weight: "500", leading: "1.56", tracking: "0px", token: "--text-subheading", sample: "Daily Liquidity & Cash Flow Verification" },
    { name: "Heading Small", size: "24px", weight: "600", leading: "1.33", tracking: "-0.6px", token: "--text-heading-sm", sample: "$14,892,104.50 Total Reconciled" },
    { name: "Heading", size: "30px", weight: "600", leading: "1.20", tracking: "-0.75px", token: "--text-heading", sample: "Monthly Financial Reconciliation" },
    { name: "Heading Large", size: "36px", weight: "600", leading: "1.11", tracking: "-0.9px", token: "--text-heading-lg", sample: "Enterprise Ledger Nexus" },
    { name: "Display", size: "48px", weight: "600", leading: "1.10", tracking: "-2.4px", token: "--text-display", sample: "98.4% Matched" }
  ]

  const shapeRadii = [
    { name: "Buttons", value: "18px", token: "--radius-buttons", usage: "Interactive primary & secondary buttons (full pill geometry)" },
    { name: "Badges", value: "18px", token: "--radius-badges", usage: "Status indicators, entity badges, filters" },
    { name: "Inputs", value: "18px", token: "--radius-inputs", usage: "Search fields, text input boxes, dropdown selectors" },
    { name: "Cards", value: "24px", token: "--radius-cards", usage: "Dashboard metric cards, table containers, modal bodies" },
    { name: "Nested Containers", value: "10px", token: "--radius-nested", usage: "Internal list items, inner cards, tab selectors" },
    { name: "Small Elements", value: "6px", token: "--radius-small", usage: "Code chips, tag counters, tiny tags" }
  ]

  // Filter tokens JSON
  const filterTokens = (query: string) => {
    if (!query) return tokensData
    const q = query.toLowerCase()
    const result: Record<string, any> = {}
    Object.entries(tokensData).forEach(([cat, val]) => {
      if (cat.toLowerCase().includes(q)) {
        result[cat] = val
      } else if (typeof val === "object") {
        const subResult: Record<string, any> = {}
        Object.entries(val as object).forEach(([k, v]) => {
          if (k.toLowerCase().includes(q) || JSON.stringify(v).toLowerCase().includes(q)) {
            subResult[k] = v
          }
        })
        if (Object.keys(subResult).length > 0) {
          result[cat] = subResult
        }
      }
    })
    return result
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-paper border border-hairline rounded-[24px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-mid-gray px-2 py-0.5 rounded-[6px] bg-canvas border border-hairline">
              Design System v2.0
            </span>
            <span className="text-[11px] font-mono text-mid-gray">Geist + Monochromatic Slate</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            Clinical Blueprint Style Reference
          </h1>
          <p className="text-[13.5px] text-mid-gray max-w-2xl mt-1">
            Pure white canvas, soft gray surfaces, and 24px cards floating on hairline borders. 
            All tokens, typography scales, and component specs aligned with <code className="text-[12px] bg-canvas px-1.5 py-0.5 rounded border border-hairline">tokens.json</code> and <code className="text-[12px] bg-canvas px-1.5 py-0.5 rounded border border-hairline">DESIGN.md</code>.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/tokens.json"
            download="tokens.json"
            className="btn-secondary h-9 text-[13px] px-3 gap-2 flex items-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>tokens.json</span>
          </a>
          <a
            href="/DESIGN.md"
            download="DESIGN.md"
            className="btn-primary h-9 text-[13px] px-3 gap-2 flex items-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DESIGN.md</span>
          </a>
        </div>
      </div>

      {/* Sub-Navigation Segmented Control */}
      <div className="flex items-center gap-1 bg-canvas p-1 rounded-[14px] border border-hairline max-w-fit">
        <button
          onClick={() => setActiveSubTab("colors")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer ${
            activeSubTab === "colors"
              ? "bg-paper text-ink shadow-2xs font-semibold border border-hairline/80"
              : "text-mid-gray hover:text-ink"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Colors</span>
        </button>

        <button
          onClick={() => setActiveSubTab("typography")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer ${
            activeSubTab === "typography"
              ? "bg-paper text-ink shadow-2xs font-semibold border border-hairline/80"
              : "text-mid-gray hover:text-ink"
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Typography</span>
        </button>

        <button
          onClick={() => setActiveSubTab("components")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer ${
            activeSubTab === "components"
              ? "bg-paper text-ink shadow-2xs font-semibold border border-hairline/80"
              : "text-mid-gray hover:text-ink"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Components</span>
        </button>

        <button
          onClick={() => setActiveSubTab("tokens")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer ${
            activeSubTab === "tokens"
              ? "bg-paper text-ink shadow-2xs font-semibold border border-hairline/80"
              : "text-mid-gray hover:text-ink"
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Tokens JSON</span>
        </button>

        <button
          onClick={() => setActiveSubTab("spec")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer ${
            activeSubTab === "spec"
              ? "bg-paper text-ink shadow-2xs font-semibold border border-hairline/80"
              : "text-mid-gray hover:text-ink"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Design Spec</span>
        </button>
      </div>

      {/* 1. COLOR TOKENS TAB */}
      {activeSubTab === "colors" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {colors.map((c) => (
              <div
                key={c.name}
                className="bg-paper border border-hairline rounded-[20px] p-4 shadow-2xs hover:border-mid-gray/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Swatch */}
                  <div
                    className={`w-full h-24 rounded-[14px] mb-3 flex items-end p-3 relative group ${c.border || ""}`}
                    style={{ backgroundColor: c.hex }}
                  >
                    <button
                      onClick={() => copyToClipboard(c.hex, c.name)}
                      className="absolute top-2 right-2 p-1.5 rounded-[8px] bg-paper/90 text-ink border border-hairline shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-paper"
                      title="Copy Hex"
                    >
                      {copiedToken === c.name ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <span className={`text-[11px] font-mono font-medium ${c.textDark ? "text-paper" : "text-ink"}`}>
                      {c.hex}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-[14px] text-ink">{c.name}</div>
                    <div className="text-[11px] font-mono text-mid-gray">{c.token}</div>
                    <p className="text-[12px] text-mid-gray/90 leading-snug mt-2 pt-2 border-t border-hairline/60">
                      {c.role}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-[11px] font-mono text-mid-gray">
                  <span>RGB: {c.rgb}</span>
                  <button
                    onClick={() => copyToClipboard(`var(${c.token})`, `${c.name}-var`)}
                    className="hover:text-ink cursor-pointer flex items-center gap-1"
                  >
                    {copiedToken === `${c.name}-var` ? <Check className="w-3 h-3 text-[#34c759]" /> : <Copy className="w-3 h-3" />}
                    <span>CSS var</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Color Role Guidelines */}
          <div className="bg-surface-alt border border-hairline rounded-[20px] p-5">
            <h3 className="text-sm font-semibold text-ink mb-2">Monochromatic Palette Philosophy</h3>
            <p className="text-[13px] text-mid-gray leading-relaxed">
              The interface is strictly achromatic — pure white paper surfaces, soft canvas backgrounds, and solid ink typography. 
              The lone chromatic exception is <strong>Ember (#e7000b)</strong>, reserved exclusively for critical discrepancies, validation exceptions, and destructive prompts.
            </p>
          </div>
        </div>
      )}

      {/* 2. TYPOGRAPHY TAB */}
      {activeSubTab === "typography" && (
        <div className="space-y-6">
          <div className="bg-paper border border-hairline rounded-[24px] p-6 shadow-2xs">
            <div className="border-b border-hairline pb-4 mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Geist Type Scale</h2>
                <p className="text-[12.5px] text-mid-gray">
                  Geometric neutrality with uniform stroke widths and engineered tracking curves.
                </p>
              </div>
              <span className="text-[11px] font-mono bg-canvas px-2.5 py-1 rounded-[6px] border border-hairline text-ink">
                font-family: 'Geist', sans-serif
              </span>
            </div>

            <div className="space-y-8">
              {typographySteps.map((step) => (
                <div key={step.name} className="border-b border-hairline/60 pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-semibold text-ink">{step.name}</span>
                      <code className="text-[11px] font-mono text-mid-gray bg-canvas px-1.5 py-0.5 rounded border border-hairline">
                        {step.token}
                      </code>
                    </div>
                    <div className="flex items-center gap-4 text-[11.5px] font-mono text-mid-gray">
                      <span>size: {step.size}</span>
                      <span>weight: {step.weight}</span>
                      <span>leading: {step.leading}</span>
                      <span>tracking: {step.tracking}</span>
                    </div>
                  </div>

                  <div 
                    className="text-ink truncate py-1"
                    style={{
                      fontSize: step.size,
                      fontWeight: Number(step.weight),
                      lineHeight: Number(step.leading),
                      letterSpacing: step.tracking
                    }}
                  >
                    {step.sample}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Border Radius System */}
          <div className="bg-paper border border-hairline rounded-[24px] p-6 shadow-2xs">
            <h2 className="text-base font-semibold text-ink mb-1">Border Radius Geometry</h2>
            <p className="text-[12.5px] text-mid-gray mb-6">
              Defined geometric radii creating clean pill buttons and floating cards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {shapeRadii.map((r) => (
                <div key={r.name} className="p-4 rounded-[14px] bg-canvas border border-hairline">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[13.5px] text-ink">{r.name}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-paper border border-hairline text-ink">
                      {r.value}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-mid-gray mb-2">{r.token}</div>
                  <p className="text-[12px] text-mid-gray">{r.usage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPONENTS PLAYGROUND */}
      {activeSubTab === "components" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons */}
            <div className="bg-paper border border-hairline rounded-[24px] p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-ink">Button Styles (18px Radius Pill)</h3>
              <p className="text-[12.5px] text-mid-gray">
                Pill geometry, 38px height, 14px font, Geist weight 500.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className="btn-primary">
                  <span>Primary Action</span>
                </button>
                <button className="btn-secondary">
                  <span>Secondary Ghost</span>
                </button>
                <button className="h-[38px] px-4 rounded-[18px] border border-hairline text-ink bg-paper hover:bg-canvas text-[14px] font-medium transition-colors cursor-pointer">
                  <span>Outline Button</span>
                </button>
                <button className="btn-primary opacity-40 cursor-not-allowed" disabled>
                  <span>Disabled State</span>
                </button>
              </div>
            </div>

            {/* Badges & Tags */}
            <div className="bg-paper border border-hairline rounded-[24px] p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-ink">Badges & Indicators (18px Radius)</h3>
              <p className="text-[12.5px] text-mid-gray">
                Monochromatic tags with hairline borders and subtle surface fills.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge variant="solid">Solid Active</Badge>
                <Badge variant="soft">Soft Outline</Badge>
                <Badge variant="outline">Border Outline</Badge>
                <Badge variant="ember">Alert Marker</Badge>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-[6px] bg-canvas border border-hairline text-mid-gray">
                  TAG-1049
                </span>
              </div>
            </div>

            {/* Input Fields */}
            <div className="bg-paper border border-hairline rounded-[24px] p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-ink">Input Fields (18px Radius)</h3>
              <p className="text-[12.5px] text-mid-gray">
                Soft canvas resting state with hairline outline and Geist typography.
              </p>

              <div className="space-y-3 pt-2">
                <Input placeholder="Search bank transactions by reference..." />
                <Input placeholder="Filter by dollar threshold..." />
              </div>
            </div>

            {/* Metric Card Preview */}
            <div className="bg-paper border border-hairline rounded-[24px] p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-ink">Metric Cards (24px Radius)</h3>
              <p className="text-[12.5px] text-mid-gray">
                Floating pure white cards on hairline borders with micro-shadow.
              </p>

              <div className="card-container">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12.5px] font-medium text-mid-gray">Match Accuracy</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-canvas border border-hairline text-[#0a0a0a]">
                    Active
                  </span>
                </div>
                <div className="text-2xl font-bold text-ink mb-1">98.4%</div>
                <div className="text-[12px] text-mid-gray">
                  77 of 78 records auto-matched with zero manual intervention
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TOKENS JSON TAB */}
      {activeSubTab === "tokens" && (
        <div className="bg-paper border border-hairline rounded-[24px] p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">Design Tokens (<code className="text-xs">tokens.json</code>)</h3>
              <p className="text-[12.5px] text-mid-gray">
                Machine-readable token dictionary parsed directly by build pipeline.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
                <input
                  type="text"
                  placeholder="Filter token keys..."
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-[10px] bg-canvas border border-hairline focus:outline-none focus:border-ink text-ink font-mono"
                />
              </div>

              <button
                onClick={() => copyToClipboard(JSON.stringify(tokensData, null, 2), "all-tokens")}
                className="btn-secondary h-8 px-3 text-[12px] gap-1.5 flex items-center"
              >
                {copiedToken === "all-tokens" ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy JSON</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0f0f11] text-[#e0e0e0] p-4 rounded-[16px] overflow-x-auto max-h-[540px] font-mono text-[12px] leading-relaxed select-text">
            <pre>{JSON.stringify(filterTokens(tokenSearch), null, 2)}</pre>
          </div>
        </div>
      )}

      {/* 5. DESIGN SPEC TAB */}
      {activeSubTab === "spec" && (
        <div className="bg-paper border border-hairline rounded-[24px] p-8 shadow-2xs space-y-6">
          <div className="border-b border-hairline pb-4">
            <h2 className="text-xl font-bold text-ink">DESIGN.md Summary</h2>
            <p className="text-[13px] text-mid-gray mt-1">
              Excerpt of the core system rules from <code className="text-xs bg-canvas px-1.5 py-0.5 rounded border border-hairline">frontend/src/assets/DESIGN.md</code>.
            </p>
          </div>

          <div className="space-y-6 text-[13.5px] text-ink leading-relaxed">
            <div>
              <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-2">Core Philosophy</h3>
              <p className="text-mid-gray">
                Monochromatic design workshop: pure white canvas, soft warm-gray surfaces, and large-radius cards floating on hairline borders.
                Developer-tool neutrality built with Geist typefaces, compact base 4px density, and deliberate absence of unnecessary color noise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-[14px] bg-canvas border border-hairline space-y-2">
                <h4 className="font-semibold text-[13px] text-ink">Design Tokens Principles</h4>
                <ul className="list-disc list-inside space-y-1 text-[12.5px] text-mid-gray">
                  <li>Zero color used for decorative illustration</li>
                  <li>Ember (#e7000b) strictly reserved for alerts/exceptions</li>
                  <li>Buttons consistently shaped with 18px pill radius</li>
                  <li>Containers formatted with 24px rounded corners</li>
                </ul>
              </div>

              <div className="p-4 rounded-[14px] bg-canvas border border-hairline space-y-2">
                <h4 className="font-semibold text-[13px] text-ink">Typography Rules</h4>
                <ul className="list-disc list-inside space-y-1 text-[12.5px] text-mid-gray">
                  <li>Geist font weights: 400 (regular), 500 (medium), 600 (semibold)</li>
                  <li>Tracking tightens aggressively on large display headers (-2.4px)</li>
                  <li>Uppercase captions tracked at +0.6px for maximum legibility</li>
                  <li>Financial currency amounts rendered in monospace where aligned</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline flex items-center justify-between">
              <span className="text-[12px] text-mid-gray">
                Full documentation file located at <code className="font-mono text-xs">frontend/src/assets/DESIGN.md</code>
              </span>
              <a
                href="/DESIGN.md"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary h-8 px-3 text-[12px] flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Raw Spec</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
