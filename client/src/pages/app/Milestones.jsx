import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Check,
  Circle,
  Edit3,
  Flag,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  fetchMilestones,
  createMilestone,
  updateMilestone,
  completeMilestone,
  deleteMilestone,
  clearMilestoneError,
} from "../../features/milestones/milestoneSlice";

import { fetchGoals } from "../../features/goals/goalSlice";

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitialForm = (milestone = null, nextOrder = 0) => ({
  title: milestone?.title || "",
  description: milestone?.description || "",
  order: milestone?.order ?? nextOrder,
});

const MilestoneForm = ({
  milestone,
  nextOrder,
  loading,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(getInitialForm(milestone, nextOrder));

  const isEditing = Boolean(milestone);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      order: Number(form.order),
    });
  };

  return (
    <div className="border border-purple-500/20 bg-purple-950/20 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            {isEditing ? "Edit milestone" : "Create milestone"}
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {isEditing
              ? "Update the details of this milestone."
              : "Break your goal into a smaller actionable step."}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-400">
            Title
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={200}
            placeholder="e.g. Complete React fundamentals"
            className="w-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
            autoFocus
          />

          <div className="mt-1 text-right text-[10px] text-gray-600">
            {form.title.length}/200
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-gray-400">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={1000}
            rows={3}
            placeholder="Describe what needs to be completed..."
            className="w-full resize-none border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
          />

          <div className="mt-1 text-right text-[10px] text-gray-600">
            {form.description.length}/1000
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-gray-400">
            Order
          </label>

          <input
            type="number"
            name="order"
            min="0"
            value={form.order}
            onChange={handleChange}
            className="w-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50"
          />

          <p className="mt-1 text-[10px] text-gray-600">
            Lower numbers appear first.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !form.title.trim()}
            className="flex items-center gap-2 bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}

            {isEditing ? "Save changes" : "Create milestone"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Milestones = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const goalId = searchParams.get("goalId");

  const { goals } = useSelector((state) => state.goals);

  const { milestonesByGoal, loading, actionLoading, error } = useSelector(
    (state) => state.milestones,
  );

  const goal = useMemo(
    () => goals?.find((item) => item._id === goalId),
    [goals, goalId],
  );

 const milestones = Array.isArray(milestonesByGoal[goalId])
   ? milestonesByGoal[goalId]
   : [];

  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [deleteMilestoneId, setDeleteMilestoneId] = useState(null);

  useEffect(() => {
    if (goalId) {
      dispatch(fetchMilestones(goalId));
    }
  }, [dispatch, goalId]);

  useEffect(() => {
    return () => {
      dispatch(clearMilestoneError());
    };
  }, [dispatch]);

  const completedCount = milestones.filter(
    (milestone) => milestone.status === "completed",
  ).length;

  const progress =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

  const handleCreate = async (form) => {
    const result = await dispatch(
      createMilestone({
        goalId,
        title: form.title,
        description: form.description,
        order: form.order,
      }),
    );

    if (createMilestone.fulfilled.match(result)) {
      setShowForm(false);

      await dispatch(fetchMilestones(goalId));
      await dispatch(fetchGoals({ page: 1 }));
    }
  };

  const handleUpdate = async (form) => {
    const result = await dispatch(
      updateMilestone({
        milestoneId: editingMilestone._id,
        goalId,
        title: form.title,
        description: form.description,
        order: form.order,
      }),
    );

    if (updateMilestone.fulfilled.match(result)) {
      setEditingMilestone(null);

      await dispatch(fetchMilestones(goalId));
      await dispatch(fetchGoals({ page: 1 }));
    }
  };

  const handleComplete = async (milestoneId) => {
    const result = await dispatch(
      completeMilestone({
        milestoneId,
        goalId,
      }),
    );

    if (completeMilestone.fulfilled.match(result)) {
      await dispatch(fetchMilestones(goalId));
      await dispatch(fetchGoals({ page: 1 }));
    }
  };

  const handleDelete = async (milestoneId) => {
    const result = await dispatch(
      deleteMilestone({
        milestoneId,
        goalId,
      }),
    );

    if (deleteMilestone.fulfilled.match(result)) {
      setDeleteMilestoneId(null);

      await dispatch(fetchMilestones(goalId));
      await dispatch(fetchGoals({ page: 1 }));
    }
  };

  if (!goalId) {
    return (
      <div className="min-h-full bg-[#09060f] px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate("/goals")}
            className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to goals
          </button>

          <div className="border border-white/10 bg-white/[0.02] p-10 text-center">
            <Flag size={36} className="mx-auto mb-4 text-purple-400" />

            <h2 className="text-lg font-semibold text-white">
              No goal selected
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Select a goal to view its milestones.
            </p>

            <button
              onClick={() => navigate("/goals")}
              className="mt-6 bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500"
            >
              View goals
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-full bg-[#09060f] px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate("/goals")}
            className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to goals
          </button>

          <div className="border border-white/10 bg-white/[0.02] p-10 text-center">
            <h2 className="text-lg font-semibold text-white">Goal not found</h2>

            <p className="mt-2 text-sm text-gray-500">
              This goal may have been removed or is not available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#09060f] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/goals")}
            className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to goals
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-purple-400">
                <Flag size={14} />
                Milestones
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {goal.title}
              </h1>

              {goal.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  {goal.description}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                dispatch(clearMilestoneError());
                setEditingMilestone(null);
                setShowForm(true);
              }}
              className="flex shrink-0 items-center justify-center gap-2 bg-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-500"
            >
              <Plus size={17} />
              Add milestone
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Milestone progress
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {completedCount}
                <span className="text-gray-500"> / {milestones.length}</span>
              </p>
            </div>

            <span className="text-xl font-semibold text-purple-400">
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden bg-white/5">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center justify-between border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <span>{error}</span>

            <button
              onClick={() => dispatch(clearMilestoneError())}
              className="ml-4 text-red-400/70 transition hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="mb-6">
            <MilestoneForm
              nextOrder={milestones.length}
              loading={actionLoading}
              onClose={() => setShowForm(false)}
              onSubmit={handleCreate}
            />
          </div>
        )}

        {/* Loading */}
        {loading && milestones.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center border border-white/10 bg-white/[0.02]">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 size={25} className="animate-spin text-purple-400" />
              <span className="text-sm">Loading milestones...</span>
            </div>
          </div>
        ) : milestones.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-purple-500/10 text-purple-400">
              <Flag size={22} />
            </div>

            <h2 className="text-base font-semibold text-white">
              No milestones yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Turn this goal into smaller actionable steps by creating your
              first milestone.
            </p>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500"
              >
                <Plus size={16} />
                Create milestone
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone, index) => {
              const isCompleted = milestone.status === "completed";

              const isEditing = editingMilestone?._id === milestone._id;

              const isDeleting = deleteMilestoneId === milestone._id;

              if (isEditing) {
                return (
                  <MilestoneForm
                    key={milestone._id}
                    milestone={milestone}
                    nextOrder={index}
                    loading={actionLoading}
                    onClose={() => setEditingMilestone(null)}
                    onSubmit={handleUpdate}
                  />
                );
              }

              return (
                <div
                  key={milestone._id}
                  className={`border bg-white/[0.02] transition ${
                    isCompleted
                      ? "border-emerald-500/10"
                      : "border-white/10 hover:border-purple-500/20"
                  }`}
                >
                  <div className="flex gap-4 p-5">
                    {/* Status */}
                    <div className="pt-0.5">
                      {isCompleted ? (
                        <div className="flex h-8 w-8 items-center justify-center bg-emerald-500/10 text-emerald-400">
                          <Check size={17} />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center bg-purple-500/10 text-purple-400">
                          <Circle size={15} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-sm font-semibold ${
                                isCompleted
                                  ? "text-gray-400 line-through"
                                  : "text-white"
                              }`}
                            >
                              {milestone.title}
                            </h3>

                            {isCompleted && (
                              <span className="bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
                                Completed
                              </span>
                            )}
                          </div>

                          {milestone.description && (
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                              {milestone.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-gray-600">
                            <span>Step {index + 1}</span>

                            {isCompleted && milestone.completedAt && (
                              <span>
                                Completed {formatDate(milestone.completedAt)}
                              </span>
                            )}

                            {milestone.createdAt && (
                              <span>
                                Created {formatDate(milestone.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-1">
                          {!isCompleted && (
                            <button
                              onClick={() => handleComplete(milestone._id)}
                              disabled={actionLoading}
                              title="Complete milestone"
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-50"
                            >
                              {actionLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              <span className="hidden sm:inline">Complete</span>
                            </button>
                          )}

                          {!isCompleted && (
                            <button
                              onClick={() => {
                                dispatch(clearMilestoneError());
                                setEditingMilestone(milestone);
                              }}
                              disabled={actionLoading}
                              title="Edit milestone"
                              className="p-2 text-gray-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              dispatch(clearMilestoneError());
                              setDeleteMilestoneId(milestone._id);
                            }}
                            disabled={actionLoading}
                            title="Delete milestone"
                            className="p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Delete confirmation */}
                      {isDeleting && (
                        <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-red-400">
                            Delete this milestone permanently?
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setDeleteMilestoneId(null)}
                              disabled={actionLoading}
                              className="px-3 py-2 text-xs text-gray-500 transition hover:text-white"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={() => handleDelete(milestone._id)}
                              disabled={actionLoading}
                              className="flex items-center gap-2 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                            >
                              {actionLoading && (
                                <Loader2 size={13} className="animate-spin" />
                              )}
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Milestones;
