import { ArrowLeft, Clock3, Loader2, Pause, Play, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../services/socket/socket";

import {
  fetchCurrentStudySession,
  fetchStudyRoom,
  leaveExistingStudyRoom,
  pauseExistingStudySession,
  resumeExistingStudySession,
  startExistingStudySession,
  stopExistingStudySession,
  fetchParticipantStudySessions,
  updateParticipantSession,
} from "../../features/studyRoom/studyRoomSlice";

const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds));

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const getParticipantElapsedSeconds = (participantSession) => {
  if (!participantSession) {
    return 0;
  }

  let seconds = participantSession.accumulatedSeconds || 0;

  if (participantSession.status === "active" && participantSession.resumedAt) {
    seconds += Math.floor(
      (Date.now() - new Date(participantSession.resumedAt).getTime()) / 1000,
    );
  }

  return Math.max(0, seconds);
};

const FocusRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const {
    room,
    session,
    isLoading,
    isLeaving,
    isSessionLoading,
    participantSessions,
    error,
  } = useSelector((state) => state.studyRoom);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerTick, setTimerTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadRoom = useCallback(async () => {
    await Promise.all([
      dispatch(fetchStudyRoom(roomId)),
      dispatch(fetchCurrentStudySession(roomId)),
      dispatch(fetchParticipantStudySessions(roomId)),
    ]);
  }, [dispatch, roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const joinStudyRoomSocket = () => {
      socket.emit("study-room:join", { roomId });
    };

   const handleSessionUpdate = ({ userId, session }) => {
     dispatch(
       updateParticipantSession({
         userId,
         session,
       }),
     );
   };

    socket.on("connect", joinStudyRoomSocket);
    socket.on("study-session:updated", handleSessionUpdate);

    if (socket.connected) {
      joinStudyRoomSocket();
    }

    return () => {
      socket.off("connect", joinStudyRoomSocket);
      socket.off("study-session:updated", handleSessionUpdate);

      if (socket.connected) {
        socket.emit("study-room:leave", { roomId });
      }
    };
  }, [roomId]);

  useEffect(() => {
    const calculateElapsed = () => {
      if (!session) {
        setElapsedSeconds(0);
        return;
      }

      let seconds = session.accumulatedSeconds || 0;

      if (session.status === "active" && session.resumedAt) {
        seconds += Math.floor(
          (Date.now() - new Date(session.resumedAt).getTime()) / 1000,
        );
      }

      setElapsedSeconds(Math.max(0, seconds));
    };

    calculateElapsed();

    if (session?.status !== "active") return undefined;

    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleStart = async () => {
    await dispatch(startExistingStudySession(roomId));
  };

  const handlePause = async () => {
    await dispatch(pauseExistingStudySession(roomId));
  };

  const handleResume = async () => {
    await dispatch(resumeExistingStudySession(roomId));
  };

  const handleStop = async () => {
    await dispatch(stopExistingStudySession(roomId));
  };

  const handleLeave = async () => {
    if (room?.creator?._id === user?._id) {
      navigate("/focus");
      return;
    }

    const result = await dispatch(leaveExistingStudyRoom(roomId));

    if (leaveExistingStudyRoom.fulfilled.match(result)) {
      navigate("/focus");
    }
  };

  const participantCount = room?.participants?.length || 0;

  const participantNames = useMemo(
    () =>
      room?.participants?.map(
        (participant) => participant.fullName || participant.username || "User",
      ) || [],
    [room?.participants],
  );

  if (isLoading && !room) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-neutral-500" size={25} />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[600px] flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900">
          <Clock3 size={21} className="text-neutral-500" />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-white">
          Focus room not found
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          {error || "This room may no longer be available."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/focus")}
          className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          Back to Focus
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <button
          type="button"
          onClick={() => navigate("/focus")}
          className="flex items-center gap-2 text-sm text-neutral-500 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Focus
        </button>

        <button
          type="button"
          onClick={handleLeave}
          disabled={isLeaving}
          className="rounded-full border border-neutral-800 px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
        >
          {isLeaving ? "Leaving..." : "Leave room"}
        </button>
      </header>

      <section className="mt-6">
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-600">
                Study room
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Everyone studying together
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Users size={14} />
              {participantCount}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {participantSessions.map(({ user: participant, session }) => {
              const participantSeconds = getParticipantElapsedSeconds(session);
              const isCurrentUser = participant?._id === user?._id;
              const isActive = session?.status === "active";
              const isPaused = session?.status === "paused";

              return (
                <div
                  key={participant._id}
                  className={`flex items-center justify-between border px-3 py-3 transition ${
                    isCurrentUser
                      ? "border-purple-500/30 bg-purple-500/[0.06]"
                      : "border-neutral-800 bg-[#0a0a0a]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-800">
                      {participant?.avatar?.url ? (
                        <img
                          src={participant.avatar.url}
                          alt={participant.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                          {participant?.username?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-neutral-200">
                          {participant.fullName || participant.username}
                        </p>

                        {isCurrentUser && (
                          <span className="text-[10px] uppercase tracking-wider text-purple-400">
                            You
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-xs text-neutral-600">
                        {isActive
                          ? "Studying"
                          : isPaused
                            ? "Paused"
                            : "Not studying"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 flex shrink-0 items-center gap-3">
                    {isCurrentUser && (
                      <div className="flex items-center gap-2">
                        {!session && (
                          <button
                            type="button"
                            onClick={handleStart}
                            disabled={isSessionLoading}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
                          >
                            {isSessionLoading ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Play size={13} />
                            )}
                            Start
                          </button>
                        )}

                        {isActive && (
                          <>
                            <button
                              type="button"
                              onClick={handlePause}
                              disabled={isSessionLoading}
                              className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-700 px-3 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
                            >
                              <Pause size={13} />
                              Pause
                            </button>

                            <button
                              type="button"
                              onClick={handleStop}
                              disabled={isSessionLoading}
                              className="h-8 rounded-lg border border-neutral-800 px-3 text-xs font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
                            >
                              Finish
                            </button>
                          </>
                        )}

                        {isPaused && (
                          <>
                            <button
                              type="button"
                              onClick={handleResume}
                              disabled={isSessionLoading}
                              className="flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
                            >
                              <Play size={13} />
                              Resume
                            </button>

                            <button
                              type="button"
                              onClick={handleStop}
                              disabled={isSessionLoading}
                              className="h-8 rounded-lg border border-neutral-800 px-3 text-xs font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
                            >
                              Finish
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <p className="font-mono text-sm font-semibold tabular-nums text-white">
                      {formatTime(participantSeconds)}
                    </p>

                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive
                          ? "bg-emerald-400"
                          : isPaused
                            ? "bg-amber-400"
                            : "bg-neutral-700"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Users size={15} />
            Participants
          </div>

          <div className="mt-4 space-y-3">
            {room.participants?.map((participant) => (
              <div
                key={participant._id}
                className="flex items-center justify-between rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-800">
                    {participant?.avatar?.url ? (
                      <img
                        src={participant.avatar.url}
                        alt={participant.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                        {participant?.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-neutral-200">
                      {participant.fullName || participant.username}
                    </p>

                    <p className="text-xs text-neutral-600">
                      @{participant.username}
                    </p>
                  </div>
                </div>

                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FocusRoom;
