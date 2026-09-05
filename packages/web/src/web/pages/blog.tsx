import { Link } from "wouter";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { dateOnly } from "../lib/format";
import { PageHero } from "../components/site/layout";
import { Card, Section } from "../components/site/section";
import { Reveal } from "../components/site/reveal";
import { useSeo } from "../lib/seo";
import { usePosts } from "../queries/content";

export default function BlogPage() {
  const { t, lang } = useI18n();
  const posts = usePosts();

  useSeo({
    title: t({
      fr: "Blog déménagement & envoi de colis — conseils, tarifs, volumes | LBG Express Colis",
      en: "Moving & parcel shipping blog — advice, prices, volumes | LBG Express Colis",
    }),
    description: t({
      fr: "Calculer son volume de déménagement, comparer les tarifs d'envoi de colis, choisir un déménageur, envoyer un gros colis ou un colis à l'international : nos guides pratiques, chiffres à l'appui.",
      en: "Calculate your moving volume, compare parcel prices, choose a mover, ship oversized or international parcels: practical guides with real numbers.",
    }),
    path: "/blog",
    image: "/images/livraison.jpg",
    keywords: [
      "déménagement",
      "tarif déménagement",
      "calculateur de volume déménagement",
      "envoyer un colis",
      "envoi colis pas cher",
      "tarif envoi colis",
      "envoi colis international",
      "suivre un colis",
    ],
  });

  const [featured, ...rest] = posts.data ?? [];

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={t({ fr: "Conseils d'expédition et coulisses du transport", en: "Shipping tips and logistics insights" })}
        lead={t({
          fr: "Emballage, douanes, délais, API : ce que nous apprenons sur le terrain, expliqué simplement.",
          en: "Packaging, customs, lead times, API: what we learn in the field, explained simply.",
        })}
      />

      <Section>
        {posts.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin text-primary" />
            {t({ fr: "Chargement des articles…", en: "Loading articles…" })}
          </div>
        ) : null}

        {featured ? (
          <Reveal>
            <Link to={`/blog/${featured.slug}`} className="block">
              <Card className="grid gap-0 overflow-hidden p-0 md:grid-cols-2">
                <div className="relative h-56 md:h-full">
                  <img src={featured.image} alt="" className="size-full object-cover" />
                </div>
                <div className="flex flex-col justify-center p-7">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {featured.tag}
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-bold leading-tight">{t(featured.title)}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{t(featured.excerpt)}</p>
                  <p className="mt-5 flex items-center gap-3 text-xs text-muted">
                    <span>{dateOnly(featured.publishedAt, lang)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {featured.readingMinutes} min
                    </span>
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {t({ fr: "Lire l'article", en: "Read the article" })}
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Card>
            </Link>
          </Reveal>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <Reveal key={post.slug} delay={i * 60}>
              <Link to={`/blog/${post.slug}`} className="block h-full">
                <Card className="flex h-full flex-col overflow-hidden p-0">
                  <div className="h-40 overflow-hidden">
                    <img src={post.image} alt="" className="size-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{post.tag}</span>
                    <h2 className="mt-2 font-display text-lg font-bold leading-snug">{t(post.title)}</h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t(post.excerpt)}</p>
                    <p className="mt-4 flex items-center gap-3 text-xs text-muted">
                      <span>{dateOnly(post.publishedAt, lang)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {post.readingMinutes} min
                      </span>
                    </p>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
