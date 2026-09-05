import { useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart3,
  FileText,
  KeyRound,
  LogOut,
  Mail,
  MailPlus,
  Map,
  PackageSearch,
  Settings,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "../lib/i18n";
import { authClient, signOutAndClear } from "../lib/auth";
import { PageHero } from "../components/site/layout";
import { Section } from "../components/site/section";
import { ProtectedRoute } from "../components/protected-route";
import { DashboardPanel } from "../components/admin/dashboard-panel";
import { OrdersPanel } from "../components/admin/orders-panel";
import { InvoicesPanel } from "../components/admin/invoices-panel";
import { UsersPanel } from "../components/admin/users-panel";
import { ContentPanel } from "../components/admin/content-panel";
import { TrackingsPanel } from "../components/admin/trackings-panel";
import { MapPanel } from "../components/admin/map-panel";
import { DriversPanel } from "../components/admin/drivers-panel";
import { InboxPanel } from "../components/admin/inbox-panel";
import { IntegrationsPanel } from "../components/admin/integrations-panel";
import { NewsletterPanel } from "../components/admin/newsletter-panel";

const TABS = [
  { id: "tableau", fr: "Tableau de bord", en: "Dashboard", icon: BarChart3 },
  { id: "commandes", fr: "Commandes", en: "Orders", icon: ShoppingBag },
  { id: "factures", fr: "Factures", en: "Invoices", icon: FileText },
  { id: "suivis", fr: "Suivis", en: "Trackings", icon: PackageSearch },
  { id: "livreurs", fr: "Livreurs & courses", en: "Drivers & jobs", icon: Truck },
  { id: "carte", fr: "Carte livreurs", en: "Driver map", icon: Map },
  { id: "messages", fr: "Messages", en: "Inbox", icon: Mail },
  { id: "newsletter", fr: "Newsletter", en: "Newsletter", icon: MailPlus },
  { id: "utilisateurs", fr: "Utilisateurs", en: "Users", icon: Users },
  { id: "contenu", fr: "Contenu & tarifs", en: "Content & pricing", icon: Settings },
  { id: "api", fr: "API & webhooks", en: "API & webhooks", icon: KeyRound },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminShell() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const [tab, setTab] = useState<TabId>("tableau");

  const logout = async () => {
    await signOutAndClear();
    navigate("/connexion");
  };

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Back-office", en: "Back-office" })}
        title={t({ fr: "Administration LBG Express Colis", en: "LBG Express Colis administration" })}
        lead={t({
          fr: "Commandes en temps réel, factures MyPOS, comptes clients, contenus et tarifs du site.",
          en: "Real-time orders, MyPOS invoices, client accounts, site content and pricing.",
        })}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-border bg-surface-2/70 px-4 py-2 text-xs text-muted">
            {session?.user?.email}
          </span>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
          >
            <LogOut className="size-4" />
            {t({ fr: "Se déconnecter", en: "Sign out" })}
          </button>
        </div>
      </PageHero>

      <Section>
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                  tab === item.id
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted hover:border-primary/40 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {t(item)}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {tab === "tableau" ? <DashboardPanel /> : null}
          {tab === "commandes" ? <OrdersPanel /> : null}
          {tab === "factures" ? <InvoicesPanel /> : null}
          {tab === "suivis" ? <TrackingsPanel /> : null}
          {tab === "livreurs" ? <DriversPanel /> : null}
          {tab === "carte" ? <MapPanel /> : null}
          {tab === "messages" ? <InboxPanel /> : null}
          {tab === "newsletter" ? <NewsletterPanel /> : null}
          {tab === "utilisateurs" ? <UsersPanel /> : null}
          {tab === "contenu" ? <ContentPanel /> : null}
          {tab === "api" ? <IntegrationsPanel /> : null}
        </div>
      </Section>
    </>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminShell />
    </ProtectedRoute>
  );
}
