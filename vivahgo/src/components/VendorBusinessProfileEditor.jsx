import { useEffect, useState } from 'react';
import { updateVendorProfile } from '../api';
import { BUNDLED_SERVICE_OPTIONS, VENDOR_SUBTYPE_OPTIONS, VENDOR_TYPES } from '../constants';
import { formatCoverageLocation, getLocationCities, getLocationCountries, getLocationStates } from '../locationOptions';

const REGISTRATION_VENDOR_TYPES = VENDOR_TYPES.filter(type => type !== 'All');

function buildInitialForm(vendor) {
  return {
    businessName: vendor?.businessName || '',
    type: vendor?.type || REGISTRATION_VENDOR_TYPES[0],
    subType: vendor?.subType || '',
    bundledServices: Array.isArray(vendor?.bundledServices) ? vendor.bundledServices : [],
    description: vendor?.description || '',
    country: vendor?.country || '',
    state: vendor?.state || '',
    city: vendor?.city || '',
    coverageAreas: Array.isArray(vendor?.coverageAreas) ? vendor.coverageAreas : [],
    phone: vendor?.phone || '',
    website: vendor?.website || '',
  };
}

export default function VendorBusinessProfileEditor({ token, vendor, onVendorUpdated }) {
  const [form, setForm] = useState(() => buildInitialForm(vendor));
  const [coverageDraft, setCoverageDraft] = useState({ country: '', state: '', city: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const subtypeOptions = VENDOR_SUBTYPE_OPTIONS[form.type] || [];
  const primaryStates = getLocationStates(form.country);
  const primaryCities = getLocationCities(form.country, form.state);
  const coverageStates = getLocationStates(coverageDraft.country);
  const coverageCities = getLocationCities(coverageDraft.country, coverageDraft.state);

  useEffect(() => {
    setForm(buildInitialForm(vendor));
  }, [vendor]);

  function updateForm(field, value) {
    setForm(current => {
      if (field === 'type') {
        const nextSubtypeOptions = VENDOR_SUBTYPE_OPTIONS[value] || [];
        return {
          ...current,
          type: value,
          subType: nextSubtypeOptions.includes(current.subType) ? current.subType : '',
        };
      }

      if (field === 'country') {
        return { ...current, country: value, state: '', city: '' };
      }

      if (field === 'state') {
        return { ...current, state: value, city: '' };
      }

      return { ...current, [field]: value };
    });
  }

  function updateCoverageDraft(field, value) {
    setCoverageDraft(current => {
      if (field === 'country') {
        return { country: value, state: '', city: '' };
      }
      if (field === 'state') {
        return { ...current, state: value, city: '' };
      }
      return { ...current, [field]: value };
    });
  }

  function addCoverageArea() {
    if (!coverageDraft.country || !coverageDraft.state || !coverageDraft.city) {
      return;
    }

    const nextArea = { ...coverageDraft };
    setForm(current => {
      const exists = current.coverageAreas.some(area => (
        area.country === nextArea.country &&
        area.state === nextArea.state &&
        area.city === nextArea.city
      ));

      if (exists) {
        return current;
      }

      return {
        ...current,
        coverageAreas: [...current.coverageAreas, nextArea],
      };
    });
    setCoverageDraft({ country: '', state: '', city: '' });
  }

  function removeCoverageArea(target) {
    setForm(current => ({
      ...current,
      coverageAreas: current.coverageAreas.filter(area => !(
        area.country === target.country &&
        area.state === target.state &&
        area.city === target.city
      )),
    }));
  }

  function toggleBundledService(service) {
    setForm(current => ({
      ...current,
      bundledServices: current.bundledServices.includes(service)
        ? current.bundledServices.filter(item => item !== service)
        : [...current.bundledServices, service],
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const data = await updateVendorProfile(token, form);
      onVendorUpdated?.(data.vendor);
      setForm(buildInitialForm(data.vendor));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Could not save profile changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="vendor-registration-label" htmlFor="businessName">Business Name</label>
          <input id="businessName" value={form.businessName} onChange={event => updateForm('businessName', event.target.value)} className="vendor-registration-field" />
        </div>
        <div>
          <label className="vendor-registration-label" htmlFor="type">Category</label>
          <select id="type" value={form.type} onChange={event => updateForm('type', event.target.value)} className="vendor-registration-field">
            {REGISTRATION_VENDOR_TYPES.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>

      {subtypeOptions.length > 0 && (
        <div>
          <label className="vendor-registration-label" htmlFor="subType">Subcategory</label>
          <select id="subType" value={form.subType} onChange={event => updateForm('subType', event.target.value)} className="vendor-registration-field">
            <option value="">Select a subcategory</option>
            {subtypeOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="vendor-registration-label" htmlFor="description">Description</label>
        <textarea id="description" value={form.description} onChange={event => updateForm('description', event.target.value)} className="vendor-registration-field vendor-registration-textarea" rows={4} />
      </div>

      <div className="vendor-registration-location-block">
        <div className="vendor-registration-section-title">Also Offers</div>
        <div className="vendor-registration-chip-list">
          {BUNDLED_SERVICE_OPTIONS.filter(option => option !== form.type).map(option => (
            <button
              key={option}
              type="button"
              className={`vendor-registration-chip${form.bundledServices.includes(option) ? ' active' : ''}`}
              onClick={() => toggleBundledService(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="vendor-registration-location-block">
        <div className="vendor-registration-section-title">Primary Service Location</div>
        <div className="vendor-registration-grid vendor-registration-grid-3">
          <select value={form.country} onChange={event => updateForm('country', event.target.value)} className="vendor-registration-field">
            <option value="">Select country</option>
            {getLocationCountries().map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={form.state} onChange={event => updateForm('state', event.target.value)} className="vendor-registration-field" disabled={!primaryStates.length}>
            <option value="">Select state</option>
            {primaryStates.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={form.city} onChange={event => updateForm('city', event.target.value)} className="vendor-registration-field" disabled={!primaryCities.length}>
            <option value="">Select city</option>
            {primaryCities.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>

      <div className="vendor-registration-location-block">
        <div className="vendor-registration-section-title">Additional Coverage Areas</div>
        <div className="vendor-registration-grid vendor-registration-grid-3">
          <select value={coverageDraft.country} onChange={event => updateCoverageDraft('country', event.target.value)} className="vendor-registration-field">
            <option value="">Select country</option>
            {getLocationCountries().map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={coverageDraft.state} onChange={event => updateCoverageDraft('state', event.target.value)} className="vendor-registration-field" disabled={!coverageStates.length}>
            <option value="">Select state</option>
            {coverageStates.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={coverageDraft.city} onChange={event => updateCoverageDraft('city', event.target.value)} className="vendor-registration-field" disabled={!coverageCities.length}>
            <option value="">Select city</option>
            {coverageCities.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <button type="button" className="vendor-registration-add-btn" onClick={addCoverageArea}>
          Add Coverage Area
        </button>
        {form.coverageAreas.length > 0 && (
          <div className="vendor-registration-chip-list">
            {form.coverageAreas.map(area => (
              <button key={formatCoverageLocation(area)} type="button" className="vendor-registration-chip" onClick={() => removeCoverageArea(area)}>
                {formatCoverageLocation(area)} ×
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="vendor-registration-label" htmlFor="phone">Phone</label>
          <input id="phone" value={form.phone} onChange={event => updateForm('phone', event.target.value)} className="vendor-registration-field" />
        </div>
        <div>
          <label className="vendor-registration-label" htmlFor="website">Website</label>
          <input id="website" value={form.website} onChange={event => updateForm('website', event.target.value)} className="vendor-registration-field" />
        </div>
      </div>

      {error && <p className="vendor-registration-error">{error}</p>}

      <button type="submit" className="vendor-registration-submit" disabled={saving}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Business Details'}
      </button>
    </form>
  );
}
