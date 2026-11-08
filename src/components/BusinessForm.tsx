import { useState, useEffect } from 'react';
import type { BusinessInfo } from '@/data/types';

interface BusinessFormProps {
  business: BusinessInfo;
  onChange: (business: BusinessInfo) => void;
  /** true quand le formulaire est valide; permet au parent d'activer "Continuer" */
  onValidityChange: (valid: boolean) => void;
}

interface FieldErrors {
  name?: string;
  whatsapp?: string;
  activity?: string;
  product?: string;
}

function validate(b: BusinessInfo): FieldErrors {
  const errors: FieldErrors = {};
  if (!b.name.trim()) errors.name = 'Indique ton nom.';
  // WhatsApp: au moins 8 chiffres, avec indicatif (+)
  const digits = b.whatsapp.replace(/\D/g, '');
  if (!b.whatsapp.trim()) {
    errors.whatsapp =
      "Indique ton numéro WhatsApp avec l'indicatif, par exemple +228 90 00 00 00.";
  } else if (!b.whatsapp.trim().startsWith('+')) {
    errors.whatsapp =
      "Commence par l'indicatif avec un +, par exemple +228 90 00 00 00.";
  } else if (digits.length < 8) {
    errors.whatsapp =
      'Le numéro doit contenir au moins 8 chiffres, par exemple +228 90 00 00 00.';
  }
  if (!b.activity.trim()) errors.activity = 'Indique ton activité (ex. restauration, mode, beauté).';
  if (!b.product.trim())
    errors.product = 'Décris le produit ou service que tu vas présenter.';
  return errors;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}

function InputField({
  id,
  label,
  value,
  placeholder,
  error,
  onChange,
  multiline,
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ocd-anthracite">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`mt-2 w-full rounded-16 border-2 px-4 py-3 text-ocd-anthracite outline-none transition-colors ${
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-ocd-line focus:border-ocd-orange'
          }`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-2 w-full rounded-16 border-2 px-4 py-3 text-ocd-anthracite outline-none transition-colors ${
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-ocd-line focus:border-ocd-orange'
          }`}
        />
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function BusinessForm({
  business,
  onChange,
  onValidityChange,
}: BusinessFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const errors = validate(business);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  // Erreurs affichées seulement si le champ a été touché
  const visibleErrors: FieldErrors = {};
  (Object.keys(errors) as Array<keyof FieldErrors>).forEach((key) => {
    if (touched[key]) visibleErrors[key] = errors[key];
  });

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Ton business</h2>
        <p className="mt-2 text-ocd-anthracite/60">
          Dis-nous qui tu es et ce que tu présentes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <InputField
          id="name"
          label="Ton nom"
          value={business.name}
          placeholder="Ex. Awa Diallo"
          error={visibleErrors.name}
          onChange={(v) => {
            onChange({ ...business, name: v });
            markTouched('name');
          }}
        />
        <InputField
          id="whatsapp"
          label="Numéro WhatsApp"
          value={business.whatsapp}
          placeholder="+228 90 00 00 00"
          error={visibleErrors.whatsapp}
          onChange={(v) => {
            onChange({ ...business, whatsapp: v });
            markTouched('whatsapp');
          }}
        />
        <InputField
          id="activity"
          label="Ton activité"
          value={business.activity}
          placeholder="Ex. restauration, mode, beauté"
          error={visibleErrors.activity}
          onChange={(v) => {
            onChange({ ...business, activity: v });
            markTouched('activity');
          }}
        />
        <InputField
          id="product"
          label="Produit ou service à présenter"
          value={business.product}
          placeholder="Ex. robes en pagne, plats à emporter..."
          error={visibleErrors.product}
          onChange={(v) => {
            onChange({ ...business, product: v });
            markTouched('product');
          }}
          multiline
        />
      </div>
    </div>
  );
}
