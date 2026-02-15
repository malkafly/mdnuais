"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Upload, RefreshCw } from "lucide-react";
import { SiteConfig, FooterLink, NavbarLink, NavbarCta, HeroConfig, NavbarConfig } from "@/types";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

const defaultHero: HeroConfig = {
  title: "Como podemos ajudar?",
  subtitle: "Busque na nossa base de conhecimento",
  background: "color",
  backgroundColor: "#4F46E5",
  backgroundImage: "",
  textColor: "#FFFFFF",
};

const defaultNavbar: NavbarConfig = {
  links: [],
  cta: [],
};

const defaultConfig: SiteConfig = {
  name: "mdnuais",
  logo: "",
  favicon: "",
  colors: { primary: "#2563eb", primaryDark: "#60a5fa" },
  footer: { text: "", links: [] },
  socialLinks: {},
  metadata: { title: "mdnuais", description: "" },
  hero: defaultHero,
  navbar: defaultNavbar,
};

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setConfig({
          ...defaultConfig,
          ...data,
          hero: { ...defaultHero, ...(data.hero || {}) },
          navbar: { ...defaultNavbar, ...(data.navbar || {}) },
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      toast.success(t("admin.settings.saved"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handlePurgeCache = async () => {
    setPurging(true);
    try {
      const res = await fetch("/api/cache/purge", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success(t("admin.settings.cachePurged"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setPurging(false);
    }
  };

  const handleImageUpload = async (field: "logo" | "favicon" | "heroBackground") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error();
        const { url } = await res.json();

        if (field === "heroBackground") {
          setConfig((prev) => ({
            ...prev,
            hero: { ...prev.hero!, backgroundImage: url },
          }));
        } else {
          setConfig((prev) => ({ ...prev, [field]: url }));
        }
      } catch {
        toast.error(t("common.error"));
      }
    };
    input.click();
  };

  const hero = config.hero || defaultHero;
  const navbar = config.navbar || defaultNavbar;

  const updateHero = (field: keyof HeroConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      hero: { ...prev.hero!, [field]: value },
    }));
  };

  // Navbar links
  const addNavbarLink = () => {
    setConfig((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar!,
        links: [...prev.navbar!.links, { label: "", url: "" }],
      },
    }));
  };

  const removeNavbarLink = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar!,
        links: prev.navbar!.links.filter((_, i) => i !== index),
      },
    }));
  };

  const updateNavbarLink = (index: number, field: keyof NavbarLink, value: string) => {
    setConfig((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar!,
        links: prev.navbar!.links.map((link, i) =>
          i === index ? { ...link, [field]: value } : link
        ),
      },
    }));
  };

  // Navbar CTAs
  const addNavbarCta = () => {
    if (navbar.cta.length >= 2) return;
    setConfig((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar!,
        cta: [...prev.navbar!.cta, { label: "", url: "", style: "primary" as const }],
      },
    }));
  };

  const removeNavbarCta = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar!,
        cta: prev.navbar!.cta.filter((_, i) => i !== index),
      },
    }));
  };

  const updateNavbarCta = (index: number, field: keyof NavbarCta, value: string) => {
    setConfig((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar!,
        cta: prev.navbar!.cta.map((cta, i) =>
          i === index ? { ...cta, [field]: value } : cta
        ),
      },
    }));
  };

  // Footer links
  const addFooterLink = () => {
    setConfig((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: [...prev.footer.links, { label: "", url: "" }],
      },
    }));
  };

  const removeFooterLink = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: prev.footer.links.filter((_, i) => i !== index),
      },
    }));
  };

  const updateFooterLink = (index: number, field: keyof FooterLink, value: string) => {
    setConfig((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: prev.footer.links.map((link, i) =>
          i === index ? { ...link, [field]: value } : link
        ),
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--color-content-muted)]">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("admin.settings.title")}</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? t("common.loading") : t("common.save")}
        </button>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Site Name */}
        <Section title={t("admin.settings.siteName")}>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={t("admin.settings.siteNamePlaceholder")}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </Section>

        {/* Logo & Favicon */}
        <Section title="Logo & Favicon">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-content-muted)] mb-2">
                {t("admin.settings.logo")}
              </label>
              {config.logo && (
                <img src={config.logo} alt="Logo" className="w-12 h-12 object-contain mb-2 rounded" />
              )}
              <button
                onClick={() => handleImageUpload("logo")}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
              >
                <Upload className="w-4 h-4" />
                {t("admin.settings.uploadLogo")}
              </button>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-content-muted)] mb-2">
                {t("admin.settings.favicon")}
              </label>
              {config.favicon && (
                <img src={config.favicon} alt="Favicon" className="w-8 h-8 object-contain mb-2 rounded" />
              )}
              <button
                onClick={() => handleImageUpload("favicon")}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
              >
                <Upload className="w-4 h-4" />
                {t("admin.settings.uploadFavicon")}
              </button>
            </div>
          </div>
        </Section>

        {/* Hero */}
        <Section title={t("admin.settings.hero")}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[var(--color-content-muted)] mb-1">
                {t("admin.settings.heroTitle")}
              </label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => updateHero("title", e.target.value)}
                placeholder="Como podemos ajudar?"
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-content-muted)] mb-1">
                {t("admin.settings.heroSubtitle")}
              </label>
              <input
                type="text"
                value={hero.subtitle}
                onChange={(e) => updateHero("subtitle", e.target.value)}
                placeholder="Busque na nossa base de conhecimento"
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-content-muted)] mb-1">
                {t("admin.settings.heroBackground")}
              </label>
              <select
                value={hero.background}
                onChange={(e) => updateHero("background", e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="color">{t("admin.settings.heroBgColor")}</option>
                <option value="image">{t("admin.settings.heroBgImage")}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[var(--color-content-muted)] mb-1">
                  {hero.background === "color" ? t("admin.settings.heroBgColorValue") : t("admin.settings.heroBgImage")}
                </label>
                {hero.background === "color" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hero.backgroundColor}
                      onChange={(e) => updateHero("backgroundColor", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={hero.backgroundColor}
                      onChange={(e) => updateHero("backgroundColor", e.target.value)}
                      className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                ) : (
                  <div>
                    {hero.backgroundImage && (
                      <img src={hero.backgroundImage} alt="Hero bg" className="w-full h-20 object-cover mb-2 rounded" />
                    )}
                    <button
                      onClick={() => handleImageUpload("heroBackground")}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {t("admin.settings.uploadImage")}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-[var(--color-content-muted)] mb-1">
                  {t("admin.settings.heroTextColor")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={hero.textColor}
                    onChange={(e) => updateHero("textColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={hero.textColor}
                    onChange={(e) => updateHero("textColor", e.target.value)}
                    className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Navbar Links */}
        <Section title={t("admin.settings.navbarLinks")}>
          <div className="space-y-2">
            {navbar.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateNavbarLink(i, "label", e.target.value)}
                  placeholder={t("admin.settings.linkLabel")}
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateNavbarLink(i, "url", e.target.value)}
                  placeholder={t("admin.settings.linkUrl")}
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <button
                  onClick={() => removeNavbarLink(i)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addNavbarLink}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              {t("admin.settings.addNavbarLink")}
            </button>
          </div>
        </Section>

        {/* Navbar CTA Buttons */}
        <Section title={t("admin.settings.navbarCta")}>
          <div className="space-y-2">
            {navbar.cta.map((cta, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={cta.label}
                  onChange={(e) => updateNavbarCta(i, "label", e.target.value)}
                  placeholder={t("admin.settings.ctaLabel")}
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <input
                  type="url"
                  value={cta.url}
                  onChange={(e) => updateNavbarCta(i, "url", e.target.value)}
                  placeholder={t("admin.settings.ctaUrl")}
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <select
                  value={cta.style}
                  onChange={(e) => updateNavbarCta(i, "style", e.target.value)}
                  className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="primary">{t("admin.settings.ctaPrimary")}</option>
                  <option value="outline">{t("admin.settings.ctaOutline")}</option>
                </select>
                <button
                  onClick={() => removeNavbarCta(i)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {navbar.cta.length < 2 && (
              <button
                onClick={addNavbarCta}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors w-full justify-center"
              >
                <Plus className="w-4 h-4" />
                {t("admin.settings.addNavbarCta")}
              </button>
            )}
          </div>
        </Section>

        {/* Colors */}
        <Section title={t("admin.settings.primaryColor")}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-content-muted)] mb-2">
                {t("admin.settings.primaryColor")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.colors.primary}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, primary: e.target.value },
                    }))
                  }
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={config.colors.primary}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, primary: e.target.value },
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-content-muted)] mb-2">
                {t("admin.settings.primaryDarkColor")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.colors.primaryDark}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, primaryDark: e.target.value },
                    }))
                  }
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={config.colors.primaryDark}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, primaryDark: e.target.value },
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <Section title={t("admin.settings.footerText")}>
          <input
            type="text"
            value={config.footer.text}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, footer: { ...prev.footer, text: e.target.value } }))
            }
            placeholder={t("admin.settings.footerTextPlaceholder")}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </Section>

        <Section title={t("admin.settings.footerLinks")}>
          <div className="space-y-2">
            {config.footer.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateFooterLink(i, "label", e.target.value)}
                  placeholder={t("admin.settings.footerLinkLabel")}
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateFooterLink(i, "url", e.target.value)}
                  placeholder={t("admin.settings.footerLinkUrl")}
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <button
                  onClick={() => removeFooterLink(i)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addFooterLink}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              {t("admin.settings.addFooterLink")}
            </button>
          </div>
        </Section>

        {/* Social Links */}
        <Section title={t("admin.settings.socialLinks")}>
          <div className="space-y-3">
            <SocialInput
              label={t("admin.settings.github")}
              value={config.socialLinks.github || ""}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, github: v },
                }))
              }
              placeholder="https://github.com/..."
            />
            <SocialInput
              label={t("admin.settings.website")}
              value={config.socialLinks.website || ""}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, website: v },
                }))
              }
              placeholder="https://..."
            />
            <SocialInput
              label={t("admin.settings.twitter")}
              value={config.socialLinks.twitter || ""}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, twitter: v },
                }))
              }
              placeholder="https://x.com/..."
            />
            <SocialInput
              label={t("admin.settings.linkedin")}
              value={config.socialLinks.linkedin || ""}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, linkedin: v },
                }))
              }
              placeholder="https://linkedin.com/..."
            />
            <SocialInput
              label={t("admin.settings.facebook")}
              value={config.socialLinks.facebook || ""}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, facebook: v },
                }))
              }
              placeholder="https://facebook.com/..."
            />
            <SocialInput
              label={t("admin.settings.instagram")}
              value={config.socialLinks.instagram || ""}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, instagram: v },
                }))
              }
              placeholder="https://instagram.com/..."
            />
            <SocialInput
              label={t("admin.settings.whatsapp")}
              value={config.socialLinks.whatsapp || ""}
              onChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, whatsapp: v },
                }))
              }
              placeholder="https://wa.me/5511999999999"
            />
          </div>
        </Section>

        {/* SEO */}
        <Section title="SEO">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[var(--color-content-muted)] mb-1">
                {t("admin.settings.metaTitle")}
              </label>
              <input
                type="text"
                value={config.metadata.title}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, title: e.target.value },
                  }))
                }
                placeholder={t("admin.settings.metaTitlePlaceholder")}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-content-muted)] mb-1">
                {t("admin.settings.metaDescription")}
              </label>
              <textarea
                value={config.metadata.description}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, description: e.target.value },
                  }))
                }
                placeholder={t("admin.settings.metaDescriptionPlaceholder")}
                rows={3}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
            </div>
          </div>
        </Section>

        {/* Cache */}
        <Section title={t("admin.settings.cache")}>
          <p className="text-sm text-[var(--color-content-muted)] mb-3">
            {t("admin.settings.cacheDescription")}
          </p>
          <button
            onClick={handlePurgeCache}
            disabled={purging}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${purging ? "animate-spin" : ""}`} />
            {purging ? t("common.loading") : t("admin.settings.purgeCache")}
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-content-muted)] mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SocialInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-20 text-sm text-[var(--color-content-muted)]">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />
    </div>
  );
}
