import { DEFAULT_WEBSITE_SETTINGS } from "../../../../plannerDefaults";
import Dashboard from "../../screens/Dashboard.jsx";
import EventsScreen from "../../screens/EventsScreen.jsx";
import BudgetScreen from "../../screens/BudgetScreen.jsx";
import GuestsScreen from "../../screens/GuestsScreen.jsx";
import VendorsScreen from "../../screens/VendorsScreen.jsx";
import TasksScreen from "../../screens/TasksScreen.jsx";
import { DEFAULT_FRAMEWORK_PROGRESS } from "../../lib/plannerFramework.js";

export default function PlannerContentRouter({
  tab,
  wedding,
  activeEvents,
  activeExpenses,
  activeGuests,
  activeVendors,
  activeTasks,
  setActiveEvents,
  setActiveExpenses,
  setActiveGuests,
  setActiveVendors,
  setActiveTasks,
  activePlanId,
  activeWeddingWebsitePath,
  activeMarriage,
  subscription,
  updateActiveMarriageWebsiteSettings,
  eventToEditId,
  presetVenues,
  authToken,
  plannerOwnerId,
  vendorsView,
  setVendorsView,
  tasksView,
  setTasksView,
  updateActiveMarriageFrameworkProgress,
  onOpenWeddingDetailsEditor,
  onOpenGuests,
  onOpenVendors,
  handlePlannerTabChange,
  openEventEditorFromCalendar,
}) {
  if (tab === "home") {
    return (
      <Dashboard
        wedding={wedding}
        events={activeEvents}
        expenses={activeExpenses}
        guests={activeGuests}
        budget={wedding.budget}
        onTabChange={handlePlannerTabChange}
        onEditEvent={openEventEditorFromCalendar}
      />
    );
  }

  if (tab === "events") {
    return (
      <EventsScreen
        events={activeEvents}
        setEvents={setActiveEvents}
        expenses={activeExpenses}
        setExpenses={setActiveExpenses}
        planId={activePlanId}
        websitePath={activeWeddingWebsitePath}
        websiteSettings={activeMarriage?.websiteSettings || DEFAULT_WEBSITE_SETTINGS}
        subscriptionTier={subscription.tier}
        onSaveWebsiteSettings={updateActiveMarriageWebsiteSettings}
        onOpenBudget={() => handlePlannerTabChange("budget")}
        initialEditingEventId={eventToEditId}
        defaultVenue={wedding.venue || ""}
        presetVenues={presetVenues}
      />
    );
  }

  if (tab === "budget") {
    return (
      <BudgetScreen
        expenses={activeExpenses}
        setExpenses={setActiveExpenses}
        wedding={wedding}
        events={activeEvents}
        planId={activePlanId}
      />
    );
  }

  if (tab === "guests") {
    return (
      <GuestsScreen
        guests={activeGuests}
        setGuests={setActiveGuests}
        planId={activePlanId}
        authToken={authToken}
        plannerOwnerId={plannerOwnerId}
      />
    );
  }

  if (tab === "vendors") {
    return (
      <VendorsScreen
        vendors={activeVendors}
        setVendors={setActiveVendors}
        events={activeEvents}
        planId={activePlanId}
        view={vendorsView}
        onBackToDirectory={() => setVendorsView("directory")}
        wedding={wedding}
        frameworkProgress={activeMarriage?.frameworkProgress || DEFAULT_FRAMEWORK_PROGRESS}
      />
    );
  }

  if (tab === "tasks") {
    return (
      <TasksScreen
        tasks={activeTasks}
        setTasks={setActiveTasks}
        events={activeEvents}
        planId={activePlanId}
        view={tasksView}
        wedding={wedding}
        vendors={activeVendors}
        expenses={activeExpenses}
        guests={activeGuests}
        frameworkProgress={activeMarriage?.frameworkProgress || DEFAULT_FRAMEWORK_PROGRESS}
        onUpdateFrameworkProgress={updateActiveMarriageFrameworkProgress}
        onBackToChecklist={() => setTasksView("checklist")}
        onOpenWeddingDetails={onOpenWeddingDetailsEditor}
        onOpenGuests={onOpenGuests}
        onOpenVendorDirectory={onOpenVendors}
      />
    );
  }

  return null;
}
