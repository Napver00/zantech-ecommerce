import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { isBdMobile, normalisePhone } from "@/lib/phone";

const EMPTY = { f_name: "", l_name: "", phone: "", address: "", city: "", zip: "" };

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-background px-3.5 text-white outline-none transition-all placeholder:text-gray-500 focus:border-zan-cyan focus:ring-2 focus:ring-zan-cyan/25";

const CITY_SUGGESTIONS = ["Dhaka", "Chattogram", "Gazipur", "Narayanganj", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Cumilla"];

/** Add / edit a delivery address. Used on the Addresses page and inline at checkout. */
const AddressForm = ({ initial, onSubmit, onCancel, submitLabel = "Save address", submitting = false, idPrefix = "addr" }) => {
  const [values, setValues] = useState(() =>
    Object.fromEntries(Object.keys(EMPTY).map((k) => [k, initial?.[k] ?? ""]))
  );
  const [error, setError] = useState("");

  const set = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // checkout nests this inside its own form
    if (Object.values(values).some((v) => !String(v).trim())) {
      setError("Please fill in every field.");
      return;
    }
    const phone = normalisePhone(values.phone);
    if (!isBdMobile(phone)) {
      setError("Enter an 11-digit mobile number, e.g. 01712345678.");
      return;
    }
    const clean = Object.fromEntries(Object.entries({ ...values, phone }).map(([k, v]) => [k, String(v).trim()]));
    const message = await onSubmit(clean);
    if (message) setError(message);
  };

  const field = (name, label, props = {}) => (
    <div className={props.wide ? "sm:col-span-2" : ""}>
      <label htmlFor={`${idPrefix}-${name}`} className="mb-1.5 block text-sm font-medium text-gray-200">{label}</label>
      <input id={`${idPrefix}-${name}`} name={name} value={values[name]} onChange={set} className={inputCls} {...props.input} />
    </div>
  );

  // A <div> with its own submit handler, so it can live inside the checkout <form>.
  return (
    <div className="space-y-4" onKeyDown={(e) => e.key === "Enter" && e.target.tagName === "INPUT" && handleSubmit(e)}>
      {error && <p className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-500" role="alert">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("f_name", "First name", { input: { autoComplete: "given-name", placeholder: "First name" } })}
        {field("l_name", "Last name", { input: { autoComplete: "family-name", placeholder: "Last name" } })}
        {field("phone", "Mobile number", { wide: true, input: { type: "tel", inputMode: "numeric", autoComplete: "tel", placeholder: "01712345678" } })}
        {field("address", "House, road and area", { wide: true, input: { autoComplete: "street-address", placeholder: "House 12, Road 5, Sector 7, Uttara" } })}
        {field("city", "City / district", { input: { list: `${idPrefix}-cities`, autoComplete: "address-level2", placeholder: "Dhaka" } })}
        {field("zip", "Postcode", { input: { inputMode: "numeric", autoComplete: "postal-code", placeholder: "1230", maxLength: 10 } })}
        <datalist id={`${idPrefix}-cities`}>
          {CITY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zan-cyan px-5 text-sm font-bold text-zan-dark transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-white/15 px-5 text-sm font-semibold text-gray-300 hover:text-white">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressForm;
