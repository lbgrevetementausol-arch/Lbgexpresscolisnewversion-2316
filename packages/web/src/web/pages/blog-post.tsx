import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Clock, Loader2 } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { dateOnly } from "../lib/format";
import { Card, Section } from "../components/site/section";
import { articleJsonLd, useJsonLd, useSeo } from "../lib/seo";
import { usePost, usePosts } from "../queries/content";

const LINK_RE = /^\[([^\]]+)\]\(([^)]+)\)$/;

/** Rendu inline : **gras** -> <strong>, [texte](/chemin) -> lien interne ou externe. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter((part) => part !== "");
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const link = LINK_RE.exec(part);
        if (link) {
          const [, label, href] = link;
          if (href.startsWith("/")) {
            return (
              <Link key={i} href={href} className="font-medium text-primary underline underline-offset-4">
                {label}
              </Link>
            );
          }
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              {label}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** Rendu du markdown léger utilisé dans les articles : "## titre", listes "- ", paragraphes. */
function Body({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-4 font-display text-xl font-bold md:text-2xl">
              <Inline text={trimmed.slice(3)} />
            </h2>
          );
        }
        if (trimmed.startsWith("- ")) {
          return (
            <ul key={i} className="space-y-2">
              {trimmed.split("\n").map((line, j) => (
                <li key={j} className="flex items-start gap-2.5 text-[1.0125rem] leading-relaxed text-muted">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    <Inline text={line.replace(/^-\s*/, "")} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-[1.0625rem] leading-[1.8] text-muted">
            <Inline text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

export default function BlogPostPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const post = usePost(slug);
  const posts = usePosts();
  const data = post.data;

  const faqPairs = (data?.faq ?? []).map((item) => ({ q: t(item.q), a: t(item.a) }));

  useSeo(
    data
      ? {
          title: `${t(data.title)} | LBG Express Colis`,
          description: t(data.excerpt).slice(0, 300),
          path: `/blog/${data.slug}`,
          image: data.image,
          type: "article",
          keywords: data.keywords,
        }
      : null,
  );

  useJsonLd(
    data
      ? articleJsonLd({
          title: t(data.title),
          description: t(data.excerpt),
          path: `/blog/${data.slug}`,
          image: data.image,
          publishedAt: data.publishedAt,
          faq: faqPairs,
        })
      : null,
    "ld-article",
  );

  if (post.isLoading) {
    return (
      <Section>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin text-primary" />
          {t({ fr: "Chargement de l'article…", en: "Loading the article…" })}
        </div>
      </Section>
    );
  }

  if (post.isError || !post.data) {
    return (
      <Section>
        <h1 className="font-display text-2xl font-bold">
          {t({ fr: "Article introuvable", en: "Article not found" })}
        </h1>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
        >
          <ArrowLeft className="size-4" />
          {t({ fr: "Retour au blog", en: "Back to the blog" })}
        </Link>
      </Section>
    );
  }

  const article = post.data;
  const others = (posts.data ?? []).filter((p) => p.slug !== article.slug).slice(0, 3);
  const readingMinutes = Math.max(2, Math.round(article.body[lang].length / 900));

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img src={article.image} alt="" className="absolute inset-0 size-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="container-lbg relative py-16 md:py-24">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            {t({ fr: "Tous les articles", en: "All articles" })}
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{article.tag}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.1] md:text-[2.9rem]">
            {t(article.title)}
          </h1>
          <p className="mt-5 flex items-center gap-4 text-sm text-muted">
            <span>{dateOnly(article.publishedAt, lang)}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {readingMinutes} min
            </span>
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <article className="max-w-3xl">
            <p className="border-l-2 border-primary pl-5 text-lg font-medium leading-relaxed">
              {t(article.excerpt)}
            </p>
            <div className="mt-10">
              <Body text={article.body[lang]} />
            </div>

            {faqPairs.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-xl font-bold md:text-2xl">
                  {t({ fr: "Questions fréquentes", en: "Frequently asked questions" })}
                </h2>
                <div className="mt-5 space-y-3">
                  {faqPairs.map((item) => (
                    <details key={item.q} className="rounded-card border border-border bg-surface-2 p-5">
                      <summary className="cursor-pointer text-[1.0125rem] font-semibold">{item.q}</summary>
                      <p className="mt-3 text-[1.0125rem] leading-[1.8] text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {(article.keywords?.length ?? 0) > 0 && (
              <p className="mt-8 text-xs leading-relaxed text-muted/70">
                {t({ fr: "Sujets liés :", en: "Related topics:" })} {article.keywords?.join(" · ")}
              </p>
            )}

            <div className="mt-12 rounded-card border border-primary/30 bg-primary/5 p-6">
              <h2 className="font-display text-lg font-bold">
                {t({ fr: "Un envoi à préparer ?", en: "Got a shipment to prepare?" })}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {t({
                  fr: "Obtenez un prix ferme en 60 secondes, avec enlèvement à domicile sous 24 h.",
                  en: "Get a firm price in 60 seconds, with home pickup within 24 hours.",
                })}
              </p>
              <Link
                to="/devis"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
              >
                {t({ fr: "Calculer mon tarif", en: "Calculate my price" })}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>

          <aside className="lg:sticky lg:top-24">
            <h2 className="font-display text-base font-bold">
              {t({ fr: "À lire ensuite", en: "Read next" })}
            </h2>
            <div className="mt-4 space-y-3">
              {others.map((other) => (
                <Link key={other.slug} to={`/blog/${other.slug}`} className="block">
                  <Card className="flex gap-4 p-4">
                    <img
                      src={other.image}
                      alt=""
                      className="size-16 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-primary">{other.tag}</p>
                      <p className="mt-1 text-sm font-medium leading-snug">{t(other.title)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
