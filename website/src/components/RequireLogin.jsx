import { LogIn } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import Button from "./Button.jsx";

export default function RequireLogin({ children }) {
  const { firebaseUser, loading, login } = useAuthStore();
  if (loading) return <div className="glass rounded-lg p-8 text-white/70">Loading secure Discord session...</div>;
  if (!firebaseUser) {
    return (
      <div className="glass mx-auto max-w-xl rounded-lg p-8 text-center">
        <div className="text-2xl font-black">Discord login required</div>
        <p className="mt-3 text-white/62">Sign in to unlock your Aron dashboard, verification status, cards, wishlist, and guild data.</p>
        <Button onClick={login} icon={LogIn} className="mt-6">Login with Discord</Button>
      </div>
    );
  }
  return children;
}
