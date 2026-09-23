import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Flag,
  Loader2,
  MoreHorizontal,
  Plus,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  createNewGoal,
  fetchGoals,
  removeGoal,
  updateExistingGoal,
  updateGoalProgressValue,
} from "../../features/goals/goalSlice";

const STATUS_CONFIG = {
  not_started: {
    label: "Not started",
    className: "bg-neutral-800 text-neutral-300",
  },
  active: {
    label: "Active",
    className: "bg-blue-500/10 text-blue-400",
  },
  paused: {
    label: "Paused",
    className: "bg-yellow-500/10 text-yellow-400",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-400",
  },
  abandoned: {
    label: "Abandoned",
    className: "bg-red-500/10 text-red-400",
  },
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const toInputDate = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(value.getDate()).padStart(2, "0")}`;
};

const getDaysRemaining = (deadline) => {
  if (!deadline) return null;

  const end = new Date(deadline);
  const now = new Date();

  end.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);

  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};

const emptyForm = {
  title: "",
  description: "",
  category: "",
  startDate: "",
  deadline: "",
};

const GoalModal = ({ mode, goal, isSubmitting, onClose, onSubmit }) => {
  const [form, setForm] = useState(() => ({
    title: goal?.title || "",
    description: goal?.description || "",
    category: goal?.category || "",
    startDate: toInputDate(goal?.startDate),
    deadline: toInputDate(goal?.deadline),
  }));

  const [error, setError] = useState("");

  const isEdit = mode === "edit";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Goal title is required.");
      return;
    }

    if (!form.startDate || !form.deadline) {
      setError("Start date and deadline are required.");
      return;
    }

    if (new Date(form.deadline) < new Date(form.startDate)) {
      setError("Deadline cannot be before the start date.");
      return;
    }

    const success = await onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
    });

    if (!success) return;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-[#111111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isEdit ? "Edit goal" : "Create a goal"}
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              {isEdit
                ? "Update the details of your goal."
                : "Turn something you want to achieve into a clear target."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Goal title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={200}
              placeholder="e.g. Complete MERN project"
              className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={2000}
              rows={4}
              placeholder="What do you want to accomplish?"
              className="w-full resize-none rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Category
            </label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              maxLength={100}
              placeholder="e.g. Coding, Fitness, Study"
              className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Start date
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
                />

                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-neutral-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Deadline
              </label>

              <div className="relative">
                <Flag
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
                />

                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-neutral-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Save changes" : "Create goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProgressModal = ({ goal, isSubmitting, onClose, onSubmit }) => {
  const [progress, setProgress] = useState(goal?.progressPercentage ?? 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(Number(progress));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#111111] p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Update progress
            </h2>

            <p className="mt-1 max-w-[300px] truncate text-xs text-neutral-500">
              {goal?.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="text-center">
            <span className="text-5xl font-semibold tracking-tight text-white">
              {progress}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={progress}
            onChange={(event) => setProgress(event.target.value)}
            className="mt-7 w-full accent-white"
          />

          <div className="mt-2 flex justify-between text-xs text-neutral-600">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-neutral-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              Update progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GoalCard = ({ goal, onEdit, onDelete, onProgress, onMilestones }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const status = STATUS_CONFIG[goal.status] || STATUS_CONFIG.not_started;
  const progress = Math.min(
    100,
    Math.max(0, Number(goal.progressPercentage) || 0),
  );

  const daysRemaining = getDaysRemaining(goal.deadline);

  const deadlineText =
    daysRemaining === null
      ? "No deadline"
      : daysRemaining < 0
        ? `${Math.abs(daysRemaining)}d overdue`
        : daysRemaining === 0
          ? "Due today"
          : `${daysRemaining}d remaining`;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#111111] transition hover:border-neutral-700">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
              >
                {status.label}
              </span>

              {goal.category && (
                <span className="rounded-full border border-neutral-800 px-2.5 py-1 text-[11px] text-neutral-500">
                  {goal.category}
                </span>
              )}
            </div>

            <h2 className="mt-3 break-words text-base font-semibold text-white">
              {goal.title}
            </h2>

            {goal.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
                {goal.description}
              </p>
            )}
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-10 h-full w-full cursor-default"
                />

                <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-xl border border-neutral-800 bg-[#181818] py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(goal);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                  >
                    <Edit3 size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(goal);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Progress</span>
            <span className="font-semibold text-white">{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-800 bg-[#0d0d0d] px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <CalendarDays size={14} />
              Deadline
            </div>

            <p className="mt-1 text-sm font-medium text-neutral-300">
              {formatDate(goal.deadline)}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#0d0d0d] px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Clock3 size={14} />
              Time
            </div>

            <p
              className={`mt-1 text-sm font-medium ${
                daysRemaining !== null && daysRemaining < 0
                  ? "text-red-400"
                  : "text-neutral-300"
              }`}
            >
              {deadlineText}
            </p>
          </div>
        </div>

        <button
          onClick={() => onMilestones(goal)}
          className="flex items-center gap-2 border border-purple-500/20 bg-purple-500/5 px-4 py-2 text-sm font-medium text-purple-400 transition hover:border-purple-500/40 hover:bg-purple-500/10"
        >
          <Flag size={15} />
          Milestones
        </button>

        <button
          type="button"
          onClick={() => onProgress(goal)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
        >
          <Target size={15} />
          Update progress
        </button>
      </div>

      {goal.status === "completed" && (
        <div className="flex items-center gap-2 border-t border-emerald-500/10 bg-emerald-500/5 px-5 py-2.5 text-xs font-medium text-emerald-400">
          <Check size={14} />
          Goal completed
        </div>
      )}
    </article>
  );
};

const Goals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    goals,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isUpdatingProgress,
    isDeleting,
    error,
  } = useSelector((state) => state.goals);

  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [progressGoal, setProgressGoal] = useState(null);
  const [deleteGoal, setDeleteGoal] = useState(null);

  useEffect(() => {
    dispatch(fetchGoals({ page, limit: 10 }));
  }, [dispatch, page]);

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(
      (goal) => goal.status === "completed",
    ).length;
    const active = goals.filter((goal) => goal.status === "active").length;
    const average =
      total === 0
        ? 0
        : Math.round(
            goals.reduce(
              (sum, goal) => sum + (Number(goal.progressPercentage) || 0),
              0,
            ) / total,
          );

    return {
      total,
      completed,
      active,
      average,
    };
  }, [goals]);

  const handleCreate = async (goalData) => {
    const result = await dispatch(createNewGoal(goalData));

    if (createNewGoal.fulfilled.match(result)) {
      setShowCreateModal(false);
      return true;
    }

    return false;
  };

  const handleEdit = async (goalData) => {
    const result = await dispatch(
      updateExistingGoal({
        goalId: editingGoal._id,
        goalData,
      }),
    );

    if (updateExistingGoal.fulfilled.match(result)) {
      setEditingGoal(null);
      return true;
    }

    return false;
  };

  const handleProgress = async (progress) => {
    const result = await dispatch(
      updateGoalProgressValue({
        goalId: progressGoal._id,
        progress,
      }),
    );

    if (updateGoalProgressValue.fulfilled.match(result)) {
      setProgressGoal(null);
      return true;
    }

    return false;
  };

  const handleDelete = async () => {
    if (!deleteGoal) return;

    const result = await dispatch(removeGoal(deleteGoal._id));

    if (removeGoal.fulfilled.match(result)) {
      setDeleteGoal(null);
    }
  };

  const handlePrevious = () => {
    if (pagination?.hasPreviousPage) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (pagination?.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handleMilestones = (goal) => {
    navigate(`/milestones?goalId=${goal._id}`);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-[1000px]">
        <header className="flex flex-col gap-5 border-b border-neutral-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
                <Target size={19} />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Goals
              </h1>
            </div>

            <p className="mt-2 text-sm text-neutral-500">
              Turn intentions into measurable progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            <Plus size={16} />
            New goal
          </button>
        </header>

        <section className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-4">
          <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-4">
            <p className="text-xs text-neutral-500">Total goals</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-4">
            <p className="text-xs text-neutral-500">Active</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {stats.active}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-4">
            <p className="text-xs text-neutral-500">Completed</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {stats.completed}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-4">
            <p className="text-xs text-neutral-500">Average progress</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {stats.average}%
            </p>
          </div>
        </section>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {isLoading && goals.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[290px] animate-pulse rounded-2xl border border-neutral-800 bg-[#111111]"
              />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-[#111111] px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900">
              <Target size={24} className="text-neutral-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              No goals yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
              Create your first goal and start turning progress into momentum.
            </p>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Create your first goal
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {goals.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  onEdit={setEditingGoal}
                  onDelete={setDeleteGoal}
                  onProgress={setProgressGoal}
                  onMilestones={handleMilestones}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage || isLoading}
                  onClick={handlePrevious}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="text-sm text-neutral-500">
                  Page{" "}
                  <span className="font-medium text-neutral-300">
                    {pagination.page}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-neutral-300">
                    {pagination.totalPages}
                  </span>
                </span>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage || isLoading}
                  onClick={handleNext}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <GoalModal
          mode="create"
          isSubmitting={isCreating}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingGoal && (
        <GoalModal
          mode="edit"
          goal={editingGoal}
          isSubmitting={isUpdating}
          onClose={() => setEditingGoal(null)}
          onSubmit={handleEdit}
        />
      )}

      {progressGoal && (
        <ProgressModal
          goal={progressGoal}
          isSubmitting={isUpdatingProgress}
          onClose={() => setProgressGoal(null)}
          onSubmit={handleProgress}
        />
      )}

      {deleteGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-[#111111] p-5 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Trash2 size={19} />
            </div>

            <h2 className="mt-4 text-base font-semibold text-white">
              Delete this goal?
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              This will permanently delete{" "}
              <span className="font-medium text-neutral-300">
                {deleteGoal.title}
              </span>
              .
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteGoal(null)}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={15} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Goals;
