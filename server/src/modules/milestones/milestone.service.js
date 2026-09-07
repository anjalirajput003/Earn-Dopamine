import Milestone from "./milestone.model.js";
import Goal from "../goals/goal.model.js";
import ApiError from "../../utils/ApiError.js";
import mongoose from "mongoose";

const createMilestone = async ({
  userId,
  goalId,
  title,
  description,
  order,
}) => {
  const session = await mongoose.startSession();

  try {
    let createdMilestone;

    await session.withTransaction(async () => {
      const goal = await Goal.findOne({
        _id: goalId,
        user: userId,
      }).session(session);

      if (!goal) {
        throw new ApiError(404, "Goal not found.");
      }

      const [milestone] = await Milestone.create(
        [
          {
            user: userId,
            goal: goalId,
            title,
            description,
            order,
          },
        ],
        { session },
      );

      const totalMilestones = await Milestone.countDocuments({
        goal: goalId,
        user: userId,
      }).session(session);

      const completedMilestones = await Milestone.countDocuments({
        goal: goalId,
        user: userId,
        status: "completed",
      }).session(session);

      const progressPercentage =
        totalMilestones === 0
          ? 0
          : Math.round((completedMilestones / totalMilestones) * 100);

      goal.progressPercentage = progressPercentage;

      if (progressPercentage < 100) {
        goal.status = "active";
        goal.completedAt = null;
      }

      await goal.save({ session });

      createdMilestone = milestone;
    });

    return createdMilestone;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const getMilestones = async ({ userId, goalId }) => {
  const goal = await Goal.exists({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw new ApiError(404, "Goal not found.");
  }

  const milestones = await Milestone.find({
    goal: goalId,
    user: userId,
  })
    .sort({
      order: 1,
    })
    .lean();

  return milestones;
};

const updateMilestone = async ({
  userId,
  milestoneId,
  title,
  description,
  order,
}) => {
  const milestone = await Milestone.findOne({
    _id: milestoneId,
    user: userId,
  });

  if (!milestone) {
    throw new ApiError(404, "Milestone not found.");
  }

  if (title !== undefined) {
    milestone.title = title;
  }

  if (description !== undefined) {
    milestone.description = description;
  }

  if (order !== undefined) {
    milestone.order = order;
  }

  await milestone.save();

  return milestone;
};

 const completeMilestone = async ({ userId, milestoneId }) => {
   const session = await mongoose.startSession();

   try {
     let completedMilestone;

     await session.withTransaction(async () => {
       const milestone = await Milestone.findOne({
         _id: milestoneId,
         user: userId,
       }).session(session);

       if (!milestone) {
         throw new ApiError(404, "Milestone not found.");
       }

       if (milestone.status === "completed") {
         throw new ApiError(400, "Milestone is already completed.");
       }

       milestone.status = "completed";
       milestone.completedAt = new Date();

       await milestone.save({ session });

       const totalMilestones = await Milestone.countDocuments({
         goal: milestone.goal,
         user: userId,
       }).session(session);

       const completedMilestones = await Milestone.countDocuments({
         goal: milestone.goal,
         user: userId,
         status: "completed",
       }).session(session);

       const progressPercentage =
         totalMilestones === 0
           ? 0
           : Math.round((completedMilestones / totalMilestones) * 100);

       const goal = await Goal.findOne({
         _id: milestone.goal,
         user: userId,
       }).session(session);

       if (!goal) {
         throw new ApiError(404, "Goal not found.");
       }

       goal.progressPercentage = progressPercentage;

       if (progressPercentage === 100) {
         goal.status = "completed";
         goal.completedAt = new Date();
       }

       await goal.save({ session });

       completedMilestone = milestone;
     });

     return completedMilestone;
   } catch (error) {
     if (error instanceof ApiError) {
       throw error;
     }

     throw error;
   } finally {
     await session.endSession();
   }
 };

const deleteMilestone = async ({ userId, milestoneId }) => {
  const session = await mongoose.startSession();

  try {
    let deletedMilestone;

    await session.withTransaction(async () => {
      const milestone = await Milestone.findOne({
        _id: milestoneId,
        user: userId,
      }).session(session);

      if (!milestone) {
        throw new ApiError(404, "Milestone not found.");
      }

      const goalId = milestone.goal;

      await Milestone.deleteOne({
        _id: milestoneId,
        user: userId,
      }).session(session);

      const totalMilestones = await Milestone.countDocuments({
        goal: goalId,
        user: userId,
      }).session(session);

      const completedMilestones = await Milestone.countDocuments({
        goal: goalId,
        user: userId,
        status: "completed",
      }).session(session);

      const progressPercentage =
        totalMilestones === 0
          ? 0
          : Math.round((completedMilestones / totalMilestones) * 100);

      const goal = await Goal.findOne({
        _id: goalId,
        user: userId,
      }).session(session);

      if (!goal) {
        throw new ApiError(404, "Goal not found.");
      }

      goal.progressPercentage = progressPercentage;

      if (progressPercentage < 100) {
        goal.status = "active";
        goal.completedAt = null;
      }

      await goal.save({ session });

      deletedMilestone = milestone;
    });

    return deletedMilestone;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export {
  createMilestone,
  getMilestones,
  updateMilestone,
  completeMilestone,
  deleteMilestone,
};
