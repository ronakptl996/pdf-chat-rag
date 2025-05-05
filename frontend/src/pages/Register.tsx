import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate, NavLink } from "react-router";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      const result = await response.json();
      if (result.success) {
        localStorage.setItem("token", result.token);
        toast.success(result.message);
        navigate("/");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#F5F5F7]">
      <div className="w-[500px] p-10 rounded-2xl shadow-2xl bg-white">
        <form onSubmit={handleSubmit}>
          <div className="space-y-12">
            <div className="mb-5">
              <h2 className="font-semibold text-gray-900 text-3xl mb-1">
                Register
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
                <div className="col-span-full">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Email
                  </label>
                  <input
                    placeholder="Enter your email"
                    name="email"
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="password"
                    className="block text-sm/6 font-medium text-gray-900 mb-1"
                  >
                    Password
                  </label>
                  <input
                    placeholder="Enter your password"
                    name="password"
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mb-0">
              <button
                type="submit"
                className="cursor-pointer rounded-md bg-amber-400 px-3 py-2 text-sm text-black shadow-xs hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                Register
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <NavLink to="/login" className="text-amber-400">
                Login
              </NavLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
