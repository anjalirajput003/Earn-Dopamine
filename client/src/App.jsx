// import useAuthInitialize from "./hooks/useAuthInitialize";

// function App() {
//   useAuthInitialize();

//   return (
//     <div className="min-h-screen">
//       <h1 className="p-8 text-3xl font-bold">Earn Dopamine</h1>
//     </div>
//   );
// }

// export default App;










import { useDispatch, useSelector } from "react-redux";
import { logout } from "./features/auth/authSlice";

function App() {

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Earn Dopamine</h1>

        <p className="mt-2 text-neutral-500">Welcome, {user?.username}</p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Log out
        </button>
      </div>
    </main>
  );
}

export default App;
