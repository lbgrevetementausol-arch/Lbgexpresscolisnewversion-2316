import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileUp, Loader2, LogIn, Mail, ShieldCheck, Truck, UserPlus } from "lucide-react";
import { Card } from "../site/section";
import { Field, Input } from "../site/field";
import { CONTACT } from "../../lib/format";
import {
  uploadDriverDocument,
  useDriverForgotPassword,
  useDriverPasswordLogin,
  useDriverRegister,
  useDriverResendCode,
  useDriverResetPassword,
  useDriverVerifyEmail,
} from "../../queries/driver-account";

export interface DriverSession {
  id: number;
  name: string;
  email: string;
  vehicle: string | null;
  city: string | null;
  approvalStatus: string;
  available: boolean;
  token: string;
}

type Mode = "login" | "register" | "verify" | "forgot" | "reset";

const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60";
const linkBtn = "text-sm font-semibold text-primary underline-offset-4 hover:underline";

function errMessage(error: unknown, fallback: string) {
  const m = (error as { message?: string } | null)?.message;
  return m && m.length < 200 ? m : fallback;
}

export function DriverAuth({
  onLogged,
  initialMode = "login",
  resetToken,
}: {
  onLogged: (session: DriverSession) => void;
  initialMode?: Mode;
  resetToken?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pendingEmail, setPendingEmail] = useState("");

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      <div>
        {mode === "login" ? (
          <LoginForm
            onLogged={onLogged}
            onRegister={() => setMode("register")}
            onForgot={() => setMode("forgot")}
            onNeedVerify={(email) => {
              setPendingEmail(email);
              setMode("verify");
            }}
          />
        ) : null}

        {mode === "register" ? (
          <RegisterForm
            onRegistered={(email) => {
              setPendingEmail(email);
              setMode("verify");
            }}
            onBack={() => setMode("login")}
          />
        ) : null}

        {mode === "verify" ? (
          <VerifyForm email={pendingEmail} onDone={() => setMode("login")} onBack={() => setMode("login")} />
        ) : null}

        {mode === "forgot" ? <ForgotForm onBack={() => setMode("login")} /> : null}

        {mode === "reset" ? <ResetForm token={resetToken ?? ""} onDone={() => setMode("login")} /> : null}
      </div>

      <div className="grid gap-5 lg:sticky lg:top-28">
        <Card hover={false}>
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <ShieldCheck className="size-5 text-primary" />
            Comment ça marche
          </h3>
          <ol className="mt-4 grid gap-3 text-sm text-muted">
            <li>
              <span className="font-semibold text-foreground">1. Inscription</span> — vos informations, votre véhicule
              et vos pièces justificatives (permis, pièce d'identité).
            </li>
            <li>
              <span className="font-semibold text-foreground">2. Vérification</span> — un code à 6 chiffres arrive sur
              votre e-mail, vous le saisissez pour confirmer l'adresse.
            </li>
            <li>
              <span className="font-semibold text-foreground">3. Validation</span> — LBG Express contrôle vos documents
              et active votre compte.
            </li>
            <li>
              <span className="font-semibold text-foreground">4. Courses</span> — passez-vous en « disponible » : dès
              qu'une course est payée, vous recevez un e-mail. Premier arrivé, premier servi.
            </li>
          </ol>
        </Card>
        <Card hover={false}>
          <h3 className="font-display text-base font-bold">Une question ?</h3>
          <p className="mt-2 text-sm text-muted">
            L'exploitation répond du lundi au samedi. Appelez-nous, on vous accompagne pour l'inscription.
          </p>
          <a href={CONTACT.phoneHref} className="mt-3 inline-flex font-display font-bold text-primary">
            {CONTACT.phone}
          </a>
        </Card>
      </div>
    </div>
  );
}

/* — Connexion — */

function LoginForm({
  onLogged,
  onRegister,
  onForgot,
  onNeedVerify,
}: {
  onLogged: (s: DriverSession) => void;
  onRegister: () => void;
  onForgot: () => void;
  onNeedVerify: (email: string) => void;
}) {
  const login = useDriverPasswordLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (res) =>
          onLogged({
            id: res.driver.id,
            name: res.driver.firstName ?? res.driver.name,
            email: res.driver.email,
            vehicle: res.driver.vehicle,
            city: res.driver.city,
            approvalStatus: res.driver.approvalStatus,
            available: res.driver.available,
            token: res.token,
          }),
        onError: (error) => {
          if (errMessage(error, "").includes("Vérifiez d'abord")) onNeedVerify(email);
        },
      },
    );
  };

  return (
    <Card hover={false}>
      <h2 className="font-display text-xl font-bold">Connexion livreur</h2>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <Field label="Adresse e-mail">
          <Input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.fr"
          />
        </Field>
        <Field label="Mot de passe">
          <Input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {login.isError ? (
          <p className="flex items-center gap-2 text-sm text-danger">
            <AlertTriangle className="size-4 shrink-0" />
            {errMessage(login.error, "E-mail ou mot de passe incorrect.")}
          </p>
        ) : null}

        <button type="submit" disabled={login.isPending} className={btn}>
          {login.isPending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          Se connecter
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <button type="button" onClick={onForgot} className={linkBtn}>
          Mot de passe oublié ?
        </button>
        <button type="button" onClick={onRegister} className="inline-flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="size-4 text-primary" />
          Créer un compte livreur
        </button>
      </div>
    </Card>
  );
}

/* — Inscription — */

interface DocState {
  key: string | null;
  name: string | null;
  error: string | null;
  loading: boolean;
}

const emptyDoc: DocState = { key: null, name: null, error: null, loading: false };

function DocUpload({
  label,
  hint,
  state,
  onChange,
}: {
  label: string;
  hint: string;
  state: DocState;
  onChange: (next: DocState) => void;
}) {
  const pick = async (file: File | undefined) => {
    if (!file) return;
    onChange({ key: null, name: file.name, error: null, loading: true });
    try {
      const key = await uploadDriverDocument(file);
      onChange({ key, name: file.name, error: null, loading: false });
    } catch (err) {
      onChange({ key: null, name: file.name, error: errMessage(err, "Téléversement impossible"), loading: false });
    }
  };

  return (
    <Field label={label} hint={hint}>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-surface-2 px-4 py-3 text-sm transition hover:border-primary/50">
        {state.loading ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        ) : state.key ? (
          <CheckCircle2 className="size-4 shrink-0 text-success" />
        ) : (
          <FileUp className="size-4 shrink-0 text-primary" />
        )}
        <span className="truncate text-muted">
          {state.loading ? "Envoi…" : (state.name ?? "Choisir un fichier (photo ou PDF)")}
        </span>
        <input
          type="file"
          aria-label="Choisir un fichier"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          className="hidden"
          onChange={(e) => void pick(e.target.files?.[0])}
        />
      </label>
      {state.error ? <p className="mt-1.5 text-xs text-danger">{state.error}</p> : null}
    </Field>
  );
}

function RegisterForm({ onRegistered, onBack }: { onRegistered: (email: string) => void; onBack: () => void }) {
  const register = useDriverRegister();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    vehicle: "",
    plate: "",
    siret: "",
    password: "",
    password2: "",
  });
  const [license, setLicense] = useState<DocState>(emptyDoc);
  const [idPhoto, setIdPhoto] = useState<DocState>(emptyDoc);
  const [vehicleDoc, setVehicleDoc] = useState<DocState>(emptyDoc);
  const [localError, setLocalError] = useState<string | null>(null);
  const [sameWhatsapp, setSameWhatsapp] = useState(true);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (form.password.length < 8) return setLocalError("Le mot de passe doit faire au moins 8 caractères.");
    if (form.password !== form.password2) return setLocalError("Les deux mots de passe ne correspondent pas.");
    if (!license.key) return setLocalError("Ajoutez la photo de votre permis de conduire.");
    if (!idPhoto.key) return setLocalError("Ajoutez votre photo d'identité.");

    register.mutate(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        whatsapp: (sameWhatsapp ? form.phone : form.whatsapp).trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        vehicle: form.vehicle.trim(),
        plate: form.plate.trim(),
        siret: form.siret.trim() || undefined,
        password: form.password,
        licenseKey: license.key,
        idPhotoKey: idPhoto.key,
        vehicleDocKey: vehicleDoc.key ?? undefined,
      },
      { onSuccess: (res) => onRegistered(res.email) },
    );
  };

  return (
    <Card hover={false}>
      <h2 className="font-display text-xl font-bold">Devenir livreur LBG Express</h2>
      <p className="mt-2 text-sm text-muted">
        Tous les champs marqués sont obligatoires. Vos documents sont stockés de façon sécurisée et ne sont consultables
        que par l'administration LBG Express.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom">
            <Input required minLength={2} value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
          </Field>
          <Field label="Nom">
            <Input required minLength={2} value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
          </Field>
        </div>

        <Field label="Adresse e-mail" hint="Le code de vérification y sera envoyé.">
          <Input required type="email" value={form.email} onChange={set("email")} autoComplete="email" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone">
            <Input required type="tel" value={form.phone} onChange={set("phone")} placeholder="06 12 34 56 78" />
          </Field>
          <Field label="WhatsApp">
            <div className="grid gap-2">
              <Input
                required={!sameWhatsapp}
                type="tel"
                value={sameWhatsapp ? form.phone : form.whatsapp}
                onChange={set("whatsapp")}
                disabled={sameWhatsapp}
                placeholder="06 12 34 56 78"
                className={sameWhatsapp ? "opacity-60" : ""}
              />
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  aria-label="Identique à mon téléphone"
                  checked={sameWhatsapp}
                  onChange={(e) => setSameWhatsapp(e.target.checked)}
                  className="size-4 accent-[var(--color-primary)]"
                />
                Identique à mon téléphone
              </label>
            </div>
          </Field>
        </div>

        <Field label="Adresse de résidence">
          <Input
            required
            minLength={6}
            value={form.address}
            onChange={set("address")}
            placeholder="12 rue des Lilas, 93100 Montreuil"
            autoComplete="street-address"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Ville">
            <Input required minLength={2} value={form.city} onChange={set("city")} placeholder="Montreuil" />
          </Field>
          <Field label="Véhicule">
            <Input required minLength={2} value={form.vehicle} onChange={set("vehicle")} placeholder="Renault Kangoo" />
          </Field>
          <Field label="Immatriculation">
            <Input
              required
              minLength={4}
              value={form.plate}
              onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))}
              placeholder="AB-123-CD"
            />
          </Field>
        </div>

        <Field label="SIRET (facultatif)" hint="Si vous êtes auto-entrepreneur ou société.">
          <Input value={form.siret} onChange={set("siret")} placeholder="123 456 789 00012" />
        </Field>

        <div className="grid gap-4 border-t border-border pt-4">
          <DocUpload
            label="Photo du permis de conduire"
            hint="Recto lisible, JPG/PNG/PDF, 8 Mo maximum."
            state={license}
            onChange={setLicense}
          />
          <DocUpload
            label="Photo d'identité"
            hint="Photo de votre visage ou pièce d'identité."
            state={idPhoto}
            onChange={setIdPhoto}
          />
          <DocUpload
            label="Carte grise ou attestation d'assurance (facultatif)"
            hint="Accélère la validation de votre dossier."
            state={vehicleDoc}
            onChange={setVehicleDoc}
          />
        </div>

        <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <Field label="Mot de passe" hint="8 caractères minimum.">
            <Input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirmer le mot de passe">
            <Input
              required
              type="password"
              minLength={8}
              value={form.password2}
              onChange={set("password2")}
              autoComplete="new-password"
            />
          </Field>
        </div>

        {localError || register.isError ? (
          <p className="flex items-start gap-2 text-sm text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {localError ?? errMessage(register.error, "Inscription impossible. Vérifiez vos informations.")}
          </p>
        ) : null}

        <button type="submit" disabled={register.isPending} className={btn}>
          {register.isPending ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
          Créer mon compte livreur
        </button>
      </form>

      <button type="button" onClick={onBack} className={`mt-5 ${linkBtn}`}>
        ← J'ai déjà un compte
      </button>
    </Card>
  );
}

/* — Vérification de l'e-mail — */

function VerifyForm({ email, onDone, onBack }: { email: string; onDone: () => void; onBack: () => void }) {
  const verify = useDriverVerifyEmail();
  const resend = useDriverResendCode();
  const [mail, setMail] = useState(email);
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Card hover={false}>
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <CheckCircle2 className="size-6 text-success" />
          Adresse confirmée
        </h2>
        <p className="mt-3 text-sm text-muted">
          Votre dossier part en validation chez LBG Express. Vous recevrez un e-mail dès que votre compte sera activé —
          en général sous 24 à 48 h ouvrées. Vous pouvez déjà vous connecter pour suivre l'avancement.
        </p>
        <button type="button" onClick={onDone} className={`mt-5 ${btn}`}>
          <LogIn className="size-4" />
          Aller à la connexion
        </button>
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <Mail className="size-5 text-primary" />
        Vérifiez votre e-mail
      </h2>
      <p className="mt-2 text-sm text-muted">
        Nous avons envoyé un code à 6 chiffres à <span className="font-semibold text-foreground">{mail || "votre adresse"}</span>.
        Il est valable 30 minutes. Pensez à regarder dans les spams.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify.mutate({ email: mail, code: code.trim() }, { onSuccess: () => setDone(true) });
        }}
        className="mt-6 grid gap-4"
      >
        {email ? null : (
          <Field label="Adresse e-mail">
            <Input required type="email" value={mail} onChange={(e) => setMail(e.target.value)} />
          </Field>
        )}
        <Field label="Code de vérification">
          <Input
            required
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="text-center font-mono text-lg tracking-[0.5em]"
          />
        </Field>

        {verify.isError ? (
          <p className="flex items-center gap-2 text-sm text-danger">
            <AlertTriangle className="size-4 shrink-0" />
            {errMessage(verify.error, "Code invalide.")}
          </p>
        ) : null}

        <button type="submit" disabled={verify.isPending || code.length !== 6} className={btn}>
          {verify.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Confirmer mon adresse
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={() => resend.mutate({ email: mail })}
          disabled={resend.isPending || !mail}
          className={linkBtn}
        >
          {resend.isSuccess ? "Nouveau code envoyé ✓" : "Renvoyer le code"}
        </button>
        <button type="button" onClick={onBack} className={linkBtn}>
          Retour à la connexion
        </button>
      </div>
    </Card>
  );
}

/* — Mot de passe oublié — */

function ForgotForm({ onBack }: { onBack: () => void }) {
  const forgot = useDriverForgotPassword();
  const [email, setEmail] = useState("");

  return (
    <Card hover={false}>
      <h2 className="font-display text-xl font-bold">Mot de passe oublié</h2>
      <p className="mt-2 text-sm text-muted">
        Indiquez votre adresse e-mail : si un compte livreur existe, vous recevrez un lien pour choisir un nouveau mot
        de passe. Le lien est valable 1 heure.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          forgot.mutate({ email });
        }}
        className="mt-6 grid gap-4"
      >
        <Field label="Adresse e-mail">
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>

        {forgot.isSuccess ? (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            Si un compte existe pour cette adresse, l'e-mail vient de partir.
          </p>
        ) : null}

        <button type="submit" disabled={forgot.isPending} className={btn}>
          {forgot.isPending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Recevoir le lien
        </button>
      </form>

      <button type="button" onClick={onBack} className={`mt-5 ${linkBtn}`}>
        ← Retour à la connexion
      </button>
    </Card>
  );
}

/* — Nouveau mot de passe (lien reçu par e-mail) — */

function ResetForm({ token, onDone }: { token: string; onDone: () => void }) {
  const reset = useDriverResetPassword();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (reset.isSuccess) {
    return (
      <Card hover={false}>
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <CheckCircle2 className="size-6 text-success" />
          Mot de passe modifié
        </h2>
        <p className="mt-3 text-sm text-muted">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <button type="button" onClick={onDone} className={`mt-5 ${btn}`}>
          <LogIn className="size-4" />
          Se connecter
        </button>
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <h2 className="font-display text-xl font-bold">Nouveau mot de passe</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setLocalError(null);
          if (password.length < 8) return setLocalError("8 caractères minimum.");
          if (password !== password2) return setLocalError("Les deux mots de passe ne correspondent pas.");
          reset.mutate({ token, password });
        }}
        className="mt-6 grid gap-4"
      >
        <Field label="Nouveau mot de passe" hint="8 caractères minimum.">
          <Input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirmer">
          <Input
            required
            type="password"
            minLength={8}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
          />
        </Field>

        {localError || reset.isError ? (
          <p className="flex items-center gap-2 text-sm text-danger">
            <AlertTriangle className="size-4 shrink-0" />
            {localError ?? errMessage(reset.error, "Lien invalide ou expiré. Refaites une demande.")}
          </p>
        ) : null}

        <button type="submit" disabled={reset.isPending} className={btn}>
          {reset.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          Enregistrer
        </button>
      </form>
    </Card>
  );
}
