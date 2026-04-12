import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EventIcon } from "../../../shared/lib/eventIcons.jsx";
import { useSwipeDown } from "../../../shared/hooks/useSwipeDown.js";
import { useBackButtonClose } from "../../../shared/hooks/useBackButtonClose.js";
import { addPlannerFrameworkCompletedStep, buildPlannerFramework, getPlannerFrameworkEncouragement, setPlannerFrameworkAnswer } from "../lib/plannerFramework.js";

function createTaskForm() {
  return { name: "", due: "", group: "Final", priority: "medium", eventId: "" };
}

const PRIORITY_COLORS = { high: "#EF5350", medium: "#FFA726", low: "#66BB6A" };
const FRAMEWORK_STEP_ROW_HEIGHT = 116;
const FRAMEWORK_STEP_PATH_TOP_PAD = 50;
const FRAMEWORK_STEP_NODE_CENTER = 41;
const FRAMEWORK_INCOMPLETE_ICON = "▶";
const FRAMEWORK_STEP_START_OFFSET = 12;
const FRAMEWORK_STEP_HORIZONTAL_GAP = 14;

function getFrameworkStepLeftOffset() {
  return FRAMEWORK_STEP_START_OFFSET;
}

function getFrameworkStepRightOffset() {
  return getFrameworkStepLeftOffset() + FRAMEWORK_STEP_HORIZONTAL_GAP;
}

function getFrameworkStepOffset(index) {
  return index % 2 === 0 ? getFrameworkStepLeftOffset() : getFrameworkStepRightOffset();
}

function getPhaseStepOffsets(_phaseNumber, stepCount) {
  return Array.from({ length: stepCount }, (_, index) => getFrameworkStepOffset(index));
}

function getFrameworkStepPath(points) {
  if (points.length < 2) {
    return "";
  }

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const verticalEase = FRAMEWORK_STEP_ROW_HEIGHT * 0.42;

    return `${path} C ${previous.x} ${previous.y + verticalEase}, ${point.x} ${point.y - verticalEase}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}

function getFrameworkPhaseThemeStyle(theme = {}) {
  return {
    "--phase-theme-start": theme.start,
    "--phase-theme-end": theme.end,
    "--phase-theme-shadow": theme.shadow,
    "--phase-theme-glow": theme.glow,
  };
}

function ChecklistView({ tasks, setTasks, events, planId }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(createTaskForm());
  const taskSwipe = useSwipeDown(() => setShowAdd(false));

  const groups = [...new Set(tasks.map(t => t.group))];
  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;

  function getTaskEvent(task) {
    return events.find(event => String(event.id) === String(task.eventId));
  }

  function toggle(id) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function add() {
    if (!form.name) return;
    const linkedEvent = events.find(event => String(event.id) === String(form.eventId));
    setTasks(ts => [...ts, { ...form, id: Date.now(), done: false, planId, ceremony: linkedEvent?.name || "General" }]);
    setForm(createTaskForm());
    setShowAdd(false);
  }

  function cancelAdd() {
    setForm(createTaskForm());
    setShowAdd(false);
  }

  useBackButtonClose(showAdd, cancelAdd);

  return (
    <div>
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: "var(--color-white)", borderRadius: 20, padding: "18px 20px", border: "1px solid rgba(212,175,55,0.15)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-light-text)", textTransform: "uppercase", letterSpacing: 1 }}>Wedding Checklist</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "var(--color-crimson)" }}>{done}/{tasks.length} tasks done</div>
            </div>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: `conic-gradient(var(--color-gold) ${pct * 3.6}deg, rgba(212,175,55,0.1) 0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--color-white)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--color-gold)" }}>{pct}%</div>
            </div>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 20 }}>
        <div className="section-title">Checklist</div>
        <button className="section-action guest-section-add" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>

      {groups.map(group => (
        <div key={group}>
          <div className="timeline-label">{group}</div>
          <div style={{ background: "var(--color-white)", borderRadius: 16, margin: "0 16px 12px", border: "1px solid rgba(212,175,55,0.15)" }}>
            {tasks.filter(t => t.group === group).map(t => (
              <div className="task-item" key={t.id} onClick={() => toggle(t.id)}>
                <div className={`task-check${t.done ? " done" : ""}`}>
                  {t.done && <span style={{ color: "var(--color-deep-red)", fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <div className="task-info">
                  <div className={`task-name${t.done ? " done" : ""}`}>{t.name}</div>
                  <div className="task-due">📅 {t.due}</div>
                  <div className="task-due" style={{ marginTop: 2 }}>
                    {getTaskEvent(t) ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <EventIcon eventName={getTaskEvent(t).name} emoji={getTaskEvent(t).emoji} size={16} />
                        <span>{getTaskEvent(t).name}</span>
                      </span>
                    ) : `✨ ${t.ceremony || "General"}`}
                  </div>
                </div>
                <div className="task-priority" style={{ background: PRIORITY_COLORS[t.priority] || "#9E9E9E" }} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {showAdd && (
        <div className="modal-overlay" onClick={cancelAdd}>
          <div className="modal" {...taskSwipe.modalProps} onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Add Task ✅</div>
            <div className="input-group">
              <div className="input-label">Task</div>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="What needs to be done?" />
            </div>
            <div className="input-group">
              <div className="input-label">Due / Timeline</div>
              <input className="input-field" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} placeholder="e.g. 3 months before" />
            </div>
            <div className="input-group">
              <div className="input-label">Group</div>
              <select className="select-field" value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}>
                {["6 months", "5 months", "4 months", "3 months", "2 months", "1 month", "Final", "Post Wedding"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="input-group">
              <div className="input-label">Linked Ceremony/Event</div>
              <select className="select-field" value={form.eventId} onChange={e => setForm({ ...form, eventId: e.target.value })}>
                <option value="">✨ General</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.emoji} {event.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <div className="input-label">Priority</div>
              <select className="select-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <button className="btn-secondary" onClick={cancelAdd}>Cancel</button>
            <button className="btn-primary" onClick={add}>Add Task</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FrameworkStepDetail({
  step,
  onBack,
  onCompleteStep,
  onAnswerQuestion,
}) {
  const questions = Array.isArray(step.questions) ? step.questions : [];
  const answeredCount = Number(step.answeredCount || 0);
  const questionCount = Number(step.questionCount || questions.length);
  const questionProgressPct = questionCount ? Math.round((answeredCount / questionCount) * 100) : 0;
  const hasQuestions = questionCount > 0;
  const firstUnansweredIndex = questions.findIndex((question) => !step.answers?.[question.id]);
  const [questionIndex, setQuestionIndex] = useState(() => firstUnansweredIndex >= 0 ? firstUnansweredIndex : questions.length);
  const [encouragement, setEncouragement] = useState("");
  const currentQuestion = questionIndex < questions.length ? questions[questionIndex] : null;
  const selectedOptionId = currentQuestion ? step.answers?.[currentQuestion.id] : "";
  const selectedEncouragement = currentQuestion ? step.encouragements?.[currentQuestion.id] : "";
  const allQuestionsAnswered = !hasQuestions || answeredCount >= questionCount;

  function goToNextQuestion() {
    const nextIndex = questions.findIndex((question, index) => (
      index > questionIndex && !step.answers?.[question.id]
    ));
    if (nextIndex < 0 && allQuestionsAnswered && !step.isComplete) {
      onCompleteStep(step.id);
    }
    setQuestionIndex(nextIndex >= 0 ? nextIndex : questions.length);
    setEncouragement("");
  }

  function handleAnswerOption(question, option) {
    const nextEncouragement = getPlannerFrameworkEncouragement(step.id, question.id, option.id);
    setEncouragement(nextEncouragement);
    onAnswerQuestion(step.id, question.id, option.id, nextEncouragement);
  }

  return (
    <div className="framework-detail-screen">
      <div className="framework-detail-top">
        <button type="button" className="framework-detail-close" onClick={onBack} aria-label="Back to framework">×</button>
        <span className={`framework-detail-status${step.isComplete ? " complete" : ""}`}>
          {step.isComplete ? "Completed" : "Next step"}
        </span>
      </div>

      <div className="framework-detail-body">
        <div className="framework-detail-phase">Phase {step.phaseNumber}: {step.phaseTitle}</div>

        <div className="framework-detail-note">
          {step.isComplete
            ? step.completionSource === "derived"
              ? "VivahGo already found this in your planner."
              : "You marked this step complete."
            : hasQuestions
              ? "Answer one small check-in at a time. Your choices save as you go."
              : "Finish this step to keep your starter framework moving."}
        </div>
      </div>

      {hasQuestions && (
        <div className="framework-question-panel">
          <div className="framework-question-progress" aria-label={`Progress ${questionProgressPct}%`}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${questionProgressPct}%` }} />
            </div>
          </div>

          {currentQuestion ? (
            <div className="framework-question-card" key={currentQuestion.id}>
              <div className="framework-question-title">
                <span>{questionIndex + 1}</span>
                <h3>{currentQuestion.prompt}</h3>
              </div>
              <div className="framework-answer-grid">
                {(currentQuestion.options || []).map((option) => {
                  const isSelected = selectedOptionId === option.id;

                  return (
                    <button
                      type="button"
                      className={`framework-answer-option${isSelected ? " selected" : ""}`}
                      key={option.id}
                      onClick={() => handleAnswerOption(currentQuestion, option)}
                      aria-pressed={isSelected}
                    >
                      <span>{option.label}</span>
                      <small>{option.helper}</small>
                    </button>
                  );
                })}
              </div>

              {(encouragement || selectedEncouragement) && (
                <div className="framework-encouragement">
                  <div>{encouragement || selectedEncouragement}</div>
                </div>
              )}

              <div className="framework-question-actions">
                <button type="button" className="framework-action-btn" onClick={goToNextQuestion}>Skip</button>
                <button
                  type="button"
                  className="framework-action-btn"
                  onClick={goToNextQuestion}
                  disabled={!selectedOptionId}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="framework-question-card framework-question-card-done">
              <div className="framework-question-title">
                <span>✓</span>
                <h3>{allQuestionsAnswered ? "All check-ins answered." : "Paused with partial progress."}</h3>
              </div>
              <p>
                {allQuestionsAnswered
                  ? "You can finish this step now, or come back later to review your choices."
                  : "You skipped at least one prompt. Your step border shows the progress you have made so far."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FrameworkOverview({
  wedding,
  vendors,
  expenses,
  guests,
  frameworkProgress,
  onUpdateFrameworkProgress,
}) {
  const [activeStepId, setActiveStepId] = useState("");
  const [previewStepId, setPreviewStepId] = useState("");
  const skipPreviewHistoryBackRef = useRef(false);
  const shouldSkipPreviewHistoryBack = useCallback(() => skipPreviewHistoryBackRef.current, []);
  const framework = useMemo(() => buildPlannerFramework({
    wedding,
    vendors,
    expenses,
    guests,
    frameworkProgress,
  }), [expenses, frameworkProgress, guests, vendors, wedding]);
  const pct = framework.totalCount ? Math.round(framework.completedCount / framework.totalCount * 100) : 0;
  const activeStep = activeStepId ? framework.allSteps.find(step => step.id === activeStepId) : null;
  const previewStep = previewStepId ? framework.allSteps.find(step => step.id === previewStepId) : null;

  function handleCompleteStep(stepId) {
    onUpdateFrameworkProgress?.((currentProgress) => addPlannerFrameworkCompletedStep(currentProgress, stepId));
  }

  function handleAnswerQuestion(stepId, questionId, optionId, encouragement) {
    onUpdateFrameworkProgress?.((currentProgress) => (
      setPlannerFrameworkAnswer(currentProgress, stepId, questionId, optionId, encouragement)
    ));
  }

  function openStepPreview(stepId) {
    setPreviewStepId(stepId);
  }

  function startPreviewStep() {
    if (!previewStepId) {
      return;
    }

    skipPreviewHistoryBackRef.current = true;
    setActiveStepId(previewStepId);
    setPreviewStepId("");
  }

  useEffect(() => {
    if (!previewStepId) {
      skipPreviewHistoryBackRef.current = false;
    }
  }, [previewStepId]);

  useBackButtonClose(Boolean(activeStep), () => setActiveStepId(""));
  useBackButtonClose(Boolean(previewStep), () => setPreviewStepId(""), {
    shouldSkipHistoryBack: shouldSkipPreviewHistoryBack,
  });

  if (activeStep) {
    return (
      <FrameworkStepDetail
        step={activeStep}
        onBack={() => setActiveStepId("")}
        onCompleteStep={handleCompleteStep}
        onAnswerQuestion={handleAnswerQuestion}
      />
    );
  }

  return (
    <div className="framework-shell">
      <div className="framework-progress-card">
        <div>
          <div className="framework-progress-title">Your Wedding Blueprint</div>
          <div className="framework-progress-subtitle">
            The step-by-step foundation to plan your celebration with confidence.
          </div>
        </div>
        <div className="framework-progress-ring" style={{ "--framework-progress": `${pct * 3.6}deg` }}>
          <span>{pct}%</span>
        </div>
      </div>

      <div className="framework-path">
        {framework.phases.map((phase) => {
          const phaseOffsets = getPhaseStepOffsets(phase.number, phase.steps.length);
          const phasePathHeight = FRAMEWORK_STEP_PATH_TOP_PAD + phase.steps.length * FRAMEWORK_STEP_ROW_HEIGHT;
          const phasePathPoints = phase.steps.map((_, index) => ({
            x: phaseOffsets[index],
            y: FRAMEWORK_STEP_PATH_TOP_PAD + FRAMEWORK_STEP_NODE_CENTER + index * FRAMEWORK_STEP_ROW_HEIGHT,
          }));
          const phasePath = getFrameworkStepPath(phasePathPoints);

          return (
            <section
              className="framework-phase"
              key={phase.id}
              style={getFrameworkPhaseThemeStyle(phase.theme)}
            >
              <div className="framework-phase-head">
                <span>Phase {phase.number}</span>
                <h2>{phase.title}</h2>
                <p>{phase.summary}</p>
              </div>

              <div
                className="framework-step-list"
                style={{
                  "--phase-path-height": `${phasePathHeight}px`,
                  "--phase-path-top-pad": `${FRAMEWORK_STEP_PATH_TOP_PAD}px`,
                }}
              >
                {phasePath && (
                  <svg
                    className="framework-step-connector"
                    viewBox={`0 0 100 ${phasePathHeight}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d={phasePath} />
                  </svg>
                )}
                {phase.steps.map((step, index) => {
                  const pathX = phaseOffsets[index];
                  const isCurrent = framework.firstIncompleteId === step.id;
                  const answerProgress = Math.max(0, Math.min(1, Number(step.answerProgress || 0)));
                  const hasPartialProgress = !step.isComplete && answerProgress > 0;

                  return (
                    <div
                      className={`framework-step-wrap${isCurrent ? " current" : ""}`}
                      key={step.id}
                      style={{ "--path-x": `${pathX}%` }}
                    >
                      {framework.firstIncompleteId === step.id && (
                        <div className="framework-jump-callout">Start</div>
                      )}
                      <button
                        type="button"
                        className={`framework-step-node${step.isComplete ? " complete" : ""}${isCurrent ? " current" : ""}${hasPartialProgress ? " partial" : ""}`}
                        style={{ "--step-progress": `${answerProgress * 360}deg` }}
                        onClick={() => openStepPreview(step.id)}
                        aria-label={`${step.title}${step.isComplete ? " completed" : ""}`}
                      >
                        <span className="framework-step-icon" aria-hidden="true">{step.isComplete ? "✓" : FRAMEWORK_INCOMPLETE_ICON}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {previewStep && (
        <div className="modal-overlay" onClick={() => setPreviewStepId("")}>
          <div className="framework-preview-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="framework-preview-close" onClick={() => setPreviewStepId("")} aria-label="Close step preview">×</button>
            <div className={`framework-preview-icon${previewStep.isComplete ? " complete" : ""}`}>
                {previewStep.isComplete ? "✓" : FRAMEWORK_INCOMPLETE_ICON}
            </div>
            <div className="framework-preview-phase">Phase {previewStep.phaseNumber}</div>
            <h2>{previewStep.title}</h2>
            <p>{previewStep.shortSummary}</p>
            <div className="framework-preview-minutes">{previewStep.minutes} min</div>
            <button type="button" className="btn-primary framework-preview-start" onClick={startPreviewStep}>
              Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TasksScreen({
  tasks,
  setTasks,
  events,
  planId,
  view = "checklist",
  wedding = {},
  vendors = [],
  expenses = [],
  guests = [],
  frameworkProgress,
  onUpdateFrameworkProgress,
  onBackToChecklist,
}) {
  if (view === "framework") {
    return (
      <FrameworkOverview
        wedding={wedding}
        vendors={vendors}
        expenses={expenses}
        guests={guests}
        frameworkProgress={frameworkProgress}
        onUpdateFrameworkProgress={onUpdateFrameworkProgress}
      />
    );
  }

  return <ChecklistView tasks={tasks} setTasks={setTasks} events={events} planId={planId} />;
}

export default TasksScreen;
