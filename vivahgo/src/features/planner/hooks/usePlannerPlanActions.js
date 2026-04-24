import { formatCoverageLocation } from "../../../locationOptions";
import {
  DEFAULT_REMINDER_SETTINGS,
  DEFAULT_WEBSITE_SETTINGS,
  EMPTY_WEDDING,
  createTemplatePlanCollections,
  generatePlanId,
  normalizeCustomTemplates,
} from "../../../plannerDefaults";
import {
  addPlanCollaborator,
  fetchPlanCollaborators,
  fetchPlanner,
  plannerQueryKey,
  removePlanCollaborator,
  updatePlanCollaboratorRole,
} from "../api.js";
import { DEFAULT_FRAMEWORK_PROGRESS, normalizePlannerFrameworkProgress } from "../lib/plannerFramework.js";
import {
  derivePlanAccess,
  mergeActivePlanCollection,
  normalizeEmail,
  parseWeddingLocation,
  roleToAccess,
} from "../lib/plannerShellState.js";

export function usePlannerPlanActions({
  store,
  queryClient,
  authToken,
  authMode,
  plannerOwnerId,
  refreshAccessibleWorkspaces,
  hydratePlannerFromResponse,
  persistSession,
}) {
  const {
    activePlan,
    activePlanId,
    collaborators,
    configuringPlanId,
    customTemplates,
    extraVenueOptions,
    marriages,
    planAccess,
    plannerOwnerId: currentPlannerOwnerId,
    setActivePlanId,
    setCollaborators,
    setConfiguringPlanId,
    setEvents,
    setExpenses,
    setGuests,
    setIsSwitchingWorkspace,
    setLoginError,
    setMarriages,
    setPlanAccess,
    setScreen,
    setShowAccountSettings,
    setShowExtraLocationForm,
    setShowFeedbackModal,
    setShowNewPlanModal,
    setShowShareModal,
    setShowUpgradePrompt,
    setShowWeddingDetailsEditor,
    setTasks,
    setUpgradePromptMessage,
    setVendors,
    setWedding,
    setWeddingDetailsForm,
    setExtraLocationDraft,
    setOnboardingCompleted,
    setRequiresOnboarding,
    setTab,
    setCustomTemplates,
    setEventToEditId,
    subscription,
    user,
    wedding,
    weddingDetailsForm,
    extraLocationDraft,
  } = store;

  async function handleWorkspaceSwitch(nextOwnerId) {
    if (!nextOwnerId || !authToken || nextOwnerId === currentPlannerOwnerId) {
      return;
    }

    try {
      setIsSwitchingWorkspace(true);
      const response = await queryClient.fetchQuery({
        queryKey: plannerQueryKey(nextOwnerId),
        queryFn: () => fetchPlanner(authToken, nextOwnerId),
      });
      persistSession({
        mode: authMode || "google",
        token: authToken,
        user,
        plannerOwnerId: response?.plannerOwnerId || nextOwnerId,
      });
      hydratePlannerFromResponse(response, {
        resetJournal: true,
        fallbackPlannerOwnerId: response?.plannerOwnerId || nextOwnerId,
      });
      setConfiguringPlanId(null);
    } catch (error) {
      console.error("Workspace switch failed:", error);
      setLoginError(error.message || "Could not switch workspace.");
    } finally {
      setIsSwitchingWorkspace(false);
    }
  }

  function switchToMarriage(planId) {
    if (!planId || planId === activePlanId) {
      return;
    }

    const targetPlan = marriages.find((item) => item.id === planId);
    if (!targetPlan) {
      return;
    }

    setActivePlanId(planId);
    setWedding({
      bride: targetPlan.bride || "",
      groom: targetPlan.groom || "",
      date: targetPlan.date || "",
      venue: targetPlan.venue || "",
      guests: targetPlan.guests || "",
      budget: targetPlan.budget || "",
    });
    setCollaborators(Array.isArray(targetPlan.collaborators) ? targetPlan.collaborators : []);
    setPlanAccess(derivePlanAccess(targetPlan, user?.email, "owner"));
  }

  function createNewMarriage(formData) {
    if (!planAccess.canEdit) {
      return;
    }

    if ((authMode === "google" || authMode === "clerk") && subscription.tier === "starter" && marriages.length >= 1) {
      setUpgradePromptMessage("Starter plan supports 1 wedding. Upgrade to Premium for unlimited wedding workspaces.");
      setShowUpgradePrompt(true);
      setShowNewPlanModal(false);
      return;
    }

    const newPlanId = generatePlanId();
    const seededCollections = createTemplatePlanCollections(formData.template, newPlanId, customTemplates);
    const newMarriage = {
      id: newPlanId,
      bride: formData.bride,
      groom: formData.groom,
      date: formData.date,
      venue: formData.venue,
      extraLocations: [],
      guests: formData.guests,
      budget: formData.budget,
      template: formData.template,
      websiteSettings: { ...DEFAULT_WEBSITE_SETTINGS },
      reminderSettings: { ...DEFAULT_REMINDER_SETTINGS },
      frameworkProgress: normalizePlannerFrameworkProgress(DEFAULT_FRAMEWORK_PROGRESS),
      collaborators: user?.email
        ? [{ email: normalizeEmail(user.email), role: "owner", addedBy: user.id || "", addedAt: new Date() }]
        : [],
      createdAt: new Date(),
    };

    setMarriages((current) => [...current, newMarriage]);
    setEvents((current) => [...current, ...seededCollections.events]);
    setExpenses((current) => [...current, ...seededCollections.expenses]);
    setGuests((current) => [...current, ...seededCollections.guests]);
    setVendors((current) => [...current, ...seededCollections.vendors]);
    setTasks((current) => [...current, ...seededCollections.tasks]);
    setActivePlanId(newPlanId);
    setWedding({
      bride: newMarriage.bride || "",
      groom: newMarriage.groom || "",
      date: newMarriage.date || "",
      venue: newMarriage.venue || "",
      guests: newMarriage.guests || "",
      budget: newMarriage.budget || "",
    });
    setCollaborators(newMarriage.collaborators || []);
    setPlanAccess({ role: "owner", canEdit: true, canManageSharing: true });
    setShowNewPlanModal(false);
  }

  function createCustomTemplate(templateData) {
    if (subscription.tier !== "studio") {
      setUpgradePromptMessage("Custom templates are available on the Studio plan.");
      setShowUpgradePrompt(true);
      return null;
    }

    const nextTemplate = {
      id: `custom_template_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: templateData.name,
      description: templateData.description,
      culture: templateData.culture,
      emoji: templateData.emoji,
      events: templateData.events,
      createdAt: new Date(),
      isCustom: true,
    };

    const normalizedTemplate = normalizeCustomTemplates([nextTemplate])[0];
    setCustomTemplates((current) => [...current, normalizedTemplate]);
    return normalizedTemplate;
  }

  function deleteMarriage(planId) {
    if (!planAccess.canEdit) {
      return;
    }

    if (marriages.length <= 1) {
      alert("You must have at least one marriage plan");
      return;
    }

    const updatedMarriages = marriages.filter((item) => item.id !== planId);
    const deletedPlanWasActive = activePlanId === planId;
    const fallbackPlan = updatedMarriages[0] || null;

    setMarriages(updatedMarriages);

    if (deletedPlanWasActive && fallbackPlan) {
      setActivePlanId(fallbackPlan.id);
      setWedding({
        bride: fallbackPlan.bride || "",
        groom: fallbackPlan.groom || "",
        date: fallbackPlan.date || "",
        venue: fallbackPlan.venue || "",
        guests: fallbackPlan.guests || "",
        budget: fallbackPlan.budget || "",
      });
      setCollaborators(Array.isArray(fallbackPlan.collaborators) ? fallbackPlan.collaborators : []);
      setPlanAccess(derivePlanAccess(fallbackPlan, user?.email, "owner"));
    }

    setEvents((current) => current.filter((item) => item.planId !== planId));
    setExpenses((current) => current.filter((item) => item.planId !== planId));
    setGuests((current) => current.filter((item) => item.planId !== planId));
    setVendors((current) => current.filter((item) => item.planId !== planId));
    setTasks((current) => current.filter((item) => item.planId !== planId));
  }

  function openConfigurePlan(planId) {
    setConfiguringPlanId(planId);
  }

  function closeConfigurePlan() {
    setConfiguringPlanId(null);
  }

  async function openShareModal(planId) {
    const targetPlanId = planId || activePlanId;
    if (!targetPlanId) {
      return;
    }

    setConfiguringPlanId(targetPlanId);
    const currentPlan = marriages.find((item) => item.id === targetPlanId);
    setCollaborators(Array.isArray(currentPlan?.collaborators) ? currentPlan.collaborators : []);

    if ((authMode === "google" || authMode === "clerk") && authToken) {
      try {
        const response = await fetchPlanCollaborators(authToken, targetPlanId, plannerOwnerId);
        setCollaborators(Array.isArray(response.collaborators) ? response.collaborators : []);
      } catch (error) {
        console.error("Failed to fetch collaborators:", error);
      }
    }

    setShowShareModal(true);
  }

  function closeShareModal() {
    setShowShareModal(false);
  }

  function syncPlanCollaborators(planId, nextCollaborators) {
    setMarriages((current) => current.map((plan) => (
      plan.id === planId
        ? { ...plan, collaborators: nextCollaborators }
        : plan
    )));

    if (planId === activePlanId) {
      setCollaborators(nextCollaborators);
      const nextRole = nextCollaborators.find((item) => normalizeEmail(item.email) === normalizeEmail(user?.email))?.role || "viewer";
      setPlanAccess(roleToAccess(nextRole));
    }
  }

  async function handleAddCollaborator({ email, role }) {
    const targetPlanId = configuringPlanId || activePlanId;
    if (!targetPlanId) {
      return;
    }

    if ((authMode === "google" || authMode === "clerk") && authToken) {
      const response = await addPlanCollaborator(authToken, { planId: targetPlanId, email, role, plannerOwnerId });
      const nextCollaborators = Array.isArray(response.collaborators) ? response.collaborators : [];
      syncPlanCollaborators(targetPlanId, nextCollaborators);
      await refreshAccessibleWorkspaces(authToken);
      return;
    }

    const nextCollaborators = [...collaborators, { email, role, addedBy: user?.id || "", addedAt: new Date() }];
    syncPlanCollaborators(targetPlanId, nextCollaborators);
  }

  async function handleUpdateCollaboratorRole({ email, role }) {
    const targetPlanId = configuringPlanId || activePlanId;
    if (!targetPlanId) {
      return;
    }

    if ((authMode === "google" || authMode === "clerk") && authToken) {
      const response = await updatePlanCollaboratorRole(authToken, { planId: targetPlanId, email, role, plannerOwnerId });
      const nextCollaborators = Array.isArray(response.collaborators) ? response.collaborators : [];
      syncPlanCollaborators(targetPlanId, nextCollaborators);
      await refreshAccessibleWorkspaces(authToken);
      return;
    }

    const nextCollaborators = collaborators.map((item) => (
      normalizeEmail(item.email) === normalizeEmail(email)
        ? { ...item, role }
        : item
    ));
    syncPlanCollaborators(targetPlanId, nextCollaborators);
  }

  async function handleRemoveCollaborator({ email }) {
    const targetPlanId = configuringPlanId || activePlanId;
    if (!targetPlanId) {
      return;
    }

    if ((authMode === "google" || authMode === "clerk") && authToken) {
      const response = await removePlanCollaborator(authToken, { planId: targetPlanId, email, plannerOwnerId });
      const nextCollaborators = Array.isArray(response.collaborators) ? response.collaborators : [];
      syncPlanCollaborators(targetPlanId, nextCollaborators);
      await refreshAccessibleWorkspaces(authToken);
      return;
    }

    const nextCollaborators = collaborators.filter((item) => normalizeEmail(item.email) !== normalizeEmail(email));
    syncPlanCollaborators(targetPlanId, nextCollaborators);
  }

  function updateActiveMarriageWebsiteSettings(nextSettings) {
    if (!activePlanId || !planAccess.canEdit) {
      return;
    }

    setMarriages((current) => current.map((plan) => (
      plan.id === activePlanId
        ? {
          ...plan,
          websiteSettings: {
            ...DEFAULT_WEBSITE_SETTINGS,
            ...(plan.websiteSettings || {}),
            ...nextSettings,
          },
        }
        : plan
    )));
  }

  function updateActiveMarriageReminderSettings(nextSettings) {
    if (!activePlanId || !planAccess.canEdit) {
      return;
    }

    setMarriages((current) => current.map((plan) => (
      plan.id === activePlanId
        ? {
          ...plan,
          reminderSettings: {
            ...DEFAULT_REMINDER_SETTINGS,
            ...(plan.reminderSettings || {}),
            ...nextSettings,
          },
        }
        : plan
    )));
  }

  function updateActiveMarriageFrameworkProgress(nextProgressOrUpdater) {
    if (!activePlanId || !planAccess.canEdit) {
      return;
    }

    setMarriages((current) => current.map((plan) => {
      if (plan.id !== activePlanId) {
        return plan;
      }

      const currentProgress = normalizePlannerFrameworkProgress(plan.frameworkProgress);
      const nextProgress = typeof nextProgressOrUpdater === "function"
        ? nextProgressOrUpdater(currentProgress)
        : nextProgressOrUpdater;

      return {
        ...plan,
        frameworkProgress: normalizePlannerFrameworkProgress(nextProgress),
      };
    }));
  }

  function handleOnboardComplete(answers) {
    const selectedTemplate = answers?.template || "blank";
    const seededCollections = createTemplatePlanCollections(selectedTemplate, activePlanId, customTemplates);
    const { template: _template, ...answerFields } = answers || {};
    const nextWedding = {
      ...EMPTY_WEDDING,
      ...answerFields,
    };

    setMarriages((current) => current.map((plan) => (
      plan.id === activePlanId
        ? { ...plan, template: selectedTemplate }
        : plan
    )));
    setEvents((current) => mergeActivePlanCollection(current, seededCollections.events, activePlanId));
    setExpenses((current) => mergeActivePlanCollection(current, seededCollections.expenses, activePlanId));
    setGuests((current) => mergeActivePlanCollection(current, seededCollections.guests, activePlanId));
    setVendors((current) => mergeActivePlanCollection(current, seededCollections.vendors, activePlanId));
    setTasks((current) => mergeActivePlanCollection(current, seededCollections.tasks, activePlanId));

    store.applyWeddingToActivePlan(nextWedding);
    setOnboardingCompleted(true);
    setRequiresOnboarding(false);
    setScreen("app");
  }

  function handleSkipOnboarding() {
    store.applyWeddingToActivePlan({ ...EMPTY_WEDDING });
    setOnboardingCompleted(true);
    setRequiresOnboarding(false);
    setScreen("app");
  }

  function openWeddingDetailsEditor() {
    const location = parseWeddingLocation(wedding.venue);
    setWeddingDetailsForm({
      bride: wedding.bride || "",
      groom: wedding.groom || "",
      date: wedding.date || "",
      country: location.country,
      state: location.state,
      city: location.city,
      budget: wedding.budget || "",
      guests: wedding.guests || "",
    });
    setExtraLocationDraft({ country: "", state: "", city: "" });
    setShowExtraLocationForm(extraVenueOptions.length > 0);
    setShowWeddingDetailsEditor(true);
  }

  function closeWeddingDetailsEditor() {
    setShowWeddingDetailsEditor(false);
    setShowExtraLocationForm(false);
  }

  function addExtraWeddingLocation() {
    const location = formatCoverageLocation(extraLocationDraft);
    if (!location || location === wedding.venue) {
      return;
    }

    setMarriages((current) => current.map((plan) => {
      if (plan.id !== activePlanId) {
        return plan;
      }

      const existingLocations = Array.isArray(plan.extraLocations) ? plan.extraLocations : [];
      if (existingLocations.includes(location)) {
        return plan;
      }

      return {
        ...plan,
        extraLocations: [...existingLocations, location],
      };
    }));
    setExtraLocationDraft({ country: "", state: "", city: "" });
  }

  function removeExtraWeddingLocation(locationToRemove) {
    setMarriages((current) => current.map((plan) => (
      plan.id === activePlanId
        ? {
          ...plan,
          extraLocations: (Array.isArray(plan.extraLocations) ? plan.extraLocations : []).filter((location) => location !== locationToRemove),
        }
        : plan
    )));
  }

  function saveWeddingDetails() {
    if (!planAccess.canEdit) {
      return;
    }

    const nextWedding = {
      ...wedding,
      bride: weddingDetailsForm.bride,
      groom: weddingDetailsForm.groom,
      date: weddingDetailsForm.date,
      venue: formatCoverageLocation({
        country: weddingDetailsForm.country,
        state: weddingDetailsForm.state,
        city: weddingDetailsForm.city,
      }),
      budget: weddingDetailsForm.budget,
      guests: weddingDetailsForm.guests,
    };

    const nextExtraLocations = (Array.isArray(activePlan?.extraLocations) ? activePlan.extraLocations : []).filter((location) => location !== nextWedding.venue);
    store.applyWeddingToActivePlan(nextWedding, { extraLocations: nextExtraLocations });
    closeWeddingDetailsEditor();
  }

  function openAccountSettings() {
    setShowAccountSettings(true);
  }

  function closeAccountSettings() {
    setShowAccountSettings(false);
  }

  function handleStartOnboardingFromDemo() {
    closeAccountSettings();
    setScreen("onboard");
  }

  function openFeedbackModal() {
    setShowFeedbackModal(true);
  }

  function closeFeedbackModal() {
    setShowFeedbackModal(false);
  }

  function openEventEditorFromCalendar(eventId) {
    setEventToEditId(eventId);
    setTab("events");
    setTimeout(() => {
      setEventToEditId(null);
    }, 0);
  }

  return {
    handleWorkspaceSwitch,
    switchToMarriage,
    createNewMarriage,
    createCustomTemplate,
    deleteMarriage,
    openConfigurePlan,
    closeConfigurePlan,
    openShareModal,
    closeShareModal,
    handleAddCollaborator,
    handleUpdateCollaboratorRole,
    handleRemoveCollaborator,
    updateActiveMarriageWebsiteSettings,
    updateActiveMarriageReminderSettings,
    updateActiveMarriageFrameworkProgress,
    handleOnboardComplete,
    handleSkipOnboarding,
    openWeddingDetailsEditor,
    closeWeddingDetailsEditor,
    addExtraWeddingLocation,
    removeExtraWeddingLocation,
    saveWeddingDetails,
    openAccountSettings,
    closeAccountSettings,
    handleStartOnboardingFromDemo,
    openFeedbackModal,
    closeFeedbackModal,
    openEventEditorFromCalendar,
  };
}
