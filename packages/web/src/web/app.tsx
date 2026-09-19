import { Redirect, Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { Layout } from "./components/site/layout";
import { AgentFeedback } from "@runablehq/website-runtime";
import Index from "./pages/index";
import SuiviPage from "./pages/suivi";
import DevisPage from "./pages/devis";
import CovoiturageColisPage from "./pages/covoiturage-colis";
import DemenagementPage from "./pages/demenagement";
import InternationalPage from "./pages/international";
import ServicesPage from "./pages/services";
import TarifsPage from "./pages/tarifs";
import ZonesPage from "./pages/zones";
import FaqPage from "./pages/faq";
import AidePage from "./pages/aide";
import BlogPage from "./pages/blog";
import BlogPostPage from "./pages/blog-post";
import LivreurPage from "./pages/livreur";
import ProPage from "./pages/pro";
import PaiementPage from "./pages/paiement";
import PaiementRetourPage from "./pages/paiement-retour";
import FacturePage from "./pages/facture";
import ConnexionPage from "./pages/connexion";
import InscriptionPage from "./pages/inscription";
import EspaceClientPage from "./pages/espace-client";
import AdminPage from "./pages/admin";
import LegalPage from "./pages/legal";
import NotFoundPage from "./pages/not-found";

function App() {
  return (
    <Provider>
      <Layout>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/suivi" component={SuiviPage} />
          <Route path="/devis" component={DevisPage} />
          <Route path="/covoiturage-colis" component={CovoiturageColisPage} />
          <Route path="/demenagement" component={DemenagementPage} />
          <Route path="/commande-internationale" component={InternationalPage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/tarifs" component={TarifsPage} />
          <Route path="/zones" component={ZonesPage} />
          <Route path="/faq" component={FaqPage} />
          <Route path="/aide" component={AidePage} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          {/* Ancien formulaire transporteur : redirigé vers l'inscription livreur complète. */}
          <Route path="/devenir-transporteur">{() => <Redirect to="/livreur" replace />}</Route>
          <Route path="/livreur" component={LivreurPage} />
          <Route path="/pro" component={ProPage} />
          <Route path="/paiement/retour" component={PaiementRetourPage} />
          <Route path="/paiement/annule" component={PaiementRetourPage} />
          <Route path="/paiement/:ref" component={PaiementPage} />
          <Route path="/facture/:numero" component={FacturePage} />
          <Route path="/connexion" component={ConnexionPage} />
          <Route path="/inscription" component={InscriptionPage} />
          <Route path="/espace-client" component={EspaceClientPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/mentions-legales" component={LegalPage} />
          <Route path="/cgv" component={LegalPage} />
          <Route path="/livraison-delais" component={LegalPage} />
          <Route path="/annulation-remboursement" component={LegalPage} />
          <Route path="/confidentialite" component={LegalPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;
