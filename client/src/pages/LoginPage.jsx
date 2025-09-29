import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api.jsx";

function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          className="block border mb-2 p-2 w-full"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          className="block border mb-4 p-2 w-full"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
        <p className="mt-2 text-sm">
          No account?{" "}
          <a href="/signup" className="text-blue-600 underline">
            Signup
          </a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
