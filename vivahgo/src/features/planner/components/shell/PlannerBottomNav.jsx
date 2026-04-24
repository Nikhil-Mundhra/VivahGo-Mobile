import NavIcon from "../../../../components/NavIcon";
import { NAV_ITEMS } from "../../../../constants";

export default function PlannerBottomNav({ tab, vendorsView, tasksView, onTabChange }) {
  return (
    <div className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          className={`nav-item${tab === item.id ? " active" : ""}${item.id === "vendors" && tab === "vendors" && vendorsView === "my-vendors" ? " nav-item-vendors-alt" : ""}${item.id === "tasks" && tab === "tasks" && tasksView === "framework" ? " nav-item-tasks-alt" : ""}`}
          onClick={() => onTabChange(item.id)}
        >
          <div className="nav-icon"><NavIcon name={item.icon} /></div>
          <div className="nav-label">{item.label}</div>
          {tab === item.id ? <div className="nav-active-dot" /> : null}
        </div>
      ))}
    </div>
  );
}
