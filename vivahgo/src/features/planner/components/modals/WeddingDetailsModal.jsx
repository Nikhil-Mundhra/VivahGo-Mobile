import { EXPECTED_GUEST_OPTIONS } from "../../../../plannerDefaults";
import { getLocationCities, getLocationCountries, getLocationStates } from "../../../../locationOptions";
import { useSwipeDown } from "../../../../shared/hooks/useSwipeDown.js";
import { MONTHS, YEARS, formatDateStr, parseDateStr } from "../../lib/plannerShellState.js";

export default function WeddingDetailsModal({
  isOpen,
  activePlan,
  weddingDetailsForm,
  setWeddingDetailsForm,
  extraLocationDraft,
  setExtraLocationDraft,
  showExtraLocationForm,
  setShowExtraLocationForm,
  extraVenueOptions,
  onAddExtraLocation,
  onRemoveExtraLocation,
  onSave,
  onClose,
}) {
  const swipe = useSwipeDown(onClose);
  const weddingLocationCountries = getLocationCountries();
  const weddingLocationStates = getLocationStates(weddingDetailsForm.country);
  const weddingLocationCities = getLocationCities(weddingDetailsForm.country, weddingDetailsForm.state);
  const extraLocationStates = getLocationStates(extraLocationDraft.country);
  const extraLocationCities = getLocationCities(extraLocationDraft.country, extraLocationDraft.state);

  if (!isOpen) {
    return null;
  }

  const parsedDate = parseDateStr(weddingDetailsForm.date);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" {...swipe.modalProps} onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Edit Wedding Plan</div>
        <div style={{ color: "var(--color-light-text)", fontSize: 13, marginBottom: 12 }}>
          {activePlan?.bride || "Bride"} &amp; {activePlan?.groom || "Groom"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="input-group">
            <div className="input-label">Bride&apos;s Name</div>
            <input
              className="input-field"
              value={weddingDetailsForm.bride}
              onChange={(event) => setWeddingDetailsForm({ ...weddingDetailsForm, bride: event.target.value })}
              placeholder="e.g. Aarohi"
            />
          </div>
          <div className="input-group">
            <div className="input-label">Groom&apos;s Name</div>
            <input
              className="input-field"
              value={weddingDetailsForm.groom}
              onChange={(event) => setWeddingDetailsForm({ ...weddingDetailsForm, groom: event.target.value })}
              placeholder="e.g. Kabir"
            />
          </div>
        </div>
        <div className="input-group">
          <div className="input-label">Main Wedding Day</div>
          <div style={{ display: "flex", gap: 6 }}>
            <select
              className="select-field"
              style={{ flex: 1 }}
              value={parsedDate.day}
              onChange={(event) => setWeddingDetailsForm({
                ...weddingDetailsForm,
                date: formatDateStr({ ...parsedDate, day: event.target.value }),
              })}
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, index) => String(index + 1)).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              className="select-field"
              style={{ flex: 2 }}
              value={parsedDate.month}
              onChange={(event) => setWeddingDetailsForm({
                ...weddingDetailsForm,
                date: formatDateStr({ ...parsedDate, month: event.target.value }),
              })}
            >
              <option value="">Month</option>
              {MONTHS.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select
              className="select-field"
              style={{ flex: 2 }}
              value={parsedDate.year}
              onChange={(event) => setWeddingDetailsForm({
                ...weddingDetailsForm,
                date: formatDateStr({ ...parsedDate, year: event.target.value }),
              })}
            >
              <option value="">Year</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="input-group">
            <div className="input-label">Total Budget (₹)</div>
            <input
              className="input-field"
              type="number"
              value={weddingDetailsForm.budget}
              onChange={(event) => setWeddingDetailsForm({ ...weddingDetailsForm, budget: event.target.value })}
              placeholder="e.g. 5000000"
            />
          </div>
          <div className="input-group">
            <div className="input-label">Expected Guests</div>
            <select
              className="select-field"
              value={weddingDetailsForm.guests}
              onChange={(event) => setWeddingDetailsForm({ ...weddingDetailsForm, guests: event.target.value })}
            >
              <option value="">Select guests</option>
              {EXPECTED_GUEST_OPTIONS.map((guestCount) => (
                <option key={guestCount} value={guestCount}>{guestCount}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="input-group">
          <div className="input-label">Venue Location</div>
          <div className="vendor-registration-grid vendor-registration-grid-3">
            <select
              className="select-field"
              value={weddingDetailsForm.country}
              onChange={(event) => setWeddingDetailsForm({
                ...weddingDetailsForm,
                country: event.target.value,
                state: "",
                city: "",
              })}
            >
              <option value="">Select country</option>
              {weddingLocationCountries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              className="select-field"
              value={weddingDetailsForm.state}
              onChange={(event) => setWeddingDetailsForm({
                ...weddingDetailsForm,
                state: event.target.value,
                city: "",
              })}
              disabled={!weddingLocationStates.length}
            >
              <option value="">Select state</option>
              {weddingLocationStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <select
              className="select-field"
              value={weddingDetailsForm.city}
              onChange={(event) => setWeddingDetailsForm({ ...weddingDetailsForm, city: event.target.value })}
              disabled={!weddingLocationCities.length}
            >
              <option value="">Select city</option>
              {weddingLocationCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() => setShowExtraLocationForm((current) => !current)}
            aria-expanded={showExtraLocationForm}
            style={{
              marginTop: 0,
              padding: 0,
              border: "none",
              background: "transparent",
              color: "var(--color-light-text)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{showExtraLocationForm ? "▾" : "▸"}</span>
            <span>{showExtraLocationForm ? "Hide Additional Event Locations" : "Add Additional Event Locations"}</span>
          </button>
          {showExtraLocationForm ? (
            <>
              <div className="vendor-registration-grid vendor-registration-grid-3" style={{ marginTop: 10 }}>
                <select
                  className="select-field"
                  value={extraLocationDraft.country}
                  onChange={(event) => setExtraLocationDraft({ country: event.target.value, state: "", city: "" })}
                >
                  <option value="">Select country</option>
                  {weddingLocationCountries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <select
                  className="select-field"
                  value={extraLocationDraft.state}
                  onChange={(event) => setExtraLocationDraft({ ...extraLocationDraft, state: event.target.value, city: "" })}
                  disabled={!extraLocationStates.length}
                >
                  <option value="">Select state</option>
                  {extraLocationStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <select
                  className="select-field"
                  value={extraLocationDraft.city}
                  onChange={(event) => setExtraLocationDraft({ ...extraLocationDraft, city: event.target.value })}
                  disabled={!extraLocationCities.length}
                >
                  <option value="">Select city</option>
                  {extraLocationCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <button type="button" className="vendor-registration-add-btn" onClick={onAddExtraLocation}>
                Add Location
              </button>
            </>
          ) : null}
          {extraVenueOptions.length > 0 ? (
            <div className="vendor-registration-chip-list">
              {extraVenueOptions.map((location) => (
                <button
                  key={location}
                  type="button"
                  className="vendor-registration-chip"
                  onClick={() => onRemoveExtraLocation(location)}
                >
                  {location} ×
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button className="btn-primary" onClick={onSave}>Save Changes</button>
      </div>
    </div>
  );
}
