import { SiteConfig } from "@/types";

interface FooterProps {
  config: SiteConfig;
}

export function Footer({ config }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] py-6 px-4 text-sm text-[var(--color-content-muted)]">
      <div className="max-w-content mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>{config.footer.text}</span>
        {config.footer.links.length > 0 && (
          <div className="flex items-center gap-4">
            {config.footer.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          {config.socialLinks.github && (
            <a href={config.socialLinks.github} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] transition-colors">
              GitHub
            </a>
          )}
          {config.socialLinks.website && (
            <a href={config.socialLinks.website} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] transition-colors">
              Website
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
