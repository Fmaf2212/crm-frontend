import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Lock } from "lucide-react";
import { UserService } from "@/services/userService";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMsg("");

    if (!usuario.trim() || !contrasena.trim()) {
      setErrorMsg("Debes ingresar usuario y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const response = await UserService.login({
        userName: usuario,
        password: contrasena,
      });

      if (!response?.data) {
        setErrorMsg("Credenciales incorrectas.");
        return;
      }

      localStorage.setItem("sn_user", JSON.stringify(response.data));
      localStorage.setItem("sn_isLogged", "true");

      setLoginSuccess(true);

      setTimeout(() => {
        navigate("/lead/crear");
      }, 800);

    } catch (error) {
      setErrorMsg("Ocurrió un error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00583A] px-4">
      <div className="border border-gray-200 bg-[#F7F9FA] w-full max-w-md p-10 shadow-xl rounded-xl relative">
        <div className="w-full flex justify-center mb-6">
          <img
            src="/assets/logo-sn-login.png"
            alt="Santa Natura"
            className="w-52 object-contain"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Usuario</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                className="pl-10"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-red-600 text-sm text-center">
              {errorMsg}
            </p>
          )}

          <Button
            className={`w-full text-white transition-all ${loginSuccess
                ? "bg-green-600 hover:bg-green-600"
                : "bg-[#006A4E] hover:bg-[#005C43]"
              }`}
            onClick={handleLogin}
            disabled={loading || loginSuccess}
          >
            {loginSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Inicio exitoso
              </span>
            ) : loading ? (
              "Validando..."
            ) : (
              "Ingresar"
            )}
          </Button>

          <div className="text-center">
            <a href="#" className="text-sm text-purple-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
