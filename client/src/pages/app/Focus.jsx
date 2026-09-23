import { Clock3, Flame, Play, Plus, Target, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import {
  createNewStudyRoom,
  fetchMyStudyRooms,
  removeStudyRoom,
} from "../../features/studyRoom/studyRoomSlice";

const Focus = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { rooms, isCreating, isLoading, isDeleting, error } = useSelector(
    (state) => state.studyRoom,
  );

  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomToDelete, setRoomToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchMyStudyRooms());
  }, [dispatch]);

  const handleCreateRoom = async (event) => {
    event.preventDefault();

    if (!roomName.trim()) return;

    const result = await dispatch(createNewStudyRoom(roomName.trim()));

    if (createNewStudyRoom.fulfilled.match(result)) {
      const room = result.payload?.data;

      setShowCreateRoom(false);
      setRoomName("");

      if (room?._id) {
        navigate(`/focus/room/${room._id}`);
      }
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    const roomId = roomToDelete._id;
    const roomName = roomToDelete.name;

    const result = await dispatch(removeStudyRoom(roomId));

    if (removeStudyRoom.fulfilled.match(result)) {
      toast.success(`"${roomName}" deleted successfully.`);
      setRoomToDelete(null);
      return;
    }

    toast.error(result.payload || "Failed to delete the room.");
  };

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      {/* HEADER */}
      <header className="flex flex-col gap-5 border-b border-neutral-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <Target size={19} />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Focus
            </h1>
          </div>

          <p className="mt-2 text-sm text-neutral-500">
            Protect your attention and get meaningful work done.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateRoom(true)}
          className="flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
        >
          <Plus size={16} />
          Create focus room
        </button>
      </header>

      {/* STATS */}
      <section className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Clock3 size={15} />
            Focus today
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">0m</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Flame size={15} />
            Current streak
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">0 days</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Target size={15} />
            Sessions
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">0</p>
        </div>
      </section>

      {/* EXISTING ROOMS */}
      {rooms?.length > 0 && (
        <section className="mb-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Your Focus Rooms
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Continue working in a room you already created or joined.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="rounded-2xl border border-neutral-800 bg-[#111111] p-5 transition hover:border-neutral-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-white">
                      {room.name}
                    </h3>

                    <p className="mt-2 text-sm text-neutral-500">
                      {room.participants?.length || 0}{" "}
                      {room.participants?.length === 1
                        ? "participant"
                        : "participants"}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900">
                    <Users size={18} className="text-neutral-300" />
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/focus/room/${room._id}`)}
                    className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
                  >
                    Open room
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setRoomToDelete(room)}
                    className="rounded-full border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LOADING ROOMS */}
      {isLoading && (
        <div className="mb-5 rounded-2xl border border-neutral-800 bg-[#111111] p-5 text-sm text-neutral-500">
          Loading your focus rooms...
        </div>
      )}

      {/* NO ROOMS */}
      {!isLoading && rooms?.length === 0 && (
        <div className="mb-5 rounded-2xl border border-dashed border-neutral-800 bg-[#111111] p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900">
            <Target size={18} className="text-neutral-400" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-white">
            No focus rooms yet
          </h2>

          <p className="mt-1 max-w-md text-sm leading-6 text-neutral-500">
            Create your first focus room and you can return to it whenever you
            want.
          </p>
        </div>
      )}

      {/* MAIN FOCUS CARDS */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900">
            <Play size={21} className="ml-0.5 text-white" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            Start a focus session
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
            Start working without distractions and keep track of the time you
            actually spend in deep work.
          </p>

          <button
            type="button"
            onClick={() => setShowCreateRoom(true)}
            className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            Start focusing
          </button>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900">
            <Users size={21} className="text-white" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            Focus with others
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
            Create a shared focus room and work alongside other people with a
            synchronized session.
          </p>

          <button
            type="button"
            onClick={() => setShowCreateRoom(true)}
            className="mt-5 rounded-full border border-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            Create room
          </button>
        </div>
      </section>

      {/* CREATE ROOM MODAL */}
      {showCreateRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCreateRoom(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#111111] p-5 shadow-2xl">
            <h2 className="text-base font-semibold text-white">
              Create focus room
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Give your focus room a name.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="mt-5">
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="e.g. Deep Work — MERN Project"
                maxLength={100}
                autoFocus
                className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600"
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(false)}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!roomName.trim() || isCreating}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isCreating ? "Creating..." : "Create room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {roomToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRoomToDelete(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#111111] p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
              <Target size={20} className="text-red-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              Delete focus room?
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Are you sure you want to delete{" "}
              <span className="font-medium text-neutral-300">
                "{roomToDelete.name}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRoomToDelete(null)}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Focus;
