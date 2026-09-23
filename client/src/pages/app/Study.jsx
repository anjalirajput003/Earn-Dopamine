import { BarChart3, Clock3, Loader2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchMyStudyRooms,
  fetchStudyStatistics,
} from "../../features/studyRoom/studyRoomSlice";

const formatStudyTime = (seconds = 0) => {
  const totalMinutes = Math.floor(seconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  return `${Math.floor(totalMinutes / 60)}h`;
};

const Study = () => {
  const dispatch = useDispatch();

  const { rooms, statistics, isLoading, error } = useSelector(
    (state) => state.studyRoom,
  );

  const [selectedRoomId, setSelectedRoomId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyStudyRooms());
  }, [dispatch]);

  useEffect(() => {
    if (!rooms?.length) {
      setSelectedRoomId(null);
      return;
    }

    const selectedRoomStillExists = rooms.some(
      (room) => room._id === selectedRoomId,
    );

    if (!selectedRoomStillExists) {
      setSelectedRoomId(rooms[0]._id);
    }
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    if (selectedRoomId) {
      dispatch(fetchStudyStatistics(selectedRoomId));
    }
  }, [dispatch, selectedRoomId]);

  const selectedRoom = useMemo(
    () => rooms?.find((room) => room._id === selectedRoomId),
    [rooms, selectedRoomId],
  );

  if (isLoading && !rooms?.length) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-neutral-500" size={25} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      {/* Header */}
      <header className="border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <BarChart3 size={19} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Study
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Track your study time and progress.
            </p>
          </div>
        </div>
      </header>

      {/* No joined rooms */}
      {!rooms?.length ? (
        <div className="mt-6 rounded-2xl border border-neutral-800 bg-[#111111] p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900">
            <Users size={21} className="text-neutral-500" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-white">
            No study rooms yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Join a Focus Room to start tracking your study time.
          </p>
        </div>
      ) : (
        <>
          {/* Room selector */}
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-600">
              <Users size={14} />
              Your focus rooms
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {rooms.map((room) => {
                const isSelected = room._id === selectedRoomId;

                return (
                  <button
                    key={room._id}
                    type="button"
                    onClick={() => setSelectedRoomId(room._id)}
                    className={`shrink-0 border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-purple-500/40 bg-purple-500/[0.08]"
                        : "border-neutral-800 bg-[#111111] hover:border-neutral-700 hover:bg-[#151515]"
                    }`}
                  >
                    <p
                      className={`max-w-[220px] truncate text-sm font-medium ${
                        isSelected ? "text-white" : "text-neutral-300"
                      }`}
                    >
                      {room.name}
                    </p>

                    <p className="mt-1 text-xs text-neutral-600">
                      {room.participants?.length || 0}{" "}
                      {room.participants?.length === 1
                        ? "participant"
                        : "participants"}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Selected room */}
          <section className="mt-6">
            <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-600">
                    Study statistics
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    {selectedRoom?.name || "Focus Room"}
                  </h2>

                  <p className="mt-1 text-xs text-neutral-600">
                    Your study time in this room
                  </p>
                </div>

                <Clock3 size={18} className="text-neutral-600" />
              </div>

              {error ? (
                <div className="mt-5 border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="border border-neutral-800 bg-[#0a0a0a] p-4">
                    <p className="text-xs text-neutral-600">Today</p>

                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatStudyTime(statistics?.today?.seconds)}
                    </p>

                    <p className="mt-1 text-xs text-neutral-700">
                      Total study time
                    </p>
                  </div>

                  <div className="border border-neutral-800 bg-[#0a0a0a] p-4">
                    <p className="text-xs text-neutral-600">This week</p>

                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatStudyTime(statistics?.thisWeek?.seconds)}
                    </p>

                    <p className="mt-1 text-xs text-neutral-700">
                      Total study time
                    </p>
                  </div>

                  <div className="border border-neutral-800 bg-[#0a0a0a] p-4">
                    <p className="text-xs text-neutral-600">This month</p>

                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatStudyTime(statistics?.thisMonth?.seconds)}
                    </p>

                    <p className="mt-1 text-xs text-neutral-700">
                      Total study time
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Study;
