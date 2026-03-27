import { useMemo, useState } from "react";
import { formatCoverageLocation, getLocationCities, getLocationCountries, getLocationStates } from "../../../locationOptions";
import { MARRIAGE_TEMPLATES } from "../../../plannerDefaults.js";

function baseInputStyle() {
  return {
    width: "100%",
    padding: 10,
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: 8,
    fontSize: 13,
    boxSizing: "border-box",
  };
}

function SectionLabel({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--color-crimson)",
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

function parseVenueLocation(value) {
  const [city = "", state = "", country = ""] = String(value || "")
    .split(",")
    .map((item) => item.trim());
  return { country, state, city };
}

export default function NewMarriagePlanModal({
  onClose,
  onCreate,
  subscriptionTier = "starter",
  customTemplates = [],
  onCreateCustomTemplate,
}) {
  const [step, setStep] = useState("template");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    bride: "",
    groom: "",
    date: "",
    venue: "",
    guests: "",
    budget: "",
  });
  const [customTemplateForm, setCustomTemplateForm] = useState({
    name: "",
    description: "",
    culture: "",
    emoji: "✨",
    eventName: "",
    eventEmoji: "✨",
    events: [],
  });

  const canCreateCustomTemplates = subscriptionTier === "studio";
  const templateOptions = useMemo(
    () => [
      ...Object.values(MARRIAGE_TEMPLATES).map(template => ({ ...template, isCustom: false })),
      ...customTemplates.map(template => ({ ...template, isCustom: true })),
    ],
    [customTemplates]
  );
  const selectedTemplateDefinition = templateOptions.find(template => template.id === selectedTemplate) || null;
  const venueLocation = parseVenueLocation(formData.venue);
  const venueStates = getLocationStates(venueLocation.country);
  const venueCities = getLocationCities(venueLocation.country, venueLocation.state);

  function handleTemplateSelect(templateId) {
    setSelectedTemplate(templateId);
    setStep("details");
  }

  function handleInputChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleCreate() {
    if (!formData.bride.trim() || !formData.groom.trim()) {
      alert("Please enter both bride and groom names");
      return;
    }

    onCreate({
      ...formData,
      template: selectedTemplate || "blank",
    });
  }

  function addCustomTemplateEvent() {
    const name = customTemplateForm.eventName.trim();
    if (!name) {
      return;
    }

    setCustomTemplateForm(current => ({
      ...current,
      eventName: "",
      eventEmoji: "✨",
      events: [
        ...current.events,
        {
          name,
          emoji: current.eventEmoji.trim() || "✨",
          sortOrder: current.events.length,
        },
      ],
    }));
  }

  function removeCustomTemplateEvent(index) {
    setCustomTemplateForm(current => ({
      ...current,
      events: current.events
        .filter((_, eventIndex) => eventIndex !== index)
        .map((event, eventIndex) => ({ ...event, sortOrder: eventIndex })),
    }));
  }

  function handleCreateCustomTemplate() {
    if (!customTemplateForm.name.trim()) {
      alert("Please name your custom template");
      return;
    }

    if (customTemplateForm.events.length === 0) {
      alert("Add at least one ceremony to create a custom template");
      return;
    }

    const createdTemplate = onCreateCustomTemplate?.({
      name: customTemplateForm.name.trim(),
      description: customTemplateForm.description.trim(),
      culture: customTemplateForm.culture.trim() || "Custom",
      emoji: customTemplateForm.emoji.trim() || "✨",
      events: customTemplateForm.events,
    });

    if (!createdTemplate) {
      return;
    }

    setCustomTemplateForm({
      name: "",
      description: "",
      culture: "",
      emoji: "✨",
      eventName: "",
      eventEmoji: "✨",
      events: [],
    });
    setSelectedTemplate(createdTemplate.id);
    setStep("details");
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "flex-end",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: "100%",
          background: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: "24px 20px",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "slideUp 0.3s ease",
        }}
      >
        {step === "template" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--color-crimson)",
                  margin: "0 0 8px 0",
                }}
              >
                Plan Your New Marriage
              </h2>
              <p style={{ fontSize: 13, color: "var(--color-light-text)", margin: 0 }}>
                Choose a template or start fresh
              </p>
            </div>

            {canCreateCustomTemplates && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(212, 175, 55, 0.08)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                }}
              >
                <div style={{ color: "var(--color-crimson)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  Studio Feature
                </div>
                <div style={{ color: "var(--color-mid-text)", fontSize: 12.5, lineHeight: 1.5, marginBottom: 12 }}>
                  Create your own reusable ceremony template for planner-specific workflows and cultural variations.
                </div>
                <button type="button" className="btn-primary btn-gold" onClick={() => setStep("custom-template")}>
                  Create Custom Template
                </button>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {templateOptions.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  style={{
                    padding: 16,
                    border: "2px solid rgba(212, 175, 55, 0.2)",
                    borderRadius: 12,
                    background: "white",
                    cursor: "pointer",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 28 }}>{template.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-crimson)" }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-light-text)" }}>
                    {template.description}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-mid-text)", fontWeight: 600 }}>
                    {template.culture}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-crimson)", lineHeight: 1.35 }}>
                    {template.eventCount || 0} events
                    {template.highlights?.length ? `: ${template.highlights.join(" • ")}` : ""}
                  </div>
                  {template.isCustom ? (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--color-gold)",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      Custom
                    </div>
                  ) : null}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid rgba(212, 175, 55, 0.2)",
                borderRadius: 8,
                background: "white",
                color: "var(--color-light-text)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Cancel
            </button>
          </>
        )}

        {step === "custom-template" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--color-crimson)",
                  margin: "0 0 8px 0",
                }}
              >
                Create Custom Template
              </h2>
              <p style={{ fontSize: 13, color: "var(--color-light-text)", margin: 0 }}>
                Build a reusable ceremony flow for future wedding workspaces.
              </p>
            </div>

            <div style={{ marginBottom: 18 }}>
              <SectionLabel>Template Name</SectionLabel>
              <input
                type="text"
                value={customTemplateForm.name}
                onChange={event => setCustomTemplateForm(current => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Telugu Temple Wedding"
                style={baseInputStyle()}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <SectionLabel>Culture Label</SectionLabel>
                <input
                  type="text"
                  value={customTemplateForm.culture}
                  onChange={event => setCustomTemplateForm(current => ({ ...current, culture: event.target.value }))}
                  placeholder="e.g. Telugu"
                  style={baseInputStyle()}
                />
              </div>
              <div>
                <SectionLabel>Emoji</SectionLabel>
                <input
                  type="text"
                  value={customTemplateForm.emoji}
                  onChange={event => setCustomTemplateForm(current => ({ ...current, emoji: event.target.value }))}
                  placeholder="e.g. 🛕"
                  style={baseInputStyle()}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <SectionLabel>Description</SectionLabel>
              <textarea
                value={customTemplateForm.description}
                onChange={event => setCustomTemplateForm(current => ({ ...current, description: event.target.value }))}
                placeholder="Summarize the style or flow of this wedding format"
                rows={3}
                style={{ ...baseInputStyle(), resize: "vertical", minHeight: 90 }}
              />
            </div>

            <div
              style={{
                marginBottom: 18,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid rgba(212, 175, 55, 0.2)",
                background: "rgba(212, 175, 55, 0.05)",
              }}
            >
              <div style={{ color: "var(--color-crimson)", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
                Template Events
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 84px", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  value={customTemplateForm.eventName}
                  onChange={event => setCustomTemplateForm(current => ({ ...current, eventName: event.target.value }))}
                  placeholder="e.g. Pellikuthuru"
                  style={baseInputStyle()}
                />
                <input
                  type="text"
                  value={customTemplateForm.eventEmoji}
                  onChange={event => setCustomTemplateForm(current => ({ ...current, eventEmoji: event.target.value }))}
                  placeholder="✨"
                  style={baseInputStyle()}
                />
              </div>
              <button type="button" className="btn-secondary" onClick={addCustomTemplateEvent}>
                Add Event
              </button>
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {customTemplateForm.events.map((event, index) => (
                  <div
                    key={`${event.name}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "white",
                      border: "1px solid rgba(212, 175, 55, 0.14)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "var(--color-crimson)", fontWeight: 600, fontSize: 13 }}>
                        {event.emoji} {event.name}
                      </div>
                      <div style={{ color: "var(--color-light-text)", fontSize: 11 }}>
                        Included in future plan setup
                      </div>
                    </div>
                    <button type="button" className="btn-secondary" onClick={() => removeCustomTemplateEvent(index)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep("template")}
                style={{
                  flex: 1,
                  padding: 12,
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: 8,
                  background: "white",
                  color: "var(--color-light-text)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Back
              </button>
              <button type="button" className="btn-primary" onClick={handleCreateCustomTemplate}>
                Save Template
              </button>
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--color-crimson)",
                  margin: "0 0 8px 0",
                }}
              >
                Marriage Details
              </h2>
              <p style={{ fontSize: 13, color: "var(--color-light-text)", margin: 0 }}>
                {selectedTemplateDefinition?.name || "Basic Information"}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <SectionLabel>Bride's Name</SectionLabel>
                <input
                  type="text"
                  placeholder="e.g. Aarohi"
                  value={formData.bride}
                  onChange={event => handleInputChange("bride", event.target.value)}
                  style={baseInputStyle()}
                />
              </div>
              <div>
                <SectionLabel>Groom's Name</SectionLabel>
                <input
                  type="text"
                  placeholder="e.g. Kabir"
                  value={formData.groom}
                  onChange={event => handleInputChange("groom", event.target.value)}
                  style={baseInputStyle()}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Wedding Date</SectionLabel>
              <input
                type="text"
                placeholder="e.g. 14 February 2027"
                value={formData.date}
                onChange={event => handleInputChange("date", event.target.value)}
                style={baseInputStyle()}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Venue / Location</SectionLabel>
              <div style={{ display: "grid", gap: 10 }}>
                <select
                  value={venueLocation.country}
                  onChange={event => handleInputChange("venue", formatCoverageLocation({ country: event.target.value, state: "", city: "" }))}
                  style={baseInputStyle()}
                >
                  <option value="">Select country</option>
                  {getLocationCountries().map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                <select
                  value={venueLocation.state}
                  onChange={event => handleInputChange("venue", formatCoverageLocation({ country: venueLocation.country, state: event.target.value, city: "" }))}
                  style={baseInputStyle()}
                  disabled={!venueStates.length}
                >
                  <option value="">Select state</option>
                  {venueStates.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                <select
                  value={venueLocation.city}
                  onChange={event => handleInputChange("venue", formatCoverageLocation({ country: venueLocation.country, state: venueLocation.state, city: event.target.value }))}
                  style={baseInputStyle()}
                  disabled={!venueCities.length}
                >
                  <option value="">Select city</option>
                  {venueCities.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <SectionLabel>Expected Guests</SectionLabel>
                <input
                  type="text"
                  placeholder="e.g. 300"
                  value={formData.guests}
                  onChange={event => handleInputChange("guests", event.target.value)}
                  style={baseInputStyle()}
                />
              </div>
              <div>
                <SectionLabel>Budget (INR)</SectionLabel>
                <input
                  type="text"
                  placeholder="e.g. 50,00,000"
                  value={formData.budget}
                  onChange={event => handleInputChange("budget", event.target.value)}
                  style={baseInputStyle()}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep("template")}
                style={{
                  flex: 1,
                  padding: 12,
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: 8,
                  background: "white",
                  color: "var(--color-light-text)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreate}
                style={{
                  flex: 1,
                  padding: 12,
                  border: "none",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, var(--color-crimson), var(--color-deep-red))",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Create Plan
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%",
                padding: 12,
                border: "none",
                borderRadius: 8,
                background: "transparent",
                color: "var(--color-light-text)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                marginTop: 12,
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
