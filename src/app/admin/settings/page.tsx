"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Upload } from "lucide-react";
import { SiteConfig, FooterLink } from "@/types";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

const defaultConfig: SiteConfig = {
  name: "mdnuais",
  logo: "",
  favicon: "",
  colors: { primary: "#2563eb", primaryDark: "#60a5fa" },
  footer: { text: "", links: [] },
  socialLinks: {},
  metadata: { title: "mdnuais", description: "" },
};

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setConfig({ ...defaultConfig, ...data });
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

  const handleImageUpload = async (field: "logo" | "favicon") => {
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
        setConfig((prev) => ({ ...prev, [field]: url }));
      } catch {
        toast.error(t("common.error"));
      }
    };
    input.click();
  };

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
        <Section title={t("admin.settings.siteName")}>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={t("admin.settings.siteNamePlaceholder")}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </Section>

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
          </div>
        </Section>

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
