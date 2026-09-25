import { Compass, Loader2, Users, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  fetchDiscoverableStudyRooms,
  joinExistingStudyRoom,
} from "../../features/studyRoom/studyRoomSlice";

const Explore = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const { discoverableRooms, isLoading, isJoining, error } = useSelector(
    (state) => state.studyRoom,
  );

  useEffect(() => {
    dispatch(fetchDiscoverableStudyRooms());
  }, [dispatch]);

  const handleJoin = async (roomId) => {
    const result = await dispatch(joinExistingStudyRoom(roomId));

    if (joinExistingStudyRoom.fulfilled.match(result)) {
      toast.success("Joined study room", {
        description: "The study room has been added to your Focus rooms.",
      });

      navigate(`/focus/room/${roomId}`);
      return;
    }

    toast.error("Couldn't join study room", {
      description: result.payload || "Something went wrong. Please try again.",
    });
  };

  // Filter rooms based on search query
  const filteredRooms =
    discoverableRooms?.filter((room) =>
      room.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()),
    ) || [];

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <Compass size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Explore
              </h1>

              <p className="mt-1 text-sm text-neutral-500">
                Discover study rooms and join others.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 md:w-96">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search study rooms..."
              className="h-10 w-full rounded-lg border border-neutral-800 bg-[#111111] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="animate-spin text-purple-400" size={26} />
          </div>
        ) : error ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-red-400">
                Couldn't load study rooms
              </p>
              <p className="mt-1 text-sm text-neutral-600">{error}</p>
            </div>
          </div>
        ) : discoverableRooms.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center border border-neutral-800 bg-[#111111] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
              <Compass size={25} />
            </div>
            <h2 className="mt-5 text-base font-semibold text-white">
              No study rooms to discover
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
              There aren't any study rooms available to join right now.
            </p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center border border-neutral-800 bg-[#111111] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-neutral-500">
              <Search size={25} />
            </div>
            <h2 className="mt-5 text-base font-semibold text-white">
              No results found
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
              We couldn't find any study rooms matching "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map((room) => {
              const creator = room.creator;

              return (
                <div
                  key={room._id}
                  className="border border-neutral-800 bg-[#111111] p-5 transition hover:border-purple-500/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-white">
                        {room.name}
                      </h2>

                      <div className="mt-2 flex items-center gap-2">
                        {creator?.avatar?.url ? (
                          <img
                            src={creator.avatar.url}
                            alt={creator.username}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-xs font-semibold text-purple-300">
                            {creator?.username?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-neutral-300">
                            {creator?.fullName || creator?.username || "User"}
                          </p>

                          {creator?.username && (
                            <p className="truncate text-[11px] text-neutral-600">
                              @{creator.username}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-500">
                      <Users size={14} />
                      {room.participants?.length || 0}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoin(room._id)}
                    disabled={isJoining}
                    className="mt-6 flex w-full items-center justify-center gap-2 bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isJoining && (
                      <Loader2 size={15} className="animate-spin" />
                    )}
                    {isJoining ? "Joining..." : "Join room"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
