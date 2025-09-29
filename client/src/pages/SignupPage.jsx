import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api.jsx";

function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/signup", form);
      alert("Signup successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        <input
          className="block border mb-2 p-2 w-full"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          className="block border mb-2 p-2 w-full"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <select
          name="role"
          className="block border mb-4 p-2 w-full"
          onChange={handleChange}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Signup
        </button>
        <p className="mt-2 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
