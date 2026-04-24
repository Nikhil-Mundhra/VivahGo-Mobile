import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import "../../styles.css";
import SplashScreen from "./components/SplashScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import LoginScreen from "./components/LoginScreen";
import AccountScreen from "./components/AccountScreen";
import FeedbackModal from "../../components/FeedbackModal";
import LegalFooter from "../../components/LegalFooter";
import MarriagePlanSelector from "./components/MarriagePlanSelector";
import NewMarriagePlanModal from "./components/NewMarriagePlanModal";
import PlanShareModal from "./components/PlanShareModal";
import { buildLoginAuthOptions } from "../../loginAuthOptions.js";
import { shouldEnableClerkRuntime } from "../../clerkRuntime.js";
import { getMarketingUrl } from "../../siteUrls.js";
import { subscribeToForegroundMessages } from "../../firebaseMessaging.js";
import PlannerLoadingScreen from "./components/shell/PlannerLoadingScreen.jsx";
import PlannerTopBar from "./components/shell/PlannerTopBar.jsx";
import PlannerContentRouter from "./components/shell/PlannerContentRouter.jsx";
import PlannerBottomNav from "./components/shell/PlannerBottomNav.jsx";
import PlannerUpgradeModal from "./components/modals/PlannerUpgradeModal.jsx";
import PlannerConfigurePlanModal from "./components/modals/PlannerConfigurePlanModal.jsx";
import WeddingDetailsModal from "./components/modals/WeddingDetailsModal.jsx";
import { usePlannerStore } from "./hooks/usePlannerStore.js";
import { usePlannerViewport } from "./hooks/usePlannerViewport.js";
import { usePlannerPersistence } from "./hooks/usePlannerPersistence.js";
import { usePlannerNotifications } from "./hooks/usePlannerNotifications.js";
import { usePlannerSession } from "./hooks/usePlannerSession.js";
import { usePlannerPlanActions } from "./hooks/usePlannerPlanActions.js";

const PRICING_URL = getMarketingUrl("/pricing");

export default function PlannerShell() {
  const queryClient = useQueryClient();
  const marketingHomeUrl = getMarketingUrl("/");
  const store = usePlannerStore();
  const viewport = usePlannerViewport({
    screen: store.screen,
    setShowDesktopFooter: store.setShowDesktopFooter,
  });
  const { contentAreaRef, handlePlannerContentKeyDown } = viewport;
  const avatarPicture = store.user?.picture;
  const setAvatarLoadError = store.setAvatarLoadError;
  const persistence = usePlannerPersistence({ store, queryClient });
  const notifications = usePlannerNotifications({ store, queryClient });
  const session = usePlannerSession({
    store,
    queryClient,
    applyPlanner: persistence.applyPlanner,
    hydratePlannerFromResponse: persistence.hydratePlannerFromResponse,
    refreshAccessibleWorkspaces: persistence.refreshAccessibleWorkspaces,
    syncPlannerAuthority: persistence.syncPlannerAuthority,
    fetchAndApplyNotificationSettings: notifications.fetchAndApplyNotificationSettings,
  });
  const actions = usePlannerPlanActions({
    store,
    queryClient,
    authToken: store.authToken,
    authMode: store.authMode,
    plannerOwnerId: store.plannerOwnerId,
    refreshAccessibleWorkspaces: persistence.refreshAccessibleWorkspaces,
    hydratePlannerFromResponse: persistence.hydratePlannerFromResponse,
    persistSession: session.persistSession,
  });

  useEffect(() => {
    setAvatarLoadError(false);
  }, [avatarPicture, setAvatarLoadError]);

  useEffect(() => {
    let unsubscribe = () => {};
    let isActive = true;

    subscribeToForegroundMessages((payload) => {
      if (!isActive || typeof Notification === "undefined" || Notification.permission !== "granted") {
        return;
      }

      const title = payload?.notification?.title || "VivahGo reminder";
      const body = payload?.notification?.body || "You have an upcoming planner reminder.";
      new Notification(title, { body });
    }).then((nextUnsubscribe) => {
      unsubscribe = typeof nextUnsubscribe === "function" ? nextUnsubscribe : () => {};
    }).catch(() => {});

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [store.authToken]);

  if (store.isBootstrapping) {
    return <PlannerLoadingScreen />;
  }

  const saveLabel = store.saveState === "saving"
    ? "Saving..."
    : store.saveState === "saved"
      ? "Saved"
      : store.saveState === "error"
        ? "Save failed"
        : "";
  const accountName = (store.user?.name || "Account").trim() || "Account";
  const accountFirstName = accountName.split(/\s+/)[0] || accountName;
  const showOauthHelp = /invalid_client|no registered origin|origin.*not.*allowed|idpiframe/i.test(store.loginError);
  const isConfiguredClerkRuntimeAvailable = shouldEnableClerkRuntime({
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  });
  const isClerkRuntimeAvailable = typeof window === "undefined"
    ? isConfiguredClerkRuntimeAvailable
    : isConfiguredClerkRuntimeAvailable && window.__VIVAHGO_CLERK_UNAVAILABLE__ !== true;
  const authOptions = buildLoginAuthOptions(
    {
      onGoogleLogin: session.handleGoogleLoginSuccess,
      onClerkLogin: session.handleClerkLoginSuccess,
      onLoginError: session.handleLoginError,
      isLoggingIn: store.isLoggingIn,
    },
    {
      isClerkEnabled: isClerkRuntimeAvailable,
      hiddenOptionIds: ["facebook"],
    }
  );

  return (
    <div className="app-shell">
      {store.screen === "login" ? (
        <>
          <LoginScreen
            authOptions={authOptions}
            onDemoLogin={session.handleDemoLogin}
            onGoToHome={() => window.location.assign(marketingHomeUrl)}
            isLoggingIn={store.isLoggingIn}
            errorMessage={store.loginError}
            showOauthHelp={showOauthHelp}
          />
          <LegalFooter
            hasBottomNav={false}
            onOpenFeedback={actions.openFeedbackModal}
            aboutHref={marketingHomeUrl}
            aboutLabel="Home"
          />
        </>
      ) : null}

      {store.screen === "splash" ? (
        <SplashScreen
          onStart={() => store.setScreen(store.requiresOnboarding ? "onboard" : "app")}
          onSkip={actions.handleSkipOnboarding}
          showSkip={store.requiresOnboarding}
        />
      ) : null}

      {store.screen === "onboard" ? <OnboardingScreen onComplete={actions.handleOnboardComplete} /> : null}

      {store.screen === "app" ? (
        <div className="main-app">
          <PlannerTopBar
            marriages={store.marriages}
            activePlanId={store.activePlanId}
            onOpenPlanSelector={() => store.setShowMarriagePlanSelector(true)}
            onOpenWeddingDetailsEditor={actions.openWeddingDetailsEditor}
            planAccess={store.planAccess}
            wedding={store.wedding}
            authMode={store.authMode}
            saveLabel={saveLabel}
            onOpenAccountSettings={actions.openAccountSettings}
            user={store.user}
            avatarLoadError={store.avatarLoadError}
            onAvatarError={() => store.setAvatarLoadError(true)}
            accountName={accountName}
            accountFirstName={accountFirstName}
          />

          <div
            className={`content-area ${!store.planAccess.canEdit ? "content-area-readonly" : ""}`}
            ref={contentAreaRef}
            tabIndex={0}
            role="region"
            aria-label="Planner content"
            onKeyDown={handlePlannerContentKeyDown}
          >
            <PlannerContentRouter
              tab={store.tab}
              wedding={store.wedding}
              activeEvents={store.activeEvents}
              activeExpenses={store.activeExpenses}
              activeGuests={store.activeGuests}
              activeVendors={store.activeVendors}
              activeTasks={store.activeTasks}
              setActiveEvents={store.setActiveEvents}
              setActiveExpenses={store.setActiveExpenses}
              setActiveGuests={store.setActiveGuests}
              setActiveVendors={store.setActiveVendors}
              setActiveTasks={store.setActiveTasks}
              activePlanId={store.activePlanId}
              activeWeddingWebsitePath={store.activeWeddingWebsitePath}
              activeMarriage={store.activeMarriage}
              subscription={store.subscription}
              updateActiveMarriageWebsiteSettings={actions.updateActiveMarriageWebsiteSettings}
              eventToEditId={store.eventToEditId}
              presetVenues={store.presetVenues}
              authToken={store.authToken}
              plannerOwnerId={store.plannerOwnerId}
              vendorsView={store.vendorsView}
              setVendorsView={store.setVendorsView}
              tasksView={store.tasksView}
              setTasksView={store.setTasksView}
              updateActiveMarriageFrameworkProgress={actions.updateActiveMarriageFrameworkProgress}
              onOpenWeddingDetailsEditor={actions.openWeddingDetailsEditor}
              onOpenGuests={() => store.setTab("guests")}
              onOpenVendors={() => {
                store.setVendorsView("directory");
                store.setTab("vendors");
              }}
              handlePlannerTabChange={store.handlePlannerTabChange}
              openEventEditorFromCalendar={actions.openEventEditorFromCalendar}
            />
          </div>

          <PlannerBottomNav
            tab={store.tab}
            vendorsView={store.vendorsView}
            tasksView={store.tasksView}
            onTabChange={store.handlePlannerTabChange}
          />

          <LegalFooter
            hasBottomNav={true}
            isVisible={store.showDesktopFooter}
            onOpenFeedback={actions.openFeedbackModal}
            aboutHref={marketingHomeUrl}
            aboutLabel="Home"
          />

          {store.showAccountSettings ? (
            <AccountScreen
              user={store.user}
              authMode={store.authMode}
              subscription={store.subscription}
              activePlan={store.activeMarriage}
              planAccess={store.planAccess}
              notificationPreferences={store.notificationPreferences}
              notificationSupport={store.notificationSupport}
              notificationError={store.notificationError}
              isUpdatingNotifications={store.isUpdatingNotifications}
              onClose={actions.closeAccountSettings}
              onStartOnboarding={actions.handleStartOnboardingFromDemo}
              onExitDemoToLogin={() => {
                actions.closeAccountSettings();
                session.handleExitDemoToLogin();
              }}
              onEnableBrowserNotifications={notifications.handleEnableBrowserNotifications}
              onDisableBrowserNotifications={notifications.handleDisableBrowserNotifications}
              onSaveNotificationPreferences={notifications.handleSaveNotificationPreferences}
              onUpdateReminderSettings={actions.updateActiveMarriageReminderSettings}
              onLogout={() => {
                actions.closeAccountSettings();
                session.handleLogout();
              }}
              onDeleteAccount={session.handleDeleteAccount}
            />
          ) : null}

          {store.showFeedbackModal ? <FeedbackModal onClose={actions.closeFeedbackModal} /> : null}

          <PlannerUpgradeModal
            isOpen={store.showUpgradePrompt}
            message={store.upgradePromptMessage}
            pricingUrl={PRICING_URL}
            onClose={() => store.setShowUpgradePrompt(false)}
          />

          {store.showMarriagePlanSelector ? (
            <MarriagePlanSelector
              marriages={store.marriages}
              activePlanId={store.activePlanId}
              onSwitchPlan={actions.switchToMarriage}
              onCreatePlan={() => store.setShowNewPlanModal(true)}
              onDeletePlan={actions.deleteMarriage}
              onConfigurePlan={actions.openConfigurePlan}
              onClose={() => store.setShowMarriagePlanSelector(false)}
            />
          ) : null}

          {store.showNewPlanModal ? (
            <NewMarriagePlanModal
              onClose={() => store.setShowNewPlanModal(false)}
              subscriptionTier={store.subscription.tier}
              customTemplates={store.customTemplates}
              onCreateCustomTemplate={actions.createCustomTemplate}
              onCreate={actions.createNewMarriage}
            />
          ) : null}

          <PlannerConfigurePlanModal
            plan={store.marriages.find((item) => item.id === store.configuringPlanId)}
            isOpen={Boolean(store.configuringPlanId)}
            authMode={store.authMode}
            accessibleWorkspaces={store.accessibleWorkspaces}
            plannerOwnerId={store.plannerOwnerId}
            user={store.user}
            isSwitchingWorkspace={store.isSwitchingWorkspace}
            onWorkspaceSwitch={actions.handleWorkspaceSwitch}
            onShare={() => actions.openShareModal(store.configuringPlanId)}
            onClose={actions.closeConfigurePlan}
          />

          {store.showShareModal ? (
            <PlanShareModal
              plan={store.marriages.find((item) => item.id === (store.configuringPlanId || store.activePlanId))}
              collaborators={store.collaborators}
              canManageSharing={store.planAccess.canManageSharing}
              currentUserEmail={store.user?.email}
              onAdd={actions.handleAddCollaborator}
              onUpdateRole={actions.handleUpdateCollaboratorRole}
              onRemove={actions.handleRemoveCollaborator}
              onClose={actions.closeShareModal}
            />
          ) : null}

          <WeddingDetailsModal
            isOpen={store.showWeddingDetailsEditor}
            activePlan={store.activePlan}
            weddingDetailsForm={store.weddingDetailsForm}
            setWeddingDetailsForm={store.setWeddingDetailsForm}
            extraLocationDraft={store.extraLocationDraft}
            setExtraLocationDraft={store.setExtraLocationDraft}
            showExtraLocationForm={store.showExtraLocationForm}
            setShowExtraLocationForm={store.setShowExtraLocationForm}
            extraVenueOptions={store.extraVenueOptions}
            onAddExtraLocation={actions.addExtraWeddingLocation}
            onRemoveExtraLocation={actions.removeExtraWeddingLocation}
            onSave={actions.saveWeddingDetails}
            onClose={actions.closeWeddingDetailsEditor}
          />
        </div>
      ) : null}
    </div>
  );
}
