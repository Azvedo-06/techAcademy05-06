import { useState } from "react";
import api from "../services/api";

interface Category {
  id: number;
  name: string;
  description: string;
}

interface AddCategoryFormProps {
  onCategoryAdded: () => void;
  category?: Category;
  mode?: "create" | "edit";
  onCancel?: () => void;
}

const AddCategoryForm = ({
  onCategoryAdded,
  category,
  mode = "create",
  onCancel,
}: AddCategoryFormProps) => {
  const [name, setName] = useState(category?.name || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "edit" && category) {
        await api.put(`/categorys/${category.id}`, { name });
      } else {
        await api.post("/categorys", { name });
      }

      // Limpar formulário
      setName("");

      // Atualizar lista de categorias
      onCategoryAdded();

      if (mode === "edit" && onCancel) {
        onCancel();
      }
    } catch (err: any) {
      console.error("Erro:", err.response?.data || err);
      setError(err.response?.data?.error || "Erro ao adicionar categoria");
    }
  };

  return (
    <div className="review-form-container">
      <h2 className="review-form-title">
        {mode === "edit" ? "Editar Categoria" : "Adicionar Nova Categoria"}
      </h2>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="select-book"
            placeholder="Ex: Ficção Científica"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="button-group">
          <button type="submit" className="submit-review">
            {mode === "edit" ? "Atualizar" : "Adicionar"} Categoria
          </button>
          {mode === "edit" && (
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddCategoryForm;
